import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import {
    FileText, Receipt, Download, IndianRupee, ArrowUpRight, CreditCard, 
    CheckCircle, Clock, AlertCircle, Calendar, Search, ChevronRight, 
    TrendingUp, Sparkles, X, Loader2, RefreshCw, ShieldCheck, History,
    ArrowDownToLine, Zap
} from 'lucide-react';
import { getInvoices, payInvoice, failPayment } from '../../api/member/memberApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF', dark: '#0D0A1F'
};

const SectionHeader = ({ icon: Icon, title, subtitle, color = T.accent }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>{subtitle}</p>}
        </div>
    </div>
);

const PremiumCard = ({ children, style = {}, index = 0 }) => (
    <div 
        style={{
            background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`,
            padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`,
            ...style
        }}
    >
        {children}
    </div>
);

const MetricCard = ({ title, value, icon: Icon, color, bg, subtitle, index }) => (
    <div 
        style={{
            background: T.surface, padding: 24, borderRadius: 24, border: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column', gap: 16, flex: 1,
            animation: `fadeUp 0.4s ease both ${0.3 + index * 0.05}s`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
        </div>
        <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle, textTransform: 'uppercase', marginTop: 4 }}>{subtitle}</div>
        </div>
    </div>
);

const MemberPayments = () => {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const invoicesData = await getInvoices();
            setInvoices(invoicesData || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleDownloadInvoice = (inv) => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(20); doc.text(`Invoice #${inv.id}`, 14, 22);
            doc.setFontSize(10); doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Status: ${inv.status}`, 14, 35);
            autoTable(doc, {
                startY: 45, head: [['Description', 'Amount', 'Date']],
                body: [[`Gym Membership Services`, `INR ${Number(inv.amount).toLocaleString()}`, new Date(inv.dueDate).toLocaleDateString()]],
                theme: 'striped', headStyles: { fillColor: [124, 92, 252] }
            });
            doc.save(`Invoice_${inv.id}.pdf`);
            toast.success("Invoice downloaded");
        } catch (err) { toast.error("Download failed"); }
    };

    const handleOpenPaymentGateway = (inv) => { setSelectedInvoice(inv); setIsPaymentModalOpen(true); };

    const handleProcessPayment = async (status) => {
        if (!selectedInvoice) return;
        setProcessingPayment(true);
        try {
            if (status === 'success') { await payInvoice(selectedInvoice.dbId); toast.success("Payment successful!"); }
            else { await failPayment(selectedInvoice.dbId); toast.error("Transaction Failed."); }
            setIsPaymentModalOpen(false); loadData();
        } catch (error) { toast.error(error?.message || "Failed"); }
        finally { setProcessingPayment(false); }
    };

    const pendingAmount = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + Number(i.amount), 0);
    const pendingCount = invoices.filter(i => i.status !== 'Paid').length;
    const paidCount = invoices.filter(i => i.status === 'Paid').length;

    if (loading) return <Loader message="Securely fetching your invoices..." />;

    return (
        <div className="dashboard-container" style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                .animate-fadeIn { animation: fadeUp 0.4s ease both; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .stats-grid { display: flex; gap: 24px; }
                .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }

                @media (max-width: 1200px) {
                    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 768px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 24px !important; }
                    .header-banner-badge { width: 100%; justify-content: center; }
                    .stats-grid { grid-template-columns: 1fr; }
                    .modal-payment-actions { grid-template-columns: 1fr !important; }
                }

                @media (max-width: 480px) {
                    .dashboard-container { padding: 16px 16px 40px !important; }
                    .banner-title { font-size: 20px !important; }
                    .premium-card { padding: 20px !important; }
                    .action-btns { flex-direction: column; width: 100%; }
                    .action-btns button { width: 100%; justify-content: center; }
                }
            `}</style>

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="animate-fadeIn header-banner">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Receipt size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="banner-title" style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>My Invoices</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>Manage subscriptions, billing and transaction history</p>
                    </div>
                </div>
                <div className="header-banner-badge" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', position: 'relative', zIndex: 2 }}>
                    <CreditCard size={18} strokeWidth={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Secure Billing Portal</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* STATS ROW */}
                <div className="stats-grid">
                    <MetricCard title="Pending Amount" value={`₹${pendingAmount.toLocaleString()}`} icon={IndianRupee} color={T.rose} bg={T.roseLight} subtitle="Awaiting Settlement" index={0} />
                    <MetricCard title="Open Invoices" value={pendingCount} icon={Clock} color={T.amber} bg={T.amberLight} subtitle="Action Required" index={1} />
                    <MetricCard title="Settled Bills" value={paidCount} icon={CheckCircle} color={T.green} bg={T.greenLight} subtitle="Payment History" index={2} />
                    <MetricCard title="Last Transaction" value="Today" icon={History} color={T.blue} bg={T.blueLight} subtitle="Activity Status" index={3} />
                </div>

                {/* INVOICES SECTION */}
                <PremiumCard index={4} className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }} className="header-action-row">
                        <SectionHeader icon={Receipt} title="Recent Billing" subtitle="Full transaction history" />
                        <div style={{ padding: '8px 16px', borderRadius: 12, background: T.bg, color: T.accent, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Logs: {invoices.length}</div>
                    </div>

                    {invoices.length > 0 ? (
                        <div className="table-container">
                             <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: `2px solid ${T.bg}` }}>
                                        <th style={{ padding: '16px 24px', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Service Details</th>
                                        <th style={{ padding: '16px 24px', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Raise Date</th>
                                        <th style={{ padding: '16px 24px', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                                        <th style={{ padding: '16px 24px', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Total Amount</th>
                                        <th style={{ padding: '16px 24px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv, idx) => (
                                        <tr key={inv.id} style={{ borderBottom: `1px solid ${T.bg}`, transition: '0.2s' }}>
                                            <td style={{ padding: '24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}><FileText size={20} /></div>
                                                    <div>
                                                        <p style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: 0 }}>#{inv.id}</p>
                                                        <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>{inv.serviceName || (inv.bookingId ? 'Session Booking' : 'Gym Membership')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '24px', fontSize: 13, fontWeight: 800, color: T.text }}>{new Date(inv.dueDate).toLocaleDateString('en-GB')}</td>
                                            <td style={{ padding: '24px' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                                                    background: inv.status === 'Paid' ? T.greenLight : T.roseLight,
                                                    color: inv.status === 'Paid' ? T.green : T.rose,
                                                    border: `1px solid ${inv.status === 'Paid' ? T.green : T.rose}20`
                                                }}>{inv.status}</span>
                                            </td>
                                            <td style={{ padding: '24px', fontSize: 18, fontWeight: 900, color: T.text, textAlign: 'right' }}>₹{Number(inv.amount).toLocaleString()}</td>
                                            <td style={{ padding: '24px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }} className="action-btns">
                                                    <button onClick={() => handleDownloadInvoice(inv)} style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${T.border}`, background: '#fff', color: T.subtle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowDownToLine size={20} /></button>
                                                    {inv.status !== 'Paid' ? (
                                                        <button onClick={() => handleOpenPaymentGateway(inv)} style={{ padding: '0 24px', height: 44, background: T.accent, color: '#fff', borderRadius: 12, border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 16px rgba(124,92,252,0.2)' }}>Pay Now</button>
                                                    ) : (
                                                        <div style={{ height: 44, padding: '0 24px', background: T.bg, color: T.green, borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={18} /> Settled</div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 80, border: `2px dashed ${T.border}`, borderRadius: 24, background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Receipt size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                            <h4 style={{ fontSize: 16, fontWeight: 900, color: T.text }}>No Billing Records Found</h4>
                            <p style={{ color: T.muted, fontSize: 13, fontWeight: 700 }}>Your invoices and transaction logs will be displayed here.</p>
                        </div>
                    )}
                </PremiumCard>

                <div style={{ display: 'flex', justifyContent: 'center' }} className="animate-fadeIn">
                     <div style={{ padding: '12px 24px', borderRadius: 16, background: T.accentLight, color: T.accent, border: `1px solid ${T.accentMid}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Zap size={18} />
                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transactions are secured with industrial-grade 256-bit SSL Encryption</span>
                    </div>
                </div>

            </div>

            {/* PAYMENT MODAL */}
            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} showCloseButton={false} maxWidth="max-w-xl">
                 <div style={{ background: T.dark, borderBottom: '1px solid rgba(255,255,255,0.1)', padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CreditCard size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>Authorize Payment</h3>
                                <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', margin: 0 }}>Encrypted Sandbox Session</p>
                            </div>
                        </div>
                        <button onClick={() => setIsPaymentModalOpen(false)} style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                </div>
                <div style={{ padding: 48, background: '#fff' }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <p style={{ fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Amount Payable</p>
                        <h2 style={{ fontSize: 64, fontWeight: 900, color: T.text, margin: '8px 0', letterSpacing: '-2px' }}>₹{selectedInvoice ? Number(selectedInvoice.amount).toLocaleString() : 0}</h2>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                            <span style={{ padding: '4px 12px', background: T.bg, borderRadius: 8, fontSize: 10, fontWeight: 900, color: T.muted }}>REF: #{selectedInvoice?.id}</span>
                            <span style={{ padding: '4px 12px', background: T.bg, borderRadius: 8, fontSize: 10, fontWeight: 900, color: T.muted }}>PLAN: {selectedInvoice?.serviceName || 'SERVICES'}</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                         <button onClick={() => handleProcessPayment('success')} disabled={processingPayment} style={{ height: 64, background: T.dark, color: '#fff', borderRadius: 16, border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                            {processingPayment ? <RefreshCw className="animate-spin" /> : <CheckCircle size={20} />} Authorize
                         </button>
                         <button onClick={() => handleProcessPayment('failure')} disabled={processingPayment} style={{ height: 64, background: T.bg, color: T.rose, borderRadius: 16, border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                            {processingPayment ? <RefreshCw className="animate-spin" /> : <X size={20} />} Decline
                         </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MemberPayments;
