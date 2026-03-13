import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    Search,
    Filter,
    Plus,
    Clock,
    Users,
    CheckCircle,
    AlertCircle,
    Trash2,
    Edit2,
    MoreVertical,
    Calendar,
    Send,
    FileText,
    History,
    Loader2
} from 'lucide-react';
import CreateAnnouncementDrawer from './CreateAnnouncementDrawer';
import BroadcastMessageDrawer from './BroadcastMessageDrawer';
import MessageTemplatesDrawer from './MessageTemplatesDrawer';
import { fetchAnnouncements, fetchCommStats, fetchCommLogs, deleteAnnouncement } from '../../api/communication/communicationApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Announcements = () => {
    const { user } = useAuth();
    const [subTab, setSubTab] = useState('active'); // 'active' or 'logs'
    const [announcements, setAnnouncements] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        totalAnnouncements: 0,
        activeAnnouncements: 0,
        messagesSent: 0,
        templates: 0
    });
    const [loading, setLoading] = useState(true);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [selectedEdit, setSelectedEdit] = useState(null);
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const branchId = user?.tenantId;
            const [annData, statsData, logsData] = await Promise.all([
                fetchAnnouncements({ branchId }),
                fetchCommStats(branchId),
                fetchCommLogs(branchId)
            ]);
            setAnnouncements(annData);
            setStats(statsData);
            setLogs(logsData);
        } catch (error) {
            console.error("Failed to fetch communication data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [user?.tenantId]);

    const filteredList = announcements.filter(a =>
        (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.message || a.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLogs = logs.filter(log =>
        (log.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.channel || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSuccess = () => {
        setIsCreateDrawerOpen(false);
        setSelectedEdit(null);
        fetchAllData();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this alert?")) return;
        try {
            await deleteAnnouncement(id);
            toast.success("Deleted successfully");
            fetchAllData();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleEdit = (item) => {
        setSelectedEdit(item);
        setIsCreateDrawerOpen(true);
    };

    const statItems = [
        { label: 'Announcements', value: stats.totalAnnouncements, icon: Megaphone, color: 'text-slate-900', bg: 'bg-slate-50' },
        { label: 'Sent Logs', value: stats.messagesSent, icon: Send, color: 'text-primary', bg: 'bg-primary-light' },
        { label: 'Active Alerts', value: stats.activeAnnouncements, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Templates', value: stats.templates, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' }
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50/50 rounded-[40px] overflow-hidden">
            {/* KPI Section */}
            <div className="p-8 pb-0 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statItems.map((stat, idx) => (
                    <div key={idx} className="group relative bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 cursor-default">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:rotate-12`}>
                                <stat.icon size={22} />
                            </div>
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
                            <h2 className={`text-2xl font-black ${stat.color} tracking-tight`}>
                                {loading ? (
                                    <div className="h-8 w-16 bg-slate-50 animate-pulse rounded-lg" />
                                ) : (
                                    stat.value
                                )}
                            </h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Header / Actions */}
            <div className="px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-200 w-fit">
                    <button
                        onClick={() => setSubTab('active')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'active' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Posted Alerts
                    </button>
                    <button
                        onClick={() => setSubTab('logs')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'logs' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Activity Logs
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsTemplatesOpen(true)}
                        className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <FileText size={16} /> Templates
                    </button>
                    <button
                        onClick={() => setIsBroadcastOpen(true)}
                        className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <Send size={16} /> Broadcast
                    </button>
                    <button
                        onClick={() => {
                            setSelectedEdit(null);
                            setIsCreateDrawerOpen(true);
                        }}
                        className="px-6 py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-orange-100"
                    >
                        <Plus size={18} /> New Alert
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="px-8 mb-6">
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all" size={20} />
                    <input
                        type="text"
                        placeholder={subTab === 'active' ? "Search alerts..." : "Search activity logs..."}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 px-8 pb-8 custom-scrollbar space-y-4 overflow-y-auto">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <Loader2 size={40} className="text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">Syncing with server...</p>
                    </div>
                ) : subTab === 'active' ? (
                    filteredList.length > 0 ? (
                        filteredList.map(item => (
                            <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${item.status === 'Posted' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'Posted' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {item.status}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <Users size={12} /> {item.audience}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2 uppercase tracking-tight">{item.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.message || item.content}</p>
                                    </div>
                                    <div className="flex items-center gap-2 md:self-center">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-3 text-slate-400 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-3 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center opacity-40">
                            <Megaphone size={48} className="text-slate-300" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-4">No alerts found</p>
                        </div>
                    )
                ) : (
                    filteredLogs.length > 0 ? (
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sent At</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">To</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Channel</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700">{new Date(log.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-600">{log.audience || 'Members'}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-slate-500 max-w-xs truncate">{log.message}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">{log.channel}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center opacity-40">
                            <History size={48} className="text-slate-300" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-4">No activity history found</p>
                        </div>
                    )
                )}
            </div>

            <CreateAnnouncementDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => {
                    setIsCreateDrawerOpen(false);
                    setSelectedEdit(null);
                }}
                onSuccess={handleSuccess}
                editData={selectedEdit}
            />

            <BroadcastMessageDrawer
                isOpen={isBroadcastOpen}
                onClose={() => setIsBroadcastOpen(false)}
                onSuccess={handleSuccess}
            />

            <MessageTemplatesDrawer
                isOpen={isTemplatesOpen}
                onClose={() => {
                    setIsTemplatesOpen(false);
                    handleSuccess();
                }}
            />
        </div>
    );
};

export default Announcements;
