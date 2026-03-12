import React, { useState, useEffect } from 'react';
import { Activity, Download, Users, TrendingUp, IndianRupee, BarChart3, ShoppingBag, Package, ArrowUpRight, Clock, ShieldAlert } from 'lucide-react';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';
import { exportPdf } from '../../../utils/exportPdf';
import toast from 'react-hot-toast';

const BranchPerformanceReport = () => {
    const { selectedBranch, branches } = useBranchContext();
    const [activeOrderTab, setActiveOrderTab] = useState('New');
    const [loading, setLoading] = useState(true);

    const activeBranch = branches.find(b => b.id.toString() === selectedBranch.toString());
    const welcomeTitle = activeBranch ? `${activeBranch.branchName || activeBranch.name} Analytics` : 'Gym Analytics';



    const handleExport = () => {
        const headers = ['Metric', 'Value'];
        const rows = [
            ['Total Members', statsData.totalMembers.toString()],
            ['Monthly Revenue', `₹${statsData.revenueThisMonth.toLocaleString()}`],
            ['Collection Rate', `${statsData.collectionRate}%`],
            ['Pending Dues', `₹${statsData.pendingDues.toLocaleString()}`],
            ['Total Income (12m)', `₹${earningsData.totalIncome.toLocaleString()}`],
            ['Total Expenses (12m)', `₹${earningsData.totalExpenses.toLocaleString()}`]
        ];

        exportPdf({
            title: 'Branch Performance Report',
            filename: `performance_report_${new Date().toISOString().split('T')[0]}`,
            headers,
            rows,
            gymName: activeBranch?.branchName || activeBranch?.name || "Gym Academy"
        });
    };

    const [statsData, setStatsData] = useState({
        totalMembers: 0,
        revenueThisMonth: 0,
        collectionRate: 0,
        pendingDues: 0
    });

    const [earningsData, setEarningsData] = useState({
        months: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        profit: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        expenses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalIncome: 0,
        totalExpenses: 0
    });

    const [weeklyData, setWeeklyData] = useState({
        days: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'],
        values: [0, 0, 0, 0, 0, 0, 0]
    });

    const [retentionData, setRetentionData] = useState([]);
    const [membershipGrowth, setMembershipGrowth] = useState({ labels: [], values: [] });
    const [revenueByPlan, setRevenueByPlan] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [totalNetProfit, setTotalNetProfit] = useState(0);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch?.id || selectedBranch;
            const response = await apiClient.get(`/branch-admin/reports/performance?branchId=${branchId}`);
            if (response.data) {
                if (response.data.stats) setStatsData(response.data.stats);
                if (response.data.earnings) setEarningsData(response.data.earnings);
                if (response.data.weekly) setWeeklyData(response.data.weekly);
                if (response.data.retention) setRetentionData(response.data.retention);
                if (response.data.growth) setMembershipGrowth(response.data.growth);
                if (response.data.revenueByPlan) setRevenueByPlan(response.data.revenueByPlan);
                if (response.data.popularProducts) setPopularProducts(response.data.popularProducts);
                if (response.data.recentOrders) setRecentOrders(response.data.recentOrders);
                if (response.data.totalNetProfit !== undefined) setTotalNetProfit(response.data.totalNetProfit);
            }
        } catch (error) {
            console.error('Failed to fetch performance report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedBranch]);

    const orderTabs = ['New', 'Processing', 'Completed'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Generating Performance Report...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen ">

            {/* ── Header ── */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-emerald-500 rounded-2xl blur-2xl opacity-10 animate-pulse pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg transition-transform duration-300">
                                <BarChart3 size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-emerald-600 bg-clip-text text-transparent">
                                    {welcomeTitle}
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Complete performance insights for {activeBranch ? activeBranch.branchName : 'all branches'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-purple-500/30 self-start sm:self-auto relative z-10"
                        >
                            <Download size={18} />
                            Export as PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Top KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {[
                    { label: 'Total Members', value: statsData.totalMembers.toString(), icon: Users, from: 'from-blue-600', to: 'to-indigo-600' },
                    { label: 'Total Revenue', value: `₹${(statsData.revenueThisMonth / 1000).toFixed(1)}k`, icon: IndianRupee, from: 'from-emerald-500', to: 'to-emerald-600' },
                    { label: 'Collection Rate', value: `${statsData.collectionRate}%`, icon: TrendingUp, from: 'from-blue-400', to: 'to-blue-600' },
                    { label: 'Pending Dues', value: `₹${(statsData.pendingDues / 1000).toFixed(1)}k`, icon: Activity, from: 'from-fuchsia-500', to: 'to-fuchsia-600' },
                ].map((kpi, i) => (
                    <div key={i} className="group bg-white rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden relative">
                        {/* Subtle background glow */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${kpi.from} ${kpi.to}`}></div>

                        <div className="flex items-center justify-between gap-4 relative z-10">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">{kpi.value}</h3>
                                <div className="mt-2 flex items-center gap-1.5">
                                    <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight size={10} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase">Live</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 truncate">Real-time Data</span>
                                </div>
                            </div>
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-2xl bg-gradient-to-br ${kpi.from} ${kpi.to} flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                <kpi.icon size={24} className="transition-transform group-hover:scale-115" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* ── Earning Reports Chart ── */}
                <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="mb-2">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="text-primary" size={18} />
                            Earning Reports
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">Total Revenue & Store Profit (Last 12m)</p>
                    </div>
                    <div className="h-52 flex items-end justify-between gap-1.5 px-2 pb-6 mt-6 border-b border-slate-100">
                        {earningsData.months.map((month, i) => {
                            const maxValue = Math.max(...earningsData.revenue, 1);
                            const h = (earningsData.revenue[i] / maxValue) * 100;
                            return (
                                <div key={month} className="flex-1 bg-primary-light rounded-t-lg relative group/bar">
                                    <div
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-purple-500 rounded-t-lg transition-all duration-500 cursor-pointer"
                                        style={{ height: `${h || 2}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ₹{earningsData.revenue[i]}k
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-6 w-full text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        {month}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Earnings Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                        {[
                            { label: 'Earnings', value: `₹${(earningsData.totalIncome / 1000).toFixed(1)}k`, color: 'text-primary', bg: 'bg-primary-light' },
                            { label: 'Profit', value: `₹${((earningsData.totalIncome - earningsData.totalExpenses) / 1000).toFixed(1)}k`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Expenses', value: `₹${(earningsData.totalExpenses / 1000).toFixed(1)}k`, color: 'text-rose-600', bg: 'bg-rose-50' },
                        ].map((item) => (
                            <div key={item.label} className={`${item.bg} rounded-xl p-3 sm:p-4 text-center sm:text-left flex flex-col items-center sm:items-start`}>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                <p className={`text-lg sm:text-xl font-black ${item.color}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Member Retention ── */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Users className="text-primary" size={18} />
                            Member Retention
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">Membership status distribution</p>
                    </div>
                    <div className="flex flex-col gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        {retentionData.length > 0 ? retentionData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between group/item">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${d.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{d.status}</span>
                                </div>
                                <span className="bg-white px-3 py-1 rounded-lg text-sm font-black text-slate-800 shadow-sm border border-slate-100 group-hover/item:border-violet-200 transition-colors">
                                    {d.count}
                                </span>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Users size={24} className="text-slate-200 mb-2" />
                                <p className="text-slate-400 text-[10px] font-black uppercase italic">No data</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* ── Weekly Earnings Chart ── */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="mb-2">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="text-emerald-600" size={18} />
                            Weekly Earnings
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">This week's daily revenue</p>
                    </div>
                    <div className="h-36 flex items-end justify-between gap-2 px-2 pb-6 mt-6 border-b border-slate-100">
                        {weeklyData.days.map((day, i) => {
                            const maxValue = Math.max(...weeklyData.values, 1);
                            const h = (weeklyData.values[i] / maxValue) * 100;
                            return (
                                <div key={day} className="flex-1 bg-emerald-50 rounded-t-lg relative group/bar">
                                    <div
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-lg transition-all duration-500 cursor-pointer"
                                        style={{ height: `${h || 2}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ₹{weeklyData.values[i]}k
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-6 w-full text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        {day}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Net Profit ── */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="text-primary" size={18} />
                            Net Profit
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">Store Net Profit (Last 12m)</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-28 h-28 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center shadow-inner">
                            <p className="text-3xl font-black text-slate-900">₹{(totalNetProfit / 1000).toFixed(1)}k</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <div className="bg-emerald-50 rounded-xl p-4 text-center sm:text-left flex flex-col items-center sm:items-start">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                            <p className="text-lg sm:text-base font-black text-emerald-600">₹{(earningsData.totalIncome / 1000).toFixed(1)}k</p>
                            <p className="text-[9px] text-slate-400 font-medium">Last 12m</p>
                        </div>
                        <div className="bg-rose-50 rounded-xl p-4 text-center sm:text-left flex flex-col items-center sm:items-start">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Expenses</p>
                            <p className="text-lg sm:text-base font-black text-rose-600">₹{(earningsData.totalExpenses / 1000).toFixed(1)}k</p>
                            <p className="text-[9px] text-slate-400 font-medium">Last 12m</p>
                        </div>
                    </div>
                </div>

                {/* ── Popular Products ── */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <ShoppingBag className="text-fuchsia-600" size={18} />
                            Popular Products
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">Total {popularProducts.reduce((sum, p) => sum + (p.quantity || 0), 0)} items sold</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        {popularProducts.length > 0 ? popularProducts.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-fuchsia-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center">
                                        <Package size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{p.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900">{p.quantity} Sold</span>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-8 bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-100">
                                <Package size={24} className="text-slate-200 mb-2" />
                                <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest italic">No sales yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Recent Store Orders ── */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-slate-100 bg-slate-50/30">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Package className="text-slate-600" size={18} />
                            Recent Store Orders
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">POS & store sales overview</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {orderTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveOrderTab(tab)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeOrderTab === tab
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.filter(o => o.status === activeOrderTab || activeOrderTab === 'All').length > 0 ? (
                                recentOrders.filter(o => o.status === activeOrderTab || activeOrderTab === 'All').map((order) => (
                                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-900">#ORD-{order.id}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">{order.date}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">{order.itemsCount} Items</td>
                                        <td className="px-6 py-4 text-xs font-black text-slate-900">₹{Number(order.total).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.15em] ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                                order.status === 'Processing' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package size={28} className="text-slate-200 mb-3" />
                                            <p className="text-slate-500 font-black text-sm italic">No {activeOrderTab.toLowerCase()} orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── Membership Growth ── */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="text-primary" size={18} />
                            Membership Growth
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">New members per month</p>
                    </div>
                    <div className="h-40 flex items-end justify-between gap-1 mt-4">
                        {membershipGrowth.labels.length > 0 ? membershipGrowth.labels.map((label, i) => {
                            const maxValue = Math.max(...membershipGrowth.values, 1);
                            const h = (membershipGrowth.values[i] / maxValue) * 100;
                            return (
                                <div key={i} className="w-full bg-primary-light rounded-t-lg relative group/bar">
                                    <div
                                        className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500"
                                        style={{ height: `${Math.max(h, 5)}%` }}
                                    ></div>
                                    <div className="absolute -bottom-6 w-full text-center text-[8px] font-bold text-slate-400">
                                        {label}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="w-full flex items-center justify-center text-slate-300 italic text-xs">No growth data</div>
                        )}
                    </div>
                </div>

                {/* ── Revenue by Plan ── */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <IndianRupee className="text-emerald-600" size={18} />
                            Revenue by Plan
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">Top performing membership plans</p>
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                        {revenueByPlan.length > 0 ? revenueByPlan.map((plan, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 transition-all hover:bg-emerald-50">
                                <span className="text-xs font-bold text-slate-700">{plan.name}</span>
                                <span className="text-xs font-black text-emerald-700">₹{(plan.value / 1000).toFixed(1)}k</span>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                <Activity size={24} className="text-slate-200 mb-2" />
                                <p className="text-slate-400 text-[10px] font-black uppercase italic">No data</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BranchPerformanceReport;
