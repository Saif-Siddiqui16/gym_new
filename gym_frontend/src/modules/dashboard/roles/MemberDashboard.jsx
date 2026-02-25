import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import StatsCard from '../components/StatsCard';
import DashboardGrid from '../components/DashboardGrid';
import BenefitWalletWidget from '../components/BenefitWalletWidget';
import { DASHBOARD_DATA } from '../data/mockDashboardData';
import { Trophy, ArrowRight, Calendar, Clock, Zap, Target, ShoppingBag, Sparkles, ChevronRight, Activity, CheckCircle, TrendingUp } from 'lucide-react';
import apiClient from '../../../api/apiClient';

const CircularProgress = ({ progress, size = 60, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center p-1 bg-white rounded-full shadow-inner" style={{ width: size + 8, height: size + 8 }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-slate-100"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="text-violet-600 transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ filter: 'drop-shadow(0 0 4px rgba(124, 58, 237, 0.3))' }}
                />
            </svg>
            <span className="absolute text-[10px] font-black text-slate-900 tracking-tighter">{Math.round(progress)}%</span>
        </div>
    );
};

const INITIAL_MEMBER_DATA = {
    stats: [
        { id: 1, title: 'My Plan', value: '...', icon: CheckCircle, color: 'primary' },
        { id: 2, title: 'Next Class', value: '...', icon: Calendar, color: 'success' },
        { id: 3, title: 'Attendance', value: '0%', icon: TrendingUp, color: 'success' },
    ],
    planSummary: {
        workoutsCompleted: 0,
        totalWorkouts: 0,
        nextGoal: '...',
        membershipStatus: '...',
        expiryDate: '...',
        daysRemaining: 0
    },
    announcements: [],
    benefitWallet: { benefits: [] }
};

const MemberDashboard = () => {
    const [data, setData] = useState(INITIAL_MEMBER_DATA);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await apiClient.get('/dashboard/member');
                const apiData = response.data;
                setData(prev => ({
                    ...prev,
                    stats: [
                        { ...prev.stats[0], value: apiData.planName },
                        { ...prev.stats[1], value: apiData.nextClass },
                        { ...prev.stats[2], value: apiData.attendanceRate }
                    ],
                    planSummary: apiData.planSummary,
                    announcements: apiData.announcements,
                    benefitWallet: apiData.benefitWallet
                }));
            } catch (error) {
                console.error('Failed to fetch member dashboard:', error);
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
                    <p className="text-slate-500 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Retrieving Your Performance Data...</p>
                </div>
            </div>
        );
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="fade-in space-y-6 max-w-7xl mx-auto pb-12 px-4 md:px-6">
            {/* Premium Header */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl blur-3xl opacity-5 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-violet-200 transition-all duration-300 hover:scale-110 hover:rotate-6">
                            <Zap size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">System Access / <span className="text-violet-600">Member</span></h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} className="text-violet-500" />
                                Operational Intelligence Overview
                            </p>
                        </div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
                        <Calendar size={16} className="text-violet-600" />
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{today}</span>
                    </div>
                </div>
            </div>

            {/* Row 1: Core Metrics (3 Cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* My Benefits (220px) */}
                <BenefitWalletWidget walletData={data.benefitWallet} />

                {/* Progress Snapshot (220px) */}
                <Card className="p-6 border border-slate-100 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-slate-50/50 to-white h-[220px] flex flex-col justify-between overflow-hidden group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-1 text-emerald-600">Progress Snapshot</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Week</p>
                        </div>
                        <CircularProgress progress={(data.planSummary.workoutsCompleted / data.planSummary.totalWorkouts) * 100} size={50} />
                    </div>

                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Weekly Goal</p>
                        <div className="text-2xl font-black text-slate-900 leading-none flex items-baseline gap-1">
                            <span className="text-emerald-600">{data.planSummary.workoutsCompleted}</span>
                            <span className="text-slate-300 text-sm font-bold">/ {data.planSummary.totalWorkouts}</span>
                            <span className="text-[10px] text-slate-400 uppercase ml-2 tracking-widest">Sessions</span>
                        </div>
                    </div>

                    <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:translate-x-2 transition-transform inline-flex items-center gap-1.5 mt-auto">
                        GO TO PERFORMANCE LAB <ChevronRight size={14} strokeWidth={3} />
                    </button>
                </Card>

                {/* Quick Info (Membership) (220px) */}
                <Card className="p-6 border border-slate-100 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-slate-50/50 to-white h-[220px] flex flex-col justify-between overflow-hidden group">
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                            <h3 className="text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] text-fuchsia-600">Membership Status</h3>
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase shadow-sm ${data.planSummary.membershipStatus === 'Active' ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700' : 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700'}`}>
                                {data.planSummary.membershipStatus}
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Active Tier</p>
                                <p className="text-sm font-black text-slate-900 leading-none uppercase italic">{data.stats[0].value}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">System Status</p>
                                <p className="text-sm font-black text-fuchsia-600 leading-none">{data.planSummary.daysRemaining} Days Remaining</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-slate-50">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate italic">Subscription Expires: {data.planSummary.expiryDate}</p>
                    </div>
                </Card>
            </div>

            {/* Row 2: Secondary Metrics (3 Cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Weekly Goal Card */}
                <Card className="p-5 border border-slate-100 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-violet-50/50 to-white flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6">
                        <Trophy size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Weekly Target</h4>
                        <div className="text-base font-black text-slate-900 leading-none">{data.planSummary.workoutsCompleted} / {data.planSummary.totalWorkouts} sessions</div>
                    </div>
                </Card>

                {/* Last Order Card */}
                <Card className="p-5 border border-slate-100 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-fuchsia-50/50 to-white flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6">
                        <ShoppingBag size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Supply Node</h4>
                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                            <span className="text-base font-black text-slate-900 truncate shrink uppercase italic">{data.announcements[0]?.title.split(' ')[0]} ...</span>
                            <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 text-[9px] font-black text-emerald-700 uppercase shadow-sm whitespace-nowrap">SHIPPED</span>
                        </div>
                    </div>
                </Card>

                {/* Focus Card */}
                <Card className="p-5 border border-slate-100 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-amber-50/50 to-white flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6">
                        <Target size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Primary Focus</h4>
                        <div className="text-base font-black text-slate-900 truncate uppercase italic">{data.planSummary.nextGoal}</div>
                    </div>
                </Card>
            </div>


            {/* Row 3: Announcements (Full Width) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <div className="w-5 h-[2px] bg-amber-500"></div>
                        Operational Broadcasts
                    </h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {data.announcements.map((ann, idx) => (
                        <Card key={idx} className="p-5 border border-slate-100 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50 flex items-center justify-between gap-4 group">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl text-amber-600 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    <Sparkles size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 leading-none mb-1.5">{ann.date}</h4>
                                    <p className="text-base font-black text-slate-900 leading-tight uppercase italic">{ann.title}</p>
                                </div>
                            </div>
                            <button className="p-3 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                                <ChevronRight size={22} strokeWidth={4} />
                            </button>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
