import React, { useState, useEffect, useRef } from 'react';
import {
    Search, User, CreditCard, Banknote, Smartphone, Building, Plus, ArrowRight,
    CheckCircle2, Users, ChevronDown, X, Receipt, History, Zap, Tag, Calculator
} from 'lucide-react';
import Loader from '../../../components/common/Loader';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { submitCashierPayment } from '../../../api/finance/financeApi';
import ReceiptModal from '../components/ReceiptModal';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: '#FFF', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    input: { height: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${T.border}`, fontSize: '14px', fontWeight: '600', color: T.text, outline: 'none', transition: 'all 0.2s ease', background: '#FFF' },
    btn: { height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

const CashierMode = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('userData');
    const loggedInUser = userStr ? JSON.parse(userStr) : { name: 'Operator', role: 'STAFF', branchId: 'Unknown' };

    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberSearch, setMemberSearch] = useState('');
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({ type: '', amount: '', discount: 0, method: 'Cash', referenceNumber: '', notes: '' });
    const [showReceipt, setShowReceipt] = useState(false);
    const [processedPayment, setProcessedPayment] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try { setLoadingMembers(true); const response = await apiClient.get('/admin/members'); setMembers(response.data); }
            catch (err) { console.error("Failed fetching members", err); }
            finally { setLoadingMembers(false); }
        };
        fetchMembers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowMemberDropdown(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const paymentTypes = [
        { id: 'membership', label: 'Membership', icon: Building },
        { id: 'renewal', label: 'Renewal', icon: History },
        { id: 'pt', label: 'PT Session', icon: Zap },
        { id: 'diet', label: 'Diet Plan', icon: Tag },
        { id: 'addon', label: 'Add-On', icon: Plus },
        { id: 'other', label: 'Other', icon: Calculator }
    ];

    const methods = [
        { id: 'Cash', label: 'Cash', icon: Banknote },
        { id: 'Card', label: 'Card', icon: CreditCard },
        { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
        { id: 'Bank Transfer', label: 'Transfer', icon: Building },
        { id: 'Online Link', label: 'Pay Link', icon: Smartphone }
    ];

    const filteredMembers = members.filter(m => (m.name?.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone?.includes(memberSearch))).slice(0, 5);

    const calculateFinal = () => {
        const base = parseFloat(paymentDetails.amount) || 0;
        const disc = parseFloat(paymentDetails.discount) || 0;
        return Math.max(0, base - disc);
    };

    const handleReceivePayment = async () => {
        if (!selectedMember || !paymentDetails.type || !paymentDetails.amount) return toast.error('Complete all fields');
        if (paymentDetails.method !== 'Cash' && !paymentDetails.referenceNumber) return toast.error('Reference number required');

        try {
            const finalAmount = calculateFinal();
            const res = await submitCashierPayment({
                memberId: selectedMember.id, paymentType: paymentDetails.type, amount: paymentDetails.amount,
                discount: paymentDetails.discount, method: paymentDetails.method, referenceNumber: paymentDetails.referenceNumber, notes: paymentDetails.notes
            });

            const paymentRecord = {
                id: res.receipt.invoiceNumber, memberId: selectedMember.memberId || selectedMember.id, memberName: selectedMember.name,
                paymentType: paymentDetails.type, amount: paymentDetails.amount, discount: paymentDetails.discount, finalAmount,
                method: paymentDetails.method, referenceNumber: paymentDetails.referenceNumber, receivedBy: loggedInUser.name,
                date: new Date().toLocaleDateString('en-IN'), branchId: loggedInUser.branchName || 'GYM', status: 'completed'
            };

            setProcessedPayment(paymentRecord); setIsSuccess(true); toast.success('Recorded!');
            setTimeout(() => { setShowReceipt(true); setIsSuccess(false); setSelectedMember(null); setPaymentDetails({ type: '', amount: '', discount: 0, method: 'Cash', referenceNumber: '', notes: '' }); }, 1500);
        } catch (error) { toast.error('Check connection'); }
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: T.success, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0, 200, 83, 0.2)' }}><Receipt size={32} /></div>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Cashier Mode</h1>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Offline payment collection & instant receipts</p>
                    </div>
                </div>
                <button onClick={() => navigate('/finance/transactions')} style={{ ...S.btn, background: '#FFF', color: T.text, border: `1px solid ${T.border}` }}><History size={18} /> Branch History</button>
            </div>

            {isSuccess ? (
                <div style={{ ...S.card, padding: '80px', textAlign: 'center', animation: 'slideUp 0.4s ease' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F0FDF4', color: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><CheckCircle2 size={48} /></div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: '0 0 8px' }}>Payment Recorded!</h2>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: T.muted }}>Invoice generated & synced with ledger.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div ref={dropdownRef} style={{ ...S.card, padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}><span style={{ ...S.badge, background: T.accentLight, color: T.accent }}>STEP 1</span><h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: 0 }}>Select Member</h3></div>
                            <div style={{ position: 'relative' }}>
                                <div onClick={() => setShowMemberDropdown(!showMemberDropdown)} style={{ ...S.input, height: '64px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: selectedMember ? T.accentLight : '#FFF', border: selectedMember ? `2px solid ${T.accentMid}` : `2px solid ${T.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: selectedMember ? '#FFF' : T.bg, color: selectedMember ? T.accent : T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>
                                        {selectedMember ? (
                                            <div><p style={{ fontSize: '15px', fontWeight: '800', color: T.text, margin: 0 }}>{selectedMember.name}</p><p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, margin: 0 }}>ID: {selectedMember.memberId} • {selectedMember.phone}</p></div>
                                        ) : <span style={{ color: T.subtle, fontSize: '14px' }}>Search by name or phone...</span>}
                                    </div>
                                    <ChevronDown size={20} color={T.subtle} style={{ transform: showMemberDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                                </div>
                                {showMemberDropdown && (
                                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#FFF', borderRadius: '20px', border: `1px solid ${T.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                                        <div style={{ padding: '16px', background: T.bg }}><input style={{ ...S.input, width: '100%', height: '44px' }} placeholder="Filter results..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} autoFocus /></div>
                                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                            {loadingMembers ? <div style={{ padding: '20px' }}><Loader message="Finding Members..." /></div> : filteredMembers.length > 0 ? filteredMembers.map(m => (
                                                <div key={m.id} onClick={() => { setSelectedMember(m); setShowMemberDropdown(false); }} style={{ padding: '16px 20px', cursor: 'pointer', borderBottom: `1px solid ${T.bg}`, transition: 'background 0.2s' }}>
                                                    <p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{m.name}</p>
                                                    <p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, margin: 0 }}>{m.phone} • {m.memberId}</p>
                                                </div>
                                            )) : <div style={{ padding: '20px', textAlign: 'center', color: T.subtle, fontSize: '12px' }}>No matches found</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ ...S.card, padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}><span style={{ ...S.badge, background: T.accentLight, color: T.accent }}>STEP 2</span><h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: 0 }}>Transaction Type</h3></div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                {paymentTypes.map(type => (
                                    <button key={type.id} onClick={() => setPaymentDetails({ ...paymentDetails, type: type.id })} style={{ padding: '24px 16px', borderRadius: '20px', border: `2px solid ${paymentDetails.type === type.id ? T.accent : T.border}`, background: paymentDetails.type === type.id ? T.accentLight : 'transparent', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: paymentDetails.type === type.id ? T.accent : T.bg, color: paymentDetails.type === type.id ? '#FFF' : T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><type.icon size={20} /></div>
                                        <span style={{ fontSize: '11px', fontWeight: '900', color: T.text, textTransform: 'uppercase' }}>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                                <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Bill Amount (₹)</label><input type="number" style={S.input} value={paymentDetails.amount} onChange={e => setPaymentDetails({ ...paymentDetails, amount: e.target.value })} placeholder="0.00" /></div>
                                <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Discount (₹)</label><input type="number" style={S.input} value={paymentDetails.discount} onChange={e => setPaymentDetails({ ...paymentDetails, discount: e.target.value })} placeholder="0" /></div>
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Payment Method</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                                    {methods.map(m => (
                                        <button key={m.id} onClick={() => setPaymentDetails({ ...paymentDetails, method: m.id })} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: paymentDetails.method === m.id ? T.accent : T.bg, color: paymentDetails.method === m.id ? '#FFF' : T.text, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}><m.icon size={16} /> {m.label}</button>
                                    ))}
                                </div>
                                {paymentDetails.method !== 'Cash' && <div style={{ animation: 'slideUp 0.3s ease' }}><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Reference / TXN ID</label><input style={{ ...S.input, width: '100%', borderColor: T.accentMid }} value={paymentDetails.referenceNumber} onChange={e => setPaymentDetails({ ...paymentDetails, referenceNumber: e.target.value })} placeholder="TXN-999..." /></div>}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ ...S.card, padding: '32px', textAlign: 'center', position: 'sticky', top: '24px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Final Receivable</p>
                            <h2 style={{ fontSize: '48px', fontWeight: '900', color: T.text, margin: '0 0 32px' }}>₹{calculateFinal().toLocaleString()}</h2>
                            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: T.subtle }}><span>Bill Total</span><span>₹{Number(paymentDetails.amount || 0).toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: T.error }}><span>Discount</span><span>- ₹{Number(paymentDetails.discount || 0).toLocaleString()}</span></div>
                                <div style={{ height: '1px', background: T.bg }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900', color: T.text }}><span>Pay Via</span><span>{paymentDetails.method}</span></div>
                            </div>
                            <button onClick={handleReceivePayment} style={{ ...S.btn, width: '100%', height: '56px', background: T.success, color: '#FFF', fontSize: '14px', boxShadow: '0 8px 24px rgba(0, 200, 83, 0.2)' }}>RECEIVE PAYMENT <ArrowRight size={18} /></button>
                        </div>
                        <div style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color={T.subtle} /></div>
                            <div><p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0 }}>OPERATOR</p><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{loggedInUser.name}</p></div>
                        </div>
                    </div>
                </div>
            )}

            <ReceiptModal isOpen={showReceipt} onClose={() => setShowReceipt(false)} payment={processedPayment} />
        </div>
    );
};

export default CashierMode;
