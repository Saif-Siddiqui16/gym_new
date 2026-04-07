import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    BarChart3, Download, Plus, Calendar, TrendingUp, TrendingDown, DollarSign,
    ReceiptText, ArrowUpRight, ArrowDownRight, PieChart, Filter, X, Upload,
    CheckCircle2, ChevronDown, History, MoreVertical, Check
} from 'lucide-react';
import Loader from '../../../components/common/Loader';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Rectangle
} from 'recharts';
import { fetchFinanceStats, addExpense, fetchExpenseCategories } from '../../../api/finance/financeApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import RightDrawer from '../../../components/common/RightDrawer';
import { exportPdf } from '../../../utils/exportPdf';

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

const FinancialDashboard = () => {
    const { selectedBranch, branches } = useBranchContext();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('income');
    const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
    const [categoriesList, setCategoriesList] = useState([]);
    const [formCategoriesList, setFormCategoriesList] = useState([]);

    const [expenseForm, setExpenseForm] = useState({
        title: '', category: '', amount: '', description: '', vendor: '', donor: '',
        branchId: selectedBranch || 'all', date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => { setExpenseForm(prev => ({ ...prev, branchId: selectedBranch || 'all' })); }, [selectedBranch]);

    useEffect(() => {
        const fetchFormCats = async () => {
            try { const cats = await fetchExpenseCategories(expenseForm.branchId); setFormCategoriesList(cats || []); }
            catch (error) { console.error("Failed to fetch form categories", error); }
        };
        if (expenseForm.branchId) fetchFormCats();
    }, [expenseForm.branchId]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [stats, cats] = await Promise.all([fetchFinanceStats(selectedBranch), fetchExpenseCategories(selectedBranch)]);
            setData(stats); setCategoriesList(cats || []);
        } catch (error) { toast.error("Failed to sync financial data"); }
        finally { setLoading(false); }
    }, [selectedBranch]);

    useEffect(() => { loadData(); }, [loadData]);

    const dynamicFormCategories = formCategoriesList.length > 0 ? formCategoriesList.map(c => c.name) : ['Electricity', 'Maintenance', 'Rent', 'Supplies', 'Salary', 'Internet/Network'];

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await addExpense(expenseForm); toast.success("Expense recorded successfully!"); setIsExpenseDrawerOpen(false);
            setExpenseForm({ title: '', category: '', amount: '', description: '', vendor: '', donor: '', branchId: selectedBranch || 'all', date: new Date().toISOString().split('T')[0] });
            loadData();
        } catch (error) { toast.error(error.message || "Failed to add expense"); }
    };

    const handleExport = () => {
        if (!data || !data.transactions || data.transactions.length === 0) return toast.error("No transaction data available");
        try {
            const headers = ["Date", "Type", "Flow", "Member/Entity", "Reference ID", "Branch", "Status", "Amount"];
            const rows = data.transactions.map(txn => [txn.date, txn.type, txn.flow === 'in' ? 'Income' : 'Expense', txn.member, txn.id, txn.branch, txn.status || 'Paid', `₹${txn.amount}`]);
            exportPdf({ title: 'Financial Report', filename: `Finance_Report_${selectedBranch}_${new Date().toISOString().split('T')[0]}`, headers, rows, gymName: "Roar Fitness" });
        } catch (error) { toast.error("Export failed"); }
    };

    if (loading && !data) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', background: T.bg }}>
                <Loader message="Syncing Financial Core..." />
            </div>
        );
    }

    const { summary, monthlyData, transactions } = data || { summary: { totalIncome: 0, totalExpenses: 0, netProfit: 0, margin: 0 }, monthlyData: [], transactions: [] };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Financial Overview</h1>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Real-time business intelligence & revenue tracking</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setIsExpenseDrawerOpen(true)} style={{ ...S.btn, background: T.accent, color: '#FFF', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.2)' }}><Plus size={18} /> Add Expense</button>
                    <button onClick={handleExport} style={{ ...S.btn, background: '#FFF', color: T.text, border: `1px solid ${T.border}` }}><Download size={18} /> Export PDF</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginBottom: '32px' }}>
                {/* Revenue Chart */}
                <div style={{ ...S.card, gridColumn: 'span 8', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>Revenue Analysis</h3>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: T.muted }}>Income vs operational expenses over 6 months</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.accent }} /> <span style={{ fontSize: '11px', fontWeight: '800', color: T.muted }}>INCOME</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F87171' }} /> <span style={{ fontSize: '11px', fontWeight: '800', color: T.muted }}>EXPENSES</span></div>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '350px' }}>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={monthlyData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: T.subtle, fontSize: 10, fontWeight: '800' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: T.subtle, fontSize: 10, fontWeight: '800' }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                                <Tooltip cursor={{ fill: T.bg, radius: 10 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: T.cardShadow, fontSize: '12px', fontWeight: '800' }} />
                                <Bar dataKey="income" fill={T.accent} radius={[6, 6, 0, 0]} barSize={24} />
                                <Bar dataKey="expenses" fill="#F87171" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div style={{ ...S.card, gridColumn: 'span 4', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '150px', height: '150px', background: `radial-gradient(circle, ${T.accentLight} 0%, transparent 70%)`, opacity: 0.5, pointerEvents: 'none' }}></div>
                    <h3 style={{ fontSize: '11px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>Business Summary</h3>
                    
                    <div style={{ marginBottom: '40px' }}>
                        <p style={{ fontSize: '10px', fontWeight: '800', color: T.subtle, textTransform: 'uppercase', marginBottom: '8px' }}>Global Cash Flow</p>
                        <h2 style={{ fontSize: '36px', fontWeight: '900', color: T.text, margin: 0 }}>₹{summary.totalIncome.toLocaleString()}</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '40px' }}>
                        <div style={{ padding: '20px', background: '#F0FDF4', borderRadius: '20px', border: '1px solid #DCFCE7' }}>
                            <p style={{ fontSize: '10px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Net Profit</p>
                            <p style={{ fontSize: '20px', fontWeight: '900', color: T.text, margin: 0 }}>₹{summary.netProfit.toLocaleString()}</p>
                        </div>
                        <div style={{ padding: '20px', background: '#FEF2F2', borderRadius: '20px', border: '1px solid #FEE2E2' }}>
                            <p style={{ fontSize: '10px', fontWeight: '800', color: '#991B1B', textTransform: 'uppercase', marginBottom: '4px' }}>Total Expenses</p>
                            <p style={{ fontSize: '20px', fontWeight: '900', color: T.text, margin: 0 }}>₹{summary.totalExpenses.toLocaleString()}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: T.bg, borderRadius: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase' }}>Profit Margin</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: T.success, fontWeight: '900', fontSize: '14px' }}>
                            <TrendingUp size={16} /> {summary.margin}%
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                {/* Recent Activities */}
                <div style={{ ...S.card, gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px 32px', borderBottom: `1px solid ${T.bg}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <History size={20} color={T.accent} />
                        <h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text }}>Recent Activities</h3>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {transactions.slice(0, 6).map((txn, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: T.bg, borderRadius: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFF', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ReceiptText size={18} /></div>
                                    <div>
                                        <p style={{ fontSize: '12px', fontWeight: '800', color: T.text, margin: 0 }}>{txn.member}</p>
                                        <p style={{ fontSize: '10px', fontWeight: '600', color: T.subtle, textTransform: 'uppercase' }}>{txn.type}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '12px', fontWeight: '900', color: txn.flow === 'in' ? T.text : T.error }}>{txn.flow === 'in' ? '+' : '-'}₹{txn.amount.toLocaleString()}</p>
                                    {txn.status === 'Partial' && (
                                        <p style={{ fontSize: '8px', fontWeight: '800', color: T.error, margin: 0 }}>BAL: ₹{Number(txn.balance || 0).toLocaleString()}</p>
                                    )}
                                    <p style={{ fontSize: '9px', fontWeight: '700', color: T.accent }}>{txn.branch}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Table Tabs */}
                <div style={{ ...S.card, gridColumn: 'span 8', overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: `1px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setActiveTab('income')} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: activeTab === 'income' ? T.accent : 'transparent', color: activeTab === 'income' ? '#FFF' : T.muted, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>Income</button>
                            <button onClick={() => setActiveTab('expenses')} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: activeTab === 'expenses' ? T.error : 'transparent', color: activeTab === 'expenses' ? '#FFF' : T.muted, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>Expenses</button>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase' }}>Showing {transactions.filter(t => t.flow === (activeTab === 'income' ? 'in' : 'out')).length} records</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: T.bg }}>
                                    {['Date', 'Type', 'Branch', 'Entity', 'Status', 'Amount'].map(h => <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.filter(t => t.flow === (activeTab === 'income' ? 'in' : 'out')).map((txn, idx) => (
                                    <tr key={idx} style={{ borderBottom: `1px solid ${T.bg}` }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ fontSize: '13px', fontWeight: '700', color: T.text, margin: 0 }}>{txn.date}</p>
                                            {(txn.status === 'Partial' || txn.status === 'Partially Paid') && txn.balanceDueDate && (
                                                <p style={{ fontSize: '9px', fontWeight: '800', color: '#D97706', margin: '4px 0 0', textTransform: 'uppercase' }}>Balance Due: {new Date(txn.balanceDueDate).toLocaleDateString()}</p>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '900', color: T.text }}>{txn.type}</td>
                                        <td style={{ padding: '16px 24px' }}><span style={{ ...S.badge, background: T.accentLight, color: T.accent }}>{txn.branch}</span></td>
                                        <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '800', color: T.text }}>{txn.member}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ 
                                                ...S.badge, 
                                                background: txn.status === 'Paid' ? '#ecfdf5' : ((txn.status === 'Partial' || txn.status === 'Partially Paid') ? '#eef2ff' : '#fffbeb'), 
                                                color: txn.status === 'Paid' ? T.success : ((txn.status === 'Partial' || txn.status === 'Partially Paid') ? '#6366f1' : '#d97706') 
                                            }}>
                                                {txn.status || 'Paid'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <p style={{ fontSize: '14px', fontWeight: '900', color: txn.flow === 'in' ? T.text : T.error, margin: 0 }}>{txn.flow === 'in' ? '+' : '-'} ₹{txn.totalAmount?.toLocaleString() || txn.amount.toLocaleString()}</p>
                                            {(txn.status === 'Partial' || txn.status === 'Partially Paid') && (
                                                <div style={{ marginTop: '4px' }}>
                                                    <p style={{ fontSize: '9px', fontWeight: '700', color: T.success, margin: 0 }}>Paid: ₹{Number(txn.paidAmount || 0).toLocaleString()}</p>
                                                    <p style={{ fontSize: '9px', fontWeight: '700', color: T.error, margin: 0 }}>Balance: ₹{Number(txn.balance || 0).toLocaleString()}</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <RightDrawer isOpen={isExpenseDrawerOpen} onClose={() => setIsExpenseDrawerOpen(false)} title="Record Expense" subtitle="Operational & maintenance costs" width="450px">
                <form onSubmit={handleAddExpense} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
                    <div style={{ padding: '20px', background: T.accentLight, borderRadius: '20px', border: `1px solid ${T.accentMid}` }}>
                        <label style={{ fontSize: '10px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Assign to Branch *</label>
                        <select required style={{ ...S.input, width: '100%' }} value={expenseForm.branchId} onChange={e => setExpenseForm({ ...expenseForm, branchId: e.target.value })}>
                            <option value="all">Select Branch</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Title / Description *</label><input required style={S.input} placeholder="Electricity Bill - Oct" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value, description: e.target.value })} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Category *</label><select required style={{ ...S.input, width: '100%' }} value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}><option value="">Select Category</option>{dynamicFormCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                            <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Amount (₹) *</label><input required type="number" style={S.input} placeholder="0" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></div>
                        </div>
                        <div><label style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Date</label><input type="date" style={S.input} value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} /></div>
                    </div>

                    <div style={{ position: 'fixed', bottom: 0, right: 0, width: '450px', padding: '24px', background: '#FFF', borderTop: `1px solid ${T.bg}`, display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={() => setIsExpenseDrawerOpen(false)} style={{ ...S.btn, flex: 1, background: T.bg, color: T.muted }}>Cancel</button>
                        <button type="submit" style={{ ...S.btn, flex: 2, background: T.accent, color: '#FFF' }}><CheckCircle2 size={18} /> Submit Expense</button>
                    </div>
                </form>
            </RightDrawer>
        </div>
    );
};

export default FinancialDashboard;
