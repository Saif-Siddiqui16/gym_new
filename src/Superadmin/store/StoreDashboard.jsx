import React, { useState, useEffect } from 'react';
import { 
    ShoppingCart, Box, TrendingUp, Layers, AlertTriangle, Search, Clock, 
    Package, CheckCircle, ChevronRight, LayoutGrid, ReceiptText, User,
    ShoppingBag, IndianRupee, ArrowRight, Sparkles, RefreshCw
} from 'lucide-react';
import { getStoreStats } from '../../api/storeApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 20, padding: '20px 26px',
        boxShadow: '0 8px 32px rgba(124,92,252,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative', overflow: 'hidden'
    }} className="fu">
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
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500 }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 }}>
            {actions}
        </div>
    </div>
);

const MetricCard = ({ title, value, icon: Icon, iconColor, iconBg, trend, isFirst = false }) => {
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
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                ...(hover && !isFirst && { boxShadow: '0 8px 28px rgba(124,92,252,0.14)' }),
                ...(hover && isFirst && { boxShadow: '0 12px 32px rgba(124,92,252,0.36)' })
            }}
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
                        fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                        padding: '4px 10px', borderRadius: 20,
                        background: isFirst ? 'rgba(255,255,255,0.15)' : T.greenLight,
                        color: isFirst ? '#fff' : T.green,
                        border: isFirst ? '1px solid rgba(255,255,255,0.2)' : `1px solid #A7F3D0`
                    }}>{trend}</span>
                )}
            </div>
            <div style={{
                fontSize: 28, fontWeight: 900, letterSpacing: '-1px',
                color: isFirst ? '#fff' : T.text, marginBottom: 4
            }}>{value}</div>
            <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: isFirst ? 'rgba(255,255,255,0.7)' : T.muted
            }}>{title}</div>
        </div>
    );
};

const SectionDivider = ({ title, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, marginTop: 12 }}>
        <div style={{ width: 4, height: 22, borderRadius: 4, background: `linear-gradient(to bottom, ${T.accent}, ${T.accent2})`, flexShrink: 0 }} />
        <div>
            <h2 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.3px' }}>{title}</h2>
            {sub && <p style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '2px 0 0' }}>{sub}</p>}
        </div>
    </div>
);

