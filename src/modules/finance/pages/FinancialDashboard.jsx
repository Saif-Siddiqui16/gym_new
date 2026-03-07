import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    Plus,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ReceiptText,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Filter,
    X,
    Upload,
    CheckCircle2,
    ChevronDown,
    History
} from 'lucide-react';
import { fetchFinanceStats, addExpense, fetchExpenseCategories } from '../../../api/finance/financeApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import RightDrawer from '../../../components/common/RightDrawer';
import StatsCard from '../../dashboard/components/StatsCard';

const FinancialDashboard = () => {
    const { selectedBranch, branches } = useBranchContext();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('income'); // income, expenses
    const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
    const [categoriesList, setCategoriesList] = useState([]);
    const [formCategoriesList, setFormCategoriesList] = useState([]);

    // Form data for adding expense
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        category: '',
        amount: '',
        description: '',
        vendor: '',
        donor: '',
        branchId: selectedBranch || 'all',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        setExpenseForm(prev => ({ ...prev, branchId: selectedBranch || 'all' }));
    }, [selectedBranch]);

    useEffect(() => {
        const fetchFormCats = async () => {
            try {
                const cats = await fetchExpenseCategories(expenseForm.branchId);
                setFormCategoriesList(cats || []);
            } catch (error) {
                console.error("Failed to fetch form categories", error);
            }
        };
        if (expenseForm.branchId) {
            fetchFormCats();
        }
    }, [expenseForm.branchId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [stats, cats] = await Promise.all([
                fetchFinanceStats(selectedBranch),
                fetchExpenseCategories(selectedBranch)
            ]);
            setData(stats);
            setCategoriesList(cats || []);
        } catch (error) {
            console.error("Failed to load finance stats", error);
            toast.error("Failed to sync financial data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedBranch]);

    const dynamicCategories = categoriesList.length > 0
        ? categoriesList.map(c => c.name)
        : ['Electricity', 'Maintenance', 'Rent', 'Supplies', 'Salary', 'Internet/Network'];

    const dynamicFormCategories = formCategoriesList.length > 0
        ? formCategoriesList.map(c => c.name)
        : ['Electricity', 'Maintenance', 'Rent', 'Supplies', 'Salary', 'Internet/Network'];

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await addExpense(expenseForm);
            toast.success("Expense recorded successfully!");
            setIsExpenseDrawerOpen(false);
            setExpenseForm({
                title: '',
                category: '',
                amount: '',
                description: '',
                vendor: '',
                donor: '',
                branchId: selectedBranch || 'all',
                date: new Date().toISOString().split('T')[0]
            });
            loadData(); // Refresh overview
        } catch (error) {
            toast.error(error.message || "Failed to add expense");
        }
    };

    const handleExport = () => {
        if (!data || !data.transactions || data.transactions.length === 0) {
            toast.error("No transaction data available to export");
            return;
        }

        try {
            // Define CSV headers
            const headers = ["Date", "Type", "Flow", "Member/Entity", "Reference ID", "Branch", "Status", "Amount"];

            // Map transaction data to CSV rows
            const rows = data.transactions.map(txn => [
                txn.date,
                txn.type,
                txn.flow === 'in' ? 'Income' : 'Expense',
                `"${txn.member.replace(/"/g, '""')}"`, // Handle names with commas
                txn.id,
                `"${txn.branch.replace(/"/g, '""')}"`,
                txn.status || 'Paid',
                txn.amount
            ]);

            // Combine into CSV string
            const csvContent = [
                headers.join(","),
                ...rows.map(row => row.join(","))
            ].join("\n");

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const filename = `Finance_Report_${selectedBranch}_${new Date().toISOString().split('T')[0]}.csv`;

            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Financial report exported successfully!");
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Failed to generate export file");
        }
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc]">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Financial Core...</p>
            </div>
        );
    }

    const { summary, monthlyData, transactions } = data || {
        summary: { totalIncome: 0, totalExpenses: 0, netProfit: 0, margin: 0 },
        monthlyData: [],
        transactions: []
    };

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-screen-2xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finance Dashboard</h1>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Core Financial Intelligence</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            onClick={() => setIsExpenseDrawerOpen(true)}
                            variant="primary"
                            className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform active:scale-95"
                            icon={Plus}
                        >
                            Add Expense
                        </Button>
                        <button
                            onClick={handleExport}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <Download size={18} /> Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Revenue Report Chart Section */}
                    <div className="lg:col-span-8 min-w-0 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10 flex flex-col transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-sm">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Report</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Monthly earnings vs expenses</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[400px] overflow-x-auto scrollbar-hide pb-8 px-4">
                            <div className="flex items-end justify-between gap-4 md:gap-10 min-w-[700px] h-full px-6">
                                {monthlyData.map((m, idx) => {
                                    const maxVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses))) || 1;
                                    const incomePercent = (m.income / maxVal) * 100;
                                    const expensePercent = (m.expenses / maxVal) * 100;

                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-6 group">
                                            <div className="w-full flex justify-center gap-1.5 h-[220px] items-end">
                                                {/* Income Bar */}
                                                <div
                                                    className="w-6 bg-[#7c3aed] rounded-t-xl transition-all duration-700 hover:w-8 hover:shadow-lg hover:shadow-violet-200 cursor-help relative group/bar"
                                                    style={{ height: `${Math.max(5, incomePercent)}%` }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-20 transition-all shadow-xl">
                                                        ₹{m.income.toLocaleString()}
                                                    </div>
                                                </div>
                                                {/* Expense Bar */}
                                                <div
                                                    className="w-6 bg-slate-100/80 rounded-t-xl transition-all duration-700 hover:w-8 hover:shadow-lg hover:shadow-slate-200 cursor-help relative group/bar"
                                                    style={{ height: `${Math.max(5, expensePercent)}%` }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-20 transition-all shadow-xl">
                                                        ₹{m.expenses.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">{m.month}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Summary Card (Budget 2026) */}
                    <div className="lg:col-span-4 min-w-0 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10 flex flex-col">
                        <div className="mb-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-sm">
                                    <PieChart size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">2026 Budget</h3>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Summary</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-12">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Total Income</p>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter truncate">₹{summary.totalIncome.toLocaleString()}</h1>
                        </div>

                        <div className="w-full h-2 bg-slate-50 rounded-full mb-12 relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-[#7c3aed] transition-all duration-1000" style={{ width: '100%' }}></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {/* Net Profit Mini Card */}
                            <div className="bg-emerald-50/40 rounded-3xl p-5 border border-emerald-100 relative overflow-hidden group/mini shadow-sm hover:shadow-md transition-all">
                                <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-1.5 ml-1">Net Profit</p>
                                <h4 className="text-lg font-black text-slate-900 truncate">₹{summary.netProfit.toLocaleString()}</h4>
                                <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-emerald-500/10 rounded-full blur-xl group-hover/mini:scale-150 transition-transform"></div>
                            </div>

                            {/* Expenses Mini Card */}
                            <div className="bg-red-50/40 rounded-3xl p-5 border border-red-100 relative overflow-hidden group/mini shadow-sm hover:shadow-md transition-all">
                                <p className="text-[9px] font-black text-red-600/60 uppercase tracking-widest mb-1.5 ml-1">Expenses</p>
                                <h4 className="text-lg font-black text-slate-900 truncate">₹{summary.totalExpenses.toLocaleString()}</h4>
                                <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-red-500/10 rounded-full blur-xl group-hover/mini:scale-150 transition-transform"></div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                <ArrowUpRight size={18} />
                                <span className="text-xs font-black uppercase tracking-widest">{summary.margin}% margin</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth</p>
                        </div>
                    </div>

                    {/* Bottom Left: Recent (Top 5) */}
                    <div className="lg:col-span-4 min-w-0 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden h-[600px]">
                        <div className="p-8 pb-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm">
                                <History size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent</h3>
                        </div>

                        <div className="flex-1  px-6 pb-8 scrollbar-hide">
                            {transactions.length > 0 ? (
                                <div className="space-y-4">
                                    {transactions.slice(0, 5).map((txn, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-primary shadow-sm transition-colors border border-slate-100 flex-shrink-0">
                                                    <ReceiptText size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-900 truncate">{txn.member}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{txn.type}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-3">
                                                <p className={`text-xs font-black ${txn.flow === 'in' ? 'text-slate-900' : 'text-red-600'}`}>
                                                    {txn.flow === 'in' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-1 justify-end mt-0.5">
                                                    <div className="w-1 h-1 rounded-full bg-violet-400"></div>
                                                    <p className="text-[9px] text-[#7c3aed] font-black uppercase tracking-widest leading-none whitespace-nowrap">{txn.branch}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-8">
                                    <ReceiptText size={48} className="text-slate-400 mb-4" />
                                    <p className="text-slate-500 font-black italic">No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Right: Detailed Tabs */}
                    <div className="lg:col-span-8 min-w-0 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden h-[600px]">
                        <div className="px-8 pt-8 flex items-center justify-between mb-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => setActiveTab('income')}
                                    className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'income' ? 'bg-primary text-white shadow-lg shadow-violet-200' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                                >
                                    <ArrowUpRight size={16} /> Income ({transactions.filter(t => t.flow === 'in').length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('expenses')}
                                    className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'expenses' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                                >
                                    <ArrowDownRight size={16} /> Expenses ({transactions.filter(t => t.flow === 'out').length})
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden px-8 pb-8">
                            <div className="mb-8">
                                <h4 className="text-xl font-black text-slate-900 tracking-tight">{activeTab === 'income' ? 'Income Transactions' : 'Expense Records'}</h4>
                                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">{activeTab === 'income' ? 'Membership and POS payments' : 'Operational and vendor expenses'}</p>
                            </div>

                            <div className="flex-1 overflow-x-auto scrollbar-hide">
                                <table className="w-full min-w-[700px]">
                                    <thead>
                                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                            <th className="pb-5 pr-4 text-center">Date</th>
                                            <th className="pb-5 pr-4">Type</th>
                                            <th className="pb-5 pr-4">Branch</th>
                                            <th className="pb-5 pr-4">Entity</th>
                                            <th className="pb-5 pr-4 text-center">Reference</th>
                                            <th className="pb-5 pr-4 text-center">Status</th>
                                            <th className="pb-5 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {transactions.filter(t => t.flow === (activeTab === 'income' ? 'in' : 'out')).length > 0 ? (
                                            transactions.filter(t => t.flow === (activeTab === 'income' ? 'in' : 'out')).map((txn, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                                                    <td className="py-5 pr-4 text-[10px] font-black text-slate-500 whitespace-nowrap text-center">{txn.date}</td>
                                                    <td className="py-5 pr-4">
                                                        <span className={`text-[11px] font-black uppercase tracking-widest ${txn.flow === 'in' ? 'text-slate-900' : 'text-red-600'}`}>{txn.type}</span>
                                                    </td>
                                                    <td className="py-5 pr-4">
                                                        <span className="text-[10px] font-black text-primary bg-primary-light px-2.5 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap">{txn.branch}</span>
                                                    </td>
                                                    <td className="py-5 pr-4 text-xs font-black text-slate-900">{txn.member}</td>
                                                    <td className="py-5 pr-4 text-center">
                                                        <span className="text-[10px] font-black text-slate-400 group-hover:text-primary underline cursor-pointer uppercase tracking-widest">{txn.id}</span>
                                                    </td>
                                                    <td className="py-5 pr-4 text-center">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${txn.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                            {txn.status || 'Paid'}
                                                        </span>
                                                    </td>
                                                    <td className={`py-5 text-right text-sm font-black ${txn.flow === 'in' ? 'text-slate-900' : 'text-red-600'}`}>
                                                        {txn.flow === 'in' ? '+' : '-'} ₹{txn.amount.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-32 text-center text-slate-300 italic opacity-50">
                                                    <ReceiptText size={48} className="mx-auto mb-4" />
                                                    No records found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Expense Drawer */}
                <RightDrawer
                    isOpen={isExpenseDrawerOpen}
                    onClose={() => setIsExpenseDrawerOpen(false)}
                    title="Add Expense"
                    subtitle="Record a new expense for approval"
                >
                    <form onSubmit={handleAddExpense} className="space-y-8 p-1">
                        {/* Branch Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed] ml-1">Branch *</label>
                            <div className="relative group">
                                <select
                                    required
                                    value={expenseForm.branchId}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, branchId: e.target.value })}
                                    className="w-full px-4 py-3 bg-primary-light/50 border-2 border-violet-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                >
                                    <option value="all">Select Branch</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400 group-hover:text-primary transition-colors">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Receipt (Optional)</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-slate-400 hover:border-violet-300 hover:bg-primary-light transition-all cursor-pointer group">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                    <Upload size={24} className="text-slate-300 group-hover:text-primary" />
                                </div>
                                <p className="text-xs font-bold text-slate-600">Click to upload receipt</p>
                                <p className="text-[10px] font-medium mt-1">Image or PDF up to 10MB</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category *</label>
                                <select
                                    required
                                    value={expenseForm.category}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary transition-all"
                                >
                                    <option value="">Select category</option>
                                    {dynamicFormCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount (₹) *</label>
                                <input
                                    type="number"
                                    required
                                    value={expenseForm.amount}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                    placeholder="5000"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description *</label>
                            <textarea
                                required
                                value={expenseForm.description}
                                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value, description: e.target.value })}
                                placeholder="Monthly electricity bill..."
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vendor</label>
                                <input
                                    type="text"
                                    value={expenseForm.vendor}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                                    placeholder="BSES Power"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Expense Date</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        value={expenseForm.date}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsExpenseDrawerOpen(false)}
                                className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={16} /> Submit Expense
                            </button>
                        </div>
                    </form>
                </RightDrawer>
            </div>
        </div>
    );
};

export default FinancialDashboard;
