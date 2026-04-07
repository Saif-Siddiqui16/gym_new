import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FileText, Search, Filter, Plus, Calendar, TrendingUp, Users, Receipt,
    CheckCircle2, Clock, AlertCircle, X, Download, MoreHorizontal, Trash2,
    Eye, PlusCircle, ChevronDown, CreditCard, IndianRupee, Check
} from 'lucide-react';
import Loader from '../../../components/common/Loader';
import { fetchInvoices, addInvoice, fetchInvoiceById, deleteInvoice, settleInvoice } from '../../../api/finance/financeApi';
import { updatePayrollStatusAPI } from '../../../api/admin/adminApi';
import { fetchOrderById } from '../../../api/storeApi';
import { getMembers } from '../../../api/staff/memberApi';
import { useBranchContext } from '../../../context/BranchContext';
import { useAuth } from '../../../context/AuthContext';
import RightDrawer from '../../../components/common/RightDrawer';
import toast from 'react-hot-toast';
import { exportPdf } from '../../../utils/exportPdf';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

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
                    <span style={{ fontSize: '14px', fontWeight: '600', color: T.text }}>{value === 'All Status' ? placeholder : value}</span>
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
                            {opt === 'All Status' ? placeholder : opt}
                            {value === opt && <Check size={16} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Invoices = () => {
    const { selectedBranch, branches } = useBranchContext();
    const { role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ invoices: [], stats: { clients: 0, totalInvoices: 0, paid: 0, unpaid: 0 } });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [fetchingInvoice, setFetchingInvoice] = useState(false);
    const [members, setMembers] = useState([]);
    const [fetchingMembers, setFetchingMembers] = useState(false);
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
    const [settlementData, setSettlementData] = useState({
        invoiceId: null, method: 'Cash', amount: 0, referenceNumber: '', date: new Date().toISOString().split('T')[0]
    });
    const [isSettling, setIsSettling] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    // Create Invoice Form State
    const [invoiceForm, setInvoiceForm] = useState({
        memberId: '', dueDate: new Date().toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, rate: 0 }],
        discount: 0, taxRate: 18, notes: '', branchId: selectedBranch || 'all'
    });

    useEffect(() => { setInvoiceForm(prev => ({ ...prev, branchId: selectedBranch || 'all' })); }, [selectedBranch]);

    const loadMembers = async (branchId) => {
        try { setFetchingMembers(true); const res = await getMembers({ branchId: branchId }); setMembers(res); }
        catch (error) { console.error("Failed to load members", error); }
        finally { setFetchingMembers(false); }
    };

    useEffect(() => { if (isCreateDrawerOpen) loadMembers(invoiceForm.branchId); }, [isCreateDrawerOpen, invoiceForm.branchId]);

    const loadInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchInvoices({ branchId: selectedBranch, search: searchTerm, status: statusFilter === 'All Status' ? '' : statusFilter });
            setData(res);
        } catch (error) { toast.error("Failed to sync invoices"); }
        finally { setLoading(false); }
    }, [selectedBranch, searchTerm, statusFilter]);

    useEffect(() => { loadInvoices(); }, [loadInvoices]);

    const handleSearch = (e) => { if (e.key === 'Enter') loadInvoices(); };

    const handleAddItem = () => { setInvoiceForm({ ...invoiceForm, items: [...invoiceForm.items, { description: '', quantity: 1, rate: 0 }] }); };
    const handleRemoveItem = (index) => { const newItems = invoiceForm.items.filter((_, i) => i !== index); setInvoiceForm({ ...invoiceForm, items: newItems }); };
    const handleItemChange = (index, field, value) => { const newItems = [...invoiceForm.items]; newItems[index][field] = value; setInvoiceForm({ ...invoiceForm, items: newItems }); };

    const calculateSubtotal = () => invoiceForm.items.reduce((acc, item) => acc + (parseFloat(item.rate || 0) * parseInt(item.quantity || 0)), 0);
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal - (parseFloat(invoiceForm.discount) || 0)) * (parseFloat(invoiceForm.taxRate) / 100);
    const totalAmount = subtotal - (parseFloat(invoiceForm.discount) || 0) + taxAmount;

    const handleSubmitInvoice = async (e) => {
        e.preventDefault();
        try {
            if (role === 'SUPER_ADMIN' && (invoiceForm.branchId === 'all' || !invoiceForm.branchId)) return toast.error("Please select a specific branch");
            if (invoiceForm.items.some(item => !item.description || item.rate <= 0)) return toast.error("Please fill all item details");
            await addInvoice(invoiceForm); toast.success("Invoice created successfully!"); setIsCreateDrawerOpen(false);
            setInvoiceForm({ memberId: '', dueDate: new Date().toISOString().split('T')[0], items: [{ description: '', quantity: 1, rate: 0 }], discount: 0, taxRate: 18, notes: '', branchId: selectedBranch || 'all' });
            loadInvoices();
        } catch (error) { toast.error(error.message || "Failed to create invoice"); }
    };

    const handleViewInvoice = async (id) => {
        try {
            setFetchingInvoice(true); setIsViewDrawerOpen(true);
            const item = data.invoices.find(inv => inv.id === id);
            let res;
            if (item?.type === 'POS Sale') {
                res = await fetchOrderById(item.internalId);
                res.invoiceNumber = `POS-#${res.id}`; res.dueDate = res.dueDate || res.date || res.paidDate; res.amount = Number(res.total || res.amount || 0); res.subtotal = (res.items || []).reduce((acc, i) => acc + (Number(i.rate || 0) * Number(i.quantity || 0)), 0); res.taxAmount = Number(res.amount) - res.subtotal; res.taxRate = 0;
            } else { res = await fetchInvoiceById(id); }
            setSelectedInvoice(res);
        } catch (error) { toast.error("Failed to load details"); setIsViewDrawerOpen(false); }
        finally { setFetchingInvoice(false); }
    };

    const handleDeleteInvoice = (id) => setConfirmModal({ isOpen: true, id, loading: false });
    const processDeleteInvoice = async () => {
        try { setConfirmModal(prev => ({ ...prev, loading: true })); await deleteInvoice(confirmModal.id); toast.success("Invoice deleted"); setConfirmModal({ isOpen: false, id: null, loading: false }); loadInvoices(); }
        catch (error) { toast.error("Failed to delete invoice"); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    const openSettleModal = (inv) => {
        const payableAmount = (Number(inv.balance) > 0) ? Number(inv.balance) : Number(inv.amount);
        setSettlementData({ invoiceId: inv.id, method: 'Cash', fullAmount: payableAmount, amount: payableAmount, isPartial: false, referenceNumber: '', date: new Date().toISOString().split('T')[0], balanceDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
        setIsSettleModalOpen(true);
    };

    const handleSettleSubmit = async (e) => {
        e.preventDefault();
        try { setIsSettling(true); await settleInvoice(settlementData.invoiceId, { method: settlementData.method, referenceNumber: settlementData.referenceNumber, amount: settlementData.amount, date: settlementData.date, balanceDueDate: settlementData.isPartial ? settlementData.balanceDueDate : null }); toast.success("Invoice settled!"); setIsSettleModalOpen(false); loadInvoices(); }
        catch (error) { toast.error("Failed to settle invoice"); }
        finally { setIsSettling(false); }
    };

    const statsCards = [
        { label: 'Active Clients', value: data.stats.clients.toString(), icon: Users, color: T.accent, bg: T.accentLight },
        { label: 'Total Invoices', value: data.stats.totalInvoices.toString(), icon: Receipt, color: '#4F46E5', bg: '#EEF2FF' },
        { label: 'Total Paid', value: `₹${data.stats.paid.toLocaleString()}`, icon: TrendingUp, color: T.success, bg: '#ECFDF5' },
        { label: 'Total Unpaid', value: `₹${data.stats.unpaid.toLocaleString()}`, icon: Clock, color: '#D97706', bg: '#FFFBEB' },
    ];

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Invoices</h1>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Billing, settlement & membership forensics</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => {
                        const headers = ["Invoice #", "Member", "Amount", "Date", "Status"];
                        const rows = data.invoices.map(inv => [inv.invoiceNumber, inv.member?.name || 'Walk-in', `₹${Number(inv.amount)}`, new Date(inv.dueDate).toLocaleDateString(), inv.status]);
                        exportPdf({ title: 'Invoices Report', filename: 'Invoices', headers, rows, gymName: "Roar Fitness" });
                    }} style={{ ...S.btn, background: '#FFF', color: T.text, border: `1px solid ${T.border}` }}><Download size={18} /> Export PDF</button>
                    <button onClick={() => setIsCreateDrawerOpen(true)} style={{ ...S.btn, background: T.accent, color: '#FFF', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.2)' }}><Plus size={18} /> Create Invoice</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {statsCards.map((stat, i) => (
                    <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', animation: `slideUp 0.4s ease forwards ${i * 0.1}s` }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><stat.icon size={24} color={stat.color} /></div>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{stat.label}</p>
                            <p style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>{loading ? '...' : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ ...S.card, overflow: 'visible' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CustomDropdown options={['All Status', 'Paid', 'Unpaid', 'Partially Paid', 'Overdue']} value={statusFilter} onChange={setStatusFilter} placeholder="Filter Status" icon={Filter} />
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Search by member or invoice #..." style={{ ...S.input, width: '100%', paddingLeft: '48px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearch} />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                {['Invoice details', 'Branch', 'Client', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '20px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ padding: '80px 0' }}><Loader message="Fetching Invoices..." /></td></tr>
                            ) : data.invoices.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '100px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Receipt size={32} color={T.subtle} /></div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>No invoices found</h3>
                                    </div>
                                </td></tr>
                            ) : (
                                data.invoices.map((inv, idx) => (
                                    <tr key={idx} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={18} /></div>
                                                <div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{inv.invoiceNumber}</p><p style={{ fontSize: '10px', fontWeight: '700', color: T.subtle, margin: 0, textTransform: 'uppercase' }}>{inv.serviceName || 'Service'}</p></div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}><span style={{ ...S.badge, background: T.accentLight, color: T.accent }}>{inv.tenant?.name || 'Main'}</span></td>
                                        <td style={{ padding: '20px 24px' }}><div><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{inv.member?.name || 'Walk-in'}</p><p style={{ fontSize: '10px', fontWeight: '700', color: T.subtle, margin: 0 }}>{inv.member?.memberId || 'GUEST'}</p></div></td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <p style={{ fontSize: '14px', fontWeight: '900', color: T.text, margin: 0 }}>₹{Number(inv.amount).toLocaleString()}</p>
                                            {inv.status === 'Partially Paid' && (
                                                <div style={{ marginTop: '4px' }}>
                                                    <p style={{ fontSize: '10px', fontWeight: '700', color: T.success, margin: 0 }}>Paid: ₹{Number(inv.paidAmount).toLocaleString()}</p>
                                                    <p style={{ fontSize: '10px', fontWeight: '700', color: T.error, margin: 0 }}>Balance: ₹{Number(inv.balance).toLocaleString()}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <p style={{ fontSize: '13px', fontWeight: '700', color: T.subtle, margin: 0 }}>{new Date(inv.dueDate).toLocaleDateString()}</p>
                                            {inv.status === 'Partially Paid' && inv.balanceDueDate && (
                                                <p style={{ fontSize: '10px', fontWeight: '800', color: '#D97706', margin: '4px 0 0', textTransform: 'uppercase' }}>Balance Due: {new Date(inv.balanceDueDate).toLocaleDateString()}</p>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{ ...S.badge, background: inv.status === 'Paid' ? '#ECFDF5' : (inv.status === 'Overdue' ? '#FEF2F2' : '#FFFBEB'), color: inv.status === 'Paid' ? T.success : (inv.status === 'Overdue' ? T.error : '#D97706'), border: `1px solid ${inv.status === 'Paid' ? '#D1FAE5' : (inv.status === 'Overdue' ? '#FEE2E2' : '#FEF3C7')}` }}>{inv.status}</span>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleViewInvoice(inv.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.bg, border: 'none', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Eye size={16} /></button>
                                                {inv.status !== 'Paid' && <button onClick={() => openSettleModal(inv)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.accentLight, border: 'none', color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><CreditCard size={16} /></button>}
                                                <button onClick={() => handleDeleteInvoice(inv.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF2F2', border: 'none', color: T.error, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RightDrawer isOpen={isCreateDrawerOpen} onClose={() => setIsCreateDrawerOpen(false)} title="Create Invoice" subtitle="Generate new billing document" width="500px">
                <form onSubmit={handleSubmitInvoice} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
                    <div style={{ padding: '20px', background: T.accentLight, borderRadius: '20px', border: `1px solid ${T.accentMid}` }}>
                        <label style={{ fontSize: '10px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Target Branch *</label>
                        <select required style={{ ...S.input, width: '100%' }} value={invoiceForm.branchId} onChange={e => setInvoiceForm({ ...invoiceForm, branchId: e.target.value, memberId: '' })}>
                            <option value="all">Select Branch</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Client / Member</label><select style={{ ...S.input, width: '100%' }} value={invoiceForm.memberId} onChange={e => setInvoiceForm({ ...invoiceForm, memberId: e.target.value })}><option value="">Walk-in Customer</option>{members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.memberId || m.id})</option>)}</select></div>
                        <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Due Date</label><input type="date" style={S.input} value={invoiceForm.dueDate} onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} /></div>
                    </div>

                    <div style={{ borderTop: `1px solid ${T.bg}`, paddingTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '900', color: T.text, margin: 0 }}>Line Items</h4>
                            <button type="button" onClick={handleAddItem} style={{ border: 'none', background: T.accentLight, color: T.accent, padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>+ ADD ITEM</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {invoiceForm.items.map((item, idx) => (
                                <div key={idx} style={{ padding: '16px', background: T.bg, borderRadius: '16px', position: 'relative' }}>
                                    {idx > 0 && <button type="button" onClick={() => handleRemoveItem(idx)} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: T.error, color: '#FFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>}
                                    <input placeholder="Service or product description" style={{ ...S.input, width: '100%', marginBottom: '12px' }} value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <input type="number" placeholder="Qty" style={S.input} value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} />
                                        <input type="number" placeholder="Rate (₹)" style={S.input} value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: '24px', background: T.accentLight, borderRadius: '24px', border: `1px solid ${T.accentMid}`, marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '11px', fontWeight: '800', color: T.muted }}>SUBTOTAL</span><span style={{ fontSize: '14px', fontWeight: '900', color: T.text }}>₹{subtotal.toLocaleString()}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><span style={{ fontSize: '11px', fontWeight: '800', color: T.muted }}>TAX (GST {invoiceForm.taxRate}%)</span><span style={{ fontSize: '14px', fontWeight: '900', color: T.accent }}>₹{taxAmount.toLocaleString()}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${T.accentMid}`, paddingTop: '16px' }}><span style={{ fontSize: '13px', fontWeight: '900', color: T.text }}>TOTAL AMOUNT</span><span style={{ fontSize: '24px', fontWeight: '900', color: T.text }}>₹{totalAmount.toLocaleString()}</span></div>
                    </div>

                    <div style={{ position: 'fixed', bottom: 0, right: 0, width: '500px', padding: '24px', background: '#FFF', borderTop: `1px solid ${T.bg}`, display: 'flex', gap: '12px', zIndex: 10 }}>
                        <button type="button" onClick={() => setIsCreateDrawerOpen(false)} style={{ ...S.btn, flex: 1, background: T.bg, color: T.muted }}>Cancel</button>
                        <button type="submit" style={{ ...S.btn, flex: 2, background: T.accent, color: '#FFF' }}><CheckCircle2 size={18} /> Create Invoice</button>
                    </div>
                </form>
            </RightDrawer>

            {/* Settle Modal (simplified for implementation) */}
            {isSettleModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26, 21, 51, 0.4)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ ...S.card, width: '100%', maxWidth: '400px', padding: '32px', animation: 'slideUp 0.3s ease' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', color: T.text, margin: '0 0 8px' }}>Settle Invoice</h2>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: T.muted, marginBottom: '24px' }}>Record payment for Invoice #{settlementData.invoiceId}</p>
                        <form onSubmit={handleSettleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Payment Method</label>
                                <select style={{ ...S.input, width: '100%' }} value={settlementData.method} onChange={e => setSettlementData({ ...settlementData, method: e.target.value })}>
                                    <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: T.bg, borderRadius: '14px', border: `1px solid ${T.border}` }}>
                                <input 
                                    type="checkbox" 
                                    id="isPartial" 
                                    checked={settlementData.isPartial} 
                                    onChange={e => {
                                        const checked = e.target.checked;
                                        setSettlementData({ 
                                            ...settlementData, 
                                            isPartial: checked,
                                            amount: checked ? (settlementData.amount / 2) : settlementData.fullAmount 
                                        });
                                    }}
                                    style={{ width: '18px', height: '18px', accentColor: T.accent, cursor: 'pointer' }}
                                />
                                <label htmlFor="isPartial" style={{ fontSize: '13px', fontWeight: '700', color: T.text, cursor: 'pointer' }}>Partial Payment</label>
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Amount to Pay (₹)</label>
                                <input 
                                    type="number" 
                                    style={S.input} 
                                    value={settlementData.amount} 
                                    onChange={e => setSettlementData({ ...settlementData, amount: e.target.value })} 
                                    readOnly={!settlementData.isPartial}
                                />
                                {!settlementData.isPartial && <p style={{ fontSize: '10px', fontWeight: '600', color: T.muted, margin: '4px 0 0' }}>Settle full amount of ₹{settlementData.fullAmount}</p>}
                            </div>

                            {settlementData.isPartial && (
                                <div style={{ animation: 'slideUp 0.3s ease' }}>
                                    <label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Balance Due Date</label>
                                    <input 
                                        type="date" 
                                        style={S.input} 
                                        value={settlementData.balanceDueDate} 
                                        onChange={e => setSettlementData({ ...settlementData, balanceDueDate: e.target.value })} 
                                    />
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Reference Number (Optional)</label>
                                <input 
                                    placeholder="e.g. UPI ID or Trans ID" 
                                    style={S.input} 
                                    value={settlementData.referenceNumber} 
                                    onChange={e => setSettlementData({ ...settlementData, referenceNumber: e.target.value })} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" onClick={() => setIsSettleModalOpen(false)} style={{ ...S.btn, flex: 1, background: T.bg, color: T.muted }}>Cancel</button>
                                <button type="submit" disabled={isSettling} style={{ ...S.btn, flex: 2, background: T.accent, color: '#FFF', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.2)' }}>
                                    {isSettling ? 'Processing...' : (settlementData.isPartial ? 'Settle Partially' : 'Settle Full')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} onConfirm={processDeleteInvoice} title="Delete Invoice?" message="This action cannot be undone. Financial records will be permanently removed." confirmText="Delete" type="danger" loading={confirmModal.loading} />
            
            <RightDrawer isOpen={isViewDrawerOpen} onClose={() => setIsViewDrawerOpen(false)} title="Invoice Forensics" subtitle={selectedInvoice?.invoiceNumber} width="450px">
                {fetchingInvoice ? <div style={{ padding: '80px 0' }}><Loader message="Decrypting Invoice..." /></div> : selectedInvoice && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ padding: '24px', background: T.bg, borderRadius: '24px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
                            <p style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '8px' }}>Total Payable Amount</p>
                            <h2 style={{ fontSize: '32px', fontWeight: '900', color: T.text, margin: 0 }}>₹{Number(selectedInvoice.amount).toLocaleString()}</h2>
                            <span style={{ ...S.badge, marginTop: '12px', display: 'inline-block', background: selectedInvoice.status === 'Paid' ? '#ECFDF4' : '#FEF2F2', color: selectedInvoice.status === 'Paid' ? T.success : T.error }}>{selectedInvoice.status}</span>
                        </div>
                        <div style={{ ...S.card, padding: '0', overflow: 'hidden' }}>
                            {[
                                { label: 'Client', value: selectedInvoice.member?.name || 'Walk-in' },
                                { label: 'Branch', value: selectedInvoice.tenant?.name || 'Main' },
                                { label: 'Invoice Date', value: new Date(selectedInvoice.createdAt || selectedInvoice.dueDate).toLocaleDateString() },
                                { label: 'Payment Mode', value: selectedInvoice.paymentMode || selectedInvoice.method || '—' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ padding: '16px 20px', borderBottom: idx === 3 ? 'none' : `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: T.muted }}>{item.label}</span>
                                    <span style={{ fontSize: '12px', fontWeight: '900', color: T.text }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ ...S.card, padding: '0', overflow: 'hidden' }}>
                             <div style={{ padding: '12px 20px', background: T.bg, fontSize: '11px', fontWeight: '900', color: T.muted }}>ITEMS</div>
                             {(selectedInvoice.items || []).map((item, i) => (
                                 <div key={i} style={{ padding: '16px 20px', borderBottom: i === selectedInvoice.items.length - 1 ? 'none' : `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                     <div>
                                         <p style={{ fontSize: '13px', fontWeight: '800', color: T.text, margin: 0 }}>{item.description}</p>
                                         <p style={{ fontSize: '10px', fontWeight: '600', color: T.subtle, margin: 0 }}>Qty: {item.quantity} × ₹{item.rate}</p>
                                     </div>
                                     <span style={{ fontSize: '14px', fontWeight: '900', color: T.text }}>₹{item.amount}</span>
                                 </div>
                             ))}
                        </div>
                        <button onClick={() => setIsViewDrawerOpen(false)} style={{ ...S.btn, background: T.accent, color: '#FFF', height: '48px', borderRadius: '16px' }}>Close View</button>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default Invoices;
