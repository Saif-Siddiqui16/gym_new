import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    Calendar,
    Target,
    TrendingUp,
    Activity,
    Clock,
    ShieldCheck,
    Mail,
    Phone,
    MapPin,
    Dumbbell,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    MessageSquare,
    X,
    Send,
    Plus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMemberById, getMemberPayments } from '../../api/trainer/trainerApi';
import { getProgress } from '../../api/progressApi';

const MemberProfileView = ({ memberId: propMemberId, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [member, setMember] = useState(null);
    const [payments, setPayments] = useState([]);
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);

    const memberId = propMemberId || location.state?.memberId || 1;

    useEffect(() => {
        if (memberId) {
            loadMemberData();
        }
    }, [memberId]);

    const loadMemberData = async () => {
        setLoading(true);
        try {
            const data = await getMemberById(memberId);
            const paymentData = await getMemberPayments(memberId);
            const progress = await getProgress(memberId);
            setMember(data);
            setPayments(paymentData || []);
            setProgressData(progress);
        } catch (error) {
            console.error("Failed to load member profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'attendance', label: 'Payments & Records' }, // Updated label for read-only requirement
        { id: 'workouts', label: 'Workouts' },
        { id: 'measurements', label: 'Body Stats' }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Member Not Found</h3>
                <p className="text-gray-500 mt-2 max-w-xs">The profile you are looking for might have been removed or the ID is incorrect.</p>
                <div className="flex gap-4 mt-6">
                    {onClose ? (
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                        >
                            Close
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/trainer/members/assigned')}
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                        >
                            Back to List
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${onClose ? 'p-0' : 'p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto pb-12'}`}>
            {/* Navigation & Header */}
            <div className="flex flex-col gap-6">
                {!onClose && (
                    <button
                        onClick={() => navigate('/trainer/members/assigned')}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors w-fit group"
                    >
                        <div className="p-1.5 bg-white border border-gray-200 rounded-lg group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                            <ChevronLeft size={18} />
                        </div>
                        <span className="text-sm font-bold">Back to Members</span>
                    </button>
                )}

                <div className="bg-white p-4 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative overflow-hidden">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-8 -mt-8 opacity-50"></div>

                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-200 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
                            {(member.name || '?').charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                            <ShieldCheck size={14} className="text-white" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{member.name}</h1>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100 mx-auto md:mx-0">
                                {member.status}
                            </span>
                        </div>
                        <p className="text-gray-500 font-medium mb-4">{member.id} • {typeof member.plan === 'object' ? member.plan?.name : (member.plan || 'No Active Plan')}</p>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-semibold">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail size={16} className="text-blue-500" />
                                    {member.email}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone size={16} className="text-blue-500" />
                                    {member.phone}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Attendance', value: `${member.attendance}%`, icon: Activity, color: 'blue' },
                    { label: 'Sessions', value: `${member.sessionsDone}/${member.totalSessions}`, icon: Target, color: 'purple' },
                    { label: 'Next Renewal', value: '15 Oct', icon: Calendar, color: 'orange' },
                    { label: 'Avg Effort', value: 'High', icon: TrendingUp, color: 'green' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                        <div className={`w-10 h-10 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">{stat.label}</p>
                        <p className="text-xl font-black text-gray-900 mt-1 group-hover:scale-110 transition-transform">{stat.value}</p>
                    </div>
                ))
                }
            </div >

            {/* Tabbed Content Area */}
            < div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]" >
                {/* Scrollable Tabs */}
                < div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth" >
                    {
                        tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-5 text-sm font-bold whitespace-nowrap transition-all duration-300 relative hover:scale-105 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full animate-in slide-in-from-left duration-300"></div>
                                )}
                            </button>
                        ))
                    }
                </div >

                <div className="p-4 md:p-8">
                    {/* Overview Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Training Goal</h3>
                                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                                        <p className="text-lg font-bold text-blue-900">{member.goal}</p>
                                        <p className="text-blue-700/70 text-sm mt-1 leading-relaxed">Focusing on compound movements with progressive overload. Current cycle aims for muscle density and neural adaptation.</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Active Protocols</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-fuchsia-50/50 p-5 rounded-3xl border border-fuchsia-100/50 transition-all hover:shadow-md hover:border-fuchsia-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-600 bg-fuchsia-100 px-2 py-1 rounded-lg">Workout Plan</span>
                                            </div>
                                            <p className="font-bold text-gray-900 truncate">{member.activeWorkoutPlan ? member.activeWorkoutPlan.name : 'N/A'}</p>
                                            <p className="text-xs text-fuchsia-600/70 font-bold mt-1 uppercase tracking-widest truncate">{member.activeWorkoutPlan ? member.activeWorkoutPlan.goal : 'No plan assigned'}</p>
                                        </div>
                                        <div className="bg-violet-50/50 p-5 rounded-3xl border border-violet-100/50 transition-all hover:shadow-md hover:border-violet-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-100 px-2 py-1 rounded-lg">Diet Plan</span>
                                            </div>
                                            <p className="font-bold text-gray-900 truncate">{member.activeDietPlan ? member.activeDietPlan.name : 'N/A'}</p>
                                            <p className="text-xs text-violet-600/70 font-bold mt-1 uppercase tracking-widest truncate">{member.activeDietPlan ? member.activeDietPlan.target : 'No plan assigned'}</p>
                                        </div>
                                    </div>
                                </div>


                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Sessions</h3>
                                    <div className="space-y-3">
                                        {member.recentWorkouts?.length > 0 ? member.recentWorkouts.slice(0, 3).map((workout) => (
                                            <div key={workout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                                                        <Dumbbell size={18} />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="font-bold text-gray-800 truncate">{workout.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium truncate">{workout.date} • {workout.duration}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase text-gray-600 border flex-shrink-0 ml-2 ${workout.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 border-gray-200'}`}>{workout.status}</span>
                                            </div>
                                        )) : <p className="text-sm font-medium text-gray-400">No recent sessions.</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Membership Info</h3>
                                    <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-500 inline-flex items-center gap-2">
                                                <Calendar size={14} /> Plan Expiry
                                            </span>
                                            <span className="text-sm font-bold text-gray-900">{member.expiry}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-500 inline-flex items-center gap-2">
                                                <MapPin size={14} /> Primary Hub
                                            </span>
                                            <span className="text-sm font-bold text-gray-900">{member.location}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                            <span className="text-sm font-bold text-gray-500">Auto-Renew</span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase">Enabled</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attendance / Payments Tab Content */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Payment History (Read-only)</h3>
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                    {/* Desktop Table */}
                                    <table className="w-full text-left hidden md:table">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Method</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {payments.length > 0 ? payments.map((p) => (
                                                <tr key={p.id}>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{p.date}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{p.amount}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{p.method}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase border border-green-100">
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="text-center py-6 text-sm font-medium text-gray-400">No payments found.</td></tr>}
                                        </tbody>
                                    </table>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden divide-y divide-gray-50">
                                        {payments.map((p) => (
                                            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">₹{p.amount}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{p.date}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase border border-green-100 block w-fit ml-auto mb-1">
                                                        {p.status}
                                                    </span>
                                                    <p className="text-xs text-gray-400 font-medium">{p.method}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Workouts Tab Content */}
                    {activeTab === 'workouts' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Workout History</h3>
                                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {member.recentWorkouts?.length > 0 ? member.recentWorkouts.map((workout, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:border-blue-100 hover:shadow-lg transition-all duration-300">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                                    <Dumbbell size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">{workout.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-gray-500">
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {workout.date}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {workout.duration}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xl font-black text-gray-900">{workout.calories}</p>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Calories</p>
                                                <span className={`px-2 py-0.5 mt-1 block w-fit ml-auto rounded-lg text-[10px] font-black uppercase border ${workout.status === 'Completed' || workout.status === 'Attended' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>{workout.status}</span>
                                            </div>
                                        </div>
                                    )) : <div className="text-center py-8 text-gray-400 font-bold uppercase tracking-widest text-xs">No workout history available</div>}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Weekly Stats</h3>
                                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                                                <Activity size={24} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400 font-medium">Total Volume</p>
                                                <p className="text-2xl font-bold">{member.workoutStats?.totalVolume || '0 kg'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                                                <span className="text-gray-400">Workouts</span>
                                                <span className="font-bold text-xl">{member.workoutStats?.workouts || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                                                <span className="text-gray-400">Duration</span>
                                                <span className="font-bold text-xl">{member.workoutStats?.duration || '0h'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Intensity</span>
                                                <span className="px-2 py-0.5 rounded-lg bg-green-500/20 text-green-400 font-bold uppercase text-xs">{member.workoutStats?.intensity || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Body Stats/Measurements Tab Content */}
                    {activeTab === 'measurements' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Core Metrics</h3>
                                    <button
                                        onClick={() => navigate(`/progress?memberId=${member.id}`)}
                                        className="px-4 py-2 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
                                    >
                                        <Plus size={14} /> Manage Progress
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {(() => {
                                        const logs = progressData?.logs || [];
                                        const targets = progressData?.targets || {};
                                        const hasLogs = logs.length > 0;
                                        const latest = hasLogs ? logs[logs.length - 1] : {};
                                        const prev = hasLogs && logs.length > 1 ? logs[logs.length - 2] : null;

                                        const getChange = (curr, old) => {
                                            if (old === null || old === undefined) return '0.0';
                                            const diff = (parseFloat(curr) || 0) - (parseFloat(old) || 0);
                                            return (diff >= 0 ? '+' : '') + diff.toFixed(1);
                                        };

                                        const stats = [
                                            { label: 'Weight', value: parseFloat(latest.weight || 0).toFixed(1), unit: 'kg', change: getChange(latest.weight, prev?.weight), isPositive: (parseFloat(latest.weight) || 0) <= (parseFloat(prev?.weight) || 0) },
                                            { label: 'Body Fat', value: parseFloat(latest.bodyFat || 0).toFixed(1), unit: '%', change: getChange(latest.bodyFat, prev?.bodyFat), isPositive: (parseFloat(latest.bodyFat) || 0) <= (parseFloat(prev?.bodyFat) || 0) },
                                            { label: 'Target Wt', value: parseFloat(targets.weight || 0).toFixed(1), unit: 'kg', change: 'Goal', isPositive: true },
                                            { label: 'Target BF', value: parseFloat(targets.bodyFat || 0).toFixed(1), unit: '%', change: 'Goal', isPositive: true },
                                        ];

                                        return stats.map((stat, i) => (
                                            <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-blue-50/50 hover:border-blue-100 transition-all cursor-default">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                                                    <span className="text-xs font-bold text-gray-500">{stat.unit}</span>
                                                </div>
                                                <div className={`text-xs font-bold mt-2 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                    {stat.change}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 py-2">Body Measurements</h3>
                                    <div className="space-y-5">
                                        {(() => {
                                            const logs = progressData?.logs || [];
                                            const hasLogs = logs.length > 0;
                                            const latest = hasLogs ? logs[logs.length - 1]?.measurements || {} : {};
                                            const prev = (hasLogs && logs.length > 1) ? logs[logs.length - 2]?.measurements || {} : {};

                                            const parts = [
                                                { label: 'Chest', key: 'chest', goal: 105 },
                                                { label: 'Waist', key: 'waist', goal: 80 },
                                                { label: 'Arms', key: 'arms', goal: 40 },
                                                { label: 'Legs', key: 'legs', goal: 65 },
                                            ];

                                            return parts.map((item, idx) => {
                                                const currentVal = parseFloat(latest[item.key] || 0);
                                                const prevVal = parseFloat(prev[item.key] || 0);
                                                const progressPercent = Math.min((currentVal / (item.goal || 1)) * 100, 100);

                                                return (
                                                    <div key={idx} className="bg-white rounded-xl">
                                                        <div className="flex justify-between items-end mb-2">
                                                            <span className="font-bold text-gray-700">{item.label}</span>
                                                            <div className="flex gap-4 text-xs font-medium text-gray-500">
                                                                <span>Prev: {prevVal}cm</span>
                                                                <span className="text-blue-600 font-bold">Goal: {item.goal}cm</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                                                                style={{ width: `${progressPercent}%` }}
                                                            />
                                                        </div>
                                                        <div className="mt-1 text-right text-xs font-bold text-gray-900">{currentVal} cm</div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {(() => {
                                    const logs = progressData?.logs || [];
                                    const latest = logs.length > 0 ? logs[logs.length - 1] : {};
                                    const weight = parseFloat(latest.weight || 0);
                                    const heightCm = parseFloat(latest.measurements?.height || 175);
                                    const bmi = weight > 0 ? (weight / Math.pow(heightCm / 100, 2)).toFixed(1) : 'N/A';

                                    let status = 'Unknown';
                                    let pct = 0;
                                    if (bmi !== 'N/A') {
                                        const b = parseFloat(bmi);
                                        if (b < 18.5) { status = 'Underweight'; pct = 20; }
                                        else if (b < 25) { status = 'Healthy Weight'; pct = 50; }
                                        else { status = 'Overweight'; pct = 80; }
                                    }

                                    return (
                                        <div className="bg-blue-600 rounded-[32px] p-6 text-white shadow-xl shadow-blue-200">
                                            <h3 className="font-bold text-xl mb-2">BMI Calculator</h3>
                                            <p className="text-blue-100 text-sm mb-6">Based on latest measurements</p>

                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-blue-200">Current Score</span>
                                                <span className="text-3xl font-black">{bmi}</span>
                                            </div>
                                            <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden mb-2 relative">
                                                <div className="absolute left-[30%] right-[30%] top-0 bottom-0 border-x-2 border-white/50" />
                                                <div className="h-full bg-white/90 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                                                <span>Under</span>
                                                <span>Normal</span>
                                                <span>Over</span>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-white/20">
                                                <p className="text-sm font-medium leading-relaxed">
                                                    {bmi === 'N/A'
                                                        ? 'Record your weight and height in progress tracking to see your BMI.'
                                                        : <>Your BMI suggests you are in a <span className="font-black text-white">{status}</span> range.</>}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Read-only Badge Footer */}
            <div className="flex items-center justify-center gap-2 py-4 px-6 bg-gray-100/50 rounded-2xl border border-gray-200 w-fit mx-auto">
                <ShieldCheck size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trainee Profile • Read Only Mode</span>
            </div>
        </div>
    );
};

export default MemberProfileView;
