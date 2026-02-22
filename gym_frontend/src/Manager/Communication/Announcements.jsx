import React, { useState, useEffect } from 'react';
import { Megaphone, Search, Filter, Plus, Clock, Users, CheckCircle, AlertCircle, Trash2, Edit2, MoreVertical, Calendar } from 'lucide-react';
import CreateAnnouncementDrawer from './CreateAnnouncementDrawer';
import { getAnnouncements } from '../../api/manager/managerApi';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAllData = async () => {
        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const filteredList = announcements.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateSuccess = () => {
        fetchAllData();
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 rounded-[40px] overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <Megaphone className="text-orange-500" />
                            Announcements
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium text-sm">Manage alerts and notifications for your gym</p>
                    </div>
                    <button
                        onClick={() => setIsCreateDrawerOpen(true)}
                        className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-xl shadow-slate-200"
                    >
                        <Plus size={18} /> New Announcement
                    </button>
                </div>

                {/* Search */}
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-all" size={20} />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-orange-500 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar space-y-4">
                {filteredList.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${item.status === 'Posted' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'Posted' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        {item.status}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <Users size={12} /> {item.audience}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <Calendar size={12} /> {item.date}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.message}</p>
                            </div>

                            <div className="flex items-center gap-2 md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-3 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
                                    <Edit2 size={18} />
                                </button>
                                <button className="p-3 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredList.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <Megaphone size={48} className="text-slate-300" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-4">No announcements found</p>
                    </div>
                )}
            </div>

            <CreateAnnouncementDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default Announcements;
