import React, { useState, useEffect } from 'react';
import { Plus, Filter, FileText, Calendar, DollarSign, Search, Receipt, TrendingDown, PieChart, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import '../../../styles/GlobalDesign.css';
import { fetchExpenses, addExpense } from '../../../api/finance/financeApi';

const CATEGORIES = ['Rent', 'Maintenance', 'Salary', 'Utilities', 'Marketing', 'Supplies', 'Others'];

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showAddDrawer, setShowAddDrawer] = useState(false);
    const [loading, setLoading] = useState(true);

    const [newExpense, setNewExpense] = useState({
        title: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'Pending'
    });

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await fetchExpenses();
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === '' || expense.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Category-wise breakdown for the month
    const categoryBreakdown = CATEGORIES.map(cat => {
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
            setNewExpense({
                title: '',
                category: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                notes: '',
                status: 'Pending'
            });
        } catch (error) {
            console.error('Failed to add expense', error);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-white to-violet-50/30 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <TrendingDown size={36} className="text-violet-600" />
                            Operations Expenses
                        </h1>
                        <p className="text-gray-500 font-medium mt-1.5 flex items-center gap-2 text-sm">
                            Manage operational costs and track spending categories.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddDrawer(true)}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-violet-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
                    >
                        <Plus size={18} />
                        Log New Expense
                    </button>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Summary Card */}
                    <div className="bg-slate-900 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <PieChart size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Expenses (Current)</p>
                            <h2 className="text-5xl font-black mb-6">₹{totalExpenses.toLocaleString()}</h2>

                            <div className="space-y-4">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Category Breakdown</p>
                                <div className="space-y-3">
                                    {categoryBreakdown.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span>{item.category}</span>
                                                <span>₹{item.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {categoryBreakdown.length > 3 && (
                                        <p className="text-[10px] text-slate-500 text-center pt-2 font-bold">+ {categoryBreakdown.length - 3} more categories</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Paid Expenses</p>
                                <h3 className="text-3xl font-black text-slate-900">
                                    ₹{expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}
                                </h3>
                                <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                                    <CheckCircle size={12} /> Fullfilled payments
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between text-left">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Pending Amount</p>
                                <h3 className="text-3xl font-black text-slate-900">
                                    ₹{expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}
                                </h3>
                                <p className="text-xs text-amber-600 font-bold mt-2 flex items-center gap-1">
                                    <AlertCircle size={12} /> Awaiting verification
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-violet-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title or notes..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Listing Table */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden">
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        <div className="space-y-4 p-4">
                            {filteredExpenses.map((expense) => (
                                <div key={expense.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-100">
                                                    {expense.category}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-sm">{expense.title}</h4>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-base font-black text-slate-900">
                                                ₹{Number(expense.amount).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {expense.notes && (
                                        <div className="bg-slate-50 p-3 rounded-lg mb-3">
                                            <p className="text-xs font-medium text-slate-500 line-clamp-2 italic">
                                                "{expense.notes}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                {expense.addedBy?.[0] || 'A'}
                                            </div>
                                            <span>{expense.addedBy || 'System'}</span>
                                        </div>
                                        <button className="text-violet-600 text-xs font-black uppercase tracking-wide">View Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredExpenses.length === 0 && (
                            <div className="p-12 text-center">
                                <Receipt size={48} className="text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No expenses found</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Title</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Added By</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                <Calendar size={14} className="text-violet-500" />
                                                {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-black text-slate-900 group-hover:text-violet-600 transition-colors">
                                                {expense.title}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-100">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs font-medium text-slate-500 max-w-[200px] truncate" title={expense.notes}>
                                                {expense.notes || '—'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                    {expense.addedBy?.[0] || 'A'}
                                                </div>
                                                {expense.addedBy || 'System'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="text-base font-black text-slate-900">
                                                ₹{Number(expense.amount).toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredExpenses.length === 0 && (
                            <div className="p-20 text-center">
                                <Receipt size={48} className="text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No expenses found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Expense Drawer */}
            <RightDrawer
                isOpen={showAddDrawer}
                onClose={() => setShowAddDrawer(false)}
                title="Log Operational Expense"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Expense Title</label>
                        <input
                            required
                            type="text"
                            value={newExpense.title}
                            onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                            placeholder="e.g. Electricity Bill Jan 2024"
                            className="w-full px-5 py-4 border-2 border-slate-100 rounded-[24px] focus:border-violet-500 outline-none font-bold text-gray-900 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
                            <select
                                required
                                value={newExpense.category}
                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                className="w-full px-5 py-4 border-2 border-slate-100 rounded-[24px] focus:border-violet-500 outline-none font-bold text-gray-900 transition-all bg-slate-50/50 appearance-none cursor-pointer"
                            >
                                <option value="">Select</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Amount (₹)</label>
                            <input
                                required
                                type="number"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                placeholder="0"
                                className="w-full px-5 py-4 border-2 border-slate-100 rounded-[24px] focus:border-violet-500 outline-none font-bold text-gray-900 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Expense Date</label>
                            <input
                                required
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                className="w-full px-5 py-4 border-2 border-slate-100 rounded-[24px] focus:border-violet-500 outline-none font-bold text-gray-900 transition-all bg-slate-50/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</label>
                            <select
                                required
                                value={newExpense.status}
                                onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value })}
                                className="w-full px-5 py-4 border-2 border-slate-100 rounded-[24px] focus:border-violet-500 outline-none font-bold text-gray-900 transition-all bg-slate-50/50 appearance-none cursor-pointer"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Additional Notes</label>
                        <textarea
                            rows="4"
                            value={newExpense.notes}
                            onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                            placeholder="Mention utility month, invoice reference, etc..."
                            className="w-full px-5 py-4 border-2 border-slate-100 rounded-[24px] focus:border-violet-500 outline-none font-bold text-gray-900 transition-all resize-none bg-slate-50/50"
                        ></textarea>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => setShowAddDrawer(false)}
                            className="flex-1 px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all uppercase tracking-widest"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] px-8 py-4 bg-violet-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Save Expense
                        </button>
                    </div>
                </form>
            </RightDrawer>
        </div>
    );
};

export default Expenses;
