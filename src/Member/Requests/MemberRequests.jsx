import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Snowflake, UserPlus, Clock, ChevronRight, AlertCircle, 
    CheckCircle2, Search, History, ArrowUpRight, Sparkles, UserCircle, 
    Utensils, Dumbbell, Lock, Sun, RefreshCw, Layers
} from 'lucide-react';
import { getServiceRequests, addServiceRequest } from '../../api/member/memberApi';
import RightDrawer from '../../components/common/RightDrawer';
import ServiceRequestDrawer from '../components/ServiceRequestDrawer';
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

const MemberRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRequestDrawerOpen, setIsRequestDrawerOpen] = useState(false);
    const [defaultType, setDefaultType] = useState('Freeze Membership');

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await getServiceRequests();
            setRequests(data || []);
        } catch (error) { console.error('Failed to load requests:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadRequests(); }, []);

    const handleOpenDrawer = (type) => {
        setDefaultType(type);
        setIsRequestDrawerOpen(true);
    };

    const handleRequestSubmit = async (requestData) => {
        try {
            toast.loading("Submitting request...", { id: 'service-request' });
            await addServiceRequest({
                type: requestData.type,
                details: requestData.reason,
                rawType: requestData.type,
                status: 'Pending'
            });
            toast.success("Request submitted successfully!", { id: 'service-request' });
            loadRequests();
            setIsRequestDrawerOpen(false);
        } catch (error) {
            toast.error(error.message || "Failed to submit request", { id: 'service-request' });
        }
    };

    const actionCards = [
        { type: 'Freeze Membership', title: 'Freeze Membership', sub: 'Temporary pause your plan', icon: Snowflake, color: T.blue, bg: T.blueLight },
        { type: 'Unfreeze Membership', title: 'Unfreeze Membership', sub: 'Resume your membership', icon: Sun, color: T.amber, bg: T.amberLight },
        { type: 'Request Locker', title: 'Request Locker', sub: 'Get a locker assigned', icon: Lock, color: T.green, bg: T.greenLight },
        { type: 'Request Trainer Change', title: 'Request Trainer', sub: 'Change or assign coach', icon: UserPlus, color: T.accent, bg: T.accentLight },
    ];

    if (loading && requests.length === 0) return <Loader message="Connecting to Roar Support..." />;

    return (
        <div className="dashboard-container" style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeUp 0.6s ease forwards; }
                
                .action-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
                    gap: 32px; 
                }

                .history-item:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transform: translateX(4px);
                    background: #fff !important;
                }

                @media (max-width: 1200px) {
                    .action-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 24px !important; }
                    .header-banner-badge { width: 100% !important; justify-content: center; }
                    .banner-title { font-size: 22px !important; }
                    .action-grid { grid-template-columns: 1fr; gap: 20px; }
                    .dashboard-container { padding: 20px 16px 40px !important; }
                }
            `}</style>

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
                        <ClipboardList size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="banner-title" style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>My Requests</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>Manage membership states and service assistance</p>
                    </div>
                </div>
                <div className="header-banner-badge" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', position: 'relative', zIndex: 2 }}>
                    <History size={18} strokeWidth={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Tracking System</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* QUICK ACTIONS GRID */}
                <div className="action-grid">
                    {actionCards.map((card, idx) => (
                        <PremiumCard key={card.type} index={idx} style={{ display: 'flex', flexDirection: 'column', gap: 24, background: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <card.icon size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: 0 }}>{card.title}</h3>
                                    <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>{card.sub}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleOpenDrawer(card.type)}
                                style={{
                                    height: 52, width: '100%', borderRadius: 16, border: 'none',
                                    background: card.color,
                                    color: '#fff',
                                    fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: `0 8px 20px -4px ${card.color}40`,
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 24px -4px ${card.color}60`; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 20px -4px ${card.color}40`; }}
                            >
                                Request {card.title.split(' ')[0]} <ChevronRight size={16} strokeWidth={3} />
                            </button>
                        </PremiumCard>
                    ))}
                </div>

                {/* REQUEST HISTORY SECTION */}
                <PremiumCard index={4} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <SectionHeader icon={History} title="Request Evolution History" subtitle="Track the lifecycle of your submissions" />
                    
                    {requests.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {requests.map((request, i) => (
                                <div key={request.id} className="history-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderRadius: 20, background: T.bg, border: `1px solid ${T.border}`, transition: '0.2s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ 
                                            width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: request.type?.includes('Freeze') ? T.blue : (request.type?.includes('Locker') ? T.green : T.accent),
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                                        }}>
                                            {request.type?.includes('Freeze') ? <Snowflake size={20} /> : <Layers size={20} />}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: 13, fontWeight: 900, color: T.text, margin: 0 }}>{request.type}</h4>
                                            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginTop: 4 }}>Submitted: {new Date(request.date || request.createdAt).toLocaleDateString('en-GB')}</p>
                                        </div>
                                    </div>
                                    <div className="status-container" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                         <div style={{ 
                                            padding: '6px 14px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                            background: (request.status === 'Approved' || request.status === 'Accepted') ? T.greenLight : (request.status === 'Rejected' ? T.roseLight : T.amberLight),
                                            color: (request.status === 'Approved' || request.status === 'Accepted') ? T.green : (request.status === 'Rejected' ? T.rose : T.amber),
                                            border: `1px solid ${(request.status === 'Approved' || request.status === 'Accepted') ? T.green : (request.status === 'Rejected' ? T.rose : T.amber)}15`
                                        }}>
                                            {request.status || 'In Review'}
                                        </div>
                                        <ChevronRight size={16} color={T.subtle} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px 40px', border: `2px dashed ${T.border}`, borderRadius: 32, background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                             <Clock size={64} style={{ opacity: 0.1, marginBottom: 20 }} />
                             <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Archives are Empty</h3>
                             <p style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>You haven't initiated any requests yet.</p>
                        </div>
                    )}
                </PremiumCard>

            </div>

            <ServiceRequestDrawer
                isOpen={isRequestDrawerOpen}
                onClose={() => setIsRequestDrawerOpen(false)}
                onSubmit={handleRequestSubmit}
                initialType={defaultType}
            />
        </div>
    );
};

export default MemberRequests;
