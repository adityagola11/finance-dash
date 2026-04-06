import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, TrendingDown, Trash2, Plus, 
  Moon, Sun, LayoutDashboard, Search, PieChart, 
  Filter, Calendar, BarChart3, Info, AlertCircle,
  X, CheckCircle2, IndianRupee
} from 'lucide-react';

export default function FinanceDashboard() {
  // --- STATE MANAGEMENT ---
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('fin_data_inr');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: '2026-04-01', description: 'Monthly Salary', amount: 85000, category: 'Income', type: 'income' },
      { id: 2, date: '2026-04-02', description: 'Reliance Fresh', amount: 4200, category: 'Food', type: 'expense' },
      { id: 3, date: '2026-04-03', description: 'Electricity Bill', amount: 2800, category: 'Utilities', type: 'expense' },
      { id: 4, date: '2026-04-04', description: 'Zomato Order', amount: 850, category: 'Food', type: 'expense' },
      { id: 5, date: '2026-04-05', description: 'Freelance Project', amount: 15000, category: 'Income', type: 'income' },
    ];
  });

  const [darkMode, setDarkMode] = useState(true);
  const [role, setRole] = useState('admin'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [newTx, setNewTx] = useState({ 
    description: '', 
    amount: '', 
    category: 'Food', 
    type: 'expense', 
    date: new Date().toISOString().split('T')[0] 
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('fin_data_inr', JSON.stringify(transactions));
  }, [transactions]);

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- CALCULATIONS ---
  const { totalIncome, totalExpense, balance, spendingByCategory, topCategory } = useMemo(() => {
    let inc = 0, exp = 0;
    const cats = {};
    transactions.forEach(tx => {
      const amt = parseFloat(tx.amount);
      if (tx.type === 'income') inc += amt;
      else {
        exp += amt;
        cats[tx.category] = (cats[tx.category] || 0) + amt;
      }
    });
    const sortedCats = Object.entries(cats).sort((a,b) => b[1]-a[1]);
    return { 
      totalIncome: inc, totalExpense: exp, balance: inc - exp, 
      spendingByCategory: sortedCats, topCategory: sortedCats[0]?.[0] || 'N/A' 
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => sortBy === 'amount' ? b.amount - a.amount : new Date(b.date) - new Date(a.date));
  }, [transactions, searchTerm, sortBy]);

  // --- HANDLERS ---
  const handleAdd = (e) => {
    e.preventDefault();
    if(!newTx.description || !newTx.amount) return;
    
    const entry = { ...newTx, id: Date.now(), amount: parseFloat(newTx.amount) };
    setTransactions([entry, ...transactions]);
    setNewTx({ ...newTx, description: '', amount: '' });
    setNotification({ message: "Entry successfully recorded!", type: "success" });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${darkMode ? 'bg-[#050505] text-slate-100' : 'bg-[#fcfcfd] text-slate-900'}`}>
      
      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20"
          >
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ANALYTICS MODAL */}
      <AnimatePresence>
        {showAnalytics && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAnalytics(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative w-full max-w-2xl p-8 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
              <button onClick={() => setShowAnalytics(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><BarChart3 className="text-indigo-500" /> Spending Analytics</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-[10px] uppercase font-bold text-indigo-400">Avg. Daily Spend</p>
                  <p className="text-xl font-black">{formatCurrency(totalExpense / 30)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] uppercase font-bold text-emerald-400">Savings Potential</p>
                  <p className="text-xl font-black">{formatCurrency(balance * 0.15)}</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-slate-400">Projected spending trend based on your last 7 days of activity.</p>
                <div className="flex items-end justify-between h-32 gap-2">
                  {[30, 50, 90, 40, 60, 80, 45].map((h, i) => (
                    <div key={i} className="flex-1 group relative">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} className="w-full bg-indigo-500/40 group-hover:bg-indigo-500 rounded-t-lg transition-colors cursor-help" />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-[10px] px-2 py-1 rounded">₹{h*100}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-lg ${darkMode ? 'bg-black/50 border-white/5' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <IndianRupee className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none">FINANCE-DASH</h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fintech v2.0</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-xl transition-all ${darkMode ? 'bg-white/5 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className={`h-8 w-px ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
            <div className="flex flex-col items-end">
              <select 
                value={role} onChange={(e) => setRole(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-indigo-500"
              >
                <option value="admin">ADMIN ACCESS</option>
                <option value="viewer">VIEWER ONLY</option>
              </select>
              <span className="text-[9px] text-slate-500 font-medium">Logged in as {role}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* BIG CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Balance', val: balance, color: 'indigo', icon: Wallet },
                { label: 'Total Income', val: totalIncome, color: 'emerald', icon: TrendingUp },
                { label: 'Total Expenses', val: totalExpense, color: 'rose', icon: TrendingDown },
              ].map((card) => (
                <motion.div key={card.label} whileHover={{ y: -5 }} className={`p-8 rounded-[2rem] border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center bg-${card.color}-500/10 text-${card.color}-500`}>
                    <card.icon size={24} />
                  </div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{card.label}</p>
                  <p className="text-3xl font-black mt-2 tabular-nums">{formatCurrency(card.val)}</p>
                </motion.div>
              ))}
            </div>

            {/* TRANSACTIONS LIST */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-black">History</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" placeholder="Filter transactions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 rounded-2xl text-xs outline-none transition-all ${darkMode ? 'bg-white/5 focus:bg-white/10 ring-1 ring-white/10' : 'bg-slate-100 focus:bg-white ring-1 ring-slate-200'}`}
                    />
                  </div>
                  <select onChange={(e) => setSortBy(e.target.value)} className="p-3 rounded-2xl text-[10px] font-bold uppercase bg-transparent border border-white/10 outline-none">
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                  </select>
                </div>
              </div>

              <div className={`rounded-[2rem] border overflow-hidden ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                {filteredTransactions.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className={`text-[10px] font-black uppercase tracking-widest text-slate-500 ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <tr>
                        <th className="p-6">Description</th>
                        <th className="p-6">Category</th>
                        <th className="p-6 text-right">Amount</th>
                        {role === 'admin' && <th className="p-6 text-center">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <AnimatePresence mode="popLayout">
                        {filteredTransactions.map((tx) => (
                          <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={tx.id} className="group hover:bg-indigo-500/[0.03] transition-colors">
                            <td className="p-6">
                              <div className="text-sm font-bold">{tx.description}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{tx.date}</div>
                            </td>
                            <td className="p-6">
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>{tx.category}</span>
                            </td>
                            <td className={`p-6 text-right font-black tabular-nums ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </td>
                            {role === 'admin' && (
                              <td className="p-6 text-center">
                                <button onClick={() => { setTransactions(transactions.filter(t => t.id !== tx.id)); setNotification({ message: "Entry deleted", type: "info" }); }} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            )}
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="text-slate-600" /></div>
                    <p className="text-slate-500 text-sm font-medium">No matching transactions found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* QUICK ADD ENTRY */}
            {role === 'admin' ? (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Plus size={20}/> New Record</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Title</label>
                    <input required type="text" placeholder="e.g. Rent" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full p-4 rounded-2xl bg-white/10 border-none placeholder-indigo-200 text-sm outline-none focus:bg-white/20 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Amount (₹)</label>
                      <input required type="number" placeholder="0" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="w-full p-4 rounded-2xl bg-white/10 border-none placeholder-indigo-200 text-sm outline-none focus:bg-white/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Type</label>
                      <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} className="w-full p-4 rounded-2xl bg-white/10 border-none text-sm outline-none cursor-pointer">
                        <option value="expense" className="text-slate-900">Expense</option>
                        <option value="income" className="text-slate-900">Income</option>
                      </select>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl hover:shadow-xl transition-all">SAVE ENTRY</motion.button>
                </form>
              </motion.div>
            ) : (
              <div className="p-8 rounded-[2.5rem] border border-dashed border-slate-800 flex flex-col items-center justify-center text-center text-slate-500">
                <Info size={32} className="mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest mb-1">View Only Mode</p>
                <p className="text-[10px] opacity-60">Admin rights required to modify ledger.</p>
              </div>
            )}

            {/* WEEKLY ACTIVITY - TRIGGER FOR ANALYTICS */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowAnalytics(true)}
              className={`p-8 rounded-[2.5rem] border cursor-pointer group transition-all ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={16} className="text-indigo-500" /> Weekly Activity
                </h3>
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={14} />
                </div>
              </div>
              <div className="flex items-end justify-between h-20 gap-1.5 px-1">
                {[40, 70, 45, 90, 65, 30, 50].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-t-lg transition-all ${i === 3 ? 'bg-indigo-500' : 'bg-indigo-500/10 group-hover:bg-indigo-500/20'}`} style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-4 text-[9px] text-slate-500 font-black uppercase flex justify-between tracking-tighter">
                <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
              </div>
              <p className="mt-6 text-[10px] font-bold text-center text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">CLICK TO VIEW ANALYTICS</p>
            </motion.div>

            {/* INSIGHTS */}
            <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><PieChart size={16} className="text-emerald-500" /> Insights</h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Top Drain</span>
                  <span className="text-xs font-black text-rose-500 uppercase">{topCategory}</span>
                </div>
                <div className="space-y-4 pt-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Spending Categories</p>
                  {spendingByCategory.slice(0, 3).map(([cat, val]) => (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span>{cat}</span>
                        <span>{formatCurrency(val)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(val/totalExpense)*100}%` }} className="h-full bg-indigo-500 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}