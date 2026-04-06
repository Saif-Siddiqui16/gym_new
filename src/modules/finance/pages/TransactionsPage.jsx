import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Filter, Download, Calendar, TrendingUp, Clock, CheckCircle2, AlertCircle,
    ChevronDown, CreditCard, Smartphone, Building, Banknote, Receipt, MoreHorizontal,
    FileText, History, X
} from 'lucide-react';
import Loader from '../../../components/common/Loader';
import { fetchTransactions, fetchInvoiceById } from '../../../api/finance/financeApi';
import { fetchOrderById } from '../../../api/storeApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import { exportPdf } from '../../../utils/exportPdf';
import RightDrawer from '../../../components/common/RightDrawer';

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

const CustomDropdown = ({ options, value, onChange, icon: Icon, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', minWidth: '160px' }}>
            <button
                type="button" onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%', height: '48px', padding: '0 16px', borderRadius: '14px',
                    border: `2px solid ${isOpen ? T.accent : T.border}`, background: '#FFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: isOpen ? '0 0 0 4px ' + T.accentLight : 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {Icon && <Icon size={18} color={T.muted} />}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: T.text }}>{value}</span>
                </div>
                <ChevronDown size={18} color={T.muted} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </button>
            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: '#FFF', borderRadius: '16px', border: `1px solid ${T.border}`,
                    boxShadow: '0 15px 30px -5px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden'
                }}>
                    {options.map((opt) => (
                        <button
                            key={opt} type="button" onClick={() => { onChange(opt); setIsOpen(false); }}
                            style={{
                                width: '100%', padding: '12px 16px', border: 'none', background: value === opt ? T.accentLight : 'transparent',
                                color: value === opt ? T.accent : T.text, fontSize: '14px', fontWeight: '600', textAlign: 'left',
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Payments = () => {
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ transactions: [], stats: { todayCollection: 0, filteredTotal: 0, completed: 0, pending: 0 } });
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [fetchingReceipt, setFetchingReceipt] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [methodFilter, setMethodFilter] = useState('All Methods');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const loadPayments = async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch === 'all' ? '' : selectedBranch;
            const res = await fetchTransactions({ branchId, search: searchTerm, method: methodFilter === 'All Methods' ? undefined : methodFilter, status: statusFilter === 'All Status' ? undefined : statusFilter, startDate, endDate });
            setData(res);
        } catch (error) { toast.error("Failed to sync payments"); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadPayments(); }, [selectedBranch, methodFilter, statusFilter, startDate, endDate]);

    const handleSearch = (e) => { if (e.key === 'Enter') loadPayments(); };

    const handleExport = () => {
        if (data.transactions.length === 0) return toast.error("No transactions to export");
        const headers = ["Member", "Branch", "Ref Code", "Date", "Method", "Amount", "Status"];
        const rows = data.transactions.map(txn => [txn.member || 'Guest', txn.branch || 'Main', txn.id, new Date(txn.date).toLocaleDateString(), txn.method, `₹${txn.amount.toLocaleString()}`, txn.status]);
        exportPdf({ title: 'Payments Report', filename: `Payments_${new Date().toISOString().split('T')[0]}`, headers, rows, gymName: "Roar Fitness" });
    };

    const handleViewReceipt = async (id) => {
        try {
            setFetchingReceipt(true); setIsReceiptOpen(true);
            const txn = data.transactions.find(t => t.id === id || t.internalId === id);
            if (!txn?.internalId) return toast.error("Transaction ID missing");
            let res;
            if (txn.type === 'POS Sale') {
                const orderData = await fetchOrderById(txn.internalId);
                res = { ...orderData, invoiceNumber: `POS-#${orderData.id}`, paidDate: orderData.paidDate || orderData.dueDate || orderData.date, amount: Number(orderData.total || orderData.amount || 0), paymentMode: orderData.paymentMode || 'Cash', items: orderData.items || [] };
            } else { res = await fetchInvoiceById(txn.internalId); }
            setSelectedReceipt(res);
        } catch (err) { toast.error("Failed to load receipt"); setIsReceiptOpen(false); }
        finally { setFetchingReceipt(false); }
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'Card': return CreditCard;
            case 'UPI': return Smartphone;
            case 'Bank Transfer': return Building;
            default: return Banknote;
        }
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Payments Trace</h1>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Global financial ledger & transaction audit</p>
                </div>
                <button onClick={handleExport} style={{ ...S.btn, background: '#FFF', color: T.text, border: `1px solid ${T.border}` }}><Download size={18} /> Export Records</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {[
                    { label: "Today's Collection", value: `₹${data.stats.todayCollection.toLocaleString()}`, icon: TrendingUp, color: '#D97706', bg: '#FFFBEB' },
                    { label: "Filtered Total", value: `₹${data.stats.filteredTotal.toLocaleString()}`, icon: History, color: T.success, bg: '#ECFDF5' },
                    { label: "Completed", value: `₹${data.stats.completed.toLocaleString()}`, icon: CheckCircle2, color: '#4F46E5', bg: '#EEF2FF' },
                    { label: "Pending", value: `₹${data.stats.pending.toLocaleString()}`, icon: Clock, color: T.accent, bg: T.accentLight },
                ].map((stat, i) => (
                    <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', animation: `slideUp 0.4s ease forwards ${i * 0.1}s` }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><stat.icon size={24} color={stat.color} /></div>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{stat.label}</p>
                            <p style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ ...S.card, overflow: 'visible' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input placeholder="Search member, ID or receipt..." style={{ ...S.input, width: '100%', paddingLeft: '48px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={handleSearch} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Calendar size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="date" style={{ ...S.input, width: '100%', paddingLeft: '48px', fontSize: '12px' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <CustomDropdown options={['All Methods', 'Cash', 'UPI', 'Card', 'Bank Transfer']} value={methodFilter} onChange={setMethodFilter} icon={Filter} />
                    <CustomDropdown options={['All Status', 'Paid', 'Unpaid', 'Partial']} value={statusFilter} onChange={setStatusFilter} icon={Filter} />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                {['Member/Payer', 'Branch', 'Ref Code', 'Date & Time', 'Method', 'Amount', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '20px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" style={{ padding: '80px 0' }}><Loader message="Syncing Payments..." /></td></tr>
                            ) : data.transactions.length === 0 ? (
                                <tr><td colSpan="8" style={{ padding: '100px', textAlign: 'center' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.5 }}><History size={48} color={T.subtle} /><p style={{ fontSize: '14px', fontWeight: '800', color: T.subtle }}>No matches in recent history</p></div></td></tr>
                            ) : (
                                data.transactions.map((txn, idx) => {
                                    const MethodIcon = getMethodIcon(txn.method);
                                    return (
                                        <tr key={idx} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900' }}>{txn.member ? txn.member[0] : 'G'}</div>
                                                    <p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{txn.member || 'Guest'}</p>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}><span style={{ ...S.badge, background: T.accentLight, color: T.accent }}>{txn.branch}</span></td>
                                            <td style={{ padding: '20px 24px' }}><span style={{ fontSize: '10px', fontWeight: '800', background: T.bg, padding: '4px 8px', borderRadius: '6px', color: T.muted }}>{txn.id}</span></td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <p style={{ fontSize: '13px', fontWeight: '700', color: T.text, margin: 0 }}>{new Date(txn.date).toLocaleDateString()}</p>
                                                <p style={{ fontSize: '10px', fontWeight: '600', color: T.subtle, margin: 0 }}>{new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: T.muted }}><MethodIcon size={14} /> {txn.method}</div>
                                            </td>
                                            <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '900', color: T.text }}>₹{txn.amount.toLocaleString()}</td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{ ...S.badge, background: txn.status === 'Paid' ? '#ECFDF5' : '#FFFBEB', color: txn.status === 'Paid' ? T.success : '#D97706', border: `1px solid ${txn.status === 'Paid' ? '#D1FAE5' : '#FEF3C7'}` }}>{txn.status === 'Paid' ? 'Paid' : 'Pending'}</span>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <button onClick={() => handleViewReceipt(txn.internalId || txn.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.bg, border: 'none', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Receipt size={16} /></button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RightDrawer isOpen={isReceiptOpen} onClose={() => { setIsReceiptOpen(false); setSelectedReceipt(null); }} title="Receipt Details" subtitle="Transaction forensic view" width="450px">
                {fetchingReceipt ? <div style={{ padding: '80px 0' }}><Loader message="Fetching Receipt..." /></div> : selectedReceipt && (
                    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '100px' }}>
                        <div style={{ textAlign: 'center', padding: '32px', background: T.bg, borderRadius: '24px', border: `1px solid ${T.border}` }}>
                            <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '10px', background: selectedReceipt.status === 'Paid' ? '#ECFDF5' : '#FEF2F2', color: selectedReceipt.status === 'Paid' ? T.success : T.error, fontSize: '10px', fontWeight: '900', marginBottom: '16px', letterSpacing: '1px' }}>{selectedReceipt.status}</div>
                            <h2 style={{ fontSize: '36px', fontWeight: '900', color: T.text, margin: '0 0 4px' }}>₹{Number(selectedReceipt.amount).toLocaleString()}</h2>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: T.muted }}>{selectedReceipt.invoiceNumber}</p>
                        </div>

                        <div style={{ ...S.card, padding: '0', overflow: 'hidden' }}>
                            {[
                                { label: 'Member', value: selectedReceipt.member?.name || 'Walk-in' },
                                { label: 'Branch', value: selectedReceipt.tenant?.name || 'Main' },
                                { label: 'Date', value: new Date(selectedReceipt.paidDate || selectedReceipt.dueDate).toLocaleDateString() },
                                { label: 'Method', value: selectedReceipt.paymentMode || 'Cash' }
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '16px 20px', borderBottom: i === 3 ? 'none' : `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: T.subtle }}>{item.label}</span>
                                    <span style={{ fontSize: '12px', fontWeight: '900', color: T.text }}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <p style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Itemized Breakdown</p>
                            <div style={{ ...S.card, padding: '0', overflow: 'hidden' }}>
                                {selectedReceipt.items?.length > 0 ? selectedReceipt.items.map((item, i) => (
                                    <div key={i} style={{ padding: '16px 20px', borderBottom: i === selectedReceipt.items.length - 1 ? 'none' : `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between' }}>
                                        <div><p style={{ fontSize: '13px', fontWeight: '800', color: T.text, margin: 0 }}>{item.description}</p><p style={{ fontSize: '10px', fontWeight: '600', color: T.muted, margin: 0 }}>Qty: {item.quantity}</p></div>
                                        <span style={{ fontSize: '14px', fontWeight: '900', color: T.text }}>₹{Number(item.amount || 0).toLocaleString()}</span>
                                    </div>
                                )) : (
                                    <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: T.text }}>Service/Membership Fee</span>
                                        <span style={{ fontSize: '14px', fontWeight: '900', color: T.text }}>₹{Number(selectedReceipt.amount).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button onClick={() => window.print()} style={{ ...S.btn, width: '100%', height: '56px', background: T.text, color: '#FFF' }}><Download size={18} /> Download Receipt</button>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default Payments;
