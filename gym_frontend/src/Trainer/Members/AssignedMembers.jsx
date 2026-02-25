import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, MessageSquare, ChevronLeft, ChevronRight, User, Trophy, Calendar, ArrowUpRight, X, Send, Phone, Info, Trash2, ShieldAlert, Clock, ClipboardList, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAssignedMembers, flagMember } from '../../api/trainer/trainerApi';
import CustomDropdown from '../../components/common/CustomDropdown';

import ActionDropdown from '../../components/common/ActionDropdown';
import MemberProfileView from './MemberProfileView';
import RightDrawer from '../../components/common/RightDrawer';
import QuickAssignPlanDrawer from './components/QuickAssignPlanDrawer';

const AssignedMembers = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [totalItems, setTotalItems] = useState(0);

    // Functional Action States
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [chatMessage, setChatMessage] = useState('');
    // activeDropdown removed

    // New Action States
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [flagReason, setFlagReason] = useState('');

    // attendance logs loaded dynamically now from selectedMember.recentWorkouts

    useEffect(() => {
        loadMembers();
    }, [searchTerm, statusFilter, currentPage, itemsPerPage]);

    const loadMembers = async () => {
        setLoading(true);
        const filters = {
            search: searchTerm,
            status: statusFilter === 'All' ? '' : statusFilter
        };
        const result = await getAssignedMembers({ filters, page: currentPage, limit: itemsPerPage });
        setMembers(result?.data || []);
        setTotalItems(result?.total || 0);
        setLoading(false);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const getStatusStyles = (status) => {
        if (!status) return 'bg-gray-50 text-gray-600 border-gray-100';
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-50 text-green-600 border-green-100';
            case 'inactive': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assigned Members</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and track progress of your {members.length} active trainees</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-100">
                        <Trophy size={18} className="text-blue-500" />
                        <span className="text-sm font-bold text-blue-700">Top Performer: Emma</span>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, ID or plan..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <CustomDropdown
                        options={[
                            { value: 'All', label: 'All Status' },
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' }
                        ]}
                        value={statusFilter}
                        onChange={(val) => {
                            setStatusFilter(val);
                            setCurrentPage(1);
                        }}
                        className="w-full sm:w-48"
                    />
                </div>
            </div>

            {/* Member List Container */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Loading your members...</p>
                    </div>
                </div>
            ) : members.length > 0 ? (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Athlete</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Plan</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {members.map((member) => (
                                    <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm uppercase">
                                                    {(member.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{member.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">Ref: {member.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <ClipboardList size={14} />
                                                </div>
                                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight truncate max-w-[150px]">
                                                    {member.plan || 'No Active Plan'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-slate-800">{member.attendance}</span>
                                                <span className="text-[10px] text-emerald-500 font-black bg-emerald-50 px-1.5 py-0.5 rounded-md">↑ 2%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(member.status)}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${member.status?.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                                {member.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setIsAssignOpen(true);
                                                    }}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                                                >
                                                    Assign Plan
                                                </button>
                                                <ActionDropdown
                                                    trigger={
                                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100">
                                                            <MoreVertical size={18} />
                                                        </button>
                                                    }
                                                >
                                                    <button onClick={() => { setSelectedMember(member); setIsProfileModalOpen(true); }} className="w-full px-4 py-2.5 text-left text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest"><Eye size={14} /> Profile</button>
                                                    <button onClick={() => navigate(`/progress?memberId=${member.id}`)} className="w-full px-4 py-2.5 text-left text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest"><TrendingUp size={14} /> Progress</button>
                                                    <button onClick={() => { setSelectedMember(member); setIsChatModalOpen(true); }} className="w-full px-4 py-2.5 text-left text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest"><MessageSquare size={14} /> Chat</button>
                                                    <button onClick={() => { setSelectedMember(member); setIsAttendanceModalOpen(true); }} className="w-full px-4 py-2.5 text-left text-[10px] font-black text-slate-600 hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest"><Calendar size={14} /> Attendance</button>
                                                    <div className="h-px bg-slate-100 my-1 mx-2" />
                                                    <button onClick={() => { setSelectedMember(member); setIsFlagModalOpen(true); }} className="w-full px-4 py-2.5 text-left text-[10px] font-black text-rose-600 hover:bg-rose-50 flex items-center gap-2 uppercase tracking-widest"><ShieldAlert size={14} /> Flag</button>
                                                </ActionDropdown>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                        {members.map((member) => (
                            <div key={member.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col relative">
                                <div className="p-6 flex-1 hover:bg-slate-50/50 transition-colors duration-300">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative group/avatar">
                                                <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100 group-hover/avatar:scale-110 group-hover/avatar:rotate-3 transition-all duration-500 overflow-hidden">
                                                    {(member.name || '?').charAt(0)}
                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                                                </div>
                                                {member.isFlagged && (
                                                    <div className="absolute -top-2 -right-2 p-1.5 bg-rose-500 border-2 border-white rounded-xl text-white shadow-lg animate-bounce" title={`Flagged: ${member.flagReason}`}>
                                                        <ShieldAlert size={14} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate max-w-[140px]">{member.name}</h3>
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mt-2 ${getStatusStyles(member.status)}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${member.status?.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                                    {member.status}
                                                </div>
                                            </div>
                                        </div>
                                        <ActionDropdown
                                            trigger={
                                                <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                                                    <MoreVertical size={20} />
                                                </button>
                                            }
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/progress?memberId=${member.id}`);
                                                }}
                                                className="w-full px-4 py-3 text-left text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors uppercase tracking-widest"
                                            >
                                                <TrendingUp size={16} className="text-violet-500" /> Member Progress
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMember(member);
                                                    setIsAttendanceModalOpen(true);
                                                }}
                                                className="w-full px-4 py-3 text-left text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors uppercase tracking-widest"
                                            >
                                                <Calendar size={16} className="text-indigo-500" /> Attendance Log
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMember(member);
                                                    setIsAssignOpen(true);
                                                }}
                                                className="w-full px-4 py-3 text-left text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors uppercase tracking-widest"
                                            >
                                                <ArrowUpRight size={16} className="text-indigo-600" /> Assign Plan
                                            </button>
                                            <div className="h-px bg-slate-100 my-1 mx-2" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMember(member);
                                                    setIsFlagModalOpen(true);
                                                }}
                                                className="w-full px-4 py-3 text-left text-xs font-black text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors uppercase tracking-widest"
                                            >
                                                <ShieldAlert size={16} className="text-rose-500" /> Flag Status
                                            </button>
                                        </ActionDropdown>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50 group-hover:bg-white transition-colors duration-500">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Attendance</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-2xl font-black text-slate-800">{member.attendance}</p>
                                                <p className="text-[10px] text-emerald-500 font-black bg-emerald-50 px-1.5 py-0.5 rounded-md">↑ 2%</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50 group-hover:bg-white transition-colors duration-500">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Active Plan</p>
                                            <p className="text-sm font-black text-slate-700 truncate">{member.plan}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-300" /> {member.joined}
                                        </div>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-slate-300" /> {member.lastSession}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-3 rounded-b-3xl">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedMember(member);
                                                setIsChatModalOpen(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:border-indigo-100 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-50 transition-all active:scale-95"
                                        >
                                            <MessageSquare size={16} />
                                            Chat
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedMember(member);
                                                setIsProfileModalOpen(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 transition-all active:scale-95"
                                        >
                                            <Eye size={16} />
                                            Profile
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedMember(member);
                                            setIsAssignOpen(true);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200"
                                    >
                                        <ArrowUpRight size={16} />
                                        Assign Plan
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm border-dashed">
                    <User size={48} className="text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">No members found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters or search term.</p>
                </div>
            )}

            {/* Pagination */}
            {!loading && totalItems > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            Showing <span className="font-bold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-gray-900">{totalItems}</span> members
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Chat Modal */}
            <RightDrawer
                isOpen={isChatModalOpen}
                onClose={() => setIsChatModalOpen(false)}
                title={selectedMember?.name}
                subtitle="Member Online"
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-2 w-full">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && setChatMessage('')}
                        />
                        <button
                            onClick={() => setChatMessage('')}
                            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all shadow-lg shadow-blue-200"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                }
            >
                {selectedMember && (
                    <div className="flex flex-col h-full">
                        {/* Chat Body (Simulated) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/30">
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm max-w-[85%] self-start">
                                <p className="text-sm text-gray-700">Hello! I noticed you missed your session yesterday. Is everything okay with your training?</p>
                                <span className="text-[10px] font-bold text-gray-400 mt-2 block">10:30 AM</span>
                            </div>

                            <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none text-white shadow-lg shadow-blue-200 max-w-[85%] self-endml-auto">
                                <p className="text-sm font-medium">Just checking in to keep you on track!</p>
                                <span className="text-[10px] font-bold text-blue-100 mt-2 block">10:31 AM</span>
                            </div>

                            <div className="mt-auto flex justify-center pt-4">
                                <div className="px-3 py-1 bg-gray-200/50 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Today
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </RightDrawer>

            {/* Attendance Log Modal */}
            <RightDrawer
                isOpen={isAttendanceModalOpen}
                onClose={() => setIsAttendanceModalOpen(false)}
                title="Attendance Log"
                subtitle={selectedMember?.name}
                maxWidth="max-w-lg"
                footer={
                    <button onClick={() => setIsAttendanceModalOpen(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-200 active:scale-95 transition-all">Close Log</button>
                }
            >
                {selectedMember && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="space-y-3">
                                {(selectedMember?.recentWorkouts || []).length > 0 ? selectedMember.recentWorkouts.map((log, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${log.status === 'Present' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{log.date} • {log.time}</p>
                                                <p className="text-xs text-gray-500 font-medium">{log.type} Session</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${log.status === 'Present' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                                            {log.status}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-center text-gray-500 text-sm py-4">No attendance logs available for this member.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </RightDrawer>

            {/* Flag Status Modal */}
            <RightDrawer
                isOpen={isFlagModalOpen}
                onClose={() => setIsFlagModalOpen(false)}
                title="Flag Member"
                subtitle={selectedMember?.name}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full">
                        <button onClick={() => setIsFlagModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold active:scale-95 transition-all">Cancel</button>
                        <button
                            onClick={async () => {
                                await flagMember(selectedMember.id, flagReason);
                                setFlagReason('');
                                setIsFlagModalOpen(false);
                                loadMembers();
                            }}
                            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-xl shadow-red-200 active:scale-95 transition-all"
                        >
                            Flag Member
                        </button>
                    </div>
                }
            >
                {selectedMember && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">Flagging a member will notify the administration team for further review of their membership status or conduct.</p>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Reason for Flagging</label>
                                    <textarea
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all h-32 resize-none font-medium text-gray-700"
                                        placeholder="Enter detailed reason (e.g., poor conduct, payment delays, health concerns)..."
                                        value={flagReason}
                                        onChange={(e) => setFlagReason(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </RightDrawer>

            {/* Member Profile Modal */}
            {/* Member Profile Modal */}
            {/* Member Profile Modal */}
            <RightDrawer
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                title="Member Profile"
                subtitle={selectedMember?.name}
                maxWidth="max-w-7xl"
            >
                {selectedMember && (
                    <MemberProfileView memberId={selectedMember.id} onClose={() => setIsProfileModalOpen(false)} />
                )}
            </RightDrawer>

            {/* Plan Assignment Drawer */}
            <QuickAssignPlanDrawer
                isOpen={isAssignOpen}
                onClose={() => setIsAssignOpen(false)}
                memberName={selectedMember?.name}
                memberId={selectedMember?.id}
            />
        </div>
    );
};

export default AssignedMembers;
