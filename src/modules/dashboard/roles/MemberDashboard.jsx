import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Clock,
    CreditCard,
    TrendingUp,
    ShoppingCart,
    UserPlus,
    Shield,
    User,
    Lock,
    ChevronRight,
    Search,
    IndianRupee,
    Activity,
    Users,
    Loader2
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import apiClient from '../../../api/apiClient';
import { getChatMessages, sendChatMessage } from '../../../api/communication/communicationApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { X, Send, MessageSquare } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import StatsCard from '../../dashboard/components/StatsCard';

const MemberDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [chatMessage, setChatMessage] = useState('');

    const fetchDashboardData = async () => {
        try {
            const res = await apiClient.get('/member/dashboard');
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Chat History Polling
    useEffect(() => {
        let pollInterval;
        if (isChatModalOpen && data?.trainer) {
            loadChatHistory();
            pollInterval = setInterval(loadChatHistory, 3000);
        }
        return () => clearInterval(pollInterval);
    }, [isChatModalOpen, data?.trainer]);

    const loadChatHistory = async () => {
        if (!data?.trainer) return;
        try {
            // Note: For members, the contactId is the trainer's user ID
            // We need the trainer's userId, not staffId. 
            // The /member/dashboard API should provide the trainer's userId.
            const messages = await getChatMessages(data.trainer.userId, false);
            setChatHistory(messages);
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!chatMessage.trim() || !data?.trainer) return;

        const messageText = chatMessage;
        setChatMessage('');

        try {
            await sendChatMessage({
                receiverId: data.trainer.userId,
                message: messageText,
                receiverType: 'TRAINER' // Or STAFF if they are staff
            });
            loadChatHistory();
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };



    const QuickAction = ({ icon: Icon, label, onClick, color = 'bg-slate-50' }) => (
        <button
            onClick={onClick}
            className={`w-full p-4 rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group ${color} text-left`}
        >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Icon size={18} />
            </div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none block">{label}</span>
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center ">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    const { memberInfo, membership, stats, recentAttendance, upcomingClass, trainer, locker, announcements } = data;

    return (
        <div className="saas-page pb-page space-y-8 animate-fadeIn scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b-2 border-slate-100">
                <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-violet-100">
                        <User size={24} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-1 truncate">
                            Welcome, <span className="text-primary">{memberInfo.name || 'Member'}!</span>
                        </h1>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary-light text-primary rounded-lg sm:rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-violet-100 whitespace-nowrap">Member ID: {memberInfo.memberId}</span>
                            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <p className="text-slate-500 font-bold text-[9px] sm:text-xs uppercase tracking-widest">
                                {memberInfo.branchName}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 bg-white rounded-xl sm:rounded-2xl border-2 border-slate-100 shadow-sm self-start sm:self-auto">
                    <Calendar size={16} className="text-primary shrink-0" />
                    <span className="text-[9px] sm:text-xs font-black text-slate-700 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Notification/Alert Area */}
            {(membership.daysRemaining <= 10 || stats.pendingDues > 0) && (
                <div className="space-y-4">
                    {membership.daysRemaining <= 10 && (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">Plan Expiring Soon!</h4>
                                    <p className="text-xs font-bold text-rose-600">Your {membership.planName} expires in <span className="underline">{membership.daysRemaining} days</span>. Please renew to avoid interruption.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/member/payments')}
                                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-100"
                            >
                                Renew Now
                            </button>
                        </div>
                    )}
                    {stats.pendingDues > 0 && (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Pending Payment Dues</h4>
                                    <p className="text-xs font-bold text-amber-600">You have outstanding invoices totaling ₹{stats.pendingDues.toLocaleString()}.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/member/payments')}
                                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-lg shadow-amber-100"
                            >
                                View Invoices
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Active Membership"
                    value={membership.planName}
                    subtitle={`${membership.daysRemaining} days remaining`}
                    icon={Shield}
                    color="primary"
                />
                <StatsCard
                    title="PT Sessions"
                    value={stats.ptSessionsRemaining.toString()}
                    subtitle="Remaining Sessions"
                    icon={Clock}
                    color="success"
                />
                <StatsCard
                    title="This Month Visits"
                    value={stats.visitsThisMonth.toString()}
                    subtitle="Visit Frequency"
                    icon={Activity}
                    color="warning"
                />
                <StatsCard
                    title="Pending Dues"
                    value={`₹${stats.pendingDues.toLocaleString()}`}
                    subtitle={`${stats.activeInvoices} Active Invoice${stats.activeInvoices !== 1 ? 's' : ''}`}
                    icon={IndianRupee}
                    color="danger"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Quick Actions & Details */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <QuickAction icon={Calendar} label="Book & Schedule" onClick={() => navigate('/member/bookings')} />
                        <QuickAction icon={TrendingUp} label="View Progress" onClick={() => navigate('/progress')} />
                        <QuickAction icon={ShoppingCart} label="Shop Products" onClick={() => navigate('/member/store')} />
                        <QuickAction icon={UserPlus} label="Refer & Earn" onClick={() => navigate('/referrals')} />
                    </div>

                    {/* Membership Details & Entitlements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Membership Details */}
                        <Card className="p-6 border border-slate-100 rounded-2xl bg-white shadow-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Membership Details</h3>
                                <Shield size={16} className="text-violet-200" />
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Plan', value: membership.planName },
                                    { label: 'Status', value: memberInfo.status, color: memberInfo.status === 'Active' ? 'text-emerald-600' : 'text-rose-600' },
                                    { label: 'Start Date', value: membership.startDate ? new Date(membership.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' },
                                    { label: 'End Date', value: membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                        <span className={`text-[11px] font-black uppercase ${item.color || 'text-slate-900'}`}>{item.value}</span>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-slate-50">
                                    <div className="flex justify-between items-center bg-primary-light/50 p-4 rounded-xl border border-primary-light">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Days Remaining</span>
                                        <span className="text-xs font-black text-primary-hover uppercase">{membership.daysRemaining} days</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Entitlements */}
                        <Card className="p-6 border border-slate-100 rounded-2xl bg-white shadow-xl flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                                <h3 className="text-xs font-black uppercase tracking-widest text-fuchsia-600">My Entitlements</h3>
                                <LayoutDashboard size={16} className="text-fuchsia-200" />
                            </div>
                            <div className="flex-1 flex flex-col py-2">
                                {membership.benefits ? (
                                    <div className="w-full space-y-3">
                                        {(() => {
                                            let benefitList = [];
                                            try {
                                                // Handle JSON list [{NAME, LIMIT}, ...]
                                                const parsed = JSON.parse(membership.benefits);
                                                if (Array.isArray(parsed)) {
                                                    benefitList = parsed.map(b => typeof b === 'object' ? `${b.NAME || b.name}${b.LIMIT ? ` (${b.LIMIT})` : ''}` : b);
                                                } else {
                                                    benefitList = membership.benefits.split(/[,\n]/);
                                                }
                                            } catch (e) {
                                                // Fallback to split
                                                benefitList = membership.benefits.split(/[,\n]/);
                                            }

                                            return benefitList.slice(0, 4).map((benefit, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-fuchsia-50/50 border border-fuchsia-50 group hover:border-fuchsia-200 transition-all duration-300">
                                                    <div className="w-2 h-2 rounded-full bg-fuchsia-400 group-hover:scale-125 transition-transform" />
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight truncate">{benefit.trim()}</span>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 mb-3">
                                            <Search size={24} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No benefits configured</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/member/benefits')}
                                className="w-full h-11 mt-4 bg-primary-light text-primary border border-violet-100 hover:bg-primary hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                            >
                                VIEW DETAILS <ChevronRight size={14} strokeWidth={3} />
                            </button>
                        </Card>
                    </div>

                    {/* Attendance History */}
                    <Card className="p-6 border border-slate-100 rounded-2xl bg-white shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-5 h-[2px] bg-primary"></div> Recent Attendance
                            </h2>
                            <button
                                onClick={() => navigate('/member/attendance')}
                                className="text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                            >
                                VIEW ALL <ChevronRight size={14} strokeWidth={3} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {recentAttendance.length > 0 ? recentAttendance.map((att, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-violet-100 transition-all flex items-center gap-3 group">
                                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                        <Calendar size={16} />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-700 uppercase">
                                        {new Date(att.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — {att.time}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic py-4">No recent attendance found</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Upcoming & Context */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Latest Announcements */}
                    <Card className="p-6 border border-slate-100 rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Announcements</h3>
                            <button
                                onClick={() => navigate('/member/announcements')}
                                className="text-[10px] font-black text-primary"
                            >
                                ALL
                            </button>
                        </div>
                        <div className="space-y-4">
                            {announcements && announcements.length > 0 ? announcements.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase mb-1">{item.title}</h4>
                                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{item.content}</p>
                                    <span className="text-[9px] font-black text-primary uppercase mt-2 block tracking-widest">
                                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-4 italic">No announcements</p>
                            )}
                        </div>
                    </Card>

                    {/* Upcoming Classes */}
                    <Card className="p-6 border border-slate-100 rounded-2xl bg-white shadow-xl h-full">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600">Upcoming Classes</h3>
                            <button
                                onClick={() => navigate('/member/bookings')}
                                className="text-[10px] font-black text-emerald-600"
                            >
                                VIEW MORE
                            </button>
                        </div>
                        {upcomingClass ? (
                            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-50 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 bg-white text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">{upcomingClass.status}</span>
                                    <Clock size={16} className="text-emerald-200" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase mb-0.5">{upcomingClass.className}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {new Date(upcomingClass.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(upcomingClass.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No upcoming classes</p>
                                <button
                                    onClick={() => navigate('/member/bookings')}
                                    className="mt-4 text-[10px] font-black text-primary border-b border-violet-200"
                                >
                                    BOOK NOW
                                </button>
                            </div>
                        )}
                    </Card>

                    {/* My Trainer */}
                    <Card className="p-6 border border-slate-100 rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                            <h3 className="text-xs font-black uppercase tracking-widest text-amber-600">My Trainer</h3>
                            <Users size={16} className="text-amber-200" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                <User size={28} />
                            </div>
                            <div>
                                <h4 className="text-md font-black text-slate-900 uppercase leading-tight mb-0.5">{trainer?.name || 'Trainer'}</h4>
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{trainer?.specialization || 'PT Package Trainer'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsChatModalOpen(true)}
                            className="w-full h-11 mt-6 border-2 border-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-amber-100 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        >
                            MESSAGE
                        </button>
                    </Card>

                    {/* My Locker */}
                    <Card className="p-6 border border-slate-100 rounded-2xl bg-white shadow-xl relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl opacity-60"></div>
                        <div className="relative z-10 flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">My Locker</h3>
                                <Lock size={16} className="text-slate-100" />
                            </div>
                            <p className="text-sm font-black text-slate-900 uppercase">{locker ? `Locker #${locker.number}` : 'No locker assigned'}</p>
                            {!locker && (
                                <button
                                    onClick={() => navigate('/member/requests')}
                                    className="w-full h-11 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all"
                                >
                                    Request Locker
                                </button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
            {/* Premium Chat Modal */}
            <RightDrawer
                isOpen={isChatModalOpen && !!data?.trainer}
                onClose={() => setIsChatModalOpen(false)}
                title={data?.trainer?.name || 'Trainer Chat'}
                subtitle="Chat with your assigned trainer"
                maxWidth="max-w-md"
                footer={
                    <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:border-primary outline-none transition-all font-bold"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-12 h-12 bg-primary !text-white rounded-xl flex items-center justify-center hover:bg-primary-hover active:scale-90 transition-all shadow-lg shadow-violet-100"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                }
            >
                <div className="flex flex-col gap-4 min-h-[400px]">
                    <div className="flex items-center gap-2 mb-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Trainer is Online</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {chatHistory.length > 0 ? chatHistory.map((msg, idx) => {
                            const isMe = msg.senderId === user?.id;
                            return (
                                <div
                                    key={msg.id || idx}
                                    className={`p-4 rounded-2xl border shadow-sm max-w-[90%] ${isMe
                                        ? 'bg-primary border-primary !text-white rounded-tr-none self-end ml-auto'
                                        : 'bg-white border-slate-100 rounded-tl-none self-start'
                                        }`}
                                >
                                    <p className={`text-sm leading-relaxed ${isMe ? 'text-white' : 'text-slate-700 font-bold'}`}>{msg.message}</p>
                                    <span className={`text-[10px] font-black mt-2 block ${isMe ? 'text-violet-100' : 'text-slate-400'} uppercase tracking-tighter`}>
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <MessageSquare size={32} />
                                </div>
                                <p className="text-slate-400 text-sm font-bold tracking-tight">No messages yet. Say hi to your trainer!</p>
                            </div>
                        )}
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

export default MemberDashboard;
