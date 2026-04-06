import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import Modal from './Modal';

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF',
  text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC',
  green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4',
};

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Verify Action',
    message = 'This operation will commit a strategic shift in the system.',
    confirmText = 'Commit Sequence',
    cancelText = 'Abort Cycle',
    type = 'info',
    loading = false
}) => {
    const getThemeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle2 size={42} strokeWidth={2.5} />,
                    color: T.green,
                    bg: T.greenLight,
                    border: '#A7F3D0',
                    gradient: `linear-gradient(135deg, ${T.green}, #10B981)`,
                    btnBg: T.green,
                    btnShadow: 'rgba(16,185,129,0.3)'
                };
            case 'danger':
                return {
                    icon: <AlertCircle size={42} strokeWidth={2.5} />,
                    color: T.rose,
                    bg: T.roseLight,
                    border: '#FECDD3',
                    gradient: `linear-gradient(135deg, ${T.rose}, #EF4444)`,
                    btnBg: T.rose,
                    btnShadow: 'rgba(244,63,94,0.3)'
                };
            default:
                return {
                    icon: <Info size={42} strokeWidth={2.5} />,
                    color: T.accent,
                    bg: T.accentLight,
                    border: T.accentMid,
                    gradient: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                    btnBg: T.accent,
                    btnShadow: 'rgba(124,92,252,0.3)'
                };
        }
    };

    const theme = getThemeConfig();

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="480px" showCloseButton={false}>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ height: '6px', background: theme.gradient, width: '100%', position: 'absolute', top: 0, left: 0 }} />
                
                <div style={{ padding: '48px 40px', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    
                    {/* Icon Assembly */}
                    <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 28px' }}>
                        <div style={{ 
                            position: 'absolute', inset: 0, background: theme.bg, borderRadius: '50%', 
                            animation: 'modalPulse 2s infinite', opacity: 0.3 
                        }} />
                        <div style={{ 
                            position: 'relative', width: '100%', height: '100%', background: theme.bg, 
                            borderRadius: '50%', border: `1.5px solid ${theme.border}`, display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', color: theme.color,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            {theme.icon}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 900, color: T.text, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {title}
                        </h3>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: T.muted, lineHeight: '1.6', margin: 0, padding: '0 10px' }}>
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1, padding: '14px', borderRadius: '16px', background: T.bg, 
                                border: `1px solid ${T.border}`, color: T.muted, fontSize: '11px', 
                                fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', 
                                cursor: 'pointer', transition: '0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.accentLight; e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            style={{
                                flex: 1.6, padding: '14px', borderRadius: '16px', 
                                background: loading ? T.subtle : theme.gradient,
                                border: 'none', color: '#fff', fontSize: '11px', 
                                fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', 
                                cursor: loading ? 'not-allowed' : 'pointer', transition: '0.2s',
                                boxShadow: loading ? 'none' : `0 8px 24px ${theme.btnShadow}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                            onMouseEnter={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { if(!loading) e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {loading ? (
                                <div style={{ width: '16px', height: '16px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'modalPulse 0.8s linear infinite' }} />
                            ) : (
                                <>
                                    <span>{confirmText}</span>
                                    <CheckCircle2 size={14} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Subtle Footer Accent */}
                <div style={{ background: T.bg, padding: '12px', textAlign: 'center', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: T.subtle }} />
                    <span style={{ fontSize: '8px', fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        Roar Fitness • Administrative Verification Protocol
                    </span>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: T.subtle }} />
                </div>
            </div>

            <style>{`
                @keyframes modalPulse { 
                    0% { transform: scale(1); opacity: 0.3; } 
                    50% { transform: scale(1.1); opacity: 0.1; } 
                    100% { transform: scale(1); opacity: 0.3; } 
                }
            `}</style>
        </Modal>
    );
};

export default ConfirmationModal;
