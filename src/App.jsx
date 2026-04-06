import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, TrendingDown, Trash2, Plus, 
  Moon, Sun, Search, PieChart, Info, 
  CheckCircle2, IndianRupee, Lock, User, LogOut, 
  ArrowRight, KeyRound, UserPlus, ShieldCheck, Filter,
  Activity, ChevronUp, ChevronDown, AlertCircle
} from 'lucide-react';

export default function FinanceApp() {
  // --- 1. AUTH & SESSION STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('fin_active_v8') === 'true');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('fin_user_v8')) || null);
  const [authPage, setAuthPage] = useState('login'); // login | register
  
  const [authForm, setAuthForm] = useState({ id: '', pass: '', name: '', role: 'viewer' });
  const [error, setError] = useState('');
  const [notif, setNotif] = useState(null);

  // --- 2. DATA STATE ---
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('fin_ledger_v8');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: '2026-04-01', description: 'Consulting Project', amount: 120000, category: 'Freelance', type: 'income' },
      { id: 2, date: '2026-04-02', description: 'Office Rent', amount: 35000, category: 'Rent', type: 'expense' },
      { id: 3, date: '2026-04-03', description: 'Cloud Servers', amount: 8000, category: 'Tech', type: 'expense' },
      { id: 4, date: '2026-04-05', description: 'Grocery - Blinkit', amount: 1200, category: 'Food', type: 'expense' },
      { id: 5, date: '2026-04-06', description: 'Dividend Payout', amount: 15000, category: 'Investment', type: 'income' },
    ];
  });

  // --- 3. UI & FILTER STATE ---
  const [darkMode, setDarkMode] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [sortDir, setSortDir] = useState('desc'); // desc | asc
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  
  const [newEntry, setNewEntry] = useState({ description: '', amount: '', category: 'Food', type: 'expense', date: new Date().toISOString().split('T')[0] });

  // --- EFFECT: PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('fin_ledger_v8', JSON.stringify(transactions));
    localStorage.setItem('fin_active_v8', isLoggedIn);
    localStorage.setItem('fin_user_v8', JSON.stringify(user));
  }, [transactions, isLoggedIn, user]);

  useEffect(() => {
    if (notif) { const t = setTimeout(() => setNotif(null), 3000); return () => clearTimeout(t); }
  }, [notif]);

  // --- HANDLER: AUTHENTICATION ---
  const handleAuth = (e) => {
    e.preventDefault();
    setError('');
    const userRegistry = JSON.parse(localStorage.getItem('fin_registry_v8') || '[]');

    if (authPage === 'register') {
      if (userRegistry.find(u => u.id === authForm.id)) return setError('ID already exists. Try another.');
      const newUser = { ...authForm, pass: btoa(authForm.pass) }; // Base64 Obfuscation
      localStorage.setItem('fin_registry_v8', JSON.stringify([...userRegistry, newUser]));
      setNotif('Registry Updated. Log in now.');
      setAuthPage('login');
      setAuthForm({ id: '', pass: '', name: '', role: 'viewer' });
    } else {
      const match = userRegistry.find(u => u.id === authForm.id && u.pass === btoa(authForm.pass));
      if (match) {
        setUser(match);
        setIsLoggedIn(true);
        setNotif(`System Access: ${match.name}`);
      } else {
        setError('Credentials Invalid.');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('fin_active_v8');
  };

  // --- LOGIC: ADVANCED FILTERING ---
  const processedData = useMemo(() => {
    return transactions
      .filter(t => {
        const sMatch = t.description.toLowerCase().includes(search.toLowerCase());
        const cMatch = catFilter === 'All' || t.category === catFilter;
        const minMatch = minAmt === '' || t.amount >= parseFloat(minAmt);
        const maxMatch = maxAmt === '' || t.amount <= parseFloat(maxAmt);
        return sMatch && cMatch && minMatch && maxMatch;
      })
      .sort((a, b) => sortDir === 'desc' ? b.amount - a.amount : a.amount - b.amount);
  }, [transactions, search, catFilter, sortDir, minAmt, maxAmt]);

  // --- LOGIC: PIE CHART DATA ---
  const { incTotal, expTotal, balance, pieSlices } = useMemo(() => {
    let i = 0, e = 0;
    const cMap = {};
    transactions.forEach(t => {
      const val = parseFloat(t.amount);
      if (t.type === 'income') i += val;
      else { e += val; cMap[t.category] = (cMap[t.category] || 0) + val; }
    });
    return { 
      incTotal: i, expTotal: e, balance: i - e,
      pieSlices: Object.entries(cMap).map(([name, value]) => ({ name, value }))
    };
  }, [transactions]);

  // --- COMPONENT: INTERACTIVE PIE CHART ---
  const PieChartComp = () => {
    let currentOffset = 0;
    const palette = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];
    return (
      <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
        <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
          {pieSlices.map((slice, idx) => {
            const ratio = (slice.value / expTotal) * 100;
            const strokeDash = `${ratio} ${100 - ratio}`;
            const offset = -currentOffset;
            currentOffset += ratio;
            return (
              <circle key={slice.name} r="16" cx="16" cy="16" fill="transparent"
                stroke={palette[idx % 5]} strokeWidth="12" strokeDasharray={strokeDash} strokeDashoffset={offset}
                className="transition-all duration-700 hover:opacity-70 cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Total Spend</span>
          <span className="text-xs font-black">₹{expTotal.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          /* --- MODULE 1: AUTHENTICATION --- */
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center min-h-screen p-4">
            <div className={`w-full max-w-md p-10 rounded-[3rem] border shadow-2xl ${darkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-600/40">
                  {authPage === 'register' ? <UserPlus className="text-white" /> : <Lock className="text-white" />}
                </div>
                <h1 className="text-2xl font-black tracking-tighter uppercase">Nexus Finance</h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Protocol: {authPage}</p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authPage === 'register' && (
                  <input required placeholder="Full Name" value={authForm.name} className={`w-full p-4 rounded-2xl outline-none text-sm ${darkMode ? 'bg-black/30' : 'bg-slate-100'}`} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                )}
                <input required placeholder="Custom ID" value={authForm.id} className={`w-full p-4 rounded-2xl outline-none text-sm ${darkMode ? 'bg-black/30' : 'bg-slate-100'}`} onChange={e => setAuthForm({...authForm, id: e.target.value})} />
                <input required type="password" placeholder="Password" value={authForm.pass} className={`w-full p-4 rounded-2xl outline-none text-sm ${darkMode ? 'bg-black/30' : 'bg-slate-100'}`} onChange={e => setAuthForm({...authForm, pass: e.target.value})} />
                
                {authPage === 'register' && (
                  <select className={`w-full p-4 rounded-2xl outline-none text-sm font-bold uppercase ${darkMode ? 'bg-black/30' : 'bg-slate-100'}`} onChange={e => setAuthForm({...authForm, role: e.target.value})}>
                    <option value="viewer">Viewer Mode</option>
                    <option value="admin">Admin Mode</option>
                  </select>
                )}

                {error && <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</div>}
                
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-lg transition-all tracking-widest uppercase text-xs">
                  {authPage === 'login' ? 'Authorize Access' : 'Create Credentials'}
                </button>
              </form>

              <button onClick={() => { setAuthPage(authPage === 'login' ? 'register' : 'login'); setError(''); }} className="w-full mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {authPage === 'login' ? "Don't have an ID? Register" : "Have an ID? Login"}
              </button>
            </div>
          </motion.div>
        ) : (
          /* --- MODULE 2: DASHBOARD --- */
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* NOTIF BAR */}
            <AnimatePresence>{notif && (
                <motion.div initial={{ y: -60 }} animate={{ y: 20 }} exit={{ y: -60 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black shadow-2xl">
                  {notif}
                </motion.div>
            )}</AnimatePresence>

            <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl h-20 flex items-center px-8 justify-between ${darkMode ? 'bg-slate-950/50 border-white/5' : 'bg-white/80 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><IndianRupee className="text-white" size={20}/></div>
                <h1 className="text-xl font-black tracking-tighter">FINANCE.IO</h1>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl bg-white/5">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase">{user.name}</p>
                  <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500"><LogOut size={18}/></button>
              </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* ANALYTICS (LEFT) */}
              <div className="lg:col-span-4 space-y-6">
                <div className={`p-8 rounded-[3rem] border ${darkMode ? 'bg-white/5 border-white/5 shadow-2xl' : 'bg-white shadow-xl'}`}>
                  <h3 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-2"><PieChart size={16} className="text-indigo-500"/> Allocation</h3>
                  <PieChartComp />
                  <div className="mt-8 space-y-3">
                    {pieSlices.map((s, i) => (
                      <div key={s.name} className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="flex items-center gap-2 opacity-60">
                           <div className="w-2 h-2 rounded-full" style={{background: ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'][i%5]}}/> {s.name}
                        </span>
                        <span>₹{s.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-[3rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Net Wealth</p>
                  <p className="text-4xl font-black mt-1 tabular-nums">₹{balance.toLocaleString()}</p>
                  <div className="mt-8 flex justify-between border-t border-white/10 pt-6 uppercase font-black tracking-tighter">
                    <div><p className="text-[9px] opacity-60">Revenue</p><p className="text-emerald-300">₹{incTotal.toLocaleString()}</p></div>
                    <div><p className="text-[9px] opacity-60">Expenses</p><p className="text-rose-300">₹{expTotal.toLocaleString()}</p></div>
                  </div>
                </div>
              </div>

              {/* DATA MANAGEMENT (RIGHT) */}
              <div className="lg:col-span-8 space-y-6">
                {/* ADVANCED TOOLBAR */}
                <div className={`p-6 rounded-[2.5rem] border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white shadow-sm'}`}>
                  <div className="relative lg:col-span-1">
                    <Search className="absolute left-4 top-3 text-slate-500" size={14}/>
                    <input placeholder="Search ledger..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/20 outline-none text-xs" onChange={e => setSearch(e.target.value)} />
                  </div>
                  <select className="bg-black/20 p-2.5 rounded-xl text-[10px] font-black uppercase outline-none" onChange={e => setCatFilter(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="Food">Food</option><option value="Tech">Tech</option><option value="Freelance">Freelance</option><option value="Investment">Investment</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min ₹" className="w-full bg-black/20 p-2.5 rounded-xl text-[10px] outline-none" onChange={e => setMinAmt(e.target.value)} />
                    <input type="number" placeholder="Max ₹" className="w-full bg-black/20 p-2.5 rounded-xl text-[10px] outline-none" onChange={e => setMaxAmt(e.target.value)} />
                  </div>
                  <button onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')} className="bg-white/5 p-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                    {sortDir === 'desc' ? <ChevronDown size={14}/> : <ChevronUp size={14}/>} Sort by Amt
                  </button>
                </div>

                {/* LEDGER TABLE */}
                <div className={`rounded-[2.5rem] border overflow-hidden ${darkMode ? 'bg-white/5 border-white/5 shadow-2xl' : 'bg-white shadow-sm'}`}>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <tr><th className="p-6">Description</th><th className="p-6 text-right">Value (INR)</th>{user.role === 'admin' && <th className="p-6 text-center">Delete</th>}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <AnimatePresence mode="popLayout">
                        {processedData.map(tx => (
                          <motion.tr layout key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-white/5 ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {tx.type === 'income' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                                </div>
                                <div><p className="font-bold text-xs">{tx.description}</p><p className="text-[9px] text-slate-500 font-black uppercase">{tx.category} • {tx.date}</p></div>
                              </div>
                            </td>
                            <td className={`p-6 text-right font-black tabular-nums ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>₹{tx.amount.toLocaleString()}</td>
                            {user.role === 'admin' && (
                              <td className="p-6 text-center">
                                <button onClick={() => setTransactions(transactions.filter(t => t.id !== tx.id))} className="text-rose-500 p-2 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                              </td>
                            )}
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  {processedData.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center opacity-30">
                      <AlertCircle size={32} className="mb-2"/>
                      <p className="text-[10px] font-black uppercase tracking-widest">No matching ledger entries</p>
                    </div>
                  )}
                </div>

                {/* ADMIN PRIVILEGES: ADD ENTRY */}
                {user.role === 'admin' ? (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`p-8 rounded-[3rem] border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white shadow-sm'}`}>
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2"><Plus className="text-indigo-500"/> Update Ledger</h3>
                    <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={e => {
                      e.preventDefault();
                      setTransactions([{ ...newEntry, id: Date.now(), amount: parseFloat(newEntry.amount) }, ...transactions]);
                      setNotif('Ledger Updated');
                    }}>
                      <input required placeholder="Description" className="md:col-span-2 p-4 rounded-2xl bg-black/30 outline-none text-xs" onChange={e => setNewEntry({...newEntry, description: e.target.value})} />
                      <input required type="number" placeholder="Amount ₹" className="p-4 rounded-2xl bg-black/30 outline-none text-xs" onChange={e => setNewEntry({...newEntry, amount: e.target.value})} />
                      <button type="submit" className="bg-indigo-600 text-white font-black rounded-2xl text-[10px] tracking-widest uppercase hover:bg-indigo-700 transition-all">Submit</button>
                    </form>
                  </motion.div>
                ) : (
                  <div className="p-12 rounded-[3rem] border border-dashed border-slate-800 text-center flex flex-col items-center">
                    <ShieldCheck size={32} className="text-slate-800 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-60 text-center">Restricted Access: Viewer Mode<br/>Creation & Deletion privileges disabled</p>
                  </div>
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}