import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import RightDrawer from '../../../components/common/RightDrawer';
import StatsCard from '../components/StatsCard';
import DashboardGrid from '../components/DashboardGrid';
import { DASHBOARD_DATA } from '../data/mockDashboardData';
import {
    Calendar,
    User,
    CheckCircle,
    Clock,
    ChevronRight,
    Users,
    Megaphone,
    Activity,
    TrendingUp,
    DollarSign,
    Dumbbell,
    ExternalLink,
    ArrowRight,
    MessageSquare,
    Save,
    MapPin,
    AlertCircle,
    Briefcase,
    Phone,
    Mail,
    Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';

const INITIAL_TRAINER_DATA = {
    stats: [
        { id: 1, title: 'Total Members', value: '0', icon: Users, color: 'primary' },
        { id: 2, title: 'Sessions Today', value: '0', icon: Calendar, color: 'success' },
        { id: 3, title: 'Pending Plans', value: '0', icon: Activity, color: 'warning' },
    ],
    todaySessions: {
        summary: { total: 0, upcoming: 0, completed: 0 },
        list: []
    },
    myClients: [],
    pendingTasks: [],
    earnings: {
        totalEarnings: 0,
        commission: 0,
        salary: 0,
        target: 0,
        pendingPayouts: 0
    },
    myAttendance: {
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        attendanceRate: 0
    }
};

const TrainerDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(INITIAL_TRAINER_DATA);
    const [loading, setLoading] = useState(true);

    const [selectedSession, setSelectedSession] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEarningsDrawerOpen, setIsEarningsDrawerOpen] = useState(false);
    const [isAttendanceDrawerOpen, setIsAttendanceDrawerOpen] = useState(false);
    const [selectedAtRiskMember, setSelectedAtRiskMember] = useState(null);
    const [isAtRiskDrawerOpen, setIsAtRiskDrawerOpen] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await apiClient.get('/dashboard/trainer');
                const apiData = response.data;
                setData(prev => ({
                    ...prev,
                    stats: [
                        { ...prev.stats[0], value: apiData.totalMembers.toString() },
                        { ...prev.stats[1], value: apiData.sessionsToday.toString() },
                        { ...prev.stats[2], value: apiData.pendingPlans.toString() }
                    ],
                    todaySessions: apiData.todaySessions,
                    myClients: apiData.myClients,
                    pendingTasks: apiData.pendingTasks || [],
                    myAttendance: {
                        ...prev.myAttendance,
                        ...apiData.myAttendance
                    },
                    earnings: apiData.earnings || prev.earnings
                }));
            } catch (error) {
                console.error('Failed to fetch trainer dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const atRiskClients = data.myClients?.filter(c => c.daysSinceLastVisit >= 10) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Loading Trainer Session Environment...</p>
                </div>
            </div>
        );
    }

    const handleSessionClick = (session) => {
        setSelectedSession(session);
        setIsDrawerOpen(true);
    };

    const handleAtRiskClick = (member) => {
        setSelectedAtRiskMember(member);
        setIsAtRiskDrawerOpen(true);
    };

    const SessionDetailsDrawer = () => {
        if (!selectedSession) return null;

        return (
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Session Details"
                subtitle={`${selectedSession.type} - ${selectedSession.time}`}
                footer={
                    <div className="flex gap-3">
                        <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                            <CheckCircle size={18} />
                            Mark Complete
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Client/Session Summary */}
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 font-bold text-xl">
                            {selectedSession.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{selectedSession.name}</h3>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{selectedSession.type} Session</p>
                        </div>
                    </div>

                    {/* Timeline Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <Clock size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Time</p>
                                <p className="text-sm font-bold text-gray-800">{selectedSession.time}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Location</p>
                                <p className="text-sm font-bold text-gray-800">{selectedSession.location || 'Not Specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <AlertCircle size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Status</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border inline-block ${selectedSession.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    selectedSession.status === 'Upcoming' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                    {selectedSession.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Session Notes/Feedback Area */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <MessageSquare size={16} className="text-indigo-600" />
                            Session Notes
                        </h4>
                        <textarea
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 min-h-[120px]"
                            placeholder="Add notes about the session or client feedback..."
                        />
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all ml-auto">
                            <Save size={14} />
                            Save Notes
                        </button>
                    </div>
                </div>
            </RightDrawer>
        );
    };

    const EarningsSnapshotDrawer = () => {
        if (!data.earnings) return null;

        return (
            <RightDrawer
                isOpen={isEarningsDrawerOpen}
                onClose={() => setIsEarningsDrawerOpen(false)}
                title="Earnings Details"
                subtitle="This Month Performance"
                footer={
                    <div className="flex gap-3">
                        <button className="flex-1 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                            Download Statement
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="p-5 bg-indigo-600 rounded-2xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <DollarSign size={80} />
                        </div>
                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Total Fixed + Commission</p>
                        <h3 className="text-3xl font-black">₹{data.earnings.totalEarnings.toLocaleString()}</h3>
                        <p className="text-[10px] mt-2 opacity-70 font-medium italic">Calculated for {new Date().toLocaleString('default', { month: 'long' })}</p>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Briefcase size={16} className="text-indigo-600" />
                            <h4 className="text-sm font-bold text-gray-800">Earnings Breakdown</h4>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-600">Base Salary</span>
                                <span className="text-sm font-black text-gray-900">₹{data.earnings.salary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-600">Commission</span>
                                <span className="text-sm font-black text-indigo-600">₹{data.earnings.commission.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <span className="text-xs font-bold text-indigo-700">Total Calculation</span>
                                <span className="text-sm font-black text-indigo-700">₹{data.earnings.totalEarnings.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress to Target */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                            <h4 className="text-xs font-bold text-gray-800">Target Progress</h4>
                            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {Math.round((data.earnings.totalEarnings / data.earnings.target) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                                style={{ width: `${(data.earnings.totalEarnings / data.earnings.target) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            <span>Progress: ₹{data.earnings.totalEarnings.toLocaleString()}</span>
                            <span>Target: ₹{data.earnings.target.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Pending Payout */}
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <CheckCircle size={14} />
                            </div>
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-tighter">Verified Payout</span>
                        </div>
                        <p className="text-[10px] text-emerald-700 font-medium mb-1">Approved commission for this month:</p>
                        <p className="text-lg font-black text-emerald-800">₹{data.earnings.pendingPayouts.toLocaleString()}</p>
                    </div>
                </div>
            </RightDrawer>
        );
    };

    const AttendanceDetailsDrawer = () => {
        if (!data.myAttendance) return null;

        return (
            <RightDrawer
                isOpen={isAttendanceDrawerOpen}
                onClose={() => setIsAttendanceDrawerOpen(false)}
                title="Attendance History"
                subtitle="Full Month Overview"
                footer={
                    <button className="w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-all">
                        Correction Request
                    </button>
                }
            >
                <div className="space-y-6">
                    {/* Month Nav */}
                    <div className="flex items-center justify-between px-1">
                        <h4 className="font-extrabold text-gray-900 text-sm">February 2026</h4>
                        <div className="flex gap-1">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronRight size={16} className="rotate-180" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Present</p>
                            <p className="text-xl font-black text-emerald-700">{data.myAttendance.presentDays}</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                            <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Late</p>
                            <p className="text-xl font-black text-amber-700">{data.myAttendance.lateDays}</p>
                        </div>
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                            <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Absent</p>
                            <p className="text-xl font-black text-red-700">{data.myAttendance.absentDays}</p>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-800 px-1 uppercase tracking-widest">Recent Records</h4>
                        <div className="divide-y divide-gray-100 border-y border-gray-100">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="py-3 flex items-center justify-between px-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                                            <span className="text-[8px] font-bold text-gray-400 leading-tight">FEB</span>
                                            <span className="text-xs font-black text-gray-700 leading-tight">{14 - i}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">Punch In: 08:55 AM</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Punch Out: 05:05 PM</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                        Present
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </RightDrawer>
        );
    };

    const ClientAlertDetailDrawer = () => {
        if (!selectedAtRiskMember) return null;

        return (
            <RightDrawer
                isOpen={isAtRiskDrawerOpen}
                onClose={() => setIsAtRiskDrawerOpen(false)}
                title="Client Follow-up"
                subtitle="At-Risk Member Details"
                footer={
                    <div className="flex gap-3">
                        <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                            <Phone size={16} />
                            Call Member
                        </button>
                        <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                            <MessageSquare size={16} />
                            Message
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Header Summary */}
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600 font-bold text-xl">
                            {selectedAtRiskMember.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{selectedAtRiskMember.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">At Risk</span>
                                <p className="text-xs text-red-600 font-bold">{selectedAtRiskMember.daysSinceLastVisit} Days Inactive</p>
                            </div>
                        </div>
                    </div>

                    {/* Member Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Membership</p>
                                <p className="text-sm font-bold text-gray-800">{selectedAtRiskMember.membership}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Progress</p>
                                <p className="text-sm font-bold text-gray-800">{selectedAtRiskMember.progress}%</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <Phone size={16} className="text-gray-400" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Phone</p>
                                <p className="text-sm font-bold text-gray-800">{selectedAtRiskMember.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <Calendar size={16} className="text-gray-400" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Last Visit</p>
                                <p className="text-sm font-bold text-gray-800">{selectedAtRiskMember.lastVisit}</p>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Follow-up Note */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <Plus size={16} className="text-indigo-600" />
                            Add Follow-up Note
                        </h4>
                        <textarea
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                            placeholder="Record the outcome of your follow-up call..."
                        />
                        <button className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all">
                            Save Note
                        </button>
                    </div>
                </div>
            </RightDrawer>
        );
    };

    return (
        <div className="h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8 space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Standard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Trainer Dashboard</h1>
                    <p className="text-gray-600 text-sm">Manage your daily sessions and client performance</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/trainer/sessions/calendar')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Calendar size={16} />
                        My Schedule
                    </button>
                    <button
                        onClick={() => navigate('/trainer/sessions/upcoming')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md"
                    >
                        <Dumbbell size={16} />
                        Start Session
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-600" />
                    <h2 className="text-md font-bold text-gray-800">Key Metrics</h2>
                </div>
                <DashboardGrid>
                    {data.stats.map(stat => (
                        <StatsCard key={stat.id} {...stat} />
                    ))}
                </DashboardGrid>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* Column 1: Performance & Alerts */}
                <div className="space-y-6">
                    {/* My Attendance */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <Clock size={16} className="text-emerald-500" />
                                My Attendance
                            </h2>
                            <button onClick={() => setIsAttendanceDrawerOpen(true)} className="text-[10px] font-black text-indigo-600 hover:underline">
                                Details
                            </button>
                        </div>
                        <Card className="p-4 border border-gray-200 shadow-sm">
                            <div className="grid grid-cols-3 divide-x divide-gray-100 text-center mb-4">
                                <div><p className="text-lg font-black">{data.myAttendance.presentDays}</p><p className="text-[9px] text-gray-400 uppercase font-bold">Present</p></div>
                                <div><p className="text-lg font-black text-amber-600">{data.myAttendance.lateDays}</p><p className="text-[9px] text-gray-400 uppercase font-bold">Late</p></div>
                                <div><p className="text-lg font-black text-red-500">{data.myAttendance.absentDays}</p><p className="text-[9px] text-gray-400 uppercase font-bold">Absent</p></div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-gray-500 uppercase">Rate</span>
                                    <span className="text-emerald-600">{data.myAttendance.attendanceRate}%</span>
                                </div>
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${data.myAttendance.attendanceRate}%` }} />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Client Alerts */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 px-1">
                            <AlertCircle size={16} className="text-red-500" />
                            Client Alerts
                        </h2>
                        <Card className="p-0 border border-red-50 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {atRiskClients.slice(0, 4).map(member => (
                                    <div key={member.id} onClick={() => handleAtRiskClick(member)} className="p-4 hover:bg-red-50/30 cursor-pointer transition-all flex justify-between items-center">
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-800 text-xs truncate">{member.name}</h4>
                                            <p className="text-[10px] text-red-500 font-bold">{member.daysSinceLastVisit} Days Inactive</p>
                                        </div>
                                        <ChevronRight size={12} className="text-red-300" />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Column 2 (CENTER): Daily Core & Earnings */}
                <div className="space-y-8">
                    {/* Today's Schedule */}
                    <div className="space-y-4">
                        <h2 className="text-md font-bold text-gray-900 flex items-center gap-3 px-1">
                            <Calendar size={20} className="text-indigo-600" />
                            Today's Schedule
                        </h2>
                        <Card className="border-2 border-indigo-100 shadow-xl p-0 overflow-hidden bg-white">
                            <div className="grid grid-cols-3 divide-x divide-indigo-50 bg-indigo-50/50 border-b border-indigo-100">
                                <div className="p-4 text-center">
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Total</p>
                                    <p className="text-2xl font-black text-gray-900">{data.todaySessions.summary.total}</p>
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Next</p>
                                    <p className="text-2xl font-black text-amber-600">{data.todaySessions.summary.upcoming}</p>
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Done</p>
                                    <p className="text-2xl font-black text-emerald-600">{data.todaySessions.summary.completed}</p>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                                {data.todaySessions.list.length === 0 ? (
                                    <div className="p-10 text-center text-gray-400 font-bold text-sm">No sessions scheduled</div>
                                ) : (
                                    data.todaySessions.list.map((session) => (
                                        <div key={session.id} onClick={() => handleSessionClick(session)} className="p-5 hover:bg-indigo-50/50 cursor-pointer transition-all flex items-center justify-between border-l-4 border-transparent hover:border-indigo-500">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-black text-gray-900">{session.time}</span>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-gray-800 text-sm truncate">{session.name}</h4>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-bold uppercase">{session.type}</span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${session.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                session.status === 'Upcoming' ? 'bg-amber-100 text-amber-700 active-pulse' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {session.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Earnings Snapshot (THE CENTRAL PIECE) */}
                    {data.isCommissionBased && (
                        <div className="space-y-4">
                            <h2 className="text-md font-bold text-gray-900 flex items-center gap-3 px-1">
                                <TrendingUp size={20} className="text-emerald-500" />
                                Current Earnings
                            </h2>
                            <Card className="p-8 border-2 border-emerald-100 shadow-2xl relative overflow-hidden flex flex-col items-center text-center bg-gradient-to-br from-white via-emerald-50/20 to-indigo-50/20">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Briefcase size={80} />
                                </div>
                                <div className="relative mb-6">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Projected Payout</p>
                                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter">
                                        ₹{data.earnings.totalEarnings.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="w-full grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-sm">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Commission</p>
                                        <p className="text-lg font-bold text-emerald-600">₹{data.earnings.commission.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100 shadow-sm">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Base Salary</p>
                                        <p className="text-lg font-bold text-indigo-600">₹{data.earnings.salary.toLocaleString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEarningsDrawerOpen(true)}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
                                >
                                    Detailed Breakdown <ArrowRight size={16} />
                                </button>
                            </Card>
                        </div>
                    )}

                    {/* Pending Actions */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-3 px-1">
                            <AlertCircle size={18} className="text-amber-500" />
                            Pending Actions
                        </h2>
                        <Card className="border border-gray-100 shadow-lg p-0 overflow-hidden">
                            <div className="divide-y divide-gray-50">
                                {data.pendingTasks.map((task) => (
                                    <div key={task.id} onClick={() => navigate(task.route)} className="p-5 hover:bg-slate-50 cursor-pointer flex justify-between items-center group transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{task.title}</span>
                                        </div>
                                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black">{task.count}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Column 3: Clients & Announcements */}
                <div className="space-y-6">
                    {/* My Clients */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <Users size={16} className="text-blue-600" />
                                My Clients
                            </h2>
                            <button onClick={() => navigate('/trainer/members/assigned')} className="text-[10px] font-black text-indigo-600 hover:underline">
                                View All
                            </button>
                        </div>
                        <Card className="p-5 border border-gray-100 shadow-sm">
                            <div className="space-y-5">
                                {data.myClients.slice(0, 5).map(client => (
                                    <div key={client.id} className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{client.name}</span>
                                            <span className="text-[10px] font-black text-gray-400">{client.progress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-1000 group-hover:bg-indigo-500" style={{ width: `${client.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Announcements */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 px-1">
                            <Megaphone size={16} className="text-indigo-500" />
                            Announcements
                        </h2>
                        <div className="space-y-3">
                            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-all cursor-pointer">
                                <h4 className="text-xs font-bold text-indigo-900 mb-1">New Policy: Client Cancellations</h4>
                                <p className="text-[10px] text-indigo-600 font-medium">Please review the updated 4-hour rule in settings...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SessionDetailsDrawer />
            <EarningsSnapshotDrawer />
            <AttendanceDetailsDrawer />
            <ClientAlertDetailDrawer />
        </div>
    );
};

export default TrainerDashboard;
