import React, { useState, useEffect } from 'react';
import { Search, Filter, Ticket, Plus, Edit2, Trash2, ChevronRight, Zap, CheckCircle2, XCircle, Timer, BarChart3, MoreVertical, Percent } from 'lucide-react';
import { getCoupons, deleteCoupon, getCouponStats } from '../../api/storeApi';
import CouponDrawer from './CouponDrawer';
import { toast } from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', rose: '#FF4D4D', roseLight: '#FFF0F0',
    emerald: '#00C853', emeraldLight: '#E8FBF2', amber: '#FF9800', amberLight: '#FFF4E5',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)',
    ff: "'Plus Jakarta Sans', sans-serif"
};

const HeaderBanner = ({ title, subTitle, icon: Icon }) => (
    <div style={{
        background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
        borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '24px',
        marginBottom: '32px', boxShadow: '0 20px 40px -15px rgba(124, 92, 252, 0.3)',
        position: 'relative', overflow: 'hidden'
    }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '16px', color: '#FFFFFF' }}><Icon size={28} strokeWidth={2.5} /></div>
        <div><h1 style={{ fontSize: '28px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>{title}</h1><p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600', margin: '4px 0 0' }}>{subTitle}</p></div>
    </div>
);

const MetricCard = ({ label, value, icon: Icon, color, bg }) => (
    <div style={{ background: T.surface, padding: '24px', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={24} /></div>
        <div>
            <p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{label}</p>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>{value}</h2>
        </div>
    </div>
);

const Coupons = () => {
    const { selectedBranch } = useBranchContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState('add');
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });
    const [stats, setStats] = useState({ totalCoupons: 0, activeCoupons: 0, expiredCoupons: 0, totalRedemptions: 0 });

    const fetchData = async () => {
        setLoading(true);
        try {
            const branchParam = selectedBranch === 'all' ? 'all' : selectedBranch;
            const [couponsData, statsData] = await Promise.all([
                getCoupons({ search: searchTerm, status: statusFilter, branchId: branchParam }),
                getCouponStats({ branchId: branchParam })
            ]);
            setCoupons(couponsData);
            setStats(statsData);
        } catch (error) { toast.error('Failed to load coupons'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => { fetchData(); }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, selectedBranch]);

    const handleEdit = (coupon) => { setSelectedCoupon(coupon); setDrawerMode('edit'); setIsDrawerOpen(true); };
    const handleAdd = () => { setSelectedCoupon(null); setDrawerMode('add'); setIsDrawerOpen(true); };
    const handleAction = (id) => { setConfirmModal({ isOpen: true, id, loading: false }); };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deleteCoupon(confirmModal.id);
            toast.success('Coupon deleted');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchData();
        } catch (error) {
            toast.error(error || 'Failed to delete');
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const statsCards = [
        { label: 'Total Coupons', value: stats.totalCoupons, icon: Ticket, color: T.accent, bg: T.accentLight },
        { label: 'Active Codes', value: stats.activeCoupons, icon: Zap, color: T.amber, bg: T.amberLight },
        { label: 'Expired', value: stats.expiredCoupons, icon: Timer, color: T.rose, bg: T.roseLight },
        { label: 'Total Redemptions', value: stats.totalRedemptions, icon: BarChart3, color: T.emerald, bg: T.emeraldLight },
    ];

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px', fontFamily: T.ff }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ borderLeft: `4px solid ${T.accent}`, paddingLeft: '12px' }}>
                    <h1 style={{ fontSize: '14px', fontWeight: '900', color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Coupons</h1>
                </div>
                <button onClick={handleAdd} style={{
                    padding: '12px 24px', background: T.accent, color: '#FFFFFF', borderRadius: '16px', border: 'none',
                    fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    boxShadow: '0 10px 20px -5px rgba(124, 92, 252, 0.2)'
                }}><Plus size={18} /> CREATE COUPON</button>
            </div>

            <HeaderBanner title="Manage Coupons" subTitle="Create and distribute promo codes for memberships and products" icon={Percent} />

            {/* Metrics removed to match original data layout */}

            <div style={{ background: T.surface, borderRadius: '24px', boxShadow: T.cardShadow, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search coupon code..." style={{
                            width: '100%', padding: '12px 16px 12px 48px', background: T.bg, border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '600', color: T.text, outline: 'none'
                        }} />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.bg, textAlign: 'left' }}>
                                {['Coupon', 'Discount', 'Settings', 'Usage', 'Validity', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center' }}>
                                    <div className="animate-spin" style={{ width: '30px', height: '30px', border: `3px solid ${T.accentLight}`, borderTopColor: T.accent, borderRadius: '50%', margin: '0 auto 12px' }} />
                                    <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted }}>LOADING COUPONS...</p>
                                </td></tr>
                            ) : coupons.length > 0 ? (
                                coupons.map(c => (
                                    <tr key={c.id} style={{ borderBottom: `1px solid ${T.bg}` }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ticket size={20} /></div>
                                                <div>
                                                    <p style={{ fontSize: '14px', fontWeight: '900', color: T.text, margin: 0 }}>{c.code}</p>
                                                    <p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, margin: 0 }}>{c.tenant?.name || 'Main Branch'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ fontSize: '13px', fontWeight: '800', color: T.text, margin: 0 }}>{c.type === 'Percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}</p>
                                            <p style={{ fontSize: '10px', fontWeight: '700', color: T.muted, margin: 0 }}>Min: ₹{c.minPurchase}</p>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '9px', fontWeight: '800', background: T.bg, color: T.muted, padding: '2px 8px', borderRadius: '6px', width: 'fit-content' }}>{c.applicableService}</span>
                                                <span style={{ fontSize: '9px', fontWeight: '800', background: T.accentLight, color: T.accent, padding: '2px 8px', borderRadius: '6px', width: 'fit-content' }}>{c.visibilityType}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ fontSize: '12px', fontWeight: '800', color: T.text, margin: 0 }}>{c.usedCount} / {c.maxUses || '∞'}</p>
                                            <div style={{ width: '80px', height: '4px', background: T.bg, borderRadius: '2px', marginTop: '6px' }}>
                                                <div style={{ width: `${Math.min((c.usedCount / (c.maxUses || 100)) * 100, 100)}%`, height: '100%', background: T.accent, borderRadius: '2px' }} />
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ fontSize: '12px', fontWeight: '700', color: T.text, margin: 0 }}>{new Date(c.startDate).toLocaleDateString()}</p>
                                            <p style={{ fontSize: '10px', fontWeight: '600', color: T.muted, margin: 0 }}>{c.endDate ? `TO ${new Date(c.endDate).toLocaleDateString()}` : 'No Expiry'}</p>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ 
                                                padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase',
                                                background: c.status === 'Active' ? T.emeraldLight : T.roseLight,
                                                color: c.status === 'Active' ? T.emerald : T.rose
                                            }}>{c.status}</span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleEdit(c)} style={{ width: '36px', height: '36px', background: T.bg, border: 'none', color: T.accent, borderRadius: '10px', display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer' }}><Edit2 size={16} style={{ display: 'block' }} /></button>
                                                <button onClick={() => handleAction(c.id)} style={{ width: '36px', height: '36px', background: T.roseLight, border: 'none', color: T.rose, borderRadius: '10px', display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer' }}><Trash2 size={16} style={{ display: 'block' }} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" style={{ padding: '100px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', background: T.bg, borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, marginBottom: '20px' }}><Ticket size={40} /></div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: '0 0 4px' }}>No codes found</h3>
                                        <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginBottom: '24px' }}>Kickstart your campaigns with your first coupon code.</p>
                                        <button onClick={handleAdd} style={{ padding: '12px 24px', background: T.accent, color: '#FFF', borderRadius: '14px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>START CREATING</button>
                                    </div>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CouponDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} coupon={selectedCoupon} mode={drawerMode} onSuccess={fetchData} />
            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} onConfirm={processDelete} title="Delete Coupon?" message="This action is permanent and cannot be undone." confirmText="Delete" type="danger" loading={confirmModal.loading} />
        </div>
    );
};

export default Coupons;
