import React, { useState } from 'react';
import { TrendingUp, Download, Filter, Search, Calendar, Target, MousePointer2, Percent, Share2 } from 'lucide-react';
import '../../../styles/GlobalDesign.css';

const LeadConversionReport = () => {
    const [selectedDate, setSelectedDate] = useState('2024-03-01');
    const [searchTerm, setSearchTerm] = useState('');

    const stats = [
        { label: 'Total Leads', value: '245', icon: MousePointer2, bg: 'bg-orange-50', color: 'text-orange-600' },
        { label: 'Converted Leads', value: '64', icon: Target, bg: 'bg-purple-50', color: 'text-purple-600' },
        { label: 'Conversion rate', value: '26.1%', icon: Percent, bg: 'bg-blue-50', color: 'text-blue-600' },
    ];

    const leadData = [
        { id: 1, name: 'Karan Mehra', source: 'Instagram Ad', date: '2024-03-12', status: 'Converted', notes: 'Interested in annual plan' },
        { id: 2, name: 'Sneha Kapur', source: 'Website Walk-in', date: '2024-03-14', status: 'Follow-up', notes: 'Trial scheduled for Friday' },
        { id: 3, name: 'Arjun Singh', source: 'Referral', date: '2024-03-15', status: 'New', notes: 'Friend of Member ID 402' },
        { id: 4, name: 'Meera Rai', source: 'Google Search', date: '2024-03-15', status: 'Converted', notes: 'Immediate joiner' },
    ];

    const handleExport = () => {
        alert("Preparing your lead funnel export... The data will be ready for download in a moment.");
        // Logic for generating CSV would go here
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
                            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold">
                                <Share2 size={14} />
                                Source Breakdown
                            </div>
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
                            {leadData.map((row) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeadConversionReport;
