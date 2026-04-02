import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Filter,
    Plus,
    Calendar,
    TrendingUp,
    Users,
    Receipt,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    Download,
    MoreHorizontal,
    Trash2,
    Eye,
    PlusCircle,
    ChevronDown,
    CreditCard,
    IndianRupee
} from 'lucide-react';
import { fetchInvoices, addInvoice, fetchInvoiceById, deleteInvoice, settleInvoice } from '../../../api/finance/financeApi';
import { updatePayrollStatusAPI } from '../../../api/admin/adminApi';
import { fetchOrderById } from '../../../api/storeApi';
import { getMembers } from '../../../api/staff/memberApi';
import { useBranchContext } from '../../../context/BranchContext';
import { useAuth } from '../../../context/AuthContext';
import RightDrawer from '../../../components/common/RightDrawer';
import Button from '../../../components/ui/Button';
import StatsCard from '../../dashboard/components/StatsCard';
import toast from 'react-hot-toast';
import { exportPdf } from '../../../utils/exportPdf';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

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
        invoiceId: null,
        method: 'Cash',
        amount: 0,
        referenceNumber: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isSettling, setIsSettling] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    // Create Invoice Form State
    const [invoiceForm, setInvoiceForm] = useState({
        memberId: '',
        dueDate: new Date().toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, rate: 0 }],
        discount: 0,
        taxRate: 18,
        notes: '',
        branchId: selectedBranch || 'all'
    });

    useEffect(() => {
        setInvoiceForm(prev => ({ ...prev, branchId: selectedBranch || 'all' }));
    }, [selectedBranch]);

    const loadMembers = async (branchId) => {
        try {
            setFetchingMembers(true);
            const res = await getMembers({ branchId: branchId });
            setMembers(res);
        } catch (error) {
            console.error("Failed to load members", error);
        } finally {
            setFetchingMembers(false);
        }
    };

    useEffect(() => {
        if (isCreateDrawerOpen) {
            loadMembers(invoiceForm.branchId);
        }
    }, [isCreateDrawerOpen, invoiceForm.branchId]);

    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);
    const [showRejectionBox, setShowRejectionBox] = useState(false);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const res = await fetchInvoices({
                branchId: selectedBranch,
                search: searchTerm,
                status: statusFilter
            });
            setData(res);
        } catch (error) {
            console.error("Failed to load invoices", error);
            toast.error("Failed to sync invoices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, [selectedBranch, statusFilter]);

    const handleConfirmPayroll = async () => {
        if (!selectedInvoice || !selectedInvoice.internalId) return;
        setIsProcessingPayroll(true);
        try {
            await updatePayrollStatusAPI(selectedInvoice.internalId, { status: 'Confirmed' });
            toast.success('Payroll confirmed successfully!');
            await loadInvoices();
            // Refresh detail view
            setSelectedInvoice(null); // Close or refresh
        } catch (error) {
            console.error(error);
            toast.error('Failed to confirm payroll');
        } finally {
            setIsProcessingPayroll(false);
        }
    };

    const handleRejectPayroll = async () => {
        if (!selectedInvoice || !selectedInvoice.internalId || !rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }
        setIsProcessingPayroll(true);
        try {
            await updatePayrollStatusAPI(selectedInvoice.internalId, { 
                status: 'Rejected', 
                rejectionReason 
            });
            toast.success('Payroll rejected. Admin will be notified.');
            setShowRejectionBox(false);
            setRejectionReason('');
            await loadInvoices();
            setSelectedInvoice(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to reject payroll');
        } finally {
            setIsProcessingPayroll(false);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            loadInvoices();
        }
    };

    const handleAddItem = () => {
        setInvoiceForm({
            ...invoiceForm,
            items: [...invoiceForm.items, { description: '', quantity: 1, rate: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = invoiceForm.items.filter((_, i) => i !== index);
        setInvoiceForm({ ...invoiceForm, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoiceForm.items];
        newItems[index][field] = value;
        setInvoiceForm({ ...invoiceForm, items: newItems });
    };

    const calculateSubtotal = () => {
        return invoiceForm.items.reduce((acc, item) => acc + (parseFloat(item.rate || 0) * parseInt(item.quantity || 0)), 0);
    };

    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal - (parseFloat(invoiceForm.discount) || 0)) * (parseFloat(invoiceForm.taxRate) / 100);
    const totalAmount = subtotal - (parseFloat(invoiceForm.discount) || 0) + taxAmount;

    const handleSubmitInvoice = async (e) => {
        e.preventDefault();
        try {
            if (role === 'SUPER_ADMIN' && (invoiceForm.branchId === 'all' || !invoiceForm.branchId)) {
                return toast.error("Please select a specific branch for the invoice");
            }
            if (invoiceForm.items.some(item => !item.description || item.rate <= 0)) {
                return toast.error("Please fill all item details");
            }
            await addInvoice(invoiceForm);
            toast.success("Invoice created successfully!");
            setIsCreateDrawerOpen(false);
            setInvoiceForm({
                memberId: '',
                dueDate: new Date().toISOString().split('T')[0],
                items: [{ description: '', quantity: 1, rate: 0 }],
                discount: 0,
                taxRate: 18,
                notes: '',
                branchId: selectedBranch || 'all'
            });
            loadInvoices();
        } catch (error) {
            toast.error(error.message || "Failed to create invoice");
        }
    };

    const handleViewInvoice = async (id) => {
        try {
            setFetchingInvoice(true);
            setIsViewDrawerOpen(true);

            const item = data.invoices.find(inv => inv.id === id);
            let res;
            if (item?.type === 'POS Sale') {
                res = await fetchOrderById(item.internalId);
                // Map POS response to invoice format for the drawer
                res.invoiceNumber = `POS-#${res.id}`;
                res.dueDate = res.dueDate || res.date || res.paidDate;
                res.amount = Number(res.total || res.amount || 0);
                res.subtotal = (res.items || []).reduce((acc, i) => acc + (Number(i.rate || 0) * Number(i.quantity || 0)), 0);
                res.taxAmount = Number(res.amount) - res.subtotal;
                res.taxRate = 0;
                // Items from backend (getOrderById) already have: description, quantity, rate, amount
            } else {
                res = await fetchInvoiceById(id);
            }
            setSelectedInvoice(res);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load details");
            setIsViewDrawerOpen(false);
        } finally {
            setFetchingInvoice(false);
        }
    };

    const handleDeleteInvoice = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDeleteInvoice = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deleteInvoice(confirmModal.id);
            toast.success("Invoice deleted successfully");
            setConfirmModal({ isOpen: false, id: null, loading: false });
            loadInvoices();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete invoice");
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSettleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSettling(true);
            await settleInvoice(settlementData.invoiceId, {
                method: settlementData.method,
                referenceNumber: settlementData.referenceNumber,
                amount: settlementData.amount,
                date: settlementData.date,
                balanceDueDate: settlementData.isPartial ? settlementData.balanceDueDate : null
            });
            toast.success("Invoice settled successfully!");
            setIsSettleModalOpen(false);
            loadInvoices();
        } catch (error) {
            toast.error(error.message || "Failed to settle invoice");
        } finally {
            setIsSettling(false);
        }
    };

    const openSettleModal = (inv) => {
        // Fallback to amount if balance is missing or zero (for older records or non-membership items)
        const balanceVal = Number(inv.balance);
        const amountVal = Number(inv.amount);
        const payableAmount = (balanceVal > 0) ? balanceVal : amountVal;

        setSettlementData({
            invoiceId: inv.id,
            method: 'Cash',
            fullAmount: payableAmount,
            amount: payableAmount,
            isPartial: false,
            referenceNumber: '',
            date: new Date().toISOString().split('T')[0],
            balanceDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        setIsSettleModalOpen(true);
    };

    return (
        <div className="min-h-screen space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Invoices</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage and track all invoices</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            if (data.invoices.length === 0) {
                                toast.error("No invoices to export");
                                return;
                            }
                            const headers = ["Invoice #", "Member", "Amount", "Date", "Status"];
                            const rows = data.invoices.map(inv => [
                                inv.invoiceNumber,
                                inv.member?.name || 'Walk-in Guest',
                                `₹${Number(inv.amount).toLocaleString()}`,
                                new Date(inv.dueDate).toLocaleDateString(),
                                inv.status
                            ]);
                            exportPdf({
                                title: 'Invoices Report',
                                filename: `Invoices_Report_${new Date().toISOString().split('T')[0]}`,
                                headers,
                                rows,
                                gymName: "Gym Academy"
                            });
                        }}
                        className="h-11 px-6 bg-white text-primary border border-violet-100 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-primary-light transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Download size={18} /> Export as PDF
                    </button>
                    <Button
                        onClick={() => setIsCreateDrawerOpen(true)}
                        variant="primary"
                        className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform active:scale-95"
                        icon={Plus}
                    >
                        Create Invoice
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Clients"
                    value={data.stats.clients.toString()}
                    icon={Users}
                    color="primary"
                    isEarningsLayout={true}
                />
                <StatsCard
                    title="Total Invoices"
                    value={data.stats.totalInvoices.toString()}
                    icon={Receipt}
                    color="info"
                    isEarningsLayout={true}
                />
                <StatsCard
                    title="Total Paid"
                    value={`₹${data.stats.paid.toLocaleString()}`}
                    icon={TrendingUp}
                    color="success"
                    isEarningsLayout={true}
                />
                <StatsCard
                    title="Total Unpaid"
                    value={`₹${data.stats.unpaid.toLocaleString()}`}
                    icon={Clock}
                    color="warning"
                    isEarningsLayout={true}
                />
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Table Filter Bar */}
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder="Search by invoice # or member name..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                            >
                                <option>All Status</option>
                                <option>Paid</option>
                                <option>Unpaid</option>
                                <option value="Partially Paid">Partial</option>
                                <option>Overdue</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="saas-table-wrapper border-0 rounded-none">
                    <table className="saas-table saas-table-responsive w-full">
                        <thead className="bg-slate-50/50">
                            <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <th className="px-8 py-5">Invoice Number</th>
                                <th className="px-8 py-5">Branch</th>
                                <th className="px-8 py-5">Client</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {!loading && data.invoices.map((inv, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6" data-label="Invoice Number">
                                        <div className="flex items-center gap-3 justify-end sm:justify-start">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inv.type === 'Payroll' ? 'bg-amber-100 text-amber-600' : 'bg-primary-light text-primary'}`}>
                                                {inv.type === 'Payroll' ? <IndianRupee size={16} /> : <FileText size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{inv.invoiceNumber}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{inv.serviceName || (inv.type === 'POS Sale' ? 'Store Purchase' : 'Membership Fee')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-[#7c3aed] bg-primary-light px-2 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap">
                                            {inv.tenant?.name || 'Main'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{inv.member?.name || 'Walk-in Guest'}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{inv.member?.memberId || 'GUEST'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6" data-label="Amount">
                                        <div className="text-right sm:text-left">
                                            <span className="text-sm font-black text-slate-900">₹{Number(inv.amount).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6" data-label="Date">
                                        <div className="text-right sm:text-left">
                                            <span className="text-xs font-bold text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6" data-label="Status">
                                        <div className="flex flex-col gap-1 items-end sm:items-start">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                inv.status === 'Overdue' ? 'bg-red-50 text-red-600 border-red-100' :
                                                inv.status === 'Partially Paid' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {inv.status === 'Paid' ? <CheckCircle2 size={12} /> : inv.status === 'Overdue' ? <AlertCircle size={12} /> : <Clock size={12} />}
                                                {inv.status}
                                            </span>
                                            {inv.status === 'Paid' && (inv.paymentMode || inv.method) && (
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                                    via {inv.paymentMode || inv.method}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right" data-label="Actions">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleViewInvoice(inv.id)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const headers = ["Description", "Qty", "Rate", "Total"];
                                                    const rows = (inv.items || []).map(item => [item.description, item.quantity, `₹${Number(item.rate).toLocaleString()}`, `₹${Number(item.amount).toLocaleString()}`]);
                                                    rows.push(["", "", "Total", `₹${Number(inv.amount).toLocaleString()}`]);
                                                    exportPdf({ title: `Invoice ${inv.invoiceNumber}`, filename: `Invoice_${inv.invoiceNumber}`, headers, rows, gymName: "Gym Academy" });
                                                }}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Download PDF"
                                            >
                                                <Download size={18} />
                                            </button>
                                            {inv.status !== 'Paid' && (inv.type !== 'Payroll' || role === 'SUPER_ADMIN' || role === 'BRANCH_ADMIN') && (
                                                <button
                                                    onClick={() => openSettleModal(inv)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                    title="Record Payment"
                                                >
                                                    <CreditCard size={18} />
                                                </button>
                                            )}
                                            {(inv.type !== 'Payroll' || role === 'SUPER_ADMIN' || role === 'BRANCH_ADMIN') && (
                                                <button
                                                    onClick={() => handleDeleteInvoice(inv.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table >

                    {loading && (
                        <div className="p-24 flex flex-col items-center justify-center opacity-40">
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-black italic uppercase tracking-widest text-[10px]">Filtering Financial Records...</p>
                        </div>
                    )}

                    {
                        !loading && data.invoices.length === 0 && (
                            <div className="p-24 flex flex-col items-center justify-center text-center opacity-30">
                                <Receipt size={64} className="text-slate-300 mb-6" />
                                <h3 className="text-xl font-black text-slate-900 mb-2">Invoice List</h3>
                                <p className="max-w-xs text-slate-500 text-sm font-medium">No records found matching your current filter.</p>
                            </div>
                        )
                    }
                </div >
            </div >

            {/* Create Invoice Drawer */}
            < RightDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
                title="Create Invoice"
            >
                <form onSubmit={handleSubmitInvoice} className="p-8 space-y-10">
                    {/* Branch Selection */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed] ml-1">Branch *</label>
                        <div className="relative group">
                            <select
                                required
                                value={invoiceForm.branchId}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, branchId: e.target.value, memberId: '' })}
                                className="w-full h-14 px-5 bg-primary-light/50 border border-violet-100 rounded-2xl text-[13px] font-bold text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%237c3aed%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                            >
                                <option value="all">Select Branch</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {/* Member Selection */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Member (optional)</label>
                            <div className="relative group">
                                <select
                                    value={invoiceForm.memberId}
                                    disabled={fetchingMembers}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, memberId: e.target.value })}
                                    className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat disabled:opacity-50"
                                >
                                    <option value="">{fetchingMembers ? 'Loading members...' : 'Walk-in Customer'}</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.memberId || `M-${m.id}`})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Due Date</label>
                            <div className="relative group">
                                <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                                <input
                                    type="date"
                                    required
                                    value={invoiceForm.dueDate}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                                    className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-sans"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Line Items Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-1">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Line Items</h4>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-0.5">Define services and products</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary-light px-4 py-2 rounded-xl hover:bg-violet-100 transition-all uppercase tracking-[0.1em] border border-violet-100 shadow-sm shadow-violet-100/50"
                            >
                                <PlusCircle size={14} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {invoiceForm.items.map((item, idx) => (
                                <div key={idx} className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-5 relative group animate-in slide-in-from-right-4">
                                    {idx > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(idx)}
                                            className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-100 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-lg transition-all scale-0 group-hover:scale-100"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</p>
                                        <input
                                            placeholder="e.g. Personal Training - 12 Sessions"
                                            required
                                            value={item.description}
                                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-primary transition-all font-sans placeholder:text-slate-200"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 focus:outline-none transition-all font-sans"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate (₹)</span>
                                            <input
                                                type="number"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 focus:outline-none transition-all font-sans"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</span>
                                            <div className="h-10 flex items-center text-[13px] font-black text-slate-900 px-2">
                                                ₹{(item.quantity * item.rate).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Financial Modifiers */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Discount (₹)</label>
                            <input
                                type="number"
                                value={invoiceForm.discount}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })}
                                placeholder="0"
                                className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-900 focus:outline-none outline-none font-sans"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GST Rate (%)</label>
                            <select
                                value={invoiceForm.taxRate}
                                onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: e.target.value })}
                                className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-900 focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                            >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes Area */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes</label>
                        <textarea
                            value={invoiceForm.notes}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                            placeholder="Additional notes..."
                            rows={4}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-semibold text-slate-700 focus:outline-none transition-all resize-none font-sans placeholder:text-slate-300"
                        />
                    </div>

                    {/* Summary Section - Refined Light Styling */}
                    <div className="mx-2 p-7 bg-primary-light/80 rounded-[2rem] space-y-4 border border-violet-100 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                            <span className="text-sm font-black text-slate-700">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST ({invoiceForm.taxRate}%)</span>
                            <span className="text-sm font-black text-primary">₹{taxAmount.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-violet-200/50 mx-2"></div>
                        <div className="flex justify-between items-center px-2 pt-1">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Total Amount</span>
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Action Buttons - Optimized Size */}
                    <div className="flex gap-4 pt-4 w-[85%] mx-auto">
                        <button
                            type="button"
                            onClick={() => setIsCreateDrawerOpen(false)}
                            className="flex-1 h-11 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-[1.5] h-11 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all font-bold"
                        >
                            Create Invoice
                        </Button>
                    </div>
                </form>
            </RightDrawer >

            {/* View Invoice Drawer */}
            < RightDrawer
                isOpen={isViewDrawerOpen}
                onClose={() => {
                    setIsViewDrawerOpen(false);
                    setSelectedInvoice(null);
                }}
                title="Invoice Details"
                subtitle={selectedInvoice?.invoiceNumber}
            >
                {
                    fetchingInvoice ? (
                        <div className="p-24 flex flex-col items-center justify-center opacity-40 h-full" >
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-black italic uppercase tracking-widest text-[10px]">Fetching Details...</p>
                        </div>
                    ) : selectedInvoice && (
                        <div className="p-6 space-y-4 animate-in fade-in duration-200">

                            {/* Status + Amount */}
                            <div className={`rounded-2xl p-5 flex items-center justify-between ${selectedInvoice.status === 'Paid' || selectedInvoice.status === 'Completed' ? 'bg-emerald-50 border border-emerald-100' : Number(selectedInvoice.balance) > 0 && Number(selectedInvoice.paidAmount) > 0 ? 'bg-amber-50 border border-amber-100' : 'bg-rose-50 border border-rose-100'}`}>
                                <div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${selectedInvoice.status === 'Paid' || selectedInvoice.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : Number(selectedInvoice.balance) > 0 && Number(selectedInvoice.paidAmount) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'}`}>
                                        {selectedInvoice.status === 'Paid' || selectedInvoice.status === 'Completed' ? 'Paid' : Number(selectedInvoice.balance) > 0 && Number(selectedInvoice.paidAmount) > 0 ? 'Partial' : 'Unpaid'}
                                    </span>
                                    <p className="text-[10px] font-bold text-slate-500 mt-2">{selectedInvoice.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                                    <p className="text-2xl font-black text-slate-900">₹{Number(selectedInvoice.amount).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Member + Branch */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedInvoice.type === 'Payroll' ? 'Staff Member' : 'Bill To'}</p>
                                    <p className="text-sm font-black text-slate-800">{selectedInvoice.member?.name || 'Walk-in Guest'}</p>
                                    <p className="text-[10px] font-bold text-slate-500">{selectedInvoice.member?.memberId || '—'}</p>
                                    {selectedInvoice.member?.phone && <p className="text-[10px] font-bold text-slate-500">{selectedInvoice.member.phone}</p>}
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Branch</p>
                                    <p className="text-sm font-black text-slate-800">{selectedInvoice.tenant?.name || 'Main Branch'}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Invoice Date</p>
                                    <p className="text-[10px] font-bold text-slate-600">{new Date(selectedInvoice.createdAt || selectedInvoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>

                            {/* Payment breakdown */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-slate-50 rounded-2xl p-3 text-center">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                                    <p className="text-sm font-black text-slate-800 mt-1">₹{Number(selectedInvoice.amount).toLocaleString()}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-2xl p-3 text-center">
                                    <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Paid</p>
                                    <p className="text-sm font-black text-emerald-700 mt-1">₹{Number(selectedInvoice.paidAmount || (selectedInvoice.status === 'Paid' ? selectedInvoice.amount : 0)).toLocaleString()}</p>
                                </div>
                                <div className={`rounded-2xl p-3 text-center ${Number(selectedInvoice.balance) > 0 ? 'bg-rose-50' : 'bg-slate-50'}`}>
                                    <p className={`text-[8px] font-bold uppercase tracking-widest ${Number(selectedInvoice.balance) > 0 ? 'text-rose-400' : 'text-slate-400'}`}>Balance</p>
                                    <p className={`text-sm font-black mt-1 ${Number(selectedInvoice.balance) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>₹{Number(selectedInvoice.balance || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Dates row */}
                            <div className="flex gap-3">
                                {selectedInvoice.paidDate && (
                                    <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
                                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Paid On</p>
                                        <p className="text-xs font-black text-emerald-800 mt-0.5">{new Date(selectedInvoice.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                )}
                                {selectedInvoice.dueDate && selectedInvoice.status !== 'Paid' && selectedInvoice.status !== 'Completed' && (
                                    <div className="flex-1 bg-rose-50 border border-rose-100 rounded-2xl p-3">
                                        <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">{Number(selectedInvoice.paidAmount) > 0 ? 'Next Due Date' : 'Due Date'}</p>
                                        <p className="text-xs font-black text-rose-700 mt-0.5">{new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                )}
                                {selectedInvoice.paymentMode && (
                                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Method</p>
                                        <p className="text-xs font-black text-slate-700 mt-0.5">{selectedInvoice.paymentMode}</p>
                                    </div>
                                )}
                            </div>

                            {/* Items */}
                            {selectedInvoice.items?.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Items</p>
                                    <div className="space-y-1.5">
                                        {selectedInvoice.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">{item.description}</p>
                                                    <p className="text-[9px] font-bold text-slate-400">Qty: {item.quantity} × ₹{Number(item.rate).toLocaleString()}</p>
                                                </div>
                                                <p className="text-xs font-black text-slate-900">₹{Number(item.amount).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {(selectedInvoice.discount > 0 || selectedInvoice.taxAmount > 0) && (
                                        <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5">
                                            {selectedInvoice.discount > 0 && <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>Discount</span><span className="text-rose-500">-₹{Number(selectedInvoice.discount).toLocaleString()}</span></div>}
                                            {selectedInvoice.taxAmount > 0 && <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>GST ({selectedInvoice.taxRate}%)</span><span>₹{Number(selectedInvoice.taxAmount).toLocaleString()}</span></div>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reference */}
                            {(selectedInvoice.referenceNumber || selectedInvoice.notes) && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-1">
                                    {selectedInvoice.referenceNumber && <><p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Ref / Txn ID</p><p className="text-xs font-bold text-slate-700">{selectedInvoice.referenceNumber}</p></>}
                                    {selectedInvoice.notes && <><p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mt-1">Notes</p><p className="text-xs font-medium text-slate-600 italic">"{selectedInvoice.notes}"</p></>}
                                </div>
                            )}

                            {selectedInvoice.type === 'Payroll' && selectedInvoice.payrollStatus === 'Approved' && (
                                <div className="mt-6 p-6 bg-primary-light/30 rounded-3xl border border-primary-light space-y-4">
                                    <p className="text-xs font-bold text-primary text-center px-4">
                                        Please review your payroll details. Confirm if everything is correct or reject with a reason if there is an issue.
                                    </p>
                                    
                                    {!showRejectionBox ? (
                                        <div className="flex gap-3">
                                            <button
                                                disabled={isProcessingPayroll}
                                                onClick={handleConfirmPayroll}
                                                className="flex-1 h-11 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                            >
                                                Confirm Payroll
                                            </button>
                                            <button
                                                disabled={isProcessingPayroll}
                                                onClick={() => setShowRejectionBox(true)}
                                                className="flex-1 h-11 bg-white border-2 border-rose-100 text-rose-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Explain the reason for rejection..."
                                                className="w-full p-4 rounded-xl border border-rose-100 bg-white text-xs font-medium focus:ring-4 focus:ring-rose-100 outline-none min-h-[100px]"
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    disabled={isProcessingPayroll}
                                                    onClick={handleRejectPayroll}
                                                    className="flex-1 h-11 bg-rose-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-all disabled:opacity-50"
                                                >
                                                    Submit Rejection
                                                </button>
                                                <button
                                                    disabled={isProcessingPayroll}
                                                    onClick={() => setShowRejectionBox(false)}
                                                    className="px-4 h-11 bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedInvoice.type === 'Payroll' && selectedInvoice.payrollStatus === 'Rejected' && (
                                <div className="mt-6 p-6 bg-rose-50 rounded-3xl border border-rose-100">
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Rejection Reason</p>
                                    <p className="text-xs font-bold text-slate-600 italic">
                                        &quot;{selectedInvoice.rejectionReason || 'No reason provided'}&quot;
                                    </p>
                                    <p className="mt-3 text-[10px] font-bold text-slate-400">
                                        Admin has been notified and will resolve the issue shortly.
                                    </p>
                                </div>
                            )}

                            {selectedInvoice.type === 'Payroll' && selectedInvoice.payrollStatus === 'Confirmed' && (
                                <div className="mt-6 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-500" size={20} />
                                    <div>
                                        <p className="text-xs font-black text-emerald-700">Payroll Confirmed</p>
                                        <p className="text-[10px] font-bold text-emerald-600/70">Awaiting final payment from Admin.</p>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
            </RightDrawer>

            {/* Settle Invoice Modal */}
            <RightDrawer
                isOpen={isSettleModalOpen}
                onClose={() => setIsSettleModalOpen(false)}
                title="Record Payment"
            >
                <form onSubmit={handleSettleSubmit} className="p-8 space-y-8">
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Payable</p>
                            <h3 className="text-2xl font-black text-emerald-700">₹{Number(settlementData.fullAmount || settlementData.amount).toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shadow-emerald-100">
                            <Receipt size={24} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {Number(settlementData.fullAmount) > 0 && (
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partial Payment</p>
                                    <p className="text-[11px] font-bold text-slate-600">Pay only a portion now</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const isPartial = !settlementData.isPartial;
                                        setSettlementData({
                                            ...settlementData,
                                            isPartial,
                                            amount: isPartial ? settlementData.fullAmount / 2 : settlementData.fullAmount
                                        });
                                    }}
                                    className={`w-12 h-6 rounded-full transition-all relative ${settlementData.isPartial ? 'bg-primary' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settlementData.isPartial ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        )}

                        {settlementData.isPartial && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed] ml-1">Pay Now (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={settlementData.fullAmount}
                                        value={settlementData.amount}
                                        onChange={(e) => setSettlementData({ ...settlementData, amount: parseFloat(e.target.value) })}
                                        className="w-full h-14 px-5 bg-primary-light border border-violet-100 rounded-2xl text-[13px] font-bold text-primary focus:outline-none focus:border-primary transition-all font-sans"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Remaining Balance</label>
                                    <div className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center text-[13px] font-bold text-slate-400 cursor-not-allowed">
                                        ₹{(Number(settlementData.fullAmount) - Number(settlementData.amount || 0)).toLocaleString()}
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-1">Next Due Date *</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={settlementData.balanceDueDate}
                                        onChange={(e) => setSettlementData({ ...settlementData, balanceDueDate: e.target.value })}
                                        className="w-full h-14 px-5 bg-rose-50 border border-rose-100 rounded-2xl text-[13px] font-bold text-rose-600 focus:outline-none focus:border-rose-400 transition-all font-sans"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Cash', 'UPI', 'QR Code', 'Card', 'Online Link'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setSettlementData({ ...settlementData, method: m })}
                                        className={`px-4 py-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${settlementData.method === m ? 'border-primary bg-primary text-white shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {settlementData.method !== 'Cash' && (
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reference / Transaction ID</label>
                                <input
                                    type="text"
                                    required
                                    value={settlementData.referenceNumber}
                                    onChange={(e) => setSettlementData({ ...settlementData, referenceNumber: e.target.value })}
                                    placeholder="Enter TNX ID..."
                                    className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-900 focus:outline-none focus:border-primary transition-all font-sans"
                                />
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Date</label>
                            <input
                                type="date"
                                required
                                value={settlementData.date}
                                onChange={(e) => setSettlementData({ ...settlementData, date: e.target.value })}
                                className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-900 focus:outline-none focus:border-primary transition-all font-sans"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            disabled={isSettling}
                            loading={isSettling}
                            variant="primary"
                            className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
                        >
                            Complete Settlement
                        </Button>
                    </div>
                </form>
            </RightDrawer>
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDeleteInvoice}
                title="Delete Invoice?"
                message="This invoice will be permanently removed. This action cannot be undone."
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default Invoices;
