import React, { useState, useEffect } from 'react';
import {
    Activity,
    Shield,
    AlertCircle,
    Clock,
    CheckCircle2,
    Filter,
    Terminal,
    Loader2,
    User,
    Building,
    RefreshCcw,
    Zap,
    Cpu,
    ArrowUpRight
} from 'lucide-react';
import { fetchSystemHealthAPI } from '../../../api/admin/adminApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';

const WebhookSettings = () => {
    const { selectedBranch } = useBranchContext();
    const [activeTab, setActiveTab] = useState('All');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ logs: [], stats: { total: '0', open: '0', resolved: '0', today: '0' } });

    useEffect(() => {
        loadData();
    }, [selectedBranch, activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Ensure if 'all' is selected, we pass the appropriate value the backend expects
            const branchId = selectedBranch === 'all' ? '' : selectedBranch;
            const res = await fetchSystemHealthAPI({
                branchId,
                status: activeTab === 'All' ? undefined : activeTab
            });
            setData(res);
        } catch (error) {
            console.error("System Health error", error);
            toast.error('Failed to load system health data');
        } finally {
            setLoading(false);
        }
    };

    const statsCards = [
        { label: 'Total Logs', value: data.stats.total, color: 'indigo', icon: Activity, subtitle: 'Monitoring events' },
        { label: 'Open Issues', value: data.stats.open, color: 'rose', icon: Zap, subtitle: 'Requires attention' },
        { label: 'Resolved Today', value: data.stats.resolved, color: 'emerald', icon: CheckCircle2, subtitle: 'Auto-fixed' },
        { label: 'System Uptime', value: '99.9%', color: 'blue', icon: Cpu, subtitle: 'Real-time' },
    ];

    const tabs = ['All', 'Open', 'Resolved'];

    return (
        <div className="bg-gradient-to-br from-[#f8fafc] via-white to-violet-50/20 min-h-screen p-6 md:p-10 pb-24 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[2rem] bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-100 ring-4 ring-violet-50">
                            <Activity size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">System Health</h1>
                            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Real-time Diagnostic Intelligence</p>
                        </div>
                    </div>
                    <button
                        onClick={loadData}
                        className="h-14 px-8 bg-white text-slate-600 border-2 border-slate-100 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-sm hover:border-violet-100 hover:text-violet-600 transition-all active:scale-95 group"
                    >
                        <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" /> Refresh Diagnostics
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex items-center justify-between group hover:border-violet-100 transition-all relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{card.label}</p>
                                <h3 className="text-3xl font-black text-slate-900 mb-1">{card.value}</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{card.subtitle}</p>
                            </div>
                            <div className={`w-14 h-14 bg-${card.color}-50 text-${card.color}-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                                <card.icon size={24} strokeWidth={2.5} />
                            </div>
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${card.color}-50/30 rounded-full blur-2xl group-hover:scale-150 transition-transform animate-pulse`} />
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab
                                        ? 'bg-white text-violet-600 shadow-sm ring-1 ring-slate-100'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Real-time Monitoring Active
                            </span>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="p-8 min-h-[400px]">
                        {loading ? (
                            <div className="py-32 flex flex-col items-center justify-center opacity-30">
                                <Loader2 className="animate-spin text-violet-600 mb-6" size={48} />
                                <p className="text-sm font-black text-slate-900 uppercase tracking-widest animate-pulse">Synchronizing Core Engine...</p>
                            </div>
                        ) : data.logs.length === 0 ? (
                            <div className="py-32 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner ring-1 ring-emerald-100 rotate-3 animate-bounce">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">System Status Optimal</h3>
                                <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-wide">No critical anomalies detected across the current infrastructure layer.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data.logs.map(log => (
                                    <div
                                        key={log.id}
                                        className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100/80 flex flex-col gap-6 hover:bg-white hover:border-violet-100 hover:shadow-lg hover:shadow-violet-50/50 transition-all group overflow-hidden relative"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${log.status === 'Open'
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}>
                                                    {log.status}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                                    <Clock size={12} />
                                                    {new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-violet-600 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-violet-100 shadow-sm">
                                                <Terminal size={14} className="text-violet-400" />
                                                Action: {log.action || 'UNDEFINED'}
                                            </div>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            <h4 className="text-md font-black text-slate-900 flex items-center gap-2">
                                                <Shield size={18} className="text-slate-300" />
                                                {log.affectedEntity || 'Core System Trace'}
                                            </h4>
                                            <div className="bg-slate-900/5 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 font-mono">
                                                <p className="text-xs text-slate-600 leading-relaxed font-bold break-all">
                                                    {log.details || 'No trace available'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-100 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 shadow-sm group-hover:border-violet-200 transition-colors">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.user || 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 shadow-sm group-hover:border-violet-200 transition-colors">
                                                        <Building size={14} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.branch || 'Global'}</span>
                                                </div>
                                            </div>

                                            <button className="h-10 px-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-violet-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 group/btn active:scale-95">
                                                Generate AI Fix <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                            </button>
                                        </div>
                                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-violet-50/20 rounded-full blur-3xl group-hover:bg-violet-100/30 transition-all pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebhookSettings;
