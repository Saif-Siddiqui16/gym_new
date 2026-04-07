import React, { useState, useEffect } from 'react';
import { 
    Building, Users, Activity, IndianRupee, MapPin, ArrowRight, 
    AlertTriangle, Server, CheckCircle2, TrendingUp, Clock, 
    RefreshCw, Shield, Zap, Search, ChevronDown, Sparkles
} from 'lucide-react';
import { getDashboardStats, getRecentGyms, getSystemAlerts } from '../../../api/superadmin/superAdminApi';
import Loader from '../../../components/common/Loader';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
   ───────────────────────────────────────────────────────────────────────────── */
const T = {
    accent: '#7C5CFC',        // primary purple
    accent2: '#9B7BFF',       // lighter purple
    accentLight: '#F0ECFF',   // purple tint bg
    accentMid: '#E4DCFF',     // purple border/focus
    border: '#EAE7FF',        // default borders
    bg: '#F6F5FF',            // page background
    surface: '#FFFFFF',       // card/input surface
    text: '#1A1533',          // primary text
    muted: '#7B7A8E',         // secondary text
    subtle: '#B0ADCC',        // placeholder / hints
    green: '#22C97A',         // success
    greenLight: '#E8FBF2',
    amber: '#F59E0B',         // warning
    amberLight: '#FEF3C7',
    rose: '#F43F5E',          // danger
    roseLight: '#FFF1F4',
    blue: '#3B82F6',          // info
    blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────────────────────────────────────── */

// Header Banner
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 20, padding: '20px 26px',
        boxShadow: '0 8px 32px rgba(124,92,252,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative', overflow: 'hidden'
    }} className="fu fu1">
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 2 }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
            }}>
                <Icon size={26} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 }}>
            {actions}
        </div>
    </div>
);

// Metric Card
const MetricCard = ({ title, value, icon: Icon, iconColor, iconBg, trend, isFirst = false, index = 0 }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: isFirst ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : T.surface,
                borderRadius: 18,
                border: isFirst ? 'none' : `1px solid ${T.border}`,
                boxShadow: isFirst ? '0 8px 24px rgba(124,92,252,0.28)' : '0 2px 12px rgba(124,92,252,0.06)',
                padding: 22,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
                transform: hover ? 'translateY(-2px)' : 'translateY(0)',
                ...(hover && !isFirst && { boxShadow: '0 8px 28px rgba(124,92,252,0.14)' }),
                ...(hover && isFirst && { boxShadow: '0 12px 32px rgba(124,92,252,0.36)' })
            }}
            className={`fu fu${Math.min(index + 1, 4)}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: isFirst ? 'rgba(255,255,255,0.2)' : iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <Icon size={18} color={isFirst ? '#fff' : iconColor} strokeWidth={2.5} />
                </div>
                {trend && (
                    <span style={{
                        fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                        padding: '4px 10px', borderRadius: 20,
                        background: isFirst ? 'rgba(255,255,255,0.15)' : T.greenLight,
                        color: isFirst ? '#fff' : T.green,
                        border: isFirst ? '1px solid rgba(255,255,255,0.2)' : `1px solid #A7F3D0`
                    }}>{trend}</span>
                )}
            </div>
            <div style={{
                fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px',
                color: isFirst ? '#fff' : T.text, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>{value}</div>
            <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: isFirst ? 'rgba(255,255,255,0.7)' : T.muted, fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>{title}</div>
        </div>
    );
};

// Section Divider
const SectionDivider = ({ title, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, marginTop: 12 }}>
        <div style={{ width: 4, height: 22, borderRadius: 4, background: `linear-gradient(to bottom, ${T.accent}, ${T.accent2})`, flexShrink: 0 }} />
        <div>
            <h2 style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
            {sub && <p style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '2px 0 0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sub}</p>}
        </div>
    </div>
);

