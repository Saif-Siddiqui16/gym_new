import React, { useState, useEffect } from 'react';
import {
    User, Clock, CheckCircle, Users, DollarSign, TrendingUp, Activity, ChevronRight,
    IndianRupee, CreditCard, Smartphone, Banknote, ShieldAlert, Zap, XOctagon,
    Package, ShoppingBag, Star, Calendar, UserPlus, BarChart3, ArrowUpRight,
    ArrowDownRight, RefreshCw, Shield, Activity as ActivityIcon, ArrowRight,
    Briefcase, LayoutDashboard, Eye, TrendingDown, AlertTriangle
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
            <div style={{ position: 'relative', width: '40%', background: color, height: `${pct}%`, borderRadius: '6px 6px 0 0', transition: 'height 0.8s ease' }}>
                <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 800, color: T.text }}>{isCurrency ? `₹${value}` : value}</div>
            </div>
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

            // Map all stats into the 8-card format expected by the UI
            const allStats = [
                statsData.stats[0] || { title: 'Total Members', value: 0, trend: 'LIVE' },
                statsData.stats[1] || { title: 'Monthly Revenue', value: '₹0', trend: 'THIS MONTH' },
                statsData.stats[2] || { title: 'Store Sales', value: '₹0', trend: 'MONTHLY' },
                statsData.stats[3] || { title: 'Today Check-ins', value: 0, trend: 'TODAY' },
                { title: 'Net Profit (Store)', value: `₹${Number(statsData.netProfit || 0).toFixed(0)}`, trend: 'MONTHLY' },
                { title: 'New Leads', value: statsData.newLeads || 0, trend: 'THIS MONTH' },
                { title: 'Today\'s Classes', value: statsData.todaysClasses || 0, trend: 'SCHEDULED' },
                { title: 'Pending Approvals', value: statsData.pendingApprovals || 0, trend: 'REVIEW PENDING' }
            ];

            setStats(allStats);
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

            <SectionDivider title="Gym Health Section" sub="Real-time overview of your business" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
                {Array.from({ length: 8 }).map((_, i) => {
                    const titles = ['Total Members', 'Monthly Revenue', 'Store Sales', 'Today Check-ins', 'Net Profit (Store)', 'New Leads', 'Today\'s Classes', 'Pending Approvals'];
                    const trends = ['LIVE', 'THIS MONTH', 'MONTHLY', 'TODAY', 'MONTHLY', 'THIS MONTH', 'SCHEDULED', 'REVIEW PENDING'];
                    const icons = [Users, IndianRupee, ShoppingBag, CheckCircle, TrendingUp, UserPlus, Calendar, ShieldAlert];
                    const colors = [T.accent, T.green, T.amber, T.blue, T.green, T.accent, T.amber, T.rose];
                    const bgs = [T.accentLight, T.greenLight, T.amberLight, T.blueLight, T.greenLight, T.accentLight, T.amberLight, T.roseLight];
                    
                    // Priority: If API provides a stat at this index or with this title, use it.
                    // Otherwise, use a default placeholder.
                    const s = stats[i] || {};
                    const title = s.title || titles[i];
                    const value = s.value || '0';
                    const trend = s.trend || trends[i];
                    
                    return (
                        <MetricCard 
                            key={i} index={i} isFirst={false}
                            title={title}
                            value={value}
                            trend={trend}
                            icon={icons[i % 8]}
                            iconColor={colors[i % 8]}
                            iconBg={bgs[i % 8]}
                        />
                    );
                })}
            </div>

            <div style={{ background: T.surface, borderRadius: 24, padding: '24px 28px', border: `1px solid ${T.border}`, marginBottom: 32 }} className="fu fu2">
                <SectionDivider title="OPERATIONAL TASK PERFORMANCE" sub="REAL-TIME TASK LIFECYCLE TRACKING" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
                    {[
                        { label: 'PENDING', val: extraStats.taskStats.pending, color: T.blue },
                        { label: 'IN PROGRESS', val: extraStats.taskStats.inProgress, color: T.amber },
                        { label: 'COMPLETED', val: extraStats.taskStats.completed, color: T.green },
                        { label: 'APPROVED', val: extraStats.taskStats.approved, color: T.accent },
                        { label: 'OVERDUE', val: extraStats.taskStats.overdue, color: T.rose }
                    ].map((st, i) => (
                        <div key={i} style={{ borderLeft: `4px solid ${st.color}`, padding: '16px 20px', background: T.surface, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: `1px solid ${T.border}` }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>{st.label}</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: T.text }}>{st.val}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                <div className="fu fu3" style={{ background: T.surface, borderRadius: 24, padding: 28, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                    <SectionDivider title="Revenue Overview" sub="Monthly Tracking (Last 6 Months)" />
                    <div style={{ height: 220, display: 'flex', alignItems: 'end', gap: 14, marginTop: 20, paddingBottom: 10 }}>
                        {(revenueOverview.length > 0 ? revenueOverview : [{month:'Nov',value:0},{month:'Dec',value:0},{month:'Jan',value:0},{month:'Feb',value:0},{month:'Mar',value:0},{month:'Apr',value:0}]).map((r, i) => (
                            <ChartBar key={i} label={r.month} value={r.value} max={Math.max(...revenueOverview.map(x => x.value), 100)} color={T.accent} isCurrency />
                        ))}
                    </div>
                </div>
                <div className="fu fu3" style={{ background: T.surface, borderRadius: 24, padding: 28, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                    <SectionDivider title="Weekly Footfall" sub="Check-in Activity (Last 7 Days)" />
                    <div style={{ height: 220, display: 'flex', alignItems: 'end', gap: 14, marginTop: 20, paddingBottom: 10 }}>
                        {(weeklyAttendance.length > 0 ? weeklyAttendance : [{day:'Wed',count:0},{day:'Thu',count:0},{day:'Fri',count:0},{day:'Sat',count:0},{day:'Sun',count:0},{day:'Mon',count:2},{day:'Tue',count:0}]).map((a, i) => (
                            <ChartBar key={i} label={a.day} value={a.count} max={Math.max(...weeklyAttendance.map(x => x.count), 5)} color={T.green} />
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
                <div className="fu fu4" style={{ background: T.surface, borderRadius: 24, padding: 28, border: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                    <SectionDivider title="Live Occupancy" sub="Real-time Status" />
                    <div style={{ position: 'relative', width: 140, height: 140, margin: '24px 0' }}>
                        <svg width="140" height="140" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke={T.bg} strokeWidth="6" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke={T.accent} strokeWidth="6" strokeDasharray={`${(liveOccupancy.current / liveOccupancy.capacity) * 282} 282`} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 1s ease' }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: 32, fontWeight: 900, color: T.text }}>{liveOccupancy.current}</div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted }}>OF {liveOccupancy.capacity}</div>
                        </div>
                    </div>
                    <div style={{ background: T.accentLight, padding: '6px 16px', borderRadius: 20, color: T.accent, fontSize: 12, fontWeight: 900 }}>{Math.round((liveOccupancy.current / liveOccupancy.capacity) * 100)}% FULL</div>
                </div>

                <div className="fu fu4">
                    <TodayFollowUpsWidget />
                </div>

                <div className="fu fu4" style={{ background: T.surface, borderRadius: 24, padding: 28, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                    <SectionDivider title="Check-ins by Hour" sub="Daily Traffic Flow" />
                <div style={{ background: T.bg, borderRadius: 16, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20, padding: 20 }}>
                    {checkInsByHour.reduce((acc, h) => acc + h.count, 0) > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, width: '100%', height: '100%' }}>
                            {checkInsByHour.map((h, i) => {
                                const maxVal = Math.max(...checkInsByHour.map(x => x.count), 5);
                                const height = (h.count / maxVal) * 100;
                                return (
                                    <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                                        <div style={{ width: '60%', height: `${Math.max(height, 5)}%`, background: h.count > 0 ? T.accent : T.subtle + '30', borderRadius: '4px 4px 0 0', transition: 'height 0.8s ease' }}></div>
                                        <span style={{ fontSize: 8, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>{h.hour % 4 === 0 ? h.label : ''}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <ActivityIcon size={32} color={T.subtle} style={{ marginBottom: 12, opacity: 0.3 }} />
                            <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, fontStyle: 'italic', margin: 0 }}>Traffic flow will appear here as members check-in</p>
                        </div>
                    )}
                </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
                <div className="fu fu4">
                    <SectionDivider title="Entrance HQ" sub="Recent Member Access Logs" />
                    <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                        {recentActivities.map((act, i) => (
                            <div key={i} style={{ 
                                display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', padding: '16px 24px', 
                                borderBottom: i === recentActivities.length - 1 ? 'none' : `1px solid ${T.border}`, transition: '0.15s' 
                            }} onMouseOver={e => e.currentTarget.style.background = T.bg} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 12, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>{act.member.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{act.member}</div>
                                        <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{act.action}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: T.subtle }}>{act.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="fu fu4">
                    <RenewalAlertsWidget />
                </div>
            </div>
        </div>
    );
};

export default BranchManagerDashboard;
