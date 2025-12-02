import React, { useState, useEffect } from 'react';
import { ActivityType, ItineraryItem, TodoItem } from '../types';
import { X, Save, Plus, Trash2, Clock, CheckSquare, Square } from 'lucide-react';
import { generateId } from '../constants';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ItineraryItem>) => void;
  initialData?: ItineraryItem;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<ItineraryItem>>({
    title: '',
    time: '',
    location: '',
    description: '',
    type: ActivityType.ACTIVITY,
    googleMapLink: '',
    notes: '',
    todos: []
  });

  const [newTodoText, setNewTodoText] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        ...initialData,
        todos: initialData.todos || []
      });
    } else {
      setFormData({
        title: '',
        time: '',
        location: '',
        description: '',
        type: ActivityType.ACTIVITY,
        googleMapLink: '',
        notes: '',
        todos: []
      });
    }
  }, [initialData, isOpen]);

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    const newTodo: TodoItem = {
      id: generateId(),
      text: newTodoText,
      completed: false
    };
    setFormData(prev => ({
      ...prev,
      todos: [...(prev.todos || []), newTodo]
    }));
    setNewTodoText('');
  };

  const handleRemoveTodo = (id: string) => {
    setFormData(prev => ({
      ...prev,
      todos: prev.todos?.filter(t => t.id !== id)
    }));
  };

  const handleUpdateTodoText = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      todos: prev.todos?.map(t => t.id === id ? { ...t, text } : t)
    }));
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setFormData(prev => ({ ...prev, time: e.target.value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900">
          <h3 className="text-lg font-bold text-white">{initialData ? '編輯行程 Edit' : '新增行程 Add'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Top Row: Time & Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-1">Time</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.time || ''}
                  onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="10:00 or Morning"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-travel-accent/50 text-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                   <input 
                     type="time" 
                     className="absolute opacity-0 inset-0 cursor-pointer w-6"
                     onChange={handleTimeChange}
                   />
                   <Clock className="w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as ActivityType }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-travel-accent/50 text-sm"
              >
                {Object.values(ActivityType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Info */}
          <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input
                type="text"
                value={formData.title || ''}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Activity Name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-travel-accent/50"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
                <input
                type="text"
                value={formData.location || ''}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Tokyo, Japan"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-travel-accent/50 text-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Google Maps Link</label>
                <input
                type="text"
                value={formData.googleMapLink || ''}
                onChange={e => setFormData(prev => ({ ...prev, googleMapLink: e.target.value }))}
                placeholder="https://maps.google.com/..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-travel-accent/50 text-sm font-mono"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea
                rows={3}
                value={formData.description || ''}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Details..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-travel-accent/50 text-sm"
                />
            </div>
          </div>

          {/* Todo List Section */}
          <div className="border-t border-slate-800 pt-4">
             <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Checklist / Todos</label>
             <div className="space-y-2 mb-3">
               {formData.todos?.map(todo => (
                 <div key={todo.id} className="flex items-center gap-2 group">
                   <div className="p-1">
                      {todo.completed ? <CheckSquare className="w-4 h-4 text-travel-accent" /> : <Square className="w-4 h-4 text-slate-600" />}
                   </div>
                   <input 
                     type="text"
                     value={todo.text}
                     onChange={(e) => handleUpdateTodoText(todo.id, e.target.value)}
                     className="flex-1 bg-transparent border-b border-transparent focus:border-slate-600 text-sm text-slate-200 focus:outline-none pb-1"
                   />
                   <button 
                     onClick={() => handleRemoveTodo(todo.id)}
                     className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                   >
                     <Trash2 className="w-3 h-3" />
                   </button>
                 </div>
               ))}
               {(!formData.todos || formData.todos.length === 0) && (
                 <p className="text-xs text-slate-600 italic px-1">No tasks yet.</p>
               )}
             </div>
             
             <div className="flex gap-2">
               <input 
                 type="text"
                 value={newTodoText}
                 onChange={(e) => setNewTodoText(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                 placeholder="Add new task..."
                 className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-slate-600"
               />
               <button 
                 onClick={handleAddTodo}
                 disabled={!newTodoText.trim()}
                 className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 transition-colors"
               >
                 <Plus className="w-4 h-4" />
               </button>
             </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Notes / Memos</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Private notes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-travel-accent/90 focus:outline-none focus:ring-2 focus:ring-travel-accent/50 text-sm"
            />
          </div>

        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-900">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white">Cancel</button>
          <button 
            onClick={() => onSave(formData)}
            className="flex items-center gap-2 px-6 py-2 bg-travel-accent hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;