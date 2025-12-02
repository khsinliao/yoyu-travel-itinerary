
import React, { useState } from 'react';
import { DayItinerary, ItineraryItem } from '../types';
import { getActivityIcon } from '../constants';
import { MapPin, Plus, Edit2, ExternalLink, CheckSquare, Square, Trash2, CloudRain, CloudSnow, Sun, Cloud, Check, History, Thermometer } from 'lucide-react';
import EditModal from './EditModal';

interface TimelineProps {
  day: DayItinerary;
  onUpdateDay: (updatedDay: DayItinerary) => void;
}

const WeatherIcon = ({ condition, className = "w-8 h-8" }: { condition?: string, className?: string }) => {
  switch (condition) {
    case 'Rain': return <CloudRain className={`${className} text-blue-400`} />;
    case 'Snow': return <CloudSnow className={`${className} text-white`} />;
    case 'Sunny': return <Sun className={`${className} text-amber-400`} />;
    case 'Cloudy': return <Cloud className={`${className} text-slate-400`} />;
    default: return <Sun className={`${className} text-amber-400`} />;
  }
};

const Timeline: React.FC<TimelineProps> = ({ day, onUpdateDay }) => {
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemMode, setNewItemMode] = useState(false);
  
  // Header Editing State
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState({ location: '', subtitle: '' });

  const handleTodoToggle = (activityId: string, todoId: string) => {
    const updatedActivities = day.activities.map(act => {
      if (act.id !== activityId) return act;
      return {
        ...act,
        todos: act.todos?.map(todo => 
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        )
      };
    });
    onUpdateDay({ ...day, activities: updatedActivities });
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('確定要刪除此行程嗎?')) {
      onUpdateDay({
        ...day,
        activities: day.activities.filter(a => a.id !== itemId)
      });
    }
  };

  const handleSaveItem = (itemData: Partial<ItineraryItem>) => {
    if (newItemMode) {
      const newItem: ItineraryItem = {
        id: Math.random().toString(36).substr(2, 9),
        time: itemData.time || 'TBA',
        title: itemData.title || 'New Activity',
        type: itemData.type || 'ACTIVITY',
        ...itemData
      } as ItineraryItem;
      onUpdateDay({
        ...day,
        activities: [...day.activities, newItem]
      });
    } else if (editingItem) {
      const updatedActivities = day.activities.map(act => 
        act.id === editingItem.id ? { ...act, ...itemData } : act
      );
      onUpdateDay({ ...day, activities: updatedActivities });
    }
    setIsModalOpen(false);
    setNewItemMode(false);
    setEditingItem(null);
  };

  const openAddModal = () => {
    setNewItemMode(true);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ItineraryItem) => {
    setNewItemMode(false);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Header Editing Handlers
  const startHeaderEdit = () => {
    setHeaderForm({ 
      location: day.location, 
      subtitle: day.subtitle || 'Japan Trip 2026' 
    });
    setIsEditingHeader(true);
  };

  const saveHeaderEdit = () => {
    onUpdateDay({
      ...day,
      location: headerForm.location,
      subtitle: headerForm.subtitle
    });
    setIsEditingHeader(false);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      
      {/* Day Header */}
      <div className="sticky top-0 z-30 bg-travel-dark/95 backdrop-blur supports-[backdrop-filter]:bg-travel-dark/60 py-4 border-b border-slate-800 mb-8 -mx-4 px-4 md:-mx-0 md:px-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-travel-accent text-slate-900 mb-2">
              {day.displayDate}
            </div>
            
            {isEditingHeader ? (
              <div className="space-y-2 mt-1">
                 <input 
                   type="text" 
                   value={headerForm.location}
                   onChange={e => setHeaderForm({...headerForm, location: e.target.value})}
                   className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-2xl font-bold text-white focus:outline-none focus:border-travel-accent"
                   placeholder="Main Title (Location)"
                 />
                 <input 
                   type="text" 
                   value={headerForm.subtitle}
                   onChange={e => setHeaderForm({...headerForm, subtitle: e.target.value})}
                   className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-300 focus:outline-none focus:border-travel-accent"
                   placeholder="Subtitle"
                 />
                 <div className="flex gap-2">
                   <button onClick={saveHeaderEdit} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded flex items-center gap-1">
                     <Check className="w-3 h-3" /> Save
                   </button>
                   <button onClick={() => setIsEditingHeader(false)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded">Cancel</button>
                 </div>
              </div>
            ) : (
              <div className="group relative">
                <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                  {day.location}
                  <button onClick={startHeaderEdit} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-travel-accent">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </h2>
                <p className="text-slate-400 text-sm">{day.subtitle || 'Japan Trip 2026'}</p>
              </div>
            )}
          </div>
          
          {/* Weather Widget (Day Summary) */}
          <div className="bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3 border border-slate-700 shrink-0 relative group/weather">
            {day.weatherInfo?.isReference && (
              <div className="absolute -top-2 -right-2 bg-slate-700 text-[10px] px-1.5 py-0.5 rounded-full border border-slate-600 text-slate-300 shadow-sm flex items-center gap-1" title="Historical data from last year">
                 <History className="w-3 h-3" />
                 <span>Ref</span>
              </div>
            )}
            <WeatherIcon condition={day.weatherInfo?.condition} />
            <div className="text-right hidden sm:block">
              {day.weatherInfo?.temp !== undefined ? (
                 <div className="text-xl font-bold text-white">
                   {day.weatherInfo.temp}°
                 </div>
              ) : (
                 <div className="text-xl font-bold text-white">
                   {day.weatherInfo?.tempMin}° - {day.weatherInfo?.tempMax}°
                 </div>
              )}
              <div className="text-xs text-slate-400">{day.weatherInfo?.condition}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Items */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
        
        {day.activities.map((item) => (
          <div key={item.id} className="relative flex items-start group">
            
            {/* Timeline Dot */}
            <div className="absolute left-0 ml-5 -translate-x-1/2 mt-1.5 w-4 h-4 rounded-full border-2 border-slate-700 bg-slate-900 group-hover:border-travel-accent group-hover:bg-travel-accent transition-colors z-10"></div>

            <div className="ml-12 w-full">
              <div className="bg-slate-900/50 border border-slate-800 hover:border-slate-600 rounded-xl p-5 backdrop-blur-sm transition-all shadow-lg hover:shadow-xl hover:shadow-black/20 group">
                
                {/* Header Row */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-travel-accent font-mono text-sm font-bold">{item.time}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs uppercase tracking-wider">
                      {getActivityIcon(item.type)}
                      <span>{item.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                
                {/* Location & Activity Weather */}
                {(item.location || item.weatherInfo) && (
                   <div className="flex flex-wrap items-center gap-3 mb-3">
                     {item.location && (
                       <div className="flex items-center gap-1 text-slate-400 text-sm">
                         <MapPin className="w-3.5 h-3.5 shrink-0" />
                         <span className="truncate max-w-[200px]">{item.location}</span>
                       </div>
                     )}
                     
                     {item.weatherInfo && (
                        <div className="flex items-center gap-2 text-xs bg-slate-800 px-2 py-1 rounded-md border border-slate-700/50 text-slate-300">
                           <WeatherIcon condition={item.weatherInfo.condition} className="w-4 h-4" />
                           <div className="flex items-center gap-1">
                              <Thermometer className="w-3 h-3 opacity-70" />
                              {item.weatherInfo.temp !== undefined ? (
                                <span className="font-bold text-amber-100">{item.weatherInfo.temp}°</span>
                              ) : (
                                <span>{item.weatherInfo.tempMin}° / {item.weatherInfo.tempMax}°</span>
                              )}
                           </div>
                           {item.weatherInfo.isReference && <span className="text-[9px] px-1 bg-slate-700 rounded text-slate-400">Ref</span>}
                        </div>
                     )}
                   </div>
                )}
                
                {item.description && (
                  <p className="text-slate-300 text-sm leading-relaxed mb-3 whitespace-pre-line">
                    {item.description}
                  </p>
                )}

                {/* Actions & Links */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.googleMapLink && (
                    <a 
                      href={item.googleMapLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                    >
                      <MapPin className="w-3 h-3" />
                      Google Maps
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>

                {/* Todos */}
                {item.todos && item.todos.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Todo List</h4>
                    <div className="space-y-2">
                      {item.todos.map(todo => (
                        <div key={todo.id} 
                          onClick={() => handleTodoToggle(item.id, todo.id)}
                          className="flex items-center gap-2 cursor-pointer group/todo"
                        >
                          {todo.completed ? (
                            <CheckSquare className="w-4 h-4 text-travel-accent" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 group-hover/todo:text-slate-400" />
                          )}
                          <span className={`text-sm ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                            {todo.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <div className="mt-3 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                    <h4 className="text-[10px] font-bold text-travel-accent uppercase tracking-wider mb-1">Notes</h4>
                    <p className="text-sm text-slate-300">{item.notes}</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}
        
        {/* Add Button */}
        <div className="relative flex items-start">
           <div className="absolute left-0 ml-5 -translate-x-1/2 mt-1 w-3 h-3 rounded-full border border-slate-700 bg-slate-900 z-10"></div>
           <button 
             onClick={openAddModal}
             className="ml-12 flex items-center gap-2 px-4 py-3 bg-slate-800/30 hover:bg-slate-800 border border-slate-800 border-dashed rounded-xl text-slate-400 hover:text-white transition-all w-full group"
           >
             <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-travel-accent group-hover:text-travel-dark transition-colors">
               <Plus className="w-4 h-4" />
             </div>
             <span className="font-medium text-sm">Add Activity</span>
           </button>
        </div>

      </div>

      <EditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem || undefined}
      />
    </div>
  );
};

export default Timeline;
