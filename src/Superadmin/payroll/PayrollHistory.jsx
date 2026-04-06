import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, Calendar, TrendingUp, Users, Banknote, XCircle, 
    CheckCircle, Clock, Download, FileText, ChevronRight, IndianRupee,
    ArrowRight, User, Sparkles, X
} from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import { fetchPayrollHistoryAPI } from '../../api/admin/adminApi';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 20, padding: '20px 26px',
        boxShadow: '0 8px 32px rgba(124,92,252,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative'
    }} className="fu">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
            }}>
                <Icon size={26} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500 }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>{actions}</div>
    </div>
);

const MetricCard = ({ title, value, icon: Icon, iconColor, iconBg, caption, isFirst = false }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: isFirst ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : T.surface,
                borderRadius: 18, border: isFirst ? 'none' : `1px solid ${T.border}`,
                boxShadow: isFirst ? '0 8px 24px rgba(124,92,252,0.28)' : '0 2px 12px rgba(124,92,252,0.06)',
                padding: 20, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                cursor: 'default'
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: isFirst ? 'rgba(255,255,255,0.2)' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={isFirst ? '#fff' : iconColor} strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: isFirst ? 'rgba(255,255,255,0.7)' : T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: isFirst ? '#fff' : T.text, marginBottom: 2 }}>{value}</div>
            {caption && <div style={{ fontSize: 9, fontWeight: 700, color: isFirst ? 'rgba(255,255,255,0.5)' : T.subtle }}>{caption}</div>}
        </div>
    );
};

