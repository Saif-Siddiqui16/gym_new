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
    History
} from 'lucide-react';
import { DASHBOARD_DATA } from '../data/mockDashboardData';
import TodayFollowUps from '../../crm/pages/TodayFollowUps';
import RenewalAlertsWidget from '../../membership/components/RenewalAlertsWidget';
import { useNavigate } from 'react-router-dom';
// import { KPIS } from '../../finance/data/mockFinance';
import LiveAccessControl from '../components/LiveAccessControl';
import FacilityStatusOverview from '../../operations/components/widgets/FacilityStatusOverview';
import { EQUIPMENT_INVENTORY } from '../../operations/data/equipmentData';
import { fetchDashboardStats, fetchRecentActivities, fetchTrainerAvailability, fetchFinancialStats } from '../../../api/branchAdmin/branchAdminApi';

const BranchManagerDashboard = () => {
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

    const navigate = useNavigate();

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [statsData, activitiesData, trainersData, financialsData] = await Promise.all([
                    fetchDashboardStats(),
                    fetchRecentActivities(),
                    fetchTrainerAvailability(),
                    fetchFinancialStats()
                ]);

                // Map backend icon strings to actual Lucide components
                const mappedStats = statsData.stats.map(stat => ({
                    ...stat,
                    icon: stat.icon === 'Users' ? Users :
                        stat.icon === 'CheckCircle' ? CheckCircle :
                            stat.icon === 'DollarSign' ? IndianRupee : Users
                }));

                setStats(mappedStats);
                setRecentActivities(activitiesData);
                setTrainers(trainersData);
                setFinancials(financialsData);
                if (statsData.equipment) setEquipment(statsData.equipment);
                if (statsData.risks) setRisks(statsData.risks);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                // Fallback to mock data on error is handled by initial state
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Synchronizing Branch Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 md:p-6">
            {/* Premium Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                            <Activity size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                Branch Overview
                            </h1>
                            <p className="text-slate-600 text-sm mt-1">Real-time branch performance and activity monitoring</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    const gradientColors = [
                        'from-violet-500 to-purple-600',
                        'from-emerald-500 to-emerald-600',
                        'from-blue-500 to-blue-600',
                        'from-fuchsia-500 to-fuchsia-600'
                    ];

                    return (
                        <div
                            key={stat.id}
                            className="group relative bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Gradient Background on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-600 mb-2">{stat.title}</p>
                                    <h3 className="text-3xl font-black text-slate-900 mb-2">{stat.value}</h3>
                                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                        <TrendingUp size={14} className="text-emerald-500" />
                                        {stat.trend}
                                    </p>
                                </div>
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientColors[index % 4]} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                                    <Icon size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ACCESS CONTROL */}
            <div className="mb-10">
                <LiveAccessControl userRole="MANAGER" />
            </div>

            {/* Secondary Operations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                {/* Facility Status */}
                <FacilityStatusOverview equipment={equipment} />

                {/* Trainer Status */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 md:p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-600 shadow-md">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Trainer Status</h3>
                            <p className="text-xs text-slate-500">Current availability and sessions</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {trainers.map((trainer) => (
                            <div
                                key={trainer.id}
                                className="group flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-emerald-100/50 border border-slate-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-md"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${trainer.status === 'Available'
                                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                        : 'bg-gradient-to-br from-orange-500 to-orange-600'
                                        }`}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{trainer.name}</div>
                                        <div className="text-xs text-slate-500 font-medium">{trainer.specialty}</div>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm transition-all duration-300 hover:scale-105 ${trainer.status === 'Available'
                                    ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200'
                                    }`}>
                                    <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${trainer.status === 'Available' ? 'bg-emerald-500' : 'bg-orange-500'
                                        }`}></span>
                                    {trainer.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Financial Summary Section */}
            <div className="mt-8">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-[24px] md:rounded-[32px] p-4 md:p-6 border border-slate-100 shadow-xl flex items-center gap-4 md:gap-5 group hover:border-emerald-200 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Banknote size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Collection</p>
                            <h4 className="text-2xl font-black text-slate-800">₹{financials.collection.cash.toLocaleString()}</h4>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] md:rounded-[32px] p-4 md:p-6 border border-slate-100 shadow-xl flex items-center gap-4 md:gap-5 group hover:border-violet-200 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Smartphone size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPI / QR Sales</p>
                            <h4 className="text-2xl font-black text-slate-800">₹{financials.collection.upi.toLocaleString()}</h4>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] md:rounded-[32px] p-4 md:p-6 border border-slate-100 shadow-xl flex items-center gap-4 md:gap-5 group hover:border-blue-200 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Payments</p>
                            <h4 className="text-2xl font-black text-slate-800">₹{financials.collection.card.toLocaleString()}</h4>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[24px] md:rounded-[32px] p-4 md:p-6 shadow-xl flex items-center gap-4 md:gap-5 group hover:scale-[1.02] transition-all text-white border-2 border-slate-800">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:rotate-12 transition-transform">
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

            {/* Renewal Alerts Section */}
            <div className="mt-8">
                <RenewalAlertsWidget />
            </div>

            {/* CRM Follow-ups Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-emerald-50/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-600 shadow-md">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Branch Follow-ups Today</h3>
                            <p className="text-xs text-slate-500">Track all pending follow-ups for the branch</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/crm/followups')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                    >
                        View Full Pipeline <ChevronRight size={16} />
                    </button>
                </div>
                <div className="p-6">
                    <TodayFollowUps isWidget={true} />
                </div>
            </div>
        </div>
    );
};

export default BranchManagerDashboard;