const StoreDashboard = () => {
    const { selectedBranch } = useBranchContext();
    const navigate = useNavigate();
    const { role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('pos');

    const fetchData = async () => {
        try {
            setLoading(true);
            const branchParam = selectedBranch === 'all' ? 'all' : selectedBranch;
            const statsData = await getStoreStats({ branchId: branchParam });
            setData(statsData);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [selectedBranch]);

    if (loading || !data) return (
        <div style={{
            background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', gap: 16,
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes spin { to { transform: rotate(360deg) } }
            `}</style>
            <div style={{
                width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent,
                borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', margin: 0, textTransform: 'uppercase' }}>
                Initializing Store Ecosystem...
            </p>
        </div>
    );

    const { stats, recentTransactions, orders } = data;
    const basePath = role === 'SUPER_ADMIN' ? '/superadmin/store' : '/branchadmin/store';

    return (
        <div style={{
            background: T.bg, minHeight: '100vh', padding: '28px 28px 48px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            animation: 'fadeUp 0.38s ease both'
        }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                
                .grid-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                .grid-main { display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start; }
                
                @media (max-width: 1280px) {
                    .grid-stats { grid-template-columns: repeat(2, 1fr); }
                    .grid-main { grid-template-columns: 1fr; }
                }
                @media (max-width: 640px) {
                    .grid-stats { grid-template-columns: 1fr; }
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 16px; padding: 16px 18px !important; }
                    .hide-mobile { display: none; }
                    .table-row { grid-template-columns: 1fr !important; gap: 10px; padding: 16px !important; border-bottom: 4px solid ${T.bg} !important; position: relative; }
                }
            `}</style>

            <HeaderBanner 
                title="Store Operations"
                sub="Inventory tracking, POS history & multi-channel commerce"
                icon={ShoppingBag}
                actions={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => navigate(`${basePath}/products`)}
                            style={{
                                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12,
                                padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            <Box size={16} /> Products
                        </button>
                        <button
                            onClick={() => navigate(`${basePath}/pos`)}
                            style={{
                                background: '#fff', border: 'none', borderRadius: 12,
                                padding: '10px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                color: T.accent, fontSize: 13, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            <ShoppingCart size={16} strokeWidth={2.5} /> Open POS
                        </button>
                    </div>
                }
            />

            <div className="grid-stats fu1">
                <MetricCard 
                    isFirst={true} title="Total Revenue" 
                    value={`₹${stats.totalRevenue.toLocaleString()}`} 
                    icon={TrendingUp} trend={stats.revenueTrend?.value}
                />
                <MetricCard 
                    title="Stock Value" 
                    value={`₹${stats.stockValue.toLocaleString()}`} 
                    icon={Layers} iconColor={T.blue} iconBg={T.blueLight}
                />
                <MetricCard 
                    title="Gross Profit" 
                    value={`₹${stats.profit.toLocaleString()}`} 
                    icon={IndianRupee} iconColor={T.green} iconBg={T.greenLight}
                    trend={stats.profitTrend?.value}
                />
                <MetricCard 
                    title="Inventory Alerts" 
                    value={stats.lowStockCount} 
                    icon={AlertTriangle} 
                    iconColor={stats.lowStockCount > 0 ? T.rose : T.green} 
                    iconBg={stats.lowStockCount > 0 ? T.roseLight : T.greenLight}
                />
            </div>

            <div className="grid-main fu2">
                {/* ──────── RECENT TRANSACTIONS ──────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionDivider title="Direct Ledger" sub="Live transaction stream" />
                    {recentTransactions.map((tx, idx) => (
                        <div 
                            key={idx}
                            style={{
                                background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`,
                                padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                boxShadow: '0 2px 8px rgba(124,92,252,0.05)', transition: '0.2s', cursor: 'pointer'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(124,92,252,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,92,252,0.05)'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ 
                                    width: 40, height: 40, borderRadius: 12, background: T.bg, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent 
                                }}>
                                    <ReceiptText size={20} strokeWidth={2.2} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Order #{tx.id.slice(-6).toUpperCase()}</div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        {tx.itemsCount} Items • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>₹{parseFloat(tx.amount).toLocaleString()}</div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: T.green, textTransform: 'uppercase' }}>{tx.status}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ──────── TABS SECTION ──────── */}
                <div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                        {['pos', 'orders', 'products'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '8px 18px', borderRadius: 10, fontSize: 11, fontWeight: 800,
                                    textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', transition: '0.2s',
                                    background: activeTab === tab ? T.accentLight : 'transparent',
                                    color: activeTab === tab ? T.accent : T.muted,
                                    border: `1.5px solid ${activeTab === tab ? T.accentMid : 'transparent'}`,
                                }}
                            >
                                {tab === 'pos' ? 'POS History' : tab === 'orders' ? 'Store Orders' : 'Core Catalog'}
                            </button>
                        ))}
                    </div>

                    <div style={{
                        background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`,
                        boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden'
                    }}>
                        {activeTab === 'pos' && (
                            <div style={{ width: '100%' }}>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 120px',
                                    padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}`
                                }} className="hide-mobile">
                                    {['Ref ID', 'Customer/Member', 'Amount', 'Status', 'Timestamp'].map(h => (
                                        <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                                    ))}
                                </div>
                                <div style={{ minHeight: 300 }}>
                                    {orders.length > 0 ? orders.map((o, i) => (
                                        <div 
                                            key={o.id}
                                            style={{
                                                display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 120px',
                                                padding: '16px 22px', borderBottom: i < orders.length - 1 ? `1px solid ${T.border}` : 'none',
                                                alignItems: 'center', transition: '0.1s'
                                            }}
                                            className="table-row"
                                            onMouseEnter={e => { e.currentTarget.style.background = T.bg; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, fontFamily: 'monospace' }}>#{o.id.toString().padStart(5, '0')}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 8, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                                                    <User size={14} />
                                                </div>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{o.memberName || 'Guest Checkout'}</span>
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>₹{parseFloat(o.totalAmount).toLocaleString()}</div>
                                            <div>
                                                <span style={{ 
                                                    fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                                                    padding: '4px 10px', borderRadius: 20, 
                                                    background: o.status === 'Completed' ? T.greenLight : T.amberLight,
                                                    color: o.status === 'Completed' ? T.green : T.amber,
                                                    border: `1px solid ${o.status === 'Completed' ? '#A7F3D0' : '#FDE68A'}`
                                                }}>{o.status}</span>
                                            </div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                            <p style={{ fontSize: 13, color: T.muted, fontStyle: 'italic' }}>No session records found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(activeTab === 'orders' || activeTab === 'products') && (
                            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                                <div style={{ 
                                    width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                                }}>
                                    <Package size={24} color={T.subtle} />
                                </div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>Inventory Gateway</h3>
                                <p style={{ fontSize: 11, color: T.subtle, italic: true }}>Please navigate to {activeTab} list for full synchronization</p>
                                <button 
                                    onClick={() => navigate(`${basePath}/${activeTab}`)}
                                    style={{
                                        marginTop: 18, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                                        border: 'none', borderRadius: 10, padding: '8px 20px', color: '#fff',
                                        fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                                    }}
                                >
                                    Enter Gateway <ArrowRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreDashboard;
