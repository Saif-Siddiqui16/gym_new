import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, XCircle, Filter, IndianRupee, Download, Search, ChevronDown, ChevronLeft, ChevronRight, Activity, Calendar } from 'lucide-react';
import { fetchPayments, updatePaymentStatus } from '../../api/superadmin/superAdminApi';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        
  accent2: '#9B7BFF',       
  accentLight: '#F0ECFF',   
  accentMid: '#E4DCFF',     
  border: '#EAE7FF',        
  bg: '#F6F5FF',            
  surface: '#FFFFFF',       
  text: '#1A1533',          
  muted: '#7B7A8E',         
  subtle: '#B0ADCC',        
  green: '#22C97A',         
  greenLight: '#E8FBF2',
  amber: '#F59E0B',         
  amberLight: '#FEF3C7',
  rose: '#F43F5E',          
  roseLight: '#FFF1F4',
  blue: '#3B82F6',          
  blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const MetricCard = ({ title, value, sub, icon: Icon, type = 'accent', isFirst = false }) => {
    const config = {
        accent: { color: T.accent, bg: T.accentLight },
        success: { color: T.green, bg: T.greenLight },
        warning: { color: T.amber, bg: T.amberLight },
        danger: { color: T.rose, bg: T.roseLight },
    }[type];

    const [hover, setHover] = useState(false);

    return (
        <div 
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: isFirst ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : T.surface,
                borderRadius: 18, border: isFirst ? 'none' : `1px solid ${T.border}`,
                padding: 22, transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'none',
                boxShadow: isFirst ? '0 10px 25px rgba(124,92,252,0.25)' : '0 2px 10px rgba(124,92,252,0.06)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: isFirst ? 'rgba(255,255,255,0.2)' : config.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Icon size={18} color={isFirst ? '#fff' : config.color} strokeWidth={2.5} />
                </div>
                {sub && (
                    <span style={{
                        fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                        color: isFirst ? 'rgba(255,255,255,0.8)' : T.muted
                    }}>{sub}</span>
                )}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: isFirst ? '#fff' : T.text, letterSpacing: '-0.8px', marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: isFirst ? 'rgba(255,255,255,0.7)' : T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
        </div>
    );
};

const StatusPill = ({ status }) => {
    const s = status.toLowerCase();
    const config = {
        success: { color: T.green, bg: T.greenLight, border: '#A7F3D0' },
        pending: { color: T.amber, bg: T.amberLight, border: '#FDE68A' },
        failed:  { color: T.rose,  bg: T.roseLight,  border: '#FECDD3' },
    }[s] || { color: T.muted, bg: T.bg, border: T.border };

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '4px 10px', borderRadius: 20,
            background: config.bg, color: config.color, border: `1px solid ${config.border}`
        }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: config.color }} />
            {status}
        </span>
    );
};

