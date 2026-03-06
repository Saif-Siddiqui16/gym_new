import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Filter, Search, Calendar, Target, MousePointer2, Percent, Share2, Loader2 } from 'lucide-react';
import '../../../styles/GlobalDesign.css';
import apiClient from '../../../api/apiClient';

const LeadConversionReport = () => {
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
        { label: 'Total Leads', value: '0', icon: MousePointer2, bg: 'bg-orange-50', color: 'text-orange-600' },
        { label: 'Converted Leads', value: '0', icon: Target, bg: 'bg-purple-50', color: 'text-purple-600' },
        { label: 'Conversion rate', value: '0%', icon: Percent, bg: 'bg-blue-50', color: 'text-blue-600' },
    ]);

    const [leadData, setLeadData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/branch-admin/reports/lead-conversion', {
                params: { date: selectedDate }
            });

            const iconMap = {
                MousePointer2: MousePointer2,
                Target: Target,
                Percent: Percent
            };

            setStats(response.data.stats.map(s => ({
                ...s,
                icon: iconMap[s.icon] || Target
            })));
            setLeadData(response.data.leadData);
        } catch (error) {
            console.error('Failed to fetch lead conversion report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedDate]);

    const handleExport = () => {
        if (leadData.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = ["Lead Name", "Source", "Date Received", "Status", "Sales Notes"];
        const csvContent = [
            headers.join(","),
            ...leadData.map(row => [
                `"${row.name}"`,
                `"${row.source}"`,
                `"${row.date}"`,
                `"${row.status}"`,
                `"${row.notes.replace(/"/g, '""')}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `lead_conversion_report_${selectedDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                                    Lead Conversion Report
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Monitor marketing performance and sales funnel efficiency</p>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-rose-600 hover:shadow-xl hover:shadow-orange-500/50 text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Download size={18} />
                            Export Funnel Data
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
                                    className="pl-11 h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-orange-500 transition-all bg-white"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const sources = leadData.reduce((acc, lead) => {
                                        acc[lead.source] = (acc[lead.source] || 0) + 1;
                                        return acc;
                                    }, {});
                                    const breakdown = Object.entries(sources)
                                        .map(([source, count]) => `${source}: ${count}`)
                                        .join('\n');
                                    alert(`Source Breakdown:\n\n${breakdown || 'No data available'}`);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
                            >
                                <Share2 size={14} />
                                Source Breakdown
                            </button>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                className="pl-11 h-11 w-full rounded-xl border-2 border-slate-200 focus:border-orange-500 text-sm transition-all"
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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Received</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sales Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                            <p className="text-slate-500 font-medium">Loading funnel data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : leadData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                        No leads found for the selected period
                                    </td>
                                </tr>
                            ) : (
                                leadData
                                    .filter(row => row.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.name}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.source}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{row.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'Converted' ? 'bg-emerald-100 text-emerald-700' :
                                                    row.status === 'Follow-up' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 italic">"{row.notes}"</td>
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

export default LeadConversionReport;
