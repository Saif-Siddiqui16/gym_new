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
    Plus,
    Info
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMemberById, getMemberPayments } from '../../api/trainer/trainerApi';
import { getChatMessages, sendChatMessage } from '../../api/communication/communicationApi';
import { useAuth } from '../../context/AuthContext';
import { getProgress } from '../../api/progressApi';
import QuickAssignPlanDrawer from './components/QuickAssignPlanDrawer';

const MemberProfileView = ({ memberId: propMemberId, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [member, setMember] = useState(null);
    const [payments, setPayments] = useState([]);
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    const memberId = propMemberId || location.state?.memberId || 1;

    useEffect(() => {
        if (memberId) {
            loadMemberData();
        }
    }, [memberId]);

    // Chat History Polling
    useEffect(() => {
        let pollInterval;
        if (isChatModalOpen && member) {
            loadChatHistory();
            pollInterval = setInterval(loadChatHistory, 3000);
        }
        return () => clearInterval(pollInterval);
    }, [isChatModalOpen, member]);

    const loadChatHistory = async () => {
        if (!member) return;
        try {
            const messages = await getChatMessages(member.id, true);
            setChatHistory(messages);
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!chatMessage.trim() || !member) return;

        const messageText = chatMessage;
        setChatMessage('');

        try {
            await sendChatMessage({
                receiverId: member.id,
                message: messageText,
                receiverType: 'MEMBER'
            });
            loadChatHistory();
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message');
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const loadMemberData = async () => {
        setLoading(true);
        try {
            const data = await getMemberById(memberId);
            const paymentData = await getMemberPayments(memberId);
            setMember(data);
            setPayments(paymentData || []);
            // Use progress from member data if available
            if (data.progress) {
                setProgressData({
                    logs: data.progress,
                    targets: {
                        weight: data.targetWeight || 75,
                        bodyFat: data.targetBodyFat || 15
                    }
                });
            }
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
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
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
                        className="flex items-center gap-2 text-gray-500 hover:text-violet-600 transition-colors w-fit group"
                    >
                        <div className="p-1.5 bg-white border border-gray-200 rounded-lg group-hover:bg-violet-50 group-hover:border-violet-200 transition-all">
                            <ChevronLeft size={18} />
                        </div>
                        <span className="text-sm font-bold">Back to Members</span>
                    </button>
                )}

                <div className="bg-white p-4 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative overflow-hidden">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-[100px] -mr-8 -mt-8 opacity-50"></div>

                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-violet-200 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
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
                        <p className="text-gray-500 font-medium mb-4">{member.memberId || member.id} • {typeof member.plan === 'object' ? member.plan?.name : member.plan || 'No Active Plan'}</p>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-semibold">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail size={16} className="text-violet-500" />
                                    {member.email}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone size={16} className="text-violet-500" />
                                    {member.phone}
                                </div>
                            </div>

                            <button
                                onClick={() => setIsChatModalOpen(true)}
                                className="px-8 py-3 bg-violet-600 !text-white rounded-2xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-violet-700 active:scale-95 shadow-xl shadow-violet-200 transition-all"
                            >
                                <MessageSquare size={16} />
                                Start Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Attendance', value: `${member.attendance || 0}%`, icon: Activity, color: 'blue' },
                    { label: 'Sessions', value: `${member.sessionsDone || 0}/${member.totalSessions || 0}`, icon: Target, color: 'purple' },
                    { label: 'Next Renewal', value: member.expiry || 'N/A', icon: Calendar, color: 'orange' },
                    { label: 'Avg Effort', value: member.effort || 'High', icon: TrendingUp, color: 'green' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                        <div className={`w-10 h-10 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">{stat.label}</p>
                        <p className="text-xl font-black text-gray-900 mt-1 group-hover:scale-110 transition-transform">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabbed Content Area */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {/* Scrollable Tabs */}
                <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-5 text-sm font-bold whitespace-nowrap transition-all duration-300 relative hover:scale-105 ${activeTab === tab.id ? 'text-violet-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-t-full animate-in slide-in-from-left duration-300"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-4 md:p-8">
                    {/* Overview Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Training Goal</h3>
                                        <div className="bg-violet-50/50 p-6 rounded-3xl border border-violet-100/50 h-full">
                                            <p className="text-lg font-bold text-violet-900">{member.goal || 'General Fitness'}</p>
                                            <p className="text-violet-700/70 text-sm mt-1 leading-relaxed">
                                                {member.goal === 'Weight Loss' ? 'Focusing on caloric deficit and high-intensity interval training.' :
                                                    member.goal === 'Muscle Gain' ? 'Focusing on compound movements with progressive overload.' :
                                                        'Maintaining consistency and building a foundational level of fitness.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Active Diet Plan</h3>
                                        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50 h-full">
                                            {member.dietPlan ? (
                                                <>
                                                    <p className="text-lg font-bold text-emerald-900">{member.dietPlan.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">
                                                            {member.dietPlan.calories} kcal
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">
                                                            {member.dietPlan.target}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center">
                                                    <p className="text-sm font-bold text-emerald-700 opacity-60 italic">No Active Diet Plan</p>
                                                    <button onClick={() => navigate('/diet-plans')} className="text-[10px] font-black text-emerald-600 underline mt-1 uppercase tracking-widest">Assign One</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Sessions</h3>
                                    <div className="space-y-3">
                                        {member.recentWorkouts && member.recentWorkouts.length > 0 ? member.recentWorkouts.map((workout) => (
                                            <div key={workout.id || Math.random()} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                                                        <Dumbbell size={18} />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="font-bold text-gray-800 truncate">{workout.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium truncate">{workout.date} • {workout.duration || '60m'}</p>
                                                    </div>
                                                </div>
                                                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 ml-2" />
                                            </div>
                                        )) : (
                                            <p className="text-sm text-gray-400 mt-2 py-4">No recent sessions found.</p>
                                        )}
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
                                            <span className="text-sm font-bold text-gray-900">{member.location || 'Main Hub'}</span>
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
                                            {payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-8 text-center text-sm font-medium text-gray-500">No payment history found.</td>
                                                </tr>
                                            ) : payments.map((p) => {
                                                const statusColor = p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'success' ? 'bg-green-50 text-green-600 border-green-100' : p.status?.toLowerCase() === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100';

                                                return (
                                                    <tr key={p.id}>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{p.date ? new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{p.amount}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{p.method || 'Cash'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${statusColor}`}>
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden divide-y divide-gray-50">
                                        {payments.length === 0 ? (
                                            <div className="p-8 text-center text-sm font-medium text-gray-500">No payment history found.</div>
                                        ) : payments.map((p) => {
                                            const statusColor = p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'success' ? 'bg-green-50 text-green-600 border-green-100' : p.status?.toLowerCase() === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100';

                                            return (
                                                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                                                            <CreditCard size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">₹{p.amount}</p>
                                                            <p className="text-xs text-gray-500 font-medium">{p.date ? new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border block w-fit ml-auto mb-1 ${statusColor}`}>
                                                            {p.status}
                                                        </span>
                                                        <p className="text-[10px] font-bold text-gray-400 capitalize">{p.method || 'Cash'}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Workouts Tab Content */}
                    {activeTab === 'workouts' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Active Plan Section */}
                                <div className="bg-violet-600 rounded-[32px] p-6 text-white shadow-xl shadow-violet-100 mb-8 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                                        <Dumbbell size={120} />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-violet-200">Current Program</h3>
                                    {member.workoutPlan ? (
                                        <>
                                            <h2 className="text-2xl font-black mb-2">{member.workoutPlan.name}</h2>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                                                    Goal: {member.workoutPlan.goal}
                                                </span>
                                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                                                    Duration: {member.workoutPlan.duration}
                                                </span>
                                                <span className="px-3 py-1 bg-green-400/30 backdrop-blur-md text-green-100 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-400/20">
                                                    {member.workoutPlan.status}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <p className="font-bold text-violet-100/60 italic">No Active Training Program</p>
                                            <button onClick={() => setIsAssignOpen(true)} className="mt-4 px-6 py-2 bg-violet-600 !text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-violet-700 transition-all">Assign Program</button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Workout History</h3>
                                    <button className="text-sm font-bold text-violet-600 hover:text-violet-700">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {member.recentWorkouts && member.recentWorkouts.length > 0 ? member.recentWorkouts.map((workout, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:border-violet-100 hover:shadow-lg transition-all duration-300">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-violet-600 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                                    <Dumbbell size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">{workout.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-gray-500">
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {workout.date}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {workout.duration || '60m'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xl font-black text-gray-900">{workout.calories || '-'}</p>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Calories</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 font-medium">No workout history available yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Weekly Stats</h3>
                                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
                                        {(() => {
                                            const totalCalories = member.recentWorkouts ? member.recentWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0) : 0;
                                            const intensity = totalCalories > 1500 ? 'High' : (totalCalories > 800 ? 'Medium' : 'Light');
                                            const intensityColor = intensity === 'High' ? 'bg-green-500/20 text-green-400' : (intensity === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-violet-500/20 text-violet-400');

                                            return (
                                                <>
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                                                            <Activity size={24} className="text-violet-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400 font-medium">Total Calories</p>
                                                            <p className="text-2xl font-bold">{totalCalories.toLocaleString()} kcal</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                                                            <span className="text-gray-400">Workouts</span>
                                                            <span className="font-bold text-xl">{member.sessionsDone || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                                                            <span className="text-gray-400">Success Rate</span>
                                                            <span className="font-bold text-xl">{member.totalSessions ? Math.round((member.sessionsDone / member.totalSessions) * 100) : 0}%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-400">Intensity</span>
                                                            <span className={`px-2 py-0.5 rounded-lg font-bold uppercase text-xs ${intensityColor}`}>{intensity}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
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
                                        className="px-4 py-2 bg-violet-600 !text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
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
                                            <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-violet-50/50 hover:border-violet-100 transition-all cursor-default">
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
                                                                <span className="text-violet-600 font-bold">Goal: {item.goal}cm</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-1000"
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
                                    const hasLogs = logs.length > 0;
                                    const latest = hasLogs ? logs[logs.length - 1] : {};
                                    const latestWeight = parseFloat(latest.weight || 0);

                                    // Default height to 1.75m if not provided in measurements
                                    const heightCm = parseFloat(latest.measurements?.height || 175);
                                    const heightM = heightCm / 100;

                                    const bmi = latestWeight > 0 ? (latestWeight / (heightM * heightM)).toFixed(1) : 0;

                                    let bmiCategory = 'No Data';
                                    let bmiPercent = 0;
                                    let message = 'Start logging your weight to see your BMI.';
                                    let status = 'Normal';

                                    if (bmi > 0) {
                                        if (bmi < 18.5) {
                                            bmiCategory = 'Underweight';
                                            bmiPercent = (bmi / 18.5) * 33;
                                            message = 'Your BMI suggests you are in the Underweight range. Consider adjusting your nutrition.';
                                            status = 'Underweight';
                                        } else if (bmi >= 18.5 && bmi <= 24.9) {
                                            bmiCategory = 'Healthy Weight';
                                            bmiPercent = 33 + (((bmi - 18.5) / 6.4) * 33);
                                            message = 'Great job! Your BMI suggests you are in a Healthy Weight range. Keep up the consistency.';
                                            status = 'Normal';
                                        } else {
                                            bmiCategory = 'Overweight';
                                            bmiPercent = Math.min(66 + (((bmi - 25) / 10) * 34), 100);
                                            message = 'Your BMI suggests you are in the Overweight range. Let us focus on a caloric deficit.';
                                            status = 'Overweight';
                                        }
                                    }

                                    return (
                                        <div className="bg-violet-600 rounded-[32px] p-6 text-white shadow-xl shadow-violet-200">
                                            <h3 className="font-bold text-xl mb-2">BMI Calculator</h3>
                                            <p className="text-violet-100 text-sm mb-6">Based on latest measurements</p>

                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-violet-200">Current Score</span>
                                                <span className="text-3xl font-black">{bmi > 0 ? bmi : '-'}</span>
                                            </div>
                                            <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden mb-2 relative">
                                                <div className="absolute left-[33%] top-0 bottom-0 w-1 bg-white/50" />
                                                <div className="absolute left-[66%] top-0 bottom-0 w-1 bg-white/50" />
                                                <div className="h-full bg-white/90 rounded-full transition-all duration-1000" style={{ width: `${bmiPercent}%` }} />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-violet-200 uppercase tracking-widest">
                                                <span className={status === 'Underweight' ? 'text-white' : ''}>Underweight</span>
                                                <span className={status === 'Normal' ? 'text-white' : ''}>Normal</span>
                                                <span className={status === 'Overweight' ? 'text-white' : ''}>Overweight</span>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-white/20">
                                                <p className="text-sm font-medium leading-relaxed">
                                                    {bmi > 0 ? (
                                                        <>Your BMI suggests you are in a <span className="font-black text-white">{bmiCategory}</span> range. {message}</>
                                                    ) : (
                                                        message
                                                    )}
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

            {/* Premium Chat Modal */}
            {isChatModalOpen && member && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsChatModalOpen(false)} />

                    <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">{member.name}</h2>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Member Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsChatModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-xl text-gray-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="p-6 h-[400px] overflow-y-auto bg-gray-50/30 flex flex-col gap-4 custom-scrollbar">
                            {chatHistory.length > 0 ? chatHistory.map((msg, idx) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div
                                        key={msg.id || idx}
                                        className={`p-4 rounded-2xl border shadow-sm max-w-[85%] ${isMe
                                            ? 'bg-violet-600 border-violet-500 !text-white rounded-tr-none self-end ml-auto'
                                            : 'bg-white border-gray-100 rounded-tl-none self-start'
                                            }`}
                                    >
                                        <p className={`text-sm ${isMe ? 'text-white' : 'text-gray-700'}`}>{msg.message}</p>
                                        <span className={`text-[10px] font-bold mt-2 block ${isMe ? 'text-violet-100' : 'text-gray-400'}`}>
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 text-sm">No messages yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="w-10 h-10 bg-violet-600 !text-white rounded-xl flex items-center justify-center hover:bg-violet-700 active:scale-90 transition-all shadow-lg shadow-violet-200"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Assign Drawer */}
            <QuickAssignPlanDrawer
                isOpen={isAssignOpen}
                onClose={() => {
                    setIsAssignOpen(false);
                    loadMemberData(); // Refresh after assignment
                }}
                memberName={member?.name}
                memberId={member?.id}
            />

            {/* Read-Only Mode Badge */}
            <div className="mt-8 flex justify-center">
                <div className="px-6 py-2 bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-full flex items-center gap-2 animate-bounce">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Read-Only Trainer Mode</span>
                    <Info size={12} className="text-gray-400" />
                </div>
            </div>
        </div>
    );
};

export default MemberProfileView;
