import React, { useState, useEffect } from 'react';
import { Phone, Clock, User, CheckCircle, Search, ExternalLink, Check, Calendar, ArrowRight } from 'lucide-react';
import Loader from '../../../components/common/Loader';
import { useAuth } from '../../../context/AuthContext';
import { crmApi } from '../../../api/crm/crmApi';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: '#FFF', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    btn: { height: '40px', padding: '0 16px', borderRadius: '10px', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

const TodayFollowUps = ({ isWidget = false }) => {
    const [leads, setLeads] = useState([]);
    const [actionDone, setActionDone] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => { fetchFollowUps(); }, []);

    const fetchFollowUps = async () => {
        try { setLoading(true); const data = await crmApi.getTodayFollowUps(); setLeads(data || []); }
        catch { } finally { setLoading(false); }
    };

    const handleAction = async (leadId) => {
        try {
            await crmApi.updateLeadStatus(leadId, 'Contacted');
            setActionDone(leadId);
            setTimeout(() => { setLeads(leads.filter(l => l.id !== leadId)); setActionDone(null); }, 1000);
        } catch { }
    };

    const today = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

    return (
        <div style={{ ...S.card, overflow: 'hidden', fontFamily: S.ff }}>
             <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
             <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(to right, ${T.bg}, #FFF)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.accent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={20} /></div>
                    <div><h3 style={{ fontSize: '14px', fontWeight: '900', color: T.text, margin: 0, textTransform: 'uppercase' }}>Daily Outreach</h3><p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, margin: 0 }}>Roster for {today}</p></div>
                </div>
                <span style={{ ...S.badge, background: T.accentLight, color: T.accent }}>{leads.length} Pending</span>
             </div>

             <div style={{ maxHeight: isWidget ? '400px' : 'none', overflowY: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '60px 0' }}><Loader message="Rostering Followups..." /></div>
                ) : leads.length === 0 ? (
                    <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><Calendar size={48} color={T.subtle} /><p style={{ fontSize: '12px', fontWeight: '800', color: T.subtle, marginTop: '12px', textTransform: 'uppercase', margin: 0 }}>All clear for today</p></div>
                ) : (
                    leads.map((lead, i) => (
                        <div key={i} style={{ padding: '20px 24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: T.bg, border: `2px solid #FFF`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '900', color: T.accent }}>{lead.name?.[0]}</div>
                                <div><h4 style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{lead.name}</h4><div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}><span style={{ fontSize: '11px', color: T.muted, display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={10} /> {lead.phone}</span><span style={{ fontSize: '11px', color: T.muted, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> {lead.followUpTime || '10:00 AM'}</span></div></div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <a href={`tel:${lead.phone}`} style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.bg, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}><Phone size={16} /></a>
                                <button onClick={() => handleAction(lead.id)} style={{ ...S.btn, background: actionDone === lead.id ? T.success : '#FFF', color: actionDone === lead.id ? '#FFF' : T.text, border: actionDone === lead.id ? 'none' : `1px solid ${T.border}`, width: '140px' }}>{actionDone === lead.id ? <><Check size={14} /> Done</> : <><CheckCircle size={14} /> Contacted</>}</button>
                            </div>
                        </div>
                    ))
                )}
             </div>

             {!isWidget && (
                <div style={{ padding: '16px', textAlign: 'center', background: T.bg }}>
                    <button style={{ background: 'transparent', border: 'none', color: T.accent, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>Analysis & History <ArrowRight size={14} /></button>
                </div>
             )}
        </div>
    );
};

export default TodayFollowUps;
