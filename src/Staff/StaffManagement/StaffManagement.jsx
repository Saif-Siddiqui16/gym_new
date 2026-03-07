import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, CheckCircle, Clock, Briefcase, RefreshCw,
    ArrowDownLeft, ArrowUpRight, Loader2, CalendarDays,
    Search, UserCircle, AlertCircle
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';

// ─── API helpers — all backend calls use the JWT token which carries tenantId ──
const fetchLiveStaffAttendance = () =>
    apiClient.get('/admin/attendance/live').then(r => r.data);

const fetchTodayStaffAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return apiClient.get('/admin/attendance', {
        params: { type: 'Staff', date: today, limit: 200 }
    }).then(r => r.data);
};

const fetchAttendanceStats = () =>
    apiClient.get('/admin/attendance/stats').then(r => r.data);

// ─── Component ────────────────────────────────────────────────────────────────
const StaffManagement = ({ role }) => {
    const [liveStaff, setLiveStaff] = useState([]);
    const [todayLog, setTodayLog] = useState([]);
    const [stats, setStats] = useState({ staffToday: 0, currentlyIn: 0 });
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // ── Load all data ────────────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [liveRes, todayRes, statsRes] = await Promise.all([
                fetchLiveStaffAttendance(),
                fetchTodayStaffAttendance(),
                fetchAttendanceStats()
            ]);

            // Live endpoint returns all (members + staff) — filter to staff only
            const liveStaffOnly = (liveRes?.data || []).filter(
                a => a.type === 'Staff' || a.type !== 'Member'
            );
            setLiveStaff(liveStaffOnly);

            // Today log already filtered by type=Staff in query
            const todayStaffOnly = (todayRes?.data || []).filter(
                a => a.type === 'Staff' || a.role !== 'Member'
            );
            setTodayLog(todayStaffOnly);
            setStats(statsRes || { staffToday: 0, currentlyIn: 0 });
            setLastRefreshed(new Date());
        } catch (err) {
            console.error('[StaffManagement] Error loading data:', err);
            toast.error('Failed to load staff attendance data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        // Auto-refresh every 60 seconds to keep live data fresh
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, [loadData]);

    // ── Filtered for search ──────────────────────────────────────────────────
    const filteredLive = liveStaff.filter(a =>
        (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredToday = todayLog.filter(a =>
        (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Derived counts
    const completedShifts = todayLog.filter(a => a.status === 'checked-out').length;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-violet-50/30 min-h-screen p-0 md:p-8 font-sans pb-24 text-slate-800">

            {/* Premium Header */}
            <div className="max-w-full mx-auto mb-10 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-[2.5rem] blur-2xl opacity-10 animate-pulse pointer-events-none group-hover:opacity-15 transition-opacity"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-slate-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-200 transition-transform duration-300 group-hover:scale-105">
                            <Users size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                                Staff Attendance
                            </h1>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
                                Live attendance tracking for your branch
                            </p>
                            {lastRefreshed && (
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">
                                    Last updated: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search staff..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-400 font-black uppercase tracking-widest shadow-sm transition-all"
                            />
                        </div>
                        {/* Refresh */}
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="h-11 px-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-purple-500/30 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/30/20 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-full mx-auto mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <StatCard
                        icon={Users}
                        label="Currently Working"
                        value={loading ? '—' : liveStaff.length}
                        color="emerald"
                        pulse={liveStaff.length > 0}
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Today's Check-ins"
                        value={loading ? '—' : todayLog.length}
                        color="blue"
                    />
                    <StatCard
                        icon={Clock}
                        label="Completed Shifts"
                        value={loading ? '—' : completedShifts}
                        color="indigo"
                    />
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto space-y-12">

                {/* ── Currently On Duty ──────────────────────────────────────── */}
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full inline-block ${liveStaff.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                Currently On Duty
                                <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full">
                                    {loading ? '…' : liveStaff.length}
                                </span>
                            </h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Staff currently checked in to your branch</p>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-[32px] shadow-sm border border-white/50 overflow-hidden">
                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        {['Staff Member', 'Role', 'Check-in Time', 'Duration', 'Status'].map(h => (
                                            <th key={h} className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="py-16 text-center">
                                                <Loader2 className="animate-spin mx-auto text-violet-400" size={32} />
                                            </td>
                                        </tr>
                                    ) : filteredLive.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-24 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Clock size={32} />
                                                    </div>
                                                    <h3 className="text-lg font-black text-slate-800">No staff currently on duty</h3>
                                                    <p className="text-slate-400 text-sm mt-1">Check-ins will appear here in real time</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLive.map(staff => (
                                            <tr key={staff.id} className="hover:bg-white transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
                                                            {(staff.name || '?').charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-slate-800 text-sm">{staff.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <RoleBadge role={staff.role} />
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                                                        <ArrowDownLeft size={14} />
                                                        {staff.time || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                                    {staff.duration || 'Ongoing'}
                                                </td>
                                                <td className="px-8 py-5">
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

                        {/* Mobile Cards */}
                        <div className="md:hidden p-4 space-y-4">
                            {loading ? (
                                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-violet-400" size={28} /></div>
                            ) : filteredLive.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Clock size={40} className="text-slate-200 mb-3" />
                                    <h3 className="text-lg font-black text-slate-800">No staff currently on duty</h3>
                                </div>
                            ) : (
                                filteredLive.map(staff => (
                                    <MobileAttendanceCard key={staff.id} staff={staff} type="live" />
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Today's Full Log ───────────────────────────────────────── */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <CalendarDays size={20} className="text-violet-500" />
                            Today's Attendance Log
                            <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-black rounded-full">
                                {loading ? '…' : todayLog.length}
                            </span>
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">All staff check-ins for today in your branch</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-[32px] shadow-sm border border-white/50 overflow-hidden">
                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        {['Staff Member', 'Role', 'Check-in', 'Check-out', 'Duration', 'Status'].map(h => (
                                            <th key={h} className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="py-16 text-center">
                                                <Loader2 className="animate-spin mx-auto text-violet-400" size={32} />
                                            </td>
                                        </tr>
                                    ) : filteredToday.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-24 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Briefcase size={32} />
                                                    </div>
                                                    <h3 className="text-lg font-black text-slate-800">No attendance records for today</h3>
                                                    <p className="text-slate-400 text-sm mt-1">Records will appear once staff members check in</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredToday.map(staff => (
                                            <tr key={staff.id} className="hover:bg-white transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm
                                                            ${staff.status === 'checked-in'
                                                                ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                                                                : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                                                            {(staff.name || '?').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">{staff.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <RoleBadge role={staff.role} />
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                                                        <ArrowDownLeft size={14} />
                                                        {staff.checkIn || staff.time || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    {staff.checkOut && staff.checkOut !== '-' ? (
                                                        <span className="flex items-center gap-1.5 text-sm font-bold text-rose-500">
                                                            <ArrowUpRight size={14} />
                                                            {staff.checkOut}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 italic text-xs">Still in</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                                    {staff.duration || (staff.status === 'checked-in' ? 'Ongoing' : '—')}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <StatusBadge status={staff.status} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden p-4 space-y-4">
                            {loading ? (
                                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-violet-400" size={28} /></div>
                            ) : filteredToday.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Briefcase size={40} className="text-slate-200 mb-3" />
                                    <h3 className="text-lg font-black text-slate-800">No attendance records for today</h3>
                                </div>
                            ) : (
                                filteredToday.map(staff => (
                                    <MobileAttendanceCard key={staff.id} staff={staff} type="log" />
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, pulse }) => {
    const colorMap = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-violet-50 text-violet-600',
        indigo: 'bg-violet-50 text-violet-600',
    };
    return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${colorMap[color]} rounded-xl flex items-center justify-center relative shrink-0`}>
                <Icon size={24} />
                {pulse && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <h3 className="text-2xl font-black text-slate-800">{value}</h3>
            </div>
        </div>
    );
};

const RoleBadge = ({ role }) => {
    const map = {
        STAFF: 'bg-slate-100 text-slate-600',
        TRAINER: 'bg-violet-100 text-violet-700',
        MANAGER: 'bg-violet-100 text-violet-700',
        BRANCH_ADMIN: 'bg-orange-100 text-orange-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${map[role] || 'bg-slate-100 text-slate-600'}`}>
            {role || 'Staff'}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const isIn = status === 'checked-in';
    return (
        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest w-fit
            ${isIn ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            {isIn ? 'On Duty' : 'Completed'}
        </span>
    );
};

const MobileAttendanceCard = ({ staff, type }) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm
                    ${staff.status === 'checked-in' ? 'bg-emerald-400' : 'bg-slate-400'}`}>
                    {(staff.name || '?').charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-sm">{staff.name}</p>
                    <RoleBadge role={staff.role} />
                </div>
            </div>
            <StatusBadge status={staff.status} />
        </div>
        <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <ArrowDownLeft size={12} /> {staff.checkIn || staff.time || '—'}
            </span>
            {type === 'log' && staff.checkOut && staff.checkOut !== '-' && (
                <span className="flex items-center gap-1 text-rose-500 font-bold">
                    <ArrowUpRight size={12} /> {staff.checkOut}
                </span>
            )}
            {(staff.duration) && (
                <span className="text-slate-400 font-bold">{staff.duration}</span>
            )}
        </div>
    </div>
);

export default StaffManagement;
