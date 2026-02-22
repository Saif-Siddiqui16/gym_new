import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, CreditCard, ShoppingBag, Download, Plus, BarChart3, Calendar } from 'lucide-react';
import { KPIS, TRANSACTIONS } from '../data/mockFinance';

const FinancialDashboard = () => {
    const [timeRange, setTimeRange] = useState('This Month');

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen">
            {/* Premium Header with Gradient */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                                <BarChart3 className="text-violet-600" size={24} />
                                Financial Overview
                            </h1>
                            <p className="text-slate-600 text-xs sm:text-sm">Real-time revenue, expense, and transaction tracking</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-md hover:scale-105 transition-all duration-300 shadow-sm group">
                                <Download className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                                Export Report
                            </button>
                            <button className="group relative px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-violet-500/50">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Plus className="w-4 h-4 relative" />
                                <span className="relative text-xs sm:text-sm">Add Transaction</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <KPICard
                    title="Monthly Revenue"
                    value={`₹${KPIS.revenue.monthly.toLocaleString()}`}
                    change={KPIS.revenue.growth}
                    icon={TrendingUp}
                    color="emerald"
                />
                <KPICard
                    title="Total Expenses"
                    value={`₹${KPIS.expenses.total.toLocaleString()}`}
                    subValue={`Pending: ₹${KPIS.expenses.pending.toLocaleString()}`}
                    icon={TrendingDown}
                    color="red"
                />
                <KPICard
                    title="Due Payments"
                    value={`₹${KPIS.dues.total.toLocaleString()}`}
                    subValue={`${KPIS.dues.count} Invoices Pending`}
                    icon={AlertCircle}
                    color="orange"
                />
                <KPICard
                    title="YTD Revenue"
                    value={`₹${KPIS.revenue.ytd.toLocaleString()}`}
                    change="Year to Date"
                    icon={DollarSign}
                    color="violet"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Revenue Analytics Chart */}
                <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="text-violet-600" size={18} />
                            Revenue Analytics
                        </h3>
                        <div className="relative group w-full sm:w-auto">
                            <Calendar size={14} className="sm:w-4 sm:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="w-full sm:w-auto pl-8 sm:pl-9 pr-4 py-2 bg-white/80 border-2 border-slate-200 rounded-lg text-xs sm:text-sm font-semibold focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 appearance-none cursor-pointer"
                            >
                                <option>This Month</option>
                                <option>Last Quarter</option>
                                <option>This Year</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-48 sm:h-64 flex items-end justify-between gap-1 sm:gap-2 px-2 sm:px-4 pb-4 border-b border-slate-100">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} className="w-full bg-violet-50 rounded-t-lg relative group/bar">
                                <div
                                    className="absolute bottom-0 w-full bg-gradient-to-t from-violet-600 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-violet-700 hover:to-purple-600 cursor-pointer"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                        ₹{(h * 1000).toLocaleString()}
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 w-full text-center text-[10px] sm:text-xs font-bold text-slate-400">
                                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                        <CreditCard className="text-violet-600" size={18} />
                        Recent Transactions
                    </h3>
                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                        {TRANSACTIONS.map(txn => (
                            <div key={txn.id} className="group flex items-center justify-between p-2.5 sm:p-3 hover:bg-violet-50/50 rounded-lg sm:rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-violet-100">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm flex-shrink-0 ${txn.type.includes('POS')
                                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                                        : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                        }`}>
                                        {txn.type.includes('POS') ? <ShoppingBag size={14} className="sm:w-[18px] sm:h-[18px]" /> : <CreditCard size={14} className="sm:w-[18px] sm:h-[18px]" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors truncate">{txn.member}</div>
                                        <div className="text-[10px] sm:text-xs text-slate-500 truncate">{txn.type}</div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <div className={`text-xs sm:text-sm font-bold ${txn.status === 'Completed' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {txn.status === 'Completed' ? '+' : ''}₹{txn.amount.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-slate-400">{txn.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-2.5 text-xs sm:text-sm font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105">
                        View All Transactions
                    </button>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, change, subValue, icon: Icon, color }) => {
    const colorClasses = {
        emerald: { bg: 'from-emerald-500 to-emerald-600', icon: 'bg-emerald-100 text-emerald-600' },
        red: { bg: 'from-red-500 to-red-600', icon: 'bg-red-100 text-red-600' },
        orange: { bg: 'from-orange-500 to-orange-600', icon: 'bg-orange-100 text-orange-600' },
        violet: { bg: 'from-violet-500 to-purple-600', icon: 'bg-violet-100 text-violet-600' },
    };

    return (
        <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl ${colorClasses[color].icon} shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon size={20} className="sm:w-6 sm:h-6" />
                </div>
                {change && (
                    <span className={`text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ${change.includes('+')
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                        {change}
                    </span>
                )}
            </div>
            <div className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">{title}</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">{value}</div>
            {subValue && (
                <div className="text-xs font-semibold text-slate-500 mt-2">
                    {subValue}
                </div>
            )}
        </div>
    );
};

export default FinancialDashboard;
