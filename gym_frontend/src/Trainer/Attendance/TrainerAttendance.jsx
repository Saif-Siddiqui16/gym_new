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

// Simulated Logged-In User ID
const CURRENT_TRAINER_ID = 'T-101';

const TrainerAttendance = () => {
    const [monthFilter, setMonthFilter] = useState('May 2024');
    const [isLeaveDrawerOpen, setIsLeaveDrawerOpen] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([
        { id: 1, type: 'Vacation', start: 'Mar 10, 2026', end: 'Mar 12, 2026', status: 'Pending', reason: 'Family vacation' },
        { id: 2, type: 'Sick Leave', start: 'Feb 05, 2026', end: 'Feb 05, 2026', status: 'Approved', reason: 'Fever' },
        { id: 3, type: 'Casual', start: 'Jan 20, 2026', end: 'Jan 20, 2026', status: 'Rejected', reason: 'Personal work' },
    ]);

    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAttendance = async () => {
        setLoading(true);
        try {
            const data = await getTrainerAttendance();
            setAttendanceData(data);
            setLeaveRequests(data.leaveRequests || []);

            // Check if user is checked in but not checked out today
            const isCurrentlyCheckedIn = data.summary?.todayCheckIn !== 'Not yet' && data.summary?.todayCheckOut === 'Not yet';
            setIsCheckedIn(isCurrentlyCheckedIn);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Present':
            case 'Approved': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'Absent':
            case 'Rejected': return 'bg-red-100 text-red-700 border border-red-200';
            case 'Late':
            case 'Pending': return 'bg-amber-100 text-amber-700 border border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    const handleCheckIn = async () => {
        try {
            const result = await checkInTrainer({ isCheckedIn });
            alert(result.message);
            setIsCheckedIn(!isCheckedIn);
            loadAttendance();
        } catch (err) {
            alert('Failed to check in/out.');
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
                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Leave Type</label>
                        <select
                            value={leaveForm.type}
                            onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option>Sick Leave</option>
                            <option>Casual Leave</option>
                            <option>Emergency</option>
                            <option>Vacation</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Start Date</label>
                            <input
                                type="date"
                                value={leaveForm.start}
                                onChange={(e) => setLeaveForm({ ...leaveForm, start: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">End Date</label>
                            <input
                                type="date"
                                value={leaveForm.end}
                                onChange={(e) => setLeaveForm({ ...leaveForm, end: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                            <p className="text-sm font-bold text-gray-800">Half Day Request?</p>
                            <p className="text-[10px] text-gray-500 font-medium tracking-tight">Select if applying for a partial day</p>
                        </div>
                        <div className="w-10 h-6 bg-gray-200 rounded-full cursor-pointer relative transition-all duration-300">
                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm transition-all duration-300" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Reason</label>
                        <textarea
                            rows={4}
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                            placeholder="Explain your reason for leave..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                    </div>

                    <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 flex gap-3">
                        <AlertCircle size={18} className="text-violet-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-violet-700 font-medium leading-relaxed">
                            Your request will be sent to the manager for approval. You'll be notified once updated.
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
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-xl transition-all w-full sm:w-auto hover:scale-105 active:scale-95 ${isCheckedIn
                                    ? 'bg-amber-500 text-white shadow-amber-500/30 hover:shadow-amber-500/40'
                                    : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-500/30 hover:shadow-violet-500/40'
                                    }`}
                            >
                                {isCheckedIn ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                Today's {isCheckedIn ? 'Check-out' : 'Check-in'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary Area */}
            <DashboardGrid>
                <StatsCard
                    title="Today Check-in"
                    value={attendanceData.summary.todayCheckIn}
                    icon={ArrowUpRight}
                    color="primary"
                />
                <StatsCard
                    title="Today Check-out"
                    value={attendanceData.summary.todayCheckOut}
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
                                <option>May 2024</option>
                                <option>April 2024</option>
                                <option>March 2024</option>
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
                            {attendanceData.logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{log.date}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <ArrowUpRight size={14} className="text-emerald-500" />
                                            {log.checkIn}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <ArrowDownLeft size={14} className="text-rose-500" />
                                            {log.checkOut}
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Version */}
                <div className="md:hidden space-y-4">
                    {attendanceData.logs.map((log) => (
                        <MobileCard
                            key={log.id}
                            title={log.date}
                            subtitle={`Check-in: ${log.checkIn}`}
                            status={log.status}
                            statusColor={log.status === 'Present' ? 'emerald' : log.status === 'Late' ? 'amber' : 'red'}
                            badge={log.hours}
                            badgeColor="violet"
                            icon={Clock}
                        />
                    ))}
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
                                {leaveRequests.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-slate-900">{leave.start === leave.end ? leave.start : `${leave.start} – ${leave.end}`}</span>
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
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile History Cards */}
                    <div className="md:hidden p-4 space-y-4">
                        {leaveRequests.map((leave) => (
                            <div key={leave.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{leave.start === leave.end ? leave.start : `${leave.start} – ${leave.end}`}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{leave.type}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusStyle(leave.status)}`}>
                                        {leave.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">{leave.reason}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Drawers */}
            <LeaveRequestDrawer />
        </div>
    );
};

export default TrainerAttendance;
