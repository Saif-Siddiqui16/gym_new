import React, { useState, useEffect } from 'react';
import { Search, Clock, Users, UserCheck, Activity, Sparkles } from 'lucide-react';
import MobileCard from '../../components/common/MobileCard';
import { getCheckIns, getAttendanceStats } from '../../api/manager/managerApi';
import './TailwindFallback.css';

const LiveCheckInMonitor = () => {
    const [checkIns, setCheckIns] = useState([]);
    const [stats, setStats] = useState({ currentlyIn: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
        // Simulate "Live" by polling every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        const [checkInData, statData] = await Promise.all([
            getCheckIns({ limit: 10 }),
            getAttendanceStats()
        ]);
        setCheckIns(checkInData.data);
        setStats(statData);
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        return status === 'checked-in' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Checked In
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-400 to-slate-500 text-white text-xs font-black shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer">
                Checked Out
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6 flex-shrink-0">
                                <Activity size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Live Monitor
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse whitespace-nowrap">
                                        PREMIUM ✨
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">Real-time gym entry and exit logs</p>
                            </div>
                        </div>

                        {/* Currently In Stat Card */}
                        <div className="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 px-5 sm:px-6 py-4 rounded-2xl shadow-xl shadow-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/60 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden w-full lg:w-auto">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    <Users size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <span className="block text-[10px] sm:text-xs text-white/80 font-bold uppercase tracking-wider">Currently In</span>
                                    <span className="block text-2xl sm:text-3xl font-black text-white">{stats.currentlyIn}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Activity Table */}
            <div className="group relative bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-500 transform hover:-translate-y-1">
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                    {/* Table Header */}
                    <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider">Latest Activity</h2>
                        </div>
                        <span className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer w-full sm:w-auto justify-center">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            Live Feed
                        </span>
                    </div>

                    {/* Desktop Table View (Hidden on Mobile) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Name</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Type</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Time</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                                                <span className="font-semibold">Monitoring live feed...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : checkIns.length > 0 ? (
                                    checkIns.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="group/row hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 transition-all duration-300 cursor-pointer hover:shadow-md"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-md transition-all duration-500 group-hover/row:scale-125 group-hover/row:bg-gradient-to-br group-hover/row:from-violet-500 group-hover/row:to-purple-600 group-hover/row:text-white group-hover/row:shadow-xl group-hover/row:rotate-6">
                                                        {log.avatar || (log.name || '?').charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-700 group-hover/row:text-violet-700 group-hover/row:translate-x-1 transition-all duration-300">
                                                        {log.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border shadow-sm transition-all duration-300 inline-block group-hover/row:scale-110 group-hover/row:shadow-lg ${log.type === 'Member'
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-blue-500/50'
                                                    : log.type === 'Staff'
                                                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300 shadow-purple-500/50'
                                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-300 shadow-orange-500/50'
                                                    }`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-500 font-semibold font-mono text-xs group-hover/row:text-violet-600 transition-colors duration-300">
                                                    <Clock size={14} className="text-slate-300 group-hover/row:text-violet-400 group-hover/row:rotate-12 transition-all duration-300" />
                                                    <span className="group-hover/row:scale-105 inline-block transition-transform duration-300">{log.time}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(log.status)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-400">
                                            No activity recorded today.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View (md:hidden) */}
                    <div className="md:hidden p-4 space-y-4">
                        {loading ? (
                            <div className="py-12 text-center text-sm text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                                    <span className="font-semibold text-violet-600">Monitoring live feed...</span>
                                </div>
                            </div>
                        ) : checkIns.length > 0 ? (
                            checkIns.map((log) => (
                                <MobileCard
                                    key={log.id}
                                    title={log.name}
                                    subtitle={log.type}
                                    badge={log.status === 'checked-in' ? 'Checked In' : 'Checked Out'}
                                    badgeColor={log.status === 'checked-in' ? 'emerald' : 'slate'}
                                    fields={[
                                        { label: 'Time', value: log.time, icon: Clock }
                                    ]}
                                />
                            ))
                        ) : (
                            <div className="py-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-100">
                                No activity recorded today.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveCheckInMonitor;
