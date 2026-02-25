import React, { useState, useEffect } from 'react';
import { CreditCard, Download, FileText, CheckCircle2, AlertCircle, Calendar, Receipt, ExternalLink, X, Plus, Clock, Wallet, CheckCircle, TrendingUp, IndianRupee, RefreshCw, ThumbsUp, Trash2 } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import RightDrawer from '../../components/common/RightDrawer';
import MobileCard from '../../components/common/MobileCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatsCard from '../../modules/dashboard/components/StatsCard';

import { getInvoices, payInvoice, getSavedCards, addSavedCard, deleteSavedCard } from '../../api/member/memberApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MemberPayments = () => {
    const [showAddMethodModal, setShowAddMethodModal] = useState(false);
    const [showStatementModal, setShowStatementModal] = useState(false);
    const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [downloadingInvoice, setDownloadingInvoice] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const [invoices, setInvoices] = useState([]);
    const [savedCards, setSavedCards] = useState([]);
    const [newCard, setNewCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const loadData = async () => {
        try {
            const [invoicesData, cardsData] = await Promise.all([
                getInvoices(),
                getSavedCards()
            ]);
            setInvoices(invoicesData);
            setSavedCards(cardsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDownloadInvoice = (invId) => {
        setDownloadingInvoice(invId);
        try {
            const inv = invoices.find(i => i.id === invId);
            if (!inv) return;

            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text(`Invoice #${inv.id}`, 14, 22);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Status: ${inv.status}`, 14, 35);

            autoTable(doc, {
                startY: 45,
                head: [['Description', 'Amount', 'Due Date']],
                body: [[`Membership Services`, `INR ${inv.amount.toLocaleString()}`, inv.dueDate]],
                theme: 'striped',
                headStyles: { fillColor: [139, 92, 246] }
            });

            doc.save(`${inv.id}_Statement.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
        } finally {
            setDownloadingInvoice(null);
        }
    };

    const handleDownloadYearly = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text("Complete Yearly Statement", 14, 22);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Fiscal Year: ${selectedYear}`, 14, 35);

            const filteredInvoices = invoices.filter(t => new Date(t.date).getFullYear().toString() === selectedYear);

            const tableData = filteredInvoices.map(t => [
                t.id, t.date, t.status, `INR ${t.amount.toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['Invoice ID', 'Date', 'Status', 'Amount']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [139, 92, 246] }
            });

            doc.save(`Complete_Statement_${new Date().getFullYear()}.pdf`);
            setShowStatementModal(false);
        } catch (err) {
            console.error("PDF generation failed", err);
        }
    };

    const handleAddCard = async () => {
        try {
            if (newCard.number.length < 4) {
                alert("Valid card required");
                return;
            }
            const cardData = {
                name: newCard.name || 'New Payment Card',
                number: newCard.number.slice(-4),
                expiry: newCard.expiry || 'MM/YY',
                brand: 'Custom'
            };
            const added = await addSavedCard(cardData);
            setSavedCards([...savedCards, added.card]);
            setShowAddMethodModal(false);
            setNewCard({ name: '', number: '', expiry: '', cvv: '' });
            alert('Card Added!');
        } catch (e) {
            console.error("Failed", e);
            alert('Adding card failed');
        }
    };

    const handleDeleteCard = async (id) => {
        if (!window.confirm("Are you sure you want to delete this payment method?")) return;
        try {
            await deleteSavedCard(id);
            setSavedCards(savedCards.filter(c => c.id !== id));
        } catch (error) {
            console.error('Failed to delete card:', error);
            alert('Failed to delete card');
        }
    };

    const handlePayNow = (invoice) => {
        setSelectedInvoice(invoice);
        setShowPaymentDrawer(true);
    };

    const processPayment = async () => {
        setPaymentProcessing(true);
        try {
            await payInvoice(selectedInvoice.dbId);
            setPaymentSuccess(true);
            // Update invoice status in local state
            setInvoices(prev => prev.map(inv =>
                inv.id === selectedInvoice.id ? { ...inv, status: 'Paid' } : inv
            ));
            setTimeout(() => {
                setPaymentSuccess(false);
                setShowPaymentDrawer(false);
            }, 2000);
        } catch (error) {
            console.error('Error paying invoice:', error);
            alert('Failed to process payment');
        } finally {
            setPaymentProcessing(false);
        }
    };

    const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const totalOut = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0);

    const stats = [
        { id: 1, title: 'Outstanding Balance', value: `₹${totalOut.toLocaleString()}`, icon: AlertCircle, color: totalOut > 0 ? 'danger' : 'success' },
        { id: 2, title: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, icon: CheckCircle, color: 'success' },
        { id: 3, title: 'Total Invoices', value: invoices.length.toString(), icon: FileText, color: 'primary' },
    ];

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Dashboard-style Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payments & Billing</h1>
                        <p className="text-slate-500 font-medium">Manage your invoices and payment methods in one place.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowStatementModal(true)} icon={FileText}>
                            Yearly Statement
                        </Button>
                    </div>
                </div>

                {/* Summary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map(stat => (
                        <StatsCard key={stat.id} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar: Account Status & Saved Methods */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="rounded-[32px] border-l-4 border-l-emerald-500">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Account Status</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-slate-900 leading-tight">{totalOut > 0 ? 'Action Required' : 'Paid & Current'}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{totalOut > 0 ? 'Pay Outstanding Balance' : 'All clear'}</div>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-[32px]">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Methods</h4>
                            <div className="space-y-4">
                                {savedCards.length > 0 ? savedCards.map((card, i) => (
                                    <div key={card.id || i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                <CreditCard size={14} className="text-violet-600" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">•••• {card.number}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {i === 0 && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                            <button onClick={() => handleDeleteCard(card.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-xs font-bold text-slate-400 flex items-center justify-center p-4">
                                        No linked cards yet
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAddMethodModal(true)}
                                    className="w-full h-12 border-dashed border-2 hover:border-violet-300 rounded-2xl"
                                    icon={Plus}
                                >
                                    Add New Method
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* History Table Container */}
                    <div className="lg:col-span-3">
                        <Card className="rounded-[32px] p-0 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-900">Invoice History</h3>
                                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                                    <Receipt size={20} />
                                </div>
                            </div>

                            {invoices.length > 0 ? (
                                <div className="overflow-x-auto overflow-y-hidden">
                                    {/* Desktop Table (Hidden on small screens) */}
                                    <table className="w-full text-left border-collapse hidden md:table">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {invoices.map(inv => (
                                                <PaymentRow
                                                    key={inv.id}
                                                    {...inv}
                                                    onDownload={handleDownloadInvoice}
                                                    onPay={handlePayNow}
                                                    downloading={downloadingInvoice}
                                                />
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Mobile Card Layout (Visible only on small screens) */}
                                    <div className="md:hidden p-6 space-y-6">
                                        {invoices.map(inv => (
                                            <MobileCard
                                                key={inv.id}
                                                title={`Invoice #${inv.id}`}
                                                subtitle={inv.date}
                                                status={inv.status}
                                                statusColor={inv.status === 'Paid' ? 'emerald' : inv.status === 'Unpaid' ? 'rose' : 'amber'}
                                                badge={`₹${inv.amount.toLocaleString()}`}
                                                badgeColor="violet"
                                                icon={Receipt}
                                                actions={inv.status !== 'Paid' ? [
                                                    {
                                                        label: 'Pay Now',
                                                        icon: IndianRupee,
                                                        onClick: () => handlePayNow(inv),
                                                        variant: 'primary'
                                                    },
                                                    {
                                                        label: 'PDF',
                                                        icon: Download,
                                                        onClick: () => handleDownloadInvoice(inv.id),
                                                        variant: 'outline'
                                                    }
                                                ] : [
                                                    {
                                                        label: 'Download PDF',
                                                        icon: Download,
                                                        onClick: () => handleDownloadInvoice(inv.id),
                                                        variant: 'outline'
                                                    }
                                                ]}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                        <FileText size={40} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">No invoices available</h4>
                                    <p className="text-slate-400 font-medium">All your future billing will appear here.</p>
                                </div>
                            )}

                            <div className="p-8 text-center bg-slate-50/30 border-t border-slate-50">
                                <button
                                    onClick={() => setShowStatementModal(true)}
                                    className="group inline-flex items-center gap-2 text-violet-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-violet-700 transition-all"
                                >
                                    <FileText size={14} />
                                    Download Complete Year Statement
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Payment Flow Drawer */}
            <RightDrawer
                isOpen={showPaymentDrawer}
                onClose={() => !paymentProcessing && setShowPaymentDrawer(false)}
                title="Process Payment"
                maxWidth="max-w-md"
            >
                {selectedInvoice && (
                    <div className="p-8 space-y-8 h-full flex flex-col">
                        {!paymentSuccess ? (
                            <>
                                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-white shadow-sm flex items-center justify-center text-violet-600">
                                        <Receipt size={32} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-slate-900 leading-tight">#{selectedInvoice.id}</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Due Date: {selectedInvoice.dueDate}</div>
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="p-6 rounded-[32px] bg-slate-900 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Total Amount Due</p>
                                        <div className="text-4xl font-black tracking-tight mb-6">₹{selectedInvoice.amount.toLocaleString()}</div>

                                        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={16} className="text-slate-400" />
                                                <span className="text-sm font-bold opacity-80">{savedCards.length > 0 ? `Card •••• ${savedCards[0].number}` : 'No Linked Cards'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[32px] bg-emerald-50 border border-emerald-100 flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <p className="text-xs font-bold text-emerald-800 leading-relaxed uppercase tracking-wide">
                                            Your payment is secured with standard encryption. Verified merchant Kiaan Gyms.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <Button
                                        onClick={processPayment}
                                        disabled={paymentProcessing}
                                        className="w-full py-5 rounded-[24px]"
                                    >
                                        {paymentProcessing ? (
                                            <div className="flex items-center gap-3">
                                                <RefreshCw size={20} className="animate-spin" />
                                                Processing Security...
                                            </div>
                                        ) : (
                                            `Authorize Payment (₹${selectedInvoice.amount.toLocaleString()})`
                                        )}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                                    <div className="relative w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                                        <ThumbsUp size={40} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Payment Verified!</h3>
                                    <p className="text-slate-500 font-medium max-w-xs leading-relaxed">
                                        Your invoice balance for #{selectedInvoice.id} has been cleared.
                                    </p>
                                </div>
                                <div className="pt-10 w-full">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Invoice will reflect status 'Paid' immediately
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </RightDrawer>

            {/* Add Payment Method Drawer */}
            <RightDrawer
                isOpen={showAddMethodModal}
                onClose={() => setShowAddMethodModal(false)}
                title="Add New Card"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Card Number</label>
                            <input
                                value={newCard.number}
                                onChange={e => setNewCard({ ...newCard, number: e.target.value })}
                                maxLength={16}
                                className="w-full h-14 px-5 rounded-[20px] border-2 border-slate-100 focus:border-violet-500 outline-none font-bold text-slate-900 transition-all bg-slate-50 tracking-widest" placeholder="0000 0000 0000 0000" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expiry</label>
                                <input
                                    value={newCard.expiry}
                                    onChange={e => setNewCard({ ...newCard, expiry: e.target.value })}
                                    className="w-full h-14 px-5 rounded-[20px] border-2 border-slate-100 focus:border-violet-500 outline-none font-bold text-slate-900 transition-all bg-slate-50" placeholder="MM/YY" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CVV</label>
                                <input
                                    value={newCard.cvv}
                                    onChange={e => setNewCard({ ...newCard, cvv: e.target.value })}
                                    maxLength={4}
                                    className="w-full h-14 px-5 rounded-[20px] border-2 border-slate-100 focus:border-violet-500 outline-none font-bold text-slate-900 transition-all bg-slate-50" placeholder="•••" type="password" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button variant="outline" onClick={() => setShowAddMethodModal(false)} className="flex-1 py-5 rounded-[24px]">
                            Cancel
                        </Button>
                        <Button onClick={handleAddCard} className="flex-[2] py-5 rounded-[24px]">
                            Add Securely
                        </Button>
                    </div>
                </div>
            </RightDrawer>

            {/* Year End Statement Drawer */}
            <RightDrawer
                isOpen={showStatementModal}
                onClose={() => setShowStatementModal(false)}
                title="Yearly Statement"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="bg-violet-50 p-6 rounded-[24px] border border-violet-100 flex gap-4 text-violet-800 text-sm font-medium leading-relaxed">
                            <FileText className="shrink-0 text-violet-600" size={24} />
                            <p>Select the fiscal year to download your complete payment breakdown and gym membership statements.</p>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fiscal Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full h-14 px-5 rounded-[20px] border-2 border-slate-100 focus:border-violet-500 outline-none font-black text-slate-900 transition-all bg-slate-50 appearance-none">
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                                <option value="2022">2022</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button variant="outline" onClick={() => setShowStatementModal(false)} className="flex-1 py-5 rounded-[24px]">
                            Close
                        </Button>
                        <Button onClick={handleDownloadYearly} className="flex-[2] py-5 rounded-[24px]" icon={Download}>
                            Generate PDF
                        </Button>
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

const PaymentRow = ({ id, dbId, date, amount, status, onDownload, onPay, downloading }) => (
    <tr className="hover:bg-slate-50/50 transition-all group">
        <td className="px-8 py-5">
            <div className="flex items-center gap-3">
                <Receipt size={16} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
                <span className="text-sm font-bold text-slate-900 tracking-tight">{id}</span>
            </div>
        </td>
        <td className="px-8 py-5">
            <span className="text-sm font-bold text-slate-500">{date}</span>
        </td>
        <td className="px-8 py-5">
            <span className="text-sm font-black text-slate-900 tracking-tight">₹{amount.toLocaleString()}</span>
        </td>
        <td className="px-8 py-5">
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                status === 'Unpaid' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'Paid' ? 'bg-emerald-500' :
                    status === 'Unpaid' ? 'bg-rose-500' :
                        'bg-amber-500 animate-pulse'
                    }`} />
                {status}
            </span>
        </td>
        <td className="px-8 py-5">
            <div className="flex justify-end gap-2">
                {status !== 'Paid' && (
                    <Button
                        onClick={() => onPay({ id, dbId, date, amount, status })}
                        className="h-10 px-4 py-0 rounded-xl bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-100"
                    >
                        Pay Now
                    </Button>
                )}
                <button
                    onClick={() => onDownload(id)}
                    disabled={downloading === id}
                    className="p-2.5 text-slate-400 hover:text-violet-600 hover:bg-white rounded-xl shadow-sm border border-slate-100 transition-all disabled:opacity-50"
                    title="Download PDF"
                >
                    {downloading === id ? (
                        <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Download size={16} />
                    )}
                </button>
            </div>
        </td>
    </tr>
);

export default MemberPayments;
