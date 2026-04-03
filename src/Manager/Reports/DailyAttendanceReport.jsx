import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, UserCheck, UserMinus, Download, Filter, Search, MoreVertical, ChevronLeft, ChevronRight, Eye, Trash2, X, Clock, MapPin, Smartphone, ChevronDown, Check, Loader2, Activity, ScanLine, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';
import { exportPDF } from '../../api/manager/managerExport';
import RightDrawer from '../../components/common/RightDrawer';
import { useBranchContext } from '../../context/BranchContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';

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
    const [smartRecords, setSmartRecords] = useState([]);
    const [smartStats, setSmartStats] = useState({ today: 0, total: 0 });
    const { selectedBranch } = useBranchContext();
    const itemsPerPage = 5;
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

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
            const res = await apiClient.get('/staff/attendance/search-all', {
                params: {
                    search: searchTerm.trim(),
                    branchId: selectedBranch
                }
            });
            const results = res.data.data || [];
            // Filter out already checked-in people
            const checkedInIds = new Set(attendance.filter(a => a.status === 'Inside').map(a => a.memberId));
            setDirectoryResults(results.filter(r => r.personType !== 'Member' || !checkedInIds.has(r.code)));
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
            const page = currentPage;
            const limit = itemsPerPage;
            const search = searchTerm.trim();
            const date = selectedDate;

            // Normalize branchId — "all" means no filter
            const branchId = selectedBranch && selectedBranch !== 'all' ? selectedBranch : null;

            // Fetch everything needed
            const [attendanceRes, statsRes, smartLogs, smartSummaryData] = await Promise.all([
                apiClient.get(`/admin/attendance?page=${page}&limit=${limit}&search=${search}&date=${date}`),
                apiClient.get('/admin/attendance/stats'),
                import('../../api/gymDeviceApi').then(api => api.fetchFaceAccessRecords(branchId, date)).catch(() => []),
                import('../../api/gymDeviceApi').then(api => api.fetchGymAttendanceSummary(1, 10, branchId).catch(() => ({ today: 0, total: 0 })))
            ]);

            const rawData = attendanceRes.data.data || [];
            
            // Stats Logic
            // Backend returns scanTime as ISO or string; we normalize to local comparison
            const hardwareScans = (smartLogs || []).filter(log => {
                if (!log.createTime) return false;
                const scanDateStr = new Date(log.createTime.replace(' ', 'T')).toLocaleDateString('en-CA');
                return scanDateStr === date;
            });
            setSmartRecords(hardwareScans);

            // Backend already returns formatted time strings like "10:33 am"
            // Duration helper using pre-formatted strings (e.g. "10:17 am" vs "10:23 am")
            const calcDuration = (checkIn, checkOut) => {
                if (!checkIn || !checkOut || checkOut === '-' || checkIn === '-') return '-';
                try {
                    // Parse "hh:mm am/pm" strings into today's date for diff
                    const parseTime = (str) => {
                        const [time, period] = str.trim().split(' ');
                        let [h, m] = time.split(':').map(Number);
                        if (period?.toLowerCase() === 'pm' && h !== 12) h += 12;
                        if (period?.toLowerCase() === 'am' && h === 12) h = 0;
                        const d = new Date();
                        d.setHours(h, m, 0, 0);
                        return d;
                    };
                    const diffMs = parseTime(checkOut) - parseTime(checkIn);
                    if (diffMs <= 0) return '-';
                    const totalMins = Math.floor(diffMs / 60000);
                    const hrs = Math.floor(totalMins / 60);
                    const mins = totalMins % 60;
                    if (hrs > 0) return `${hrs}h ${mins}m`;
                    return `${mins}m`;
                } catch (e) { return '-'; }
            };

            const formatted = rawData.map(a => ({
                id: a.id,
                userId: a.userId || null,
                memberId: a.membershipId,
                name: a.name,
                type: a.type,
                role: a.role,
                checkIn: a.checkIn || a.time || '-',
                checkOut: a.checkOut || '-',
                duration: calcDuration(a.checkIn || a.time, a.checkOut),
                status: a.status,
                checkInMethod: a.checkInMethod || 'manual'
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

            // Stats Logic
            setSmartStats({
                today: (smartSummaryData?.today > 0) ? smartSummaryData.today : hardwareScans.length,
                total: (smartSummaryData?.total > 0) ? smartSummaryData.total : (Array.isArray(smartLogs) ? smartLogs.length : 0)
            });

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

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await apiClient.delete(`/admin/attendance/${confirmModal.id}`);
            toast.success('Record removed successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            loadData();
        } catch (error) {
            console.error('Delete Error:', error);
            toast.error(error.response?.data?.message || 'Failed to remove record');
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleCheckIn = async (payload) => {
        try {
            // payload = { memberId, type } or { userId, type }
            const body = typeof payload === 'object' ? payload : { memberId: payload, type: 'Member' };
            await apiClient.post('/staff/attendance/check-in', body);
            toast.success(`${body.type || 'Member'} checked in successfully`);
            loadData();
            setSearchTerm('');
            setDirectoryResults([]);
        } catch (error) {
            console.error('Check-in Error:', error);
            toast.error(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async (attendanceId, memberId, entry) => {
        try {
            const isStaffOrTrainer = entry?.type === 'Staff' || entry?.type === 'Trainer' || entry?.role === 'TRAINER' || entry?.role === 'STAFF';
            const body = isStaffOrTrainer
                ? { userId: entry.userId || attendanceId, type: entry.type || (entry.role === 'TRAINER' ? 'Trainer' : 'Staff') }
                : { memberId: memberId || attendanceId, type: 'Member' };
            await apiClient.post('/staff/attendance/check-out', body);
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
        { label: 'Manual In', value: attendance.filter(a => a.status === 'checked-in' || a.status === 'Inside').length, icon: Activity, color: 'from-emerald-500 to-emerald-600' },
        { label: 'Today Total', value: attendanceStats.totalToday, icon: Users, color: 'from-primary to-primary' },
        { label: 'Smart Face (Today)', value: smartStats.today, icon: Smartphone, color: 'from-violet-500 to-purple-600' },
        { label: 'Smart Face (Total)', value: smartStats.total, icon: ShieldCheck, color: 'from-blue-500 to-indigo-600' },
    ];

    return (
        <div className="min-h-screen ">
            {/* ... Existing KPI and Search sections ... */}
            {/* Header Section */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">Attendance</h1>
                            <p className="text-slate-600 text-sm font-medium mt-1">Quick check-in / check-out</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-xl border border-violet-100">
                                <ScanLine size={16} className="text-primary animate-pulse" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-wider">AIoT Hardware Active</span>
                            </div>
                            <button
                                onClick={handleExport}
                                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold"
                            >
                                <Download size={14} className="text-gray-500 md:w-4 md:h-4" /> Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

            {/* ... Rest of existing search and directory results ... */}
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
                            {directoryResults.map((person) => {
                                const typeColors = {
                                    Member: 'bg-primary-light text-primary',
                                    Trainer: 'bg-amber-50 text-amber-700',
                                    Staff: 'bg-teal-50 text-teal-700'
                                };
                                return (
                                    <div key={`${person.personType}-${person.id}`} className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-100 hover:border-violet-200 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full"></div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center font-black text-lg group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                {person.name?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 leading-none mb-1 truncate text-sm">{person.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{person.code || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${typeColors[person.personType] || 'bg-slate-100 text-slate-600'}`}>
                                                {person.personType}
                                            </span>
                                            <button
                                                onClick={() => handleCheckIn(person.checkInPayload)}
                                                className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-violet-100 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all"
                                            >
                                                Check In
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
                        <UserCheck size={14} className="text-emerald-500" /> Currently In ({attendance.filter(a => a.status === 'Inside' || a.status === 'checked-in').length})
                    </h2>
                </div>

                {attendance.filter(a => a.status === 'Inside' || a.status === 'checked-in').length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {attendance.filter(a => a.status === 'Inside' || a.status === 'checked-in').map((person) => {
                            const typeColors = {
                                Member: 'bg-primary-light text-primary',
                                Trainer: 'bg-amber-50 text-amber-700',
                                Staff: 'bg-teal-50 text-teal-700',
                                TRAINER: 'bg-amber-50 text-amber-700',
                                STAFF: 'bg-teal-50 text-teal-700'
                            };
                            const displayType = person.type || person.role || 'Member';
                            return (
                                <div key={person.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-violet-200 transition-all group">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-white transition-all">
                                            {person.name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 leading-none mb-1 truncate">{person.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{person.memberId || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${typeColors[displayType] || 'bg-slate-100 text-slate-600'}`}>
                                            {displayType}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">In: {person.checkIn}</span>
                                    </div>
                                    <button
                                        onClick={() => handleCheckOut(person.id, person.memberId, person)}
                                        className="w-full py-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:border-red-100 border border-transparent active:scale-95"
                                    >
                                        Check Out
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-xl py-12 flex flex-col items-center justify-center">
                        <UserMinus size={32} className="text-gray-200 mb-2" />
                        <p className="text-gray-400 font-bold text-sm">No members currently checked in</p>
                    </div>
                )}
            </div>

            {/* Today's Log Table Section */}
            <div className="mb-12">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
                    <Calendar size={14} className="text-primary" /> Today's Manual Attendance ({attendance.filter(a => a.checkInMethod !== 'biometric').length})
                </h2>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Member</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Code</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Check-In</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Check-Out</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                <span>Fetching data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : attendance.filter(a => a.checkInMethod !== 'biometric').length > 0 ? (
                                    attendance.filter(a => a.checkInMethod !== 'biometric').map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs group-hover:bg-primary-light group-hover:text-primary transition-colors">
                                                        {(row.name || '?').charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <div className="flex flex-col gap-1">
                                                    <span>{row.memberId || 'MEM-001'}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        Method: {row.checkInMethod === 'biometric' ? 'Face Scan' : 'Manual'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-700">
                                                {row.checkIn || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                                <span className={`${row.checkOut && row.checkOut !== '-' ? 'text-rose-500' : 'text-slate-300'}`}>{row.checkOut || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                                                {row.duration}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleViewDetails(row)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(row.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            No manual recordings for this date
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && totalItems > itemsPerPage && (
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all text-xs font-bold text-slate-600"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                                    disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all text-xs font-bold text-slate-600"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Smart AIoT Section */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Smartphone size={14} className="text-primary" /> Smart AIoT Access (Hardware Sync)
                    </h2>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Live Feed</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">User / Member</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Device</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Method</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Photo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                                        </td>
                                    </tr>
                                ) : smartRecords.length > 0 ? (
                                    smartRecords.slice(0, 50).map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center font-black text-primary border border-violet-100">
                                                        {(record.personName || 'V').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 leading-none mb-1">
                                                            {record.personName || 'Unknown Visitor'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                            {record.personSn || 'Hardware ID: ' + record.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck size={14} className="text-primary" />
                                                    <span className="text-[10px] font-black text-slate-700 tracking-wider uppercase">{record.deviceName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                                    {['face_0', 'face_1', 'face_2'].includes(record.passType) ? 'Face Scan' : (record.passType || 'ID Card')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-black text-slate-900 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 inline-flex items-center gap-2">
                                                    <Clock size={12} className="text-slate-400" />
                                                    {(() => {
                                                        if (!record.createTime) return '-';
                                                        const date = new Date(record.createTime);
                                                        // Ensure display is in IST (UTC + 5:30)
                                                        return date.toLocaleTimeString('en-IN', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit', 
                                                            second: '2-digit', 
                                                            hour12: false, 
                                                            timeZone: 'Asia/Kolkata' 
                                                        });
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {record.imageUrl ? (
                                                    <img src={record.imageUrl} alt="Scan" className="w-10 h-10 rounded-lg object-cover ml-auto ring-2 ring-slate-100 border border-white" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center ml-auto border border-dashed border-slate-200 outline-none">
                                                        <Activity size={12} className="text-slate-300" />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            No hardware logs found for this date
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Remove Attendance Record?"
                message="This attendance record will be permanently deleted from the daily log."
                confirmText="Remove"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default DailyAttendanceReport;
