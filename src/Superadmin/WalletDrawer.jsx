import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign, ArrowUpRight, ArrowDownRight, History, Wallet, Sparkles } from 'lucide-react';
import { updateMemberWallet } from '../api/superadmin/superAdminApi';
import { toast } from 'react-hot-toast';
import RightDrawer from '../components/common/RightDrawer';

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

const WalletDrawer = ({ isOpen, onClose, memberData, walletData, setWalletData }) => {
    const currentWallet = memberData && walletData ? walletData[memberData.id] : { balance: 0, transactions: [], lastTransaction: 'N/A' };

    const [transactionType, setTransactionType] = useState(null); 
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState(''); // Added missing setter in previous version
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTransactionType(null);
            setAmount('');
            setDescription('');
        }
    }, [isOpen]);

    const handleTransactionSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!amount || !description || isNaN(amount) || !memberData) return;

        const numAmount = parseFloat(amount);
        const type = transactionType === 'credit' ? 'Credit' : 'Debit';

        setIsSubmitting(true);
        try {
            const response = await updateMemberWallet(memberData.id, { type, amount: numAmount, description });
            const newBalance = response.balance;
            const newTx = response.transaction;

            const dateStr = new Date(newTx.createdAt || new Date()).toISOString().split('T')[0];
            const formattedTx = { id: newTx.id, date: dateStr, type: newTx.type, amount: parseFloat(newTx.amount), description: newTx.description };

            setWalletData(prev => ({
                ...prev,
                [memberData.id]: {
                    balance: newBalance,
                    transactions: [formattedTx, ...currentWallet.transactions],
                    lastTransaction: dateStr
                }
            }));

            toast.success('Wallet Updated');
            setTransactionType(null);
            setAmount('');
            setDescription('');
        } catch (error) { 
            console.error(error); 
            toast.error("Transaction Error"); 
        } finally { setIsSubmitting(false); }
    };

    const inputStyle = (type) => ({
        width: '100%', padding: '12px 16px', background: T.bg, border: `1.5px solid ${type === 'credit' ? T.greenLight : (type === 'debit' ? T.roseLight : T.border)}`,
        borderRadius: '14px', fontSize: '14px', fontWeight: 700, color: T.text, outline: 'none', transition: '0.2s',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    });

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={memberData?.name || 'Member Wallet'}
            subtitle={memberData?.id ? `ID: ${memberData.id}` : 'Manage member wallet balance'}
            maxWidth="500px"
            footer={
                <button
                    onClick={onClose}
                    style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                        color: '#fff', border: 'none', borderRadius: '16px', fontSize: '13px', fontWeight: 900,
                        cursor: 'pointer', transition: '0.2s', boxShadow: `0 8px 24px rgba(124,92,252,0.3)`,
                        textTransform: 'uppercase', letterSpacing: '0.1em'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    CLOSE
                </button>
            }
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                {/* Balance Card */}
                <div style={{
                    background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
                    borderRadius: '24px', padding: '28px', color: '#fff', position: 'relative', overflow: 'hidden',
                    boxShadow: `0 12px 32px rgba(124,92,252,0.25)`
                }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)' }} />
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0, opacity: 0.8 }}>Current Balance</p>
                        <h3 style={{ fontSize: '36px', fontWeight: 900, margin: '8px 0 0', letterSpacing: '-1px' }}>
                            ₹{Number(currentWallet.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                            <div>
                                <p style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, opacity: 0.6 }}>Total Credit</p>
                                <p style={{ fontSize: '15px', fontWeight: 900, margin: '4px 0 0' }}>
                                    ₹{(currentWallet.transactions || []).filter(tx => tx.type === 'Credit').reduce((acc, tx) => acc + Number(tx.amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, opacity: 0.6 }}>Total Debit</p>
                                <p style={{ fontSize: '15px', fontWeight: 900, margin: '4px 0 0' }}>
                                    ₹{(currentWallet.transactions || []).filter(tx => tx.type === 'Debit').reduce((acc, tx) => acc + Number(tx.amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operations */}
                {!transactionType ? (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setTransactionType('credit')}
                            style={{
                                flex: 1, padding: '14px', borderRadius: '16px', background: T.greenLight, color: T.green,
                                border: `1.5px solid ${T.green}30`, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase',
                                letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.green; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = T.greenLight; e.currentTarget.style.color = T.green; }}
                        >
                            <ArrowUpRight size={16} strokeWidth={3} /> Add Credit
                        </button>
                        <button
                            onClick={() => setTransactionType('debit')}
                            style={{
                                flex: 1, padding: '14px', borderRadius: '16px', background: T.roseLight, color: T.rose,
                                border: `1.5px solid ${T.rose}30`, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase',
                                letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.rose; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = T.roseLight; e.currentTarget.style.color = T.rose; }}
                        >
                            <ArrowDownRight size={16} strokeWidth={3} /> Withdraw
                        </button>
                    </div>
                ) : (
                    <div style={{ background: T.surface, border: `2px solid ${transactionType === 'credit' ? T.green : T.rose}`, borderRadius: '24px', padding: '24px', animation: 'slideUp 0.3s ease-out' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: transactionType === 'credit' ? T.green : T.rose, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {transactionType === 'credit' ? <ArrowUpRight size={16} strokeWidth={3} /> : <ArrowDownRight size={16} strokeWidth={3} />}
                            {transactionType === 'credit' ? 'Strategic Credit Injection' : 'Asset Deduction Sequence'}
                        </h4>
                        
                        <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Amount (₹)</label>
                                <input type="number" required style={inputStyle(transactionType)} placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} onFocus={e => e.currentTarget.style.borderColor = transactionType === 'credit' ? T.green : T.rose} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Description / Reason</label>
                                <input type="text" required style={inputStyle(transactionType)} placeholder="Entry reason for ledger parity…" value={description} onChange={e => setDescription(e.target.value)} onFocus={e => e.currentTarget.style.borderColor = transactionType === 'credit' ? T.green : T.rose} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setTransactionType(null)} style={{ flex: 1, padding: '12px', border: 'none', background: T.bg, color: T.muted, borderRadius: '12px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '12px', border: 'none', background: transactionType === 'credit' ? T.green : T.rose, color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 4px 12px ${transactionType === 'credit' ? T.green : T.rose}40` }}>
                                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Shift'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Ledger */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.25em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History size={16} /> RECENT TELEMETRY
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {currentWallet.transactions.length > 0 ? (currentWallet.transactions || []).map((tx) => (
                            <div key={tx.id} style={{
                                padding: '16px 20px', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: '0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.borderColor = T.accentMid}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: tx.type === 'Credit' ? T.greenLight : T.roseLight, color: tx.type === 'Credit' ? T.green : T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {tx.type === 'Credit' ? <ArrowUpRight size={18} strokeWidth={3} /> : <ArrowDownRight size={18} strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: 800, color: T.text, margin: 0 }}>{tx.description}</p>
                                        <p style={{ fontSize: '9px', fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '2px 0 0' }}>{tx.date}</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 900, color: tx.type === 'Credit' ? T.green : T.rose }}>
                                    {tx.type === 'Credit' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN')}
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '48px 0', border: `2px dashed ${T.border}`, borderRadius: '24px' }}>
                                <Wallet size={28} color={T.subtle} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p style={{ fontSize: '11px', fontWeight: 700, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Shard history empty</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </RightDrawer>
    );
};

export default WalletDrawer;
