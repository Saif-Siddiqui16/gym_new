import React, { useState, useEffect, useCallback } from 'react';
import { 
    Gift, Users, UserPlus, CheckCircle, Clock, TrendingUp, Plus, Search, X, 
    Phone, Mail, Loader, ChevronRight, CheckCircle2, UserCheck, Inbox, ArrowUpRight
} from 'lucide-react';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-hot-toast';
import RightDrawer from '../../../components/common/RightDrawer';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF',
  shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s ease' },
    input: { width: '100%', height: 48, borderRadius: 15, border: `2.5px solid ${T.bg}`, background: T.bg, padding: '0 20px', fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: '0.3s', outline: 'none' },
    th: { padding: '24px 32px', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'left', borderBottom: `1px solid ${T.border}` }
};

const ReferralSettings = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [referrerVerified, setReferrerVerified] = useState(null);

    const [formData, setFormData] = useState({ referredName: '', phone: '', email: '', referrerId: '' });

    const fetchReferrals = useCallback(async () => {
        try { setLoading(true); const res = await apiClient.get('/referrals'); setReferrals(res.data || []); } 
        catch (err) { toast.error('Failed to load referrals'); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

    const handleVerifyReferrer = async () => {
        if (!formData.referrerId.trim()) return;
        try {
            setVerifying(true);
            const res = await apiClient.get(`/referrals/verify/${formData.referrerId.trim()}`);
            if (res.data.valid) { setReferrerVerified(res.data.referrerName); toast.success(`Referrer: ${res.data.referrerName}`); } 
            else { setReferrerVerified(null); toast.error('No member found'); }
        } catch { toast.error('Verification failed'); } finally { setVerifying(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.referredName || !formData.phone) { toast.error('Required fields missing'); return; }
        try {
            setSubmitting(true);
            await apiClient.post('/referrals', formData);
            toast.success('Referral created'); setFormData({ referredName: '', phone: '', email: '', referrerId: '' }); setReferrerVerified(null); setShowForm(false); fetchReferrals();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); } finally { setSubmitting(false); }
    };

    const filtered = referrals.filter(r =>
        r.referredName?.toLowerCase().includes(search.toLowerCase()) ||
        r.referrerName?.toLowerCase().includes(search.toLowerCase()) ||
        r.phone?.includes(search)
    );

    const stats = {
        total: referrals.length,
        converted: referrals.filter(r => r.status === 'Converted').length,
        pending: referrals.filter(r => r.status === 'Pending').length,
        rate: referrals.length > 0 ? Math.round((referrals.filter(r => r.status === 'Converted').length / referrals.length) * 100) : 0
    };

    return (
        <div style={{ fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.15s }
                input::placeholder { color: ${T.subtle}; opacity: 0.8; }
            `}</style>

            {/* Premium Header Banner (Compact Version) */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`, position: 'relative'
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: T.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 10px 25px -8px ${T.accent}80`
                    }}>
                        <Gift size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>Referral Program</h1>
                        <p style={{ margin: '4px 0 0', color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Configure rewards for members who refer new members</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowForm(true)}
                    style={{ 
                        height: 52, padding: '0 32px', borderRadius: 16, 
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accent3})`, 
                        color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, 
                        textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, 
                        boxShadow: `0 10px 25px -8px ${T.accent}80`, transition: '0.3s'
                    }}
                >
                    <Plus size={18} strokeWidth={3} /> Add Referral
                </button>
            </div>

            {/* Stats Cards (Compact Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 28 }} className="fu1">
                {[
                    { label: 'Total Referrals', value: stats.total, icon: Users, bg: '#F5F3FF', color: '#7C5CFC' },
                    { label: 'Converted', value: stats.converted, icon: CheckCircle2, bg: '#ECFDF5', color: '#10B981' },
                    { label: 'Pending', value: stats.pending, icon: Clock, bg: '#FFFBEB', color: '#F59E0B' },
                    { label: 'Conversion Rate', value: `${stats.rate}%`, icon: TrendingUp, bg: '#EFF6FF', color: '#3B82F6' },
                ].map((s) => (
                    <div key={s.label} style={{ background: '#fff', borderRadius: 28, padding: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <s.icon size={20} strokeWidth={2.5} />
                        </div>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
                        <p style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 900, color: T.text }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Data Table Area (Compact) */}
            <div style={{ background: '#fff', borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, overflow: 'hidden' }} className="fu2">
                <div style={{ padding: '24px 32px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                         <div style={{ width: 10, height: 10, borderRadius: 3, background: T.accent }} />
                         <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: T.text }}>All Referrals</h2>
                    </div>
                    <div style={{ position: 'relative', width: 320 }}>
                        <Search size={18} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                        <input style={{ ...S.input, height: 48, paddingLeft: 52, borderRadius: 14 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                <th style={S.th}>Referred Person</th>
                                <th style={S.th}>Referrer Source</th>
                                <th style={S.th}>Contact Meta</th>
                                <th style={S.th}>Funnel Status</th>
                                <th style={S.th}>Registered On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: 120, textAlign: 'center' }}><Loader size={32} className="animate-spin" style={{ color: T.accent, margin: '0 auto' }} /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: 120, textAlign: 'center' }}>
                                        <Inbox size={64} color={T.subtle} style={{ opacity: 0.3, marginBottom: 20 }} />
                                        <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: T.subtle }}>No referrals documented yet</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((r) => (
                                    <tr key={r.id} style={{ borderBottom: `1px solid ${T.border}`, transition: '0.15s' }}>
                                        <td style={{ padding: '16px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: T.accent, fontSize: 14 }}>{(r.referredName || '?')[0]}</div>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{r.referredName}</div>
                                                    {r.email && <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle }}>{r.email}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 32px' }}>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }} />
                                                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{r.referrerName || 'Legacy Sync'}</div>
                                             </div>
                                             {r.referrerId && <div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginLeft: 14 }}>ID: {r.referrerId}</div>}
                                        </td>
                                        <td style={{ padding: '16px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: T.muted }}><Phone size={12} opacity={0.5} /> {r.phone}</div>
                                        </td>
                                        <td style={{ padding: '16px 32px' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, 
                                                background: r.status === 'Converted' ? T.greenLight : T.amberLight,
                                                color: r.status === 'Converted' ? T.green : T.amber
                                            }}>
                                                <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.status}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 32px' }}>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: T.muted }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Drawer - Add Referral */}
            <RightDrawer isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Referral" subtitle="Record a direct member referral for rewards">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>Referrer's Member ID</label>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <input style={{ ...S.input, flex: 1 }} placeholder="e.g. MBR123" value={formData.referrerId} onChange={e => { setFormData({ ...formData, referrerId: e.target.value }); setReferrerVerified(null); }} />
                            <button type="button" onClick={handleVerifyReferrer} disabled={verifying || !formData.referrerId} style={{ height: 60, padding: '0 24px', borderRadius: 20, background: T.bg, border: 'none', color: T.accent, fontWeight: 900, fontSize: 12, textTransform: 'uppercase', cursor: 'pointer' }}>{verifying ? '...' : 'Verify'}</button>
                        </div>
                        {referrerVerified && <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: T.green }}>Verified: {referrerVerified}</div>}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>Referred Person's Name</label>
                        <input style={S.input} value={formData.referredName} onChange={e => setFormData({ ...formData, referredName: e.target.value })} required placeholder="Full Name" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>Phone</label>
                            <input style={S.input} type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required placeholder="Phone Number" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>Email</label>
                            <input style={S.input} type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Email (Optional)" />
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} style={{ height: 64, borderRadius: 22, background: T.accent, color: '#fff', border: 'none', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: T.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
                        {submitting ? <Loader className="animate-spin" size={20} /> : <Gift size={20} />} {submitting ? 'Creating...' : 'Create Referral Record'}
                    </button>
                </form>
            </RightDrawer>
        </div>
    );
};

export default ReferralSettings;