// Status Pill
const StatusPill = ({ status, type = 'success' }) => {
    const config = {
        success: { bg: T.greenLight, color: T.green, border: '#A7F3D0' },
        warning: { bg: T.amberLight, color: T.amber, border: '#FDE68A' },
        danger: { bg: T.roseLight, color: T.rose, border: '#FECDD3' },
    }[type] || { bg: T.accentLight, color: T.accent, border: T.accentMid };

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '4px 10px', borderRadius: 20,
            background: config.bg, color: config.color, border: `1px solid ${config.border}`
        }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: config.color }} />
            {status}
        </span>
    );
};

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState([]);
    const [recentGyms, setRecentGyms] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const iconMap = {
        'Total Gyms': Building,
        'Total Members': Users,
        'Active Plans': Zap,
        'Monthly Revenue': IndianRupee,
        'Operational Tasks': Activity,
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, gymsRes, alertsRes] = await Promise.all([
                getDashboardStats(),
                getRecentGyms(),
                getSystemAlerts()
            ]);
            setStats(statsRes);
            setRecentGyms(gymsRes);
            setAlerts(alertsRes);
        } catch (e) {
            console.error("Dashboard Load Failure:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                .spinner { width: 44px; height: 44px; border: 3px solid ${T.accentMid}; border-top-color: ${T.accent}; border-radius: 50%; animation: spin 0.8s linear infinite; }
            `}</style>
            <div className="spinner" />
            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Initializing System...
            </div>
        </div>
    );

    const statConfig = [
        { icon: Building, color: T.accent, bg: T.accentLight },
        { icon: Users, color: T.blue, bg: T.blueLight },
        { icon: Zap, color: T.amber, bg: T.amberLight },
        { icon: IndianRupee, color: T.green, bg: T.greenLight },
        { icon: Activity, color: T.rose, bg: T.roseLight },
    ];

    return (
        <div className="dashboard-container" style={{
            background: T.bg, minHeight: '100vh', padding: '28px 28px 48px',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes pulseGreen { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.7;transform:scale(1.2)} }
                
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; }
                .fu2 { animation-delay: .1s; }
                .fu3 { animation-delay: .15s; }
                .fu4 { animation-delay: .2s; }

                .grid-stats { 
                    display: grid; 
                    grid-template-columns: repeat(4, 1fr); 
                    gap: 20px; 
                    margin-bottom: 30px; 
                }
                .grid-main { 
                    display: grid; 
                    grid-template-columns: 1.8fr 1fr; 
                    gap: 24px; 
                    align-items: start; 
                }
                
                .grid-row {
                    display: grid; 
                    grid-template-columns: 2fr 1fr 120px; 
                    padding: 16px 22px;
                    border-bottom: 1px solid ${T.border};
                    align-items: center;
                    transition: background 0.15s;
                }
                .grid-row:hover { background: ${T.bg}; }
                .grid-header {
                    display: grid; 
                    grid-template-columns: 2fr 1fr 120px; 
                    padding: 12px 22px; 
                    background: ${T.bg}; 
                    border-bottom: 1px solid ${T.border};
                }

                @media (max-width: 1400px) {
                    .grid-stats { grid-template-columns: repeat(3, 1fr); }
                }

                @media (max-width: 1200px) {
                    .grid-main { grid-template-columns: 1fr; }
                    .grid-stats { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 768px) {
                    .header-banner { 
                        flex-direction: column; 
                        align-items: flex-start !important; 
                        gap: 20px; 
                        padding: 20px !important; 
                    }
                    .header-banner-actions {
                        width: 100%;
                        justify-content: flex-end;
                    }
                    .grid-stats { grid-template-columns: 1fr; }
                    .grid-row, .grid-header { grid-template-columns: 1fr 1fr; }
                    .hide-mobile { display: none; }
                }

                @media (max-width: 480px) {
                    .dashboard-container { padding: 16px 16px 40px !important; }
                    .grid-row { padding: 12px 16px; }
                }
            `}</style>

            <HeaderBanner 
                title="Roar Fitness Central"
                sub="Cloud Infrastructure & Multi-Brand Gym Management"
                icon={Shield}
                actions={
                    <button 
                        onClick={fetchData}
                        style={{
                            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
                            width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', color: '#fff', transition: '0.2s',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        <RefreshCw size={15} />
                    </button>
                }
            />

            <div className="grid-stats">
                {stats.slice(0, 4).map((s, i) => {
                    const cfg = statConfig[i % statConfig.length];
                    const Icon = iconMap[s.title] || cfg.icon;
                    return (
                        <MetricCard 
                            key={s.id || i}
                            index={i}
                            isFirst={i === 0}
                            title={s.title}
                            value={s.value}
                            trend={s.trend}
                            icon={Icon}
                            iconColor={cfg.color}
                            iconBg={cfg.bg}
                        />
                    );
                })}
            </div>

            <div className="grid-main">
                <div className="fu fu3">
                    <SectionDivider title="Partner Ecosystem" sub="Recent gym registrations" />
                    <div style={{
                        background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`,
                        boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden'
                    }}>
                        <div className="grid-header hide-mobile">
                            {['Partner Detail', 'Location', 'Status'].map(h => (
                                <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                            ))}
                        </div>

                        {recentGyms.length > 0 ? recentGyms.map((g, i) => (
                            <div key={g.id || i} className="grid-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 11, 
                                        background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 900, boxShadow: '0 4px 10px rgba(124,92,252,0.2)'
                                    }}>
                                        {(g.gymName || 'G').charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{g.gymName}</div>
                                        <div style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{g.branchName}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: T.muted }} className="hide-mobile">
                                    {g.location || 'N/A'}
                                </div>
                                <div>
                                    <StatusPill 
                                        status={g.status} 
                                        type={g.status === 'Active' ? 'success' : 'warning'} 
                                    />
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <p style={{ fontSize: 13, color: T.muted, fontStyle: 'italic', margin: 0, fontWeight: 500 }}>
                                    No new registration recorded in the last 30 days
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="fu fu4">
                    <SectionDivider title="Infrastructure Status" sub="System-wide critical nodes" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {alerts.length > 0 ? alerts.slice(0, 4).map(a => (
                            <div key={a.id || Math.random()} style={{
                                background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`,
                                borderLeft: `4px solid ${a.type === 'danger' ? T.rose : T.amber}`,
                                padding: '16px', display: 'flex', gap: 14,
                                boxShadow: '0 2px 8px rgba(124,92,252,0.05)',
                                transition: '0.2s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                                <div style={{
                                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                                    background: a.type === 'danger' ? T.roseLight : T.amberLight,
                                    color: a.type === 'danger' ? T.rose : T.amber,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {a.type === 'danger' ? <Server size={18} /> : <AlertTriangle size={18} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <h4 style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0 }}>{a.title}</h4>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: T.subtle, textTransform: 'uppercase' }}>{a.time}</span>
                                    </div>
                                    <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, margin: 0 }}>{a.message}</p>
                                </div>
                            </div>
                        )) : (
                            <div style={{
                                background: T.greenLight, border: `1px solid #A7F3D0`,
                                borderRadius: 18, padding: '32px 20px', textAlign: 'center'
                            }}>
                                <CheckCircle2 size={24} color={T.green} style={{ marginBottom: 14 }} />
                                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#065F46', margin: '0 0 4px' }}>Stability Confirmed</h4>
                                <p style={{ fontSize: 11, color: '#047857', margin: 0, fontWeight: 600 }}>All system nodes responding</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;