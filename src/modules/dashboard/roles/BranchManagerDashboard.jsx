import React, { useState, useEffect } from 'react';
import {
    User,
    Clock,
    CheckCircle,
    Users,
    DollarSign,
    TrendingUp,
    Activity,
    ChevronRight,
    IndianRupee,
    CreditCard,
    Smartphone,
    Banknote,
    ShieldAlert,
    Zap,
    XOctagon,
    Package,
    ShoppingBag,
    Star,
    Calendar,
    UserPlus
} from 'lucide-react';
import RenewalAlertsWidget from '../../membership/components/RenewalAlertsWidget';
import TodayFollowUpsWidget from '../../crm/components/TodayFollowUpsWidget';
import { useNavigate } from 'react-router-dom';
import LiveAccessControl from '../components/LiveAccessControl';
import FacilityStatusOverview from '../../operations/components/widgets/FacilityStatusOverview';
import StatsCard from '../components/StatsCard';
import SmartAIoTSummary from '../components/SmartAIoTSummary';
import { EQUIPMENT_INVENTORY } from '../../operations/data/equipmentData';
import { fetchDashboardStats, fetchRecentActivities, fetchTrainerAvailability, fetchFinancialStats } from '../../../api/branchAdmin/branchAdminApi';
import { useBranchContext } from '../../../context/BranchContext';

