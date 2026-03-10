import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    Activity,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Search,
    Loader2,
    LogIn,
    LogOut,
    Dumbbell
} from 'lucide-react';
import Card from '../../components/ui/Card';
import StatsCard from '../../modules/dashboard/components/StatsCard';
import DashboardGrid from '../../modules/dashboard/components/DashboardGrid';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';

const MyAttendance = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({ logs: [], stats: {} });
    const [loading, setLoading] = useState(true);
    const [checkInStatus, setCheckInStatus] = useState({ isCheckedIn: false, isCheckedOut: false, checkInTime: null, checkOutTime: null });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAttendance = async () => {
        try {
            const [attRes, statusRes] = await Promise.all([
                apiClient.get('/member/attendance'),
                apiClient.get('/member/attendance/status')
            ]);
            setAttendanceData(attRes.data);
            setCheckInStatus(statusRes.data);
        } catch (err) {
            console.error("Failed to fetch attendance", err);
            toast.error("Failed to load attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAttendance(); }, []);

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            await apiClient.post('/member/attendance/check-in');
            toast.success('✅ Checked in successfully!');
            await fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed');
        } finally { setActionLoading(false); }
    };

    const handleCheckOut = async () => {
        setActionLoading(true);
        try {
            await apiClient.post('/member/attendance/check-out');
            toast.success('✅ Checked out successfully!');
            await fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-out failed');
        } finally { setActionLoading(false); }
    };

    const stats = [
        { title: 'Total Visits', value: attendanceData.stats.totalVisits?.toString() || '0', icon: CheckCircle2, color: 'primary' },
        { title: 'Days This Month', value: attendanceData.stats.visitsThisMonth?.toString() || '0', icon: CalendarIcon, color: 'success' },
        { title: 'Avg Duration', value: attendanceData.stats.avgDuration || '0 min', icon: Clock, color: 'warning' },
        { title: 'Consistency', value: attendanceData.stats.consistency || '0%', icon: Activity, color: 'info' }
    ];

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDay = (y, m) => new Date(y, m, 1).getDay();
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDay(currentYear, currentMonth);
    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const isVisited = (date) => attendanceData.logs.some(log => {
        const d = new Date(log.date || log.checkIn);
        return d.getDate() === date && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const formatTime = (isoStr) => {
        if (!isoStr) return '--:--';
        return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="saas-container space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b-2 border-slate-100">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-violet-100">
                        <CalendarIcon size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">My Attendance</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Track your gym visits & check in/out</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                    <CalendarIcon size={18} className="text-primary" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{monthName} {currentYear}</span>
                </div>
            </div>

            {/* ── CHECK-IN / CHECK-OUT HERO ── */}
            <div className={`relative overflow-hidden rounded-[3rem] p-10 sm:p-14 border-2 shadow-xl transition-all duration-500 ${checkInStatus.isCheckedIn
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-emerald-100'
                    : checkInStatus.isCheckedOut
                        ? 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
                        : 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200 shadow-violet-100'
                }`}>
                <div className="absolute top-0 right-0 opacity-5 -mt-8 -mr-8 pointer-events-none">
                    <Dumbbell size={200} strokeWidth={1} />
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                    <div>
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${checkInStatus.isCheckedIn ? 'bg-emerald-100 text-emerald-700'
                                : checkInStatus.isCheckedOut ? 'bg-slate-100 text-slate-600'
                                    : 'bg-violet-100 text-violet-700'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${checkInStatus.isCheckedIn ? 'bg-emerald-500 animate-pulse' : checkInStatus.isCheckedOut ? 'bg-slate-400' : 'bg-violet-500'}`} />
                            {checkInStatus.isCheckedIn ? 'Currently Inside' : checkInStatus.isCheckedOut ? 'Visited Today' : 'Not Checked In'}
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                            {checkInStatus.isCheckedIn ? "You're in the gym! 💪" : checkInStatus.isCheckedOut ? 'Great workout today! 🏆' : 'Ready to train today? 🎯'}
                        </h2>
                        <div className="flex flex-wrap gap-5 text-sm font-bold text-slate-500">
                            {checkInStatus.checkInTime && (
                                <span className="flex items-center gap-1.5">
                                    <LogIn size={14} className="text-emerald-500" />
                                    In: {formatTime(checkInStatus.checkInTime)}
                                </span>
                            )}
                            {checkInStatus.checkOutTime && (
                                <span className="flex items-center gap-1.5">
                                    <LogOut size={14} className="text-rose-500" />
                                    Out: {formatTime(checkInStatus.checkOutTime)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0">
                        {!checkInStatus.isCheckedIn && !checkInStatus.isCheckedOut && (
                            <button
                                onClick={handleCheckIn}
                                disabled={actionLoading}
                                className="flex items-center gap-3 px-10 h-16 bg-primary text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-violet-200 hover:bg-primary-hover hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                                Check In
                            </button>
                        )}
                        {checkInStatus.isCheckedIn && (
                            <button
                                onClick={handleCheckOut}
                                disabled={actionLoading}
                                className="flex items-center gap-3 px-10 h-16 bg-rose-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                                Check Out
                            </button>
                        )}
                        {checkInStatus.isCheckedOut && (
                            <div className="flex items-center gap-3 px-10 h-16 bg-emerald-50 text-emerald-700 rounded-[1.5rem] font-black text-sm uppercase tracking-widest border-2 border-emerald-200">
                                <CheckCircle2 size={20} />
                                Done for Today
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <DashboardGrid>
                {stats.map((stat, idx) => (
                    <StatsCard key={idx} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} isEarningsLayout={true} />
                ))}
            </DashboardGrid>

            {/* Calendar */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                        <CalendarIcon size={16} />
                    </div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Attendance Calendar</h2>
                </div>
                <Card className="p-10 sm:p-14 border-2 border-slate-100 shadow-2xl shadow-slate-100/20 rounded-[3.5rem] bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <div className="pl-4">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{monthName} {currentYear}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Visit Overview</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-4">
                        {weekDays.map(day => (
                            <div key={day} className="text-center py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</div>
                        ))}
                        {blanks.map(blank => <div key={`b-${blank}`} className="aspect-square" />)}
                        {dates.map(date => {
                            const visited = isVisited(date);
                            return (
                                <div key={date} className={`aspect-square flex flex-col items-center justify-center rounded-[24px] border ${visited ? 'bg-primary border-primary text-white shadow-lg shadow-violet-100' : 'border-slate-100 bg-slate-50/30 text-slate-700 hover:border-violet-200'} transition-all duration-300 relative`}>
                                    <span className={`text-sm font-black ${visited ? 'text-white' : ''}`}>{date}</span>
                                    {visited && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-200" />}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <Clock size={16} />
                    </div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h2>
                </div>
                <Card className="p-8 sm:p-10 border-2 border-slate-100 shadow-2xl shadow-slate-100/20 rounded-[3rem] bg-white">
                    {attendanceData.logs.length > 0 ? (
                        <div className="space-y-4">
                            {attendanceData.logs.map((log, idx) => (
                                <div key={log.id || idx} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-violet-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm">
                                            <CalendarIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">
                                                {new Date(log.date || log.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">General Check-in</p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
                                            <LogIn size={12} />
                                            {formatTime(log.checkIn || log.checkInTime)}
                                        </div>
                                        {(log.checkOut || log.checkOutTime) && (
                                            <div className="flex items-center justify-end gap-2 text-rose-500 font-black text-xs uppercase tracking-widest">
                                                <LogOut size={12} />
                                                {formatTime(log.checkOut || log.checkOutTime)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4 border-2 border-dashed border-slate-100">
                                <Search size={24} />
                            </div>
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No activity found</h4>
                            <p className="text-xs font-bold text-slate-300 mt-1">Check in above to start tracking!</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MyAttendance;
