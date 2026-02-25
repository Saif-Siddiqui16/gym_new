import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Eye,
    User,
    Calendar,
    CreditCard,
    ArrowLeft,
    ChevronDown,
    Building,
    Smartphone,
    Banknote,
    Tag,
    Clock,
    UserCheck,
    Receipt,
    Plus,
    History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReceiptModal from '../components/ReceiptModal';
import { fetchTransactions } from '../../../api/finance/financeApi';

const TransactionsPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [activeTransaction, setActiveTransaction] = useState(null);

    const [transactions, setTransactions] = useState([]);

    // Auth Storage Check
    const userStr = localStorage.getItem('userData');
    const loggedInUser = userStr ? JSON.parse(userStr) : { name: 'Staff Operator' };

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                const data = await fetchTransactions();
                setTransactions(data);
            } catch (err) {
                console.error("Failed fetching transactions:", err);
            }
        };
        loadTransactions();
    }, []);

    const getMethodIcon = (method) => {
        switch (method) {
            case 'Card': return CreditCard;
            case 'UPI': return Smartphone;
            case 'Bank Transfer': return Building;
            default: return Banknote;
        }
    };

    const getTypeColor = (type) => {
        if (type.includes('Membership')) return 'bg-violet-50 text-violet-600 border-violet-100';
        if (type.includes('POS')) return 'bg-blue-50 text-blue-600 border-blue-100';
        if (type.includes('PT')) return 'bg-rose-50 text-rose-600 border-rose-100';
        return 'bg-slate-50 text-slate-600 border-slate-100';
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesType = selectedType === 'All' || (t.type && t.type.includes(selectedType));
        const matchesSearch = (t.member && t.member.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (t.id && t.id.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesType && matchesSearch;
    });

    const handleExport = () => {
        if (filteredTransactions.length === 0) {
            alert("No transactions available to export.");
            return;
        }

        const headers = ['Transaction ID', 'Date', 'Member Name', 'Category', 'Method', 'Amount'];

        const csvRows = filteredTransactions.map(t => [
            t.id || '',
            t.date || '',
            `"${t.member || ''}"`, // Wrap in quotes to handle commas in names
            t.type || '',
            t.method || '',
            t.amount || 0
        ]);

        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Transactions_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleViewReceipt = (txn) => {
        setActiveTransaction({
            ...txn,
            memberName: txn.member,
            paymentType: txn.type,
            finalAmount: txn.amount,
            receivedBy: loggedInUser.name || 'Staff Operator'
        });
        setShowReceipt(true);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
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
                        <div className="flex items-center gap-4 md:gap-5">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/20 shrink-0">
                                <History size={24} className="md:hidden" />
                                <History size={32} className="hidden md:block" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Branch Transactions</h1>
                                <p className="text-slate-500 font-medium italic text-sm md:text-base">Complete audit trail of all payments received.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <button
                            onClick={handleExport}
                            className="flex-1 md:flex-none px-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:border-violet-200 hover:text-violet-600 transition-all shadow-sm flex items-center justify-center gap-3"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                        <button
                            onClick={() => navigate('/finance/cashier')}
                            className="flex-1 md:flex-none px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                        >
                            <Plus size={18} />
                            New Payment
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-xl border border-slate-100 p-4 md:p-6 mb-8 flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 h-12 rounded-2xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-bold text-sm bg-slate-50/50 transition-all outline-none"
                            placeholder="Search by ID or member name..."
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <select
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                            className="h-12 px-5 rounded-2xl border-2 border-slate-100 bg-white font-bold text-xs uppercase tracking-widest text-slate-500 outline-none focus:border-violet-500 transition-all w-full sm:w-auto"
                        >
                            <option value="All">All Types</option>
                            <option value="Membership">Membership</option>
                            <option value="POS">Products</option>
                            <option value="Personal Training">PT Sessions</option>
                        </select>
                        <div className="h-12 px-6 flex items-center justify-center gap-3 bg-violet-50 border-2 border-violet-100 rounded-2xl text-xs font-black text-violet-600 uppercase tracking-widest w-full sm:w-auto">
                            <Clock size={16} />
                            {filteredTransactions.length} Total
                        </div>
                    </div>
                </div>

                {/* Table View */}
                {/* Desktop Table View */}
                <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="hidden lg:block overflow-x-auto overflow-y-visible">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Method</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredTransactions.map(txn => {
                                    const MethodIcon = getMethodIcon(txn.method);
                                    return (
                                        <tr key={txn.id} className="group hover:bg-violet-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                                                    {txn.id}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-500 font-black text-xs">
                                                        {txn.member.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-black text-slate-800 tracking-tight transition-colors group-hover:text-violet-600">{txn.member}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getTypeColor(txn.type)}`}>
                                                    <Tag size={12} />
                                                    {txn.type}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <MethodIcon size={16} className="text-slate-400" />
                                                    <span className="text-xs font-bold">{txn.method}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col items-start">
                                                    <span className="text-sm font-black text-slate-900 tabular-nums">₹{txn.amount.toLocaleString()}</span>
                                                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                                                        <Calendar size={10} />
                                                        {txn.date}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleViewReceipt(txn)}
                                                    className="p-3 rounded-xl bg-white border-2 border-slate-100 text-slate-400 hover:text-violet-600 hover:border-violet-100 hover:shadow-lg hover:shadow-violet-100 transition-all"
                                                >
                                                    <Receipt size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                    </div>

                    {/* Mobile View */}
                    <div className="lg:hidden divide-y divide-slate-100">
                        {filteredTransactions.map(txn => {
                            const MethodIcon = getMethodIcon(txn.method);
                            return (
                                <div key={txn.id} className="p-4 md:p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-500 font-black">
                                                {txn.member.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-black text-slate-800 tracking-tight truncate max-w-[120px]">{txn.member}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{txn.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-lg font-black text-slate-900 leading-none">₹{txn.amount.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{txn.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getTypeColor(txn.type)}`}>
                                            {txn.type}
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <MethodIcon size={12} />
                                            {txn.method}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewReceipt(txn)}
                                        className="w-full h-12 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2 active:bg-slate-50 hover:bg-slate-50 transition-colors"
                                    >
                                        <Receipt size={16} />
                                        View Digital Receipt
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Receipt Modal Integration */}
            < ReceiptModal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                payment={activeTransaction}
            />
        </div >
    );
};

export default TransactionsPage;
