import React, { useState, useEffect } from 'react';
import {
    User, Clock, CheckCircle, Users, DollarSign, TrendingUp, Activity, ChevronRight,
    IndianRupee, CreditCard, Smartphone, Banknote, ShieldAlert, Zap, XOctagon,
    Package, ShoppingBag, Star, Calendar, UserPlus, BarChart3, ArrowUpRight,
    ArrowDownRight, RefreshCw, Shield, Activity as ActivityIcon, ArrowRight,
    Briefcase, LayoutDashboard, Eye, TrendingDown
} from 'lucide-react';
import RenewalAlertsWidget from '../../membership/components/RenewalAlertsWidget';
import TodayFollowUpsWidget from '../../crm/components/TodayFollowUpsWidget';
import { useNavigate } from 'react-router-dom';
import LiveAccessControl from '../components/LiveAccessControl';
import FacilityStatusOverview from '../../operations/components/widgets/FacilityStatusOverview';
import SmartAIoTSummary from '../components/SmartAIoTSummary';
import { fetchDashboardStats, fetchRecentActivities, fetchTrainerAvailability, fetchFinancialStats } from '../../../api/branchAdmin/branchAdminApi';
import { useBranchContext } from '../../../context/BranchContext';

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
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 2 }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
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

const ChartBar = ({ label, value, max, color = T.accent, isCurrency = false }) => {
    const pct = max > 0 ? Math.max((value / max) * 100, 4) : 4;
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'end', height: '100%', gap: 8 }}>
            <div style={{ width: '40%', background: color, height: `${pct}%`, borderRadius: '4px 4px 0 0', transition: 'height 0.8s' }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>{label}</span>
        </div>
    );
};

const BranchManagerDashboard = () => {
    const { selectedBranch, branches } = useBranchContext();
    const navigate = useNavigate();

    const [stats, setStats] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revenueOverview, setRevenueOverview] = useState([]);
    const [weeklyAttendance, setWeeklyAttendance] = useState([]);
    const [liveOccupancy, setLiveOccupancy] = useState({ current: 0, capacity: 50 });
    const [checkInsByHour, setCheckInsByHour] = useState([]);
    const [extraStats, setExtraStats] = useState({ taskStats: { pending: 0, inProgress: 0, completed: 0, approved: 0, overdue: 0 } });

    const activeBranch = branches.find(b => b.id.toString() === selectedBranch?.toString());
    const welcomeTitle = activeBranch ? `Welcome back, ${activeBranch.branchName || activeBranch.name}!` : 'Welcome back, Admin!';

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, activitiesData, trainersData] = await Promise.all([
                fetchDashboardStats(selectedBranch),
                fetchRecentActivities(selectedBranch),
                fetchTrainerAvailability(selectedBranch)
            ]);

            setStats(statsData.stats || []);
            setRecentActivities(activitiesData || []);
            setTrainers(trainersData || []);
            if (statsData.revenueOverview) setRevenueOverview(statsData.revenueOverview);
            if (statsData.weeklyAttendance) setWeeklyAttendance(statsData.weeklyAttendance);
            if (statsData.liveOccupancy) setLiveOccupancy(statsData.liveOccupancy);
            if (statsData.checkInsByHour) setCheckInsByHour(statsData.checkInsByHour);
            if (statsData.taskStats) setExtraStats({ ...extraStats, taskStats: statsData.taskStats });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [selectedBranch]);

    if (loading) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                .spinner { width: 44px; height: 44px; border: 3px solid ${T.accentMid}; border-top-color: ${T.accent}; border-radius: 50%; animation: spin 0.8s linear infinite; }
            `}</style>
            <div className="spinner" />
            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Initializing Dashboard...
            </div>
        </div>
    );

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; } .fu4 { animation-delay: .2s; }
            `}</style>

            <HeaderBanner 
                title={welcomeTitle} 
                sub="Real-time branch intelligence & operations" 
                icon={ActivityIcon} 
                actions={
                    <button 
                        onClick={loadData} 
                        style={{ border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        <RefreshCw size={15} />
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 30 }}>
                {stats.slice(0, 4).map((s, i) => (
                    <MetricCard 
                        key={i} index={i} isFirst={i === 0}
                        title={s.title} value={s.value} trend={s.trend}
                        icon={s.icon === 'Users' ? Users : s.icon === 'DollarSign' ? IndianRupee : Zap}
                        iconColor={[T.accent, T.blue, T.amber, T.green][i % 4]}
                        iconBg={[T.accentLight, T.blueLight, T.amberLight, T.greenLight][i % 4]}
                    />
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
                <div className="fu fu3" style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1px solid ${T.border}` }}>
                    <SectionDivider title="Revenue Overview" sub="Monthly Tracking" />
                    <div style={{ height: 180, display: 'flex', alignItems: 'end', gap: 12 }}>
                        {revenueOverview.map((r, i) => (
                            <ChartBar key={i} label={r.month} value={r.value} max={Math.max(...revenueOverview.map(x => x.value), 1)} color={T.accent} />
                        ))}
                    </div>
                </div>
                <div className="fu fu3" style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1px solid ${T.border}` }}>
                    <SectionDivider title="Weekly Footfall" sub="Check-in Activity" />
                    <div style={{ height: 180, display: 'flex', alignItems: 'end', gap: 12 }}>
                        {weeklyAttendance.map((a, i) => (
                            <ChartBar key={i} label={a.day} value={a.count} max={Math.max(...weeklyAttendance.map(x => x.count), 1)} color={T.green} />
                        ))}
                    </div>
                </div>
                <div className="fu fu3" style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <SectionDivider title="Live Status" sub="Occupancy Rate" />
                    <div style={{ position: 'relative', width: 100, height: 100, margin: '20px 0' }}>
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke={T.bg} strokeWidth="8" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke={T.accent} strokeWidth="8" strokeDasharray={`${(liveOccupancy.current / liveOccupancy.capacity) * 282} 282`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: T.text }}>{liveOccupancy.current}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, textTransform: 'uppercase' }}>{liveOccupancy.current} / {liveOccupancy.capacity} Members</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
                <div className="fu fu4">
                    <SectionDivider title="Operational HQ" sub="Real-time Entrance Logs" />
                    <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                        {recentActivities.map((act, i) => (
                            <div key={i} style={{ 
                                display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', padding: '14px 20px', 
                                borderBottom: i === recentActivities.length - 1 ? 'none' : `1px solid ${T.border}`, transition: '0.15s' 
                            }} onMouseOver={e => e.currentTarget.style.background = T.bg} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{act.member.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{act.member}</div>
                                        <div style={{ fontSize: 10, color: T.subtle, fontWeight: 600 }}>{act.action}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 800, color: T.subtle }}>{act.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="fu fu4">
                    <SectionDivider title="Compliance" sub="Facility Alerts" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{ color: T.rose }}><AlertTriangle size={18} /></div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: T.text, textTransform: 'uppercase' }}>Risk Monitoring</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ background: T.bg, padding: 16, borderRadius: 12 }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: T.subtle, uppercase: true }}>Pending Tasks</div>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{extraStats.taskStats.pending}</div>
                                </div>
                                <div style={{ background: T.roseLight, padding: 16, borderRadius: 12 }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: T.rose, uppercase: true }}>Overdue</div>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: T.rose }}>{extraStats.taskStats.overdue}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchManagerDashboard;
