import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, Download, Calendar, User, CreditCard, CheckCircle, AlertCircle, Clock, X, Receipt } from 'lucide-react';
import { fetchInvoices } from '../../../api/finance/financeApi';
import RightDrawer from '../../../components/common/RightDrawer';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../../../styles/GlobalDesign.css';

const Invoices = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetailDrawer, setShowDetailDrawer] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const loadInvoices = async () => {
            try {
                const data = await fetchInvoices();
                setInvoices(data);
            } catch (error) {
                console.error("Error loading invoices:", error);
            } finally {
                setLoading(false);
            }
        };
        loadInvoices();
    }, []);

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
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

                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 mx-auto mb-4 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                            <p className="text-slate-600 font-bold">Loading invoices...</p>
                        </div>
                    ) : filteredInvoices.length === 0 && (
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
    const handleDownloadPDF = () => {
        try {
            const doc = new jsPDF();

            // Extract gym name from local storage
            const userStr = localStorage.getItem('userData');
            let gymName = 'Gym CRM';
            if (userStr) {
                const userObj = JSON.parse(userStr);
                gymName = userObj?.branchName || userObj?.tenant?.name || 'GYM INVOICE';
            }

            // Define Standard Colors
            const primaryColor = [109, 40, 217]; // violet-700
            const darkGray = [30, 41, 59]; // slate-800
            const lightGray = [100, 116, 139]; // slate-500

            // Header - Gym Name
            doc.setFontSize(28);
            doc.setTextColor(...primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text(gymName.toUpperCase(), 14, 25);

            // Header - Invoice Label
            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.setFont('helvetica', 'normal');
            doc.text('TAX INVOICE', 196, 25, null, null, 'right');

            // Header Line
            doc.setDrawColor(226, 232, 240); // slate-200
            doc.setLineWidth(0.5);
            doc.line(14, 32, 196, 32);

            // Invoice Grid Info (Left side: Meta, Right side: Status)
            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.text('Invoice Number:', 14, 42);
            doc.setFontSize(11);
            doc.setTextColor(...darkGray);
            doc.setFont('helvetica', 'bold');
            doc.text(invoice.invoiceNumber, 14, 48);

            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.setFont('helvetica', 'normal');
            doc.text('Date of Issue:', 90, 42);
            doc.setFontSize(11);
            doc.setTextColor(...darkGray);
            doc.setFont('helvetica', 'bold');
            doc.text(new Date(invoice.issueDate).toLocaleDateString(), 90, 48);

            // Status indicator
            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.setFont('helvetica', 'normal');
            doc.text('Status:', 196, 42, null, null, 'right');

            // Status color logic
            let statusColor = [100, 116, 139];
            if (invoice.status === 'Paid') statusColor = [5, 150, 105]; // emerald-600
            if (invoice.status === 'Overdue') statusColor = [220, 38, 38]; // red-600
            if (invoice.status === 'Partial') statusColor = [217, 119, 6]; // amber-600

            doc.setFontSize(14);
            doc.setTextColor(...statusColor);
            doc.setFont('helvetica', 'bold');
            doc.text(invoice.status.toUpperCase(), 196, 49, null, null, 'right');

            // Bill To Section
            doc.setFillColor(248, 250, 252); // slate-50
            doc.roundedRect(14, 55, 182, 30, 3, 3, 'F');

            doc.setFontSize(9);
            doc.setTextColor(...lightGray);
            doc.text('BILL TO', 22, 65);

            doc.setFontSize(14);
            doc.setTextColor(...darkGray);
            doc.text(invoice.memberName, 22, 74);

            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.setFont('helvetica', 'normal');
            doc.text('Member', 22, 80);

            // Prepare Services Table
            const tableBody = invoice.services.map(s => [
                s.name,
                s.quantity.toString(),
                `Rs. ${s.rate.toLocaleString()}`,
                `Rs. ${s.amount.toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: 95,
                head: [['DESCRIPTION', 'QTY', 'RATE', 'AMOUNT']],
                body: tableBody,
                theme: 'plain',
                headStyles: {
                    fillColor: [248, 250, 252], // slate-50
                    textColor: [100, 116, 139],
                    fontStyle: 'bold',
                    fontSize: 9,
                    cellPadding: { top: 6, bottom: 6, left: 8, right: 8 }
                },
                bodyStyles: {
                    textColor: [30, 41, 59],
                    fontSize: 10,
                    cellPadding: { top: 6, bottom: 6, left: 8, right: 8 }
                },
                alternateRowStyles: {
                    fillColor: [255, 255, 255]
                },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { halign: 'center' },
                    2: { halign: 'right' },
                    3: { halign: 'right', fontStyle: 'bold' }
                },
                margin: { left: 14, right: 14 }
            });

            let finalY = doc.lastAutoTable.finalY + 15;

            // Summary Totals Calculation Section
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(120, finalY, 76, 45, 3, 3, 'F');

            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.setFont('helvetica', 'normal');
            doc.text('Total Amount:', 125, finalY + 10);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...darkGray);
            doc.text(`Rs. ${invoice.totalAmount.toLocaleString()}`, 190, finalY + 10, null, null, 'right');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...lightGray);
            doc.text('Paid Amount:', 125, finalY + 20);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(5, 150, 105); // emerald-600
            doc.text(`Rs. ${invoice.paidAmount.toLocaleString()}`, 190, finalY + 20, null, null, 'right');

            // Fine Line
            doc.setDrawColor(226, 232, 240);
            doc.line(125, finalY + 26, 190, finalY + 26);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...darkGray);
            doc.text('Balance Due:', 125, finalY + 36);

            let balanceColor = invoice.balanceDue > 0 ? [220, 38, 38] : [30, 41, 59];
            doc.setFontSize(14);
            doc.setTextColor(...balanceColor);
            doc.text(`Rs. ${invoice.balanceDue.toLocaleString()}`, 190, finalY + 36, null, null, 'right');

            // Payment History if any
            if (invoice.paymentHistory && invoice.paymentHistory.length > 0) {
                finalY += 60;
                doc.setFontSize(9);
                doc.setTextColor(...lightGray);
                doc.setFont('helvetica', 'bold');
                doc.text('PAYMENT HISTORY', 14, finalY);

                const historyBody = invoice.paymentHistory.map(p => [
                    new Date(p.date).toLocaleDateString(),
                    p.method,
                    p.transactionId,
                    `Rs. ${p.amount.toLocaleString()}`
                ]);

                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['DATE', 'METHOD', 'TXN ID', 'AMOUNT']],
                    body: historyBody,
                    theme: 'plain',
                    headStyles: {
                        textColor: [100, 116, 139],
                        fontStyle: 'bold',
                        fontSize: 8,
                        cellPadding: { top: 4, bottom: 4, left: 8, right: 8 }
                    },
                    bodyStyles: {
                        textColor: [100, 116, 139],
                        fontSize: 9,
                        cellPadding: { top: 4, bottom: 4, left: 8, right: 8 }
                    },
                    columnStyles: {
                        3: { halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] }
                    },
                    margin: { left: 14, right: 14 }
                });
            }

            // Footer (on all pages)
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(148, 163, 184); // slate-400
                doc.text('Generated professionally by Gym CRM', 105, 285, null, null, 'center');
            }

            // Save PDF
            doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);

        } catch (err) {
            console.error("Failed generating PDF: ", err);
        }
    };

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
                <button
                    onClick={handleDownloadPDF}
                    className="flex-[2] px-6 py-3.5 md:py-4 bg-violet-600 text-white rounded-2xl font-black text-[10px] md:text-xs shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                    <Download size={18} />
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default Invoices;
