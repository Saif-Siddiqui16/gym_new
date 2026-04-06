import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, Filter, FileText, IndianRupee, Banknote, Smartphone, CreditCard,
    Tag, Clock, User, History, ArrowLeft, TrendingDown, Calendar, ChevronDown,
    Building, ExternalLink, AlertCircle, Trash2, Save, X
} from 'lucide-react';
import Loader from '../../../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import { fetchExpenses, addExpense, deleteExpense } from '../../../api/finance/financeApi';
import { toast } from 'react-hot-toast';
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

const CustomDropdown = ({ options, value, onChange, icon: Icon }) => {
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
                    cursor: 'pointer', transition: 'all 0.3s ease'
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
                                cursor: 'pointer', transition: 'all 0.2s'
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

const PettyCashPage = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('userData');
    const loggedInUser = userStr ? JSON.parse(userStr) : { name: 'Staff Operator', role: 'STAFF', branchId: 'B001' };
    const isAdminOrManager = ['BRANCH_ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(loggedInUser.role);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });
    const [formData, setFormData] = useState({ title: '', category: '', amount: '', paymentMethod: 'Cash', vendor: '', invoiceNumber: '', notes: '', date: new Date().toISOString().split('T')[0] });

    const categories = ['Cleaning', 'Maintenance', 'Utilities', 'Supplies', 'Miscellaneous'];
    const methods = ['Cash', 'Card', 'Bank Transfer'];

    useEffect(() => {
        const loadExpenses = async () => {
            try { setLoading(true); const data = await fetchExpenses(); setExpenses(data); }
            catch (err) { toast.error("Sync failed"); }
            finally { setLoading(false); }
        };
        loadExpenses();
    }, []);

    const enrichedExpenses = expenses.map(exp => {
        let extra = {};
        if (exp.notes) { try { extra = JSON.parse(exp.notes); } catch { extra = { notes: exp.notes }; } }
        return { ...exp, vendor: extra.vendor || '', paymentMethod: extra.paymentMethod || 'Cash', invoiceNumber: extra.invoiceNumber || '', actualNotes: extra.notes || '', dateStr: exp.date ? new Date(exp.date).toISOString().split('T')[0] : 'N/A' };
    });

    let todayTotal = 0; let monthTotal = 0; let cashTotal = 0; let cardTotal = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();

    enrichedExpenses.forEach(exp => {
        const amt = Number(exp.amount) || 0;
        if (exp.dateStr === todayStr) todayTotal += amt;
        if (new Date(exp.date).getMonth() === currentMonth) monthTotal += amt;
        if (exp.paymentMethod === 'Cash') cashTotal += amt; else cardTotal += amt;
    });

    const filteredExpenses = enrichedExpenses.filter(exp => {
        const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
        const matchesSearch = String(exp.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(exp.vendor || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addExpense({ title: formData.title, category: formData.category, amount: formData.amount, date: formData.date, status: 'Paid', notes: JSON.stringify({ paymentMethod: formData.paymentMethod, vendor: formData.vendor, invoiceNumber: formData.invoiceNumber, notes: formData.notes }) });
            setShowForm(false); setFormData({ title: '', category: '', amount: '', paymentMethod: 'Cash', vendor: '', invoiceNumber: '', notes: '', date: new Date().toISOString().split('T')[0] });
            const updated = await fetchExpenses(); setExpenses(updated); toast.success("Expense logged!");
        } catch (err) { toast.error("Failed to save"); }
    };

    const handleDelete = (id) => setConfirmModal({ isOpen: true, id, loading: false });
    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true })); await deleteExpense(confirmModal.id);
            setExpenses(expenses.filter(e => e.id !== confirmModal.id)); setConfirmModal({ isOpen: false, id: null, loading: false }); toast.success("Record deleted");
        } catch (err) { toast.error("Unauthorized"); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: T.muted, fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '16px', textTransform: 'uppercase' }}><ArrowLeft size={14} /> Back to dashboard</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#F59E0B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(245, 158, 11, 0.2)' }}><Banknote size={32} /></div>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Petty Cash Ledger</h1>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Operational spend & pocket audit</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{ ...S.btn, background: showForm ? '#FFF' : T.text, color: showForm ? T.text : '#FFF', border: showForm ? `1px solid ${T.border}` : 'none', padding: '16px 28px', height: '56px', borderRadius: '18px', boxShadow: showForm ? 'none' : '0 10px 20px rgba(0,0,0,0.1)' }}>{showForm ? 'CLOSE ENTRY' : <><Plus size={18} /> LOG DAILY SPEND</>}</button>
            </div>

            {isAdminOrManager && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {[
                        { label: "Today's Spent", value: `₹${todayTotal.toLocaleString()}`, icon: TrendingDown, color: '#DC2626', bg: '#FEF2F2' },
                        { label: "Monthly Burn", value: `₹${monthTotal.toLocaleString()}`, icon: Calendar, color: T.success, bg: '#ECFDF5' },
                        { label: "Cash Usage", value: `₹${cashTotal.toLocaleString()}`, icon: IndianRupee, color: '#F59E0B', bg: '#FFFBEB' },
                        { label: "Digital Paid", value: `₹${cardTotal.toLocaleString()}`, icon: CreditCard, color: T.accent, bg: T.accentLight },
                    ].map((s, i) => (
                        <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', animation: `slideUp 0.4s ease forwards ${i * 0.1}s` }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={24} color={s.color} /></div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</p>
                                <p style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div style={{ ...S.card, padding: '40px', marginBottom: '40px', animation: 'slideUp 0.4s ease' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Entry Fundamentals</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                <div><label style={{ fontSize: '12px', fontWeight: '700', color: T.muted, marginBottom: '8px', display: 'block' }}>Expense Description *</label><input required placeholder="e.g. Water bottles" style={{ ...S.input, width: '100%' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                                <div><label style={{ fontSize: '12px', fontWeight: '700', color: T.muted, marginBottom: '8px', display: 'block' }}>Category *</label><select required style={{ ...S.input, width: '100%' }} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}><option value="">Select...</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div><label style={{ fontSize: '12px', fontWeight: '700', color: T.muted, marginBottom: '8px', display: 'block' }}>Amount (₹) *</label><input required type="number" placeholder="0.00" style={{ ...S.input, width: '100%', fontWeight: '900' }} value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} /></div>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Audit Details</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                <div><label style={{ fontSize: '12px', fontWeight: '700', color: T.muted, marginBottom: '8px', display: 'block' }}>Method</label><select style={{ ...S.input, width: '100%' }} value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}>{methods.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                                <div><label style={{ fontSize: '12px', fontWeight: '700', color: T.muted, marginBottom: '8px', display: 'block' }}>Vendor</label><input placeholder="Optional" style={{ ...S.input, width: '100%' }} value={formData.vendor} onChange={e => setFormData({ ...formData, vendor: e.target.value })} /></div>
                                <div><label style={{ fontSize: '12px', fontWeight: '700', color: T.muted, marginBottom: '8px', display: 'block' }}>Invoice ID</label><input placeholder="e.g. IN-99" style={{ ...S.input, width: '100%' }} value={formData.invoiceNumber} onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} /></div>
                                <div><label style={{ fontSize: '12px', fontWeight: '700', color: T.muted, marginBottom: '8px', display: 'block' }}>Date</label><input type="date" style={{ ...S.input, width: '100%', fontSize: '12px' }} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
                            </div>
                        </div>
                        <div><label style={{ fontSize: '12px', fontWeight: '700', color: T.muted, marginBottom: '8px', display: 'block' }}>Internal Memo / Notes</label><textarea placeholder="Add context for approval..." style={{ ...S.input, width: '100%', height: '100px', padding: '16px', resize: 'none' }} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button type="submit" style={{ ...S.btn, background: T.success, color: '#FFF', padding: '0 40px', height: '56px', fontSize: '14px', borderRadius: '18px' }}><Save size={20} /> COMMITT TO LEDGER</button></div>
                    </form>
                </div>
            )}

            <div style={S.card}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div style={{ flex: 1, position: 'relative' }}><Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} /><input placeholder="Filter by description or vendor..." style={{ ...S.input, width: '100%', paddingLeft: '48px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                    <CustomDropdown options={['All', ...categories]} value={selectedCategory} onChange={setSelectedCategory} icon={Filter} />
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                {['Transaction ID', 'Description', 'Category', 'Method', 'Logged By', 'Amount', 'Actions'].map(h => <th key={h} style={{ padding: '20px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ padding: '80px 0' }}><Loader message="Fetching Ledger..." /></td></tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '100px' }}><div style={{ opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><History size={48} color={T.subtle} /><p style={{ fontSize: '14px', fontWeight: '800', color: T.subtle, marginTop: '12px', margin: 0 }}>No records found</p></div></td></tr>
                            ) : (
                                filteredExpenses.map((exp, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                        <td style={{ padding: '20px 24px' }}><p style={{ fontSize: '13px', fontWeight: '800', color: T.text, margin: 0 }}>{exp.dateStr}</p><p style={{ fontSize: '10px', fontWeight: '600', color: T.subtle, margin: 0 }}>#{exp.id}</p></td>
                                        <td style={{ padding: '20px 24px' }}><p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{exp.title}</p><p style={{ fontSize: '11px', fontWeight: '600', color: T.muted, margin: 0 }}>{exp.vendor || 'Local'}</p></td>
                                        <td style={{ padding: '20px 24px' }}><span style={{ ...S.badge, background: T.accentLight, color: T.accent }}>{exp.category}</span></td>
                                        <td style={{ padding: '20px 24px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase' }}>{exp.paymentMethod === 'Cash' ? <Banknote size={14} /> : <CreditCard size={14} />} {exp.paymentMethod}</div></td>
                                        <td style={{ padding: '20px 24px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '32px', height: '32px', borderRadius: '8px', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color={T.subtle} /></div><span style={{ fontSize: '12px', fontWeight: '700', color: T.text }}>{exp.addedBy || 'Staff'}</span></div></td>
                                        <td style={{ padding: '20px 24px', fontSize: '16px', fontWeight: '900', color: T.text }}>₹{Number(exp.amount).toLocaleString()}</td>
                                        <td style={{ padding: '20px 24px' }}>{isAdminOrManager && <button onClick={() => handleDelete(exp.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.bg, border: 'none', color: T.error, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} onConfirm={processDelete} title="Purge Record?" message="This entry will be permanently removed from branch financial logs. This action cannot be undone." confirmText="Delete" type="danger" loading={confirmModal.loading} />
        </div>
    );
};

export default PettyCashPage;
