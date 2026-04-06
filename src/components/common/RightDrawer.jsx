import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        // primary purple
  accent2: '#9B7BFF',       // lighter purple
  accentLight: '#F0ECFF',   // purple tint bg
  accentMid: '#E4DCFF',     // purple border/focus
  border: '#EAE7FF',        // default borders
  bg: '#F6F5FF',            // page background
  surface: '#FFFFFF',       // card/input surface
  text: '#1A1533',          // primary text
  muted: '#7B7A8E',         // secondary text
  subtle: '#B0ADCC',        // subtle icons/placeholders
};

const RightDrawer = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    maxWidth = '600px', // Switched to explicit px value
    showHeader = true
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => {
                setVisible(false);
                setIsAnimating(false);
                document.body.style.overflow = '';
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible && !isOpen) return null;

    // Map Tailwind max-width classes to px if strings are provided
    const getWidth = (w) => {
        if (w.includes('max-w-xl')) return '576px';
        if (w.includes('max-w-2xl')) return '672px';
        if (w.includes('max-w-3xl')) return '768px';
        if (w.includes('max-w-4xl')) return '896px';
        return w; // Assume it's already a px/rem string
    };

    const widthValue = getWidth(maxWidth);

    return createPortal(
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            justifyContent: 'flex-end',
            overflow: 'hidden',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                .drawer-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(13, 10, 31, 0.4);
                    backdrop-filter: blur(4px);
                    transition: opacity 300ms ease-out;
                }
                .drawer-content {
                    position: relative;
                    width: 100%;
                    max-width: ${widthValue};
                    height: 100vh;
                    background: ${T.surface};
                    box-shadow: -10px 0 40px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
            `}</style>

            {/* Backdrop */}
            <div 
                className="drawer-overlay"
                style={{ opacity: isOpen ? 1 : 0 }}
                onClick={onClose}
            />

            {/* Side Panel */}
            <div 
                className="drawer-content"
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
            >
                {/* Header */}
                {showHeader && (
                    <div style={{
                        padding: '24px 32px',
                        borderBottom: `1px solid ${T.border}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 10
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 900,
                                color: T.text,
                                margin: 0,
                                letterSpacing: '-0.5px'
                            }}>
                                {title}
                            </h2>
                            {subtitle && (
                                <p style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    color: T.muted,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginTop: '8px'
                                }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={onClose}
                            style={{
                                padding: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '50%',
                                color: T.subtle,
                                cursor: 'pointer',
                                transition: '0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.text; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.subtle; }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: showHeader ? '24px 32px' : '0',
                    background: T.bg
                }}>
                    <div style={{
                        background: T.surface,
                        borderRadius: '24px',
                        border: `1px solid ${T.border}`,
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(124,92,252,0.04)'
                    }}>
                        {children}
                    </div>
                </div>

                {/* Footer */}
                {footer && (
                    <div style={{
                        padding: '20px 32px',
                        borderTop: `1px solid ${T.border}`,
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 10
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default RightDrawer;
