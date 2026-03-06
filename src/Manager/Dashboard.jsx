// 🔕 COMMENTED OUT: Unused / Legacy File
// Reason: Not imported or referenced anywhere in the active project
// Date: 2026-02-06
//
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Users, DollarSign, Activity, TrendingUp, Calendar, CreditCard, Plus, CheckCircle2, AlertCircle, Clock, MoreVertical, Search, Filter, Zap, ChevronRight, LayoutDashboard } from 'lucide-react';
// import { fetchBranchDashboardCards, fetchLiveEntryLogs } from '../api/manager/branchAdminApi';
//
// const Dashboard = () => {
//     const navigate = useNavigate();
//     const [stats, setStats] = useState([]);
//     const [recentActivity, setRecentActivity] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [userRole, setUserRole] = useState('manager');
//
//
//     const [isSearchOpen, setIsSearchOpen] = useState(false);
//     const [isFilterOpen, setIsFilterOpen] = useState(false);
//     const [filterType, setFilterType] = useState('all'); // 'all', 'issues', 'success'
//
//     const handleCalendarClick = () => {
//         if (userRole === 'trainer') {
//             navigate('/trainer/sessions/calendar');
//         } else if (userRole === 'staff') {
//             // Staff might not have a calendar, keeping default or redirecting to dashboard check-in
//             navigate('/staff/attendance/today');
//         } else {
//             // Manager and Branch Admin
//             navigate('/manager/bookings/calendar');
//         }
//     };
//
//     const handleViewHistory = () => {
//         const base = userRole === 'branchadmin' ? '/branchadmin' :
//             userRole === 'staff' ? '/staff' :
//                 userRole === 'trainer' ? '/trainer' : '/manager';
//
//         if (userRole === 'staff') {
//             navigate('/staff/attendance/today');
//         } else if (userRole === 'trainer') {
//             navigate('/trainer/attendance/history');
//         } else {
//             navigate(`${base}/attendance/live-checkin`);
//         }
//     };
//
//     const handleViewReports = () => {
//         const base = userRole === 'branchadmin' ? '/branchadmin' :
//             userRole === 'staff' ? '/staff' : '/manager';
//         navigate(`${base}/reports/daily-attendance`);
//     };
//
//     useEffect(() => {
//         const role = (localStorage.getItem('userRole') || 'manager').toLowerCase();
//         setUserRole(role);
//
//         const loadDashboardData = async () => {
//             setLoading(true);
//             try {
//                 // Simulating slightly different data based on role if needed in future
//                 const [cardsData, logsData] = await Promise.all([
//                     fetchBranchDashboardCards(),
//                     fetchLiveEntryLogs()
//                 ]);
//
//                 // Defensive check: ensure data is array
//                 const validCardsData = Array.isArray(cardsData) ? cardsData : [];
//                 const validLogsData = Array.isArray(logsData) ? logsData : [];
//
//                 // Map API icons string to Lucide components
//                 const iconMap = {
//                     'users': Users,
//                     'file-text': CreditCard,
//                     'dollar-sign': DollarSign,
//                     'activity': Activity,
//                     'trending-up': TrendingUp
//                 };
//
//                 const mappedStats = validCardsData.map(stat => ({
//                     ...stat,
//                     icon: iconMap[stat.icon] || Activity,
//                     bg: stat.color === 'blue' ? 'bg-indigo-50' :
//                         stat.color === 'green' ? 'bg-emerald-50' :
//                             stat.color === 'purple' ? 'bg-violet-50' : 'bg-amber-50',
//                     color: stat.color === 'blue' ? 'text-indigo-600' :
//                         stat.color === 'green' ? 'text-emerald-600' :
//                             stat.color === 'purple' ? 'text-violet-600' : 'text-amber-600'
//                 }));
//
//                 setStats(mappedStats);
//                 setRecentActivity(validLogsData);
//             } catch (error) {
//                 console.error("Failed to load dashboard data:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         loadDashboardData();
//     }, []);
//
//     const getRoleBadgeColor = () => {
//         switch (userRole) {
//             case 'staff': return 'bg-blue-100 text-blue-700 border-blue-200';
//             case 'trainer': return 'bg-orange-100 text-orange-700 border-orange-200';
//             default: return 'bg-violet-100 text-violet-700 border-violet-200';
//         }
//     };
//
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-[400px]">
//                 <div className="relative">
//                     <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-violet-600 animate-spin"></div>
//                     <div className="absolute inset-0 flex items-center justify-center">
//                         <Zap size={16} className="text-violet-600 animate-pulse" />
//                     </div>
//                 </div>
//             </div>
//         );
//     }
//
//
//
//     // Stats with navigation mapping
//     const getStatPath = (title) => {
//         const base = userRole === 'branchadmin' ? '/branchadmin' :
//             userRole === 'staff' ? '/staff' :
//                 userRole === 'trainer' ? '/trainer' : '/manager';
//
//         if (userRole === 'staff') {
//             switch (title) {
//                 case 'Total Members': return '/staff/members/lookup';
//                 case 'Active Plans': return '/staff/members/status';
//                 case 'Revenue (M)': return '/staff/reports/booking';
//                 case 'Check-ins': return '/staff/attendance/today';
//                 default: return '/staff/dashboard';
//             }
//         }
//
//         if (userRole === 'trainer') {
//             switch (title) {
//                 case 'Total Members': return '/trainer/members/assigned';
//                 case 'Active Plans': return '/trainer/members/assigned';
//                 case 'Revenue (M)': return '/trainer/attendance/history';
//                 case 'Check-ins': return '/trainer/attendance/history';
//                 default: return '/trainer/dashboard';
//             }
//         }
//
//         switch (title) {
//             case 'Total Members': return `${base}/members/list`;
//             case 'Active Plans': return `${base}/members/status`;
//             case 'Revenue (M)': return `${base}/reports/booking`;
//             case 'Check-ins': return `${base}/attendance/live-checkin`;
//             default: return `${base}/dashboard`;
//         }
//     };
//
//     return (
//         <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-10 font-sans selection:bg-violet-100">
//             <div className="max-w-[1600px] mx-auto space-y-10">
//                 {/* Modern Header */}
//                 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
//                     <div className="space-y-2">
//                         <div className={`flex items-center gap-2 px-3 py-1 w-fit rounded-full text-[10px] font-black uppercase tracking-widest border ${getRoleBadgeColor()}`}>
//                             <LayoutDashboard size={10} className="fill-current" /> {userRole} Portal
//                         </div>
//                         <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
//                             Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-400">Overview</span>
//                         </h1>
//                         <p className="text-slate-500 font-medium text-sm sm:text-base max-w-xl">
//                             Welcome back. Here's what's happening at your branch today.
//                         </p>
//                     </div>
//                     <div className="flex items-center gap-3 w-full sm:w-auto">
//                         {/* Search Bar */}
//                         <div className={`hidden sm:flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64' : 'w-auto'}`}>
//                             <div className={`relative w-full flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ${isSearchOpen ? 'px-3' : 'p-0 border-none shadow-none bg-transparent'}`}>
//                                 {isSearchOpen && (
//                                     <input
//                                         type="text"
//                                         placeholder="Search..."
//                                         className="w-full py-3 pr-2 bg-transparent text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none"
//                                         autoFocus
//                                         onBlur={() => setIsSearchOpen(false)}
//                                     />
//                                 )}
//                                 <button
//                                     onClick={() => setIsSearchOpen(!isSearchOpen)}
//                                     className={`p-4 ${!isSearchOpen ? 'bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm transition-all hover:shadow-md active:scale-95' : 'text-slate-400 hover:text-slate-600'}`}
//                                 >
//                                     <Search size={20} />
//                                 </button>
//                             </div>
//                         </div>
//
//                         <button
//                             onClick={handleCalendarClick}
//                             className="hidden sm:flex p-4 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm transition-all hover:shadow-md active:scale-95"
//                             title="View Calendar"
//                         >
//                             <Calendar size={20} />
//                         </button>
//                         {userRole !== 'staff' && (
//                             <button
//                                 onClick={() => {
//                                     const path = userRole === 'manager' ? '/manager/members/list' :
//                                         userRole === 'staff' ? '/staff/members/lookup' :
//                                             '/branchadmin/members/list';
//                                     navigate(`${path}?add=true`);
//                                 }}
//                                 className="flex-1 sm:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-1 transition-all active:translate-y-0 flex items-center justify-center gap-3"
//                             >
//                                 <Plus size={20} strokeWidth={3} /> New Member
//                             </button>
//                         )}
//                     </div>
//                 </div>
//
//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
//                     {Array.isArray(stats) && stats.map((stat, idx) => (
//                         <div
//                             key={idx}
//                             onClick={() => navigate(getStatPath(stat.title))}
//                             className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden cursor-pointer"
//                         >
//                             <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full -mr-10 -mt-10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
//                             <div className="relative z-10 flex flex-col h-full justify-between gap-4">
//                                 <div className="flex justify-between items-start">
//                                     <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
//                                         <stat.icon size={22} strokeWidth={2.5} />
//                                     </div>
//                                     <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
//                                         <TrendingUp size={12} className="text-emerald-600" />
//                                         <span className="text-[10px] font-black text-emerald-600">{stat.change}</span>
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
//                                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.title}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* Live Entry Logs - Now visually richer */}
//                     <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
//                         <div className="p-8 pb-0 flex justify-between items-center">
//                             <div>
//                                 <h3 className="text-xl font-black text-slate-900">Live Activity Feed</h3>
//                                 <p className="text-xs text-emerald-600 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
//                                     <span className="relative flex h-2 w-2">
//                                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//                                         <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
//                                     </span>
//                                     Real-time Updates
//                                 </p>
//                             </div>
//                             <div className="relative">
//                                 <button
//                                     onClick={() => setIsFilterOpen(!isFilterOpen)}
//                                     className={`text-slate-400 hover:text-slate-600 transition-colors ${isFilterOpen ? 'text-slate-600' : ''}`}
//                                 >
//                                     <Filter size={18} />
//                                 </button>
//                                 {isFilterOpen && (
//                                     <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-20 py-2">
//                                         <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Feed</div>
//                                         <button
//                                             onClick={() => { setFilterType('all'); setIsFilterOpen(false); }}
//                                             className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${filterType === 'all' ? 'text-violet-600 bg-violet-50' : 'text-slate-600'}`}
//                                         >
//                                             Show All
//                                         </button>
//                                         <button
//                                             onClick={() => { setFilterType('issues'); setIsFilterOpen(false); }}
//                                             className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${filterType === 'issues' ? 'text-rose-600 bg-rose-50' : 'text-slate-600'}`}
//                                         >
//                                             Issues Only
//                                         </button>
//                                         <button
//                                             onClick={() => { setFilterType('success'); setIsFilterOpen(false); }}
//                                             className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${filterType === 'success' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600'}`}
//                                         >
//                                             Successful
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//
//                         <div className="p-8 space-y-8 max-h-[400px] overflow-y-auto">
//                             {Array.isArray(recentActivity) && recentActivity
//                                 .filter(item => {
//                                     if (!item) return false;
//                                     if (filterType === 'all') return true;
//                                     if (filterType === 'issues') return item.status !== 'Approved' && item.status !== 'Completed';
//                                     if (filterType === 'success') return item.status === 'Approved' || item.status === 'Completed';
//                                     return true;
//                                 })
//                                 .map((item, idx) => (
//                                     <div key={idx} className="flex gap-5 group">
//                                         <div className="flex flex-col items-center">
//                                             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-110 z-10
//                                             ${item.status === 'Approved' || item.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
//                                                 {(item.status === 'Approved' || item.status === 'Completed') ? <CheckCircle2 size={18} strokeWidth={3} /> : <AlertCircle size={18} strokeWidth={3} />}
//                                             </div>
//                                             {idx !== recentActivity.length - 1 && (
//                                                 <div className="h-full w-0.5 bg-slate-100 my-2 group-hover:bg-slate-200 transition-colors"></div>
//                                             )}
//                                         </div>
//                                         <div className="flex-1 pb-2">
//                                             <div className="flex justify-between items-start">
//                                                 <div>
//                                                     <h4 className="text-sm font-black text-slate-800">{item.member || item.user}</h4>
//                                                     <p className="text-sm font-medium text-slate-500 mt-0.5">{item.action || (item.door ? `Accessed ${item.door}` : 'Entry Logged')}</p>
//                                                 </div>
//                                                 <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg tabular-nums">
//                                                     {item.time}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                         </div>
//                         <div className="mt-auto p-4 bg-slate-50/50 border-t border-slate-100">
//                             <button onClick={handleViewHistory} className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center gap-2">
//                                 View Full History <ChevronRight size={14} />
//                             </button>
//                         </div>
//                     </div>
//
//                     {/* Quick Stats / Revenue Placeholder to match design */}
//                     <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[400px]">
//                         <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 rounded-full blur-[100px] opacity-40 -mr-20 -mt-20"></div>
//                         <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-40 -ml-20 -mb-20"></div>
//
//                         <div className="relative z-10">
//                             <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
//                                 <Activity className="text-violet-400" />
//                             </div>
//                             <h3 className="text-2xl font-black tracking-tight mb-2">Today's <br />Performance</h3>
//                             <p className="text-slate-400 text-sm font-medium">Daily revenue target is 85% achieved. Keep pushing!</p>
//                         </div>
//
//                         <div className="relative z-10 mt-8 space-y-4">
//                             <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
//                                 <div className="flex justify-between text-sm mb-2">
//                                     <span className="font-bold text-slate-300">Revenue</span>
//                                     <span className="font-black text-white">$1,240</span>
//                                 </div>
//                                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
//                                     <div className="bg-violet-500 h-full w-[85%] rounded-full"></div>
//                                 </div>
//                             </div>
//                             <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
//                                 <div className="flex justify-between text-sm mb-2">
//                                     <span className="font-bold text-slate-300">Check-ins</span>
//                                     <span className="font-black text-white">142</span>
//                                 </div>
//                                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
//                                     <div className="bg-emerald-500 h-full w-[65%] rounded-full"></div>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <button
//                             onClick={handleViewReports}
//                             className="relative z-10 w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
//                         >
//                             View Reports
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default Dashboard;
