
import React, { useState, useRef, useEffect } from 'react';
import { DayItinerary } from '../types';
import { Map, Wallet, Plane, ChevronLeft, ChevronRight, Edit2, Check, Plus, Trash2, Settings, CloudLightning, GripVertical, Clock, Home, Download } from 'lucide-react';

interface SidebarProps {
  days: DayItinerary[];
  selectedDayId: string | null;
  onSelectDay: (id: string) => void;
  viewMode: 'itinerary' | 'expenses';
  setViewMode: (mode: 'itinerary' | 'expenses') => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  appTitle: string;
  setAppTitle: (title: string) => void;
  appSubtitle: string;
  setAppSubtitle: (subtitle: string) => void;
  onAddDay: () => void;
  onDeleteDay: (id: string) => void;
  onUpdateStartDate: (date: string) => void;
  onReorderDays: (fromIndex: number, toIndex: number) => void;
  onRefreshWeather: () => void;
  isWeatherLoading: boolean;
  onBackToHome: () => void;
  onExport: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  days, 
  selectedDayId, 
  onSelectDay, 
  viewMode, 
  setViewMode,
  isOpen,
  onCloseMobile,
  appTitle,
  setAppTitle,
  appSubtitle,
  setAppSubtitle,
  onAddDay,
  onDeleteDay,
  onUpdateStartDate,
  onReorderDays,
  onRefreshWeather,
  isWeatherLoading,
  onBackToHome,
  onExport
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showDateSettings, setShowDateSettings] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
  };

  const getTripStartDate = () => {
    if (days.length > 0) return days[0].date;
    return new Date().toISOString().split('T')[0];
  };

  const getCountdown = () => {
    const start = new Date(getTripStartDate());
    const today = new Date();
    // Reset hours to compare dates strictly
    start.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const countdown = getCountdown();

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); 
    if (dragOverIndex !== index) {
        setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorderDays(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-[60] bg-travel-dark border-r border-slate-800 transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 flex flex-col
      ${isCollapsed ? 'w-20' : 'w-72'}
    `}>
      {/* Toggle Button (Desktop only) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-9 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-white z-50 shadow-lg"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Header */}
      <div className={`p-6 border-b border-slate-800 flex items-center gap-3 ${isCollapsed ? 'justify-center px-2' : ''}`}>
        <button 
          onClick={onBackToHome}
          className="shrink-0 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-travel-accent transition-colors shadow-lg"
          title="Back to Home"
        >
          <Home className="w-5 h-5" />
        </button>
        
        {!isCollapsed && (
          <div className="flex-1 min-w-0 group relative">
            {isEditingTitle ? (
              <div className="flex flex-col gap-1">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  className="w-full bg-slate-900 border border-travel-accent rounded px-1 py-0.5 text-lg font-bold text-white focus:outline-none"
                  placeholder="Trip Title"
                />
                <input
                  type="text"
                  value={appSubtitle}
                  onChange={(e) => setAppSubtitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  className="w-full bg-slate-900 border border-travel-accent/50 rounded px-1 py-0.5 text-xs text-slate-300 focus:outline-none"
                  placeholder="Subtitle"
                />
                <button onClick={handleTitleSubmit} className="self-end text-green-500 hover:text-green-400 mt-1">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col relative group">
                <div className="flex items-center gap-2">
                   <h1 
                     className="text-xl font-bold tracking-tight text-white truncate cursor-pointer hover:text-travel-accent transition-colors"
                     onClick={() => setIsEditingTitle(true)}
                   >
                     {appTitle}
                   </h1>
                   <button 
                     onClick={() => setIsEditingTitle(true)}
                     className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-travel-accent transition-opacity"
                   >
                     <Edit2 className="w-3 h-3" />
                   </button>
                </div>
                <p 
                  className="text-xs text-travel-muted truncate cursor-pointer hover:text-white"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {appSubtitle || 'Planning Mode'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-hide">
        
        {/* Main Views */}
        <div className="space-y-1">
          {!isCollapsed && <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>}
          <button
            onClick={() => { setViewMode('itinerary'); onCloseMobile(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'itinerary' 
                ? 'bg-travel-card text-travel-accent' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Itinerary"
          >
            <Map className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">行程 Itinerary</span>}
          </button>
          <button
            onClick={() => { setViewMode('expenses'); onCloseMobile(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'expenses' 
                ? 'bg-travel-card text-travel-accent' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Expenses"
          >
            <Wallet className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">消費 Expenses</span>}
          </button>

           <button
            onClick={onExport}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Export to Excel"
          >
            <Download className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">匯出 Export</span>}
          </button>
        </div>

        {/* Days List (Only show if in itinerary mode) */}
        {viewMode === 'itinerary' && (
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="flex items-center gap-2 px-3 mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Days</p>
                <div className="relative">
                  <button 
                    onClick={() => setShowDateSettings(!showDateSettings)}
                    className="p-1 text-slate-500 hover:text-travel-accent rounded transition-colors"
                    title="Itinerary Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  {showDateSettings && (
                    <div className="absolute left-0 top-6 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3 z-50">
                      <p className="text-xs text-slate-400 mb-1">Set Start Date</p>
                      <input 
                        type="date" 
                        value={getTripStartDate()}
                        onChange={(e) => {
                          onUpdateStartDate(e.target.value);
                          setShowDateSettings(false);
                        }}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white mb-2"
                      />
                      <p className="text-[10px] text-slate-500 mb-3">Dates will auto-calculate.</p>
                      
                      <div className="border-t border-slate-700 my-2"></div>
                      
                      <button 
                        onClick={() => {
                          onRefreshWeather();
                          setShowDateSettings(false);
                        }}
                        disabled={isWeatherLoading}
                        className="w-full flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 py-1"
                      >
                         <CloudLightning className={`w-3 h-3 ${isWeatherLoading ? 'animate-spin' : ''}`} />
                         {isWeatherLoading ? 'Updating...' : 'Update Weather Data'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {days.map((day, index) => (
              <div 
                key={day.id} 
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative group flex items-center gap-1 mb-1 rounded-lg transition-all ${
                  draggedIndex === index ? 'opacity-40' : 'opacity-100'
                } ${
                  dragOverIndex === index ? 'bg-slate-700 ring-1 ring-travel-accent/50' : ''
                }`}
              >
                <button
                  onClick={() => { onSelectDay(day.id); onCloseMobile(); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all border ${
                    selectedDayId === day.id
                      ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/50 text-white'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
                  } ${isCollapsed ? 'justify-center px-0 flex-col gap-1' : ''} ${!isCollapsed ? 'pr-20' : ''}`}
                >
                  <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-md shrink-0 ${
                    selectedDayId === day.id ? 'bg-travel-accent text-travel-dark' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <span className="text-xs font-bold leading-none">{day.date.split('-')[2]}</span>
                    <span className="text-[10px] leading-none mt-0.5">{new Date(day.date).toLocaleString('en', { month: 'short' })}</span>
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-col items-start text-left truncate min-w-0 flex-1">
                      <span className="text-sm font-medium truncate w-full">{day.location}</span>
                      <span className="text-xs opacity-70 truncate w-full">{day.displayDate}</span>
                    </div>
                  )}
                </button>
                
                {/* Right Side Controls */}
                {!isCollapsed && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
                    <button 
                      type="button"
                      onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         onDeleteDay(day.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onDragStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-full transition-all"
                      title="Remove Day"
                    >
                      <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                    </button>

                    <div 
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      className="p-1.5 text-slate-600 hover:text-travel-accent cursor-grab active:cursor-grabbing transition-colors"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Day Button */}
             <button
              onClick={onAddDay}
              className={`w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-lg transition-colors text-slate-500 hover:text-travel-accent hover:bg-slate-800/50 border border-dashed border-slate-800 hover:border-travel-accent/30 ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Plus className="w-4 h-4" />
              {!isCollapsed && <span className="text-sm font-medium">Add Day</span>}
            </button>
          </div>
        )}
      </div>

      {/* Footer Countdown */}
      <div className="p-4 border-t border-slate-800">
        {!isCollapsed ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
             {countdown > 0 ? (
               <div className="flex flex-col items-center relative z-10">
                 <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">距離出發</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-3xl font-bold text-travel-accent font-mono">{countdown}</span>
                   <span className="text-sm text-slate-400">天</span>
                 </div>
                 <div className="mt-2 text-[10px] text-slate-500 bg-black/20 px-2 py-0.5 rounded-full">
                    {getTripStartDate()}
                 </div>
               </div>
             ) : (
                <div className="flex flex-col items-center relative z-10">
                  <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                    {countdown === 0 ? '就是今天！' : '旅程進行中'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-green-400 font-mono">
                      {countdown === 0 ? 'Have Fun!' : `Day ${Math.abs(countdown) + 1}`}
                    </span>
                  </div>
                </div>
             )}
             {/* Decorative background element */}
             <Clock className="absolute -right-2 -bottom-2 w-16 h-16 text-slate-800/50 -rotate-12" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-travel-accent border border-slate-700">
              {countdown > 0 ? countdown : 'Go'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
