import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Filter, IndianRupee, FileText, ChevronDown, ChevronLeft, ChevronRight, Share2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchInvoices } from '../../api/superadmin/superAdminApi';
import RightDrawer from '../../components/common/RightDrawer';

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
const ActionBtn = ({ onClick, title, type = 'view', children }) => {
    const config = {
        view: { color: T.accent, bg: T.accentLight },
        download: { color: T.blue, bg: T.blueLight },
    }[type];
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={onClick} title={title}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`,
                background: config.bg, color: config.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: '0.2s',
                transform: hover ? 'scale(1.08)' : 'scale(1)', flexShrink: 0,
            }}
        >
            {children}
        </button>
    );
};

const StatusPill = ({ status }) => {
    const s = status.toLowerCase();
    const config = {
        paid:    { color: T.green, bg: T.greenLight, border: '#A7F3D0' },
        pending: { color: T.amber, bg: T.amberLight, border: '#FDE68A' },
        overdue: { color: T.rose,  bg: T.roseLight,  border: '#FECDD3' },
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
const Invoices = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [invoicesData, setInvoicesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const itemsPerPage = 8;

    useEffect(() => { loadInvoices(); }, []);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const data = await fetchInvoices();
            setInvoicesData(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const filteredInvoices = invoicesData.filter(i => {
        const matchesSearch = i.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || i.gymName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || i.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

    const handleView = (invoice) => { setSelectedInvoice(invoice); setIsViewModalOpen(true); };
    const handleDownload = (invoiceNo) => { toast.success(`Acquiring resource: ${invoiceNo}`); };

    if (loading) {
        return (
            <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Compiling Fiscal Archive…</p>
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
                
                .grid-table { display: grid; grid-template-columns: 140px 1.8fr 1.2fr 1fr 1.2fr 100px; align-items: center; }
                
                @media (max-width: 1024px) {
                    .table-wrapper { overflow-x: auto !important; }
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
                        <FileText size={26} color="#fff" strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Tax Invoices</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500 }}>B2B billing reconciliation & GST compliant records</p>
                    </div>
                </div>
            </div>

            {/* ──────── FILTERS ──────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, width: '100%', flexWrap: 'wrap' }} className="filter-bar">
                <div style={{ flex: 1, minWidth: 280, height: 40, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Search size={16} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Trace by invoice # or partner identity…" 
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: T.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <CustomDropdown 
                    options={[
                        { value: 'all', label: 'All Lifecycle' },
                        { value: 'paid', label: 'Settled' },
                        { value: 'pending', label: 'Awaiting' },
                        { value: 'overdue', label: 'Lapsed' }
                    ]}
                    value={statusFilter} onChange={setStatusFilter}
                    placeholder="Status" icon={Filter}
                />
            </div>

            {/* ──────── TABLE ──────── */}
            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    {/* Header */}
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Record ID', 'Origin Brand', 'Fiscal Value', 'Protocol', 'Emission Date', 'Nexus'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 5 ? 'center' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {/* Body */}
                    {paginatedInvoices.length > 0 ? paginatedInvoices.map((i, idx) => (
                        <div key={i.invoiceNo} style={{ padding: '18px 22px', borderBottom: idx < paginatedInvoices.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Invoice #</span>
                                <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, letterSpacing: '-0.3px' }}>{i.invoiceNo}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Partner</span>
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{i.gymName}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Total</span>
                                <div style={{ fontSize: 14, fontWeight: 900, color: T.text, display: 'flex', alignItems: 'center', gap: 2 }}><IndianRupee size={12} strokeWidth={3} /> {i.amount}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Status</span>
                                <StatusPill status={i.status} />
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Date</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: T.muted }}>
                                    <Calendar size={11} color={T.subtle} /> {new Date(i.date).toLocaleDateString('en-IN')}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <ActionBtn type="view" onClick={() => handleView(i)} title="Insight"><Eye size={14} strokeWidth={2.5} /></ActionBtn>
                                <ActionBtn type="download" onClick={() => handleDownload(i.invoiceNo)} title="Archive"><Download size={14} strokeWidth={2.2} /></ActionBtn>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Search size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>Archive Void</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No records match the current cross-reference criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ──────── PAGINATION ──────── */}
            {filteredInvoices.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: `1px solid ${T.bg}`, background: T.surface, borderRadius: '0 0 18px 18px', flexWrap: 'wrap', gap: 12, marginTop: -1, border: `1px solid ${T.border}`, borderTop: 'none' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>Ledger Position <span style={{ color: T.text, fontWeight: 800 }}>{startIndex + 1}</span>–<span style={{ color: T.text, fontWeight: 800 }}>{Math.min(startIndex + itemsPerPage, filteredInvoices.length)}</span> of <span style={{ color: T.text, fontWeight: 800 }}>{filteredInvoices.length}</span> records</div>
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

            {/* Details Drawer */}
            <RightDrawer isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Fiscal Analysis" subtitle={selectedInvoice ? `Records for ID: ${selectedInvoice.invoiceNo}` : ''}>
                {selectedInvoice && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                <FileText size={32} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: '0 0 4px' }}>{selectedInvoice.gymName}</h3>
                            <StatusPill status={selectedInvoice.status} />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ background: T.bg, borderRadius: 14, padding: '14px', border: `1px solid ${T.border}` }}>
                                <label style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Protocol Identifier</label>
                                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{selectedInvoice.invoiceNo}</div>
                            </div>
                            <div style={{ background: T.bg, borderRadius: 14, padding: '14px', border: `1px solid ${T.border}` }}>
                                <label style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Settlement Value</label>
                                <div style={{ fontSize: 18, fontWeight: 900, color: T.accent, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <IndianRupee size={16} strokeWidth={3} /> {selectedInvoice.amount}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                            <button 
                                onClick={() => handleDownload(selectedInvoice.invoiceNo)}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: 12, 
                                    background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    boxShadow: `0 6px 18px rgba(124,92,252,0.3)`
                                }}
                            >
                                <Download size={16} /> Secure Archive Access
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default Invoices;
