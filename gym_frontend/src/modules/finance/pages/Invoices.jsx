import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, Download, Calendar, User, CreditCard, CheckCircle, AlertCircle, Clock, X, Receipt } from 'lucide-react';
import { INVOICES } from '../data/mockFinance';
import RightDrawer from '../../../components/common/RightDrawer';
import '../../../styles/GlobalDesign.css';

const Invoices = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetailDrawer, setShowDetailDrawer] = useState(false);

    const filteredInvoices = INVOICES.filter(invoice => {
        const matchesSearch = invoice.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || invoice.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setShowDetailDrawer(true);
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Partial': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Overdue': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Paid': return <CheckCircle size={14} />;
            case 'Partial': return <Clock size={14} />;
            case 'Overdue': return <AlertCircle size={14} />;
            default: return null;
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-violet-50/30 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <FileText size={36} className="text-violet-600" />
                        Invoices
                    </h1>
                    <p className="text-gray-500 font-medium mt-1.5 flex items-center gap-2 text-sm">
                        Manage billing and track payments
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors"
                            />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by member name or invoice number..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all"
                            />
                        </div>

                        <div className="relative group">
                            <Filter
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none z-10"
                            />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Partial">Partial</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Invoice Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Service Type</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Paid Amount</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Balance Due</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredInvoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Receipt size={16} className="text-violet-500" />
                                                <span className="text-sm font-bold text-slate-900">{invoice.invoiceNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-slate-400" />
                                                <span className="text-sm font-bold text-slate-900">{invoice.memberName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
                                                {invoice.serviceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-slate-900">₹{invoice.totalAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-emerald-600">₹{invoice.paidAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-sm font-black ${invoice.balanceDue > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                                ₹{invoice.balanceDue.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(invoice.status)}`}>
                                                    {getStatusIcon(invoice.status)}
                                                    {invoice.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewInvoice(invoice)}
                                                    className="p-2 text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition-all hover:scale-110 shadow-sm"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filteredInvoices.map(invoice => (
                            <div key={invoice.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Receipt size={14} className="text-violet-500" />
                                                <span className="text-sm font-bold text-slate-900">{invoice.invoiceNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400" />
                                                <span className="text-sm font-bold text-slate-700">{invoice.memberName}</span>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(invoice.status)}`}>
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
                                            {invoice.serviceType}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Total</p>
                                            <p className="text-sm font-black text-slate-900">₹{invoice.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Paid</p>
                                            <p className="text-sm font-bold text-emerald-600">₹{invoice.paidAmount.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Due</p>
                                            <p className={`text-sm font-black ${invoice.balanceDue > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                                ₹{invoice.balanceDue.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleViewInvoice(invoice)}
                                        className="w-full py-2.5 px-4 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredInvoices.length === 0 && (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                                <FileText size={40} className="text-violet-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Invoices Found</h3>
                            <p className="text-slate-600">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Detail Drawer */}
            <RightDrawer
                isOpen={showDetailDrawer}
                onClose={() => setShowDetailDrawer(false)}
                title="Invoice Details"
                maxWidth="max-w-2xl"
            >
                {selectedInvoice && (
                    <InvoiceDetailContent invoice={selectedInvoice} onClose={() => setShowDetailDrawer(false)} />
                )}
            </RightDrawer>
        </div>
    );
};

const InvoiceDetailContent = ({ invoice, onClose }) => {
    return (
        <div className="p-5 md:p-8 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-1">{invoice.invoiceNumber}</h3>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Issued on {new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    invoice.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    {invoice.status === 'Paid' && <CheckCircle size={14} />}
                    {invoice.status === 'Partial' && <Clock size={14} />}
                    {invoice.status === 'Overdue' && <AlertCircle size={14} />}
                    {invoice.status}
                </span>
            </div>

            {/* Member Info */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Bill To</p>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-lg font-black">
                        {invoice.memberName[0]}
                    </div>
                    <div>
                        <p className="text-lg font-black text-gray-900">{invoice.memberName}</p>
                        <p className="text-sm text-gray-500 font-medium">Member</p>
                    </div>
                </div>
            </div>

            {/* Amount Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="p-4 md:p-5 bg-violet-50 rounded-2xl border border-violet-100">
                    <p className="text-[10px] md:text-xs font-black text-violet-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-xl md:text-2xl font-black text-violet-900">₹{invoice.totalAmount.toLocaleString()}</p>
                </div>
                <div className="p-4 md:p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] md:text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Paid</p>
                    <p className="text-xl md:text-2xl font-black text-emerald-900">₹{invoice.paidAmount.toLocaleString()}</p>
                </div>
                <div className="p-4 md:p-5 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-[10px] md:text-xs font-black text-red-400 uppercase tracking-widest mb-1">Balance Due</p>
                    <p className="text-xl md:text-2xl font-black text-red-900">₹{invoice.balanceDue.toLocaleString()}</p>
                </div>
            </div>

            {/* Services */}
            <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Services</h4>
                <div className="space-y-3">
                    {invoice.services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">{service.name}</p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Qty: {service.quantity} × ₹{service.rate.toLocaleString()}</p>
                            </div>
                            <p className="text-lg font-black text-gray-900">₹{service.amount.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment History */}
            <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Payment History</h4>
                {invoice.paymentHistory.length > 0 ? (
                    <div className="space-y-3">
                        {invoice.paymentHistory.map((payment, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CreditCard size={14} className="text-emerald-600" />
                                        <p className="text-sm font-bold text-emerald-900">{payment.method}</p>
                                    </div>
                                    <p className="text-xs text-emerald-700 font-medium">{new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    <p className="text-xs text-emerald-600 font-medium mt-0.5">{payment.transactionId}</p>
                                </div>
                                <p className="text-lg font-black text-emerald-900">₹{payment.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                        <AlertCircle size={32} className="text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-600">No payments recorded yet</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 border-t border-slate-100">
                <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3.5 md:py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] md:text-xs hover:bg-slate-100 transition-all uppercase tracking-widest"
                >
                    Close
                </button>
                <button className="flex-[2] px-6 py-3.5 md:py-4 bg-violet-600 text-white rounded-2xl font-black text-[10px] md:text-xs shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Download size={18} />
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default Invoices;
