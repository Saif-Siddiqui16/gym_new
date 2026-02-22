// 🔕 COMMENTED OUT: Unused / Legacy File
// Reason: Not imported or referenced anywhere in the active project
// Date: 2026-02-06
//
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Activity, Calendar, CreditCard, Star, TrendingUp, Zap, ChevronRight, QrCode, ArrowUpRight, Dumbbell, Award } from 'lucide-react';
// import '../../styles/GlobalDesign.css';
//
// const MemberDashboard = () => {
//     const navigate = useNavigate();
//     const [scrolled, setScrolled] = useState(false);
//
//     // Add scroll listener for header effect if needed in future
//     // window.addEventListener('scroll', () => setScrolled(window.scrollY > 20));
//
//     return (
//         <div className="p-4 sm:p-6 lg:p-10 min-h-screen bg-slate-50 font-sans selection:bg-violet-100 selection:text-violet-700">
//             {/* Subtle Background Pattern */}
//             <div className={`fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`}></div>
//
//             <div className="relative z-10 max-w-7xl mx-auto space-y-12">
//                 {/* Modern Header */}
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//                     <div>
//                         <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-2">
//                             Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Vikram</span>
//                         </h1>
//                         <p className="text-slate-500 font-bold text-lg">Ready to crush your goals today?</p>
//                     </div>
//                     <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
//                         <div className="px-4 py-2 bg-slate-50 rounded-xl text-center">
//                             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Streak</p>
//                             <p className="text-xl font-black text-slate-900 flex items-center justify-center gap-1">
//                                 12 <span className="text-sm">🔥</span>
//                             </p>
//                         </div>
//                         <div className="h-8 w-px bg-slate-100"></div>
//                         <div className="px-4 py-2">
//                             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Rank</p>
//                             <p className="text-xl font-black text-slate-900 text-center">#42</p>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* Main Stats Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     <StatCard
//                         title="Workouts"
//                         value="18"
//                         target="24"
//                         unit="Sessions"
//                         icon={Dumbbell}
//                         color="violet"
//                         trend="+2 this week"
//                         onClick={() => navigate('/member/bookings')}
//                     />
//                     <StatCard
//                         title="Consistency"
//                         value="92%"
//                         target="100"
//                         unit="Attendance"
//                         icon={Activity}
//                         color="emerald"
//                         trend="Top 10%"
//                         onClick={() => navigate('/member/check-in')}
//                     />
//                     <StatCard
//                         title="Calories"
//                         value="12.4k"
//                         unit="Burned"
//                         icon={Zap}
//                         color="orange"
//                         trend="On Track"
//                     />
//                     <StatCard
//                         title="Rewards"
//                         value="2,450"
//                         unit="Points"
//                         icon={Award}
//                         color="fuchsia"
//                         highlight={true}
//                     />
//                 </div>
//
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
//                     {/* Upcoming Sessions - Glassmorphism & Interactive */}
//                     <div className="lg:col-span-2 space-y-8">
//                         <div className="flex items-center justify-between">
//                             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upcoming Sessions</h3>
//                             <button
//                                 onClick={() => navigate('/member/bookings')}
//                                 className="text-sm font-bold text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1"
//                             >
//                                 View Full Schedule <ChevronRight size={14} strokeWidth={3} />
//                             </button>
//                         </div>
//
//                         <div className="grid gap-4">
//                             <SessionCard
//                                 title="HIIT Crush"
//                                 time="06:00 PM Today"
//                                 trainer="Sarah Jenkins"
//                                 type="High Intensity"
//                                 status="Confirmed"
//                                 image="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=2670"
//                                 onClick={() => navigate('/member/bookings')}
//                             />
//                             <SessionCard
//                                 title="Yoga Flow"
//                                 time="07:00 AM Tomorrow"
//                                 trainer="Mike Ross"
//                                 type="Recovery"
//                                 status="Pending"
//                                 image="https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=2670"
//                                 onClick={() => navigate('/member/bookings')}
//                             />
//                         </div>
//
//                         {/* Quick Actions Grid */}
//                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
//                             <QuickAction icon={QrCode} label="Check In" color="bg-slate-900 text-white" onClick={() => navigate('/member/check-in')} />
//                             <QuickAction icon={Calendar} label="Book Class" color="bg-white text-slate-700 border border-slate-200 hover:border-violet-200" onClick={() => navigate('/member/bookings')} />
//                             <QuickAction icon={CreditCard} label="Payments" color="bg-white text-slate-700 border border-slate-200 hover:border-violet-200" onClick={() => navigate('/member/payments')} />
//                             <QuickAction icon={Star} label="Referrals" color="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white" onClick={() => navigate('/member/home')} />
//                         </div>
//                     </div>
//
//                     {/* Pro Membership Card */}
//                     <div className="relative overflow-hidden rounded-[40px] bg-slate-900 text-white p-8 flex flex-col justify-between shadow-2xl shadow-slate-200 h-full min-h-[400px] group">
//                         {/* Background Gradients */}
//                         <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
//                         <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
//
//                         <div className="relative z-10">
//                             <div className="flex justify-between items-start mb-8">
//                                 <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
//                                     <CreditCard className="text-white" size={24} />
//                                 </div>
//                                 <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-widest border border-emerald-500/30">Active</span>
//                             </div>
//
//                             <div>
//                                 <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Current Plan</p>
//                                 <h3 className="text-3xl font-black mb-2">Gold Member</h3>
//                                 <p className="text-slate-400 text-sm font-medium">Access to all gym areas, spa, and unlimited classes.</p>
//                             </div>
//                         </div>
//
//                         <div className="relative z-10 pt-8 border-t border-white/10 mt-8">
//                             <div className="flex justify-between items-end mb-4">
//                                 <div>
//                                     <p className="text-xs text-slate-400 font-bold uppercase mb-1">Renews In</p>
//                                     <p className="text-xl font-black">14 Days</p>
//                                 </div>
//                                 <button
//                                     onClick={() => navigate('/member/membership')}
//                                     className="p-3 rounded-full bg-white text-slate-900 hover:bg-violet-50 transition-colors"
//                                 >
//                                     <ArrowUpRight size={20} strokeWidth={3} />
//                                 </button>
//                             </div>
//                             <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
//                                 <div className="bg-gradient-to-r from-violet-400 to-fuchsia-400 h-full w-[65%] rounded-full"></div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// // --- Sub Components ---
//
// const StatCard = ({ title, value, unit, icon: Icon, color, target, highlight, trend, onClick }) => {
//     const variants = {
//         violet: 'bg-violet-50 text-violet-600 ring-violet-100',
//         emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
//         orange: 'bg-orange-50 text-orange-600 ring-orange-100',
//         fuchsia: 'bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100',
//     };
//
//     return (
//         <div
//             onClick={onClick}
//             className={`p-6 rounded-[32px] border ${highlight ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100'} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''}`}
//         >
//             <div className="flex justify-between items-start mb-4">
//                 <div className={`p-3.5 rounded-2xl ${highlight ? 'bg-white/10 text-white' : variants[color]}`}>
//                     <Icon size={22} strokeWidth={2.5} />
//                 </div>
//                 {trend && (
//                     <span className={`text-[10px] font-black uppercase tracking-wider py-1 px-2 rounded-lg ${highlight ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>
//                         {trend}
//                     </span>
//                 )}
//             </div>
//             <div>
//                 <h3 className={`text-3xl font-black tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
//                 <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${highlight ? 'text-slate-400' : 'text-slate-400'}`}>{title}</p>
//             </div>
//             {target && !highlight && (
//                 <div className="mt-4 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
//                     <div
//                         className={`h-full rounded-full ${color === 'violet' ? 'bg-violet-500' : 'bg-emerald-500'}`}
//                         style={{ width: `${(parseInt(value) / parseInt(target)) * 100}%` }}
//                     ></div>
//                 </div>
//             )}
//         </div>
//     );
// };
//
// const SessionCard = ({ title, time, trainer, type, status, image, onClick }) => {
//     return (
//         <div className="group flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-[24px] border border-slate-100 hover:border-violet-100 hover:shadow-lg transition-all duration-300">
//             <div className="w-full sm:w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative">
//                 <img src={image} alt={title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
//                 <div className="absolute inset-0 bg-violet-600/10 group-hover:bg-transparent transition-all"></div>
//             </div>
//
//             <div className="flex-1 w-full text-center sm:text-left">
//                 <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-1">
//                     <h4 className="text-lg font-black text-slate-800">{title}</h4>
//                     <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
//                         {status}
//                     </span>
//                 </div>
//                 <p className="text-sm font-bold text-slate-500 mb-2">{time}</p>
//                 <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-400">
//                     <span className="flex items-center gap-1"><Zap size={12} /> {type}</span>
//                     <span className="flex items-center gap-1"><Activity size={12} /> {trainer}</span>
//                 </div>
//             </div>
//
//             <button
//                 onClick={onClick}
//                 className="w-full sm:w-auto p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-violet-600 group-hover:text-white transition-all"
//             >
//                 <ChevronRight size={20} />
//             </button>
//         </div>
//     );
// }
//
// const QuickAction = ({ icon: Icon, label, color, onClick }) => (
//     <button
//         onClick={onClick}
//         className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[24px] transition-all hover:-translate-y-1 active:scale-95 shadow-sm hover:shadow-lg ${color}`}
//     >
//         <Icon size={24} strokeWidth={2.5} />
//         <span className="text-xs font-black uppercase tracking-widest">{label}</span>
//     </button>
// );
//
// export default MemberDashboard;