const PayrollHistory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await fetchPayrollHistoryAPI();
                setHistory(data || []);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        loadHistory();
    }, []);

    const filteredRecords = history.filter(record => {
        const matchesSearch = record.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || record.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const openDrawer = (record) => { setSelectedEmployee(record); setIsDrawerOpen(true); };
    const closeDrawer = () => { setIsDrawerOpen(false); setTimeout(() => setSelectedEmployee(null), 300); };
    const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (loading && history.length === 0) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Auditing Ledgers…</p>
        </div>
    );

    return (
        <div style={{
            background: T.bg, minHeight: '100vh', padding: '28px 28px 48px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", animation: 'fadeUp 0.38s ease both'
        }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                
                .grid-table { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 100px; align-items: center; }
                
                @media (max-width: 1024px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 900px; }
                }
                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 16px 18px !important; }
                    .filter-bar { flex-direction: column; align-items: stretch !important; gap: 12px !important; }
                    .grid-table { grid-template-columns: 1fr !important; gap: 10px; padding: 18px !important; border-bottom: 6px solid ${T.bg} !important; position: relative; }
                    .table-header { display: none !important; }
                    .mobile-label { display: block !important; margin-bottom: 2px; font-size: 8px !important; color: ${T.subtle} !important; text-transform: uppercase; font-weight: 800; }
                    .actions-cell { border-top: 1px solid ${T.border}; padding-top: 10px !important; display: flex !important; justify-content: flex-start !important; }
                }
            `}</style>

            <HeaderBanner 
                title="Payroll Auditing"
                sub="Historical settlement records & compensation analytics"
                icon={FileText}
                actions={
                    <button 
                        style={{
                            background: '#fff', border: 'none', borderRadius: 10,
                            padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            color: T.accent, fontSize: 13, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Download size={16} strokeWidth={3} /> Export Audit
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="grid-metrics">
                <MetricCard title="Settled Volume" value={`₹${history.reduce((acc, r) => acc + (r.status === 'Paid' ? Number(r.amount) : 0), 0).toLocaleString()}`} icon={Banknote} iconColor={T.accent} iconBg={T.accentLight} isFirst={true} />
                <MetricCard title="Transactions" value={history.length} icon={Users} iconColor={T.blue} iconBg={T.blueLight} caption="Historical count" />
                <MetricCard title="Pending Sync" value={history.filter(r => r.status === 'Pending').length} icon={Clock} iconColor={T.amber} iconBg={T.amberLight} />
                <MetricCard title="Success Rate" value="100%" icon={CheckCircle} iconColor={T.green} iconBg={T.greenLight} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} className="filter-bar">
                <div style={{ flex: 1, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by personnel name or department…" 
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <div style={{ width: 220, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <Filter size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <option value="">Status Stream</option>
                        <option value="Paid">Success</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Personnel', 'Fiscal Month', 'Net Settlement', 'Sync Status', 'Audit'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 4 ? 'right' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {filteredRecords.length > 0 ? filteredRecords.map((r, i) => (
                        <div 
                            key={r.id}
                            style={{ padding: '16px 22px', borderBottom: i < filteredRecords.length - 1 ? `1px solid ${T.border}` : 'none', transition: '0.1s', cursor: 'pointer' }}
                            className="grid-table"
                            onClick={() => openDrawer(r)}
                            onMouseEnter={e => { e.currentTarget.style.background = T.bg; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ 
                                    width: 36, height: 36, borderRadius: 11, background: T.bg, border: `1px solid ${T.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: T.accent
                                }}>
                                    {r.staffName?.charAt(0)}
                                </div>
                                <div>
                                    <span style={{ display: 'none' }} className="mobile-label">Personnel</span>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{r.staffName}</div>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: T.muted }}>ID: #{String(r.id).slice(-4).toUpperCase()}</div>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Fiscal Month</span>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{monthNames[r.month]} {r.year}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Net Settlement</span>
                                <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>₹{Number(r.amount).toLocaleString()}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Sync Status</span>
                                <span style={{ 
                                    fontSize: 9, fontWeight: 800, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20,
                                    background: r.status === 'Paid' ? T.greenLight : T.amberLight,
                                    color: r.status === 'Paid' ? T.green : T.amber,
                                    border: `1px solid ${r.status === 'Paid' ? '#D1FAE5' : '#FEF3C7'}`
                                }}>{r.status}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="actions-cell">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openDrawer(r); }}
                                    style={{ 
                                        width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`,
                                        background: '#fff', color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                ><ChevronRight size={14} strokeWidth={3} /></button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><FileText size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>Empty Archive</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No payroll events identified in this audit window</p>
                        </div>
                    )}
                </div>
            </div>

            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                title="Personnel Audit"
                subtitle={selectedEmployee ? `${selectedEmployee.staffName} • Ledger Analysis` : ''}
            >
                {selectedEmployee && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ 
                            background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, 
                            padding: 24, borderRadius: 20, color: '#fff', boxShadow: '0 10px 24px rgba(124,92,252,0.2)' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900 }}>
                                    {selectedEmployee.staffName?.charAt(0)}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{selectedEmployee.staffName}</h2>
                                    <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, margin: '2px 0 0' }}>{monthNames[selectedEmployee.month]} {selectedEmployee.year} Sequence</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: 20, borderRadius: 18, border: `1px solid ${T.border}`, background: T.bg }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Net Settlement</div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: T.text }}>₹{Number(selectedEmployee.amount).toLocaleString()}</div>
                            <div style={{ marginTop: 12, display: 'inline-flex', padding: '6px 14px', borderRadius: 20, background: '#fff', border: `1px solid ${T.border}`, fontSize: 11, fontWeight: 800, color: selectedEmployee.status === 'Paid' ? T.green : T.amber }}>
                                STATUS: {selectedEmployee.status.toUpperCase()}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button style={{ height: 48, borderRadius: 12, border: `1px solid ${T.border}`, background: '#fff', color: T.text, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <Download size={16} /> Download Slip
                            </button>
                            <button onClick={closeDrawer} style={{ height: 48, borderRadius: 12, border: 'none', background: T.text, color: '#fff', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}>
                                Close Audit
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default PayrollHistory;
