import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    Activity,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Search,
    UserCheck,
    TrendingUp,
    MapPin,
    Loader2
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

    const fetchAttendance = async () => {
        try {
            const res = await apiClient.get('/member/attendance');
            setAttendanceData(res.data);
        } catch (err) {
            console.error("Failed to fetch attendance", err);
            toast.error("Failed to load attendance history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const stats = [
        {
            title: 'Total Visits',
            value: attendanceData.stats.totalVisits?.toString() || '0',
            icon: CheckCircle2,
            color: 'primary'
        },
        {
            title: 'Days This Month',
            value: attendanceData.stats.visitsThisMonth?.toString() || '0',
            icon: CalendarIcon,
            color: 'success'
        },
        {
            title: 'Avg Duration',
            value: attendanceData.stats.avgDuration || '0 min',
            icon: Clock,
            color: 'warning'
        },
        {
            title: 'Consistency',
            value: attendanceData.stats.consistency || '0%',
            icon: Activity,
            color: 'info'
        }
    ];

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

    const isVisited = (date) => {
        return attendanceData.logs.some(log => {
            const d = new Date(log.date);
            return d.getDate() === date && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="saas-container h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8 space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b-2 border-slate-100">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-100">
                        <CalendarIcon size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
                            My Attendance
                        </h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                            Track your gym visits
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                    <CalendarIcon size={18} className="text-violet-600" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{monthName} {currentYear}</span>
                </div>
            </div>

            {/* Stats Section */}
            <DashboardGrid>
                {stats.map((stat, idx) => (
                    <StatsCard
                        key={idx}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        isEarningsLayout={true}
                    />
                ))}
            </DashboardGrid>

            {/* Calendar Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                        <CalendarIcon size={16} />
                    </div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Attendance Calendar</h2>
                </div>

                <Card className="p-8 border-2 border-slate-100 shadow-2xl shadow-slate-100/20 rounded-[2.5rem] bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <div className="pl-4">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{monthName} {currentYear}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Visit Overview</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevMonth}
                                className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={handleNextMonth}
                                className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-4">
                        {weekDays.map(day => (
                            <div key={day} className="text-center py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {day}
                            </div>
                        ))}
                        {blanks.map(blank => (
                            <div key={`blank-${blank}`} className="aspect-square" />
                        ))}
                        {dates.map(date => {
                            const visited = isVisited(date);
                            return (
                                <div
                                    key={date}
                                    className={`aspect-square flex flex-col items-center justify-center rounded-[24px] border ${visited ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-100' : 'border-slate-100 bg-slate-50/30 text-slate-700 hover:border-violet-200'} transition-all duration-300 group cursor-pointer relative`}
                                >
                                    <span className={`text-sm font-black transition-colors ${visited ? 'text-white' : 'group-hover:text-violet-600'}`}>{date}</span>
                                    {visited && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-200" />}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Recent Visits List */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <Clock size={16} />
                    </div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h2>
                </div>

                <Card className="p-6 border-2 border-slate-100 shadow-2xl shadow-slate-100/20 rounded-3xl bg-white">
                    {attendanceData.logs.length > 0 ? (
                        <div className="space-y-4">
                            {attendanceData.logs.map((log, idx) => (
                                <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-violet-600 shadow-sm">
                                            <CalendarIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">General Check-in</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-violet-600 font-black text-xs uppercase tracking-widest">
                                            <Clock size={14} />
                                            {log.checkInTime || 'No Time'}
                                        </div>
                                        {log.checkOutTime && (
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Out: {log.checkOutTime}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                                <Search size={24} />
                            </div>
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No activity found</h4>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MyAttendance;
