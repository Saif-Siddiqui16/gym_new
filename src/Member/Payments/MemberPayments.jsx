import React, { useState, useEffect } from 'react';
import {
    FileText,
    Receipt,
    Download,
    IndianRupee,
    ArrowUpRight,
    CreditCard,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    Search,
    ChevronRight,
    TrendingUp,
    Sparkles
} from 'lucide-react';
import { getInvoices } from '../../api/member/memberApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { payInvoice, failPayment } from '../../api/member/memberApi';

const MemberPayments = () => {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    const loadData = async () => {
        try {
            const invoicesData = await getInvoices();
            setInvoices(invoicesData || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDownloadInvoice = (inv) => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text(`Invoice #${inv.id}`, 14, 22);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Status: ${inv.status}`, 14, 35);

            autoTable(doc, {
                startY: 45,
                head: [['Description', 'Amount', 'Date']],
                body: [[`Gym Membership Services`, `INR ${Number(inv.amount).toLocaleString()}`, new Date(inv.dueDate).toLocaleDateString()]],
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] } // primary
            });

            doc.save(`Invoice_${inv.id}.pdf`);
            toast.success("Invoice downloaded");
        } catch (err) {
            console.error("PDF generation failed", err);
            toast.error("Download failed");
        }
    };

    const handleOpenPaymentGateway = (inv) => {
        setSelectedInvoice(inv);
        setIsPaymentModalOpen(true);
    };

    const handleProcessPayment = async (status) => {
        if (!selectedInvoice) return;
        setProcessingPayment(true);
        try {
            if (status === 'success') {
                await payInvoice(selectedInvoice.dbId);
                toast.success("Payment successful!");
            } else {
                await failPayment(selectedInvoice.dbId);
                toast.error("Transaction Failed. Please try again.");
            }
            setIsPaymentModalOpen(false);
            loadData();
        } catch (error) {
            toast.error(error?.message || "Payment processing failed");
        } finally {
            setProcessingPayment(false);
        }
    };

    const pendingAmount = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + Number(i.amount), 0);
    const pendingCount = invoices.filter(i => i.status !== 'Paid').length;
    const paidCount = invoices.filter(i => i.status === 'Paid').length;


    const stats = [
        {
            id: 1,
            title: 'Pending Amount',
            value: `₹${pendingAmount.toLocaleString()}`,
            icon: IndianRupee,
            color: 'bg-rose-500',
            lightColor: 'bg-rose-50',
            textColor: 'text-rose-600'
        },
        {
            id: 2,
            title: 'Pending Invoices',
            value: pendingCount.toString(),
            icon: Clock,
            color: 'bg-amber-500',
            lightColor: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
        {
            id: 3,
            title: 'Paid Invoices',
            value: paidCount.toString(),
            icon: CheckCircle,
            color: 'bg-emerald-500',
            lightColor: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
    ];

    return (
        <div className="saas-container h-screen  space-y-10 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-white">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-10 border-b-2 border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-violet-100">
                        <Receipt size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">My Invoices</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">View and pay your invoices</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map(stat => (
                    <div key={stat.id} className="relative group overflow-hidden bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 transition-all group-hover:scale-110" />
                        <div className="relative flex items-center gap-6">
                            <div className={`${stat.lightColor} w-16 h-16 rounded-2xl flex items-center justify-center ${stat.textColor}`}>
                                <stat.icon size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-10">
                <div className="bg-white rounded-[3rem] border-2 border-slate-100 p-10 shadow-xl shadow-slate-200/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-light rounded-2xl text-primary">
                                <Receipt size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">All Invoices</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction history and billing</p>
                            </div>
                        </div>
                    </div>

                    {invoices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Details</th>
                                        <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Raised On</th>
                                        <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-6 py-2 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="group hover:bg-slate-50 transition-all rounded-3xl overflow-hidden">
                                            <td className="px-6 py-6 border-y-2 border-l-2 border-slate-100 first:rounded-l-3xl first:border-l-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-violet-100 transition-all">
                                                        <FileText size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 tracking-tight">#{inv.id}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            {inv.serviceName || (inv.bookingId ? 'Session Booking' : 'Gym Membership')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 border-y-2 border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-600">{new Date(inv.dueDate).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billing Period Entry</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 border-y-2 border-slate-100 text-center">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${inv.status === 'Paid'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 border-y-2 border-slate-100 text-right">
                                                <div className="text-lg font-black text-slate-900 tracking-tight">₹{Number(inv.amount).toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-6 border-y-2 border-r-2 border-slate-100 last:rounded-r-3xl last:border-r-2 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleDownloadInvoice(inv)}
                                                        className="p-3 text-slate-400 hover:text-primary bg-white hover:bg-primary-light border-2 border-slate-100 hover:border-violet-100 rounded-xl transition-all shadow-sm"
                                                        title="Download Invoice"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    {inv.status !== 'Paid' && (
                                                        <button
                                                            onClick={() => handleOpenPaymentGateway(inv)}
                                                            className="flex items-center gap-2 px-6 h-12 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-violet-100 hover:bg-primary-hover transition-all active:scale-95 group/btn"
                                                        >
                                                            Pay Link
                                                            <CreditCard size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                        </button>
                                                    )}
                                                    {inv.status === 'Paid' && (
                                                        <button
                                                            className="flex items-center gap-2 px-6 h-12 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border-2 border-emerald-100 cursor-default"
                                                        >
                                                            Paid
                                                            <CheckCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 mb-8 shadow-sm">
                                <Receipt size={40} strokeWidth={1} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No invoices found</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">All your future billing will appear here</p>
                        </div>
                    )}

                    <div className="mt-12 flex items-center justify-center">
                        <div className="px-8 py-3 bg-primary-light rounded-full flex items-center gap-3 text-primary">
                            <Sparkles size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">All transactions are secured with military-grade encryption</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Payment Link Modal (Simulated Gateway) */}
            {isPaymentModalOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-light rounded-2xl text-primary">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Payment Gateway</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Secure Transaction</p>
                                </div>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                                <AlertCircle size={20} />
                            </button>
                        </div>
                        
                        <div className="p-10 space-y-8">
                            <div className="bg-slate-50 rounded-3xl p-8 border-2 border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount to Pay</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tight">₹{selectedInvoice.amount.toLocaleString()}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-slate-500">Invoice ID</span>
                                        <span className="font-black text-slate-900">#{selectedInvoice.id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-slate-500">Service</span>
                                        <span className="font-black text-slate-900">{selectedInvoice.bookingId ? 'Booking Confirmation' : 'Membership Renewal'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleProcessPayment('success')}
                                    disabled={processingPayment}
                                    className="h-16 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                                >
                                    {processingPayment ? 'Processing...' : 'Simulate Success'}
                                </button>
                                <button
                                    onClick={() => handleProcessPayment('failure')}
                                    disabled={processingPayment}
                                    className="h-16 rounded-2xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 disabled:opacity-50"
                                >
                                    {processingPayment ? 'Processing...' : 'Simulate Failure'}
                                </button>
                            </div>

                            <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-[0.2em]">
                                This is a secure sandbox environment for testing the payment flow.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberPayments;