const CustomDropdown = ({ options, value, onChange, placeholder, icon: Icon }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ position: 'relative', height: 40 }} className="dropdown-wrapper">
            <button 
                onClick={() => setOpen(!open)}
                style={{
                    height: 40, padding: '0 14px', background: T.surface, border: `1px solid ${open ? T.accentMid : T.border}`,
                    borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    minWidth: 160, width: '100%', gap: 10, fontSize: 13, fontWeight: 600, color: T.text,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: '0.2s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {Icon && <Icon size={14} color={T.subtle} />}
                    {options.find(o => o.value === value)?.label || placeholder}
                </div>
                <ChevronDown size={14} color={T.subtle} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: '110%', left: 0, right: 0, background: T.surface, borderRadius: 12,
                    border: `1px solid ${T.border}`, boxShadow: '0 8px 24px rgba(124,92,252,0.12)', zIndex: 100,
                    padding: 6, overflow: 'hidden'
                }}>
                    {options.map(o => (
                        <div 
                            key={o.value}
                            onClick={() => { onChange(o.value); setOpen(false); }}
                            style={{
                                padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: value === o.value ? T.accent : T.muted,
                                background: value === o.value ? T.accentLight : 'transparent', cursor: 'pointer', transition: '0.1s'
                            }}
                            onMouseEnter={e => { if (value !== o.value) e.currentTarget.style.background = T.bg; }}
                            onMouseLeave={e => { if (value !== o.value) e.currentTarget.style.background = 'transparent'; }}
                        >
                            {o.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const IndianRupee = ({ size, style }) => (
    <span style={{ fontSize: size, ...style }}>₹</span>
);

const Payments = () => {
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentsData, setPaymentsData] = useState([]);
    const [summaryData, setSummaryData] = useState({ total: '₹0', pending: '₹0', failed: '₹0' });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    useEffect(() => { loadPayments(); }, []);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const data = await fetchPayments();
            setPaymentsData(data || []);

            const successAmt = data.filter(p => p.status === 'Success').reduce((acc, p) => acc + parseFloat(p.amount.replace(/[^0-9.-]+/g, "")), 0);
            const pendingAmt = data.filter(p => p.status === 'Pending').reduce((acc, p) => acc + parseFloat(p.amount.replace(/[^0-9.-]+/g, "")), 0);
            const failedAmt = data.filter(p => p.status === 'Failed').reduce((acc, p) => acc + parseFloat(p.amount.replace(/[^0-9.-]+/g, "")), 0);

            setSummaryData({
                total: `₹${successAmt.toLocaleString('en-IN')}`,
                pending: `₹${pendingAmt.toLocaleString('en-IN')}`,
                failed: `₹${failedAmt.toLocaleString('en-IN')}`
            });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const filteredPayments = paymentsData.filter(p => {
        const matchesMethod = paymentMethodFilter === 'all' || p.method === paymentMethodFilter;
        const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch = p.gymName.toLowerCase().includes(searchTerm.toLowerCase()) || p.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMethod && matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Auditing Ledger Nodes…</p>
            </div>
        );
    }

    return (
        <div style={{
            background: T.bg, minHeight: '100vh', padding: '28px 28px 48px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", animation: 'fadeUp 0.38s ease both'
        }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                
                .grid-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
                .grid-table { display: grid; grid-template-columns: 160px 1.5fr 1fr 1fr 1fr 120px; align-items: center; }
                
                @media (max-width: 1024px) {
                    .grid-stats { grid-template-columns: 1fr; }
                    .table-wrapper { overflow-x: auto !important; display: block !important; }
                    .table-content { min-width: 900px; }
                }
                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 16px 18px !important; }
                    .filter-bar { flex-direction: column; align-items: stretch !important; gap: 12px !important; }
                    .grid-table { grid-template-columns: 1fr !important; gap: 12px; padding: 18px !important; border-bottom: 8px solid ${T.bg} !important; }
                    .table-header { display: none !important; }
                    .mobile-label { display: block !important; margin-bottom: 4px; font-size: 8px !important; color: ${T.subtle} !important; text-transform: uppercase; font-weight: 800; }
                }
            `}</style>

            {/* ──────── HEADER BANNER ──────── */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 20, padding: '20px 26px', boxShadow: '0 8px 32px rgba(124,92,252,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, position: 'relative'
            }} className="header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
                    }}>
                        <div style={{ color: '#fff' }}><IndianRupee size={26} style={{ fontWeight: 900 }} /></div>
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Financial Nexus</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500 }}>Global payment settlements & gateway reconciliation</p>
                    </div>
                </div>
                <button 
                     style={{
                        background: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, color: T.accent, fontSize: 13, fontWeight: 800,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                     }}
                >
                    <Download size={15} /> Generation Report
                </button>
            </div>

            {/* ──────── METRICS ──────── */}
            <div className="grid-stats">
                <MetricCard title="Settled Capital" value={summaryData.total} sub="Last 30 Days" icon={CreditCard} type="accent" isFirst={true} />
                <MetricCard title="Awaiting Verification" value={summaryData.pending} sub="Escrow" icon={Activity} type="warning" />
                <MetricCard title="Failed Reconciliations" value={summaryData.failed} sub="Needs Attention" icon={XCircle} type="danger" />
            </div>

            {/* ──────── FILTERS ──────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, width: '100%', flexWrap: 'wrap' }} className="filter-bar">
                <div style={{ flex: 1, minWidth: 280, height: 40, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Search size={16} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by TXN hash or brand…" 
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: T.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <CustomDropdown 
                    options={[
                        { value: 'all', label: 'All Gateways' },
                        { value: 'UPI', label: 'UPI Network' },
                        { value: 'Card', label: 'Stripe / Cards' },
                        { value: 'Bank Transfer', label: 'Direct NEFT' }
                    ]}
                    value={paymentMethodFilter} onChange={setPaymentMethodFilter}
                    placeholder="Gateway" icon={Filter}
                />
                <CustomDropdown 
                    options={[
                        { value: 'all', label: 'All Lifecycle' },
                        { value: 'success', label: 'Confirmed' },
                        { value: 'pending', label: 'In-Flight' },
                        { value: 'failed', label: 'Rejected' }
                    ]}
                    value={statusFilter} onChange={setStatusFilter}
                    placeholder="Status"
                />
            </div>

            {/* ──────── TABLE ──────── */}
            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    {/* Header */}
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['TXN Reference', 'Origin Brand', 'Settlement', 'Gateway', 'Nexus Status', 'Timestamp'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                        ))}
                    </div>

                    {/* Body */}
                    {paginatedPayments.length > 0 ? paginatedPayments.map((p, i) => (
                        <div key={p.paymentId} style={{ padding: '18px 22px', borderBottom: i < paginatedPayments.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">TXN ID</span>
                                <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, letterSpacing: '-0.3px' }}>{p.paymentId}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Brand</span>
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{p.gymName}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Amount</span>
                                <div style={{ fontSize: 14, fontWeight: 900, color: T.text, display: 'flex', alignItems: 'center' }}>{p.amount}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Method</span>
                                <div style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>{p.method}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Status</span>
                                <StatusPill status={p.status} />
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Date</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: T.muted }}>
                                    <Calendar size={11} color={T.subtle} /> {new Date(p.date).toLocaleDateString('en-IN')}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CreditCard size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>Clean Ledger</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No transactions found for the respective period</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ──────── PAGINATION ──────── */}
            {filteredPayments.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: `1px solid ${T.bg}`, background: T.surface, borderRadius: '0 0 18px 18px', flexWrap: 'wrap', gap: 12, marginTop: -1, border: `1px solid ${T.border}`, borderTop: 'none' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>Index <span style={{ color: T.text, fontWeight: 800 }}>{startIndex + 1}</span>–<span style={{ color: T.text, fontWeight: 800 }}>{Math.min(startIndex + itemsPerPage, filteredPayments.length)}</span> of <span style={{ color: T.text, fontWeight: 800 }}>{filteredPayments.length}</span> settlements</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: currentPage === 1 ? 'transparent' : T.surface, color: currentPage === 1 ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'default' : 'pointer' }}><ChevronLeft size={16} /></button>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[...Array(totalPages)].map((_, i) => {
                                const p = i + 1;
                                const active = currentPage === p;
                                return <button key={p} onClick={() => setCurrentPage(p)} style={{ minWidth: 32, height: 32, borderRadius: 8, padding: '0 8px', background: active ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : T.surface, color: active ? '#fff' : T.text, border: active ? 'none' : `1px solid ${T.border}`, fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: active ? `0 4px 10px rgba(124,92,252,0.3)` : 'none' }}>{p}</button>
                            })}
                        </div>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: currentPage === totalPages ? 'transparent' : T.surface, color: currentPage === totalPages ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'default' : 'pointer' }}><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
