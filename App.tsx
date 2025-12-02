
import React, { useState, useEffect } from 'react';
import Home, { TripPlan } from './components/Home';
import Planner from './components/Planner';
import { generateId, INITIAL_ITINERARY } from './constants';
import { DayItinerary } from './types';

const App: React.FC = () => {
  const [plans, setPlans] = useState<TripPlan[]>(() => {
    const saved = localStorage.getItem('tabilog_plans');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // --- MIGRATION & INITIALIZATION LOGIC ---
  useEffect(() => {
    const hasInitialized = localStorage.getItem('tabilog_initialized');

    // 1. If plans exist, ensure the initialized flag is set and stop.
    if (plans.length > 0) {
      if (!hasInitialized) localStorage.setItem('tabilog_initialized', 'true');
      return;
    }

    // 2. If plans are empty BUT we have initialized before, it means the user manually deleted all plans.
    // In this case, we DO NOT auto-create a default plan. Let them see the empty Home screen.
    if (hasInitialized) return;

    // 3. If not initialized (First Run), check for legacy data or create default demo.
    const legacyItinerary = localStorage.getItem('tabilog_itinerary');
    
    if (legacyItinerary) {
      // Case A: Migrate Old Data (Legacy User)
      const legacyExpenses = localStorage.getItem('tabilog_expenses');
      const legacyTitle = localStorage.getItem('tabilog_title') || '我的旅行';
      
      const newId = generateId();
      let itineraryObj;
      try {
        itineraryObj = JSON.parse(legacyItinerary);
      } catch (e) {
        itineraryObj = [];
      }
      const startDate = itineraryObj[0]?.date || new Date().toISOString().split('T')[0];

      const newPlan: TripPlan = {
        id: newId,
        title: legacyTitle,
        subtitle: 'Planning Mode',
        startDate: startDate,
        createdAt: Date.now()
      };
      
      localStorage.setItem(`tabilog_itinerary_${newId}`, legacyItinerary);
      if (legacyExpenses) localStorage.setItem(`tabilog_expenses_${newId}`, legacyExpenses);
      
      localStorage.setItem('tabilog_initialized', 'true');
      setPlans([newPlan]);
    } else {
      // Case B: Fresh Start (New User) -> Insert Default Demo Trip
      const newId = generateId();
      const demoTitle = '2026 長野草津合掌村旅遊';
      const startDate = INITIAL_ITINERARY[0]?.date || '2026-02-03';

      const newPlan: TripPlan = {
        id: newId,
        title: demoTitle,
        subtitle: 'Trip to Japan',
        startDate: startDate,
        createdAt: Date.now()
      };

      localStorage.setItem(`tabilog_itinerary_${newId}`, JSON.stringify(INITIAL_ITINERARY));
      localStorage.setItem(`tabilog_expenses_${newId}`, JSON.stringify([]));

      localStorage.setItem('tabilog_initialized', 'true');
      setPlans([newPlan]);
    }
  }, [plans.length]);

  // Persist Plans Metadata
  useEffect(() => {
    localStorage.setItem('tabilog_plans', JSON.stringify(plans));
  }, [plans]);

  // Helpers for initializing new empty days
  const getWeekDay = (date: Date) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[date.getDay()];
  };

  const formatInitialDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return `${date.getMonth() + 1}/${date.getDate()} (${getWeekDay(date)})`;
  };

  const handleCreatePlan = (title: string, startDate: string) => {
    const newId = generateId();
    
    const newPlan: TripPlan = {
      id: newId,
      title: title,
      subtitle: 'Planning Mode',
      startDate: startDate,
      createdAt: Date.now()
    };
    
    // Initialize with a SINGLE EMPTY DAY based on the selected start date
    // Instead of the full Japan demo itinerary
    const firstDay: DayItinerary = {
      id: generateId(),
      date: startDate,
      displayDate: formatInitialDate(startDate),
      location: 'New Location',
      activities: []
    };
    
    localStorage.setItem(`tabilog_itinerary_${newId}`, JSON.stringify([firstDay]));
    localStorage.setItem(`tabilog_expenses_${newId}`, JSON.stringify([]));

    setPlans([...plans, newPlan]);
    setActivePlanId(newId);
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
    
    // Cleanup data
    localStorage.removeItem(`tabilog_itinerary_${id}`);
    localStorage.removeItem(`tabilog_expenses_${id}`);
    
    if (activePlanId === id) {
      setActivePlanId(null);
    }
  };

  const handleUpdatePlanDetails = (id: string, newTitle: string, newSubtitle: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, title: newTitle, subtitle: newSubtitle } : p));
  };

  if (activePlanId) {
    const activePlan = plans.find(p => p.id === activePlanId);
    if (!activePlan) {
      setActivePlanId(null);
      return null;
    }

    return (
      <Planner 
        key={activePlanId} // Force re-render when switching plans
        planId={activePlanId}
        defaultTitle={activePlan.title}
        defaultSubtitle={activePlan.subtitle}
        onUpdatePlanDetails={handleUpdatePlanDetails}
        onBackToHome={() => setActivePlanId(null)}
      />
    );
  }

  return (
    <Home 
      plans={plans} 
      onCreatePlan={handleCreatePlan}
      onSelectPlan={setActivePlanId}
      onDeletePlan={handleDeletePlan}
    />
  );
};

export default App;
