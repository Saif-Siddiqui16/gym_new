import React, { useState, useEffect } from 'react';
import { 
    Search, Eye, RefreshCw, Trash2, CreditCard, ChevronDown, 
    ChevronLeft, ChevronRight, Filter, Download, Calendar, 
    Building2, User, ShieldCheck, Zap, IndianRupee, Activity
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

const ActionBtn = ({ onClick, type = 'view', children, title }) => {
    const config = {
        view: { color: T.accent, bg: T.accentLight },
        delete: { color: T.rose, bg: T.roseLight },
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
        active:  { color: T.green, bg: T.greenLight, label: 'Active' },
        pending: { color: T.amber, bg: T.amberLight, label: 'Pending' },
        expired: { color: T.rose,  bg: T.roseLight,  label: 'Expired' },
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
const ActiveSubscriptions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [subscriptionsData, setSubscriptionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSub, setSelectedSub] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });
    const itemsPerPage = 10;

    useEffect(() => { loadSubscriptions(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, planFilter]);

    const loadSubscriptions = async () => {
        setLoading(true);
        try {
            const data = await fetchSubscriptions();
            setSubscriptionsData(Array.isArray(data) 
                ? data.map(s => ({
                    id: s.id, planName: s.plan || 'N/A', subscriberName: s.subscriber || 'Partner',
                    gymName: s.gym || 'HQ', startDate: s.startDate, endDate: s.endDate,
                    status: s.status?.toLowerCase() || 'active', paymentStatus: s.paymentStatus?.toLowerCase()
                })) : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const filteredSubs = subscriptionsData.filter(s => {
        const matchesSearch = [s.planName, s.subscriberName, s.gymName, s.id].some(v => (v || '').toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesPlan = planFilter === 'all' || s.planName === planFilter;
        return matchesSearch && matchesPlan;
    });

    const paginatedSubs = filteredSubs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredSubs.length / itemsPerPage);
    const plans = ['all', ...new Set(subscriptionsData.map(s => s.planName))];

    const handleDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await toggleSubscriptionStatus(confirmModal.id);
            toast.success('Subscription state adjusted');
            loadSubscriptions();
            setConfirmModal({ isOpen: false, id: null, loading: false });
            setIsViewOpen(false);
        } catch { toast.error('Request failed'); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    if (loading && subscriptionsData.length === 0) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Tracing Ledgers…</p>
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
                
                .grid-table { display: grid; grid-template-columns: 100px 1.2fr 1fr 1fr 120px 120px 120px 80px; align-items: center; }
                
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
                title="Active Portfolio"
                sub="Real-time oversight of branch subscriptions & ecosystem health"
                icon={ShieldCheck}
                actions={
                    <button 
                         onClick={() => exportTable('Subscriptions')}
                         style={{
                            background: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, color: T.accent, fontSize: 13, fontWeight: 800,
                            fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                         }}
                    >
                        <Download size={15} /> Export Registry
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="grid-metrics">
                <MetricCard title="Active Contracts" value={subscriptionsData.length} icon={Zap} iconColor={T.accent} iconBg={T.accentLight} isFirst={true} />
                <MetricCard title="Total Revenue" value="₹48.2k" icon={IndianRupee} iconColor={T.blue} iconBg={T.blueLight} caption="Monthly recurring" />
                <MetricCard title="Ecosystem" value={new Set(subscriptionsData.map(s => s.gymName)).size} icon={Building2} iconColor={T.green} iconBg={T.greenLight} caption="Unique gym brands" />
                <MetricCard title="Velocity" value="+12%" icon={Activity} iconColor={T.amber} iconBg={T.amberLight} caption="Growth trajectory" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} className="filter-bar">
                <div style={{ flex: 1, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by plan, gym name or subscriber…" 
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <div style={{ width: 220, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                    <Filter size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        {plans.map(p => (
                            <option key={p} value={p}>{p === 'all' ? 'All Plans' : p}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['ID', 'Plan Tier', 'Partner', 'HQ Branch', 'Start', 'Expiry', 'Status', 'Audit'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 7 ? 'center' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {paginatedSubs.length > 0 ? paginatedSubs.map((s, idx) => (
                        <div key={idx} style={{ padding: '16px 22px', borderBottom: idx < paginatedSubs.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
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
                                    <Building2 size={13} color={T.accent} /> {s.gymName}
                                </div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Start</span>
                                <div style={{ fontSize: 11, fontWeight: 800, color: T.muted }}>{fmtDate(s.startDate)}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Expiry</span>
                                <div style={{ fontSize: 11, fontWeight: 900, color: T.text }}>{fmtDate(s.endDate)}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Status</span>
                                <StatusPill status={s.status} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="actions-cell">
                                <ActionBtn type="view" onClick={() => { setSelectedSub(s); setIsViewOpen(true); }} title="Audit Details"><Eye size={14} strokeWidth={2.5} /></ActionBtn>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CreditCard size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>No active ledger entries</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No matching subscriptions found for current filter criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {filteredSubs.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: `1px solid ${T.border}`, background: T.bg, marginTop: -1, border: `1px solid ${T.border}`, borderTop: 'none', borderRadius: '0 0 18px 18px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>
                        Showing <span style={{ color: T.text, fontWeight: 900 }}>{(currentPage - 1) * itemsPerPage + 1}</span>–<span style={{ color: T.text, fontWeight: 900 }}>{Math.min(currentPage * itemsPerPage, filteredSubs.length)}</span> of <span style={{ color: T.text, fontWeight: 900 }}>{filteredSubs.length}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: currentPage === 1 ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: currentPage === totalPages ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}

            <RightDrawer isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Ledger Intelligence" subtitle={`Entry Sequence: ${selectedSub?.id}`}>
                {selectedSub && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, padding: 28, borderRadius: 24, textAlign: 'center', color: '#fff', boxShadow: '0 12px 32px rgba(124,92,252,0.25)' }}>
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <CreditCard size={32} />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px' }}>{selectedSub.planName}</h2>
                            <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, margin: 0 }}>Contract Active until {fmtDate(selectedSub.endDate)}</p>
                        </div>

                        <div style={{ display: 'grid', gap: 12 }}>
                            <div style={{ padding: 18, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                <label style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Branch Association</label>
                                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={16} color={T.accent} /> {selectedSub.gymName}</div>
                            </div>
                            <div style={{ padding: 18, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                <label style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Contact Principal</label>
                                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}><User size={16} color={T.accent} /> {selectedSub.subscriberName}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ padding: 18, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                    <label style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Effective Date</label>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{fmtDate(selectedSub.startDate)}</div>
                                </div>
                                <div style={{ padding: 18, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                    <label style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Current Status</label>
                                    <StatusPill status={selectedSub.status} />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <button 
                                onClick={() => setConfirmModal({ isOpen: true, id: selectedSub.id })}
                                style={{
                                    width: '100%', height: 48, borderRadius: 14, background: T.roseLight,
                                    border: `1px solid ${T.rose}20`, color: T.rose, fontSize: 13, fontWeight: 900, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}
                            >
                                <Trash2 size={16} /> Suspend Contract
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>

            <ConfirmationModal 
                isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} 
                onConfirm={handleDelete} title="Suspend Partner Association?" 
                message="This will immediately invalidate the branch contract. Ecosystem features will be locked until migration. " 
                confirmText="Suspend Contract" type="danger" loading={confirmModal.loading} 
            />
        </div>
    );
};

export default ActiveSubscriptions;