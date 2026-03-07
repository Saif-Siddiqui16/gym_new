import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Users, CheckCircle, FileText, Banknote,
    Edit2, Trash2, MoreHorizontal, Clock, Briefcase, Eye,
    Loader2, RefreshCw, CheckCircle2, XCircle, ArrowUpRight,
    ArrowDownLeft, UserCircle, IndianRupee, CalendarDays, AlertCircle
} from 'lucide-react';
import { fetchStaffAPI, deleteStaffAPI, fetchPayrollHistoryAPI, fetchPayrollStaffAPI } from '../../../api/admin/adminApi';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';

// ─── API Helpers ─────────────────────────────────────────────────────────────
const getLiveAttendance = async () => {
    const res = await apiClient.get('/admin/attendance/live');
    return res.data;
};

const getTodayStaffAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await apiClient.get('/admin/attendance', {
        params: { type: 'Staff', date: today, limit: 100 }
    });
    return res.data;
};

const getAttendanceStats = async () => {
    const res = await apiClient.get('/admin/attendance/stats');
    return res.data;
};

// ─── Component ───────────────────────────────────────────────────────────────
const Payroll = () => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();

    const [staffList, setStaffList] = useState([]);
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [liveAttendance, setLiveAttendance] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({ currentlyIn: 0, totalToday: 0, membersToday: 0, staffToday: 0 });

    const [loading, setLoading] = useState(true);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [payrollLoading, setPayrollLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Employees');
    const [openMenuId, setOpenMenuId] = useState(null);

    // ── Load Staff ────────────────────────────────────────────────────────────
    const loadStaff = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchStaffAPI(selectedBranch);
            const normalized = (Array.isArray(data) ? data : []).map(s => {
                let config = {};
                try {
                    config = typeof s.config === 'string' ? JSON.parse(s.config) : (s.config || {});
                } catch (e) { }

                return {
                    ...s,
                    // Ensure baseSalary is a number or null, not affected by falsy 0
                    baseSalary: (s.baseSalary !== null && s.baseSalary !== undefined) ? Number(s.baseSalary) : null,
                    // Use commission from config if commissionPercent is missing
                    commissionPercent: s.commissionPercent ?? config.commission ?? config.commissionPercent ?? 0,
                    position: config.position || s.role || 'Staff',
                };
            });
            setStaffList(normalized);
        } catch (err) {
            console.error('[loadStaff]', err);
            toast.error('Failed to load staff list');
        } finally {
            setLoading(false);
        }
    }, [selectedBranch]);

    // ── Load Payroll ──────────────────────────────────────────────────────────
    const loadPayroll = useCallback(async () => {
        setPayrollLoading(true);
        try {
            const data = await fetchPayrollHistoryAPI();
            setPayrollHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('[loadPayroll]', err);
        } finally {
            setPayrollLoading(false);
        }
    }, []);

    // ── Load Attendance ───────────────────────────────────────────────────────
    const loadAttendance = useCallback(async () => {
        setAttendanceLoading(true);
        try {
            const [liveRes, todayRes, statsRes] = await Promise.all([
                getLiveAttendance(),
                getTodayStaffAttendance(),
                getAttendanceStats()
            ]);
            // Filter live to staff only
            const liveStaff = (liveRes?.data || []).filter(a => a.type === 'Staff');
            setLiveAttendance(liveStaff);
            setTodayAttendance(todayRes?.data || []);
            setAttendanceStats(statsRes || { currentlyIn: 0, totalToday: 0, membersToday: 0, staffToday: 0 });
        } catch (err) {
            console.error('[loadAttendance]', err);
        } finally {
            setAttendanceLoading(false);
        }
    }, []);

    useEffect(() => { loadStaff(); }, [loadStaff]);
    useEffect(() => { if (activeTab === 'Payroll') loadPayroll(); }, [activeTab, loadPayroll]);
    useEffect(() => { if (activeTab === 'Attendance') loadAttendance(); }, [activeTab, loadAttendance]);

    // Close context menu on outside click
    useEffect(() => {
        const close = () => setOpenMenuId(null);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleDeleteStaff = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;
        try {
            await deleteStaffAPI(id);
            toast.success('Staff deleted successfully');
            setStaffList(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete staff');
        }
    };

    // ── Computed Values ───────────────────────────────────────────────────────
    const filteredStaff = staffList.filter(s =>
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeStaffCount = staffList.filter(s => s.status === 'Active').length;
    const totalMonthlyPayroll = staffList.reduce((acc, s) => acc + (parseFloat(s.baseSalary) || 0), 0);
    // Count staff with baseSalary > 0 as "Active Contracts"
    const activeContractsCount = staffList.filter(s => parseFloat(s.baseSalary) > 0).length;

    // Month picker default to current month
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Filter payroll by selected month (YYYY-MM)
    const filteredPayroll = payrollHistory.filter(p => {
        const [yr, mo] = selectedMonth.split('-');
        return p.year === parseInt(yr) && p.month === parseInt(mo);
    });

    // ── Duration helper ───────────────────────────────────────────────────────
    const calcDuration = (checkIn, checkOut) => {
        if (!checkIn) return '-';
        const end = checkOut ? new Date(checkOut) : new Date();
        const diffMs = end - new Date(checkIn);
        if (diffMs < 0) return '-';
        const mins = Math.floor(diffMs / 60000);
        const h = Math.floor(mins / 60), m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    // ── Status Badge ──────────────────────────────────────────────────────────
    const StatusBadge = ({ status }) => {
        const map = {
            'Active': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'Inactive': 'bg-slate-50 text-slate-500 border-slate-100',
            'Suspended': 'bg-rose-50 text-rose-600 border-rose-100',
            'checked-in': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'checked-out': 'bg-slate-50 text-slate-500 border-slate-100',
            'Processed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'Pending': 'bg-amber-50 text-amber-700 border-amber-100',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${map[status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {status}
            </span>
        );
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-violet-50/30 min-h-screen p-6 md:p-8 font-sans pb-24">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                            {activeTab === 'Attendance' ? 'Staff Attendance' : 'Human Resources'}
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            {activeTab === 'Attendance' ? 'Live staff attendance for this branch' : 'Manage employees, contracts, attendance & payroll'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/hr/staff/create')}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-violet-500/30/30 hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activeTab === 'Attendance' ? (
                        <>
                            <StatCard icon={Users} label="Currently On Duty" value={attendanceStats.staffToday || liveAttendance.length} color="emerald" />
                            <StatCard icon={CheckCircle} label="Today's Staff Check-ins" value={attendanceStats.staffToday || todayAttendance.length} color="blue" />
                            <StatCard icon={Clock} label="Completed Shifts" value={todayAttendance.filter(a => a.status === 'checked-out').length} color="indigo" />
                            <StatCard icon={UserCircle} label="Total Staff" value={staffList.length} color="purple" />
                        </>
                    ) : (
                        <>
                            <StatCard icon={Users} label="Total Employees" value={staffList.length} color="indigo" />
                            <StatCard icon={CheckCircle} label="Active" value={activeStaffCount} color="emerald" />
                            <StatCard icon={FileText} label="Active Contracts" value={activeContractsCount} color="amber" />
                            <StatCard icon={Banknote} label="Monthly Payroll" value={`₹${totalMonthlyPayroll.toLocaleString('en-IN')}`} color="purple" isText />
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
                    {['Employees', 'Contracts', 'Attendance', 'Payroll'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab
                                ? 'border-violet-600 text-violet-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── EMPLOYEES TAB ──────────────────────────────────────────────── */}
            {activeTab === 'Employees' && (
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-black text-slate-800">All Employees</h2>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 shadow-sm transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-2xl md:rounded-[32px] shadow-sm border border-white/50 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Employee', 'Code', 'Department', 'Position', 'Salary', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {loading ? (
                                    <tr><td colSpan="7" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={32} /></td></tr>
                                ) : filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <UserCircle size={48} className="text-slate-200" />
                                                <h3 className="text-lg font-black text-slate-800">No employees found</h3>
                                                <p className="text-slate-400 text-sm font-medium">No employees match the current search or branch filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((staff, idx) => (
                                        <tr key={staff.id || idx} className="group hover:bg-white transition-all duration-300">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                                                        {(staff.name || '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm leading-tight">{staff.name}</div>
                                                        <div className="text-xs text-slate-400 font-medium mt-0.5">{staff.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                                                EMP-{String(staff.id || idx + 1).padStart(3, '0')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                                {staff.department || 'Operations'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                                    {staff.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                                {staff.baseSalary != null ? `₹${Number(staff.baseSalary).toLocaleString('en-IN')}` : <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={staff.status || 'Active'} />
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button
                                                    onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === staff.id ? null : staff.id); }}
                                                    className="p-2 text-slate-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                {openMenuId === staff.id && (
                                                    <div className="absolute right-8 top-12 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                                        <button onClick={() => navigate(`/hr/staff/edit/${staff.id}`, { state: { readOnly: true } })} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-colors">
                                                            <Eye size={16} /> View Profile
                                                        </button>
                                                        <button onClick={() => navigate(`/hr/staff/edit/${staff.id}`)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-colors">
                                                            <Edit2 size={16} /> Edit Profile
                                                        </button>
                                                        <button onClick={() => handleDeleteStaff(staff.id)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">
                                                            <Trash2 size={16} /> Delete Staff
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── CONTRACTS TAB ──────────────────────────────────────────────── */}
            {activeTab === 'Contracts' && (
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-800">All Contracts</h2>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeContractsCount} active contracts</span>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-2xl md:rounded-[32px] shadow-sm border border-white/50 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Employee', 'Code', 'Position', 'Base Salary / mo', 'Commission %', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {loading ? (
                                    <tr><td colSpan="7" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={32} /></td></tr>
                                ) : staffList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <FileText size={48} className="text-slate-200" />
                                                <h3 className="text-lg font-black text-slate-800">No contracts found</h3>
                                                <p className="text-slate-400 text-sm">Add staff members to see their contracts here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    staffList.map((staff, idx) => (
                                        <tr key={staff.id} className="hover:bg-white transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                                                        {(staff.name || '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{staff.name}</p>
                                                        <p className="text-xs text-slate-400">{staff.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                                                EMP-{String(staff.id || idx + 1).padStart(3, '0')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                                    {staff.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                                {staff.baseSalary != null ? `₹${Number(staff.baseSalary).toLocaleString('en-IN')}` : <span className="text-slate-300 font-normal italic text-xs">Not set</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                                {(staff.commissionPercent != null && staff.commissionPercent > 0) ? `${staff.commissionPercent}%` : <span className="text-slate-300 font-normal italic text-xs">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={staff.status || 'Active'} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => navigate(`/hr/staff/edit/${staff.id}`)} className="text-violet-600 hover:text-violet-700 text-xs font-bold flex items-center gap-1 hover:underline">
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── ATTENDANCE TAB ─────────────────────────────────────────────── */}
            {activeTab === 'Attendance' && (
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800">Staff Attendance — Today</h2>
                        <button
                            onClick={loadAttendance}
                            disabled={attendanceLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={attendanceLoading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>

                    {/* Currently On Duty */}
                    <div>
                        <h3 className="text-base font-black text-slate-700 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                            Currently On Duty ({liveAttendance.length})
                        </h3>
                        <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {['Staff Member', 'Role', 'Check-in Time', 'Duration', 'Status'].map(h => (
                                            <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    {attendanceLoading ? (
                                        <tr><td colSpan="5" className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={28} /></td></tr>
                                    ) : liveAttendance.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Clock size={40} className="text-slate-200" />
                                                    <p className="text-slate-400 font-bold text-sm">No staff currently on duty</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        liveAttendance.map(a => (
                                            <tr key={a.id} className="hover:bg-white transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm">
                                                            {(a.name || '?').charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-slate-800 text-sm">{a.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-widest">
                                                        {a.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{a.time}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-emerald-600">{a.duration || 'Ongoing'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        On Duty
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Today's Full Log */}
                    <div>
                        <h3 className="text-base font-black text-slate-700 mb-4 flex items-center gap-2">
                            <CalendarDays size={18} className="text-violet-500" />
                            Today's Full Log ({todayAttendance.length})
                        </h3>
                        <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {['Staff Member', 'Role', 'Check-in', 'Check-out', 'Status'].map(h => (
                                            <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    {attendanceLoading ? (
                                        <tr><td colSpan="5" className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={28} /></td></tr>
                                    ) : todayAttendance.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Briefcase size={40} className="text-slate-200" />
                                                    <p className="text-slate-400 font-bold text-sm">No staff attendance records for today</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        todayAttendance.map(a => (
                                            <tr key={a.id} className="hover:bg-white transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${a.status === 'checked-in' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {(a.name || '?').charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-slate-800 text-sm">{a.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-widest">
                                                        {a.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                                    <span className="flex items-center gap-1 text-emerald-600"><ArrowDownLeft size={14} />{a.checkIn || '-'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                                    {a.checkOut !== '-' ? (
                                                        <span className="flex items-center gap-1 text-rose-500"><ArrowUpRight size={14} />{a.checkOut}</span>
                                                    ) : (
                                                        <span className="text-slate-300 italic text-xs">Still in</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={a.status === 'checked-in' ? 'checked-in' : 'checked-out'} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── PAYROLL TAB ────────────────────────────────────────────────── */}
            {activeTab === 'Payroll' && (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payroll Processing</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">View and process monthly payroll for this branch</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                                className="h-10 pl-4 pr-3 rounded-lg border border-slate-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-50 text-sm font-medium text-slate-700 bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Payroll Table — current staff with salaries */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    {['Employee', 'Code', 'Position', 'Base Salary', 'Commission', 'Net Pay', 'Status'].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payrollLoading ? (
                                    <tr><td colSpan="7" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-violet-500" size={28} /></td></tr>
                                ) : staffList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center">
                                            <Banknote size={48} className="text-slate-200 mx-auto mb-3 stroke-1" />
                                            <p className="text-slate-400 font-bold text-sm">No staff found for payroll</p>
                                        </td>
                                    </tr>
                                ) : (
                                    staffList.map((staff, idx) => {
                                        const base = parseFloat(staff.baseSalary) || 0;
                                        const commission = parseFloat(staff.commissionPercent) || 0;
                                        const pf = base * 0.12;
                                        const net = base - pf;
                                        // Find matching payroll record for this month
                                        const [yr, mo] = selectedMonth.split('-');
                                        const payRecord = payrollHistory.find(
                                            p => p.staffId === staff.id && p.year === parseInt(yr) && p.month === parseInt(mo)
                                        );
                                        return (
                                            <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                                                            {(staff.name || '?').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">{staff.name}</p>
                                                            <p className="text-xs text-slate-400">{staff.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 font-semibold">
                                                    EMP-{String(staff.id || idx + 1).padStart(3, '0')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-black uppercase tracking-widest border border-slate-100">{staff.role}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                                    {base >= 0 ? `₹${base.toLocaleString('en-IN')}` : <span className="text-slate-300 italic text-xs">Not set</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                                                    {commission > 0 ? `${commission}%` : <span className="text-slate-300 italic text-xs">N/A</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-black text-slate-800">
                                                    {base >= 0 ? `₹${net.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : <span className="text-slate-300 italic text-xs">—</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={payRecord?.status || 'Pending'} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Payroll Summary */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                        <h3 className="text-base font-bold text-slate-800 mb-6">
                            Payroll Summary — {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Base Pay', val: `₹${totalMonthlyPayroll.toLocaleString('en-IN')}`, color: 'text-slate-800' },
                                { label: 'Total PF (12%)', val: `₹${(totalMonthlyPayroll * 0.12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-rose-500' },
                                { label: 'Net Payable', val: `₹${(totalMonthlyPayroll * 0.88).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-emerald-600' },
                                { label: 'Staff Count', val: staffList.length, color: 'text-violet-600' },
                            ].map(({ label, val, color }) => (
                                <div key={label}>
                                    <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
                                    <p className={`text-xl font-black ${color}`}>{val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Reusable Stat Card ────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, isText }) => {
    const colorMap = {
        indigo: 'bg-violet-50 text-violet-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600',
        blue: 'bg-violet-50 text-violet-600',
        rose: 'bg-rose-50 text-rose-600',
    };
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${colorMap[color] || colorMap.indigo} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{value ?? 0}</h3>
            </div>
        </div>
    );
};

export default Payroll;
