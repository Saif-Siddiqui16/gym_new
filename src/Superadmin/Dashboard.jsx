// 🔕 COMMENTED OUT: Unused / Legacy File
// Reason: Not imported or referenced anywhere in the active project
// Date: 2026-02-06
//
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Activity, TrendingUp, Building2, CreditCard, Plus, Settings, Zap, ChevronRight, BarChart3, Globe } from 'lucide-react';
import { fetchDashboardCards, fetchAllGyms } from '../api/superadmin/superAdminApi';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { title: 'Total Gyms', value: '0', change: '+0%', icon: Building2, bg: 'bg-violet-50', color: 'text-violet-600', trend: 'stable', path: '/superadmin/gyms/all' },
        { title: 'Active Subs', value: '0', change: '+0%', icon: CreditCard, bg: 'bg-emerald-50', color: 'text-emerald-600', trend: 'stable', path: '/superadmin/subscriptions/active' },
        { title: 'Platform Rev', value: '₹0', change: '+0%', icon: DollarSign, bg: 'bg-fuchsia-50', color: 'text-fuchsia-600', trend: 'stable', path: '/superadmin/payments/revenue' },
        { title: 'Growth Rate', value: '0%', change: '+0%', icon: Users, bg: 'bg-orange-50', color: 'text-orange-600', trend: 'stable', path: '/superadmin/gyms/all' }
    ]);
    const [recentGyms, setRecentGyms] = useState([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [cardsData, gymsData] = await Promise.all([
                    fetchDashboardCards(),
                    fetchAllGyms()
                ]);

                // Map API response to stats format
                // Expected API response: [{ title: 'Total Gyms', value: 5, trend: '+0%' }, ...]
                const newStats = [
                    {
                        title: 'Total Gyms',
                        value: cardsData.find(c => c.title === 'Total Gyms')?.value || '0',
                        change: cardsData.find(c => c.title === 'Total Gyms')?.trend || '+0%',
                        icon: Building2, bg: 'bg-violet-50', color: 'text-violet-600', trend: 'up', path: '/superadmin/gyms/all'
                    },
                    {
                        title: 'Active Subs',
                        value: cardsData.find(c => c.title === 'Active Subscriptions')?.value || '0',
                        change: cardsData.find(c => c.title === 'Active Subscriptions')?.trend || '+0%',
                        icon: CreditCard, bg: 'bg-emerald-50', color: 'text-emerald-600', trend: 'up', path: '/superadmin/subscriptions/active'
                    },
                    {
                        title: 'Platform Rev',
                        value: cardsData.find(c => c.title === 'Total Revenue')?.value || '₹0',
                        change: cardsData.find(c => c.title === 'Total Revenue')?.trend || '+0%',
                        icon: DollarSign, bg: 'bg-fuchsia-50', color: 'text-fuchsia-600', trend: 'up', path: '/superadmin/payments/revenue'
                    },
                    {
                        title: 'Growth Rate',
                        value: cardsData.find(c => c.title === 'Growth Rate')?.value || '0%',
                        change: cardsData.find(c => c.title === 'Growth Rate')?.trend || '+0%',
                        icon: Users, bg: 'bg-orange-50', color: 'text-orange-600', trend: 'stable', path: '/superadmin/gyms/all'
                    }
                ];
                setStats(newStats);

                // Format recent gyms
                const formattedGyms = gymsData.slice(0, 4).map(gym => ({
                    name: gym.gymName,
                    status: gym.status,
                    members: gym.members || 0,
                    plan: 'Standard', // API might not return plan yet, default to Standard
                    location: gym.location
                }));
                setRecentGyms(formattedGyms);

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-violet-600 animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans selection:bg-violet-100 selection:text-violet-700">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <div className="relative z-10 max-w-[1600px] mx-auto p-6 lg:p-10 space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-[10px] font-black uppercase tracking-widest">
                                Super Admin
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Overview</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2 max-w-lg">
                            Global view of all gym branches, revenue streams, and system health.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/superadmin/general-settings/general')}
                            className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                        >
                            <Settings size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/superadmin/gyms/add')}
                            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-1 transition-all active:translate-y-0"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Add Branch
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(stat.path)}
                            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                    <TrendingUp size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600">{stat.change}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.title}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Map / Chart Placeholder */}
                    <div className="lg:col-span-2 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col min-h-[400px]">
                        {/* Decor */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-fuchsia-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

                        <div className="relative z-10 flex justify-between items-start mb-12">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe className="text-slate-400" size={16} />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Activity</span>
                                </div>
                                <h3 className="text-2xl font-black tracking-tight">Real-time Revenue</h3>
                            </div>
                            <button
                                onClick={() => navigate('/superadmin/payments/revenue')}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-widest transition-colors backdrop-blur-md"
                            >
                                View Report
                            </button>
                        </div>

                        {/* Fake Chart Visualization */}
                        <div className="relative z-10 mt-auto flex items-end justify-between gap-2 h-40 px-4">
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                <div key={i} className="w-full bg-slate-800 rounded-t-lg relative group cursor-pointer hover:bg-slate-700 transition-colors" style={{ height: `${h}%` }}>
                                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-violet-600 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity h-full rounded-t-lg"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Gyms List */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900">Recent Branches</h3>
                            <button
                                onClick={() => navigate('/superadmin/gyms/all')}
                                className="text-violet-600 hover:bg-violet-50 p-2 rounded-xl transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                            {recentGyms.map((gym, idx) => (
                                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform ${gym.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                            gym.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {(gym.name || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">{gym.name}</h4>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5">{gym.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${gym.plan === 'Premium' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {gym.plan}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/superadmin/gyms/all')}
                            className="mt-auto w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                        >
                            View All Branches
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

