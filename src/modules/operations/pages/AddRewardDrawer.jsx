import React, { useState } from 'react';
import { Gift, Star, X, Coins, Trophy, Zap, Loader2, Info } from 'lucide-react';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
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
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

const AddRewardDrawer = ({ isOpen, onClose, onAdd }) => {
    const [newReward, setNewReward] = useState({ name: '', points: '', description: '', isActive: true });

    const handleSubmit = (e) => {
        if(e) e.preventDefault();
        if (!newReward.name || !newReward.points) return;
        onAdd(newReward);
        setNewReward({ name: '', points: '', description: '', isActive: true });
        onClose();
    };

    if (!isOpen) return null;

    const InputLabel = ({ children }) => (
        <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>
            {children}
        </label>
    );

    return (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(26, 21, 51, 0.4)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
            <style>{`
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .drawer-content { animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
            `}</style>
            
            <div 
                className="drawer-content"
                style={{ width: '100%', maxWidth: 540, background: T.bg, height: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }} 
                onClick={e => e.stopPropagation()}
            >
                {/* Header Area */}
                <div style={{ padding: '32px 40px', background: '#fff', borderBottom: `1.5px solid ${T.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                            <Gift size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Mint New Reward</h3>
                            <p style={{ fontSize: 12, fontWeight: 500, color: T.muted, margin: '2px 0 0' }}>Configure exclusive perks for your members</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: T.bg, color: T.subtle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = T.text}
                        onMouseLeave={e => e.currentTarget.style.color = T.subtle}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                    <form id="reward-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        <div style={{ background: '#fff', padding: 28, borderRadius: 28, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, display: 'flex', alignItems: 'center', gap: 24 }}>
                            <div style={{ width: 60, height: 60, borderRadius: 20, background: 'linear-gradient(135deg, #7C5CFC, #9B7BFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                <Trophy size={32} strokeWidth={2.5} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <InputLabel>Reward Nomenclature *</InputLabel>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Premium Protein Shake"
                                    style={{
                                        width: '100%', height: 48, padding: '0 20px', borderRadius: 14, border: `2px solid ${T.border}`,
                                        background: T.bg, fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.background = '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; }}
                                    value={newReward.name}
                                    onChange={e => setNewReward({ ...newReward, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel>Points Valuation *</InputLabel>
                            <div style={{ position: 'relative' }}>
                                <Coins size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                                <input
                                    required
                                    type="number"
                                    placeholder="Point cost..."
                                    style={{
                                        width: '100%', height: 54, padding: '0 20px 0 48px', borderRadius: 16, border: `2px solid ${T.border}`,
                                        background: '#fff', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                                    value={newReward.points}
                                    onChange={e => setNewReward({ ...newReward, points: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel>Experience Narrative</InputLabel>
                            <textarea
                                rows={6}
                                placeholder="Describe the benefit and redemption process..."
                                style={{
                                    width: '100%', padding: '24px', borderRadius: 24, border: `2px solid ${T.border}`,
                                    background: '#fff', fontSize: 14, fontWeight: 600, color: T.text, outline: 'none', transition: '0.3s',
                                    resize: 'none', lineHeight: 1.6
                                }}
                                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                                value={newReward.description}
                                onChange={e => setNewReward({ ...newReward, description: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', background: '#fff', border: `1px solid ${T.border}`, borderRadius: 24, boxShadow: T.cardShadow }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: T.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.green }}>
                                    <Zap size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: 0 }}>Instant Activation</p>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: T.subtle, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Show in catalog immediately</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setNewReward({ ...newReward, isActive: !newReward.isActive })}
                                style={{
                                    position: 'relative', display: 'inline-flex', height: 28, width: 52, flexShrink: 0, cursor: 'pointer',
                                    borderRadius: 100, border: '2px solid transparent', transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)', outline: 'none',
                                    background: newReward.isActive ? T.green : T.subtle
                                }}
                            >
                                <span
                                    style={{
                                        pointerEvents: 'none', display: 'inline-block', height: 24, width: 24, transform: newReward.isActive ? 'translateX(24px)' : 'translateX(0)',
                                        borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Section */}
                <div style={{ padding: '32px 40px', background: '#fff', borderTop: `1.5px solid ${T.border}`, flexShrink: 0, display: 'flex', gap: 16 }}>
                    <button 
                        onClick={onClose}
                        style={{ flex: 1, height: 54, borderRadius: 16, border: `2px solid ${T.border}`, background: '#fff', color: T.text, fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.bg}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                        Discard
                    </button>
                    <button 
                        form="reward-form"
                        type="submit"
                        disabled={!newReward.name || !newReward.points}
                        style={{
                            flex: 1.5, height: 54, borderRadius: 16, border: 'none', background: T.accent, color: '#fff',
                            fontSize: 13, fontWeight: 800, cursor: (!newReward.name || !newReward.points) ? 'not-allowed' : 'pointer',
                            transition: '0.3s', boxShadow: T.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            opacity: (!newReward.name || !newReward.points) ? 0.5 : 1
                        }}
                        onMouseEnter={e => { if(newReward.name && newReward.points) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { if(newReward.name && newReward.points) e.currentTarget.style.transform = 'none'; }}
                    >
                        Deploy Reward
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRewardDrawer;
