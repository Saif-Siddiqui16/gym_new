import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    UserPlus,
    Calendar,
    CheckCircle,
    Clock,
    TrendingUp,
    Search,
    IndianRupee,
    ArrowUpRight,
    MessageCircle,
    Activity,
    LogOut,
    Plus,
    ShoppingCart,
    FileText,
    Receipt,
    GitBranch,
    LayoutDashboard,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useBranchContext } from '../../../context/BranchContext';
import apiClient from '../../../api/apiClient';
import TodayFollowUpsWidget from '../../crm/components/TodayFollowUpsWidget';
import Loader from '../../../components/common/Loader';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        
  accent2: '#9B7BFF',       
  accentLight: '#F0ECFF',   
  accentMid: '#E4DCFF',     
  border: '#EAE7FF',        
  bg: '#F6F5FF',            
  surface: '#FFFFFF',       
  text: '#1A1533',          
  muted: '#7B7A8E',         
  subtle: '#B0ADCC',        
  green: '#22C97A',         
  greenLight: '#E8FBF2',
  amber: '#F59E0B',         
  amberLight: '#FEF3C7',
  rose: '#F43F5E',          
  roseLight: '#FFF1F4',
  blue: '#3B82F6',          
  blueLight: '#EFF6FF'
};

const SectionDivider = ({ title, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, marginTop: 10 }}>
        <div style={{ width: 4, height: 24, borderRadius: 4, background: `linear-gradient(to bottom, ${T.accent}, ${T.accent2})` }} />
        <div>
            <h2 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.3px' }}>{title}</h2>
            {sub && <p style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '2px 0 0' }}>{sub}</p>}
        </div>
    </div>
);

