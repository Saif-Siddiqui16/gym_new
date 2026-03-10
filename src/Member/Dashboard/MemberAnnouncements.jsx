import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    Calendar,
    BellRing,
    Clock,
    AlertCircle,
    ChevronRight,
    Search,
    Sparkles,
    Info
} from 'lucide-react';
import { fetchAnnouncements } from '../../api/communication/communicationApi';
import RightDrawer from '../../components/common/RightDrawer';
import toast from 'react-hot-toast';

const MemberAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            // Backend now handles filtering for status: 'Active' and targetRole
            const data = await fetchAnnouncements({ portal: 'member' });
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getPriorityStyle = (priority) => {
        const p = parseInt(priority) || 0;
        const config = {
            high: {
                bg: 'bg-rose-50',
                text: 'text-rose-600',
                border: 'border-rose-100',
                icon: AlertCircle,
                badge: 'bg-rose-100 text-rose-700'
            },
            medium: {
                bg: 'bg-amber-50',
                text: 'text-amber-600',
                border: 'border-amber-100',
                icon: Info,
                badge: 'bg-amber-100 text-amber-700'
            },
            low: {
                bg: 'bg-primary-light',
                text: 'text-primary',
                border: 'border-violet-100',
                icon: Info,
                badge: 'bg-violet-100 text-primary-hover'
            },
        };

        if (p >= 8) return config.high;
        if (p >= 4) return config.medium;
        return config.low;
    };

    return (
        <div className="saas-container h-screen  space-y-10 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-white">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-10 border-b-2 border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-violet-100">
                        <Megaphone size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Announcements</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Stay updated with the latest news from your gym</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-4 sm:px-0">
                {announcements.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8">
                        {announcements.map((item) => {
                            const style = getPriorityStyle(item.priority);
                            const PriorityIcon = style.icon;
                            return (
                                <div key={item.id} className="group relative bg-white rounded-[3.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 p-8 sm:p-14 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:scale-110" />

                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-[1.5rem] ${style.bg} ${style.text} flex items-center justify-center shadow-sm`}>
                                                    <PriorityIcon size={28} strokeWidth={2.5} />
                                                </div>
                                                <div className={`px-5 py-2 rounded-full ${style.badge} text-[11px] font-black uppercase tracking-[0.2em]`}>
                                                    {item.priority || 'Update'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                <Calendar size={16} />
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-6 group-hover:text-primary transition-colors leading-tight">
                                            {item.title}
                                        </h3>

                                        <p className="text-slate-500 text-sm font-bold leading-[1.8] mb-10 max-w-4xl line-clamp-3">
                                            {item.content}
                                        </p>

                                        <div className="flex items-center justify-between pt-10 border-t-2 border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                                    <BellRing size={18} />
                                                </div>
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Broadcasted to Members</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedAnnouncement(item)}
                                                className="flex items-center gap-3 text-[11px] font-black text-primary uppercase tracking-[0.2em] hover:translate-x-2 transition-transform py-3 px-8 rounded-2xl bg-primary/5 hover:bg-primary hover:text-white shadow-sm"
                                            >
                                                Read More <ChevronRight size={16} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border-2 border-dashed border-slate-200">
                            <Megaphone size={48} strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Announcements</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">There are no announcements at this time. Check back later!</p>
                    </div>
                )}
            </div>

            {/* Announcement Detail Drawer */}
            <RightDrawer
                isOpen={!!selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
                title="Announcement Detail"
            >
                {selectedAnnouncement && (
                    <div className="p-10 sm:p-14 space-y-10 animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="flex items-center justify-between">
                            <div className={`px-4 py-1.5 rounded-full ${getPriorityStyle(selectedAnnouncement.priority).badge} text-[10px] font-black uppercase tracking-widest`}>
                                {selectedAnnouncement.priority || 'Update'}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Calendar size={14} />
                                {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                                {selectedAnnouncement.title}
                            </h3>
                            <div className="h-1.5 w-20 bg-primary rounded-full mb-8" />
                        </div>

                        <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                            <p className="text-slate-600 text-lg font-medium leading-relaxed whitespace-pre-wrap">
                                {selectedAnnouncement.content}
                            </p>
                        </div>

                        <div className="p-6 bg-primary-light/50 rounded-3xl border border-violet-100 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-violet-900 uppercase tracking-widest mb-1">Stay Notified</p>
                                <p className="text-xs text-primary-hover/70 font-bold leading-normal">
                                    Turn on push notifications in your profile settings to get instant updates on gym events and schedule changes.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedAnnouncement(null)}
                            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-violet-100 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            Close Detail
                        </button>
                    </div>
                )}
            </RightDrawer>

            {/* Footer Tip */}
            <div className="flex items-center justify-center pt-10">
                <div className="px-8 py-3 bg-primary-light rounded-full flex items-center gap-3 text-primary">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Personalized updates for your fitness journey</span>
                </div>
            </div>
        </div>
    );
};

export default MemberAnnouncements;
