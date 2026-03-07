import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    MessageSquare,
    Layout,
    Send,
    Plus,
    CheckCircle2,
    History,
    Calendar,
    Search,
    Clock,
    Users
} from 'lucide-react';
import Card from '../../components/ui/Card';
import CreateAnnouncementDrawer from './CreateAnnouncementDrawer';
import BroadcastMessageDrawer from './BroadcastMessageDrawer';
import MessageTemplatesDrawer from './MessageTemplatesDrawer';
import { getCommStats, getAnnouncements, getCommLogs } from '../../api/communication/communicationApi';
import { useBranchContext } from '../../context/BranchContext';
import { toast } from 'react-hot-toast';

const TrainerAnnouncements = () => {
    const { selectedBranch } = useBranchContext();
    const [activeTab, setActiveTab] = useState('Announcements');
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isBroadcastDrawerOpen, setIsBroadcastDrawerOpen] = useState(false);
    const [isTemplatesDrawerOpen, setIsTemplatesDrawerOpen] = useState(false);

    const [stats, setStats] = useState({
        totalAnnouncements: 0,
        activeAnnouncements: 0,
        messagesSent: 0,
        templates: 0
    });
    const [announcements, setAnnouncements] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, annRes, logsRes] = await Promise.all([
                getCommStats(selectedBranch),
                getAnnouncements(selectedBranch),
                getCommLogs(selectedBranch)
            ]);
            setStats(statsRes);
            setAnnouncements(annRes);
            setLogs(logsRes);
        } catch (error) {
            console.error('Error fetching communication data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedBranch]);

    const StatItem = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => {
        const colorClasses = {
            primary: { bg: 'bg-primary-light', text: 'text-primary', iconBg: 'group-hover:bg-primary group-hover:text-white' },
            success: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'group-hover:bg-emerald-600 group-hover:text-white' },
            warning: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'group-hover:bg-amber-600 group-hover:text-white' },
        };
        const currentStyle = colorClasses[color] || colorClasses.primary;

        return (
            <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30/10 border border-transparent hover:border-violet-100 cursor-pointer p-4 md:p-5 h-full">
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="min-w-0">
                        <div className="text-gray-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-1 truncate">{title}</div>
                        <div className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight mb-1">{value}</div>
                    </div>
                    <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-sm ${currentStyle.bg} ${currentStyle.text} ${currentStyle.iconBg}`}>
                        {Icon && <Icon size={20} className="md:w-[22px] md:h-[22px] transition-colors duration-300" strokeWidth={2.5} />}
                    </div>
                </div>
                {subtitle && (
                    <div className="flex items-center gap-2 mt-2 md:mt-3">
                        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${currentStyle.bg} ${currentStyle.text} border border-transparent group-hover:border-current/10 whitespace-nowrap`}>
                            {subtitle}
                        </span>
                    </div>
                )}
                <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${currentStyle.bg}`}></div>
            </Card>
        );
    };

    return (
        <div className="saas-container   space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 md:pb-8 border-b-2 border-slate-100 px-1">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Communication Hub
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary-light text-primary rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-violet-100">Broadcasting System</span>
                        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest leading-relaxed">
                            Manage member engagement and updates
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto">
                    <button
                        onClick={() => setIsTemplatesDrawerOpen(true)}
                        className="flex-1 lg:flex-none h-10 md:h-11 px-3 md:px-8 bg-white border-2 border-slate-100 text-slate-700 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                    >
                        <Layout size={14} className="shrink-0" /> Templates
                    </button>
                    <button
                        onClick={() => setIsBroadcastDrawerOpen(true)}
                        className="flex-1 lg:flex-none h-10 md:h-11 px-3 md:px-8 bg-white border-2 border-slate-100 text-slate-700 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                    >
                        <Send size={14} className="shrink-0" /> Broadcast
                    </button>
                    <button
                        onClick={() => setIsCreateDrawerOpen(true)}
                        className="flex-1 lg:flex-none h-10 md:h-11 px-3 md:px-8 bg-primary !text-white rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-violet-100 hover:bg-primary-hover hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                        <Plus size={14} strokeWidth={3} className="shrink-0" /> New Announcement
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 px-1">
                <StatItem title="Total Announcements" value={stats.totalAnnouncements} subtitle="All time" icon={Megaphone} color="primary" />
                <StatItem title="Active" value={stats.activeAnnouncements} subtitle="Visible" icon={CheckCircle2} color="success" />
                <StatItem title="Messages Sent" value={stats.messagesSent} subtitle="Outreach" icon={MessageSquare} color="warning" />
                <StatItem title="Templates" value={stats.templates} subtitle="Saved drafts" icon={Layout} color="primary" />
            </div>

            {/* Tabs Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 border-b-2 border-slate-50 pb-px overflow-x-auto">
                    {['Announcements', 'Communication Logs'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab
                                ? 'text-primary'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_12px_rgba(79,70,229,0.4)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px] md:min-h-[400px]">
                    {activeTab === 'Announcements' && (
                        announcements.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {announcements.map((ann) => (
                                    <Card key={ann.id} className="p-6 border-2 border-slate-100 hover:border-violet-100 hover:shadow-xl transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ann.priority > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {ann.priority > 0 ? 'High Priority' : 'Normal'}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ann.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {ann.status}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-slate-900 mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">{ann.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-3">{ann.content}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-primary">
                                                    <Users size={12} />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ann.targetRole}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-300">
                                                <Calendar size={12} />
                                                <span className="text-[9px] font-bold uppercase tracking-widest">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center px-6">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/60 backdrop-blur-md rounded-3xl md:rounded-[40px] shadow-2xl shadow-violet-100/20 flex items-center justify-center text-slate-200 mb-6 md:mb-8 border border-white/50 group hover:scale-110 hover:rotate-12 transition-all duration-500">
                                    <Megaphone size={40} className="md:w-12 md:h-12 opacity-20 group-hover:opacity-40" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">No announcements yet</h3>
                                <p className="text-[11px] md:text-sm text-slate-500 mt-2 max-w-xs md:max-w-sm font-medium leading-relaxed font-bold uppercase tracking-widest opacity-60">
                                    Create your first announcement to reach your members instantly.
                                </p>
                            </div>
                        )
                    )}

                    {activeTab === 'Communication Logs' && (
                        logs.length > 0 ? (
                            <div className="overflow-hidden bg-white border-2 border-slate-50 rounded-3xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Channel</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Message</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{log.memberId ? `Member #${log.memberId}` : 'Broadcast'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare size={14} className="text-primary" />
                                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{log.channel}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{log.message}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Clock size={12} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center opacity-40 px-6">
                                <History size={40} className="md:w-12 md:h-12 text-slate-300 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No logs found</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Drawers */}
            <CreateAnnouncementDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
                onSuccess={(data) => {
                    toast.success('Announcement created successfully');
                    fetchData();
                }}
            />
            <BroadcastMessageDrawer
                isOpen={isBroadcastDrawerOpen}
                onClose={() => setIsBroadcastDrawerOpen(false)}
                onSuccess={(data) => {
                    toast.success('Broadcast sent successfully');
                    fetchData();
                }}
            />
            <MessageTemplatesDrawer
                isOpen={isTemplatesDrawerOpen}
                onClose={() => {
                    setIsTemplatesDrawerOpen(false);
                    fetchData(); // In case a template was added
                }}
            />
        </div>
    );
};

export default TrainerAnnouncements;
