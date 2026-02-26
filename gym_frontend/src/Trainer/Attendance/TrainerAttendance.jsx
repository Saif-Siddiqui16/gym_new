import React, { useState, useEffect } from 'react';
import { getTrainerAttendance, checkInTrainer, requestLeave } from '../../api/trainer/trainerApi';
import {
    Clock,
    Calendar,
    UserCheck,
    Hourglass,
    ChevronDown,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import StatsCard from '../../modules/dashboard/components/StatsCard';
import DashboardGrid from '../../modules/dashboard/components/DashboardGrid';
import MobileCard from '../../components/common/MobileCard';
import RightDrawer from '../../components/common/RightDrawer';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

// Simulated Logged-In User ID
const CURRENT_TRAINER_ID = 'T-101';

const TrainerAttendance = () => {
    const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const [monthFilter, setMonthFilter] = useState(currentMonthYear);
    const [isLeaveDrawerOpen, setIsLeaveDrawerOpen] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isCheckedOut, setIsCheckedOut] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]);

    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logsPage, setLogsPage] = useState(1);
    const [leavesPage, setLeavesPage] = useState(1);
    const itemsPerPage = 5;

    const formatLocalTime = (date) => {
        if (!date) return 'Not yet';
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatLocalDate = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // Use UTC methods to match backend normalization
        return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    };

    const loadAttendance = async () => {
        setLoading(true);
        try {
            const todayStr = new Date().toLocaleDateString('en-CA');
            const data = await getTrainerAttendance(todayStr);
            setAttendanceData(data);
            setLeaveRequests(data.leaveRequests || []);

            // Check if user is checked in but not checked out today
            const hasCheckIn = !!data.summary?.todayCheckIn;
            const hasCheckOut = !!data.summary?.todayCheckOut;

            setIsCheckedIn(hasCheckIn && !hasCheckOut);
            setIsCheckedOut(hasCheckIn && hasCheckOut);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load attendance logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, []);

    const filteredLogs = attendanceData?.logs?.filter(log => {
        const logDate = new Date(log.date);
        const logMonthYear = logDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        return logMonthYear === monthFilter;
    }) || [];

    const filteredLeaves = leaveRequests?.filter(leave => {
        const leaveDate = new Date(leave.start);
        const leaveMonthYear = leaveDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        return leaveMonthYear === monthFilter;
    }) || [];

    const paginatedLogs = filteredLogs.slice((logsPage - 1) * itemsPerPage, logsPage * itemsPerPage);
    const paginatedLeaves = filteredLeaves.slice((leavesPage - 1) * itemsPerPage, leavesPage * itemsPerPage);

    const logsTotalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const leavesTotalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Present':
            case 'Approved': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'Absent':
            case 'Rejected': return 'bg-red-100 text-red-700 border border-red-200';
            case 'Late':
            case 'Pending': return 'bg-amber-100 text-amber-700 border border-amber-200';
            case 'On Leave': return 'bg-blue-100 text-blue-700 border border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    const handleCheckIn = async () => {
        try {
            const localDate = new Date().toLocaleDateString('en-CA'); // Get YYYY-MM-DD in local time
            const result = await checkInTrainer({ localDate });
            toast.success(result.message);
            loadAttendance();
        } catch (err) {
            toast.error(err || 'Failed to check in/out.');
        }
    };

    const LeaveRequestDrawer = () => {
        const [leaveForm, setLeaveForm] = useState({ type: 'Sick Leave', start: '', end: '', reason: '' });

        const handleSubmit = async () => {
            if (!leaveForm.start || !leaveForm.end || !leaveForm.reason) {
                return alert("Please fill all fields.");
            }
            try {
                await requestLeave(leaveForm);
                alert("Leave request submitted successfully!");
                setIsLeaveDrawerOpen(false);
                loadAttendance(); // reload logs
            } catch (error) {
                alert("Failed to request leave.");
            }
        };

        return (
            <RightDrawer
                isOpen={isLeaveDrawerOpen}
                onClose={() => setIsLeaveDrawerOpen(false)}
                title="Request Leave"
                subtitle="Submit your leave application"
                footer={
                    <div className="flex gap-3">
                        <button onClick={handleSubmit} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                            Submit Request
                        </button>
                        <button
                            onClick={() => setIsLeaveDrawerOpen(false)}
                            className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold"
                        >
                            Cancel
                        </button>
                    </div>
                }
            >
                <div className="space-y-8 px-6 py-6">
                    {/* Leave Type Select */}
                    <div className="space-y-2.5">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Leave Type</label>
                        <div className="relative group">
                            <select
                                value={leaveForm.type}
                                onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer group-hover:border-slate-200"
                            >
                                <option>Sick Leave</option>
                                <option>Casual Leave</option>
                                <option>Emergency</option>
                                <option>Vacation</option>
                            </select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform duration-300" />
                        </div>
                    </div>

                    {/* Date Range Group */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Start Date</label>
                            <input
                                type="date"
                                value={leaveForm.start}
                                onChange={(e) => setLeaveForm({ ...leaveForm, start: e.target.value })}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 hover:border-slate-200"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">End Date</label>
                            <input
                                type="date"
                                value={leaveForm.end}
                                onChange={(e) => setLeaveForm({ ...leaveForm, end: e.target.value })}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 hover:border-slate-200"
                            />
                        </div>
                    </div>

                    {/* Modern Toggle Switch */}
                    <div className="group flex items-center justify-between p-5 bg-gradient-to-br from-slate-50 to-white rounded-[24px] border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800">Half Day Request?</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Select if applying for a partial day</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setLeaveForm(prev => ({ ...prev, isHalfDay: !prev.isHalfDay }))}
                            className={`w-12 h-6 rounded-full relative transition-all duration-500 group-hover:scale-110 ${leaveForm.isHalfDay ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-500 ${leaveForm.isHalfDay ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Reason Textarea */}
                    <div className="space-y-2.5">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Reason for Leave</label>
                        <textarea
                            rows={4}
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                            placeholder="Please provide a detailed reason..."
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 hover:border-slate-200 resize-none"
                        />
                    </div>

                    {/* Information Alert */}
                    <div className="p-5 bg-indigo-50/50 rounded-[24px] border border-indigo-100/50 flex gap-4 transform hover:scale-[1.02] transition-transform duration-300">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-500 shadow-sm flex-shrink-0">
                            <AlertCircle size={16} />
                        </div>
                        <p className="text-[11px] text-indigo-700 font-bold leading-relaxed">
                            Your request will be forwarded to the management team for review. You will receive a notification once a decision has been made.
                        </p>
                    </div>
                </div>
            </RightDrawer>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium tracking-tight">Loading attendance data...</p>
        </div>
    );
    if (!attendanceData) return <div className="p-8 text-center text-gray-500 min-h-screen bg-slate-50">Failed to load data</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 animate-fadeIn font-sans">

            {/* Header Area */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl blur-2xl opacity-15 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 p-6 sm:p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-violet-200 transform hover:scale-105 transition-transform duration-300 group flex-shrink-0">
                                <Clock size={28} className="sm:w-9 sm:h-9 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                                        My Attendance
                                    </h1>
                                    <span className="px-3 py-1 bg-violet-100 text-violet-700 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full border border-violet-200">
                                        Personal
                                    </span>
                                </div>
                                <p className="text-slate-500 font-medium text-sm sm:text-lg">Track your daily clock-in/out logs and working hours.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setIsLeaveDrawerOpen(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl font-bold hover:bg-indigo-100 transition-all w-full sm:w-auto"
                            >
                                <Calendar size={18} />
                                Request Leave
                            </button>
                            <button
                                onClick={handleCheckIn}
                                disabled={isCheckedOut}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-xl transition-all w-full sm:w-auto hover:scale-105 active:scale-95 ${isCheckedOut
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                                    : isCheckedIn
                                        ? 'bg-amber-500 text-white shadow-amber-500/30 hover:shadow-amber-500/40'
                                        : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-500/30 hover:shadow-violet-500/40'
                                    }`}
                            >
                                {isCheckedOut ? <CheckCircle2 size={18} /> : isCheckedIn ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                {isCheckedOut ? 'Attendance Completed' : `Today's ${isCheckedIn ? 'Check-out' : 'Check-in'}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary Area */}
            <DashboardGrid>
                <StatsCard
                    title="Today Check-in"
                    value={formatLocalTime(attendanceData.summary.todayCheckIn)}
                    icon={ArrowUpRight}
                    color="primary"
                />
                <StatsCard
                    title="Today Check-out"
                    value={formatLocalTime(attendanceData.summary.todayCheckOut)}
                    icon={ArrowDownLeft}
                    color="success"
                />
                <StatsCard
                    title="Total Hours Today"
                    value={attendanceData.summary.totalHoursToday}
                    icon={Hourglass}
                    color="warning"
                />
                <StatsCard
                    title="Present This Month"
                    value={`${attendanceData.summary.daysPresentMonth}/${attendanceData.summary.totalWorkDays} Days`}
                    icon={UserCheck}
                    color="primary"
                />
            </DashboardGrid>

            {/* Attendance Logs Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Calendar className="text-violet-500" size={24} />
                        Attendance Logs
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                className="appearance-none bg-slate-50 border border-slate-100 text-slate-600 py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
                                    const d = new Date();
                                    d.setMonth(d.getMonth() - i);
                                    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
                                    return <option key={label} value={label}>{label}</option>
                                })}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <button className="p-2.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-violet-600 hover:border-violet-100 transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {/* Desktop Version */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-In</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-Out</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hours</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedLogs.length > 0 ? (
                                paginatedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                                                {formatLocalDate(log.date)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                <ArrowUpRight size={14} className="text-emerald-500" />
                                                {formatLocalTime(log.checkIn)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                <ArrowDownLeft size={14} className="text-rose-500" />
                                                {formatLocalTime(log.checkOut)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black text-slate-900">{log.hours}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(log.status)}`}>
                                                    {log.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium">No logs found for this month</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination for Logs */}
                {logsTotalPages > 1 && (
                    <div className="flex items-center justify-between px-2 py-4 border-t border-slate-50">
                        <p className="text-xs font-bold text-slate-400">Page {logsPage} of {logsTotalPages}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                                disabled={logsPage === 1}
                                className="px-4 py-2 text-xs font-bold bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setLogsPage(p => Math.min(logsTotalPages, p + 1))}
                                disabled={logsPage === logsTotalPages}
                                className="px-4 py-2 text-xs font-bold bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 disabled:opacity-50 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile Version Update */}
                <div className="md:hidden space-y-4">
                    {paginatedLogs.map((log) => (
                        <MobileCard
                            key={log.id}
                            title={formatLocalDate(log.date)}
                            subtitle={`Check-in: ${formatLocalTime(log.checkIn)}`}
                            status={log.status}
                            statusColor={log.status === 'Present' ? 'emerald' : log.status === 'Late' ? 'amber' : 'red'}
                            badge={log.hours}
                            badgeColor="violet"
                            icon={Clock}
                        />
                    ))}
                    {filteredLogs.length === 0 && (
                        <div className="py-8 text-center text-slate-400 text-sm font-medium">No data available</div>
                    )}
                </div>
            </div>

            {/* Leave Requests History Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Calendar size={18} className="text-amber-500" />
                    <h2 className="text-lg font-bold text-gray-800">Leave History</h2>
                </div>
                <Card className="p-0 overflow-hidden border border-gray-100 shadow-xl rounded-[32px]">
                    {/* Desktop History Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedLeaves.length > 0 ? (
                                    paginatedLeaves.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-bold text-slate-900">
                                                    {formatLocalDate(leave.start)} {leave.start !== leave.end ? ` – ${formatLocalDate(leave.end)}` : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-bold text-slate-600">{leave.type}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs text-slate-500 font-medium truncate max-w-[200px] block">{leave.reason}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(leave.status)}`}>
                                                        {leave.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-medium">No leave records for this month</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination for Leaves */}
                    {leavesTotalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50">
                            <p className="text-xs font-bold text-slate-400">Page {leavesPage} of {leavesTotalPages}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setLeavesPage(p => Math.max(1, p - 1))}
                                    disabled={leavesPage === 1}
                                    className="px-4 py-2 text-xs font-bold bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setLeavesPage(p => Math.min(leavesTotalPages, p + 1))}
                                    disabled={leavesPage === leavesTotalPages}
                                    className="px-4 py-2 text-xs font-bold bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 disabled:opacity-50 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mobile History Cards Update */}
                    <div className="md:hidden p-4 space-y-4">
                        {paginatedLeaves.map((leave) => (
                            <div key={leave.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{formatLocalDate(leave.start)}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{leave.type}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusStyle(leave.status)}`}>
                                        {leave.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium italic">"{leave.reason}"</p>
                            </div>
                        ))}
                        {filteredLeaves.length === 0 && (
                            <div className="py-4 text-center text-slate-400 text-xs font-medium">No records found</div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Drawers */}
            <LeaveRequestDrawer />
        </div>
    );
};

export default TrainerAttendance;
