import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Filter, Search, Calendar, ChevronDown, Check, TrendingUp, CreditCard, Banknote, Wallet, Loader2 } from 'lucide-react';
import '../../../styles/GlobalDesign.css';
import apiClient from '../../../api/apiClient';

const RevenueReport = () => {
    const getToday = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getToday());
    const [selectedBranch, setSelectedBranch] = useState('Main Branch');
    const [searchTerm, setSearchTerm] = useState('');

    const [stats, setStats] = useState([
        { label: 'Total Revenue', value: '₹0', icon: DollarSign, bg: 'bg-indigo-50', color: 'text-indigo-600' },
        { label: 'Monthly Target', value: '₹5,00,000', icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
        { label: 'Pending Payments', value: '₹0', icon: Banknote, bg: 'bg-amber-50', color: 'text-amber-600' },
    ]);

    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/branch-admin/reports/revenue', {
                params: { date: selectedDate }
            });
            setStats(response.data.stats.map(s => ({
                ...s,
                icon: s.icon === 'DollarSign' ? DollarSign : (s.icon === 'TrendingUp' ? TrendingUp : Banknote)
            })));
            setRevenueData(response.data.revenueData);
        } catch (error) {
            console.error('Failed to fetch revenue report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedDate]);

    const handleExport = () => {
        if (revenueData.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = ["Date", "Member", "Service", "Amount", "Mode", "Status"];
        const csvContent = [
            headers.join(","),
            ...revenueData.map(row => [
                `"${row.date}"`,
                `"${row.member}"`,
                `"${row.service}"`,
                `"${row.amount}"`,
                `"${row.mode}"`,
                `"${row.status}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `revenue_report_${selectedDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <DollarSign size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Revenue Report
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Track payments, collection trends and financial health</p>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-xl hover:shadow-indigo-500/50 text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Download size={18} />
                            Export Report
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
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900 leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 bg-gray-50/30">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    className="pl-11 h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-indigo-500 transition-all bg-white"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <select
                                className="h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-indigo-500 transition-all bg-white font-medium text-gray-700"
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                            >
                                <option>Main Branch</option>
                                <option>Downtown Studio</option>
                            </select>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search payments..."
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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mode</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                            <p className="text-slate-500 font-medium">Loading revenue data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : revenueData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                        No transactions found for the selected period
                                    </td>
                                </tr>
                            ) : (
                                revenueData
                                    .filter(row => row.member.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.date}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.member}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{row.service}</td>
                                            <td className="px-6 py-4 text-sm font-black text-indigo-600">{row.amount}</td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                    {(row.mode === 'UPI' || row.mode === 'GPay' || row.mode === 'PhonePe') ? <Check size={14} className="text-blue-500" /> : <CreditCard size={14} />}
                                                    {row.mode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : (row.status === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700')
                                                    }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueReport;
