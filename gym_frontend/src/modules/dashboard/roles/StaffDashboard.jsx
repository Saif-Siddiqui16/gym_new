import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import StatsCard from '../components/StatsCard';
import DashboardGrid from '../components/DashboardGrid';
import SectionHeader from '../components/SectionHeader';
import { DASHBOARD_DATA } from '../data/mockDashboardData';
import { CheckCircle, Clock, AlertTriangle, LayoutDashboard, UserCheck, Calendar, Activity, ChevronRight, Users } from 'lucide-react';
import Button from '../../../components/ui/Button';
import TodayFollowUps from '../../crm/pages/TodayFollowUps';
import RenewalAlertsWidget from '../../membership/components/RenewalAlertsWidget';
import { useNavigate } from 'react-router-dom';
import { KPIS } from '../../finance/data/mockFinance';
import { IndianRupee, Banknote, Receipt as ReceiptIcon } from 'lucide-react';
import LiveAccessControl from '../components/LiveAccessControl';
import OpenEquipmentIssues from '../../operations/components/widgets/OpenEquipmentIssues';
import { MAINTENANCE_TICKETS } from '../../operations/data/maintenanceData';
import apiClient from '../../../api/apiClient';

const INITIAL_STAFF_DATA = {
    stats: [
        { id: 1, title: 'Check-ins Today', value: '0', icon: CheckCircle, color: 'primary' },
        { id: 2, title: 'Pending Payments', value: '0', icon: IndianRupee, color: 'warning' },
        { id: 3, title: 'New Enquiries', value: '0', icon: Users, color: 'success' },
    ],
    checkins: [],
    activeUpdates: 0,
    todayShift: '...',
    assignedTasks: 0,
    highPriorityTasks: 0,
    upcomingClasses: 0,
    collectionToday: 0,
    pendingActions: []
};

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(INITIAL_STAFF_DATA);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await apiClient.get('/dashboard/staff');
                const apiData = response.data;
                setData(prev => ({
                    ...prev,
                    stats: [
                        { ...prev.stats[0], value: apiData.checkinsToday?.toString() || '0' },
                        { ...prev.stats[1], value: apiData.pendingPayments?.toString() || '0' },
                        { ...prev.stats[2], value: apiData.newEnquiries?.toString() || '0' }
                    ],
                    activeUpdates: apiData.activeUpdates,
                    todayShift: apiData.todayShift,
                    assignedTasks: apiData.assignedTasks,
                    highPriorityTasks: apiData.highPriorityTasks,
                    upcomingClasses: apiData.upcomingClasses,
                    collectionToday: apiData.collectionToday,
                    equipmentAlerts: apiData.equipmentAlerts,
                    pendingActions: apiData.pendingActions,
                    renewalAlerts: apiData.renewalAlerts,
                    checkins: apiData.checkins || prev.checkins
                }));
            } catch (error) {
                console.error('Failed to fetch staff dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Veriving Operational Protocols...</p>
                </div>
            </div>
        );
    }

    const enhancedStats = [
        {
            id: 1,
            label: 'Active Updates',
            value: data.activeUpdates !== undefined ? data.activeUpdates.toString() : '24',
            trend: '+12%',
            trendUp: true,
            icon: Activity,
            color: 'violet',
            gradient: 'from-violet-500 to-purple-600'
        },
        {
            id: 2,
            label: 'Today\'s Shift',
            value: data.todayShift || '09:00 - 17:00',
            subtext: 'Next: Tomorrow 09:00',
            icon: Clock,
            color: 'emerald',
            gradient: 'from-emerald-400 to-emerald-600'
        },
        {
            id: 3,
            label: 'Assigned Tasks',
            value: data.assignedTasks !== undefined ? data.assignedTasks.toString() : '5',
            subtext: `${data.highPriorityTasks !== undefined ? data.highPriorityTasks : '2'} High Priority`,
            icon: CheckCircle,
            color: 'amber',
            gradient: 'from-amber-400 to-orange-500'
        },
        {
            id: 4,
            label: 'Upcoming Classes',
            value: data.upcomingClasses !== undefined ? data.upcomingClasses.toString() : '3',
            subtext: 'Next in 45m',
            icon: Calendar,
            color: 'blue',
            gradient: 'from-blue-400 to-indigo-600'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 animate-fadeIn">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6 flex-shrink-0">
                                <LayoutDashboard size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Staff Dashboard
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse whitespace-nowrap">
                                        PREMIUM ✨
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">Overview of your daily tasks and gym activity</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => navigate('/staff/attendance/check-in')}
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:border-violet-500 hover:text-violet-600 hover:shadow-md transition-all duration-300"
                            >
                                <Clock size={18} strokeWidth={2.5} /> Clock In
                            </button>
                            <button
                                onClick={() => navigate('/staff/attendance/check-in')}
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-105 transition-all"
                            >
                                <UserCheck size={18} strokeWidth={2.5} /> Member Check-in
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {enhancedStats.map((stat) => (
                    <div key={stat.id} className="group relative bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:border-violet-100 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon size={24} strokeWidth={2.5} />
                                </div>
                                {stat.trend && (
                                    <span className={`flex items-center text-xs font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'} bg-${stat.trendUp ? 'emerald' : 'red'}-50 px-2 py-1 rounded-lg`}>
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                            <div className="text-2xl font-black text-slate-800 mb-1">{stat.value}</div>
                            {stat.subtext && <div className="text-xs font-medium text-slate-400">{stat.subtext}</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* LIVE ACCESS CONTROL MONITOR */}
            <LiveAccessControl userRole="STAFF" checkinsData={data.checkins} />

            {/* Secondary Content Grid - Refactored to balanced 2-column layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 auto-rows-min">
                {/* CRM Today's Follow-ups */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden h-fit">
                    <div className="p-6 border-b border-slate-100 bg-emerald-50/30 flex justify-between items-center">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Clock size={20} className="text-emerald-500" /> CRM Follow-ups
                        </h3>
                        <button
                            onClick={() => navigate('/crm/followups')}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                        >
                            View All
                        </button>
                    </div>
                    <div className="p-4">
                        <TodayFollowUps isWidget={true} />
                    </div>
                </div>

                {/* Equipment Alerts */}
                <OpenEquipmentIssues tickets={data.equipmentAlerts || []} />

                {/* My Collection Today Widget */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group h-fit">
                    <div className="absolute top-0 right-0 p-8 opacity-10 translate-x-1/4 -translate-y-1/4 group-hover:scale-125 transition-transform duration-700">
                        <Banknote size={150} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <IndianRupee size={24} />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-widest">My Collection Today</h3>
                        </div>
                        <div className="mb-4 sm:mb-8">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Total Received Today</p>
                            <h4 className="text-4xl sm:text-5xl font-black italic tracking-tighter">₹{data.collectionToday !== undefined ? data.collectionToday.toLocaleString() : '8,450'}</h4>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/finance/cashier')}
                                className="flex-1 py-4 bg-white text-emerald-700 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:shadow-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <ReceiptIcon size={18} />
                                New Receipt
                            </button>
                            <button
                                onClick={() => navigate('/finance/petty-cash')}
                                className="flex-1 py-4 bg-emerald-500 text-white border border-emerald-400 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Banknote size={18} />
                                Log Expense
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side Column: Renewal Alerts & Pending Actions inside the grid */}
                <div className="space-y-8">
                    <RenewalAlertsWidget alertsData={data.renewalAlerts} />

                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-amber-500" /> Pending Actions
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            {data.pendingActions && data.pendingActions.map((action, idx) => (
                                <div key={idx} className={`group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300 cursor-pointer ${action.type === 'Payment' ? 'hover:border-amber-300 hover:shadow-md' : 'hover:border-blue-300 hover:shadow-md'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${action.type === 'Payment' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {action.type === 'Payment' ? <Clock size={20} strokeWidth={2.5} /> : <UserCheck size={20} strokeWidth={2.5} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{action.title}</div>
                                            <div className="text-xs font-medium text-slate-500">{action.subtitle}</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}

                            {(!data.pendingActions || data.pendingActions.length === 0) && (
                                <div className="text-center py-4 text-slate-400 text-sm italic font-medium">No pending actions for now!</div>
                            )}

                            <button
                                onClick={() => navigate('/staff/tasks/my-tasks')}
                                className="w-full mt-2 py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-200 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-all"
                            >
                                View All Tasks
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
