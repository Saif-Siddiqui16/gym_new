import React, { useState, useEffect } from 'react';
import {
    Clock,
    Shield,
    User,
    XCircle,
    History,
    Calendar,
    LayoutDashboard,
    UserCheck,
    Users,
    LogIn,
    LogOut,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';
import StatsCard from '../../modules/dashboard/components/StatsCard';

const TrainerAttendance = () => {
    const [attendanceData, setAttendanceData] = useState({
        logs: [],
        activeShift: null,
        stats: {
            currentlyWorking: 0,
            todayCheckIns: 0,
            completedShifts: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [meResponse, liveResponse] = await Promise.all([
                apiClient.get('/staff/attendance/me'),
                apiClient.get('/admin/attendance/live')
            ]);

            setAttendanceData({
                ...meResponse.data,
                liveData: liveResponse.data?.data || []
            });
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh stats every minute
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleCheckInToggle = async () => {
        try {
            setActionLoading(true);
            const response = await apiClient.post('/staff/attendance/record');
            toast.success(response.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateDuration = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = checkOut ? new Date(checkOut) : new Date();
        const diffMs = end - start;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        return `${diffHrs}h ${diffMins}m`;
    };

    const isCheckedIn = !!attendanceData.activeShift;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-8 animate-fadeIn font-sans text-slate-900 overflow-y-auto">

            {/* Header Section */}
            <div className="mb-6 md:mb-10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl md:rounded-3xl blur-2xl opacity-10"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Staff Attendance</h1>
                            {loading && <RefreshCw size={20} className="animate-spin text-violet-500" />}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-violet-100">Live Status</span>
                            <div className="hidden md:block w-1 h-1 rounded-full bg-slate-200" />
                            <p className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest leading-relaxed">
                                Track your working hours and branch occupancy
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-10">

                {/* Info Section - Personal View */}
                <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-5 shadow-sm group hover:border-violet-200 transition-all duration-300">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white text-violet-600 flex items-center justify-center border border-violet-50 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                        <Shield size={20} className="md:w-5 md:h-5" />
                    </div>
                    <div>
                        <h4 className="text-[10px] md:text-xs font-black text-[#1e40af] uppercase tracking-widest md:tracking-[0.2em] mb-0.5">Personal View</h4>
                        <p className="text-[#3b82f6] font-black text-[9px] md:text-[10px] uppercase tracking-widest md:tracking-[0.3em] leading-relaxed">You can only view and manage your own attendance. Stats are sync'd with branch admin.</p>
                    </div>
                </div>

                {/* Main Section - Your Attendance */}
                <div className="space-y-4 md:space-y-6 px-1">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-sm">
                            <User size={16} />
                        </div>
                        <h2 className="text-[11px] md:text-xs font-black text-slate-900 uppercase tracking-widest md:tracking-[0.2em]">Your Attendance</h2>
                    </div>

                    <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-100/20 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>

                        <div className="relative z-10 space-y-2 md:space-y-3">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                {isCheckedIn ? 'Currently On Shift' : 'Daily Sign-in'}
                            </h2>
                            <p className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest md:tracking-[0.3em]">
                                {isCheckedIn ? `Checked in at ${formatTime(attendanceData.activeShift.checkIn)}` : 'Start your shift by checking in'}
                            </p>
                        </div>

                        <button
                            onClick={handleCheckInToggle}
                            disabled={actionLoading || (isCheckedIn && attendanceData.logs.some(l => l.checkOut))}
                            className={`w-full md:w-auto relative z-10 flex items-center justify-center gap-3 px-8 md:px-12 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-semibold uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isCheckedIn
                                ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600'
                                : 'bg-violet-600 !text-white shadow-violet-200 hover:bg-violet-700'} hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : (isCheckedIn ? <LogOut size={18} /> : <UserCheck size={18} />)}
                            {isCheckedIn ? 'Check Out Now' : 'Check In Now'}
                        </button>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <StatsCard
                        title="Currently Working"
                        value={attendanceData.stats.currentlyWorking.toString()}
                        subtitle="On-duty staff"
                        icon={Users}
                        color="success"
                    />
                    <StatsCard
                        title="Today's Check-ins"
                        value={attendanceData.stats.todayCheckIns.toString()}
                        subtitle="Total entries"
                        icon={LogIn}
                        color="primary"
                    />
                    <StatsCard
                        title="Completed Shifts"
                        value={attendanceData.stats.completedShifts.toString()}
                        subtitle="Today's total"
                        icon={LogOut}
                        color="warning"
                    />
                </div>

                <div className="space-y-4 md:space-y-6 pt-4 px-1">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-sm">
                            <LayoutDashboard size={16} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-[11px] md:text-xs font-black text-slate-900 uppercase tracking-widest md:tracking-[0.2em]">Currently On Duty</h2>
                            <p className="text-slate-400 font-black text-[8px] md:text-[9px] uppercase tracking-widest md:tracking-[0.3em] mt-0.5 truncate">Your active shift details</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                        <div className="overflow-x-auto text-left">
                            <table className="w-full min-w-[600px] md:min-w-full">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 md:px-10 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff</th>
                                        <th className="px-6 md:px-10 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in</th>
                                        <th className="px-6 md:px-10 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                        <th className="px-6 md:px-10 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.liveData && attendanceData.liveData.length > 0 ? (
                                        attendanceData.liveData.map((person) => (
                                            <tr key={person.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 md:px-10 py-5 md:py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden">
                                                            {person.avatar ? <img src={person.avatar} alt="" className="w-full h-full object-cover" /> : <User size={14} />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wider">{person.name}</span>
                                                            <span className="text-[8px] font-black text-violet-500 uppercase tracking-widest leading-none mt-0.5">{person.role}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-10 py-5 md:py-6">
                                                    <span className="text-[10px] md:text-xs font-bold text-slate-500">{person.time}</span>
                                                </td>
                                                <td className="px-6 md:px-10 py-5 md:py-6">
                                                    <span className="text-[10px] md:text-xs font-bold text-violet-600">Active</span>
                                                </td>
                                                <td className="px-6 md:px-10 py-5 md:py-6">
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-green-100">Inside</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-16 md:py-24 text-center">
                                                <div className="flex flex-col items-center justify-center opacity-40">
                                                    <XCircle size={40} strokeWidth={1} className="text-slate-300 mb-4" />
                                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.3em] text-slate-400 px-6">No one is currently in the gym</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Today's Attendance Log Section */}
                <div className="space-y-4 md:space-y-6 pt-4 px-1">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-sm">
                            <History size={16} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-[11px] md:text-xs font-black text-slate-900 uppercase tracking-widest md:tracking-[0.2em]">Today's Log</h2>
                            <p className="text-slate-400 font-black text-[8px] md:text-[9px] uppercase tracking-widest md:tracking-[0.3em] mt-0.5 truncate">Your attendance history for today</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                        <div className="overflow-x-auto text-left">
                            <table className="w-full min-w-[700px] md:min-w-full">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 md:px-10 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                        <th className="px-6 md:px-10 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">In</th>
                                        <th className="px-6 md:px-10 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Out</th>
                                        <th className="px-6 md:px-10 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                        <th className="px-6 md:px-10 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.logs.length > 0 ? (
                                        attendanceData.logs.map((log) => (
                                            <tr key={log.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 md:px-10 py-5 md:py-6">
                                                    <span className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wider">{log.name}</span>
                                                </td>
                                                <td className="px-6 md:px-10 py-5 md:py-6">
                                                    <span className="text-[10px] md:text-xs font-bold text-slate-500">{formatTime(log.checkIn)}</span>
                                                </td>
                                                <td className="px-6 md:px-10 py-5 md:py-6">
                                                    <span className="text-[10px] md:text-xs font-bold text-slate-500">{formatTime(log.checkOut)}</span>
                                                </td>
                                                <td className="px-6 md:px-10 py-5 md:py-6">
                                                    <span className="text-[10px] md:text-xs font-bold text-slate-500">{calculateDuration(log.checkIn, log.checkOut)}</span>
                                                </td>
                                                <td className="px-6 md:px-10 py-5 md:py-6">
                                                    <div className="flex items-center gap-2">
                                                        {log.checkOut ? (
                                                            <CheckCircle2 size={14} className="text-green-500" />
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                        )}
                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${log.checkOut
                                                            ? 'bg-green-50 text-green-600 border-green-100'
                                                            : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                            {log.checkOut ? 'Completed' : 'On Shift'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-16 md:py-24 text-center">
                                                <div className="flex flex-col items-center justify-center opacity-40">
                                                    <Calendar size={40} strokeWidth={1} className="text-slate-300 mb-4" />
                                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.3em] text-slate-400 px-6">No attendance records for today</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default TrainerAttendance;
