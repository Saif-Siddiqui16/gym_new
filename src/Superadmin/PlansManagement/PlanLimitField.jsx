import React, { useState } from 'react';
import { Infinity } from 'lucide-react';

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

const PlanLimitField = ({
    label,
    value,
    isUnlimited,
    onChange,
    onToggleUnlimited,
    type = 'number',
    placeholder = '0',
    unit = '',
    options = null, // for dropdowns like 'Per Month'
    unitValue = '',
    onUnitChange = null
}) => {
    const [hover, setHover] = useState(false);

    return (
        <div 
            style={{
                background: isUnlimited ? T.bg : T.surface,
                borderRadius: '20px',
                border: `2px solid ${isUnlimited ? T.border : (hover ? T.accentMid : T.border)}`,
                padding: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isUnlimited ? 0.75 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <label style={{ 
                    fontSize: '11px', 
                    fontWeight: 900, 
                    color: T.muted, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em' 
                }}>
                    {label}
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>Unlimited</span>
                    <label style={{ position: 'relative', width: '36px', height: '20px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={isUnlimited}
                            onChange={(e) => onToggleUnlimited(e.target.checked)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <div style={{ 
                            position: 'absolute', inset: 0,
                            background: isUnlimited ? T.accent : '#D1D5DB',
                            borderRadius: '20px',
                            transition: 'all 0.2s',
                        }} />
                        <div style={{ 
                            position: 'absolute', top: '2px', left: isUnlimited ? '18px' : '2px',
                            width: '16px', height: '16px',
                            background: '#fff',
                            borderRadius: '50%',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                    </label>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    {isUnlimited ? (
                        <div style={{ 
                            width: '100%', padding: '10px 14px', borderRadius: '12px',
                            background: T.accentLight, color: T.accent,
                            fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontStyle: 'italic'
                        }}>
                            <Infinity size={18} strokeWidth={2.5} /> Boundless Expansion
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <input
                                type={type}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                disabled={isUnlimited}
                                min="1"
                                placeholder={placeholder}
                                style={{
                                    width: '100%', padding: '10px 14px',
                                    background: T.bg, 
                                    border: `1.5px solid ${T.border}`,
                                    borderRadius: '12px',
                                    fontSize: '14px', fontWeight: 700, color: T.text,
                                    outline: 'none', transition: 'all 0.2s',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.surface; }}
                                onBlur={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bg; }}
                            />
                            {unit && !options && (
                                <span style={{ 
                                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                    fontSize: '10px', fontWeight: 800, color: T.subtle, textTransform: 'uppercase' 
                                }}>
                                    {unit}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {options && !isUnlimited && (
                    <div style={{ width: '120px' }}>
                        <select
                            value={unitValue}
                            onChange={(e) => onUnitChange(e.target.value)}
                            style={{
                                width: '100%', height: '100%', padding: '0 12px', 
                                background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: '12px',
                                fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: T.muted,
                                outline: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = T.accent}
                            onBlur={e => e.currentTarget.style.borderColor = T.border}
                        >
                            {options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanLimitField;
