import React, { useState } from 'react';
import { Activity, Download, Filter, Search, Calendar, BarChart3, TrendingUp, Zap, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import '../../../styles/GlobalDesign.css';

const BranchPerformanceReport = () => {
    const [selectedDate, setSelectedDate] = useState('2024-03-01');
    const [searchTerm, setSearchTerm] = useState('');

    const stats = [
        { label: 'Revenue vs Expense', value: '+32.5%', icon: TrendingUp, bg: 'bg-indigo-50', color: 'text-indigo-600', trend: 'up' },
        { label: 'Lead Conv. Rate', value: '24.8%', icon: Target, bg: 'bg-purple-50', color: 'text-purple-600', trend: 'up' },
        { label: 'Member Retention', value: '92.1%', icon: Activity, bg: 'bg-emerald-50', color: 'text-emerald-600', trend: 'down' },
    ];

    const performanceData = [
        { id: 1, month: 'March 2024', revenue: '₹4,52,000', expense: '₹1,24,500', profit: '₹3,27,500', margin: '72.4%', status: 'Excellent' },
        { id: 2, month: 'February 2024', revenue: '₹4,10,000', expense: '₹1,18,000', profit: '₹2,92,000', margin: '71.2%', status: 'Good' },
        { id: 3, month: 'January 2024', revenue: '₹3,85,000', expense: '₹1,42,000', profit: '₹2,43,000', margin: '63.1%', status: 'Average' },
        { id: 4, month: 'December 2023', revenue: '₹4,25,000', expense: '₹1,15,000', profit: '₹3,10,000', margin: '72.9%', status: 'Excellent' },
    ];

    const handleExport = () => {
        alert("Preparing your branch performance analysis export... The report will be ready to download shortly.");
        // Logic for generating CSV would go here
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Activity size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                                    Branch Performance Report
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Comparative analysis of key performance indicators (KPIs)</p>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:shadow-indigo-500/50 text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Download size={18} />
                            Export Data
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} shadow-md`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-black text-gray-900 leading-none">{stat.value}</p>
                                <span className={`flex items-center text-[10px] font-bold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {stat.trend === 'up' ? '↑' : '↓'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 bg-gray-50/30">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    className="pl-11 h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-indigo-500 transition-all bg-white"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-bold">
                                <Zap size={14} />
                                Efficiency Score: 8.4/10
                            </div>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search performance..."
                                className="pl-11 h-11 w-full rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Month/Period</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expense</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Margin %</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {performanceData.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.month}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-emerald-600">{row.revenue}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-rose-600">{row.expense}</td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-900">{row.profit}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{row.margin}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'Excellent' ? 'bg-indigo-100 text-indigo-700' :
                                            row.status === 'Good' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BranchPerformanceReport;