const BranchManagerDashboard = () => {
    const { selectedBranch, branches } = useBranchContext();
    const [stats, setStats] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [financials, setFinancials] = useState({
        collection: { cash: 0, upi: 0, card: 0 },
        expenses: { today: 0 }
    });
    const [equipment, setEquipment] = useState([]);
    const [risks, setRisks] = useState({ defaulters: 0, expiringSoon: 0, manualOverrides: 0 });
    const [loading, setLoading] = useState(true);
    const [revenueOverview, setRevenueOverview] = useState([]);
    const [weeklyAttendance, setWeeklyAttendance] = useState([]);
    const [receivables, setReceivables] = useState(0);
    const [membershipDistribution, setMembershipDistribution] = useState([]);
    const [liveOccupancy, setLiveOccupancy] = useState({ current: 0, capacity: 50 });
    const [checkInsByHour, setCheckInsByHour] = useState([]);
    const [extraStats, setExtraStats] = useState({
        newLeads: 0,
        todaysClasses: 0,
        pendingApprovals: 0,
        netProfit: 0,
        storeSales: 0,
        feedbacks: [],
        taskStats: { pending: 0, inProgress: 0, completed: 0, approved: 0, overdue: 0 }
    });

    const activeBranch = branches.find(b => b.id.toString() === selectedBranch.toString());
    const welcomeTitle = activeBranch ? `Welcome back, ${activeBranch.branchName || activeBranch.name}!` : 'Welcome back, All Branches!';

    const navigate = useNavigate();

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const [statsData, activitiesData, trainersData, financialsData] = await Promise.all([
                    fetchDashboardStats(selectedBranch),
                    fetchRecentActivities(selectedBranch),
                    fetchTrainerAvailability(selectedBranch),
                    fetchFinancialStats(selectedBranch)
                ]);

                const mappedStats = statsData.stats.map(stat => ({
                    ...stat,
                    icon: stat.icon === 'Users' ? Users :
                        stat.icon === 'CheckCircle' ? CheckCircle :
                        stat.icon === 'ShoppingBag' ? ShoppingBag :
                        stat.icon === 'DollarSign' ? IndianRupee : Users
                }));

                setStats(mappedStats);
                setRecentActivities(activitiesData);
                setTrainers(trainersData);
                setFinancials(financialsData);
                if (statsData.equipment) setEquipment(statsData.equipment);
                if (statsData.risks) setRisks(statsData.risks);
                if (statsData.revenueOverview) setRevenueOverview(statsData.revenueOverview);
                if (statsData.weeklyAttendance) setWeeklyAttendance(statsData.weeklyAttendance);
                if (statsData.receivables !== undefined) setReceivables(statsData.receivables);
                if (statsData.membershipDistribution) setMembershipDistribution(statsData.membershipDistribution);
                if (statsData.liveOccupancy) setLiveOccupancy(statsData.liveOccupancy);
                if (statsData.checkInsByHour) setCheckInsByHour(statsData.checkInsByHour);

                setExtraStats({
                    newLeads: statsData.newLeads || 0,
                    todaysClasses: statsData.todaysClasses || 0,
                    pendingApprovals: statsData.pendingApprovals || 0,
                    netProfit: statsData.netProfit || 0,
                    storeSales: statsData.storeSales || 0,
                    feedbacks: statsData.recentFeedback || [],
                    taskStats: statsData.taskStats || { pending: 0, inProgress: 0, completed: 0, approved: 0, overdue: 0 }
                });
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [selectedBranch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center ">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Synchronizing Branch Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="saas-page pb-page animate-fadeIn">
            {/* Premium Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg transition-transform duration-300">
                            <Activity size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">
                                {welcomeTitle}
                            </h1>
                            <p className="text-slate-600 text-sm mt-1">Here's what's happening at your gym today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gym Health Section */}
            <div className="mb-6">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Gym Health Section</h3>
                <p className="text-xs font-semibold text-slate-500">Real-time overview of your business</p>
            </div>

            {/* Top Statistic Cards — Row 1: Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                {stats.map((stat, i) => (
                    <StatsCard
                        key={stat.id || i}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon || Users}
                        trend={stat.trend}
                        trendDirection={stat.trend?.includes('+') || stat.trend?.includes('up') || stat.trend === 'Live' ? 'up' : 'down'}
                        color={stat.color || 'primary'}
                    />
                ))}
            </div>

            {/* Secondary KPI Cards — Row 2: Analytics Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    title="Net Profit (Store)"
                    value={`₹${(extraStats.netProfit || 0).toLocaleString()}`}
                    icon={TrendingUp}
                    subtitle="Sale – Cost Price"
                    trend="Monthly"
                    trendDirection="up"
                    color="success"
                />
                <StatsCard
                    title="New Leads"
                    value={extraStats.newLeads.toString()}
                    subtitle="This month"
                    icon={UserPlus}
                    color="primary"
                />
                <StatsCard
                    title="Today's Classes"
                    value={extraStats.todaysClasses.toString()}
                    subtitle="Scheduled"
                    icon={Calendar}
                    color="warning"
                />
                <StatsCard
                    title="Pending Approvals"
                    value={extraStats.pendingApprovals.toString()}
                    subtitle="Review pending"
                    icon={ShieldAlert}
                    color="danger"
                />
            </div>

            {/* Operational Task Performance (New) */}
            <div className="mb-8 bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                        <Activity size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-800 tracking-tight">OPERATIONAL TASK PERFORMANCE</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time Task Lifecycle Tracking</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Pending</p>
                        <h4 className="text-2xl font-black text-slate-800">{extraStats.taskStats.pending}</h4>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-amber-500">
                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">In Progress</p>
                        <h4 className="text-2xl font-black text-slate-800">{extraStats.taskStats.inProgress}</h4>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-emerald-500">
                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Completed</p>
                        <h4 className="text-2xl font-black text-slate-800">{extraStats.taskStats.completed}</h4>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-violet-500">
                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Approved</p>
                        <h4 className="text-2xl font-black text-slate-800">{extraStats.taskStats.approved}</h4>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-red-500">
                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Overdue</p>
                        <h4 className="text-2xl font-black text-red-600">{extraStats.taskStats.overdue}</h4>
                    </div>
                </div>
            </div>


            {/* ─── Smart AIoT Access Control (same as Admin) ─── */}
            <SmartAIoTSummary />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Revenue Overview Chart */}
                <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <Activity className="text-primary" size={18} />
                        Revenue Overview
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Last 6 months</p>
                    <div className="flex items-end gap-2 border-b border-slate-100" style={{ height: '160px', paddingBottom: '0' }}>
                        {revenueOverview.length > 0 ? revenueOverview.map((item, i) => {
                            const maxValue = Math.max(...revenueOverview.map(r => r.value), 1);
                            const pct = maxValue > 0 ? Math.max((item.value / maxValue) * 100, item.value > 0 ? 6 : 2) : 2;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group/bar cursor-pointer" style={{ paddingBottom: '24px' }}>
                                    {/* Amount label */}
                                    {item.value > 0 && (
                                        <span className="text-[9px] font-black text-primary mb-0.5 leading-none">
                                            ₹{item.value >= 1000 ? (item.value / 1000).toFixed(1) + 'k' : item.value}
                                        </span>
                                    )}
                                    {/* Bar */}
                                    <div
                                        className={`w-full rounded-t-md transition-all duration-700 ${item.value > 0
                                            ? 'bg-gradient-to-t from-primary to-purple-400'
                                            : 'bg-slate-100'
                                            }`}
                                        style={{ height: `${pct}%` }}
                                    />
                                    {/* Month */}
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{item.month}</span>
                                </div>
                            );
                        }) : (
                            <div className="w-full flex items-center justify-center text-slate-300 italic text-sm">No revenue data</div>
                        )}
                    </div>
                </div>

                {/* Weekly Attendance Chart */}
                <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <Clock className="text-emerald-600" size={18} />
                        Weekly Attendance
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Last 7 days</p>
                    <div className="flex items-end gap-2 border-b border-slate-100" style={{ height: '160px' }}>
                        {weeklyAttendance.length > 0 ? weeklyAttendance.map((item, i) => {
                            const maxCount = Math.max(...weeklyAttendance.map(a => a.count), 1);
                            const pct = maxCount > 0 ? Math.max((item.count / maxCount) * 100, item.count > 0 ? 6 : 2) : 2;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group/bar cursor-pointer" style={{ paddingBottom: '24px' }}>
                                    {/* Count label */}
                                    {item.count > 0 && (
                                        <span className="text-[9px] font-black text-emerald-600 mb-0.5 leading-none">
                                            {item.count}
                                        </span>
                                    )}
                                    {/* Bar */}
                                    <div
                                        className={`w-full rounded-t-md transition-all duration-700 ${item.count > 0
                                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                                            : 'bg-slate-100'
                                            }`}
                                        style={{ height: `${pct}%` }}
                                    />
                                    {/* Day */}
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{item.day}</span>
                                </div>
                            );
                        }) : (
                            <div className="w-full flex items-center justify-center text-slate-300 italic text-sm">No attendance data</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Live Occupancy */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-primary flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Live Occupancy</h3>
                    </div>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl">
                        <h4 className="text-4xl font-black text-slate-900 mb-2">{liveOccupancy.current} of {liveOccupancy.capacity}</h4>
                        <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">Capacity</p>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
                            <div
                                className="bg-primary h-full transition-all duration-500"
                                style={{ width: `${Math.min((liveOccupancy.current / liveOccupancy.capacity) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-lg font-black text-primary">{Math.round((liveOccupancy.current / liveOccupancy.capacity) * 100)}% Full</p>
                    </div>
                </div>

                <TodayFollowUpsWidget />

                {/* Today's Check-ins by Hour */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Today's Check-ins by Hour</h3>
                    </div>
                    {checkInsByHour.length > 0 && checkInsByHour.some(h => h.count > 0) ? (
                        <div className="flex-1 flex items-end gap-1 overflow-x-auto pb-6 border-b border-slate-100" style={{ minHeight: '120px' }}>
                            {checkInsByHour.map((h, i) => {
                                const maxCount = Math.max(...checkInsByHour.map(x => x.count), 1);
                                const heightPct = (h.count / maxCount) * 100;
                                return (
                                    <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0 group/bar">
                                        <div className="relative w-full flex items-end" style={{ height: '80px' }}>
                                            <div
                                                className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-orange-500 to-amber-400 transition-all duration-500"
                                                style={{ height: `${Math.max(heightPct, h.count > 0 ? 8 : 2)}%` }}
                                            >
                                                {h.count > 0 && (
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        {h.count}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate w-full text-center">{h.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                <Activity size={32} />
                            </div>
                            <p className="text-slate-500 font-bold text-sm tracking-tight italic">No check-ins recorded today</p>
                        </div>
                    )}
                </div>

                {/* Accounts Receivable */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <IndianRupee size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Accounts Receivable</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                            <h4 className="text-2xl font-black text-slate-900">₹{receivables.toLocaleString()}</h4>
                        </div>
                        <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                            {receivables > 0 ? (
                                <p className="text-amber-600 font-bold text-sm italic">Pending payments found</p>
                            ) : (
                                <p className="text-slate-400 font-bold text-sm italic">No pending dues</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Expiring in Next 7 Days */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                            <Zap size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Expiring in Next 7 Days</h3>
                    </div>
                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                        {risks.expiringSoon > 0 ? (
                            <>
                                <h4 className="text-4xl font-black text-rose-600 mb-2">{risks.expiringSoon}</h4>
                                <p className="text-slate-500 font-black text-xs uppercase tracking-widest italic text-center">Memberships expiring soon</p>
                                <button
                                    onClick={() => navigate('/members?filter=expiring')}
                                    className="mt-4 px-5 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-200 flex items-center gap-2"
                                >
                                    <ChevronRight size={14} /> View Members
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                                    <ShieldAlert size={24} />
                                </div>
                                <p className="text-slate-500 font-black text-xs uppercase tracking-widest italic text-center">No memberships expiring soon</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Membership Distribution */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-primary flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Membership Status</h3>
                    </div>
                    <div className="flex flex-col gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        {membershipDistribution.length > 0 ? membershipDistribution.map((d, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{d.status}</span>
                                <span className="bg-white px-3 py-1 rounded-lg text-sm font-black text-slate-800 shadow-sm border border-slate-100">
                                    {d._count.id}
                                </span>
                            </div>
                        )) : (
                            <p className="text-slate-400 text-xs font-semibold text-center py-4">No membership data</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Live Access Feed */}
                <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-primary flex items-center justify-center">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Live Access Feed</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Real-time gym entrance logs</p>
                        </div>
                    </div>
                    <div className="min-h-[200px] flex flex-col gap-3">
                        {recentActivities.length > 0 ? recentActivities.map((act) => (
                            <div key={act.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-violet-200 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{act.member}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{act.action}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-400">{act.time}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                <p className="text-slate-500 font-black text-base mb-2 italic">No access events yet</p>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Events will appear here in real-time</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Member Voice */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 text-primary flex items-center justify-center">
                                <Users size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Member Voice</h3>
                        </div>
                        <button onClick={() => navigate('/operations/feedback')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-hover transition-colors bg-primary-light px-3 py-1.5 rounded-lg">
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {extraStats.feedbacks.length > 0 ? extraStats.feedbacks.map((fb) => (
                            <div key={fb.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-primary font-black text-[10px] overflow-hidden">
                                        {fb.avatar ? <img src={fb.avatar} alt="" className="w-full h-full object-cover" /> : fb.memberName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">{fb.memberName}</p>
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={8} className={i < fb.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(fb.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 line-clamp-2 italic leading-relaxed">"{fb.comment}"</p>
                            </div>
                        )) : (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-slate-500 font-bold text-sm italic">No feedback yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 
            <div className="mt-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Daily Collection Summary</h3>
                        <p className="text-xs font-semibold text-slate-500 italic">Real-time revenue tracking for today</p>
                    </div>
                    <button
                        onClick={() => navigate('/finance/cashier')}
                        className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
                    >
                        <IndianRupee size={16} />
                        Receive Payment
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-[24px]  border border-slate-100 shadow-xl flex items-center gap-4 transition-all duration-200 md:hover:shadow-2xl md:hover:-translate-y-0.5 group">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center transition-transform">
                            <Banknote size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Collection</p>
                            <h4 className="text-2xl font-black text-slate-800">₹{financials.collection.cash.toLocaleString()}</h4>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px]  border border-slate-100 shadow-xl flex items-center gap-4 transition-all duration-200 md:hover:shadow-2xl md:hover:-translate-y-0.5 group">
                        <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center transition-transform">
                            <Smartphone size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPI / QR Sales</p>
                            <h4 className="text-2xl font-black text-slate-800">₹{financials.collection.upi.toLocaleString()}</h4>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px]  border border-slate-100 shadow-xl flex items-center gap-4 transition-all duration-200 md:hover:shadow-2xl md:hover:-translate-y-0.5 group">
                        <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center transition-transform">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Payments</p>
                            <h4 className="text-2xl font-black text-slate-800">₹{financials.collection.card.toLocaleString()}</h4>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[24px]  shadow-xl flex items-center gap-4 transition-all duration-200 md:hover:shadow-2xl md:hover:-translate-y-0.5 group text-white border-2 border-slate-800">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform">
                            <IndianRupee size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Net Revenue Today</p>
                            <h4 className="text-2xl font-black italic">
                                ₹{(financials.collection.cash + financials.collection.upi + financials.collection.card - financials.expenses.today).toLocaleString()}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
            */}

            {/* SAFELY COMMENTED OUT PREVIOUS CONTENT */}
            {/* 
            <div className="mt-12 pt-8 border-t border-slate-200 opacity-20 pointer-events-none hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-600 mb-2">{stat.title}</p>
                                        <h3 className="text-3xl font-black text-slate-900 mb-2">{stat.value}</h3>
                                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                            <TrendingUp size={14} className="text-emerald-500" />
                                            {stat.trend}
                                        </p>
                                    </div>
                                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-lg">
                                        <Icon size={24} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-[32px] p-6 border-b-4 border-rose-500 shadow-xl flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <XOctagon size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Defaulter Check-ins</p>
                            <h4 className="text-2xl font-black text-slate-800">{risks.defaulters}</h4>
                        </div>
                    </div>
                    <div className="bg-white rounded-[32px] p-6 border-b-4 border-amber-500 shadow-xl flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Zap size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiring Soon</p>
                            <h4 className="text-2xl font-black text-slate-800">{risks.expiringSoon}</h4>
                        </div>
                    </div>
                </div>
                <LiveAccessControl userRole="MANAGER" />
                <FacilityStatusOverview equipment={equipment} />
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Users size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Trainer Status</h3>
                    </div>
                    <div className="space-y-4">
                        {trainers.map((trainer) => (
                            <div key={trainer.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{trainer.name}</div>
                                        <div className="text-xs text-slate-500 font-medium">{trainer.specialty}</div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${trainer.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {trainer.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <Banknote size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Collection</p>
                            <h4 className="text-2xl font-black text-slate-800">₹{financials.collection.cash.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
                <RenewalAlertsWidget />
                <div className="p-6">
                    <TodayFollowUps isWidget={true} />
                </div>
            </div>
            */}
        </div>
    );
};

export default BranchManagerDashboard;

