import React, { useState, useEffect } from 'react';
import { announcementApi } from '../../../api/announcementApi';
import toast from 'react-hot-toast';
import { Megaphone, Plus, AlertCircle, Info, Calendar, Users, X, Check, BellRing, Sparkles } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import AnnouncementFormDrawer from './AnnouncementFormDrawer';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const getPriorityStyle = (priority) => {
        const config = {
            high: { gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', icon: AlertCircle, shadow: 'shadow-rose-500/20' },
            medium: { gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: Info, shadow: 'shadow-amber-500/20' },
            low: { gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', icon: Info, shadow: 'shadow-indigo-500/20' },
        };
        return config[priority] || config.medium;
    };

    const handleSuccess = () => {
        // Reload announcements logic
        loadAnnouncements();
    };

    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await announcementApi.getAllAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 p-6 md:p-10 font-sans">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="relative">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
                        <h1 className="relative text-3xl md:text-5xl font-black text-slate-800 flex items-center gap-4">
                            <Megaphone className="text-indigo-600" size={40} />
                            Broadcast Center
                        </h1>
                        <p className="text-slate-500 mt-3 text-lg font-medium max-w-xl">Keep your community engaged with updates, events, and important notices.</p>
                    </div>

                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 hover:shadow-indigo-500/40 hover:-translate-y-1"
                    >
                        <Plus size={22} className="transition-transform group-hover:rotate-90" />
                        New Announcement
                    </button>
                </div>
            </div>

            {/* Announcements Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {announcements.length === 0 ? (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-[40px] shadow-sm flex items-center justify-center text-slate-200 mb-6 border border-white/50">
                            <Megaphone size={48} className="opacity-20" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">No Broadcasts Yet</h3>
                        <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto mt-2">Your announcement history is empty. Start by sharing an update or event with your members.</p>
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="mt-8 px-8 py-3 bg-indigo-50 text-indigo-600 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                            Launch First Broadcast
                        </button>
                    </div>
                ) : (
                    announcements.map((announcement) => {
                        const style = getPriorityStyle(announcement.priority);
                        const Icon = style.icon;
                        return (
                            <div
                                key={announcement.id}
                                className={`group relative bg-white/60 backdrop-blur-md rounded-[40px] border border-white/50 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${style.gradient} opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`} />

                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-xl ${style.shadow} group-hover:rotate-12 transition-transform`}>
                                        <Icon size={28} />
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full ${style.bg} ${style.text} text-[10px] font-black uppercase tracking-widest border ${style.border}`}>
                                        {announcement.priority}
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                                    {announcement.title}
                                </h3>

                                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                                    {announcement.message}
                                </p>

                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Users size={16} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{announcement.targetAudience}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                        <Calendar size={14} className="text-slate-300" />
                                        {announcement.date}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Right Side Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Create Announcement"
            >
                <AnnouncementFormDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onSuccess={handleSuccess}
                />
            </RightDrawer>
        </div>
    );
};

export default Announcements;
