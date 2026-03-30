import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Users, CheckCircle, FileText, Banknote, Edit2,
    Trash2, MoreHorizontal, Clock, Briefcase, Eye, Loader2, RefreshCw,
    CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft, UserCircle,
    IndianRupee, CalendarDays, AlertCircle, FileDown
} from 'lucide-react';
import { 
    fetchStaffAPI, 
    deleteStaffAPI, 
    fetchPayrollHistoryAPI, 
    generatePayrollAPI, 
    updatePayrollStatusAPI, 
    deletePayrollAPI 
} from '../../../api/admin/adminApi';
import { syncStaffToMipsAPI } from '../../../api/manager/managerApi';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { Cpu } from 'lucide-react';

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
    const [activeMenu, setActiveMenu] = useState(null); // { id, top, right }
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [selectedStaffIds, setSelectedStaffIds] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, action: null, label: '', loading: false });

    // ── Load Staff ────────────────────────────────────────────────────────────
    const loadStaff = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchStaffAPI(selectedBranch);
            const normalized = (Array.isArray(data) ? data : []).map(s => {
                let config = {};
                try {
                    config = typeof s.config === 'string' ? JSON.parse(s.config) : (s.config || {});
                } catch {
                    // ignore
                }

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
        const close = () => setActiveMenu(null);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);

    const toggleMenu = (e, item) => {
        e.stopPropagation();
        const id = item.id || item.idx;
        if (activeMenu?.id === id) {
            setActiveMenu(null);
        } else {
            setActiveMenu({ id });
        }
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleDeleteStaff = (id) => {
        setConfirmModal({ isOpen: true, id, action: 'staff', label: 'staff member', loading: false });
    };

    const handleSyncToMips = async (staffId) => {
        try {
            toast.loading('Syncing with MIPS Hardware...', { id: 'mips-sync' });
            await syncStaffToMipsAPI(staffId);
            toast.success('Staff synced to MIPS Hardware!', { id: 'mips-sync' });
            loadStaff(); // Reload to get updated status
        } catch (error) {
            console.error('[handleSyncToMips]', error);
            toast.error(error.response?.data?.message || 'Biometric Sync Failed', { id: 'mips-sync' });
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

    // Selection helpers for payroll tab
    const allSelected = staffList.length > 0 && selectedStaffIds.length === staffList.length;
    const someSelected = selectedStaffIds.length > 0 && !allSelected;

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedStaffIds([]);
        } else {
            setSelectedStaffIds(staffList.map(s => s.id));
        }
    };

    const toggleSelectStaff = (id) => {
        setSelectedStaffIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
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

    // ── MIPS Status Badge ─────────────────────────────────────────────────────
    const MipsStatusBadge = ({ status, syncedAt, onSync }) => {
        const map = {
            'synced': { label: 'Synced', style: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
            'pending': { label: 'Pending', style: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
            'failed': { label: 'Failed', style: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' },
            'loading': { label: 'Syncing', style: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-500 animate-pulse' },
        };
        const config = map[status] || map.pending;

        return (
            <div className="flex flex-col gap-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.style}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {status || 'Pending'}
                </span>
                {status !== 'synced' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSync(); }}
                        className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1 pl-1"
                    >
                        <RefreshCw size={10} /> Sync Now
                    </button>
                )}
                {syncedAt && status === 'synced' && (
                    <span className="text-[9px] text-slate-400 font-medium pl-1 italic">
                        {new Date(syncedAt).toLocaleDateString()}
                    </span>
                )}
            </div>
        );
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-primary-light/30 min-h-screen font-sans pb-24">
            {/* Header */}
            <div className="max-w-full mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-primary to-emerald-600 bg-clip-text text-transparent">
                            {activeTab === 'Attendance' ? 'Staff Attendance' : 'Human Resources'}
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            {activeTab === 'Attendance' ? 'Live staff attendance for this branch' : 'Manage employees, contracts, attendance & payroll'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/hr/staff/create')}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-primary/30/30 hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-full mx-auto mb-8">
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
            <div className="max-w-full mx-auto mb-8">
                <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
                    {['Employees', 'Contracts', 'Attendance', 'Payroll'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── EMPLOYEES TAB ──────────────────────────────────────────────── */}
            {activeTab === 'Employees' && (
                <div className="max-w-full mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-black text-slate-800">All Employees</h2>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary shadow-sm transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-2xl md:rounded-[32px] shadow-sm border border-white/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {['Employee', 'Code', 'Department', 'Position', 'Salary', 'Status', 'MIPS Sync', 'Actions'].map(h => (
                                            <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    {loading ? (
                                        <tr><td colSpan="7" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></td></tr>
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
                                                        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white font-black text-sm shadow-sm">
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
                                                <td className="px-6 py-4">
                                                    <MipsStatusBadge 
                                                        status={staff.mipsSyncStatus} 
                                                        syncedAt={staff.mipsSyncedAt}
                                                        onSync={() => handleSyncToMips(staff.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right relative">
                                                    <button
                                                        onClick={e => toggleMenu(e, { ...staff, idx })}
                                                        className={`p-2 rounded-lg transition-all ${activeMenu?.id === (staff.id || idx) ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-primary hover:bg-primary-light'
                                                            }`}
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                    {activeMenu?.id === (staff.id || idx) && (
                                                        <>
                                                            {/* Backdrop to close menu */}
                                                            <div
                                                                className="fixed inset-0 z-[90] cursor-default"
                                                                onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }}
                                                            />
                                                            <div
                                                                className={`absolute right-8 w-48 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-[100] py-2 animate-in fade-in zoom-in-95 duration-200 ${(idx >= filteredStaff.length - 2 && filteredStaff.length > 2) ? 'bottom-12 mb-2 origin-bottom-right' : 'top-12 mt-2 origin-top-right'
                                                                    }`}
                                                            >
                                                                <button onClick={() => navigate(`/hr/staff/edit/${staff.id}`, { state: { readOnly: true } })} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
                                                                    <Eye size={16} /> View Profile
                                                                </button>
                                                                <button onClick={() => navigate(`/hr/staff/edit/${staff.id}`)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
                                                                    <Edit2 size={16} /> Edit Profile
                                                                </button>
                                                                <div className="h-px bg-slate-50 my-1 mx-2" />
                                                                <button
                                                                    onClick={() => handleDeleteStaff(staff.id)}
                                                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                                                                >
                                                                    <Trash2 size={16} /> Delete Staff
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
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

            {/* ─── CONTRACTS TAB ──────────────────────────────────────────────── */}
            {activeTab === 'Contracts' && (
                <div className="max-w-full mx-auto">
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
                                    <tr><td colSpan="7" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></td></tr>
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
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white font-black text-sm">
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
                                                <button onClick={() => navigate(`/hr/staff/edit/${staff.id}`)} className="text-primary hover:text-primary-hover text-xs font-bold flex items-center gap-1 hover:underline">
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
                <div className="max-w-full mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800">Staff Attendance — Today</h2>
                        <button
                            onClick={loadAttendance}
                            disabled={attendanceLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-violet-300 hover:text-primary transition-colors disabled:opacity-50"
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
                                        <tr><td colSpan="5" className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={28} /></td></tr>
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
                            <CalendarDays size={18} className="text-primary" />
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
                                        <tr><td colSpan="5" className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={28} /></td></tr>
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
                <div className="max-w-full mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payroll Processing</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">View and process monthly payroll for this branch</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                                className="h-11 pl-4 pr-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary-light text-sm font-semibold text-slate-700 bg-white outline-none transition-all shadow-sm"
                            />
                            <button
                                onClick={async () => {
                                    const [yr, mo] = selectedMonth.split('-');
                                    toast.promise(
                                        generatePayrollAPI(parseInt(yr), parseInt(mo), selectedStaffIds).then(res => {
                                            setSelectedStaffIds([]);
                                            loadPayroll();
                                            return res;
                                        }),
                                        {
                                            loading: `Generating payroll for ${selectedStaffIds.length} employee(s)...`,
                                            success: 'Payroll Generated Successfully!',
                                            error: 'Failed to generate payroll'
                                        }
                                    );
                                }}
                                disabled={selectedStaffIds.length === 0}
                                className={`h-11 px-6 rounded-xl text-sm font-bold flex items-center gap-2 transition-all outline-none shadow-sm ${
                                    selectedStaffIds.length === 0
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                        : 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95 shadow-md'
                                }`}
                            >
                                <Banknote size={16} />
                                Generate Payroll
                                {selectedStaffIds.length > 0 && (
                                    <span className="bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-full">
                                        {selectedStaffIds.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Selection hint */}
                    {staffList.length > 0 && selectedStaffIds.length === 0 && (
                        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 font-medium">
                            <AlertCircle size={14} className="shrink-0" />
                            Select one or more employees from the table below, then click &quot;Generate Payroll&quot;.
                        </div>
                    )}


                    {/* Payroll Table — Staff list with payroll data overlay */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-4 py-4 w-12">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={el => { if (el) el.indeterminate = someSelected; }}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded accent-primary cursor-pointer"
                                        />
                                    </th>
                                    {['Employee Name', 'Employee Code', 'Position', 'Base Salary', 'Attendance Days', 'Leave Days', 'Commission', 'Net Pay', 'Status', 'Action'].map(h => (
                                        <th key={h} className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payrollLoading ? (
                                    <tr><td colSpan="11" className="py-16 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={28} /></td></tr>
                                ) : staffList.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="py-20 text-center">
                                            <Users size={48} className="text-slate-200 mx-auto mb-3 stroke-1" />
                                            <p className="text-slate-400 font-bold text-sm">No staff found for this branch</p>
                                        </td>
                                    </tr>
                                ) : (
                                    staffList.map((staff) => {
                                        // Find matching generated payroll for the selected month
                                        const payRecord = filteredPayroll.find(p => p.staffId === staff.id);
                                        const isSelected = selectedStaffIds.includes(staff.id);

                                        return (
                                            <tr key={staff.id} className={`transition-colors ${isSelected ? 'bg-primary-light/20' : 'hover:bg-slate-50'}`}>
                                                <td className="px-4 py-4 w-12">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectStaff(staff.id)}
                                                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white font-black text-sm shrink-0">
                                                            {(staff.name || '?').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">{staff.name}</p>
                                                            <p className="text-xs text-slate-400">{staff.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-slate-500 font-semibold">
                                                    EMP-{String(staff.id).padStart(3, '0')}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-black uppercase tracking-widest border border-slate-100">{staff.role}</span>
                                                </td>
                                                <td className="px-4 py-4 text-sm font-bold text-slate-700">
                                                    ₹{parseFloat(payRecord?.baseSalary || staff.baseSalary || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-bold text-slate-700">
                                                    {payRecord ? payRecord.attendanceDays : <span className="text-slate-300 italic text-xs">—</span>}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-bold text-rose-500">
                                                    {payRecord ? payRecord.leaveDays : <span className="text-slate-300 italic text-xs">—</span>}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-bold text-emerald-600">
                                                    {payRecord ? `₹${parseFloat(payRecord.commission || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : <span className="text-slate-300 italic text-xs">—</span>}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-black text-slate-800">
                                                    {payRecord ? `₹${parseFloat(payRecord.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : <span className="text-slate-300 italic text-xs">—</span>}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge status={payRecord?.status || 'Not Generated'} />
                                                </td>
                                                <td className="px-4 py-4">
                                                    {payRecord ? (
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => setSelectedPayroll(payRecord)}
                                                                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                                                            >
                                                                <Eye size={15} />
                                                            </button>
                                                            {payRecord.status !== 'Paid' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setConfirmModal({ isOpen: true, id: payRecord.id, action: 'payroll', label: `${payRecord.staff?.name || 'this'}'s payroll`, loading: false });
                                                                    }}
                                                                    className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 italic text-xs">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <PayrollModal
                isOpen={!!selectedPayroll}
                onClose={() => setSelectedPayroll(null)}
                payroll={selectedPayroll}
                onRefresh={loadPayroll}
            />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, action: null, label: '', loading: false })}
                onConfirm={async () => {
                    setConfirmModal(prev => ({ ...prev, loading: true }));
                    try {
                        if (confirmModal.action === 'staff') {
                            await deleteStaffAPI(confirmModal.id);
                            toast.success('Staff deleted successfully');
                            setStaffList(prev => prev.filter(s => s.id !== confirmModal.id));
                        } else if (confirmModal.action === 'payroll') {
                            await deletePayrollAPI(confirmModal.id);
                            toast.success('Payroll deleted');
                            loadPayroll();
                        }
                        setConfirmModal({ isOpen: false, id: null, action: null, label: '', loading: false });
                    } catch (err) {
                        toast.error('Failed to delete');
                        setConfirmModal(prev => ({ ...prev, loading: false }));
                    }
                }}
                title={`Delete ${confirmModal.action === 'payroll' ? 'Payroll Record' : 'Staff Member'}?`}
                message={`${confirmModal.label ? `${confirmModal.label} will` : 'This record will'} be permanently removed.`}
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

// ── Reusable Stat Card ────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => {
    const colorMap = {
        indigo: 'bg-primary-light text-primary',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-primary',
        blue: 'bg-primary-light text-primary',
        rose: 'bg-rose-50 text-rose-600',
    };
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            {Icon && (
                <div className={`w-12 h-12 ${colorMap[color] || colorMap.indigo} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon size={24} />
                </div>
            )}
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{value ?? 0}</h3>
            </div>
        </div>
    );
};

// ── Payroll Modal ────────────────────────────────────────────────────────
const PayrollModal = ({ isOpen, onClose, payroll, onRefresh }) => {
    const [commissionInput, setCommissionInput] = useState(payroll?.commission || 0);
    const [extraBonus, setExtraBonus] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && payroll) {
            setCommissionInput(payroll.commission || 0);
            setExtraBonus(0);
        }
    }, [isOpen, payroll]);

    if (!isOpen || !payroll) return null;

    const baseSalary = parseFloat(payroll.baseSalary || 0);
    const leaveDeduction = parseFloat(payroll.leaveDeduction || 0);
    const netPay = (baseSalary + parseFloat(commissionInput || 0) + parseFloat(extraBonus || 0)) - leaveDeduction;

    const handleSave = async (status) => {
        setIsSaving(true);
        try {
            await updatePayrollStatusAPI(payroll.id, {
                status,
                commission: parseFloat(commissionInput || 0),
                extra_bonus: parseFloat(extraBonus || 0)
            });
            toast.success(`Payroll ${status === 'Paid' ? 'Paid' : 'Approved'} Successfully!`);
            onRefresh();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update payroll');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Payroll Details</h2>
                        <p className="text-slate-500 font-medium text-sm">
                            {payroll.staff?.name} • {new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto w-full">
                    <div className="space-y-6">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 mb-1">Base Salary</p>
                                <p className="text-lg font-black text-slate-800">₹{baseSalary.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 mb-1">Attendance Days</p>
                                <p className="text-lg font-black text-emerald-600">{payroll.attendanceDays}</p>
                            </div>
                            <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                                <p className="text-xs font-bold text-rose-500 mb-1">Leave Deductions</p>
                                <p className="text-lg font-black text-rose-600">- ₹{leaveDeduction.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({payroll.leaveDays} days)</p>
                            </div>
                            <div className="bg-primary-light/50 rounded-xl p-4 border border-violet-100">
                                <p className="text-xs font-bold text-primary mb-1">Net Pay</p>
                                <p className="text-2xl font-black text-primary">₹{netPay > 0 ? netPay.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 0}</p>
                            </div>
                        </div>

                        {payroll.status === 'Pending' ? (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Commission (₹)</label>
                                    <input
                                        type="number"
                                        value={commissionInput}
                                        onChange={e => setCommissionInput(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-4 focus:ring-primary-light outline-none font-bold text-slate-800 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Extra Bonus (₹)</label>
                                    <input
                                        type="number"
                                        value={extraBonus}
                                        onChange={e => setExtraBonus(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-4 focus:ring-primary-light outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300"
                                        placeholder="Add manual bonus if any"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${payroll.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : (payroll.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-primary-light text-primary')}`}>
                                        Status: {payroll.status}
                                    </span>
                                </div>
                                {payroll.status === 'Paid' && (
                                    <a
                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/payroll/${payroll.id}/payslip`}
                                        target="_blank"
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        <FileDown size={16} /> Download Payslip
                                    </a>
                                )}
                            </div>
                        )}

                        {payroll.status === 'Rejected' && (
                            <div className="bg-rose-50 rounded-xl p-6 border border-rose-100 space-y-2">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Employee Rejection Reason</p>
                                <p className="text-sm font-bold text-slate-700 italic">
                                    &quot;{payroll.rejectionReason || 'No reason provided'}&quot;
                                </p>
                                <p className="text-[10px] font-bold text-slate-400">
                                    Please fix the salary details above and re-approve to send again.
                                </p>
                            </div>
                        )}

                    </div>
                </div>

                {(payroll.status === 'Pending' || payroll.status === 'Approved' || payroll.status === 'Confirmed' || payroll.status === 'Rejected') && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4 sticky bottom-0">
                        {(payroll.status === 'Pending' || payroll.status === 'Rejected') && (
                            <button
                                onClick={() => handleSave('Approved')}
                                disabled={isSaving}
                                className="flex-1 h-12 rounded-xl border-2 border-primary text-primary font-black uppercase tracking-widest text-xs hover:bg-primary-light transition-all active:scale-95 transition-all"
                            >
                                {payroll.status === 'Rejected' ? 'Re-Approve & Send' : 'Approve & Send to Staff'}
                            </button>
                        )}
                        {payroll.status === 'Confirmed' && (
                            <button
                                onClick={() => handleSave('Paid')}
                                disabled={isSaving}
                                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Mark as Paid
                            </button>
                        )}
                        {payroll.status === 'Approved' && (
                            <div className="flex-1 text-center py-4 bg-primary-light/20 rounded-xl border border-primary-light italic text-[10px] font-black uppercase tracking-[2px] text-primary">
                                Awaiting Employee Confirmation
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payroll;
