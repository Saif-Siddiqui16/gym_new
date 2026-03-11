import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    FileText,
    IndianRupee,
    Banknote,
    Smartphone,
    CreditCard,
    Tag,
    Clock,
    User,
    History,
    ArrowLeft,
    TrendingDown,
    Calendar,
    ChevronDown,
    Building,
    ExternalLink,
    AlertCircle,
    Trash2,
    Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchExpenses, addExpense, deleteExpense } from '../../../api/finance/financeApi';

const PettyCashPage = () => {
    const navigate = useNavigate();

    // Auth Check
    const userStr = localStorage.getItem('userData');
    const loggedInUser = userStr ? JSON.parse(userStr) : {
        name: 'Staff Operator',
        role: 'STAFF',
        branchId: 'B001'
    };

    const isAdminOrManager = ['BRANCH_ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(loggedInUser.role);

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const loadExpenses = async () => {
            try {
                const data = await fetchExpenses();
                setExpenses(data);
            } catch (err) {
                console.error("Failed fetching expenses:", err);
            }
        };
        loadExpenses();
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        amount: '',
        paymentMethod: 'Cash',
        vendor: '',
        invoiceNumber: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = ['Cleaning', 'Maintenance', 'Utilities', 'Supplies', 'Miscellaneous'];
    const methods = ['Cash', 'Card', 'Bank Transfer'];

    // Enrichment mapping (parsing custom fields stored inside notes JSON)
    const enrichedExpenses = expenses.map(exp => {
        let extra = {};
        if (exp.notes) {
            try { extra = JSON.parse(exp.notes); }
            catch { extra = { notes: exp.notes }; }
        }
        return {
            ...exp,
            vendor: extra.vendor || '',
            paymentMethod: extra.paymentMethod || 'Cash',
            invoiceNumber: extra.invoiceNumber || '',
            actualNotes: extra.notes || '',
            dateStr: exp.date ? new Date(exp.date).toISOString().split('T')[0] : 'N/A'
        };
    });

    // KPI Generation
    let todayTotal = 0; let monthTotal = 0; let cashTotal = 0; let cardTotal = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();

    enrichedExpenses.forEach(exp => {
        const amt = Number(exp.amount) || 0;
        if (exp.dateStr === todayStr) todayTotal += amt;
        if (new Date(exp.date).getMonth() === currentMonth) monthTotal += amt;
        if (exp.paymentMethod === 'Cash') cashTotal += amt;
        else cardTotal += amt;
    });

    // Filter Logic
    const filteredExpenses = enrichedExpenses.filter(exp => {
        const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
        const matchesSearch = String(exp.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(exp.vendor || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await addExpense({
                title: formData.title,
                category: formData.category,
                amount: formData.amount,
                date: formData.date,
                status: 'Paid',
                notes: JSON.stringify({
                    paymentMethod: formData.paymentMethod,
                    vendor: formData.vendor,
                    invoiceNumber: formData.invoiceNumber,
                    notes: formData.notes
                })
            });

            setShowForm(false);
            setFormData({
                title: '', category: '', amount: '', paymentMethod: 'Cash',
                vendor: '', invoiceNumber: '', notes: '',
                date: new Date().toISOString().split('T')[0]
            });

            // Reload manually or force reload
            const updated = await fetchExpenses();
            setExpenses(updated);
        } catch (err) {
            console.error("Failed to add expense:", err);
            alert("Failed to create expense. Check console for details.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) return;

        try {
            await deleteExpense(id);
            // Instantly remove from local UI state to update KPIs gracefully
            const updated = expenses.filter(e => e.id !== id);
            setExpenses(updated);
        } catch (err) {
            console.error("Failed to delete expense:", err);
            alert("Failed to delete expense. You may not have permission.");
        }
    };

    return (
        <div className="min-h-screen ">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-4 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                                <ArrowLeft size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back</span>
                        </button>
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
                                <Banknote size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                                    {isAdminOrManager ? 'Petty Cash / Expenses' : 'Log Expense'}
                                </h1>
                                <p className="text-slate-500 font-medium italic">Track operational spending and petty cash logs for {loggedInUser.branchName || loggedInUser.branchId || 'Gym'}.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${showForm
                            ? 'bg-white border-2 border-slate-100 text-slate-500 hover:border-slate-200'
                            : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-slate-200'
                            }`}
                    >
                        {showForm ? 'Cancel Entry' : <><Plus size={18} /> New Expense</>}
                    </button>
                </div>

                {/* Summary KPIs - Only for Admin/Manager */}
                {isAdminOrManager && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl group hover:border-orange-200 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-orange-50 text-orange-500 group-hover:scale-110 transition-transform">
                                    <TrendingDown size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</p>
                                    <h4 className="text-2xl font-black text-slate-800 tabular-nums">₹{todayTotal.toLocaleString()}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl group hover:border-rose-200 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-rose-50 text-rose-500 group-hover:scale-110 transition-transform">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">This Month</p>
                                    <h4 className="text-2xl font-black text-slate-800 tabular-nums">₹{monthTotal.toLocaleString()}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl group hover:border-emerald-200 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-500 group-hover:scale-110 transition-transform">
                                    <IndianRupee size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Used</p>
                                    <h4 className="text-2xl font-black text-slate-800 tabular-nums">₹{cashTotal.toLocaleString()}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl group hover:border-violet-200 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-primary-light text-primary group-hover:scale-110 transition-transform">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital/Card</p>
                                    <h4 className="text-2xl font-black text-slate-800 tabular-nums">₹{cardTotal.toLocaleString()}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Entry Form */}
                {showForm && (
                    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 mb-12 animate-in slide-in-from-top-4 duration-500 overflow-hidden relative">
                        {/* Decorative Background Accent */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>

                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12 relative">
                            {/* Section: Basic Information */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Expense Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Expense Title*</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Drinking Water"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full h-15 px-6 rounded-2xl border-2 border-slate-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-sm outline-none transition-all bg-slate-50/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Category*</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full h-15 px-6 rounded-2xl border-2 border-slate-100 focus:border-orange-500 font-bold text-sm outline-none bg-slate-50/50 appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Amount (₹)*</label>
                                        <div className="relative">
                                            <IndianRupee size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.amount}
                                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full h-15 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-black text-slate-800 outline-none transition-all bg-slate-50/50 tabular-nums"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Transaction & Date */}
                            <div className="space-y-8 pt-8 border-t border-slate-50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Payment & Vendor</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Payment Method</label>
                                        <div className="relative">
                                            <select
                                                value={formData.paymentMethod}
                                                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                className="w-full h-15 px-6 rounded-2xl border-2 border-slate-100 focus:border-orange-500 font-bold text-sm outline-none bg-slate-50/50 appearance-none cursor-pointer"
                                            >
                                                {methods.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Vendor Name</label>
                                        <div className="relative">
                                            <Building size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input
                                                type="text"
                                                placeholder="Optional"
                                                value={formData.vendor}
                                                onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                                                className="w-full h-15 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-orange-500 font-bold text-sm outline-none bg-slate-50/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Invoice Number</label>
                                        <div className="relative">
                                            <FileText size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input
                                                type="text"
                                                placeholder="Optional"
                                                value={formData.invoiceNumber}
                                                onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                                className="w-full h-15 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-orange-500 font-bold text-sm outline-none bg-slate-50/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Expense Date</label>
                                        <div className="relative">
                                            <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full h-15 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-orange-500 font-bold text-sm outline-none bg-slate-50/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-slate-50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1.5 h-6 bg-slate-400 rounded-full"></div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Additional Notes</h3>
                                </div>
                                <textarea
                                    rows="3"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full p-8 rounded-[2rem] border-2 border-slate-100 focus:border-orange-500 font-bold text-sm outline-none bg-slate-50/50 min-h-[120px] transition-all"
                                    placeholder="Add any specific details about this purchase, purpose, or approval..."
                                />
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    className="px-12 py-5 bg-gradient-to-r from-orange-500 via-rose-500 to-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-orange-500/30 hover:scale-[1.02] hover:shadow-orange-500/40 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    <Save size={20} />
                                    Save Daily Expense
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search & Audit Table */}
                <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by title or vendor..."
                                className="w-full h-14 pl-14 pr-6 rounded-2xl border-2 border-slate-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-sm outline-none transition-all bg-slate-50/30"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="h-14 px-6 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-500 outline-none focus:border-orange-500 transition-all"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full hidden md:table">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & ID</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Expense Item</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Method</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logged By</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                    {isAdminOrManager && <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredExpenses.map(exp => (
                                    <tr key={exp.id || Math.random()} className="group hover:bg-orange-50/20 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-800 tabular-nums">{exp.dateStr}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">EXP-{exp.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">{exp.title}</span>
                                                <span className="text-[10px] font-medium text-slate-400 italic">{exp.vendor || 'Local Vendor'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                                                <Tag size={10} />
                                                {exp.category}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                {exp.paymentMethod === 'Cash' ? <Banknote size={16} /> : <CreditCard size={16} />}
                                                <span className="text-[10px] font-bold uppercase">{exp.paymentMethod}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-700 leading-none mb-0.5">{exp.addedBy || 'Staff'}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Operator</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-base font-black text-slate-900 tabular-nums">₹{Number(exp.amount).toLocaleString()}</span>
                                        </td>
                                        {isAdminOrManager && (
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(exp.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete Expense"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Stacked View */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {filteredExpenses.map(exp => (
                                <div key={exp.id || Math.random()} className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{exp.dateStr}</span>
                                            <h4 className="text-base font-black text-slate-900 leading-tight">{exp.title}</h4>
                                            <p className="text-xs font-medium text-slate-400">{exp.vendor || 'Local Vendor'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-black text-slate-900 tabular-nums block leading-none">₹{Number(exp.amount).toLocaleString()}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border mt-2 inline-block ${exp.paymentMethod === 'Cash' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-primary-light border-violet-100 text-primary'
                                                }`}>
                                                {exp.paymentMethod}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User size={14} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase">{exp.addedBy || 'Staff'}</span>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-lg">
                                                {exp.category}
                                            </span>
                                            {isAdminOrManager && (
                                                <button
                                                    onClick={() => handleDelete(exp.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PettyCashPage;
