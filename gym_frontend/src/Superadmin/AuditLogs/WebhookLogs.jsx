import React, { useState, useEffect } from 'react';
import { Terminal, Search, Filter, RefreshCw, Zap, Clock, ShieldCheck, AlertCircle, Eye, MoreHorizontal, ChevronRight, Download } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import LogPayloadDrawer from './LogPayloadDrawer';

import { fetchWebhookLogs } from '../../api/superadmin/superAdminApi';

const WebhookLogs = () => {
    const [selectedLog, setSelectedLog] = useState(null);
    const [webhookLogs, setWebhookLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterMethod, setFilterMethod] = useState('All');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [stats, setStats] = useState({
        totalEvents: '0',
        successRate: '0%',
        failedLast24h: '0',
        activeWebhooks: '0'
    });

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await fetchWebhookLogs();
            if (data && data.logs) {
                setWebhookLogs(data.logs);
                setStats(data.stats);
            } else {
                setWebhookLogs(data || []);
            }
        } catch (error) {
            console.error("Failed to load webhook logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        alert("Exporting Webhook Logs to CSV...");
        // Implement actual export logic here
    };

    const filteredLogs = webhookLogs.filter(log => {
        const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.statusCode.toString().includes(searchTerm);
        const matchesStatus = filterStatus === 'All' || log.status === filterStatus.toLowerCase();
        const matchesMethod = filterMethod === 'All' || log.method === filterMethod;
        return matchesSearch && matchesStatus && matchesMethod;
    });

    const handleViewLog = (log) => {
        setSelectedLog(log);
        setIsDrawerOpen(true);
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 min-h-screen p-6 md:p-10 font-sans pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-violet-600 mb-2">
                            <Terminal size={18} />
                            <span className="text-xs font-black uppercase tracking-[0.3em]">System Monitor</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                            Webhook <span className="text-violet-600">Events</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm font-medium">Real-time API activity and event broadcasting logs.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Download size={14} /> Export
                        </button>
                        <button onClick={loadLogs} className="p-3 bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-500/20 hover:scale-110 active:scale-95 transition-all">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Events', val: stats.totalEvents, icon: Zap, color: 'violet', bg: 'bg-violet-50', text: 'text-violet-600' },
                    { label: 'Avg Success', val: stats.successRate, icon: ShieldCheck, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                    { label: 'Failed (24h)', val: stats.failedLast24h, icon: AlertCircle, color: 'rose', bg: 'bg-rose-50', text: 'text-rose-600' },
                    { label: 'Active Webhooks', val: stats.activeWebhooks, icon: RefreshCw, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                        <div className={`p-2 w-fit rounded-lg ${stat.bg} ${stat.text} mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={18} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.val}</p>
                    </div>
                ))}
            </div>

            {/* Log Table/Cards */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-all" size={18} />
                            <input
                                type="text"
                                placeholder="Search by event, ID, or status code..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-white transition-all outline-none appearance-none cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">Status: All</option>
                                <option value="Success">Success</option>
                                <option value="Failed">Failed</option>
                            </select>
                            <select
                                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-white transition-all outline-none appearance-none cursor-pointer"
                                value={filterMethod}
                                onChange={(e) => setFilterMethod(e.target.value)}
                            >
                                <option value="All">Method: All</option>
                                <option value="POST">POST</option>
                                <option value="GET">GET</option>
                                <option value="PUT">PUT</option>
                            </select>
                        </div>
                    </div>

                    {/* Desktop View Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-4">Event ID</th>
                                    <th className="px-8 py-4">Event Type</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Endpoint</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 text-sm">Loading logs...</td></tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center opacity-40 uppercase text-[10px] font-black tracking-widest text-slate-400">No terminal events found</td></tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} className="group hover:bg-violet-50/50 transition-colors cursor-pointer" onClick={() => handleViewLog(log)}>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                                    <span className="text-violet-600 font-medium text-xs">{log.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-bold text-sm">{log.event}</span>
                                                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                        <Clock size={10} /> {log.time}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${log.status === 'success'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}>
                                                    {log.statusCode} {log.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 border border-slate-200">{log.method}</span>
                                                    <span className="text-xs text-slate-500 tracking-tight font-medium">{log.endpoint}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 text-slate-400 group-hover:text-violet-600 transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View Cards */}
                    <div className="lg:hidden divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-12 text-center text-slate-400 text-sm">Loading logs...</div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="p-12 text-center opacity-40 uppercase text-[10px] font-black tracking-widest text-slate-400">No terminal events found</div>
                        ) : (
                            filteredLogs.map(log => (
                                <div key={log.id} className="p-6 space-y-4 active:bg-slate-50 transition-colors" onClick={() => handleViewLog(log)}>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                                <span className="text-[10px] font-black text-violet-600 tracking-[0.1em]">{log.id}</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 tracking-tight">{log.event}</h3>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {log.statusCode}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 border border-slate-200">{log.method}</span>
                                            <span>{log.endpoint}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={10} /> {log.time}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <p className="text-xs text-slate-500 font-medium">System uptime <span className="text-emerald-500 font-bold">99.99%</span> • Latency <span className="text-violet-600 font-bold">142ms</span></p>
                    <div className="flex gap-2">
                        <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">Previous</button>
                        <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm">Next Page</button>
                    </div>
                </div>
            </div>

            {/* Payload Inspector Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Log Inspector"
                width="600px"
            >
                <LogPayloadDrawer
                    selectedLog={selectedLog}
                    onClose={() => setIsDrawerOpen(false)}
                />
            </RightDrawer>
        </div>
    );
};

export default WebhookLogs;
