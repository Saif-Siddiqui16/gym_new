import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    CreditCard,
    Smartphone,
    Building,
    Banknote,
    Receipt,
    MoreHorizontal,
    FileText,
    History
} from 'lucide-react';
import { fetchTransactions, fetchInvoiceById } from '../../../api/finance/financeApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import RightDrawer from '../../../components/common/RightDrawer';

const Payments = () => {
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ transactions: [], stats: { todayCollection: 0, filteredTotal: 0, completed: 0, pending: 0 } });
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [fetchingReceipt, setFetchingReceipt] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [methodFilter, setMethodFilter] = useState('All Methods');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const loadPayments = async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch === 'all' ? '' : selectedBranch;
            const res = await fetchTransactions({
                branchId,
                search: searchTerm,
                method: methodFilter === 'All Methods' ? undefined : methodFilter,
                status: statusFilter === 'All Status' ? undefined : statusFilter,
                startDate,
                endDate
            });
            setData(res);
        } catch (error) {
            console.error("Failed to load payments", error);
            toast.error("Failed to sync payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, [selectedBranch, methodFilter, statusFilter, startDate, endDate]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            loadPayments();
        }
    };

    const handleExport = () => {
        if (data.transactions.length === 0) {
            toast.error("No transactions to export");
            return;
        }

        try {
            const headers = ["Member", "Branch", "Transaction Code", "Date", "Time", "Method", "Amount", "Status"];
            const rows = data.transactions.map(txn => [
                `"${txn.member}"`,
                `"${txn.branch}"`,
                txn.id,
                new Date(txn.date).toLocaleDateString(),
                new Date(txn.date).toLocaleTimeString(),
                txn.method,
                txn.amount,
                txn.status
            ]);

            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Payments_Report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            toast.success("Report exported successfully");
        } catch (err) {
            toast.error("Failed to export report");
        }
    };

    const handleViewReceipt = async (id) => {
        try {
            setFetchingReceipt(true);
            setIsReceiptOpen(true);

            const txn = data.transactions.find(t => t.id === id || t.internalId === id);
            if (!txn || !txn.internalId) {
                toast.error("Internal ID missing for this transaction");
                return;
            }

            const res = await fetchInvoiceById(txn.internalId);
            setSelectedReceipt(res);
        } catch (err) {
            console.error("Receipt load failed", err);
            toast.error("Failed to load receipt details");
            setIsReceiptOpen(false);
        } finally {
            setFetchingReceipt(false);
        }
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 lg:p-10 pb-20">
            <div className="max-w-screen-2xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payments</h1>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Manage and monitor all payment transactions</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Download size={18} /> Export Report
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-8">
                    <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">
                        <Filter size={14} /> Filters
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search */}
                        <div className="md:col-span-5 relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                placeholder="Search member, code, or invoice..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-violet-500 transition-all"
                            />
                        </div>

                        {/* Date Picker */}
                        <div className="md:col-span-3 relative">
                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-bold focus:outline-none focus:border-violet-500 transition-all"
                            />
                        </div>

                        {/* Method Filter */}
                        <div className="md:col-span-2 relative">
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                            >
                                <option>All Methods</option>
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Card</option>
                                <option>Bank Transfer</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Status Filter */}
                        <div className="md:col-span-2 relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                            >
                                <option>All Status</option>
                                <option>Paid</option>
                                <option>Unpaid</option>
                                <option>Partial</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Today's Collection */}
                    <div className="bg-white rounded-[2rem] p-8 h-40 shadow-sm border border-slate-100 flex justify-between items-center gap-6 group hover:bg-orange-50 transition-all duration-500">
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Today's Collection</p>
                            <h2 className="text-3xl font-black text-orange-600">₹{data.stats.todayCollection.toLocaleString()}</h2>
                        </div>
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-sm">
                            <TrendingUp size={24} />
                        </div>
                    </div>

                    {/* Filtered Total */}
                    <div className="bg-white rounded-[2rem] p-8 h-40 shadow-sm border border-slate-100 flex justify-between items-center gap-6 group hover:bg-emerald-50 transition-all duration-500">
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Filtered Total</p>
                            <h2 className="text-3xl font-black text-emerald-600">₹{data.stats.filteredTotal.toLocaleString()}</h2>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-sm">
                            <History size={24} />
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white rounded-[2rem] p-8 h-40 shadow-sm border border-slate-100 flex justify-between items-center gap-6 group hover:bg-blue-50 transition-all duration-500">
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Completed</p>
                            <h2 className="text-3xl font-black text-slate-900 font-roboto">₹{data.stats.completed.toLocaleString()}</h2>
                        </div>
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="bg-white rounded-[2rem] p-8 h-40 shadow-sm border border-slate-100 flex justify-between items-center gap-6 group hover:bg-blue-50 transition-all duration-500">
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Pending</p>
                            <h2 className="text-3xl font-black text-blue-600">₹{data.stats.pending.toLocaleString()}</h2>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-sm">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>

                {/* Transactions Table Panel */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                    <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-900">Recent Payments ({data.transactions.length})</h3>
                        <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal size={24} />
                        </button>
                    </div>

                    <div className="overflow-x-auto scrollbar-hide">
                        {loading ? (
                            <div className="h-[300px] flex items-center justify-center opacity-30">
                                <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin"></div>
                            </div>
                        ) : data.transactions.length === 0 ? (
                            <div className="h-[300px] flex flex-col items-center justify-center text-center px-8 opacity-30">
                                <History size={64} className="text-slate-300 mb-6" />
                                <h4 className="text-xl font-black text-slate-900 italic">No payments found</h4>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <table className="w-full hidden md:table">
                                    <thead className="bg-slate-50/50">
                                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                            <th className="px-8 py-5">Member</th>
                                            <th className="px-8 py-5">Branch</th>
                                            <th className="px-8 py-5 text-center">Reference</th>
                                            <th className="px-8 py-5">Date & Time</th>
                                            <th className="px-8 py-5">Method</th>
                                            <th className="px-8 py-5">Amount</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5 text-right">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.transactions.map((txn, idx) => {
                                            const MethodIcon = getMethodIcon(txn.method);
                                            return (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-black text-xs">
                                                                {txn.member ? txn.member[0] : 'G'}
                                                            </div>
                                                            <span className="text-sm font-black text-slate-900">{txn.member}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-[10px] font-black text-[#7c3aed] bg-violet-50 px-2 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap">
                                                            {txn.branch}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-widest">{txn.id}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-900">{new Date(txn.date).toLocaleDateString()}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold">{new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <MethodIcon size={16} className="text-slate-400" />
                                                            <span className="text-xs font-bold">{txn.method}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-sm font-black text-slate-900">₹{txn.amount.toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${txn.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {txn.status === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                            {txn.status === 'Paid' ? 'Completed' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => handleViewReceipt(txn.internalId || txn.id)}
                                                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all shadow-sm"
                                                        >
                                                            <Receipt size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Mobile Stacked View */}
                                <div className="md:hidden divide-y divide-slate-100">
                                    {data.transactions.map((txn, idx) => {
                                        const MethodIcon = getMethodIcon(txn.method);
                                        return (
                                            <div key={idx} className="p-6 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-black text-xs">
                                                            {txn.member ? txn.member[0] : 'G'}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-slate-900">{txn.member}</h4>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{txn.id}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${txn.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        {txn.status === 'Paid' ? 'Paid' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Method & Amount</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-black text-slate-900">₹{txn.amount.toLocaleString()}</span>
                                                            <div className="flex items-center gap-1 text-slate-400">
                                                                <MethodIcon size={12} />
                                                                <span className="text-[9px] font-bold">{txn.method}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <button
                                                            onClick={() => handleViewReceipt(txn.internalId || txn.id)}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                                                        >
                                                            <Receipt size={14} /> Receipt
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Receipt Modal */}
            <RightDrawer
                isOpen={isReceiptOpen}
                onClose={() => {
                    setIsReceiptOpen(false);
                    setSelectedReceipt(null);
                }}
                title="Transaction Receipt"
            >
                {fetchingReceipt ? (
                    <div className="p-24 flex flex-col items-center justify-center opacity-40 h-full">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-black italic uppercase tracking-widest text-[10px]">Generating Receipt...</p>
                    </div>
                ) : selectedReceipt && (
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
                        {/* Header Info */}
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedReceipt.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {selectedReceipt.status}
                                </span>
                                <h3 className="text-2xl font-black text-slate-900 mt-2">{selectedReceipt.invoiceNumber}</h3>
                                <p className="text-sm font-bold text-slate-400">Payment Date: {new Date(selectedReceipt.paidDate || selectedReceipt.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Paid</p>
                                <p className="text-3xl font-black text-slate-900 font-roboto">₹{Number(selectedReceipt.amount).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payer Details</p>
                                <p className="text-md font-black text-slate-900">{selectedReceipt.member?.name || 'Walk-in Guest'}</p>
                                <p className="text-xs font-bold text-slate-500">{selectedReceipt.member?.memberId || 'GUEST'}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch</p>
                                <p className="text-md font-black text-slate-900">{selectedReceipt.tenant?.name || 'Main Branch'}</p>
                                <p className="text-xs font-bold text-slate-500">Mode: {selectedReceipt.paymentMode || 'Cash'}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Breakdown</p>
                            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
                                <table className="w-full text-left font-sans">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/30">
                                            <th className="px-6 py-4">Description</th>
                                            <th className="px-6 py-4 text-center">Qty</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedReceipt.items?.length > 0 ? selectedReceipt.items.map((item, idx) => (
                                            <tr key={idx} className="text-xs font-bold text-slate-700">
                                                <td className="px-6 py-4">{item.description}</td>
                                                <td className="px-6 py-4 text-center">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right">₹{Number(item.amount).toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr className="text-xs font-bold text-slate-700">
                                                <td className="px-6 py-4">Membership/Subscription Payment</td>
                                                <td className="px-6 py-4 text-center">1</td>
                                                <td className="px-6 py-4 text-right">₹{Number(selectedReceipt.amount).toLocaleString()}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-8 flex flex-col items-center gap-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center">
                                <FileText size={48} className="text-slate-200" />
                            </div>
                            <button
                                onClick={() => window.print()}
                                className="w-full h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
                            >
                                <Download size={20} /> Download PDF Receipt
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default Payments;
