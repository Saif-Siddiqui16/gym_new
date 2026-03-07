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

const MemberPayments = () => {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);

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
                headStyles: { fillColor: [79, 70, 229] } // Indigo-600
            });

            doc.save(`Invoice_${inv.id}.pdf`);
            toast.success("Invoice downloaded");
        } catch (err) {
            console.error("PDF generation failed", err);
            toast.error("Download failed");
        }
    };

    const handleViewInvoice = (inv) => {
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
                headStyles: { fillColor: [79, 70, 229] } // Indigo-600
            });

            const pdfBlob = doc.output('blob');
            const blobUrl = URL.createObjectURL(pdfBlob);
            window.open(blobUrl, '_blank');
        } catch (err) {
            console.error("PDF generation failed", err);
            toast.error("View failed");
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
        <div className="saas-container h-screen overflow-y-auto p-8 space-y-10 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-white">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-10 border-b-2 border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-100">
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
                    <div key={stat.id} className="relative group overflow-hidden bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1">
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
                            <div className="p-3 bg-violet-50 rounded-2xl text-violet-600">
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
                                                    <div className="w-12 h-12 bg-white rounded-xl border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-violet-600 group-hover:border-violet-100 transition-all">
                                                        <FileText size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 tracking-tight">#{inv.id}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gym Membership</div>
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
                                                        className="p-3 text-slate-400 hover:text-violet-600 bg-white hover:bg-violet-50 border-2 border-slate-100 hover:border-violet-100 rounded-xl transition-all shadow-sm"
                                                        title="Download Invoice"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewInvoice(inv)}
                                                        className="flex items-center gap-2 px-6 h-12 bg-violet-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all active:scale-95 group/btn"
                                                    >
                                                        View
                                                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
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
                        <div className="px-8 py-3 bg-violet-50 rounded-full flex items-center gap-3 text-violet-600">
                            <Sparkles size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">All transactions are secured with military-grade encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberPayments;
