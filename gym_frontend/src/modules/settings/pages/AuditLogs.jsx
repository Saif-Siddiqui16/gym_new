import React, { useState } from 'react';
import { AUDIT_LOGS } from '../data/mockSettingsData';
import { Shield, Activity, RefreshCw, ChevronRight, Search, Calendar, Filter, Download, Clock, Globe } from 'lucide-react';

const WEBHOOK_LOGS = [
    { id: 1, type: 'Payment', provider: 'Razorpay', event: 'payment.captured', status: 'Success', time: '10:42 AM' },
    { id: 2, type: 'Payment', provider: 'Razorpay', event: 'payment.failed', status: 'Failed', time: '09:15 AM' },
    { id: 3, type: 'WhatsApp', provider: 'Twilio', event: 'message.sent', status: 'Success', time: 'Yesterday' },
];

const AuditLogs = () => {
    const [activeTab, setActiveTab] = useState('system');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const filteredLogs = AUDIT_LOGS.filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 pb-12 min-h-screen">
            {/* Premium Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                                <Shield className="text-violet-600" size={28} />
                                System & Security Logs
                            </h1>
                            <p className="text-slate-600 text-sm">Track system activity and webhook events in real-time</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveTab('system')}
                                className={`px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'system'
                                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 hover:-translate-y-1'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-md hover:scale-105'
                                    }`}
                            >
                                System Activity
                            </button>
                            <button
                                onClick={() => setActiveTab('webhooks')}
                                className={`px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'webhooks'
                                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 hover:-translate-y-1'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-md hover:scale-105'
                                    }`}
                            >
                                Webhook Events
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'system' ? (
                <>
                    {/* Glass Morphism Search Bar */}
                    <div className="mb-6 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-5 hover:shadow-xl transition-all duration-300">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:w-96 group">
                                <Search
                                    size={20}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300"
                                />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by user or action..."
                                    className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Premium Table */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b-2 border-slate-200">
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Date & Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Action</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="group hover:bg-gradient-to-r hover:from-violet-50/50 hover:via-purple-50/30 hover:to-transparent transition-all duration-300 cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock className="w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:scale-125" />
                                                    {log.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                                        {(log.user || '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900 group-hover:text-violet-600 transition-colors duration-300">
                                                            {log.user}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
                                                    {log.action}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 font-mono text-xs text-slate-500 group-hover:text-violet-600 transition-colors duration-300">
                                                    <Globe className="w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:scale-125" />
                                                    {log.ip}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-6">
                    <div className="space-y-4">
                        {WEBHOOK_LOGS.map((log) => (
                            <div
                                key={log.id}
                                className="group flex justify-between items-center p-5 border-2 border-slate-100 rounded-xl hover:border-violet-200 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${log.type === 'Payment'
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                            : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                                        }`}>
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors duration-300">{log.provider}</span>
                                            <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-lg group-hover:bg-violet-100 group-hover:text-violet-700 transition-all duration-300">
                                                {log.event}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1">{log.time}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-bold px-4 py-2 rounded-full uppercase shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${log.status === 'Success'
                                            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 group-hover:shadow-emerald-500/50'
                                            : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 group-hover:shadow-red-500/50'
                                        }`}>
                                        {log.status}
                                    </span>
                                    <ChevronRight size={20} className="text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all duration-300" />
                                </div>
                            </div>
                        ))}
                        <div className="text-center pt-6">
                            <button className="group px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 mx-auto">
                                <RefreshCw size={16} className="transition-transform duration-300 group-hover:rotate-180" />
                                Load More Events
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
