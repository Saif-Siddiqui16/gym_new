import React, { useState, useEffect } from 'react';
import { Plus, Award, Users, CheckCircle, Clock, Link as LinkIcon, Gift, Copy, MessageCircle, UserPlus, Share2, IndianRupee, UserCheck, History, Shield, User, ArrowLeft, Loader2, X, ChevronRight } from 'lucide-react';
import { referralApi } from '../../../api/referralApi';
import { useBranchContext } from '../../../context/BranchContext';
import { getMembers } from '../../../api/manager/managerApi';
import { ROLES } from '../../../config/roles';
import toast from 'react-hot-toast';
import apiClient from '../../../api/apiClient';
import { getTenantSettings } from '../../../api/admin/settingsApi';
import { useNavigate } from 'react-router-dom';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: '#FFF', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    input: { height: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${T.border}`, fontSize: '14px', fontWeight: '600', color: T.text, outline: 'none', transition: 'all 0.2s ease', background: '#FFF' },
    btn: { height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

const Referrals = ({ role }) => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const [referrals, setReferrals] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(role !== ROLES.MEMBER);
    const [activeTab, setActiveTab] = useState('Referrals');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(500);
    const [formData, setFormData] = useState({ referrerId: '', referredName: '', phone: '', email: '' });

    // Member Specific
    const [memberCode, setMemberCode] = useState('MEM000');
    const [memberStats, setMemberStats] = useState({ referralsSent: 0, successfulSignups: 0, rewardsEarned: 0 });
    const [memberReferrals, setMemberReferrals] = useState([]);

    useEffect(() => {
        if (role === ROLES.MEMBER) fetchMemberData();
        else { loadReferrals(); loadMembers(); loadSettings(); }
    }, [selectedBranch, role]);

    const loadSettings = async () => { try { const d = await getTenantSettings(); if (d.referralReward) setRewardAmount(d.referralReward); } catch { } };
    const loadMembers = async () => { try { const r = await getMembers({ branchId: selectedBranch, limit: 1000, filters: { status: 'Active' } }); setMembers(r?.data || []); } catch { } };
    const loadReferrals = async () => { try { setLoading(true); const d = await referralApi.getAllReferrals(selectedBranch !== 'all' ? { branchId: selectedBranch } : {}); setReferrals(Array.isArray(d) ? d : []); } finally { setLoading(false); } };
    const fetchMemberData = async () => { try { setLoading(true); const r = await apiClient.get('/member/referrals'); setMemberCode(r.data.referralCode || 'MEM000'); setMemberReferrals(r.data.referrals || []); setMemberStats(r.data.stats || {}); } finally { setLoading(false); } };

    const handleCreate = async (e) => {
        e.preventDefault();
        try { await referralApi.createReferral({ ...formData, branchId: selectedBranch }); toast.success('Referral logged'); setIsDrawerOpen(false); loadReferrals(); }
        catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    if (role === ROLES.MEMBER) return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
             <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
             <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: T.accent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.2)' }}><Gift size={32} /></div>
                <div><h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Refer & Earn</h1><p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Invite your tribe and unlock premium gym rewards</p></div>
             </div>

             <div style={{ ...S.card, padding: '48px', textAlign: 'center', background: `linear-gradient(135deg, #FFF 0%, ${T.bg} 100%)`, position: 'relative', overflow: 'hidden', marginBottom: '40px' }}>
                <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.05 }}><Gift size={240} /></div>
                <p style={{ fontSize: '11px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Your Exclusive Invite Code</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', background: '#FFF', padding: '16px 32px', borderRadius: '20px', border: `2px dashed ${T.accentMid}`, marginBottom: '32px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '900', color: T.text, letterSpacing: '4px' }}>{memberCode}</span>
                    <button onClick={() => { navigator.clipboard.writeText(memberCode); toast.success('Copied!'); }} style={{ background: T.bg, border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.accent }}><Copy size={20} /></button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <button onClick={() => window.open(`https://wa.me/?text=Join me at the gym! Code: ${memberCode}`, '_blank')} style={{ ...S.btn, background: '#25D366', color: '#FFF', padding: '0 32px', height: '52px', borderRadius: '16px' }}><MessageCircle size={20} /> Share on WhatsApp</button>
                    <button onClick={() => { navigator.clipboard.writeText(`Join Roar Fitness! Code: ${memberCode}`); toast.success('Link ready to share!'); }} style={{ ...S.btn, background: T.accent, color: '#FFF', padding: '0 32px', height: '52px', borderRadius: '16px' }}><Share2 size={20} /> Copy Invite Link</button>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                    { label: 'Invites Sent', val: memberStats.referralsSent || 0, icon: Users, color: T.accent },
                    { label: 'Conversions', val: memberStats.successfulSignups || 0, icon: UserCheck, color: T.success },
                    { label: 'Rewards Earned', val: `₹${memberStats.rewardsEarned || 0}`, icon: IndianRupee, color: '#2563EB' },
                    { label: 'Pending Payout', val: `₹${memberStats.pendingRewards || 0}`, icon: Clock, color: '#D97706' }
                ].map((s, i) => (
                    <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={22} /></div>
                        <div><p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0 }}>{s.label}</p><h2 style={{ fontSize: '22px', fontWeight: '900', color: T.text, margin: 0 }}>{s.val}</h2></div>
                    </div>
                ))}
             </div>

             <div style={S.card}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}` }}><h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: 0 }}>Referral Timeline</h3></div>
                <div style={{ padding: '24px' }}>
                    {memberReferrals.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', opacity: 0.5 }}><Users size={48} color={T.subtle} /><p style={{ fontSize: '14px', fontWeight: '800', color: T.subtle, marginTop: '12px', margin: 0 }}>Your circle is waiting to join!</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {memberReferrals.map((r, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: T.bg, borderRadius: '16px', border: `1px solid ${T.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}><User size={20} /></div>
                                        <div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{r.referredName}</p><p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, margin: 0 }}>{new Date(r.createdAt).toLocaleDateString()}</p></div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <div style={{ textAlign: 'right' }}><p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0 }}>Reward</p><p style={{ fontSize: '14px', fontWeight: '900', color: T.accent, margin: 0 }}>₹{r.rewardAmount || rewardAmount}</p></div>
                                        <span style={{ ...S.badge, background: r.status === 'Converted' ? '#ECFDF5' : '#FFFBEB', color: r.status === 'Converted' ? T.success : '#D97706' }}>{r.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
             </div>
        </div>
    );

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
             <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div><h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Growth Loop</h1><p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Manage reward fulfillment and member invitations</p></div>
                <button onClick={() => setIsDrawerOpen(true)} style={{ ...S.btn, background: T.accent, color: '#FFF', height: '48px', padding: '0 24px', borderRadius: '14px' }}><Plus size={18} /> New Entry</button>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                    { label: 'Total Logs', val: referrals.length, icon: Users, color: T.accent },
                    { label: 'Conversions', val: referrals.filter(r => r.status === 'Converted').length, icon: CheckCircle, color: T.success },
                    { label: 'Pending', val: referrals.filter(r => r.status === 'Pending').length, icon: Clock, color: '#D97706' },
                    { label: 'Total Payables', val: `₹${referrals.filter(r => r.status === 'Converted').length * rewardAmount}`, icon: IndianRupee, color: '#2563EB' }
                ].map((s, i) => (
                    <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                         <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={22} /></div>
                         <div><p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0 }}>{s.label}</p><h2 style={{ fontSize: '22px', fontWeight: '900', color: T.text, margin: 0 }}>{s.val}</h2></div>
                    </div>
                ))}
             </div>

             <div style={S.card}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${T.bg}` }}>
                    {['Referrals', 'Rewards Log'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '20px 32px', fontSize: '13px', fontWeight: '800', background: 'transparent', border: 'none', borderBottom: activeTab === (tab === 'Rewards Log' ? 'Rewards' : tab) ? `3px solid ${T.accent}` : 'none', color: activeTab === (tab === 'Rewards Log' ? 'Rewards' : tab) ? T.accent : T.muted, cursor: 'pointer' }}>{tab}</button>)}
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                {['Target Prospect', 'Advocate (Member)', 'Timeline', 'Status', 'Fulfillment'].map(h => <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '80px', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" color={T.accent} /></td></tr>
                            ) : referrals.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '100px' }}><div style={{ opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><Users size={48} color={T.subtle} /><p style={{ fontSize: '14px', fontWeight: '800', color: T.subtle, marginTop: '12px', margin: 0 }}>No records found</p></div></td></tr>
                            ) : (
                                referrals.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${T.bg}` }}>
                                        <td style={{ padding: '16px 24px' }}><div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{r.referredName}</p><p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, margin: 0 }}>{r.phone}</p></div></td>
                                        <td style={{ padding: '16px 24px' }}><p style={{ fontSize: '13px', fontWeight: '700', color: T.text, margin: 0 }}>{r.referrerName || 'Legacy Member'}</p><p style={{ fontSize: '10px', fontWeight: '900', color: T.accent, margin: 0 }}>{r.referrerCode || 'MEM-0'}</p></td>
                                        <td style={{ padding: '16px 24px' }}><span style={{ fontSize: '12px', fontWeight: '700', color: T.muted }}>{new Date(r.createdAt).toLocaleDateString()}</span></td>
                                        <td style={{ padding: '16px 24px' }}><span style={{ ...S.badge, background: r.status === 'Converted' ? '#ECFDF5' : '#FFFBEB', color: r.status === 'Converted' ? T.success : '#D97706' }}>{r.status || 'Pending'}</span></td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {r.status === 'Converted' ? (
                                                r.rewardStatus === 'Claimed' || r.rewardStatus === 'Paid' ? <span style={{ ...S.badge, background: T.bg, color: T.success }}>Fullfilled</span> : <button onClick={() => referralApi.claimReward(r.id).then(loadReferrals)} style={{ ...S.btn, height: '32px', background: T.accent, color: '#FFF', fontSize: '10px' }}>Release Reward</button>
                                            ) : <span style={{ fontSize: '11px', color: T.subtle, fontStyle: 'italic' }}>Pending Join</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
             </div>

             {isDrawerOpen && (
                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(26, 21, 51, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
                    <div style={{ width: '450px', background: '#FFF', height: '100%', padding: '40px', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div><h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>Manual Referral</h2><p style={{ fontSize: '13px', color: T.muted, margin: '4px 0 0' }}>Log an invitation legacy or walk-in lead</p></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Advocate (Member) *</label><select style={{ ...S.input, width: '100%' }} value={formData.referrerId} onChange={e => setFormData({ ...formData, referrerId: e.target.value })}><option value="">Select Referrer</option>{members.map(m => <option key={m.id} value={m.memberId}>{m.name} ({m.memberId})</option>)}</select></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Prospect Name *</label><input style={{ ...S.input, width: '100%' }} value={formData.referredName} onChange={e => setFormData({ ...formData, referredName: e.target.value })} /></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Contact Phone *</label><input style={{ ...S.input, width: '100%' }} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                            <div><label style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email</label><input style={{ ...S.input, width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                             <button onClick={() => setIsDrawerOpen(false)} style={{ ...S.btn, flex: 1, background: T.bg, color: T.text }}>Cancel</button>
                             <button onClick={handleCreate} style={{ ...S.btn, flex: 1, background: T.accent, color: '#FFF' }}>Save Record</button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default Referrals;
