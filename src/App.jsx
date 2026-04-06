import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, TrendingDown, Trash2, Plus, 
  Moon, Sun, Search, IndianRupee, Info, AlertCircle, PieChart, 
  X, Maximize2, LogOut, User, Lock, Mail, UserPlus
} from 'lucide-react';

// ==========================================
// 1. MAIN APP COMPONENT (CONTROLS ROUTING)
// ==========================================
export default function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('active_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Inject Static Admin on first ever load
  useEffect(() => {
    const db = localStorage.getItem('users_db');
    if (!db) {
      localStorage.setItem('users_db', JSON.stringify([
        { name: 'System Admin', email: 'admin@finance.com', password: 'admin123', role: 'admin' }
      ]));
    }
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem('active_session', JSON.stringify(user));
    setSession(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('active_session');
    setSession(null);
  };

  return session ? (
    <FinanceDashboard session={session} onLogout={handleLogout} />
  ) : (
    <AuthScreen onLogin={handleLogin} />
  );
}

// ==========================================
// 2. AUTHENTICATION SCREEN
// ==========================================
function AuthScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const db = JSON.parse(localStorage.getItem('users_db') || '[]');

    if (isRegister) {
      // Create Viewer Account
      if (db.find(u => u.email === formData.email)) {
        return setError('Email already exists. Please sign in.');
      }
      const newUser = { name: formData.name, email: formData.email, password: formData.password, role: 'viewer' };
      localStorage.setItem('users_db', JSON.stringify([...db, newUser]));
      onLogin({ name: newUser.name, role: newUser.role }); // Auto-login
    } else {
      // Sign In Logic
      const user = db.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        onLogin({ name: user.name, role: user.role });
      } else {
        setError('Invalid email or password.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-slate-100 p-6 selection:bg-indigo-500/30">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-8 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
          <IndianRupee size={24} className="text-white" />
        </div>
        <h1 className="text-3xl font-black mb-2">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="text-slate-400 text-sm mb-8">
          {isRegister ? 'Register as a viewer to access the dashboard.' : 'Sign in to access your financial ledger.'}
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm outline-none focus:border-indigo-500 transition-colors" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm outline-none focus:border-indigo-500 transition-colors" />
          </div>

          <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full py-4 mt-2 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            {isRegister ? <><UserPlus size={18} /> Register Account</> : 'Sign In'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="ml-2 text-indigo-400 font-bold hover:underline">
            {isRegister ? 'Sign In' : 'Create Viewer Account'}
          </button>
        </p>

        {!isRegister && (
          <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-500 text-center">
            <b>Demo Admin:</b> admin@finance.com / admin123
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ==========================================
// 3. FINANCE DASHBOARD COMPONENT
// ==========================================
function FinanceDashboard({ session, onLogout }) {
  const isAdmin = session.role === 'admin';
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState(null); 
  const [hoveredSlice, setHoveredSlice] = useState(null);
  
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('fin_ledger_data');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: '2026-04-01', description: 'Monthly Salary', amount: 85000, category: 'Income', type: 'income' },
      { id: 2, date: '2026-04-02', description: 'Reliance Fresh', amount: 4500, category: 'Groceries', type: 'expense' },
      { id: 3, date: '2026-04-03', description: 'Electricity Bill', amount: 2800, category: 'Utilities', type: 'expense' },
      { id: 5, date: '2026-04-05', description: 'House Rent', amount: 15000, category: 'Housing', type: 'expense' },
    ];
  });

  const [newTx, setNewTx] = useState({ description: '', amount: '', category: 'General', type: 'expense', date: new Date().toISOString().split('T')[0] });

  // Sync Ledger to LocalStorage
  useEffect(() => localStorage.setItem('fin_ledger_data', JSON.stringify(transactions)), [transactions]);

  // --- CALCULATIONS ---
  const { totalIncome, totalExpense, balance, spendingByCategory } = useMemo(() => {
    let inc = 0, exp = 0;
    const cats = {};
    transactions.forEach(tx => {
      const amt = parseFloat(tx.amount);
      if (tx.type === 'income') inc += amt;
      else { exp += amt; cats[tx.category] = (cats[tx.category] || 0) + amt; }
    });
    return { totalIncome: inc, totalExpense: exp, balance: inc - exp, spendingByCategory: Object.entries(cats).sort((a,b) => b[1]-a[1]) };
  }, [transactions]);

  const filteredTransactions = transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- CHART LOGIC ---
  const CHART_RADIUS = 40;
  const CHART_CIRCUMFERENCE = 2 * Math.PI * CHART_RADIUS;
  const colors = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4'];

  let currentOffset = 0;
  const pieSlices = spendingByCategory.map(([cat, val], index) => {
    const percentage = val / totalExpense;
    const dashLength = percentage * CHART_CIRCUMFERENCE;
    const slice = { cat, val, percentage, dashLength, dashOffset: -currentOffset, color: colors[index % colors.length] };
    currentOffset += dashLength;
    return slice;
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if(!newTx.description || !newTx.amount) return;
    setTransactions([{ ...newTx, id: Date.now(), amount: parseFloat(newTx.amount) }, ...transactions]);
    setNewTx({ ...newTx, description: '', amount: '' });
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-indigo-500/30 ${darkMode ? 'bg-[#0a0a0c] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* POP-UP OVERLAY (MODAL) */}
      <AnimatePresence>
        {activeModal === 'pie' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div layoutId="pie-container" className={`relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} p-8 md:p-12 shadow-2xl`}>
              <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
              
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <div className="p-3 bg-indigo-500 rounded-2xl"><PieChart className="text-white" size={20} /></div>
                Detailed Spending Breakdown
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="relative aspect-square flex items-center justify-center" onMouseLeave={() => setHoveredSlice(null)}>
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-xl">
                    <circle cx="50" cy="50" r={CHART_RADIUS} fill="transparent" stroke={darkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="12" />
                    {pieSlices.map((slice) => (
                      <motion.circle key={slice.cat} cx="50" cy="50" r={CHART_RADIUS} fill="transparent" stroke={slice.color} strokeDasharray={`${slice.dashLength} ${CHART_CIRCUMFERENCE}`} strokeDashoffset={slice.dashOffset} strokeWidth={hoveredSlice?.cat === slice.cat ? "16" : "12"} strokeLinecap="round" className="transition-all duration-300 ease-out cursor-pointer origin-center" onMouseEnter={() => setHoveredSlice(slice)} />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <AnimatePresence mode="wait">
                      {hoveredSlice ? (
                        <motion.div key={hoveredSlice.cat} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{hoveredSlice.cat}</span>
                          <div className="text-3xl font-black" style={{ color: hoveredSlice.color }}>{Math.round(hoveredSlice.percentage * 100)}%</div>
                        </motion.div>
                      ) : (
                        <motion.div key="total" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Spent</span>
                          <div className="text-2xl font-black">{formatCurrency(totalExpense)}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-3">
                  {pieSlices.map((slice) => (
                    <div key={slice.cat} onMouseEnter={() => setHoveredSlice(slice)} onMouseLeave={() => setHoveredSlice(null)} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-colors border ${hoveredSlice?.cat === slice.cat ? (darkMode ? 'bg-white/10 border-white/20' : 'bg-slate-100 border-slate-300') : 'border-transparent'}`}>
                      <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: slice.color }} /><span className="text-sm font-bold">{slice.cat}</span></div>
                      <span className="text-sm font-black">{formatCurrency(slice.val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-md ${darkMode ? 'bg-slate-950/50 border-white/5' : 'bg-white/70 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20"><IndianRupee size={20} /></div>
            <h1 className="text-xl font-black tracking-tight">Finance Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-full hover:bg-slate-500/20 transition-colors">
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>
            <div className="h-8 w-px bg-slate-500/20" />
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold">{session.name}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isAdmin ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-500/10 text-slate-500'}`}>
                  {session.role}
                </span>
              </div>
              <button onClick={onLogout} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Balance', val: balance, color: 'indigo', icon: Wallet },
            { label: 'Total Income', val: totalIncome, color: 'emerald', icon: TrendingUp },
            { label: 'Total Spent', val: totalExpense, color: 'rose', icon: TrendingDown },
          ].map((card) => (
            <div key={card.label} className={`p-6 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-${card.color}-500/10 text-${card.color}-500`}><card.icon size={20} /></div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-3xl font-black">{formatCurrency(card.val)}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MAIN TRANSACTIONS LIST */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold">Recent Transactions</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" placeholder="Search entries..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all ${darkMode ? 'bg-white/5 focus:bg-white/10 ring-1 ring-white/10' : 'bg-white focus:ring-indigo-500 ring-1 ring-slate-200'}`} />
              </div>
            </div>

            <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              {filteredTransactions.length > 0 ? (
                <table className="w-full text-left">
                  <thead className={`text-xs font-bold uppercase text-slate-500 ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <tr><th className="p-5">Description</th><th className="p-5">Category</th><th className="p-5 text-right">Amount</th>{isAdmin && <th className="p-5 text-center">Action</th>}</tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {filteredTransactions.map((tx) => (
                        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={tx.id} className="hover:bg-indigo-500/5 transition-colors">
                          <td className="p-5"><div className="text-sm font-bold">{tx.description}</div><div className="text-xs text-slate-500">{tx.date}</div></td>
                          <td className="p-5"><span className={`text-[10px] font-bold px-3 py-1 rounded-md border ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>{tx.category}</span></td>
                          <td className={`p-5 text-right font-bold tabular-nums text-lg ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</td>
                          {isAdmin && (
                            <td className="p-5 text-center">
                              <button onClick={() => setTransactions(transactions.filter(t => t.id !== tx.id))} className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"><Trash2 size={16} /></button>
                            </td>
                          )}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              ) : (
                <div className="py-16 text-center text-slate-500"><AlertCircle className="mx-auto mb-3 opacity-50" size={32} /><p className="text-sm">No transactions found.</p></div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ADD TRANSACTION FORM / ROLE CARD */}
            {isAdmin ? (
              <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Plus size={20}/> Add Entry</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                  <input required type="text" placeholder="Description (e.g. Amazon)" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full p-4 rounded-2xl bg-white/10 border-none placeholder-indigo-200 text-sm outline-none focus:bg-white/20 transition-colors" />
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="number" placeholder="Amount (₹)" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="w-full p-4 rounded-2xl bg-white/10 border-none placeholder-indigo-200 text-sm outline-none focus:bg-white/20" />
                    <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} className="w-full p-4 rounded-2xl bg-white/10 border-none text-sm outline-none cursor-pointer"><option value="expense" className="text-slate-900">Expense</option><option value="income" className="text-slate-900">Income</option></select>
                  </div>
                  {newTx.type === 'expense' && <input required type="text" placeholder="Category (e.g. Food)" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="w-full p-4 rounded-2xl bg-white/10 border-none placeholder-indigo-200 text-sm outline-none focus:bg-white/20 transition-colors" />}
                  {newTx.type === 'income' && <input required type="text" placeholder="Category (e.g. Salary)" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="w-full p-4 rounded-2xl bg-white/10 border-none placeholder-indigo-200 text-sm outline-none focus:bg-white/20 transition-colors" />}
                  <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full py-4 mt-2 bg-white text-indigo-600 font-black rounded-2xl hover:shadow-xl transition-all">Save Transaction</motion.button>
                </form>
              </div>
            ) : (
              <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-400 dark:border-slate-700 flex flex-col items-center text-center text-slate-500 bg-white/5">
                <Info size={32} className="mb-4 opacity-50" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Read-Only Mode</p>
                <p className="text-xs mt-2 leading-relaxed">You are logged in as a <b>Viewer</b>. Contact the system administrator to request write permissions.</p>
              </div>
            )}

            {/* CLICKABLE MINI PIE CHART */}
            <motion.div layoutId="pie-container" onClick={() => setActiveModal('pie')} className={`p-8 rounded-[2rem] border cursor-pointer group transition-all ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-bold flex items-center gap-2"><PieChart size={18} className="text-indigo-500" /> Spending Overview</h3>
                <div className="p-2 rounded-full bg-slate-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-colors"><Maximize2 size={14} /></div>
              </div>
              
              {totalExpense > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-sm">
                      <circle cx="50" cy="50" r={CHART_RADIUS} fill="transparent" stroke={darkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="12" />
                      {pieSlices.map((slice) => (
                        <circle key={slice.cat} cx="50" cy="50" r={CHART_RADIUS} fill="transparent" stroke={slice.color} strokeDasharray={`${slice.dashLength} ${CHART_CIRCUMFERENCE}`} strokeDashoffset={slice.dashOffset} strokeWidth="12" strokeLinecap="round" />
                      ))}
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Spent</p>
                    <p className="text-2xl font-black">{formatCurrency(totalExpense)}</p>
                    <p className="text-[10px] text-indigo-500 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to expand</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">Add an expense to view chart.</div>
              )}
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}