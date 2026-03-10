import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, UserCheck, UserMinus, Download, Filter, Search, MoreVertical, ChevronLeft, ChevronRight, Eye, Trash2, X, Clock, MapPin, Smartphone, ChevronDown, Check, Loader2, Activity, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';
import { exportPDF } from '../../api/manager/managerExport';
import RightDrawer from '../../components/common/RightDrawer';
import { useBranchContext } from '../../context/BranchContext';

// Reusable Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, icon: Icon, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative min-w-[160px]" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${isOpen ? 'border-primary ring-2 ring-violet-100 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    {Icon && <Icon size={16} className="text-gray-400" />}
                    <span className="font-medium truncate">{value === 'All' ? placeholder : value}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <div className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="py-1">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => { onChange(option); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${value === option ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {option === 'All' ? placeholder : option}
                            {value === option && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DailyAttendanceReport = () => {
    const getToday = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getToday());
    const [typeFilter, setTypeFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [attendance, setAttendance] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({ totalToday: 0, membersToday: 0, staffToday: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showFilters, setShowFilters] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [directoryResults, setDirectoryResults] = useState([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const { selectedBranch } = useBranchContext();
    const itemsPerPage = 5;

    useEffect(() => {
        loadData();
    }, [selectedDate, typeFilter, searchTerm, currentPage, selectedBranch]);

    const [isSearching, setIsSearching] = useState(false);

    // Debounce search for directory results
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.trim().length >= 2) {
                fetchDirectoryResults();
            } else {
                setDirectoryResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedBranch]);

    const fetchDirectoryResults = async () => {
        try {
            setIsSearching(true);
            const res = await apiClient.get('/admin/members', {
                params: {
                    search: searchTerm.trim(),
                    limit: 8,
                    branchId: selectedBranch
                }
            });
            const members = res.data.data || [];
            // Filter out already checked-in members to avoid duplication
            const checkedInIds = new Set(attendance.map(a => a.memberId));
            setDirectoryResults(members.filter(m => !checkedInIds.has(m.memberId)));
        } catch (err) {
            console.error("Search error:", err);
            setDirectoryResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const params = {
                search: searchTerm.trim(),
                type: typeFilter === 'All' ? undefined : typeFilter,
                date: selectedDate,
                page: currentPage,
                limit: itemsPerPage,
                branchId: selectedBranch
            };

            const [attendanceRes, statsRes] = await Promise.all([
                apiClient.get('/admin/attendance', { params }),
                apiClient.get('/admin/attendance/stats', { params: { branchId: selectedBranch } })
            ]);

            const rawData = attendanceRes.data.data || [];
            const formatted = rawData.map(a => ({
                id: a.id,
                memberId: a.membershipId,
                name: a.name,
                type: a.type,
                checkIn: a.checkIn,
                checkOut: a.checkOut,
                status: a.status
            }));

            setAttendance(formatted);
            setTotalItems(attendanceRes.data.total || formatted.length);

            if (statsRes.data) {
                setAttendanceStats({
                    totalToday: statsRes.data.totalToday || 0,
                    membersToday: statsRes.data.membersToday || 0,
                    staffToday: statsRes.data.staffToday || 0
                });
            }
        } catch (error) {
            console.error('Attendance Load Error:', error);
            toast.error("Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        exportPDF(attendance, `Attendance_Report_${selectedDate}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this attendance record?')) {
            try {
                await apiClient.delete(`/admin/attendance/${id}`);
                toast.success('Record removed successfully');
                loadData();
            } catch (error) {
                console.error('Delete Error:', error);
                toast.error(error.response?.data?.message || 'Failed to remove record');
            }
        }
    };

    const handleCheckIn = async (memberId) => {
        try {
            await apiClient.post('/staff/attendance/check-in', { memberId });
            toast.success('Member checked in successfully');
            loadData();
            setSearchTerm('');
        } catch (error) {
            console.error('Check-in Error:', error);
            toast.error(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async (id, memberId) => {
        try {
            await apiClient.post('/staff/attendance/check-out', { memberId: memberId || id });
            toast.success('Successfully checked out');
            loadData();
        } catch (error) {
            console.error('Check-out Error:', error);
            toast.error(error.response?.data?.message || 'Check-out failed');
        }
    };

    const handleViewDetails = (entry) => {
        setSelectedEntry(entry);
        setIsViewModalOpen(true);
    };

    const stats = [
        { label: 'In', value: attendance.filter(a => a.status === 'checked-in').length, icon: Activity, color: 'from-emerald-500 to-emerald-600' },
        { label: 'Today', value: attendanceStats.totalToday, icon: Users, color: 'from-primary to-primary' },
        { label: 'Out', value: attendanceStats.staffToday, icon: Clock, color: 'from-slate-400 to-slate-500' },
    ];

    return (
        <div className="min-h-screen ">
            {/* Header Section */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">Attendance</h1>
                            <p className="text-slate-600 text-sm font-medium mt-1">Quick check-in / check-out</p>
                        </div>
                        <button
                            onClick={handleExport}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold"
                        >
                            <Download size={14} className="text-gray-500 md:w-4 md:h-4" /> Export as PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between group transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                        <div className="flex items-start justify-between w-full">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search Section */}
            <form
                onSubmit={(e) => { e.preventDefault(); loadData(); }}
                className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-8 flex flex-col md:flex-row gap-3 items-center"
            >
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, member code or phone..."
                        className="pl-10 pr-10 h-11 w-full rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all bg-white outline-none text-slate-800 font-medium"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        autoComplete="off"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => { setSearchTerm(''); setDirectoryResults([]); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 h-11 bg-gradient-to-r from-primary to-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-200 hover:shadow-violet-300/50 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        Search
                    </button>
                    <div className="relative w-full sm:w-auto">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="date"
                            className="w-full pl-9 h-11 px-6 rounded-xl border-2 border-slate-200 focus:border-primary text-xs font-black uppercase transition-all bg-white outline-none min-w-[160px]"
                            value={selectedDate}
                            onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>
            </form>

            {/* Search Results / Directory Search Section */}
            {searchTerm && searchTerm.length >= 2 && (
                <div className="mb-10 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Search size={14} className="text-primary" />
                            Member Search Results ({directoryResults.length})
                            {isSearching && <Loader2 size={14} className="animate-spin text-primary ml-2" />}
                        </h2>
                    </div>

                    {directoryResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {directoryResults.map((member) => (
                                <div key={member.id} className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-100 hover:border-violet-200 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full"></div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center font-black text-lg group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 leading-none mb-1 truncate text-sm">{member.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{member.memberId || 'MEM-001'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                            <span className={`text-[10px] font-bold ${member.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {member.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleCheckIn(member.id)}
                                            className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-violet-100 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Check In
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !loading && (
                        <div className="bg-white/40 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-2xl py-8 flex flex-col items-center justify-center opacity-60">
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No matching members found in directory</p>
                            <p className="text-slate-300 text-[9px] font-bold mt-1 uppercase">Try searching by phone or member ID</p>
                        </div>
                    )}
                </div>
            )}

            {/* Currently In Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <UserCheck size={14} className="text-emerald-500" /> Currently In ({attendance.filter(a => a.status === 'Inside').length})
                    </h2>
                </div>

                {attendance.filter(a => a.status === 'Inside').length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {attendance.filter(a => a.status === 'Inside').map((member) => (
                            <div key={member.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-violet-200 transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-white transition-all">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 leading-none mb-1 truncate">{member.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{member.memberId || 'MEM-001'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCheckOut(member.id, member.memberId)}
                                    className="w-full py-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:border-red-100 border border-transparent active:scale-95"
                                >
                                    Check Out
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-xl py-12 flex flex-col items-center justify-center">
                        <UserMinus size={32} className="text-gray-200 mb-2" />
                        <p className="text-gray-400 font-bold text-sm">No members currently checked in</p>
                    </div>
                )}
            </div>

            {/* Today's Log Table Section */}
            <div>
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight mb-6">
                    Today's Log ({totalItems})
                </h2>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="saas-table-wrapper">
                        <table className="saas-table saas-table-responsive">
                            <thead className="hidden sm:table-header-group bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Check-In</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 flex flex-col sm:table-row-group">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium lowercase">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                Processing request...
                                            </div>
                                        </td>
                                    </tr>
                                ) : attendance.length > 0 ? (
                                    attendance.map((row) => (
                                        <tr key={row.id} className="flex flex-col sm:table-row hover:bg-gray-50/50 transition-colors group p-4 sm:p-0 border-b sm:border-0 border-gray-100">
                                            <td className="flex justify-between items-center sm:table-cell px-2 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap">
                                                <span className="sm:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member</span>
                                                <div className="flex items-center gap-3 justify-end sm:justify-start">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs group-hover:bg-primary-light group-hover:text-primary transition-colors">
                                                        {(row.name || '?').charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="flex justify-between items-center sm:table-cell px-2 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap text-sm text-gray-500">
                                                <span className="sm:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Code</span>
                                                <span>{row.memberId || 'MEM-001'}</span>
                                            </td>
                                            <td className="flex justify-between items-center sm:table-cell px-2 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap text-sm text-gray-500">
                                                <span className="sm:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check-In</span>
                                                <span>{row.time || row.checkIn}</span>
                                            </td>
                                            <td className="flex justify-between items-center sm:table-cell px-2 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap text-sm text-gray-500">
                                                <span className="sm:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</span>
                                                <span>{row.duration || '-'}</span>
                                            </td>
                                            <td className="flex justify-between items-center sm:table-cell px-2 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap sm:text-right mt-2 sm:mt-0 pt-3 sm:pt-4 border-t sm:border-0 border-dashed border-gray-100">
                                                <span className="sm:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</span>
                                                <div className="flex justify-end gap-2 opacity-100 transition-all">
                                                    <button onClick={() => handleViewDetails(row)} className="p-2 sm:p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all bg-gray-50 sm:bg-transparent">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(row.id)} className="p-2 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all bg-gray-50 sm:bg-transparent">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-gray-400 font-medium">
                                            No members currently checked in
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalItems > 0 && (
                        <div className="px-4 sm:px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all text-xs font-bold text-gray-600"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                                    disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all text-xs font-bold text-gray-600"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Details Drawer */}
            <RightDrawer
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Log Details"
                subtitle="Attendance data overview"
                width="400px"
            >
                {selectedEntry && (
                    <div className="px-6 py-4 space-y-6">
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl font-bold text-gray-800 mb-4 border border-gray-100">
                                {(selectedEntry.name || '?').charAt(0)}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">{selectedEntry.name}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedEntry.memberId || 'MEM-001'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check-In</p>
                                <p className="text-sm font-bold text-gray-800">{selectedEntry.time || selectedEntry.checkIn || '-'}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check-Out</p>
                                <p className="text-sm font-bold text-gray-800">{selectedEntry.checkOut || '-'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsViewModalOpen(false)}
                            className="w-full py-3.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary-hover transition-all active:scale-95 shadow-sm shadow-violet-100"
                        >
                            Close Details
                        </button>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default DailyAttendanceReport;
