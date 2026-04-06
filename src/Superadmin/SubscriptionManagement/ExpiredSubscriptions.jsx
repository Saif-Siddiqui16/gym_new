import React, { useState, useEffect } from 'react';
import { 
    Search, Eye, RefreshCw, Trash2, CreditCard, ChevronDown, 
    ChevronLeft, ChevronRight, Filter, Download, Calendar, 
    Building2, User, AlertCircle, Zap, Activity, Clock
} from 'lucide-react';
import { fetchSubscriptions, toggleSubscriptionStatus, exportTable } from '../../api/superadmin/superAdminApi';
import RightDrawer from '../../components/common/RightDrawer';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

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
                background: isFirst ? `linear-gradient(135deg, ${T.rose}, ${T.amber})` : T.surface,
                borderRadius: 18, border: isFirst ? 'none' : `1px solid ${T.border}`,
                boxShadow: isFirst ? '0 8px 24px rgba(244,63,94,0.2)' : '0 2px 12px rgba(124,92,252,0.06)',
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

const ActionBtn = ({ onClick, type = 'view', children, title }) => {
    const config = {
        view: { color: T.accent, bg: T.accentLight },
        renew: { color: T.green, bg: T.greenLight },
    }[type];
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={onClick} title={title}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{
                width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.border}`,
                background: config.bg, color: config.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-2px)' : 'none',
                boxShadow: hover ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
            }}
        >{children}</button>
    );
};

const StatusPill = ({ status }) => {
    const s = status?.toLowerCase();
    const config = {
        expired: { color: T.rose,  bg: T.roseLight,  label: 'Lapsed' },
        due:     { color: T.amber, bg: T.amberLight, label: 'Grace Period' },
    }[s] || { color: T.muted, bg: T.bg, label: status };

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '4px 10px', borderRadius: 20,
            background: config.bg, color: config.color, border: `1px solid ${config.color}20`
        }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: config.color }} />
            {config.label}
        </span>
    );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
const ExpiredSubscriptions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [subscriptionsData, setSubscriptionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSub, setSelectedSub] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, subId: null, loading: false });
    const itemsPerPage = 10;

    useEffect(() => { loadSubscriptions(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    const loadSubscriptions = async () => {
        setLoading(true);
        try {
            const data = await fetchSubscriptions();
            const inactive = Array.isArray(data)
                ? data.filter(s => s.status?.toLowerCase() !== 'active').map(s => ({
                    id: s.id, planName: s.plan || 'Archive', subscriberName: s.subscriber || 'Partner',
                    gymName: s.gym || 'HQ', startDate: s.startDate, endDate: s.endDate,
                    status: s.status?.toLowerCase() || 'expired', paymentStatus: s.paymentStatus?.toLowerCase()
                })) : [];
            setSubscriptionsData(inactive);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const filtered = subscriptionsData.filter(s => {
        const q = searchTerm.toLowerCase();
        const matchSearch = [s.planName, s.subscriberName, s.gymName, s.id].some(v => (v || '').toLowerCase().includes(q));
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const processConfirm = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            if (confirmModal.action === 'renew') {
                await toggleSubscriptionStatus(confirmModal.subId);
                toast.success('Subscription reactivated');
                loadSubscriptions();
            }
            setConfirmModal({ isOpen: false, action: null, subId: null, loading: false });
            setIsViewOpen(false);
        } catch { toast.error('Action failed'); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    if (loading && subscriptionsData.length === 0) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Scanning Archive…</p>
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
                
                .grid-table { display: grid; grid-template-columns: 100px 1.2fr 1fr 1fr 100px 100px 120px 100px; align-items: center; }
                
                @media (max-width: 1280px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 1100px; }
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
                title="Archive & Lapsed"
                sub="Management of inactive, suspended and expired gym brand associations"
                icon={Clock}
                actions={
                    <button 
                         onClick={() => exportTable('ExpiredSubscriptions')}
                         style={{
                            background: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, color: T.accent, fontSize: 13, fontWeight: 800,
                            fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                         }}
                    >
                        <Download size={15} /> Export History
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="grid-metrics">
                <MetricCard title="Total Lapsed" value={subscriptionsData.length} icon={AlertCircle} iconColor={T.rose} iconBg={T.roseLight} isFirst={true} />
                <MetricCard title="Churn Probability" value="14.2%" icon={Activity} iconColor={T.amber} iconBg={T.amberLight} caption="Predicted churn rate" />
                <MetricCard title="Inactive Brands" value={new Set(subscriptionsData.map(s => s.gymName)).size} icon={Building2} iconColor={T.blue} iconBg={T.blueLight} caption="Unique gym brands" />
                <MetricCard title="Win-back Rate" value="8.5%" icon={RefreshCw} iconColor={T.green} iconBg={T.greenLight} caption="Successful renewals" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} className="filter-bar">
                <div style={{ flex: 1, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by plan, gym brand or partner…" 
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <div style={{ width: 220, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                    <Filter size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <option value="all">Every Archive</option>
                        <option value="expired">Hard Expiry</option>
                        <option value="due">Suspended</option>
                    </select>
                </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['ID', 'Plan Tier', 'Partner', 'HQ Branch', 'Start', 'Expiry', 'Status', 'Actions'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 7 ? 'center' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {paginated.length > 0 ? paginated.map((s, idx) => (
                        <div key={idx} style={{ padding: '16px 22px', borderBottom: idx < paginated.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">ID</span>
                                <div style={{ fontSize: 10, fontWeight: 900, color: T.accent, background: T.accentLight, padding: '4px 8px', borderRadius: 8, textAlign: 'center', width: 'fit-content' }}>#{String(s.id).slice(0,6)}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Tier</span>
                                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{s.planName}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Partner</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: T.text }}>
                                    <User size={13} color={T.subtle} /> {s.subscriberName}
                                </div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">HQ</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: T.muted }}>
                                    <Building2 size={13} color={T.subtle} /> {s.gymName}
                                </div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Start</span>
                                <div style={{ fontSize: 11, fontWeight: 800, color: T.muted }}>{fmtDate(s.startDate)}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Expiry</span>
                                <div style={{ fontSize: 11, fontWeight: 900, color: T.rose }}>{fmtDate(s.endDate)}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Status</span>
                                <StatusPill status={s.status} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} className="actions-cell">
                                <ActionBtn type="view" onClick={() => { setSelectedSub(s); setIsViewOpen(true); }} title="Review History"><Eye size={14} strokeWidth={2.5} /></ActionBtn>
                                <ActionBtn type="renew" onClick={() => setConfirmModal({ isOpen: true, action: 'renew', subId: s.id })} title="Reactivate Relationship"><RefreshCw size={14} strokeWidth={2.5} /></ActionBtn>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><AlertCircle size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>No archived records</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>Your churn list is currently empty. Excellent brand retention!</p>
                        </div>
                    )}
                </div>
            </div>

            {filtered.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: `1px solid ${T.border}`, background: T.bg, marginTop: -1, border: `1px solid ${T.border}`, borderTop: 'none', borderRadius: '0 0 18px 18px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>
                        Showing <span style={{ color: T.text, fontWeight: 900 }}>{(currentPage - 1) * itemsPerPage + 1}</span>–<span style={{ color: T.text, fontWeight: 900 }}>{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span style={{ color: T.text, fontWeight: 900 }}>{filtered.length}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: currentPage === 1 ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: currentPage === totalPages ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}

            <RightDrawer isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Lapsed Forensic" subtitle={`Registry Entry: ${selectedSub?.id}`}>
                {selectedSub && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: `linear-gradient(135deg, ${T.rose}, ${T.amber})`, padding: 28, borderRadius: 24, textAlign: 'center', color: '#fff', boxShadow: '0 12px 32px rgba(244,63,94,0.2)' }}>
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <AlertCircle size={32} />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px' }}>{selectedSub.planName}</h2>
                            <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, margin: 0 }}>Contract ended {fmtDate(selectedSub.endDate)}</p>
                        </div>

                        <div style={{ display: 'grid', gap: 12 }}>
                            <div style={{ padding: 18, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                <label style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Historical Branch</label>
                                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={16} color={T.rose} /> {selectedSub.gymName}</div>
                            </div>
                            <div style={{ padding: 18, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                <label style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Previous Contact</label>
                                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}><User size={16} color={T.rose} /> {selectedSub.subscriberName}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ padding: 18, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                    <label style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Original Start</label>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{fmtDate(selectedSub.startDate)}</div>
                                </div>
                                <div style={{ padding: 18, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                    <label style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Termination</label>
                                    <StatusPill status={selectedSub.status} />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <button 
                                onClick={() => { setIsViewOpen(false); setConfirmModal({ isOpen: true, action: 'renew', subId: selectedSub.id }); }}
                                style={{
                                    width: '100%', height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 900, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 18px rgba(124,92,252,0.3)'
                                }}
                            >
                                <RefreshCw size={16} /> Reactivate Lifecycle
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>

            <ConfirmationModal 
                isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} 
                onConfirm={processConfirm} title="Reactivate Brand Relationship?" 
                message="This will restore all ecosystem privileges for this branch. " 
                confirmText="Reactivate Relationship" type="success" loading={confirmModal.loading} 
            />
        </div>
    );
};

export default ExpiredSubscriptions;
