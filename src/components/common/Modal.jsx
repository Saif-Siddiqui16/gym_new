import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF',
  text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC',
};

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    maxWidth = '500px',
    showCloseButton = true 
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => {
                setVisible(false);
                setIsAnimating(false);
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible && !isOpen) return null;

    const getWidth = (w) => {
        if (w.includes('max-w-sm')) return '384px';
        if (w.includes('max-w-md')) return '448px';
        if (w.includes('max-w-lg')) return '512px';
        if (w.includes('max-w-xl')) return '576px';
        if (w.includes('max-w-2xl')) return '672px';
        return w;
    };

    const widthValue = getWidth(maxWidth);

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', p: '20px'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalZoomIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .modal-overlay {
                    position: absolute; inset: 0; background: rgba(13, 10, 31, 0.6);
                    backdrop-filter: blur(12px); transition: opacity 300ms ease-out;
                }
                .modal-content {
                    position: relative; width: 95%; max-width: ${widthValue};
                    background: ${T.surface}; border-radius: 40px; border: 1px solid rgba(255,255,255,0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden; transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
            `}</style>
            
            <div 
                className="modal-overlay"
                style={{ opacity: isOpen ? 1 : 0 }}
                onClick={onClose}
            />
            
            <div 
                className="modal-content"
                style={{ 
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)'
                }}
            >
                {title && (
                    <div style={{
                        padding: '24px 32px', borderBottom: `1px solid ${T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {title}
                        </h3>
                        {showCloseButton && (
                            <button onClick={onClose} style={{
                                width: '40px', height: '40px', borderRadius: '16px', border: `1px solid ${T.border}`,
                                background: T.bg, color: T.subtle, cursor: 'pointer', transition: '0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.accentLight; e.currentTarget.style.color = T.accent; }}
                                onMouseLeave={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.subtle; }}
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                )}

                <div style={{ position: 'relative' }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
