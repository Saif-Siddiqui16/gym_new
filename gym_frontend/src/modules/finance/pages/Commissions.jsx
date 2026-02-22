import React, { useState } from 'react';
import { User, Award, TrendingUp, DollarSign, Calendar, Trophy, Target } from 'lucide-react';

const COMMISSIONS = [
    { id: 1, trainer: 'John Doe', sessions: 45, tier: 'Gold (20%)', totalSales: 54000, commission: 10800 },
    { id: 2, trainer: 'Sarah Coach', sessions: 32, tier: 'Silver (15%)', totalSales: 38400, commission: 5760 },
    { id: 3, trainer: 'Mike Trainer', sessions: 50, tier: 'Platinum (25%)', totalSales: 60000, commission: 15000 },
];

const Commissions = () => {
    const [selectedMonth, setSelectedMonth] = useState('February 2025');

    const totalCommissions = COMMISSIONS.reduce((sum, c) => sum + c.commission, 0);
    const totalSales = COMMISSIONS.reduce((sum, c) => sum + c.totalSales, 0);
    const totalSessions = COMMISSIONS.reduce((sum, c) => sum + c.sessions, 0);

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen">
            {/* Premium Header with Gradient */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                                <Trophy className="text-violet-600" size={24} />
                                Trainer Commissions
                            </h1>
                            <p className="text-slate-600 text-xs sm:text-sm">Monthly performance and payout reports</p>
                        </div>
                        <div className="relative group">
                            <Calendar size={14} className="sm:w-4 sm:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full sm:w-auto pl-8 sm:pl-9 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <option>February 2025</option>
                                <option>January 2025</option>
                                <option>December 2024</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Total Commissions</div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <DollarSign size={16} className="sm:w-5 sm:h-5" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-violet-600">₹{totalCommissions.toLocaleString()}</div>
                </div>

                <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Total Sales</div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <TrendingUp size={16} className="sm:w-5 sm:h-5" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">₹{totalSales.toLocaleString()}</div>
                </div>

                <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Total Sessions</div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <Target size={16} className="sm:w-5 sm:h-5" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalSessions}</div>
                </div>
            </div>

            {/* Trainer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {COMMISSIONS.map(comm => (
                    <div
                        key={comm.id}
                        className="group relative overflow-hidden bg-white/60 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full -mr-8 sm:-mr-12 -mt-8 sm:-mt-12 group-hover:from-violet-200 group-hover:to-purple-200 transition-colors duration-300"></div>

                        <div className="relative z-10 p-4 sm:p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white mb-3 sm:mb-4 border-4 border-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                <User size={32} className="sm:w-10 sm:h-10" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-violet-600 transition-colors">{comm.trainer}</h3>
                            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 rounded-full text-[10px] sm:text-xs font-bold mt-2 border border-amber-200 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                <Award size={10} className="sm:w-3 sm:h-3" />
                                {comm.tier}
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100">
                                <div>
                                    <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Sessions</div>
                                    <div className="text-base sm:text-lg font-black text-slate-900 mt-1">{comm.sessions}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Sales</div>
                                    <div className="text-base sm:text-lg font-black text-slate-900 mt-1">₹{comm.totalSales.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                                <div className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Total Commission</div>
                                <div className="text-xl sm:text-2xl font-black text-emerald-700">₹{comm.commission.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Commissions;
