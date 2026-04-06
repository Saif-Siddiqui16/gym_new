import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Plus, Filter, FileText, Calendar, DollarSign, Search, Receipt, TrendingDown,
    PieChart, Users, AlertCircle, CheckCircle, Clock, ChevronDown, X
} from 'lucide-react';
import Loader from '../../../components/common/Loader';
import RightDrawer from '../../../components/common/RightDrawer';
import { fetchExpenses, addExpense, fetchExpenseCategories } from '../../../api/finance/financeApi';
import { useBranchContext } from '../../../context/BranchContext';

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
                    <span style={{ fontSize: '14px', fontWeight: '600', color: T.text }}>{value === '' ? placeholder : value}</span>
                </div>
                <ChevronDown size={18} color={T.muted} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </button>
            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: '#FFF', borderRadius: '16px', border: `1px solid ${T.border}`,
                    boxShadow: '0 15px 30px -5px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden'
                }}>
                    <button type="button" onClick={() => { onChange(''); setIsOpen(false); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', color: T.text, fontSize: '14px', fontWeight: '600', textAlign: 'left', cursor: 'pointer' }}>{placeholder}</button>
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
                            {value === opt && <CheckCircle size={16} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Expenses = () => {
    const { selectedBranch, branches } = useBranchContext();
    const [expenses, setExpenses] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [formCategoriesList, setFormCategoriesList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showAddDrawer, setShowAddDrawer] = useState(false);
    const [loading, setLoading] = useState(true);

    const [newExpense, setNewExpense] = useState({
        title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '', status: 'Pending', branchId: selectedBranch || 'all'
    });

    useEffect(() => { setNewExpense(prev => ({ ...prev, branchId: selectedBranch || 'all' })); }, [selectedBranch]);

    useEffect(() => {
        const fetchFormCats = async () => {
            try { const cats = await fetchExpenseCategories(newExpense.branchId); setFormCategoriesList(cats || []); }
            catch (error) { console.error('Failed to fetch form categories', error); }
        };
        if (newExpense.branchId) fetchFormCats();
    }, [newExpense.branchId]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [data, cats] = await Promise.all([fetchExpenses(selectedBranch), fetchExpenseCategories(selectedBranch)]);
            setExpenses(data); setCategoriesList(cats || []);
        } catch (error) { console.error('Failed to fetch data', error); }
        finally { setLoading(false); }
    }, [selectedBranch]);

    useEffect(() => { loadData(); }, [loadData]);

    const dynamicCategories = useMemo(() => {
        const list = categoriesList.map(c => c.name);
        return list.length > 0 ? list : ['Rent', 'Maintenance', 'Salary', 'Utilities', 'Marketing', 'Supplies', 'Others'];
    }, [categoriesList]);

    const dynamicFormCategories = useMemo(() => {
        const list = formCategoriesList.map(c => c.name);
        return list.length > 0 ? list : ['Rent', 'Maintenance', 'Salary', 'Utilities', 'Marketing', 'Supplies', 'Others'];
    }, [formCategoriesList]);

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) || (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === '' || expense.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const categoryBreakdown = dynamicCategories.map(cat => {
        const amount = expenses.filter(e => e.category === cat).reduce((sum, exp) => sum + Number(exp.amount), 0);
        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
        return { category: cat, amount, percentage };
    }).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const added = await addExpense(newExpense);
            setExpenses([added, ...expenses]);
            setShowAddDrawer(false);
            setNewExpense({ title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '', status: 'Pending', branchId: selectedBranch || 'all' });
        } catch (error) { console.error('Failed to add expense', error); }
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Operational Expenses</h1>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Track overheads, utility costs & vendor payments</p>
                </div>
                <button onClick={() => setShowAddDrawer(true)} style={{ ...S.btn, background: T.accent, color: '#FFF', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.2)' }}><Plus size={18} /> Log New Expense</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
                <div style={{ ...S.card, padding: '32px', gridColumn: 'span 1' }}>
                    <p style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Monthly Burn</p>
                    <h2 style={{ fontSize: '36px', fontWeight: '900', color: T.text, margin: '0 0 24px' }}>₹{totalExpenses.toLocaleString()}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {categoryBreakdown.slice(0, 3).map((item, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', color: T.text, marginBottom: '6px' }}>
                                    <span>{item.category}</span>
                                    <span>₹{item.amount.toLocaleString()}</span>
                                </div>
                                <div style={{ height: '6px', background: T.bg, borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${item.percentage}%`, background: T.accent, borderRadius: '3px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ ...S.card, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '32px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#ECFDF5', color: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={24} /></div>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '4px' }}>Paid Amount</p>
                            <p style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>₹{expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}</p>
                        </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={24} /></div>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', marginBottom: '4px' }}>Pending Amount</p>
                            <p style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>₹{expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}</p>
                        </div>
                     </div>
                </div>
                <div style={{ ...S.card, padding: '32px', background: T.accent, color: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                     <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><PieChart size={32} color="#FFF" /></div>
                     <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 4px' }}>Budget Health</h3>
                     <p style={{ fontSize: '13px', fontWeight: '600', opacity: 0.8 }}>Spending is within normal parameters for this branch.</p>
                </div>
            </div>

            <div style={{ ...S.card, overflow: 'visible' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CustomDropdown options={dynamicCategories} value={filterCategory} onChange={setFilterCategory} placeholder="All Categories" icon={Filter} />
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Search expenses..." style={{ ...S.input, width: '100%', paddingLeft: '48px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: T.bg }}>
                                {['Date', 'Branch', 'Title', 'Category', 'Notes', 'Amount'].map(h => <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '80px 0' }}><Loader message="Fetching expenses..." /></td></tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '80px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: T.subtle }}>No expenses logged yet.</td></tr>
                            ) : (
                                filteredExpenses.map((expense, idx) => (
                                    <tr key={idx} style={{ borderBottom: `1px solid ${T.bg}`, transition: 'all 0.2s' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: T.subtle }}><Calendar size={14} /> {new Date(expense.date).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}><span style={{ ...S.badge, background: T.accentLight, color: T.accent }}>{expense.tenant?.name || 'Main'}</span></td>
                                        <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '800', color: T.text }}>{expense.title}</td>
                                        <td style={{ padding: '20px 24px' }}><span style={{ fontSize: '11px', fontWeight: '800', color: T.muted, background: T.bg, padding: '4px 10px', borderRadius: '8px' }}>{expense.category}</span></td>
                                        <td style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '600', color: T.subtle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{expense.notes || '—'}</td>
                                        <td style={{ padding: '20px 24px', fontSize: '16px', fontWeight: '900', color: T.text, textAlign: 'right' }}>₹{Number(expense.amount).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RightDrawer isOpen={showAddDrawer} onClose={() => setShowAddDrawer(false)} title="Log Expense" subtitle="Record new operational cost" width="450px">
                <form onSubmit={handleAddExpense} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
                    <div style={{ padding: '20px', background: T.accentLight, borderRadius: '20px', border: `1px solid ${T.accentMid}` }}>
                        <label style={{ fontSize: '10px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Assign to Branch *</label>
                        <select required style={{ ...S.input, width: '100%' }} value={newExpense.branchId} onChange={(e) => setNewExpense({ ...newExpense, branchId: e.target.value })}>
                            <option value="all">Select Branch</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Expense Title *</label><input required style={S.input} placeholder="Electricity Bill Jan..." value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Category *</label><select required style={{ ...S.input, width: '100%' }} value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}><option value="">Select</option>{dynamicFormCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                            <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Amount (₹) *</label><input required type="number" style={S.input} placeholder="0" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Expense Date</label><input type="date" style={S.input} value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} /></div>
                            <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Status</label><select style={{ ...S.input, width: '100%' }} value={newExpense.status} onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value })}><option value="Pending">Pending</option><option value="Paid">Paid</option></select></div>
                        </div>
                        <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Notes</label><textarea rows="4" style={{ ...S.input, height: '120px', paddingTop: '12px', resize: 'none' }} placeholder="Additional details..." value={newExpense.notes} onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}></textarea></div>
                    </div>

                    <div style={{ position: 'fixed', bottom: 0, right: 0, width: '450px', padding: '24px', background: '#FFF', borderTop: `1px solid ${T.bg}`, display: 'flex', gap: '12px', zIndex: 10 }}>
                        <button type="button" onClick={() => setShowAddDrawer(false)} style={{ ...S.btn, flex: 1, background: T.bg, color: T.muted }}>Discard</button>
                        <button type="submit" style={{ ...S.btn, flex: 2, background: T.accent, color: '#FFF' }}><CheckCircle size={18} /> Save Expense</button>
                    </div>
                </form>
            </RightDrawer>
        </div>
    );
};

export default Expenses;
