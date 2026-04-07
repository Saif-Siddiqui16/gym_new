import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, Clock, CreditCard, TrendingUp, ShoppingCart,
    UserPlus, Shield, User, Lock, ChevronRight, Search, IndianRupee,
    Activity, Users, Loader2, Layers, CheckCircle2, X, Send, MessageSquare, 
    Dumbbell, Ticket, Copy, RefreshCw, Bell, Sparkles
} from 'lucide-react';
import apiClient from '../../../api/apiClient';
import { getChatMessages, sendChatMessage } from '../../../api/communication/communicationApi';
import { getAvailableCoupons } from '../../../api/storeApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import RightDrawer from '../../../components/common/RightDrawer';
import { fetchPTAccounts } from '../../../api/member/memberApi';
import Loader from '../../../components/common/Loader';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF', dark: '#0D0A1F'
};

const SectionHeader = ({ icon: Icon, title, subtitle, color = T.accent }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>{subtitle}</p>}
        </div>
    </div>
);

const PremiumCard = ({ children, style = {}, index = 0, hoverable = true }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`,
                padding: 24, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover && hoverable ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hover && hoverable ? '0 12px 30px rgba(124,92,252,0.12)' : '0 4px 16px rgba(0,0,0,0.02)',
                animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`,
                ...style
            }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        >
            {children}
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, color, bg, subtitle, index }) => {
    return (
        <PremiumCard index={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
            </div>
            <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{title}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>{value}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle, textTransform: 'uppercase' }}>{subtitle}</div>
                </div>
            </div>
        </PremiumCard>
    );
};

const QuickAction = ({ icon: Icon, label, onClick, index }) => {
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{
                padding: 16, borderRadius: 20, background: T.surface, border: `1px solid ${T.border}`,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexWrap: 'nowrap',
                alignItems: 'center', gap: 12, textAlign: 'left',
                transform: hover ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hover ? '0 8px 20px rgba(124,92,252,0.1)' : 'none',
                animation: `fadeUp 0.3s ease both ${0.2 + index * 0.05}s`
            }}
        >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        </button>
    );
};

const MemberDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [chatMessage, setChatMessage] = useState('');
    const [coupons, setCoupons] = useState([]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [res, ptRes, couponsRes] = await Promise.all([
                apiClient.get('/member/dashboard'),
                fetchPTAccounts(),
                getAvailableCoupons().catch(() => []) 
            ]);
            setData({ ...res.data, ptAccounts: ptRes });
            setCoupons(couponsRes);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

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
            const messages = await getChatMessages(data.trainer.userId, false);
            setChatHistory(messages);
        } catch (error) { console.error('Failed to load chat history:', error); }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!chatMessage.trim() || !data?.trainer) return;
        const messageText = chatMessage; setChatMessage('');
        try {
            await sendChatMessage({ receiverId: data.trainer.userId, message: messageText, receiverType: 'TRAINER' });
            loadChatHistory();
        } catch (error) { toast.error('Failed to send message'); }
    };

    const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (loading) return <Loader message="Assembling your fitness hub..." />;

    if (!data) return null;

    const { 
        memberInfo = { name: 'Member', memberId: '...', status: '...', branchName: '...' }, 
        membership = { planName: 'None', daysRemaining: 0, benefits: '' }, 
        stats = { ptSessionsRemaining: 0, visitsThisMonth: 0, pendingDues: 0, activeInvoices: 0 }, 
        recentAttendance = [], upcomingClass = null, trainer = null, locker = null, announcements = [], ptAccounts = [] 
    } = data;

    return (
        <div className="dashboard-container" style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeUp 0.4s ease both; }

                .metric-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                }

                .dues-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }

                .main-content-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 24px;
                }

                .secondary-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                @media (max-width: 1200px) {
                    .metric-grid { grid-template-columns: repeat(2, 1fr); }
                    .main-content-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .header-banner {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 20px;
                        padding: 24px !important;
                    }
                    .header-banner-date {
                        width: 100%;
                        justify-content: center;
                    }
                    .dues-grid { grid-template-columns: 1fr; }
                    .actions-grid { grid-template-columns: repeat(2, 1fr); }
                    .notification-item { flex-direction: column; align-items: flex-start !important; gap: 16px; }
                    .notification-item button { width: 100%; }
                }

                @media (max-width: 600px) {
                    .secondary-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 480px) {
                    .dashboard-container { padding: 16px 16px 40px !important; }
                    .actions-grid { grid-template-columns: 1fr; }
                    .header-banner h1 { fontSize: 22px !important; }
                }
            `}</style>

            {/* HEADER BANNER */}
            <div className="header-banner animate-fadeIn" style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 20,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)',
                        flexShrink: 0
                    }}>
                        <User size={32} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px' }}>
                            Welcome back, <span style={{ color: '#FFE16A' }}>{memberInfo.name || 'Member'}!</span>
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', background: 'rgba(0,0,0,0.15)', padding: '2px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID: {memberInfo.memberId}</span>
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} className="hide-mobile" />
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>{memberInfo.branchName} • Roar Fitness</p>
                        </div>
                    </div>
                </div>
                <div className="header-banner-date" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', position: 'relative', zIndex: 2 }}>
                    <Calendar size={18} strokeWidth={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* NOTIFICATIONS */}
                {(membership.daysRemaining <= 10 || stats.pendingDues > 0) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fadeIn">
                        {membership.daysRemaining <= 10 && (
                            <div className="notification-item" style={{ background: T.roseLight, border: `1px solid ${T.rose}20`, padding: '16px 24px', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: T.rose, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Clock size={20} /></div>
                                    <div>
                                        <h4 style={{ fontSize: 13, fontWeight: 900, color: T.rose, margin: 0, textTransform: 'uppercase' }}>Plan Expiring Soon</h4>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: T.rose, margin: 0, opacity: 0.8 }}>Reneval needed in {membership.daysRemaining} days to avoid interruption.</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/member/payments')} style={{ padding: '8px 20px', background: T.rose, color: '#fff', borderRadius: 12, fontSize: 11, fontWeight: 900, border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>Renew Now</button>
                            </div>
                        )}
                        {stats.pendingDues > 0 && (
                            <div className="notification-item" style={{ background: T.amberLight, border: `1px solid ${T.amber}20`, padding: '16px 24px', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: T.amber, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CreditCard size={20} /></div>
                                    <div>
                                        <h4 style={{ fontSize: 13, fontWeight: 900, color: T.amber, margin: 0, textTransform: 'uppercase' }}>Outstanding Balance</h4>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: T.amber, margin: 0, opacity: 0.8 }}>You have pending dues of ₹{stats.pendingDues.toLocaleString()}.</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/member/payments')} style={{ padding: '8px 20px', background: T.amber, color: '#fff', borderRadius: 12, fontSize: 11, fontWeight: 900, border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>Pay Dues</button>
                            </div>
                        )}
                    </div>
                )}

                {/* KPI STATS */}
                <div className="metric-grid">
                    <MetricCard title="Membership" value={membership.planName} subtitle="Active Plan" icon={Shield} color={T.accent} bg={T.accentLight} index={0} />
                    <MetricCard title="PT Sessions" value={stats.ptSessionsRemaining} subtitle="Remaining" icon={TrendingUp} color={T.green} bg={T.greenLight} index={1} />
                    <MetricCard title="Visits" value={stats.visitsThisMonth} subtitle="This Month" icon={Activity} color={T.amber} bg={T.amberLight} index={2} />
                    <MetricCard title="Total Paid" value={`₹${stats.totalPaid || 0}`} subtitle="Lifetime" icon={CheckCircle2} color={T.blue} bg={T.blueLight} index={3} />
                </div>

                {/* BALANCE & INVOICES */}
                <div className="dues-grid">
                    <PremiumCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} index={4}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: T.roseLight, color: T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IndianRupee size={20} /></div>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Pending Balance</p>
                                <h3 style={{ fontSize: 24, fontWeight: 900, color: T.text, margin: 0 }}>₹{(stats.pendingDues || 0).toLocaleString()}</h3>
                            </div>
                        </div>
                        {stats.pendingDues > 0 && <span style={{ fontSize: 10, fontWeight: 900, color: T.rose, background: T.roseLight, padding: '4px 12px', borderRadius: 8, textTransform: 'uppercase' }} className="hide-mobile">Overdue</span>}
                    </PremiumCard>
                    <PremiumCard style={{ background: T.dark, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} index={5} hoverable={true}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CreditCard size={20} /></div>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Active Invoices</p>
                                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>{stats.activeInvoices} Pending</h3>
                            </div>
                        </div>
                        <button onClick={() => navigate('/member/payments')} style={{ height: 44, padding: '0 24px', background: T.accent, color: '#fff', borderRadius: 14, fontSize: 11, fontWeight: 900, border: 'none', cursor: 'pointer', textTransform: 'uppercase', boxShadow: '0 8px 20px rgba(124,92,252,0.3)' }} className="hide-mobile">Pay Now</button>
                    </PremiumCard>
                </div>

                {/* QUICK ACTIONS GRID */}
                <div className="actions-grid animate-fadeIn">
                    <QuickAction icon={Calendar} label="Book & Schedule" onClick={() => navigate('/member/bookings')} index={0} />
                    <QuickAction icon={Layers} label="Amenity Booking" onClick={() => navigate('/member/amenity-booking')} index={1} />
                    <QuickAction icon={TrendingUp} label="View Progress" onClick={() => navigate('/progress')} index={2} />
                    <QuickAction icon={ShoppingCart} label="Shop Products" onClick={() => navigate('/member/store')} index={3} />
                </div>

                <div className="main-content-grid">
                    
                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* MEMBERSHIP DETAILS */}
                        <PremiumCard index={6}>
                            <SectionHeader icon={Shield} title="Membership Details" subtitle="Active Plan Info" />
                            <div className="secondary-grid">
                                {[
                                    { label: 'Plan', value: membership.planName },
                                    { label: 'Status', value: memberInfo.status, color: memberInfo.status === 'Active' ? T.green : T.rose },
                                    { label: 'Start Date', value: membership.startDate ? new Date(membership.startDate).toLocaleDateString('en-GB') : 'N/A' },
                                    { label: 'End Date', value: membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('en-GB') : 'N/A' },
                                ].map((item, idx) => (
                                    <div key={idx} style={{ padding: '16px 20px', borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                        <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0, marginBottom: 4 }}>{item.label}</p>
                                        <p style={{ fontSize: 13, fontWeight: 900, color: item.color || T.text, margin: 0 }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 20, padding: '20px', borderRadius: 20, background: T.accentLight, border: `1px solid ${T.accentMid}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 900, color: T.accent, textTransform: 'uppercase' }}>Days Remaining</span>
                                <span style={{ fontSize: 16, fontWeight: 900, color: T.accent }}>{membership.daysRemaining} Days</span>
                            </div>
                        </PremiumCard>

                        {/* RECENT ATTENDANCE */}
                        <PremiumCard index={7}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <SectionHeader icon={Calendar} title="Recent Attendance" subtitle="Your gym activity" />
                                <button onClick={() => navigate('/member/attendance')} style={{ padding: '6px 12px', background: T.bg, color: T.accent, borderRadius: 10, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>View All <ChevronRight size={12} /></button>
                            </div>
                            <div className="secondary-grid">
                                {recentAttendance.length > 0 ? recentAttendance.slice(0, 4).map((att, idx) => (
                                    <div key={idx} style={{ padding: '12px 16px', borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Calendar size={14} /></div>
                                        <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{new Date(att.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — {att.time}</span>
                                    </div>
                                )) : (
                                    <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: 24, fontSize: 12, color: T.subtle, fontWeight: 700 }}>No recent records found.</p>
                                )}
                            </div>
                        </PremiumCard>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* MY ENTITLEMENTS */}
                        <PremiumCard index={8} style={{ display: 'flex', flexDirection: 'column' }}>
                            <SectionHeader icon={Layers} title="My Entitlements" subtitle="Perks & Benefits" color="#C084FC" />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {membership.benefits ? (
                                    (() => {
                                        let benefitList = [];
                                        try { benefitList = JSON.parse(membership.benefits); if(!Array.isArray(benefitList)) benefitList = [benefitList]; }
                                        catch (e) { benefitList = membership.benefits.split(',').filter(b => b.trim()); }
                                        return benefitList.slice(0, 4).map((b, i) => (
                                            <div key={i} style={{ padding: '12px 16px', borderRadius: 14, background: '#F9F8FF', border: '1px solid #F0ECFF', display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C084FC', flexShrink: 0 }} />
                                                <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{typeof b === 'object' ? (b.name || b.benefit) : b}</span>
                                            </div>
                                        ));
                                    })()
                                ) : <div style={{ textAlign: 'center', padding: 20, color: T.subtle, fontSize: 11, fontWeight: 700 }}>No extras configured.</div>}
                            </div>
                            <button onClick={() => navigate('/member/benefits')} style={{ marginTop: 24, width: '100%', height: 48, borderRadius: 14, background: '#F9F8FF', color: '#C084FC', border: '1px solid #F0ECFF', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>View All Benefits <ChevronRight size={14} /></button>
                        </PremiumCard>

                        {/* UPCOMING CLASSES */}
                        <PremiumCard index={9} style={{ background: T.bg, border: 'none' }}>
                            <SectionHeader icon={Activity} title="Upcoming Classes" subtitle="Next Session" color={T.green} />
                            {upcomingClass ? (
                                <div style={{ background: '#fff', padding: 20, borderRadius: 20, border: `1px solid ${T.border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span style={{ fontSize: 10, fontWeight: 900, color: T.green, background: T.greenLight, padding: '4px 10px', borderRadius: 6 }}>{upcomingClass.status}</span>
                                        <Clock size={16} color={T.subtle} />
                                    </div>
                                    <h4 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>{upcomingClass.className}</h4>
                                    <p style={{ fontSize: 11, fontWeight: 800, color: T.muted, margin: '4px 0 0' }}>{new Date(upcomingClass.date).toLocaleDateString('en-GB')} • {new Date(upcomingClass.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 24 }}>
                                    <p style={{ fontSize: 12, fontWeight: 800, color: T.subtle, margin: '0 0 12px' }}>No upcoming sessions.</p>
                                    <button onClick={() => navigate('/member/bookings')} style={{ color: T.accent, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', background: 'none', border: 'none', borderBottom: `2px solid ${T.accentLight}`, cursor: 'pointer' }}>Book Now</button>
                                </div>
                            )}
                        </PremiumCard>

                        {/* MY TRAINER */}
                        <PremiumCard index={10}>
                            <SectionHeader icon={Users} title="My Trainer" subtitle="Assigned PT" color={T.amber} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, flexShrink: 0 }}><User size={28} /></div>
                                <div>
                                    <h4 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>{trainer?.name || 'Trainer'}</h4>
                                    <p style={{ fontSize: 11, fontWeight: 800, color: T.amber, textTransform: 'uppercase', margin: 0 }}>{trainer?.specialization || 'PT Specialist'}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsChatModalOpen(true)} style={{ width: '100%', height: 48, borderRadius: 14, background: T.amber, color: '#fff', border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 20px rgba(245,158,11,0.2)' }}>Message Trainer</button>
                        </PremiumCard>
                    </div>
                </div>
                
                {/* ANNOUNCEMENTS BAR */}
                <div style={{ marginTop: 8 }} className="animate-fadeIn">
                    <SectionHeader icon={Bell} title="Announcements" subtitle="Latest News" />
                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12 }}>
                        {announcements.length > 0 ? announcements.map((item, idx) => (
                             <div key={idx} style={{ minWidth: 320, background: T.surface, border: `1px solid ${T.border}`, padding: 20, borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: '0 0 4px' }}>{item.title}</h4>
                                <p style={{ fontSize: 12, color: T.muted, fontWeight: 600, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content}</p>
                                <span style={{ fontSize: 10, fontWeight: 900, color: T.accent, textTransform: 'uppercase' }}>{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                             </div>
                        )) : <div style={{ width: '100%', padding: 32, textAlign: 'center', background: T.surface, borderRadius: 20, border: `1px dashed ${T.border}`, color: T.subtle, fontSize: 13, fontWeight: 700 }}>No active announcements.</div>}
                    </div>
                </div>

            </div>

            {/* CHAT DRAWER */}
            <RightDrawer isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} title="Trainer Chat" subtitle={trainer?.name}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '70vh' }}>
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', padding: 4 }}>
                        {chatHistory.length > 0 ? chatHistory.map((msg, i) => (
                            <div key={i} style={{ 
                                alignSelf: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                                maxWidth: '85%', padding: '12px 18px', borderRadius: 16,
                                background: msg.senderId === user?.id ? T.accent : '#fff',
                                color: msg.senderId === user?.id ? '#fff' : T.text,
                                border: msg.senderId === user?.id ? 'none' : `1px solid ${T.border}`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)', position: 'relative'
                            }}>
                                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{msg.message}</p>
                                <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', marginTop: 4, display: 'block', opacity: 0.6 }}>{formatTime(msg.createdAt)}</span>
                            </div>
                        )) : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 100, color: T.subtle }}><MessageSquare size={48} style={{ opacity: 0.2 }} /><p style={{ fontSize: 13, fontWeight: 700, marginTop: 12, margin: '12px 0 0' }}>No messages yet.</p></div>}
                     </div>
                     <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 12, padding: 4 }}>
                        <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Type your message..." style={{ flex: 1, height: 50, borderRadius: 14, border: `2px solid ${T.bg}`, background: '#fff', padding: '0 20px', fontSize: 13, fontWeight: 700, outline: 'none' }} />
                        <button type="submit" style={{ width: 50, height: 50, borderRadius: 14, background: T.accent, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={20} /></button>
                     </form>
                </div>
            </RightDrawer>
        </div>
    );
};

export default MemberDashboard;
