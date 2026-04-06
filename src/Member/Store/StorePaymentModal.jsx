import React, { useState } from 'react';
import { X, CreditCard, Wallet, Smartphone, Landmark, CheckCircle2, ChevronRight, ShieldCheck, Zap } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF', dark: '#0D0A1F'
};

const StorePaymentModal = ({ isOpen, onClose, onConfirm, totalAmount }) => {
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [referenceNumber, setReferenceNumber] = useState('');

    if (!isOpen) return null;

    const paymentMethods = [
        { id: 'Cash', icon: Wallet, color: T.green, bg: T.greenLight },
        { id: 'UPI', icon: Smartphone, color: T.accent, bg: T.accentLight },
        { id: 'QR', icon: CheckCircle2, color: T.blue, bg: T.blueLight },
        { id: 'Card', icon: CreditCard, color: T.amber, bg: T.amberLight }
    ];

    const handleSubmit = () => { onConfirm({ paymentMethod, referenceNumber }); };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes blurIn { from { backdrop-filter: blur(0px); background: rgba(13,10,31,0) } to { backdrop-filter: blur(12px); background: rgba(13,10,31,0.6) } }
            `}</style>
            
            {/* BACKDROP */}
            <div 
                style={{ position: 'absolute', inset: 0, animation: 'blurIn 0.3s ease forwards' }}
                onClick={onClose}
            />
            
            {/* MODAL CONTENT */}
            <div style={{ 
                position: 'relative', width: '100%', maxWidth: 480, background: '#fff', borderRadius: 40,
                boxShadow: '0 32px 80px rgba(0,0,0,0.4)', overflow: 'hidden', animation: 'fadeUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, zIndex: 10, width: 40, height: 40, borderRadius: 12, background: 'rgba(0,0,0,0.05)', border: 'none', color: T.subtle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>

                <div style={{ padding: '40px 40px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px rgba(124,92,252,0.2)' }}><ShieldCheck size={28} /></div>
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>Payment Source</h2>
                            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', tracking: '0.1em', margin: '4px 0 0' }}>Secure billing authentication</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            const isSelected = paymentMethod === method.id;
                            
                            return (
                                <button
                                    key={method.id} onClick={() => setPaymentMethod(method.id)}
                                    style={{
                                        position: 'relative', padding: '24px 20px', borderRadius: 24, border: `2px solid ${isSelected ? T.accent : T.bg}`,
                                        background: isSelected ? T.accentLight : T.bg, transition: '0.2s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff', color: isSelected ? T.accent : T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isSelected ? '0 8px 16px rgba(124,92,252,0.1)' : 'none' }}>
                                        <Icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: isSelected ? T.accent : T.muted, textTransform: 'uppercase' }}>{method.id}</span>
                                    {isSelected && <div style={{ position: 'absolute', top: 12, right: 12, color: T.accent }}><CheckCircle2 size={16} fill="#fff" /></div>}
                                </button>
                            );
                        })}
                    </div>

                    {paymentMethod !== 'Cash' && (
                        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 8 }} className="animate-fadeIn">
                            <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 4 }}>Transaction Reference</label>
                            <div style={{ position: 'relative' }}>
                                <Landmark style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} size={18} />
                                <input
                                    type="text" placeholder="Enter Txn ID / Invoice ID" value={referenceNumber}
                                    onChange={e => setReferenceNumber(e.target.value)}
                                    style={{ width: '100%', height: 56, borderRadius: 16, border: `2px solid ${T.bg}`, background: T.bg, padding: '0 16px 0 48px', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ padding: 40 }}>
                    <div style={{ background: T.dark, borderRadius: 24, padding: 24, color: '#fff', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>Total Amount</p>
                            <p style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>₹{(totalAmount || 0).toLocaleString()}</p>
                        </div>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={22} color="#FFE16A" fill="#FFE16A" /></div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        style={{ width: '100%', height: 64, borderRadius: 20, background: T.accent, color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 12px 32px rgba(124,92,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
                    >
                        Confirm Purchase
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StorePaymentModal;