const MetricCard = ({ title, value, icon: Icon, color, bg, trend, index }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: T.surface, padding: 24, borderRadius: 24, border: `1px solid ${T.border}`,
                display: 'flex', flexDirection: 'column', gap: 16, cursor: 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hover ? '0 12px 30px rgba(124,92,252,0.12)' : '0 2px 14px rgba(0,0,0,0.02)',
                animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`
            }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                {trend && (
                    <div style={{ fontSize: 9, fontWeight: 900, color: color, background: bg, padding: '4px 8px', borderRadius: 20, textTransform: 'uppercase', border: `1px solid ${color}20` }}>
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: '-1px' }}>{value}</div>
            </div>
        </div>
    );
};

const StaffDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { selectedBranch } = useBranchContext();

    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
    });

    const fetchAll = async () => {
        try {
            setLoading(true);
            const queryParams = selectedBranch !== 'all' ? { tenantId: selectedBranch } : {};
            const response = await apiClient.get('/dashboard/staff', { params: queryParams });
            const data = response.data;

            let branchName = 'Main Gym';
            if (selectedBranch !== 'all') {
                try {
                    const branchesRes = await apiClient.get('/branches');
                    const myBranch = branchesRes.data?.find(b => b.id === parseInt(selectedBranch));
                    if (myBranch) branchName = myBranch.name || myBranch.branchName;
                } catch { /* Silent */ }
            }

            setDashData({
                branchName,
                todayCheckIns: data.checkinsToday || 0,
                checkIns: data.checkins || [],
                invoicesCount: data.pendingPayments || 0,
                activeLeads: data.newEnquiries || 0,
                pendingActions: data.pendingActions || [],
                expiring: data.renewalAlerts?.expiringSoon || [],
                tasks: data.equipmentAlerts || [],
            });
        } catch (err) {
            console.error('StaffDashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [selectedBranch]);

    const quickActions = [
        { icon: UserPlus, label: 'Add Member', path: '/staff/members/add', color: T.green, bg: T.greenLight },
        { icon: CheckCircle, label: 'Check-in', path: '/staff/attendance/check-in', color: T.blue, bg: T.blueLight },
        { icon: IndianRupee, label: 'Payments', path: '/finance/pos', color: T.amber, bg: T.amberLight },
        { icon: FileText, label: 'Documents', path: '/finance/invoices', color: T.rose, bg: T.roseLight },
    ];

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading && !dashData) return <Loader message="Staff terminal initializing..." />;

    return (
        <div className="dashboard-container" style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both; }

                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 40px;
                }

                .main-content-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }

                @media (max-width: 1200px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .main-content-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .header-banner {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 20px;
                        padding: 24px !important;
                    }
                    .actions-grid { grid-template-columns: repeat(2, 1fr); }
                    .header-portal-tag { width: 100%; text-align: center; }
                }

                @media (max-width: 480px) {
                    .dashboard-container { padding: 16px 16px 40px !important; }
                    .actions-grid { grid-template-columns: 1fr; }
                    .stats-grid { grid-template-columns: 1fr; }
                    .section-header { flex-direction: column; align-items: flex-start !important; gap: 12px; }
                    .section-header button { width: 100%; }
                }
            `}</style>

            {/* ──────── HEADER BANNER ──────── */}
            <div className="header-banner fu" style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <LayoutDashboard size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>Hello, {user?.name?.split(' ')[0] || 'Staff'}!</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: '4px 0 0', fontWeight: 600 }}>{dashData?.branchName} • {today}</p>
                    </div>
                </div>
                <div className="header-portal-tag" style={{
                    padding: '10px 20px', background: 'rgba(255,255,255,0.15)', borderRadius: 14,
                    color: '#fff', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                    backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', position: 'relative', zIndex: 2
                }}>
                    Staff Portal
                </div>
            </div>

            {/* ──────── QUICK ACTIONS ──────── */}
            <div className="fu" style={{ marginBottom: 32, animationDelay: '0.1s' }}>
                <SectionDivider title="Quick Access" sub="Operational Short-cuts" />
                <div className="actions-grid">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(action.path)}
                            style={{
                                background: T.surface, padding: 24, borderRadius: 28, border: `1px solid ${T.border}`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                                cursor: 'pointer', transition: '0.3s', boxShadow: '0 2px 14px rgba(0,0,0,0.02)'
                            }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(124,92,252,0.12)'; e.currentTarget.style.borderColor = T.accentMid; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = T.border; }}
                        >
                            <div style={{ width: 52, height: 52, borderRadius: 16, background: action.bg, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s', flexShrink: 0 }}>
                                <action.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ──────── STATS GRID ──────── */}
            <div className="stats-grid">
                <MetricCard title="Today's Check-ins" value={dashData?.todayCheckIns ?? 0} trend={`${dashData?.checkIns?.length ?? 0} active`} icon={CheckCircle} color={T.accent} bg={T.accentLight} index={1} />
                <MetricCard title="Pending Invoices" value={dashData?.invoicesCount ?? 0} icon={Receipt} color={T.rose} bg={T.roseLight} index={2} />
                <MetricCard title="Active Leads" value={dashData?.activeLeads ?? 0} icon={GitBranch} color={T.green} bg={T.greenLight} index={3} />
                <MetricCard title="Expiring Soon" value={dashData?.expiring?.length ?? 0} trend="30 Days" icon={Clock} color={T.amber} bg={T.amberLight} index={4} />
            </div>

            {/* ──────── MAIN CONTENT ──────── */}
            <div className="main-content-grid fu">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <TodayFollowUpsWidget />
                    
                    {/* Recent Check-ins */}
                    <div style={{ background: T.surface, padding: 32, borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <SectionDivider title="Recent Check-ins" sub="Last 4 Member Visits" />
                            <button onClick={() => navigate('/staff/attendance/today')} style={{ padding: '8px 16px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 10, fontWeight: 900, color: T.muted, cursor: 'pointer', textTransform: 'uppercase' }}>View All</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {dashData?.checkIns?.slice(0, 4).map((c, i) => (
                                <div key={i} style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.01)', border: `1px solid ${T.border}`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: T.greenLight, color: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>
                                            {getInitials(c.member?.name || c.user?.name || c.name || 'Member')}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase' }}>{c.member?.name || c.user?.name || c.name || 'Member'}</div>
                                            <div style={{ fontSize: 9, fontWeight: 800, color: T.subtle, letterSpacing: '0.1em' }}>{c.member?.memberId || c.memberId || '—'}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{new Date(c.checkIn || c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                        <div style={{ fontSize: 9, fontWeight: 900, color: T.green, textTransform: 'uppercase' }}>Active</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {/* Expiring Soon */}
                    <div style={{ background: T.surface, padding: 32, borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <SectionDivider title="Expiring Soon" sub="Renewal Alerts" />
                            <button onClick={() => navigate('/members/renewal-alerts')} style={{ padding: '8px 16px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 10, fontWeight: 900, color: T.muted, cursor: 'pointer', textTransform: 'uppercase' }}>View All</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {dashData?.expiring?.slice(0, 4).map((m, i) => (
                                <div key={i} style={{ padding: '16px 20px', background: T.roseLight + '10', border: `1px solid ${T.rose}15`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', color: T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(244,63,94,0.1)' }}>
                                            <Clock size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase' }}>{m.memberName}</div>
                                            <div style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>{m.planName || 'Plan'}</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '6px 12px', background: T.rose, color: '#fff', fontSize: 9, fontWeight: 900, borderRadius: 8, textTransform: 'uppercase' }}>
                                        Immediate
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div style={{ background: T.surface, padding: 32, borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <SectionDivider title="Pending Actions" sub="System Lifecycle Sync" />
                            <button onClick={() => navigate('/crm/pipeline')} style={{ padding: '8px 16px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 10, fontWeight: 900, color: T.muted, cursor: 'pointer', textTransform: 'uppercase' }}>Workflow</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {dashData?.pendingActions?.slice(0, 4).map((action, i) => (
                                <div key={i} style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.01)', border: `1px solid ${T.border}`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>
                                            {getInitials(action.title)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase' }}>{action.title}</div>
                                            <div style={{ fontSize: 9, fontWeight: 800, color: T.subtle, letterSpacing: '0.05em' }}>{action.subtitle}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 9, fontWeight: 900, padding: '5px 10px', borderRadius: 8, background: T.amber, color: '#fff', textTransform: 'uppercase' }}>{action.type || 'Alert'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
