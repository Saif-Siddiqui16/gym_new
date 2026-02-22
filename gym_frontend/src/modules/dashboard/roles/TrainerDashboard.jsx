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

const TrainerDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(DASHBOARD_DATA.TRAINER);

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
                    ]
                }));
            } catch (error) {
                console.error('Failed to fetch trainer dashboard:', error);
            }
        };
        fetchDashboardData();
    }, []);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEarningsDrawerOpen, setIsEarningsDrawerOpen] = useState(false);
    const [isAttendanceDrawerOpen, setIsAttendanceDrawerOpen] = useState(false);
    const [selectedAtRiskMember, setSelectedAtRiskMember] = useState(null);
    const [isAtRiskDrawerOpen, setIsAtRiskDrawerOpen] = useState(false);

    const atRiskClients = data.myClients?.filter(c => c.daysSinceLastVisit >= 10) || [];

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {/* Column 1: Today's Schedule */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-md font-bold text-gray-800 flex items-center gap-2">
                                <Clock size={18} className="text-indigo-600" />
                                Today's Schedule
                            </h2>
                            <p className="text-[10px] text-gray-500 font-medium ml-6">Your sessions for today</p>
                        </div>
                    </div>

                    <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all flex flex-col p-0 overflow-hidden">
                        {/* Summary Row */}
                        <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50/50 border-b border-gray-100">
                            <div className="p-3 text-center">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Total</p>
                                <p className="text-lg font-bold text-gray-800">{data.todaySessions.summary.total}</p>
                            </div>
                            <div className="p-3 text-center">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Upcoming</p>
                                <p className="text-lg font-bold text-amber-600">{data.todaySessions.summary.upcoming}</p>
                            </div>
                            <div className="p-3 text-center">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Done</p>
                                <p className="text-lg font-bold text-emerald-600">{data.todaySessions.summary.completed}</p>
                            </div>
                        </div>

                        {/* Timeline List */}
                        <div className="divide-y divide-gray-100 max-h-[450px] overflow-y-auto scrollbar-thin">
                            {data.todaySessions.list.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Calendar size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-bold text-sm">🎉 No sessions today</p>
                                    <p className="text-[10px] text-gray-400">Time to catch up on planning!</p>
                                </div>
                            ) : (
                                data.todaySessions.list.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => handleSessionClick(session)}
                                        className="group p-4 flex items-center gap-4 hover:bg-indigo-50/30 cursor-pointer transition-all relative"
                                    >
                                        <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${session.status === 'Completed' ? 'bg-emerald-500' :
                                            session.status === 'Upcoming' ? 'bg-amber-500' : 'bg-red-500'
                                            }`} />

                                        <div className="w-16 flex-shrink-0">
                                            <p className="text-xs font-bold text-gray-900">{session.time}</p>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${session.type === 'PT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {session.type} {session.type === 'PT' ? 'Session' : 'Class'}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${session.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    session.status === 'Upcoming' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-sm truncate flex items-center gap-1.5">
                                                {session.type === 'PT' ? <User size={12} className="text-gray-400" /> : <Dumbbell size={12} className="text-gray-400" />}
                                                {session.name}
                                            </h4>
                                            {session.location && (
                                                <p className="text-[10px] text-gray-500 font-medium">📍 {session.location}</p>
                                            )}
                                        </div>

                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Drawers */}
                <SessionDetailsDrawer />
                <EarningsSnapshotDrawer />
                <AttendanceDetailsDrawer />
                <ClientAlertDetailDrawer />

                {/* Column 2: Clients & Tasks */}
                <div className="space-y-5">
                    {/* Client Alerts Widget */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-500" />
                                Client Alerts
                            </h2>
                            <p className="text-[10px] text-gray-400 font-medium tracking-tight">Members needing follow-up</p>
                        </div>

                        <Card className="p-0 border border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden">
                            <div className="p-4 bg-red-50/50 border-b border-red-100 flex items-center justify-between">
                                <p className="text-xs font-bold text-red-800 uppercase tracking-tighter">At-Risk Members</p>
                                <span className="text-lg font-black text-red-600">{atRiskClients.length}</span>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {atRiskClients.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <p className="text-sm font-bold">🎉 All assigned members are active.</p>
                                    </div>
                                ) : (
                                    atRiskClients.slice(0, 5).map(member => (
                                        <div
                                            key={member.id}
                                            onClick={() => handleAtRiskClick(member)}
                                            className="group flex items-center justify-between p-4 hover:bg-red-50/30 cursor-pointer transition-all active:bg-red-50/50 border-l-4 border-transparent hover:border-red-500"
                                        >
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-800 text-xs truncate">{member.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-medium">Last Visit: {member.lastVisit}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black border border-red-100 shadow-sm uppercase">At Risk</span>
                                                <ChevronRight size={14} className="text-gray-300 group-hover:text-red-600 transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* My Clients */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <Users size={16} className="text-blue-600" />
                                My Clients
                            </h2>
                            <button
                                onClick={() => navigate('/trainer/members/assigned')}
                                className="text-[10px] font-black text-indigo-600 hover:underline"
                            >
                                View All
                            </button>
                        </div>

                        <Card className="p-4 sm:p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all">
                            <div className="space-y-4">
                                {data.myClients.slice(0, 4).map(client => (
                                    <div key={client.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-gray-800 text-xs truncate">{client.name}</h4>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500">{client.progress}%</span>
                                        </div>
                                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-1000"
                                                style={{ width: `${client.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Pending Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-amber-500" />
                                    Pending Actions
                                </h2>
                                <p className="text-[10px] text-gray-400 font-medium ml-6">Tasks requiring your attention</p>
                            </div>
                        </div>

                        <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all p-0 overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {data.pendingTasks.length === 0 ? (
                                    <div className="p-8 text-center bg-gray-50/30">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-500">
                                            <CheckCircle size={20} />
                                        </div>
                                        <p className="text-gray-600 font-bold text-xs">All clear!</p>
                                        <p className="text-[10px] text-gray-400">No pending actions for today.</p>
                                    </div>
                                ) : (
                                    data.pendingTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            onClick={() => navigate(task.route)}
                                            className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-all active:bg-gray-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{task.title}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-100 min-w-[20px] text-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                                    {task.count}
                                                </span>
                                                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Column 3: Performance & Earnings */}
                <div className="space-y-5">
                    {/* My Attendance */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <Clock size={16} className="text-emerald-500" />
                                    My Attendance
                                </h2>
                                <p className="text-[10px] text-gray-400 font-medium ml-6">This month overview</p>
                            </div>
                            <button
                                onClick={() => setIsAttendanceDrawerOpen(true)}
                                className="text-[10px] font-black text-indigo-600 hover:underline"
                            >
                                View Details
                            </button>
                        </div>

                        <Card className="p-4 sm:p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all">
                            <div className="space-y-5">
                                <div className="grid grid-cols-3 divide-x divide-gray-100">
                                    <div className="text-center px-1">
                                        <p className="text-lg font-black text-gray-900">{data.myAttendance.presentDays}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Present</p>
                                    </div>
                                    <div className="text-center px-1">
                                        <p className="text-lg font-black text-amber-600">{data.myAttendance.lateDays}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Late</p>
                                    </div>
                                    <div className="text-center px-1">
                                        <p className="text-lg font-black text-red-500">{data.myAttendance.absentDays}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Absent</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-gray-500 uppercase tracking-tight">Attendance Rate</span>
                                        <span className="text-emerald-600">{data.myAttendance.attendanceRate}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${data.myAttendance.attendanceRate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-50">
                                    <div className="flex justify-between items-center">
                                        {data.myAttendance.weeklySummary.map((day, idx) => (
                                            <div key={idx} className="flex flex-col items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${day.status === 'Present' ? 'bg-emerald-500' :
                                                    day.status === 'Late' ? 'bg-amber-400' : 'bg-red-400'
                                                    }`} />
                                                <span className="text-[8px] font-bold text-gray-400">{day.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Earnings Snapshot */}
                    {data.isCommissionBased && (
                        <div>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <Briefcase size={16} className="text-indigo-500" />
                                        Earnings Snapshot
                                    </h2>
                                    <p className="text-[10px] text-gray-400 font-medium ml-6">This month performance</p>
                                </div>
                            </div>

                            <Card className="p-4 sm:p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all relative overflow-hidden flex flex-col items-center text-center">
                                <div className="mb-4">
                                    <h3 className="text-3xl font-black text-indigo-600 tracking-tighter">
                                        ₹{data.earnings.totalEarnings.toLocaleString()}
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">This Month's Earnings</p>
                                </div>

                                <div className="w-full grid grid-cols-2 divide-x divide-gray-100 mb-5 border-y border-gray-50 py-3">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase">Commission</p>
                                        <p className="text-xs font-bold text-gray-700">₹{data.earnings.commission.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase">Salary</p>
                                        <p className="text-xs font-bold text-gray-700">₹{data.earnings.salary.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="w-full space-y-2 mb-5 px-1">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter text-gray-400">
                                        <span>Target Progress</span>
                                        <span className="text-indigo-600">{Math.round((data.earnings.totalEarnings / data.earnings.target) * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${Math.min((data.earnings.totalEarnings / data.earnings.target) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsEarningsDrawerOpen(true)}
                                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-2 group w-full justify-center"
                                >
                                    View Details
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Card>
                        </div>
                    )}

                    {/* Announcements */}
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <Megaphone size={16} className="text-indigo-500" />
                                Announcements
                            </h2>
                            <button
                                onClick={() => navigate('/trainer/announcements')}
                                className="text-[10px] font-black text-indigo-600 hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-100 transition-all cursor-pointer">
                                <h4 className="text-[11px] font-bold text-gray-900 mb-1">New Policy: Client Cancellations</h4>
                                <p className="text-[10px] text-gray-500 line-clamp-1">Please inform clients about the new 4-hour rule...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
