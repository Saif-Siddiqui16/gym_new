import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    Plus,
    Send,
    FileText,
    MessageSquare,
    History,
    Loader2,
    CheckCircle2,
    XCircle,
    Bell
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { fetchCommStats, fetchAnnouncements, fetchCommLogs } from '../../../api/communication/communicationApi';
import '../../../styles/GlobalDesign.css';
import AnnouncementFormDrawer from './AnnouncementFormDrawer';
import BroadcastMessageDrawer from './BroadcastMessageDrawer';
import MessageTemplatesDrawer from './MessageTemplatesDrawer';

const Announcements = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Announcements');
    const [announcements, setAnnouncements] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        totalAnnouncements: 0,
        activeAnnouncements: 0,
        messagesSent: 0,
        templates: 0
    });
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const branchId = user?.tenantId;
            const [statsData, annData, logsData] = await Promise.all([
                fetchCommStats(branchId),
                fetchAnnouncements({ branchId }),
                fetchCommLogs({ branchId })
            ]);
            setStats(statsData);
            setAnnouncements(annData);
            setLogs(logsData);
        } catch (error) {
            console.error('Failed to load communication data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.tenantId]);

    const statItems = [
        { label: 'Total Announcements', value: stats.totalAnnouncements, icon: Megaphone, color: 'text-slate-900', iconBg: 'bg-slate-50', iconColor: 'text-slate-400' },
        { label: 'Active', value: stats.activeAnnouncements, icon: Megaphone, color: 'text-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
        { label: 'Messages Sent', value: stats.messagesSent, icon: Send, color: 'text-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
        { label: 'Templates', value: stats.templates, icon: FileText, color: 'text-orange-500', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' }
    ];

    return (
        <div className="min-h-screen bg-slate-50/20 p-4 md:p-10 space-y-6 md:space-y-8 animate-fadeIn font-sans text-slate-900">

            {/* KPI Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statItems.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white rounded-[1.25rem] p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-[110px] md:h-[130px] relative group hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer">
                            <div className="flex justify-between items-start w-full">
                                <span className="text-slate-400 text-[10px] md:text-[11px] font-black uppercase tracking-widest">{stat.label}</span>
                                <div className={`w-8 h-8 md:w-10 md:h-10 ${stat.iconBg} ${stat.iconColor} rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}>
                                    <Icon size={16} className="md:w-[18px] md:h-[18px]" />
                                </div>
                            </div>
                            <h2 className={`text-3xl md:text-4xl font-black ${stat.color} mb-1 group-hover:scale-105 transition-transform origin-left duration-500`}>
                                {loading ? '...' : stat.value}
                            </h2>
                        </div>
                    );
                })}
            </div>

            {/* Title & Action Buttons Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight">Communication Hub</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage gym-wide alerts and messages</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsTemplatesOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FileText size={14} />
                        Templates
                    </button>
                    <button
                        onClick={() => setIsBroadcastOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Send size={14} />
                        Broadcast
                    </button>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <Plus size={16} />
                        New Announcement
                    </button>
                </div>
            </div>

            {/* Tabs Row (Pill Style) */}
            <div className="flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 w-full md:w-fit overflow-x-auto no-scrollbar shadow-inner">
                <button
                    onClick={() => setActiveTab('Announcements')}
                    className={`flex-1 md:flex-none px-6 md:px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'Announcements'
                        ? 'bg-white text-indigo-600 shadow-md border border-slate-100'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Announcements
                </button>
                <button
                    onClick={() => setActiveTab('Communication Logs')}
                    className={`flex-1 md:flex-none px-6 md:px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'Communication Logs'
                        ? 'bg-white text-indigo-600 shadow-md border border-slate-100'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Communication Logs
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[450px] overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[450px] gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading dynamic data...</p>
                    </div>
                ) : activeTab === 'Announcements' ? (
                    <div className="p-4 md:p-8">
                        {announcements.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {announcements.map((ann) => (
                                    <div key={ann.id} className="bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-6 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Bell size={20} />
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${ann.priority >= 7 ? 'bg-rose-100 text-rose-600' : ann.priority >= 4 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {ann.priority >= 7 ? 'Urgent' : ann.priority >= 4 ? 'High' : 'Normal'}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-slate-900 mb-2 uppercase tracking-tight text-sm">{ann.title}</h3>
                                        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">{ann.content}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {new Date(ann.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${ann.status === 'Active' ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 bg-slate-100'}`}>
                                                {ann.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-4">
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                    <Megaphone size={40} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">No Announcements</h3>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Start broadcasting to your members</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-4 md:p-8">
                        {logs.length > 0 ? (
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100/50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Channel</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sent At</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-white transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest">
                                                        {log.channel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-medium text-slate-600 max-w-md truncate">{log.message}</p>
                                                </td>
                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                                    {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                                        <CheckCircle2 size={10} />
                                                        Sent
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-4">
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                    <History size={40} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">No Communication Logs</h3>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">History of sent messages will appear here</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Drawer Components */}
            <AnnouncementFormDrawer
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => {
                    loadData();
                    setIsCreateOpen(false);
                }}
            />

            <BroadcastMessageDrawer
                isOpen={isBroadcastOpen}
                onClose={() => setIsBroadcastOpen(false)}
                onSuccess={() => {
                    loadData();
                    setIsBroadcastOpen(false);
                }}
            />

            <MessageTemplatesDrawer
                isOpen={isTemplatesOpen}
                onClose={() => {
                    setIsTemplatesOpen(false);
                    loadData();
                }}
            />

        </div>
    );
};

export default Announcements;
