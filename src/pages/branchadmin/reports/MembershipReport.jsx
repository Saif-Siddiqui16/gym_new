import React, { useState, useEffect } from 'react';
import { Users, Download, Filter, Search, Calendar, UserPlus, UserMinus, UserCheck, PieChart, Loader2 } from 'lucide-react';
import '../../../styles/GlobalDesign.css';
import apiClient from '../../../api/apiClient';

const MembershipReport = () => {
    const getToday = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getToday());
    const [searchTerm, setSearchTerm] = useState('');

    const [stats, setStats] = useState([
        { label: 'Active Members', value: '0', icon: UserCheck, bg: 'bg-emerald-50', color: 'text-emerald-600' },
        { label: 'New Joins (MTD)', value: '0', icon: UserPlus, bg: 'bg-blue-50', color: 'text-blue-600' },
        { label: 'Expired (MTD)', value: '0', icon: UserMinus, bg: 'bg-rose-50', color: 'text-rose-600' },
    ]);

    const [membershipData, setMembershipData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/branch-admin/reports/membership', {
                params: { date: selectedDate }
            });

            const iconMap = {
                UserCheck: UserCheck,
                UserPlus: UserPlus,
                UserMinus: UserMinus
            };

            setStats(response.data.stats.map(s => ({
                ...s,
                icon: iconMap[s.icon] || UserCheck
            })));
            setMembershipData(response.data.membershipData);
        } catch (error) {
            console.error('Failed to fetch membership report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedDate]);

    const handleExport = () => {
        if (membershipData.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = ["Member Name", "Plan Type", "Membership Start", "Expiry Date", "Status"];
        const csvContent = [
            headers.join(","),
            ...membershipData.map(row => [
                `"${row.name}"`,
                `"${row.plan}"`,
                `"${row.startDate}"`,
                `"${row.endDate}"`,
                `"${row.status}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `membership_report_${selectedDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Users size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                    Membership Report
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Analyze member growth, retention and plan distribution</p>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-xl hover:shadow-emerald-500/50 text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    className="pl-11 h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-emerald-500 transition-all bg-white"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const plans = membershipData.reduce((acc, member) => {
                                        acc[member.plan] = (acc[member.plan] || 0) + 1;
                                        return acc;
                                    }, {});
                                    const breakdown = Object.entries(plans)
                                        .map(([plan, count]) => `${plan}: ${count}`)
                                        .join('\n');
                                    alert(`Plan Distribution:\n\n${breakdown || 'No data available'}`);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                            >
                                <PieChart size={14} />
                                Plan Distribution
                            </button>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                className="pl-11 h-11 w-full rounded-xl border-2 border-slate-200 focus:border-emerald-500 text-sm transition-all"
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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Member Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Membership Start</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                            <p className="text-slate-500 font-medium">Loading membership data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : membershipData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                        No members found for the selected period
                                    </td>
                                </tr>
                            ) : (
                                membershipData
                                    .filter(row => row.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                        {row.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.plan}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{row.startDate}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.endDate}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
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

export default MembershipReport;
