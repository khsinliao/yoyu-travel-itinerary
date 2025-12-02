
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Timeline from './Timeline';
import ExpenseTracker from './ExpenseTracker';
import ConfirmModal from './ConfirmModal';
import { INITIAL_ITINERARY, generateId } from '../constants';
import { DayItinerary, Expense } from '../types';
import { Menu } from 'lucide-react';
import { fetchWeatherForDay, fetchActivityWeather, getDaysDiff } from '../services/weather';
import { exportToCSV } from '../utils/exporter';

interface PlannerProps {
  planId: string;
  defaultTitle: string;
  defaultSubtitle?: string;
  onUpdatePlanDetails: (id: string, newTitle: string, newSubtitle: string) => void;
  onBackToHome: () => void;
}

const Planner: React.FC<PlannerProps> = ({ planId, defaultTitle, defaultSubtitle, onUpdatePlanDetails, onBackToHome }) => {
  // Storage Keys based on Plan ID
  const ITINERARY_KEY = `tabilog_itinerary_${planId}`;
  const EXPENSES_KEY = `tabilog_expenses_${planId}`;

  // Initialize state from localStorage
  const [itinerary, setItinerary] = useState<DayItinerary[]>(() => {
    const saved = localStorage.getItem(ITINERARY_KEY);
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(INITIAL_ITINERARY)); // Deep copy to prevent ref issues
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(EXPENSES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [appTitle, setAppTitle] = useState(defaultTitle);
  const [appSubtitle, setAppSubtitle] = useState(defaultSubtitle || 'Planning Mode');
  const [selectedDayId, setSelectedDayId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'itinerary' | 'expenses'>('itinerary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  
  // Initialize Selected Day
  useEffect(() => {
    if (!selectedDayId && itinerary.length > 0) {
      setSelectedDayId(itinerary[0].id);
    }
  }, [itinerary, selectedDayId]);

  // Sync title changes back to parent
  useEffect(() => {
    onUpdatePlanDetails(planId, appTitle, appSubtitle);
  }, [appTitle, appSubtitle, planId, onUpdatePlanDetails]);

  // Use a ref to access current itinerary in async callbacks
  const itineraryRef = useRef(itinerary);
  useEffect(() => {
    itineraryRef.current = itinerary;
  }, [itinerary]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(ITINERARY_KEY, JSON.stringify(itinerary));
  }, [itinerary, ITINERARY_KEY]);

  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses, EXPENSES_KEY]);

  // --- Weather Helpers ---
  const updateWeatherForList = async (listToUpdate: DayItinerary[]) => {
    setIsWeatherLoading(true);
    try {
      const updatedItinerary = await Promise.all(listToUpdate.map(async (day) => {
        let dayWeather = day.weatherInfo;
        if (day.location && day.location !== 'New Location') {
           const w = await fetchWeatherForDay(day.location, day.date);
           if (w) dayWeather = w;
        }

        const updatedActivities = await Promise.all(day.activities.map(async (act) => {
          if (act.location) {
            const actWeather = await fetchActivityWeather(act.location, day.date, act.time);
            if (actWeather) return { ...act, weatherInfo: actWeather };
          }
          return act;
        }));
        
        if (!dayWeather) {
            const first = updatedActivities.find(a => a.weatherInfo);
            if (first) dayWeather = first.weatherInfo;
        }

        return { ...day, weatherInfo: dayWeather, activities: updatedActivities };
      }));
      
      setItinerary(updatedItinerary);
    } catch (e) {
      console.error("Failed to refresh weather", e);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // Initialization Check for Weather
  useEffect(() => {
    const needsRefresh = itineraryRef.current.some(day => {
      const diff = getDaysDiff(day.date);
      const isWithinForecastRange = diff >= -1 && diff <= 16;
      if (isWithinForecastRange && day.weatherInfo?.isReference) return true;
      return false;
    });

    if (needsRefresh) {
      updateWeatherForList(itineraryRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleUpdateDay = async (updatedDay: DayItinerary) => {
    setItinerary(prev => prev.map(day => day.id === updatedDay.id ? updatedDay : day));

    try {
      let hasChanges = false;
      let newWeatherInfo = updatedDay.weatherInfo;
      let newActivities = [...updatedDay.activities];

      const oldDay = itineraryRef.current.find(d => d.id === updatedDay.id);
      const dayLocationChanged = !oldDay || oldDay.location !== updatedDay.location || oldDay.date !== updatedDay.date;
      
      if ((!newWeatherInfo || dayLocationChanged) && updatedDay.location && updatedDay.location !== 'New Location') {
         const info = await fetchWeatherForDay(updatedDay.location, updatedDay.date);
         if (info) {
           newWeatherInfo = info;
           hasChanges = true;
         }
      }
      
      if (!newWeatherInfo) {
          const firstValidActivity = updatedDay.activities.find(a => a.weatherInfo);
          if (firstValidActivity && firstValidActivity.weatherInfo) {
              newWeatherInfo = firstValidActivity.weatherInfo;
              hasChanges = true;
          }
      }

      const activityPromises = newActivities.map(async (activity) => {
        const oldActivity = oldDay?.activities.find(a => a.id === activity.id);
        const shouldFetch = activity.location && (
            !oldActivity || 
            oldActivity.location !== activity.location || 
            oldActivity.time !== activity.time ||
            !activity.weatherInfo
        );

        if (shouldFetch) {
          const weather = await fetchActivityWeather(activity.location!, updatedDay.date, activity.time);
          if (weather) return { ...activity, weatherInfo: weather };
        }
        return activity;
      });

      const processedActivities = await Promise.all(activityPromises);
      const activitiesChanged = JSON.stringify(processedActivities) !== JSON.stringify(updatedDay.activities);

      if (hasChanges || activitiesChanged) {
        setItinerary(prev => prev.map(day => 
          day.id === updatedDay.id 
            ? { ...updatedDay, weatherInfo: newWeatherInfo, activities: processedActivities } 
            : day
        ));
      }

    } catch (e) {
      console.error("Auto-weather update failed", e);
    }
  };

  const handleUpdateExpenses = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
  };

  const handleRefreshWeather = () => {
    updateWeatherForList(itineraryRef.current);
  };

  const handleExport = () => {
    exportToCSV(appTitle, itinerary, expenses);
  };

  // --- Date & Day Management ---

  const getWeekDay = (date: Date) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[date.getDay()];
  };

  const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return `${date.getMonth() + 1}/${date.getDate()} (${getWeekDay(date)})`;
  };

  const handleUpdateStartDate = (newStartDate: string) => {
    if (!newStartDate) return;
    const [startY, startM, startD] = newStartDate.split('-').map(Number);
    const start = new Date(startY, startM - 1, startD);
    
    const newItinerary = itinerary.map((day, index) => {
      const currentDayDate = new Date(start);
      currentDayDate.setDate(start.getDate() + index);
      const year = currentDayDate.getFullYear();
      const month = String(currentDayDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDayDate.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${d}`;
      
      return {
        ...day,
        date: isoDate,
        displayDate: formatDateDisplay(isoDate),
        weatherInfo: undefined,
        activities: day.activities.map(act => ({ ...act, weatherInfo: undefined }))
      };
    });
    
    setItinerary(newItinerary);
    updateWeatherForList(newItinerary);
  };

  const handleAddDay = () => {
    const lastDay = itinerary[itinerary.length - 1];
    let newDateStr = new Date().toISOString().split('T')[0];
    
    if (lastDay) {
      const [y, m, d] = lastDay.date.split('-').map(Number);
      const nextDate = new Date(y, m - 1, d + 1);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      newDateStr = `${year}-${month}-${day}`;
    }

    const newDay: DayItinerary = {
      id: generateId(),
      date: newDateStr,
      displayDate: formatDateDisplay(newDateStr),
      location: 'New Location',
      activities: []
    };

    setItinerary([...itinerary, newDay]);
    setSelectedDayId(newDay.id);
  };

  const handleDeleteDayRequest = (dayId: string) => {
    if (itinerary.length <= 1) {
      alert("至少需要保留一天的行程。");
      return;
    }
    setDayToDelete(dayId);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteDay = () => {
    if (!dayToDelete) return;
    const indexToDelete = itinerary.findIndex(d => d.id === dayToDelete);
    const remainingDays = itinerary.filter(d => d.id !== dayToDelete);
    
    const [startY, startM, startD] = remainingDays[0].date.split('-').map(Number);
    const startDate = new Date(startY, startM - 1, startD);
    
    const updatedItinerary = remainingDays.map((day, idx) => {
       const d = new Date(startDate);
       d.setDate(d.getDate() + idx);
       const year = d.getFullYear();
       const month = String(d.getMonth() + 1).padStart(2, '0');
       const dayStr = String(d.getDate()).padStart(2, '0');
       const dateStr = `${year}-${month}-${dayStr}`;

       return { ...day, date: dateStr, displayDate: formatDateDisplay(dateStr) };
    });

    setItinerary(updatedItinerary);
    
    if (selectedDayId === dayToDelete) {
      if (indexToDelete === 0) {
        if (updatedItinerary.length > 0) setSelectedDayId(updatedItinerary[0].id);
      } else {
        setSelectedDayId(updatedItinerary[indexToDelete - 1].id);
      }
    }
    setDayToDelete(null);
  };

  const handleReorderDays = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newItinerary = [...itinerary];
    const [movedDay] = newItinerary.splice(fromIndex, 1);
    newItinerary.splice(toIndex, 0, movedDay);

    const [startY, startM, startD] = itinerary[0].date.split('-').map(Number);
    const startDate = new Date(startY, startM - 1, startD);

    const updatedItinerary = newItinerary.map((day, idx) => {
       const d = new Date(startDate);
       d.setDate(d.getDate() + idx);
       const year = d.getFullYear();
       const month = String(d.getMonth() + 1).padStart(2, '0');
       const dayStr = String(d.getDate()).padStart(2, '0');
       const dateStr = `${year}-${month}-${dayStr}`;
       return { ...day, date: dateStr, displayDate: formatDateDisplay(dateStr) };
    });

    setItinerary(updatedItinerary);
  };

  const selectedDay = itinerary.find(d => d.id === selectedDayId) || itinerary[0];

  return (
    <div className="flex h-screen bg-travel-dark text-travel-text overflow-hidden">
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-travel-dark/80 backdrop-blur border-b border-slate-800 z-50 flex items-center px-4">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <div className="ml-3 flex flex-col justify-center">
            <span className="font-bold text-lg text-white leading-tight">{appTitle}</span>
            {appSubtitle && <span className="text-xs text-slate-400 leading-tight">{appSubtitle}</span>}
        </div>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[55] md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <Sidebar 
        days={itinerary} 
        selectedDayId={selectedDayId}
        onSelectDay={setSelectedDayId}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        appTitle={appTitle}
        setAppTitle={setAppTitle}
        appSubtitle={appSubtitle}
        setAppSubtitle={setAppSubtitle}
        onAddDay={handleAddDay}
        onDeleteDay={handleDeleteDayRequest}
        onUpdateStartDate={handleUpdateStartDate}
        onReorderDays={handleReorderDays}
        onRefreshWeather={handleRefreshWeather}
        isWeatherLoading={isWeatherLoading}
        onBackToHome={onBackToHome}
        onExport={handleExport}
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide pt-20 md:pt-0 p-4 md:p-8 relative">
         <div className="max-w-4xl mx-auto">
            {viewMode === 'itinerary' ? (
              selectedDay && <Timeline day={selectedDay} onUpdateDay={handleUpdateDay} />
            ) : (
              <ExpenseTracker expenses={expenses} onUpdateExpenses={handleUpdateExpenses} />
            )}
         </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDeleteDay}
        title="刪除確認"
        message="確定要刪除這整天的行程嗎？刪除後，後續的日期將會自動遞補。"
        confirmText="確認刪除"
      />
    </div>
  );
};

export default Planner;
