
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Map, Trash2, Calendar, ArrowRight, X, Sparkles, Image as ImageIcon, Upload } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export interface TripPlan {
  id: string;
  title: string;
  subtitle?: string; // Added subtitle
  startDate: string;
  coverImage?: string;
  createdAt: number;
}

interface HomeProps {
  plans: TripPlan[];
  onCreatePlan: (title: string, startDate: string) => void;
  onSelectPlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
}

const DEFAULT_BG = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop";

const Home: React.FC<HomeProps> = ({ plans, onCreatePlan, onSelectPlan, onDeletePlan }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDate, setNewPlanDate] = useState(new Date().toISOString().split('T')[0]);

  // Background Image State
  const [bgImage, setBgImage] = useState<string>(DEFAULT_BG);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  // Load saved background on mount
  useEffect(() => {
    const savedBg = localStorage.getItem('tabilog_home_bg');
    if (savedBg) {
      setBgImage(savedBg);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBgImage(result);
        localStorage.setItem('tabilog_home_bg', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim() || !newPlanDate) return;
    
    onCreatePlan(newPlanTitle, newPlanDate);
    setIsCreateModalOpen(false);
    setNewPlanTitle('');
    setNewPlanDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteRequest = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPlanToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (planToDelete) {
      onDeletePlan(planToDelete);
      setPlanToDelete(null);
    }
  };

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-fixed transition-all duration-700"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>

      <div className="relative z-10 min-h-screen p-8 flex flex-col">
        
        {/* Top Controls */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all border border-white/10 shadow-sm hover:shadow-md"
            title="Change Background"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
          <header className="mt-12 mb-16 text-center">
              <h1 className="text-6xl md:text-7xl font-bold mb-4 text-white drop-shadow-lg tracking-tight font-serif">
                悠遊
              </h1>
              <p className="text-slate-200 text-lg font-light tracking-widest drop-shadow-md">YOYU · TRAVEL PLANNER</p>
          </header>

          {/* Action Bar */}
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
               <Map className="w-6 h-6 text-travel-accent" />
               Your Trips
             </h2>
             <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-travel-accent hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 transform hover:-translate-y-1 hover:scale-105"
             >
                <Plus className="w-5 h-5" />
                <span>New Trip</span>
             </button>
          </div>

          {/* Grid */}
          {plans.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl">
               <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Sparkles className="w-12 h-12 text-travel-accent" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">準備好出發了嗎？</h3>
               <p className="text-slate-300 mb-8 max-w-md text-center">目前還沒有行程計畫。點擊下方按鈕，開始規劃您的下一趟精彩旅程。</p>
               <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-travel-accent hover:text-white font-bold text-lg border-b-2 border-travel-accent hover:border-white transition-colors pb-1"
               >
                  Create your first trip &rarr;
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
               {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => onSelectPlan(plan.id)}
                    onMouseEnter={() => setHoveredId(plan.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group relative bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-slate-800/90 hover:border-travel-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 transform hover:-translate-y-1"
                  >
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-600/50 flex items-center justify-center text-travel-accent group-hover:scale-110 transition-transform shadow-inner">
                            <Map className="w-6 h-6" />
                        </div>
                        <button
                          onClick={(e) => handleDeleteRequest(e, plan.id)}
                          className={`p-2 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all ${hoveredId === plan.id ? 'opacity-100' : 'opacity-0'}`}
                          title="Delete Plan"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     
                     <h3 className="text-xl font-bold text-white mb-2 group-hover:text-travel-accent transition-colors truncate">
                        {plan.title}
                     </h3>
                     <p className="text-sm text-slate-500 mb-4 truncate">{plan.subtitle || 'Planning Mode'}</p>
                     
                     <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                        <Calendar className="w-4 h-4" />
                        <span>{plan.startDate}</span>
                     </div>

                     <div className="flex items-center text-travel-accent text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                        <span>Open Plan</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                     </div>
                  </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
              >
                 <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-1">Plan a new trip</h2>
              <p className="text-slate-400 text-sm mb-6">Where are you going next?</p>
              
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trip Title</label>
                    <input
                      type="text"
                      value={newPlanTitle}
                      onChange={(e) => setNewPlanTitle(e.target.value)}
                      placeholder="e.g. Kyoto Spring 2026"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-travel-accent/50 transition-all"
                      autoFocus
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                    <input
                      type="date"
                      value={newPlanDate}
                      onChange={(e) => setNewPlanDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-travel-accent/50 transition-all"
                    />
                 </div>

                 <button
                    type="submit"
                    disabled={!newPlanTitle.trim() || !newPlanDate}
                    className="w-full bg-travel-accent hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-travel-accent text-slate-900 font-bold py-3 rounded-xl transition-all mt-4 flex items-center justify-center gap-2"
                 >
                    <Plus className="w-5 h-5" />
                    Create Trip
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="刪除行程確認"
        message="確定要刪除這個行程規劃嗎？此動作無法復原，所有相關的行程細節與消費紀錄都將被永久刪除。"
        confirmText="確認刪除"
        cancelText="取消"
      />
    </div>
  );
};

export default Home;
