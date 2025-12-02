import React, { useState } from 'react';
import { Expense, Currency } from '../types';
import { generateId } from '../constants';
import { Plus, Trash2, PieChart, Wallet, ArrowRightLeft } from 'lucide-react';

interface ExpenseTrackerProps {
  expenses: Expense[];
  onUpdateExpenses: (expenses: Expense[]) => void;
}

const EXCHANGE_RATE = 0.22; // JPY to TWD (Approx)

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, onUpdateExpenses }) => {
  const [jpyAmount, setJpyAmount] = useState<string>('');
  const [twdAmount, setTwdAmount] = useState<string>('');
  const [primaryCurrency, setPrimaryCurrency] = useState<Currency>('JPY');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle JPY Input Change
  const handleJpyChange = (val: string) => {
    setJpyAmount(val);
    if (val === '') {
      setTwdAmount('');
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setTwdAmount(Math.round(num * EXCHANGE_RATE).toString());
      }
    }
  };

  // Handle TWD Input Change
  const handleTwdChange = (val: string) => {
    setTwdAmount(val);
    if (val === '') {
      setJpyAmount('');
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setJpyAmount(Math.round(num / EXCHANGE_RATE).toString());
      }
    }
  };

  const handleAdd = () => {
    if ((!jpyAmount && !twdAmount) || !description) return;
    
    // Determine the final amount based on primary currency
    const finalAmount = primaryCurrency === 'JPY' 
      ? parseFloat(jpyAmount) 
      : parseFloat(twdAmount);

    const newExpense: Expense = {
      id: generateId(),
      date,
      amount: finalAmount,
      currency: primaryCurrency,
      category,
      description
    };
    
    onUpdateExpenses([newExpense, ...expenses]);
    
    // Reset inputs
    setJpyAmount('');
    setTwdAmount('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    onUpdateExpenses(expenses.filter(e => e.id !== id));
  };

  // Calculations
  const totalJPY = expenses.reduce((acc, curr) => {
    return acc + (curr.currency === 'JPY' ? curr.amount : curr.amount / EXCHANGE_RATE);
  }, 0);

  const totalTWD = expenses.reduce((acc, curr) => {
    return acc + (curr.currency === 'TWD' ? curr.amount : curr.amount * EXCHANGE_RATE);
  }, 0);

  // Group by date
  const groupedExpenses = expenses.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {} as Record<string, Expense[]>);

  const dates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">消費紀錄 Expenses</h2>
          <p className="text-slate-400">Track your spending</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24 text-white" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total in TWD</p>
          <div className="text-4xl font-bold text-white tracking-tight">
            NT$ {Math.round(totalTWD).toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-2">約 {Math.round(totalJPY).toLocaleString()} JPY (Rate: {EXCHANGE_RATE})</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-center border-dashed">
            <div className="text-center">
                <PieChart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Category analysis coming soon</p>
            </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Add New Expense</h3>
        
        <div className="space-y-4">
          
          {/* Top Row: Date & Category */}
          <div className="grid grid-cols-2 gap-3">
             <input 
               type="date" 
               value={date} 
               onChange={e => setDate(e.target.value)}
               className="bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-travel-accent"
             />
             <select 
               value={category}
               onChange={e => setCategory(e.target.value)}
               className="bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-travel-accent"
             >
               <option value="Food">Food</option>
               <option value="Transport">Transport</option>
               <option value="Shopping">Shopping</option>
               <option value="Hotel">Hotel</option>
               <option value="Other">Other</option>
             </select>
          </div>

          {/* Currency Calculator Area */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
             <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                <ArrowRightLeft className="w-3 h-3" />
                <span>Auto-conversion (Rate: {EXCHANGE_RATE})</span>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* JPY Input */}
                <div onClick={() => setPrimaryCurrency('JPY')} 
                     className={`relative p-3 rounded-lg border transition-all cursor-pointer ${primaryCurrency === 'JPY' ? 'bg-slate-800 border-travel-accent ring-1 ring-travel-accent/30' : 'bg-slate-900 border-slate-700 opacity-60 hover:opacity-100'}`}>
                   <label className="block text-xs font-bold text-slate-400 mb-1">JPY (¥)</label>
                   <input 
                     type="number" 
                     value={jpyAmount} 
                     onChange={(e) => handleJpyChange(e.target.value)}
                     placeholder="0"
                     className="w-full bg-transparent border-none text-xl font-mono text-white p-0 focus:ring-0 placeholder-slate-600"
                   />
                   {primaryCurrency === 'JPY' && <div className="absolute top-2 right-2 w-2 h-2 bg-travel-accent rounded-full"></div>}
                </div>

                {/* TWD Input */}
                <div onClick={() => setPrimaryCurrency('TWD')}
                     className={`relative p-3 rounded-lg border transition-all cursor-pointer ${primaryCurrency === 'TWD' ? 'bg-slate-800 border-travel-accent ring-1 ring-travel-accent/30' : 'bg-slate-900 border-slate-700 opacity-60 hover:opacity-100'}`}>
                   <label className="block text-xs font-bold text-slate-400 mb-1">TWD (NT$)</label>
                   <input 
                     type="number" 
                     value={twdAmount} 
                     onChange={(e) => handleTwdChange(e.target.value)}
                     placeholder="0"
                     className="w-full bg-transparent border-none text-xl font-mono text-white p-0 focus:ring-0 placeholder-slate-600"
                   />
                   {primaryCurrency === 'TWD' && <div className="absolute top-2 right-2 w-2 h-2 bg-travel-accent rounded-full"></div>}
                </div>
             </div>
             <p className="text-[10px] text-slate-500 mt-2 text-center">Click on a box to select payment currency</p>
          </div>

          {/* Description */}
          <input 
             type="text" 
             value={description} 
             onChange={e => setDescription(e.target.value)}
             placeholder="Description (e.g. Ramen at Ichiran)"
             className="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-travel-accent"
           />

          <button 
            onClick={handleAdd}
            className="w-full bg-travel-accent hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-5 h-5" /> Add Expense
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {dates.map(d => (
          <div key={d}>
             <h4 className="text-sm font-bold text-slate-500 mb-3 ml-1 sticky top-0 bg-travel-dark py-2 z-10">{d}</h4>
             <div className="space-y-2">
               {groupedExpenses[d].map(exp => (
                 <div key={exp.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                       exp.category === 'Food' ? 'bg-orange-500/10 text-orange-500' : 
                       exp.category === 'Transport' ? 'bg-blue-500/10 text-blue-500' :
                       exp.category === 'Shopping' ? 'bg-pink-500/10 text-pink-500' :
                       'bg-slate-700/50 text-slate-400'
                     }`}>
                        <span className="text-xs font-bold">{exp.category[0]}</span>
                     </div>
                     <div className="min-w-0">
                       <p className="text-white font-medium truncate">{exp.description}</p>
                       <p className="text-xs text-slate-500">Paid in {exp.currency}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="text-right shrink-0">
                       <p className="text-white font-bold">{exp.currency === 'JPY' ? '¥' : 'NT$'} {exp.amount.toLocaleString()}</p>
                       {exp.currency === 'JPY' ? (
                         <p className="text-xs text-slate-500">≈ NT$ {Math.round(exp.amount * EXCHANGE_RATE).toLocaleString()}</p>
                       ) : (
                          <p className="text-xs text-slate-500">≈ ¥ {Math.round(exp.amount / EXCHANGE_RATE).toLocaleString()}</p>
                       )}
                     </div>
                     <button 
                       onClick={() => handleDelete(exp.id)}
                       className="text-slate-600 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-all"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseTracker;