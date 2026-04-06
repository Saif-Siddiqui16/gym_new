import React, { useState, useEffect } from 'react';
import { 
    Activity, Download, Users, TrendingUp, IndianRupee, BarChart3, 
    ShoppingBag, Package, ArrowUpRight, Clock, ShieldAlert,
    ChevronRight, RefreshCw, Star, ArrowRight, Zap, Target, LayoutDashboard
} from 'lucide-react';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';
import { exportPdf } from '../../../utils/exportPdf';
import toast from 'react-hot-toast';

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
  blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────────────────────────────────────── */

const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 24, padding: '24px 32px',
        boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 32, position: 'relative', overflow: 'hidden'
    }} className="fu fu1">
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
            <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.08)', flexShrink: 0
            }}>
                <Icon size={30} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: '4px 0 0', fontWeight: 600 }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
            {actions}
        </div>
    </div>
);

const MetricCard = ({ label, value, icon: Icon, iconColor, iconBg, trend, trendDir, index = 1 }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.02)', padding: '22px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                ...(hover && { boxShadow: '0 14px 40px rgba(124,92,252,0.12)' })
            }}
            className={`fu fu${Math.min(index, 4)}`}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={iconColor} strokeWidth={2.5} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 900, color: T.green, background: T.greenLight, padding: '4px 10px', borderRadius: 20 }}>
                    <ArrowUpRight size={12} /> LIVE
                </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: T.text, marginBottom: 2, letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.subtle, marginTop: 6 }}>Real-time streaming</div>
        </div>
    );
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

const ChartBar = ({ label, value, max, color = T.accent, isCurrency = false }) => {
    const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 8 : 2) : 2;
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'end', height: '100%', gap: 8, position: 'relative' }} className="group-bar">
            {value > 0 && (
                <div style={{ 
                    position: 'absolute', bottom: `${pct}%`, left: '50%', transform: 'translateX(-50%)',
                    background: T.text, color: '#fff', fontSize: 8, fontWeight: 900, padding: '2px 5px', borderRadius: 4,
                    opacity: 0, transition: '0.2s', marginBottom: 4, zIndex: 10, whiteSpace: 'nowrap'
                }} className="bar-tip">
                    {isCurrency ? '₹' : ''}{value >= 1000 ? (value/1000).toFixed(1)+'k' : value}
                </div>
            )}
            <div style={{ width: '70%', background: color, height: `${pct}%`, borderRadius: '6px 6px 0 0', transition: 'height 0.8s' }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>{label}</span>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN REPORT COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
const BranchPerformanceReport = () => {
    const { selectedBranch, branches } = useBranchContext();
    const [activeOrderTab, setActiveOrderTab] = useState('New');
    const [loading, setLoading] = useState(true);

    const activeBranch = branches.find(b => b.id.toString() === selectedBranch.toString());
    const pageTitle = activeBranch ? `${activeBranch.branchName || activeBranch.name} Analytics` : 'Gym Analytics';

    const [statsData, setStatsData] = useState({ totalMembers: 0, revenueThisMonth: 0, collectionRate: 0, pendingDues: 0 });
    const [earningsData, setEarningsData] = useState({
        months: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        profit: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        expenses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalIncome: 0, totalExpenses: 0
    });
    const [weeklyData, setWeeklyData] = useState({ days: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'], values: [0, 0, 0, 0, 0, 0, 0] });
    const [retentionData, setRetentionData] = useState([]);
    const [membershipGrowth, setMembershipGrowth] = useState({ labels: [], values: [] });
    const [revenueByPlan, setRevenueByPlan] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [totalNetProfit, setTotalNetProfit] = useState(0);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch?.id || selectedBranch;
            const response = await apiClient.get(`/branch-admin/reports/performance?branchId=${branchId}`);
            if (response.data) {
                if (response.data.stats) setStatsData(response.data.stats);
                if (response.data.earnings) setEarningsData(response.data.earnings);
                if (response.data.weekly) setWeeklyData(response.data.weekly);
                if (response.data.retention) setRetentionData(response.data.retention);
                if (response.data.growth) setMembershipGrowth(response.data.growth);
                if (response.data.revenueByPlan) setRevenueByPlan(response.data.revenueByPlan);
                if (response.data.popularProducts) setPopularProducts(response.data.popularProducts);
                if (response.data.recentOrders) setRecentOrders(response.data.recentOrders);
                if (response.data.totalNetProfit !== undefined) setTotalNetProfit(response.data.totalNetProfit);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchReport(); }, [selectedBranch]);

    const handleExport = () => {
        const headers = ['Metric', 'Value'];
        const rows = [
            ['Total Members', statsData.totalMembers.toString()],
            ['Monthly Revenue', `₹${statsData.revenueThisMonth.toLocaleString()}`],
            ['Collection Rate', `${statsData.collectionRate}%`],
            ['Pending Dues', `₹${statsData.pendingDues.toLocaleString()}`],
            ['Total Income (12m)', `₹${earningsData.totalIncome.toLocaleString()}`],
            ['Total Expenses (12m)', `₹${earningsData.totalExpenses.toLocaleString()}`]
        ];

        exportPdf({
            title: 'Branch Performance Report',
            filename: `performance_report_${new Date().toISOString().split('T')[0]}`,
            headers, rows,
            gymName: activeBranch?.branchName || activeBranch?.name || "Gym Academy"
        });
    };

    if (loading) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width: 50, height: 50, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Compiling Analytics Data…</p>
        </div>
    );

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; } .fu4 { animation-delay: .2s; }
                .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
                .grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
                .grid-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 24px; }
                .table-grid { display: grid; grid-template-columns: 120px 1fr 1fr 1fr 120px; align-items: center; padding: 14px 20px; border-bottom: 1px solid ${T.border}; }
                .group-bar:hover .bar-tip { opacity: 1; transform: translateX(-50%) translateY(-2px); }
                @media (max-width: 1280px) { .grid-4, .grid-row { grid-template-columns: repeat(2, 1fr); } .grid-3 { grid-template-columns: 1fr; } }
                @media (max-width: 640px) { .grid-4, .grid-row { grid-template-columns: 1fr; } .table-grid { grid-template-columns: 1fr; gap: 8px; } }
            `}</style>

            {/* ── HEADER ── */}
            <HeaderBanner 
                title={pageTitle} 
                sub={`Complete performance insights for ${activeBranch?.branchName || 'this branch'}`} 
                icon={BarChart3} 
                actions={
                    <button 
                        onClick={handleExport}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10, px: '20px', height: 42,
                            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12,
                            color: '#fff', fontSize: 11, fontWeight: 900, cursor: 'pointer', transition: '0.2s', padding: '0 20px'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        <Download size={16} /> EXPORT AS PDF
                    </button>
                }
            />

            {/* ── TOP KPI CARDS ── */}
            <div className="grid-4 fu fu2">
                <MetricCard label="Total Members" value={statsData.totalMembers} icon={Users} iconColor={T.blue} iconBg={T.blueLight} index={1} />
                <MetricCard label="Total Revenue" value={`₹${(statsData.revenueThisMonth/1000).toFixed(1)}k`} icon={IndianRupee} iconColor={T.green} iconBg={T.greenLight} index={2} />
                <MetricCard label="Collection Rate" value={`${statsData.collectionRate}%`} icon={TrendingUp} iconColor={T.accent} iconBg={T.accentLight} index={3} />
                <MetricCard label="Pending Dues" value={`₹${(statsData.pendingDues/1000).toFixed(1)}k`} icon={ShieldAlert} iconColor={T.rose} iconBg={T.roseLight} index={4} />
            </div>

            {/* ── MAIN CHARTS ROW ── */}
            <div className="grid-3 fu fu3">
                <div style={{ background: T.surface, padding: 30, borderRadius: 24, border: `1px solid ${T.border}` }}>
                    <SectionDivider title="Earning Reports" sub="Total Revenue & Store Profit (Last 12m)" />
                    <div style={{ height: 220, display: 'flex', alignItems: 'end', gap: 12, paddingBottom: 10, marginTop: 40 }}>
                        {earningsData.months.map((m, i) => (
                            <ChartBar key={i} label={m} value={earningsData.revenue[i]} max={Math.max(...earningsData.revenue, 1)} color={T.accent} isCurrency={true} />
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 30 }}>
                        {[
                            { label: 'Earnings', val: `₹${(earningsData.totalIncome/1000).toFixed(1)}k`, color: T.accent, bg: T.accentLight },
                            { label: 'Profit', val: `₹${((earningsData.totalIncome - earningsData.totalExpenses)/1000).toFixed(1)}k`, color: T.green, bg: T.greenLight },
                            { label: 'Expenses', val: `₹${(earningsData.totalExpenses/1000).toFixed(1)}k`, color: T.rose, bg: T.roseLight },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: 18, background: item.bg, borderRadius: 16 }}>
                                <div style={{ fontSize: 9, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                                <div style={{ fontSize: 20, fontWeight: 900, color: item.color }}>{item.val}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: T.surface, padding: 30, borderRadius: 24, border: `1px solid ${T.border}` }}>
                    <SectionDivider title="Member Retention" sub="Membership status distribution" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                        {retentionData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 18, background: T.bg, borderRadius: 16, border: `1px solid ${T.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.status === 'Active' ? T.green : T.subtle }} />
                                    <span style={{ fontSize: 11, fontWeight: 900, color: T.text, textTransform: 'uppercase' }}>{d.status}</span>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 900, color: T.accent }}>{d.count}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 40, textAlign: 'center' }}>
                        <div style={{ padding: '20px', background: T.accentLight, borderRadius: 20, border: `1px dashed ${T.accent}` }}>
                            <p style={{ fontSize: 10, fontWeight: 800, color: T.accent, textTransform: 'uppercase', marginBottom: 4 }}>Site Vitality Score</p>
                            <h4 style={{ fontSize: 24, fontWeight: 900, color: T.text, margin: 0 }}>High</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SECOND ROW ── */}
            <div className="grid-row fu fu4">
                {/* Weekly Earnings */}
                <div style={{ background: T.surface, padding: 24, borderRadius: 24, border: `1px solid ${T.border}` }}>
                    <SectionDivider title="Weekly Earnings" sub="This week's daily revenue" />
                    <div style={{ height: 160, display: 'flex', alignItems: 'end', gap: 8, paddingBottom: 10, marginTop: 30 }}>
                        {weeklyData.days.map((d, i) => (
                            <ChartBar key={i} label={d} value={weeklyData.values[i]} max={Math.max(...weeklyData.values, 1)} color={T.green} isCurrency={true} />
                        ))}
                    </div>
                </div>

                {/* Net Profit Circle */}
                <div style={{ background: T.surface, padding: 24, borderRadius: 24, border: `1px solid ${T.border}` }}>
                    <SectionDivider title="Net Profit" sub="Store Net Profit (Last 12m)" />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ margin: '30px 0', position: 'relative', width: 140, height: 140 }}>
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r="62" fill="none" stroke={T.bg} strokeWidth="12" />
                                <circle cx="70" cy="70" r="62" fill="none" stroke={T.accent} strokeWidth="12" strokeDasharray="389" strokeDashoffset={389 - (300 / 389) * 389} strokeLinecap="round" transform="rotate(-90 70 70)" />
                            </svg>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: 22, fontWeight: 900, color: T.text, lineHeight: 1 }}>₹{(totalNetProfit/1000).toFixed(1)}k</div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginTop: 4 }}>ANNUAL</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
                            <div style={{ padding: 10, background: T.bg, borderRadius: 12, textAlign: 'center' }}>
                                <div style={{ fontSize: 8, fontWeight: 900, color: T.muted }}>REVENUE</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: T.green }}>₹{(earningsData.totalIncome/1000).toFixed(1)}k</div>
                            </div>
                            <div style={{ padding: 10, background: T.bg, borderRadius: 12, textAlign: 'center' }}>
                                <div style={{ fontSize: 8, fontWeight: 900, color: T.muted }}>EXPENSES</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: T.rose }}>₹{(earningsData.totalExpenses/1000).toFixed(1)}k</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popular Products */}
                <div style={{ background: T.surface, padding: 24, borderRadius: 24, border: `1px solid ${T.border}` }}>
                    <SectionDivider title="Popular Products" sub={`${popularProducts.reduce((sum, p) => sum + (p.quantity || 0), 0)} items sold total`} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                        {popularProducts.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: T.bg, borderRadius: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <ShoppingBag size={14} color={T.accent} />
                                    <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{p.name}</span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 900, color: T.muted }}>{p.quantity} SOLD</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── STORE ORDERS TABLE ── */}
            <div style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', marginBottom: 24 }} className="fu fu4">
                <div style={{ padding: '24px 30px', borderBottom: `1px solid ${T.border}`, background: T.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                    <div>
                        <SectionDivider title="Recent Store Orders" sub="POS & store sales overview" />
                    </div>
                    <div style={{ display: 'flex', gap: 8, background: '#fff', padding: 5, borderRadius: 14, border: `1px solid ${T.border}` }}>
                        {['New', 'Processing', 'Completed'].map(t => (
                            <button 
                                key={t} onClick={() => setActiveOrderTab(t)}
                                style={{
                                    border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 10, fontWeight: 900, cursor: 'pointer',
                                    background: activeOrderTab === t ? T.accent : 'transparent',
                                    color: activeOrderTab === t ? '#fff' : T.muted, transition: '0.2s'
                                }}
                            >{t.toUpperCase()}</button>
                        ))}
                    </div>
                </div>
                <div style={{ minWidth: 800 }}>
                    <div style={{ background: T.bg, padding: '12px 20px', borderBottom: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr 120px' }}>
                        {['Order ID', 'Date', 'Items', 'Total', 'Status'].map(h => <span key={h} style={{ fontSize: 9, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>)}
                    </div>
                    {recentOrders.filter(o => o.status === activeOrderTab).length > 0 ? recentOrders.filter(o => o.status === activeOrderTab).map((order, i) => (
                        <div key={order.id} className="table-grid">
                            <span style={{ fontSize: 12, fontWeight: 900, color: T.text }}>#ORD-{order.id}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>{order.date}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>{order.itemsCount} Items</span>
                            <span style={{ fontSize: 13, fontWeight: 900, color: T.text }}>₹{Number(order.total).toLocaleString()}</span>
                            <div>
                                <span style={{
                                    padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                                    background: order.status === 'Completed' ? T.greenLight : T.amberLight,
                                    color: order.status === 'Completed' ? T.green : T.amber
                                }}>{order.status}</span>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: 60, textAlign: 'center', color: T.subtle }}>No {activeOrderTab.toLowerCase()} orders found</div>
                    )}
                </div>
            </div>

            {/* ── BOTTOM ROW ── */}
            <div className="grid-row fu fu5">
                {/* Membership Growth */}
                <div style={{ background: T.surface, padding: 24, borderRadius: 24, border: `1px solid ${T.border}` }}>
                    <SectionDivider title="Membership Growth" sub="New members per month" />
                    <div style={{ height: 160, display: 'flex', alignItems: 'end', gap: 6, paddingBottom: 10, marginTop: 30 }}>
                        {membershipGrowth.labels.map((l, i) => (
                            <ChartBar key={i} label={l} value={membershipGrowth.values[i]} max={Math.max(...membershipGrowth.values, 1)} color={T.blue} />
                        ))}
                    </div>
                </div>

                {/* Revenue by Plan */}
                <div style={{ background: T.surface, padding: 24, borderRadius: 24, border: `1px solid ${T.border}` }}>
                    <SectionDivider title="Revenue by Plan" sub="Top performing membership plans" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
                        {revenueByPlan.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: T.greenLight, borderRadius: 16, border: `1px solid ${T.green}20` }}>
                                <span style={{ fontSize: 12, fontWeight: 900, color: T.text }}>{p.name}</span>
                                <span style={{ fontSize: 13, fontWeight: 900, color: T.green }}>₹{(p.value / 1000).toFixed(1)}k</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Efficiency / Summary */}
                <div style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, padding: 24, borderRadius: 24, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, marginBottom: 12 }} />
                        <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Operations Matrix</h3>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 4 }}>System intelligence report completed for {activeBranch?.branchName}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Zap size={24} color="#fff" />
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>98.4%</div>
                            <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.8, textTransform: 'uppercase' }}>Engine Efficiency</div>
                        </div>
                    </div>
                    <button style={{ height: 44, width: '100%', background: 'rgba(0,0,0,0.1)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 11, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                       GENERATE NEXT SHIFT <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BranchPerformanceReport;
