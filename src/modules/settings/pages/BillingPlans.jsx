import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Loader, RefreshCw, Layers, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { fetchAllGyms } from '../../../api/superadmin/superAdminApi';
import { getInvoices } from '../../../api/finance/invoiceApi';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4',
  shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s ease' },
    input: { width: '100%', height: 48, borderRadius: 16, border: `2.5px solid ${T.bg}`, background: T.bg, padding: '0 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" },
    th: { padding: '16px 20px', fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left', borderBottom: `1px solid ${T.bg}` },
    td: { padding: '14px 20px', fontSize: 13, color: T.text, fontWeight: 700, borderBottom: `1px solid ${T.bg}` }
};

const BillingPlans = () => {
    const [loading, setLoading] = useState(true);
    const [planInfo, setPlanInfo] = useState({ plan: 'Loading...', price: '...', nextBilling: '...', paymentMethod: '...' });
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const gymsData = await fetchAllGyms();
                const currentGym = gymsData.gyms?.[0];
                if (currentGym) {
                    setPlanInfo({
                        plan: currentGym.planName || 'Standard Plan',
                        price: 'Enterprise Flux',
                        nextBilling: 'Coming Soon',
                        paymentMethod: 'Bank Transfer'
                    });
                }
                const invoicesData = await getInvoices();
                setInvoices(invoicesData || []);
            } catch (error) {
                console.error('Core sync failure:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
            <Loader className="animate-spin" style={{ color: T.accent }} size={32} />
        </div>
    );

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '0 0 60px', fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.15s }
                .tab-row:hover { background: rgba(124, 92, 252, 0.015) !important; }
            `}</style>

            {/* Premium Header Banner (Matching White Aesthetic) */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: T.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>
                        <Layers size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>Billing & Subscriptions</h1>
                        <p style={{ margin: '4px 0 0', color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Manage your operational commitment and payment history</p>
                    </div>
                </div>
                <button style={{ height: 48, padding: '0 24px', borderRadius: 14, background: T.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: T.shadow }}>
                    <RefreshCw size={16} /> Upgrade Identity
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, marginBottom: 28 }} className="fu1">
                {/* Current Plan Card */}
                <div style={{ ...S.card, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                             <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Current active cycle</p>
                             <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: T.text, letterSpacing: '-1px' }}>{planInfo.plan}</h2>
                             <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: T.accent }}>{planInfo.price}</span>
                                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.subtle }} />
                                  <span style={{ fontSize: 12, fontWeight: 700, color: T.subtle }}>Billed Annually</span>
                             </div>
                        </div>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <ShieldCheck size={28} />
                        </div>
                    </div>
                    <div style={{ marginTop: 32, padding: '16px 20px', background: T.bg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                         <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.muted }}>NEXT MANIFESTATION DATE</p>
                         <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: T.text }}>{planInfo.nextBilling}</p>
                    </div>
                </div>

                {/* Primary Method Card */}
                <div style={{ ...S.card, padding: 32 }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Identity Verification</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: T.bg, color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{planInfo.paymentMethod}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: 'uppercase' }}>Operational Linked Account</div>
                        </div>
                    </div>
                    <button style={{ width: '100%', height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, background: '#fff', color: T.text, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s' }}>
                        Update Matrix Information
                    </button>
                </div>
            </div>

            {/* Invoices Table Card */}
            <div style={S.card} className="fu2">
                <div style={{ padding: '24px 32px', borderBottom: `1px solid ${T.bg}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={18} color={T.accent} />
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: T.text }}>Emission Logs (Invoices)</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                <th style={S.th}>Manifest ID</th>
                                <th style={S.th}>Cycle Date</th>
                                <th style={S.th}>Quantum Amount</th>
                                <th style={S.th}>Status</th>
                                <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? invoices.map((inv) => (
                                <tr key={inv.id} style={{ transition: '0.2s' }} className="tab-row">
                                    <td style={S.td}><span style={{ color: T.accent }}>#</span> {inv.invoiceNumber || inv.id.slice(-8)}</td>
                                    <td style={{ ...S.td, color: T.muted }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td style={S.td}>₹ {inv.amount}</td>
                                    <td style={S.td}>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                                            background: inv.status === 'Paid' ? T.greenLight : T.roseLight,
                                            color: inv.status === 'Paid' ? T.green : T.rose
                                        }}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td style={{ ...S.td, textAlign: 'right' }}>
                                        <button style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, color: T.text, border: 'none', cursor: 'pointer', transition: '0.2s' }}>
                                            <Download size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px 0', textAlign: 'center', color: T.subtle, fontSize: 13, fontWeight: 700 }}>
                                        No operational logs manifested yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingPlans;

