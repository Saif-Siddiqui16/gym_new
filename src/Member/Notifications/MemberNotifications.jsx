import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, Shield, IndianRupee, Clock, ChevronRight, AlertCircle, 
    Calendar, RefreshCw, CheckCircle2, Sparkles, Send, X, Inbox
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

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

const PremiumCard = ({ children, style = {}, index = 0 }) => (
    <div 
        style={{
            background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`,
            padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`,
            ...style
        }}
    >
        {children}
    </div>
);

const MemberNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissedIds, setDismissedIds] = useState(() => {
        try {
            const saved = localStorage.getItem('dismissed_notifications');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/member/dashboard');
            const { membership, stats, notifications: dbNotifs } = res.data;
            const alerts = [];
            if (membership.daysRemaining <= 10) {
                alerts.push({
                    id: `expiry_${membership.expiryDate}`, title: 'Plan Expiring Soon!',
                    description: `Your ${membership.planName} expires in ${membership.daysRemaining} days.`,
                    type: 'danger', icon: Clock, date: membership.expiryDate, path: '/member/benefits'
                });
            }
            if (stats.pendingDues > 0) {
                alerts.push({
                    id: 'payment_dues', title: 'Pending Dues',
                    description: `You have ₹${stats.pendingDues.toLocaleString()} in unpaid invoices.`,
                    type: 'warning', icon: IndianRupee, date: new Date(), path: '/member/payments'
                });
            }
            if (dbNotifs && dbNotifs.length > 0) {
                dbNotifs.forEach(n => {
                    alerts.push({
                        id: `db_${n.id}`, title: n.title, description: n.message,
                        type: n.type || 'info', icon: n.title.includes('Birthday') ? Calendar : Bell,
                        date: n.createdAt, path: n.link || '#'
                    });
                });
            }
            const filtered = alerts.filter(a => !dismissedIds.includes(a.id));
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            setNotifications(filtered);
        } catch (error) { console.error("Failed to fetch notifications", error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotifications(); }, [dismissedIds]);

    const handleMarkAsRead = (id) => {
        const newDismissed = [...dismissedIds, id]; setDismissedIds(newDismissed);
        localStorage.setItem('dismissed_notifications', JSON.stringify(newDismissed));
        toast.success("Notification dismissed");
    };

    const getTheme = (type) => {
        switch (type) {
            case 'danger': return { color: T.rose, bg: T.roseLight };
            case 'warning': return { color: T.amber, bg: T.amberLight };
            case 'success': return { color: T.green, bg: T.greenLight };
            default: return { color: T.accent, bg: T.accentLight };
        }
    };

    if (loading && notifications.length === 0) return <Loader message="Fetching your alerts..." />;

    return (
        <div className="dashboard-container" style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* ... style tags ... */}

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="animate-fadeIn header-banner">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Bell size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="banner-title" style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>My Notifications</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>Personalized alerts and real-time plan updates</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', position: 'relative', zIndex: 2 }}>
                    <Sparkles size={18} strokeWidth={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Live Sync</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* NOTIFICATIONS LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <SectionHeader icon={Bell} title="Active Alerts" subtitle="Prioritized updates requiring your attention" />
                    
                    {notifications.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {notifications.map((notif, idx) => {
                                const theme = getTheme(notif.type);
                                return (
                                    <PremiumCard key={notif.id} index={idx} className="notification-item" style={{ padding: '24px 32px', background: '#fff', display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
                                        <div style={{ 
                                            width: 52, height: 52, borderRadius: 16, background: theme.bg, color: theme.color, 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <notif.icon size={24} strokeWidth={2.5} />
                                        </div>
                                        <div style={{ flex: 1, width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: '0 0 4px', letterSpacing: '-0.2px' }}>{notif.title}</h3>
                                                <span style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{new Date(notif.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: T.muted, margin: '0 0 16px', lineHeight: 1.5 }}>{notif.description}</p>
                                            <div className="notification-actions" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                                <button 
                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                    style={{ border: 'none', background: 'none', padding: 0, fontSize: 10, fontWeight: 900, color: T.accent, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                                >
                                                    <CheckCircle2 size={12} /> Dismiss Alert
                                                </button>
                                                {notif.path !== '#' && (
                                                     <button 
                                                        onClick={() => navigate(notif.path)}
                                                        style={{ border: 'none', background: 'none', padding: 0, fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                                    >
                                                        Take Action <ChevronRight size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="notification-badge" style={{ width: 8, height: 8, borderRadius: '50%', background: theme.color, position: 'absolute', left: 16, top: 24 }}></div>
                                    </PremiumCard>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '100px 40px', background: T.surface, borderRadius: 32, border: `2px dashed ${T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                             <Inbox size={64} style={{ opacity: 0.1, marginBottom: 20 }} />
                             <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text }}>All Clear!</h3>
                             <p style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>You're all caught up with your latest alerts.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberNotifications;
