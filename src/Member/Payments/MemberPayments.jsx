import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
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
    Sparkles,
    X,
    Loader2
} from 'lucide-react';
import { getInvoices, payInvoice, failPayment } from '../../api/member/memberApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

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
            gradient: 'from-rose-500 to-red-600',
            lightColor: 'bg-rose-50',
            textColor: 'text-rose-600'
        },
        {
            id: 2,
            title: 'Pending Invoices',
            value: pendingCount.toString(),
            icon: Clock,
            gradient: 'from-amber-400 to-orange-500',
            lightColor: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
        {
            id: 3,
            title: 'Paid Invoices',
            value: paidCount.toString(),
            icon: CheckCircle,
            gradient: 'from-emerald-400 to-teal-600',
            lightColor: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
    ];

    return (
        <div className="saas-container min-h-screen p-4 sm:p-8 space-y-10 animate-fadeIn bg-slate-50/30">
            {/* Header Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-200 animate-pulse-subtle">
                            <Receipt size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">My Invoices</h1>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary h-2 w-2"></span>
                                View and pay your invoices
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map(stat => (
                    <div key={stat.id} className="relative group overflow-hidden bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:-translate-y-2 hover:shadow-2xl">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full -mr-16 -mt-16 blur-3xl opacity-10 transition-all group-hover:scale-150`} />
                        <div className="relative flex items-center gap-6">
                            <div className={`${stat.lightColor} w-16 h-16 rounded-2xl flex items-center justify-center ${stat.textColor} shadow-inner`}>
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

            {/* Main Content Area */}
            <div className="bg-white rounded-[3rem] border-2 border-slate-100 p-6 sm:p-10 shadow-2xl shadow-slate-200/30 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-light rounded-xl text-primary flex items-center justify-center shadow-sm">
                                <Receipt size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Recent Billing</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Full transaction and history</p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center gap-4 opacity-50">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Loading Invoices...</p>
                        </div>
                    ) : invoices.length > 0 ? (
                        <div className="overflow-x-auto pb-4">
                            <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead>
                                    <tr>
                                        <th className="px-8 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction / Service</th>
                                        <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Raise Date</th>
                                        <th className="px-6 py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Status</th>
                                        <th className="px-6 py-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</th>
                                        <th className="px-8 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="group transition-all">
                                            <td className="px-8 py-8 bg-slate-50/50 group-hover:bg-white border-y-2 border-l-2 border-slate-100 first:rounded-l-[2rem] first:border-l-2 group-hover:border-violet-100 group-hover:shadow-lg group-hover:shadow-slate-100/50 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-violet-100 transition-all shadow-sm group-hover:rotate-6">
                                                        <FileText size={24} strokeWidth={2} />
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-black text-slate-900 tracking-tight">#{inv.id}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary transition-colors"></div>
                                                            {inv.serviceName || (inv.bookingId ? 'Session Booking' : 'Gym Membership')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8 bg-slate-50/50 group-hover:bg-white border-y-2 border-slate-100 group-hover:border-violet-100 transition-all">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-700">{new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Next Billing Due</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8 bg-slate-50/50 group-hover:bg-white border-y-2 border-slate-100 text-center group-hover:border-violet-100 transition-all">
                                                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${inv.status === 'Paid'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse-subtle'
                                                    }`}>
                                                    {inv.status === 'Paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-8 bg-slate-50/50 group-hover:bg-white border-y-2 border-slate-100 text-right group-hover:border-violet-100 transition-all">
                                                <div className="text-xl font-black text-slate-900 tracking-tight">₹{Number(inv.amount).toLocaleString()}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Incl. Taxes</div>
                                            </td>
                                            <td className="px-8 py-8 bg-slate-50/50 group-hover:bg-white border-y-2 border-r-2 border-slate-100 last:rounded-r-[2rem] last:border-r-2 text-right group-hover:border-violet-100 transition-all">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleDownloadInvoice(inv)}
                                                        className="p-3.5 text-slate-400 hover:text-primary bg-white hover:bg-primary-light border-2 border-slate-100 hover:border-violet-100 rounded-2xl transition-all shadow-sm"
                                                        title="Download Invoice"
                                                    >
                                                        <Download size={20} />
                                                    </button>
                                                    {inv.status !== 'Paid' ? (
                                                        <button
                                                            onClick={() => handleOpenPaymentGateway(inv)}
                                                            className="flex items-center gap-2 px-8 h-14 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-violet-200 hover:bg-primary-hover hover:-translate-y-1 transition-all active:scale-95 group/btn"
                                                        >
                                                            Pay Now
                                                            <CreditCard size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-8 h-14 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-2 border-emerald-100/50 shadow-inner">
                                                            Settled
                                                            <CheckCircle size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-200 mb-8 shadow-xl shadow-slate-200/50 border-2 border-slate-50 animate-bounce-subtle">
                                <Receipt size={44} strokeWidth={1} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No invoices found</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">All your billing activities will appear here</p>
                        </div>
                    )}

                    <div className="mt-12 flex items-center justify-center">
                        <div className="px-10 py-4 bg-primary-light/50 backdrop-blur-md rounded-2xl flex items-center gap-4 text-primary border border-violet-100/50">
                            <Sparkles size={18} className="animate-spin-slow" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">All transactions are secured with 256-bit SSL encryption</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Payment Gateway Modal */}
            <Modal
                isOpen={isPaymentModalOpen && selectedInvoice}
                onClose={() => setIsPaymentModalOpen(false)}
                showCloseButton={false}
                maxWidth="max-w-xl"
            >
                {selectedInvoice && (
                    <div className="relative overflow-hidden">
                        {/* Decorative Header bg - Fixed positioning to show correctly inside Modal */}
                        <div className="absolute top-0 inset-x-0 h-48 bg-slate-900 border-b border-white/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                        </div>

                        <div className="relative p-8 sm:p-12">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-12 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl">
                                        <CreditCard size={28} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-widest uppercase">Payment Portal</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Encrypted Sandbox</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:text-white hover:bg-white/20 transition-all border border-white/10"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8 relative z-10">
                                {/* Amount Section */}
                                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl relative overflow-hidden group hover:shadow-primary/5 transition-all duration-500">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                    <div className="text-center space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Total Receivable</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-2xl font-black text-slate-900 mt-2">₹</span>
                                            <h2 className="text-6xl font-black text-slate-900 tracking-tighter">
                                                {Number(selectedInvoice.amount).toLocaleString()}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center uppercase tracking-widest">Invoice Unit</p>
                                            <p className="text-[11px] font-black text-slate-900 uppercase text-center truncate tracking-tight">{selectedInvoice.id || selectedInvoice.invoiceNumber || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center uppercase tracking-widest">Plan / Service</p>
                                            <p className="text-[11px] font-black text-slate-900 uppercase text-center truncate tracking-tight">{selectedInvoice.benefitType || selectedInvoice.serviceName || 'Standard Plan'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Simulation Controls */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="h-px w-10 bg-slate-100"></div>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Simulation Controls (Testing Only)</span>
                                        <div className="h-px w-10 bg-slate-100"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleProcessPayment('success')}
                                            disabled={processingPayment}
                                            className="group relative h-20 rounded-[1.5rem] bg-slate-900 text-white overflow-hidden transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="relative flex items-center justify-center gap-3">
                                                {processingPayment ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                                                            <CheckCircle size={20} />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-[0.2em]">Authorize</span>
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => handleProcessPayment('failure')}
                                            disabled={processingPayment}
                                            className="group relative h-20 rounded-[1.5rem] bg-slate-50 text-slate-900 border border-slate-200 overflow-hidden transition-all hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                        >
                                            <div className="relative flex items-center justify-center gap-3">
                                                {processingPayment ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:border-rose-100">
                                                            <X size={20} />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-[0.2em]">Decline</span>
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4 opacity-30 grayscale pt-4">
                                    <div className="flex items-center gap-3 font-black text-[9px] uppercase tracking-tighter text-slate-400">
                                        <span className="px-2 py-1 bg-slate-100 rounded-lg">VISA</span>
                                        <span className="px-2 py-1 bg-slate-100 rounded-lg">MASTERCARD</span>
                                        <span className="px-2 py-1 bg-slate-100 rounded-lg">UPI</span>
                                        <span className="px-2 py-1 bg-slate-100 rounded-lg">GOOGLE PAY</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MemberPayments;
