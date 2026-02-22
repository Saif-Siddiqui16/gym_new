import React, { useState, useEffect } from 'react';
import {
    Clock,
    Users,
    MapPin,
    CheckCircle2,
    Calendar,
    Filter,
    Search,
    ChevronRight,
    ArrowUpRight,
    Bell,
    MoreVertical,
    X,
    FileText,
    Download,
    Trash2,
    CalendarDays,
    Edit,
    Save
} from 'lucide-react';
import { getSessions, updateSessionStatus, createSession } from '../../api/trainer/trainerApi';
import RightDrawer from '../../components/common/RightDrawer';

const UpcomingSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Functional Action States
    const [selectedSession, setSelectedSession] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Create Slot States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '', date: '', time: '', duration: '60 min', location: 'Studio A', maxMembers: '20', type: 'Group Class'
    });

    useEffect(() => {
        loadSessions();
    }, [filter, searchTerm]);

    const loadSessions = async () => {
        setLoading(true);
        const filters = {
            type: filter === 'All' ? '' : filter,
            search: searchTerm
        };
        const result = await getSessions({ filters, limit: 100 });
        setSessions(result?.data || []);
        setLoading(false);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Confirmed' ? 'Pending' : 'Confirmed';
        await updateSessionStatus(id, nextStatus);
        loadSessions();
    };

    const getStatusStyle = (status) => {
        if (!status) return 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100 hover:shadow-lg cursor-pointer';
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100 hover:shadow-lg cursor-pointer';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:shadow-lg cursor-pointer';
            default: return 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100 hover:shadow-lg cursor-pointer';
        }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await createSession(formData);
            setIsCreateModalOpen(false);
            setFormData({ title: '', date: '', time: '', duration: '60 min', location: 'Studio A', maxMembers: '20', type: 'Group Class' });
            loadSessions();
        } catch (error) {
            console.error('Error creating slot:', error);
            alert(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="transform hover:translate-x-1 transition-transform duration-300">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text hover:from-blue-600 hover:to-purple-600 transition-all duration-500">Upcoming Sessions</h1>
                    <p className="text-gray-500 text-sm mt-1 hover:text-gray-700 transition-colors duration-300">Review your schedule for the next 7 days</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="relative p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm hover:scale-110 hover:shadow-lg hover:border-blue-300 group">
                        <Bell size={20} className="group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-200 active:scale-95 hover:scale-105 hover:shadow-xl"
                    >
                        <span className="hidden sm:inline">Create New Slot</span><span className="sm:hidden">+ New</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center hover:shadow-xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-1">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search by session title or member name..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none hover:bg-white hover:shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
                    {['All', 'Group Class', 'One-on-One'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border hover:scale-105 hover:shadow-md ${filter === t
                                ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                    <div className="h-6 w-px bg-gray-200 mx-2"></div>
                    <button className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 hover:scale-110 hover:shadow-md transition-all duration-300 group">
                        <Filter size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            {/* Sessions List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading sessions...</p>
                </div>
            ) : sessions.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-left">
                    {sessions.map((session) => (
                        <div key={session.id} className="group bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-500 overflow-hidden flex flex-col md:flex-row hover:scale-[1.02] transform">
                            {/* Date Badge Side */}
                            <div className="md:w-36 bg-slate-50 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-100 group-hover:bg-indigo-50 transition-colors duration-500">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors duration-300">
                                    {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <p className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500">
                                    {new Date(session.date).getDate()}
                                </p>
                                <p className="text-[10px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors duration-300 uppercase tracking-tighter">
                                    {new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}
                                </p>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between relative">
                                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(session.id, session.status)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border transition-all active:scale-95 hover:scale-110 hover:shadow-lg ${getStatusStyle(session.status)}`}
                                    >
                                        {session.status}
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === session.id ? null : session.id);
                                            }}
                                            className={`p-1.5 rounded-lg transition-all hover:scale-110 ${activeDropdown === session.id ? 'bg-blue-50 text-blue-600 rotate-90' : 'hover:bg-gray-50 text-gray-300'}`}
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {activeDropdown === session.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in zoom-in-95 duration-200 origin-top-right">
                                                    <button className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors group/item">
                                                        <Edit size={16} className="text-blue-500 group-hover/item:scale-125 group-hover/item:rotate-12 transition-all duration-300" /> Edit Slot
                                                    </button>
                                                    <button className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors group/item">
                                                        <Download size={16} className="text-purple-500 group-hover/item:scale-125 group-hover/item:-translate-y-0.5 transition-all duration-300" /> Export Roster
                                                    </button>
                                                    <div className="h-px bg-gray-100 my-1 mx-2" />
                                                    <button className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors group/item">
                                                        <Trash2 size={16} className="text-red-500 group-hover/item:scale-125 transition-all duration-300" /> Cancel Session
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest group-hover:scale-110 transition-transform duration-300 inline-block border ${session.type === 'One-on-One' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                            }`}>
                                            {session.type}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300 mb-4 tracking-tight leading-tight">{session.title}</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                        <div className="flex items-center gap-3 text-slate-500 group-hover:text-indigo-600 transition-colors duration-300">
                                            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                                                <Clock size={16} className="text-indigo-500 group-hover:rotate-12 transition-transform duration-300" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{session.time}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 group-hover:text-amber-600 transition-colors duration-300">
                                            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                                                <MapPin size={16} className="text-amber-400 group-hover:scale-125 transition-transform duration-300" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest truncate">{session.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 group-hover:text-fuchsia-600 transition-colors duration-300">
                                            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                                                <Users size={16} className="text-fuchsia-400 group-hover:scale-125 transition-transform duration-300" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{session.members}/{session.maxMembers} Members</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 hover:z-10 shadow-sm">
                                                {String.fromCharCode(64 + i)}
                                            </div>
                                        ))}
                                        {session.members > 3 && (
                                            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:scale-110 transition-all duration-500 shadow-sm">
                                                +{session.members - 3}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedSession(session);
                                            setIsDetailsModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 py-2 px-4 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all hover:scale-105 active:scale-95 group/btn shadow-sm hover:shadow-indigo-100"
                                    >
                                        View Details <ArrowUpRight size={14} className="group-hover/btn:rotate-45 group-hover/btn:scale-125 transition-all duration-300" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm border-dashed">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                        <Calendar size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No sessions found</h3>
                    <p className="text-gray-500 mt-2 max-w-xs text-center">Try adjusting your filters or search term.</p>
                </div>
            )}

            {/* Premium Session Details Modal */}
            <RightDrawer
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Session Details"
                subtitle={`${selectedSession?.title} • ${selectedSession?.time}`}
                maxWidth="max-w-2xl"
                footer={
                    <div className="flex gap-4 w-full">
                        <button className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-black text-gray-700 hover:bg-gray-100 hover:border-gray-300 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2">
                            <CalendarDays size={18} /> Reschedule
                        </button>
                        <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Download size={18} /> Download Roster
                        </button>
                    </div>
                }
            >
                {selectedSession && (
                    <div className="flex flex-col h-full">
                        {/* Custom Content Header */}
                        <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex items-start justify-between">
                            <div className="flex gap-6">
                                <div className="w-20 h-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">
                                        {new Date(selectedSession.date).toLocaleDateString('en-US', { month: 'short' })}
                                    </p>
                                    <p className="text-2xl font-black text-gray-900 leading-none">
                                        {new Date(selectedSession.date).getDate()}
                                    </p>
                                </div>
                                <div className="pt-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusStyle(selectedSession.status)}`}>
                                            {selectedSession.status}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                            {selectedSession.location}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedSession.title}</h2>
                                    <p className="text-gray-500 font-bold text-sm mt-1">90 Min Duration</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 pb-10 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar">
                            {/* Stats Column */}
                            <div className="md:col-span-1 space-y-4">
                                <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100/50">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Capacity</p>
                                    <div className="flex items-end gap-2">
                                        <p className="text-3xl font-black text-blue-900">{selectedSession.members}</p>
                                        <p className="text-sm font-bold text-blue-400 pb-1">/ {selectedSession.maxMembers}</p>
                                    </div>
                                    <div className="mt-4 w-full h-2 bg-white rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${(selectedSession.members / selectedSession.maxMembers) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                                        <span className="text-sm font-bold text-gray-600">Session Plan</span>
                                    </div>
                                    <ArrowUpRight size={16} className="text-gray-300" />
                                </button>
                            </div>

                            {/* Roster Column */}
                            <div className="md:col-span-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    Enrolled Members
                                    <span className="text-blue-600">View All</span>
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Alex Thompson', plan: 'Gold Plus', time: 'Enrolled 2d ago' },
                                        { name: 'Emma Watson', plan: 'Premium', time: 'Enrolled 1d ago' },
                                        { name: 'Mike Ross', plan: 'Basic', time: 'Enrolled 5h ago' }
                                    ].map((m, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-black text-sm group-hover:from-blue-600 group-hover:to-indigo-700 group-hover:text-white transition-all">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{m.plan}</p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400">{m.time}</p>
                                        </div>
                                    ))}
                                    {selectedSession.members > 3 && (
                                        <div className="p-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 rounded-xl">
                                            + {selectedSession.members - 3} more members
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </RightDrawer>
            {/* Create Slot Drawer */}
            <RightDrawer
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Slot"
                subtitle="Add a new class or session to your schedule"
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-4 w-full">
                        <button
                            onClick={handleCreateSlot}
                            disabled={isSaving}
                            className={`flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 ${isSaving ? 'opacity-70' : 'hover:bg-blue-700 active:scale-95'}`}
                        >
                            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                            {isSaving ? 'Saving...' : 'Create Slot'}
                        </button>
                    </div>
                }
            >
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Title</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Morning Yoga"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Time</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Duration</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="60 min"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Capacity</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="20"
                                    value={formData.maxMembers}
                                    onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Location</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Studio A"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Type</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Group Class">Group Class</option>
                                <option value="One-on-One">One-on-One</option>
                            </select>
                        </div>
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

export default UpcomingSessions;
