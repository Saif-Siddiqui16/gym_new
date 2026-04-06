import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, ChevronRight, Loader2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';

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
  blueLight: '#EFF6FF'
};

const TodayFollowUpsWidget = () => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFollowUps();
    }, [selectedBranch]);

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/crm/followups/today', {
                params: { branchId: selectedBranch }
            });
            setFollowUps(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Fetch today followups error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ background: T.surface, borderRadius: 30, border: `1px solid ${T.border}`, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                <Loader2 size={32} color={T.accent} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ background: T.surface, borderRadius: 30, border: `1px solid ${T.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', transition: '0.3s' }}>
            <style>{`
                @keyframes fadeUpItem { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
                .followup-item { animation: fadeUpItem 0.4s ease both; }
            `}</style>

            <div style={{ padding: '24px 30px', borderBottom: `1px solid ${T.border}`, background: 'rgba(0,0,0,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px rgba(124,92,252,0.2)` }}>
                        <Calendar size={22} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.3px' }}>Today's Follow-ups</h3>
                        <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                             <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
                             {followUps.length} Pending Actions
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/crm/pipeline')}
                    style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: `1px solid ${T.border}`, color: T.subtle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.accentMid; }}
                    onMouseOut={e => { e.currentTarget.style.color = T.subtle; e.currentTarget.style.borderColor = T.border; }}
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                {followUps.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {followUps.map((lead, i) => (
                            <div 
                                key={lead.id} 
                                onClick={() => navigate('/crm/pipeline')}
                                className="followup-item"
                                style={{
                                    padding: '16px 20px', borderRadius: 18, border: `1px solid ${T.border}`, background: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                                    transition: 'all 0.2s', animationDelay: `${i * 0.05}s`
                                }}
                                onMouseOver={e => { e.currentTarget.style.borderColor = T.accentMid; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                                onMouseOut={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>
                                        {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: 13, fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase' }}>{lead.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: T.muted }}>
                                                <Phone size={10} /> {lead.phone}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: T.accent }}>
                                                <Clock size={10} /> {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.bg, color: T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Phone size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', background: T.bg, borderRadius: 24, border: `2px dashed ${T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 20, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <Users size={28} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase' }}>All Caught Up</p>
                            <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>No follow-ups pending for today</p>
                        </div>
                    </div>
                )}
            </div>

            {followUps.length > 0 && (
                <div style={{ padding: 24, background: 'rgba(0,0,0,0.01)', borderTop: `1px solid ${T.border}` }}>
                    <button
                        onClick={() => navigate('/crm/pipeline')}
                        style={{ width: '100%', height: 44, borderRadius: 12, background: T.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: '0.2s', boxShadow: `0 8px 24px rgba(124,92,252,0.2)` }}
                        onMouseOver={e => { e.currentTarget.style.background = T.accent2; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        View Full Pipeline
                    </button>
                </div>
            )}
        </div>
    );
};

export default TodayFollowUpsWidget;
