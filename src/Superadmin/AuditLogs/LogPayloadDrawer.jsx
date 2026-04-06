import React, { useState } from 'react';
import { Copy, FileJson, Check, Terminal, ExternalLink, Zap, ShieldCheck, Activity, Database, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF',
  text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC',
  green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4',
  amber: '#F59E0B', amberLight: '#FEF3C7',
};

const LogPayloadDrawer = ({ isOpen, onClose, selectedLog }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(selectedLog?.payload || {}, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!selectedLog) return null;

    const pillStyle = {
        background: T.surface, borderRadius: '16px', padding: '16px', border: `1.5px solid ${T.border}`,
        boxShadow: '0 4px 12px rgba(124,92,252,0.04)', flex: 1
    };

    const labelStyle = { fontSize: '9px', fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px', display: 'block' };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100%', background: T.surface,
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
                @keyframes glow { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            `}</style>
            
            {/* ──────── HEADER ──────── */}
            <div style={{ padding: '32px 28px', borderBottom: `1.5px solid ${T.bg}`, background: 'linear-gradient(135deg, #F8F7FF 0%, #FFFFFF 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '14px', background: T.accent, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 16px rgba(124,92,252,0.2)`
                    }}>
                        <Zap size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            {selectedLog.event || 'Log Event'}
                        </h3>
                        <p style={{ fontSize: '10px', fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ShieldCheck size={12} /> ID: {selectedLog.id}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={pillStyle}>
                        <span style={labelStyle}>Status</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: selectedLog.status === 'success' ? T.green : T.rose, animation: 'glow 1.5s infinite' }} />
                            <span style={{ fontSize: '14px', fontWeight: 800, color: selectedLog.status === 'success' ? T.green : T.rose }}>
                                {selectedLog.statusCode || 200} OK
                            </span>
                        </div>
                    </div>
                    <div style={pillStyle}>
                        <span style={labelStyle}>Response Time</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Activity size={14} color={T.accent} />
                            <span style={{ fontSize: '14px', fontWeight: 800, color: T.text }}>124ms</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ──────── PAYLOAD VIEW ──────── */}
            <div style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Terminal size={18} color={T.accent} />
                        <span style={{ fontSize: '11px', fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Raw Payload</span>
                    </div>
                    <button
                        onClick={handleCopy}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: T.bg, 
                            border: `1px solid ${T.border}`, borderRadius: '10px', fontSize: '10px', fontWeight: 800,
                            color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: '0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.accentLight; e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
                    >
                        {copied ? <><Check size={14} color={T.green} strokeWidth={3} /> Copied</> : <><Copy size={12} /> Copy Payload</>}
                    </button>
                </div>

                <div style={{
                    background: '#0D0A1F', borderRadius: '24px', padding: '24px', border: '1.5px solid rgba(124,92,252,0.2)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)', overflowX: 'auto', position: 'relative'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px', fontSize: '8px', color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>JSON_SCH_V2.0</div>
                    <pre style={{
                        margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#B0A7E2',
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 500
                    }}>
                        {JSON.stringify(selectedLog.payload || {
                            "event": "membership.created",
                            "timestamp": "2024-03-20T10:30:15Z",
                            "data": {
                                "id": "MEM_29381",
                                "name": "Rahul Sharma",
                                "plan": "Elite Monthly",
                                "payment": { "status": "captured", "method": "upi", "amount": 2500 }
                            },
                            "metadata": { "source": "ios_app", "version": "4.2.0" }
                        }, null, 4)}
                    </pre>
                </div>
            </div>

            {/* ──────── FOOTER ──────── */}
            <div style={{ padding: '28px', borderTop: `1.5px solid ${T.bg}`, background: T.surface, display: 'flex', gap: '12px' }}>
                <button
                    onClick={onClose}
                    style={{
                        flex: 1, padding: '14px', background: T.bg, color: T.muted, borderRadius: '16px',
                        border: `1.5px solid ${T.border}`, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase',
                        letterSpacing: '0.15em', cursor: 'pointer', transition: '0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
                >
                    Dismiss Inspector
                </button>
                <button
                    style={{
                        flex: 1.2, padding: '14px', background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                        color: '#fff', borderRadius: '16px', border: 'none', fontSize: '11px', fontWeight: 900,
                        textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', transition: '0.2s',
                        boxShadow: `0 8px 24px rgba(124,92,252,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <ExternalLink size={14} strokeWidth={3} /> Decouple Asset
                </button>
            </div>
        </div>
    );
};

export default LogPayloadDrawer;
