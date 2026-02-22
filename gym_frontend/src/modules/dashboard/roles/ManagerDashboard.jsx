import React, { useEffect, useState } from 'react';
import { Clock, Users, Dumbbell, AlertTriangle, Bell, ArrowRight, IndianRupee, Wallet, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import StatsCard from '../components/StatsCard';
import DashboardGrid from '../components/DashboardGrid';
import SectionHeader from '../components/SectionHeader';
import { DASHBOARD_DATA } from '../data/mockDashboardData';
import { KPIS } from '../../finance/data/mockFinance';
import FacilityStatusOverview from '../../operations/components/widgets/FacilityStatusOverview';
import { EQUIPMENT_INVENTORY } from '../../operations/data/equipmentData';
import apiClient from '../../../api/apiClient';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(DASHBOARD_DATA.MANAGER);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await apiClient.get('/dashboard/manager');
                const apiData = response.data;
                setData(prev => ({
                    ...prev,
                    stats: [
                        { ...prev.stats[0], value: apiData.activeMembers.toString() },
                        { ...prev.stats[1], value: apiData.classesToday.toString() },
                        { ...prev.stats[2], value: apiData.paymentsDue.toString() }
                    ],
                    attendance: apiData.attendance || prev.attendance
                }));
            } catch (error) {
                console.error('Failed to fetch manager dashboard:', error);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="fade-in">
            <h2 className="text-title" style={{ marginBottom: 'var(--space-4)' }}>Manager Dashboard</h2>

            {/* Financial Overview Section (New for RBAC Alignment) */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <IndianRupee size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Revenue Protection Today</h3>
                    </div>
                    <button
                        onClick={() => navigate('/finance/transactions')}
                        className="text-[10px] font-black text-violet-600 hover:text-violet-700 flex items-center gap-1 uppercase tracking-widest bg-violet-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                        View Audit Log <ArrowRight size={10} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Collection Widget */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:bg-emerald-100/50 transition-colors"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Today's Collection</p>
                            <h4 className="text-2xl font-black text-slate-800 flex items-center gap-1">
                                <span className="text-emerald-500 font-bold">₹</span>
                                {KPIS.collection.today.toLocaleString()}
                            </h4>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md flex items-center gap-1">
                                    <TrendingUp size={10} /> Healthy
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 italic">Cash + Digital</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Dues Widget */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:bg-amber-100/50 transition-colors"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Pending Dues</p>
                            <h4 className="text-2xl font-black text-slate-800 flex items-center gap-1">
                                <span className="text-amber-500 font-bold">₹</span>
                                {KPIS.dues.total.toLocaleString()}
                            </h4>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black rounded-md">
                                    {KPIS.dues.count} Members
                                </span>
                                <button onClick={() => navigate('/finance/invoices')} className="text-[9px] font-black text-violet-600 underline">Send Reminders</button>
                            </div>
                        </div>
                    </div>

                    {/* Petty Cash Widget */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:bg-blue-100/50 transition-colors"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Local Expenses</p>
                            <h4 className="text-2xl font-black text-slate-800 flex items-center gap-1">
                                <span className="text-blue-500 font-bold">₹</span>
                                {KPIS.expenses.today.toLocaleString()}
                            </h4>
                            <div className="mt-2 flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/finance/petty-cash')}
                                    className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg hover:bg-black transition-all"
                                >
                                    Log Expense
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DashboardGrid>
                {data.stats.map(stat => <StatsCard key={stat.id} {...stat} />)}
            </DashboardGrid>

            {/* Facility Status Section */}
            <div className="mt-8">
                <FacilityStatusOverview equipment={EQUIPMENT_INVENTORY} />
            </div>

            {/* Today's Classes & Tasks Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">

                {/* Today's Classes & Attendance */}
                <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    {/* Premium Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 via-purple-50/20 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                                    <Dumbbell size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <h3 className="text-base sm:text-lg font-black text-slate-900">Today's Classes</h3>
                                        <span className="px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[9px] sm:text-[10px] font-black rounded sm:rounded-md shadow-sm animate-pulse whitespace-nowrap">
                                            PREMIUM ✨
                                        </span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Scheduled classes and capacity</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/manager/classes/schedule')}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/60 hover:scale-105 transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
                            >
                                View Schedule <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {data.attendance.map((cls, index) => {
                                const percentage = (cls.attendees / cls.capacity) * 100;
                                const colors = [
                                    { gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', bgColor: 'from-violet-50 to-purple-50' },
                                    { gradient: 'from-orange-500 via-red-500 to-pink-500', bgColor: 'from-orange-50 to-red-50' }
                                ];
                                const colorScheme = colors[index % 2];

                                return (
                                    <div
                                        key={cls.id}
                                        className="group/class relative p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-50/80 to-white border-2 border-slate-100 hover:border-violet-300 transition-all duration-300 hover:shadow-xl overflow-hidden"
                                    >
                                        {/* Gradient Overlay on Hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bgColor} opacity-0 group-hover/class:opacity-100 transition-opacity duration-300`}></div>

                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover/class:scale-110 group-hover/class:rotate-12`}>
                                                        <Dumbbell size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 text-sm sm:text-base">{cls.name}</div>
                                                        <div className="text-[10px] sm:text-xs text-slate-500 font-bold flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
                                                            <Clock size={12} className="text-violet-500 sm:w-[13px] sm:h-[13px]" />
                                                            {cls.time}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r ${colorScheme.gradient} text-white text-[10px] sm:text-xs font-black shadow-lg`}>
                                                    {cls.attendees} / {cls.capacity}
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 sm:space-y-2">
                                                <div className="w-full bg-slate-200 h-2.5 sm:h-3 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className={`bg-gradient-to-r ${colorScheme.gradient} h-full rounded-full transition-all duration-700 shadow-lg relative overflow-hidden`}
                                                        style={{ width: `${percentage}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] sm:text-xs text-slate-600 font-bold">{percentage.toFixed(0)}% Capacity</p>
                                                    <span className={`text-[10px] sm:text-xs font-black ${percentage >= 90 ? 'text-red-600' : percentage >= 70 ? 'text-orange-600' : 'text-emerald-600'}`}>
                                                        {percentage >= 90 ? 'Almost Full' : percentage >= 70 ? 'Filling Fast' : 'Available'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tasks & Notices */}
                <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    {/* Premium Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-red-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                                    <Bell size={20} className="sm:w-[22px] sm:h-[22px] animate-pulse" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <h3 className="text-base sm:text-lg font-black text-slate-900">Tasks & Notices</h3>
                                        <span className="px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[9px] sm:text-[10px] font-black rounded sm:rounded-md shadow-sm animate-pulse whitespace-nowrap">
                                            PREMIUM ✨
                                        </span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Important updates and reminders</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-black shadow-lg shadow-red-500/50">
                                    2 Pending
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {/* Equipment Service Notice */}
                            <div className="group/task relative p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-50 via-red-50/50 to-white border-l-4 border-red-500 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                {/* Animated Gradient Background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-transparent opacity-0 group-hover/task:opacity-100 transition-opacity duration-300"></div>

                                <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center text-white shadow-xl transition-all duration-300 group-hover/task:scale-110 group-hover/task:rotate-12">
                                        <AlertTriangle size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                                            <h4 className="font-black text-red-900 text-sm sm:text-base">Equipment Service Due</h4>
                                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black shadow-lg">
                                                Urgent
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-red-800 font-semibold mb-2 sm:mb-3">Treadmill #4 needs maintenance by Friday.</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/80 backdrop-blur-sm rounded-md sm:rounded-lg border border-red-200">
                                                <Clock size={12} className="text-red-500 sm:w-[13px] sm:h-[13px]" />
                                                <span className="text-[10px] sm:text-xs text-red-700 font-bold">Due: Friday</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Staff Meeting Notice */}
                            <div className="group/task relative p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-50 via-blue-50/50 to-white border-l-4 border-blue-500 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                {/* Animated Gradient Background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-transparent opacity-0 group-hover/task:opacity-100 transition-opacity duration-300"></div>

                                <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center text-white shadow-xl transition-all duration-300 group-hover/task:scale-110 group-hover/task:rotate-12">
                                        <Users size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                                            <h4 className="font-black text-blue-900 text-sm sm:text-base">Staff Meeting</h4>
                                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black shadow-lg">
                                                Today
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-blue-800 font-semibold mb-2 sm:mb-3">Monthly review meeting at 3 PM today.</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/80 backdrop-blur-sm rounded-md sm:rounded-lg border border-blue-200">
                                                <Clock size={12} className="text-blue-500 sm:w-[13px] sm:h-[13px]" />
                                                <span className="text-[10px] sm:text-xs text-blue-700 font-bold">3:00 PM</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100">
                            <button
                                onClick={() => navigate('/manager/tasks')}
                                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-105 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                View All Tasks <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
