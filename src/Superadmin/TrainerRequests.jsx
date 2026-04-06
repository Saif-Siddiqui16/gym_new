import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Filter, CheckCircle, XCircle, Clock, CheckCircle2, 
    Loader2, RefreshCw, UserCheck, ShieldCheck, UserX, 
    ChevronDown, ChevronLeft, ChevronRight, User, Zap, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchTrainerRequestsAPI, updateTrainerRequestAPI } from '../api/admin/adminApi';

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

const StatusPill = ({ status }) => {
    const s = (status || 'Pending').toLowerCase();
    const config = {
        active:  { color: T.green, bg: T.greenLight, label: 'Approved' },
        pending: { color: T.amber, bg: T.amberLight, label: 'Pending Verification' },
        rejected: { color: T.rose,  bg: T.roseLight,  label: 'Authorization Revoked' },
    }[s === 'active' ? 'active' : s === 'rejected' ? 'rejected' : 'pending'] || { color: T.muted, bg: T.bg, label: status };

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
const TrainerRequests = () => {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Types');

    const loadRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchTrainerRequestsAPI();
            setTrainers(Array.isArray(data) ? data : []);
        } catch (error) { toast.error('Signal lost with registry'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadRequests(); }, [loadRequests]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await updateTrainerRequestAPI(id, newStatus);
            toast.success(`Node marked as ${newStatus}`);
            loadRequests();
        } catch (error) { toast.error('Operation failed'); }
    };

    const filtered = trainers.filter(t => {
        const matchesSearch = (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (t.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (statusFilter === 'All Types') return matchesSearch;
        return matchesSearch && (t.status || 'Pending') === statusFilter;
    });

    const stats = {
        pending: trainers.filter(t => (t.status || 'Pending') === 'Pending').length,
        approved: trainers.filter(t => t.status === 'Active').length,
        rejected: trainers.filter(t => t.status === 'Rejected').length,
    };

    if (loading && trainers.length === 0) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Authenticating Identities…</p>
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
                
                .grid-table { display: grid; grid-template-columns: 240px 160px 180px 160px 1.5fr; align-items: center; }
                
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
                    .actions-cell { border-top: 1px solid ${T.border}; padding-top: 12px !important; }
                }
            `}</style>

            <HeaderBanner 
                title="Agent Onboarding"
                sub="Forensic evaluation and authorization of elite fitness trainers"
                icon={ShieldCheck}
                actions={
                    <button 
                         onClick={loadRequests}
                         style={{
                            background: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, color: T.accent, fontSize: 13, fontWeight: 800,
                            fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                         }}
                    >
                        <RefreshCw size={15} /> Sync Registry
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="grid-metrics">
                <MetricCard title="Draft Profiles" value={stats.pending} icon={Clock} iconColor={T.accent} iconBg={T.accentLight} isFirst={true} />
                <MetricCard title="Verified Agents" value={stats.approved} icon={UserCheck} iconColor={T.green} iconBg={T.greenLight} caption="Authorization granted" />
                <MetricCard title="Denied Access" value={stats.rejected} icon={UserX} iconColor={T.rose} iconBg={T.roseLight} caption="Security flagged" />
                <MetricCard title="Ingestion Rate" value="98.2%" icon={Zap} iconColor={T.amber} iconBg={T.amberLight} caption="Node velocity" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} className="filter-bar">
                <div style={{ flex: 1, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by agent name, identity or encrypted email…" 
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <div style={{ width: 220, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                    <Filter size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <option value="All Types">Every Lifecycle</option>
                        <option value="Pending">Pending Vault</option>
                        <option value="Active">Operational</option>
                        <option value="Rejected">Revoked</option>
                    </select>
                </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Agent Identity', 'Specialization', 'Contact Vector', 'Vault Status', 'Logic Protocol'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 4 ? 'right' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {filtered.length > 0 ? filtered.map((t, idx) => (
                        <div key={t.id} style={{ padding: '18px 22px', borderBottom: idx < filtered.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ display: 'none' }} className="mobile-label">Agent</span>
                                <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, boxShadow: '0 4px 10px rgba(124,92,252,0.2)' }}>{(t.name || '?').charAt(0)}</div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{t.name}</div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: T.subtle }}>{t.email}</div>
                                </div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Cluster</span>
                                <div style={{ fontSize: 10, fontWeight: 800, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.04em', background: T.accentLight, padding: '4px 10px', borderRadius: 8, display: 'inline-block' }}>{t.role || 'Fitness Node'}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Network</span>
                                <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{t.phone || 'Vector Null'}</div>
                            </div>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Audit</span>
                                <StatusPill status={t.status} />
                            </div>
                            <div style={{ textAlign: 'right' }} className="actions-cell">
                                <span style={{ display: 'none' }} className="mobile-label">Execute</span>
                                {(t.status || 'Pending') === 'Pending' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                                        <button 
                                            onClick={() => handleUpdateStatus(t.id, 'Active')}
                                            style={{
                                                padding: '9px 18px', borderRadius: 12, background: T.greenLight, color: T.green,
                                                fontSize: 11, fontWeight: 900, border: `1px solid ${T.green}40`, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 7, transition: '0.25s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = T.green; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = T.greenLight; e.currentTarget.style.color = T.green; }}
                                        >
                                            <CheckCircle2 size={13} strokeWidth={2.5} /> Verify Agent
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(t.id, 'Rejected')}
                                            style={{
                                                padding: '9px 18px', borderRadius: 12, background: T.roseLight, color: T.rose,
                                                fontSize: 11, fontWeight: 900, border: `1px solid ${T.rose}40`, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 7, transition: '0.25s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = T.rose; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = T.roseLight; e.currentTarget.style.color = T.rose; }}
                                        >
                                            <XCircle size={13} strokeWidth={2.5} /> Revoke
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 11, fontWeight: 800, color: T.subtle, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Consensus Finalized</div>
                                )}
                            </div>
                        </div>
                    )) : !loading && (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CheckCircle size={24} color={T.green} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>Atmosphere Clear</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No pending identity authorizations detected in the current nexus</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerRequests;
