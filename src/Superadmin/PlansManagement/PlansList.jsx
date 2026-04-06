import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, Edit, Trash2, Settings, Sparkles, Infinity, 
    Building2, Users, Download, Filter, ChevronLeft, ChevronRight, 
    Activity, Zap, ChevronDown, IndianRupee, ShieldCheck
} from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import PlanFormDrawer from './PlanFormDrawer';
import { fetchPlans, deletePlan, exportTable } from '../../api/superadmin/superAdminApi';
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

const ActionBtn = ({ onClick, type = 'edit', children, title }) => {
    const config = {
        edit: { color: T.blue, bg: T.blueLight },
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
                cursor: 'pointer', transition: '0.2s', transform: hover ? 'translateY(-2px)' : 'none',
                boxShadow: hover ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
            }}
        >{children}</button>
    );
};

const StatusPill = ({ status }) => {
    const isActive = status === 'active';
    const config = isActive 
        ? { bg: T.greenLight, color: T.green }
        : { bg: T.roseLight, color: T.rose };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20,
            background: config.bg, color: config.color, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
            border: `1px solid ${config.color}20`
        }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: config.color }} />
            {status}
        </span>
    );
};

const PlansList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [plansData, setPlansData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    useEffect(() => { loadPlans(); }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const data = (await fetchPlans()) || [];
            if (!Array.isArray(data)) { setPlansData([]); return; }
            const mappedData = data.map(p => ({
                id: p.id,
                planName: p.name,
                price: parseFloat(p.price || 0),
                billingCycle: p.period,
                status: (p.status || 'inactive').toLowerCase(),
                limits: p.limits || { branches: { value: 1, isUnlimited: false }, members: { value: 100, isUnlimited: false } },
                benefitsCount: (p.benefits || []).length
            }));
            setPlansData(mappedData);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const filteredPlans = plansData.filter(plan => {
        const matchesSearch = plan.planName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreate = () => { setEditId(null); setIsDrawerOpen(true); };
    const handleEdit = (planId) => { setEditId(planId); setIsDrawerOpen(true); };
    const handleDelete = (planId) => { setConfirmModal({ isOpen: true, id: planId, loading: false }); };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deletePlan(confirmModal.id);
            toast.success('Plan deleted');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            loadPlans();
        } catch (err) {
            toast.error('Deletion failed');
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    if (loading && plansData.length === 0) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Configuring Tiers…</p>
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
                
                .grid-table { display: grid; grid-template-columns: 2.5fr 1.5fr 2fr 1.2fr 1fr 100px; align-items: center; }
                
                @media (max-width: 1024px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 950px; }
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
                title="Monetization Engine"
                sub="Configure subscription tiers, resource throughput & billing models"
                icon={Zap}
                actions={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button 
                             onClick={() => exportTable('Plans')}
                             style={{
                                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
                                padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif"
                             }}
                        >
                            <Download size={15} /> Stats
                        </button>
                        <button 
                            onClick={handleCreate}
                            style={{
                                background: '#fff', border: 'none', borderRadius: 10,
                                padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                color: T.accent, fontSize: 13, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Plus size={16} strokeWidth={3} /> Add Plan
                        </button>
                    </div>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="grid-metrics">
                <MetricCard title="Available Tiers" value={plansData.length} icon={Zap} iconColor={T.accent} iconBg={T.accentLight} isFirst={true} />
                <MetricCard title="Active Contracts" value={142} icon={Users} iconColor={T.blue} iconBg={T.blueLight} caption="Paid memberships" />
                <MetricCard title="Revenue Growth" value="+28%" icon={ShieldCheck} iconColor={T.green} iconBg={T.greenLight} caption="vs last quarter" />
                <MetricCard title="Avg Yield" value="₹1.4k" icon={IndianRupee} iconColor={T.amber} iconBg={T.amberLight} caption="Per branch" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} className="filter-bar">
                <div style={{ flex: 1, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search strategies by name…" 
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
                        <option value="all">All Plans</option>
                        <option value="active">Active Tiers</option>
                        <option value="inactive">Archive</option>
                    </select>
                </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Plan Name', 'Pricing', 'Limits', 'Benefits', 'Status', 'Action'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 5 ? 'center' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {filteredPlans.length > 0 ? filteredPlans.map((p, i) => (
                        <div 
                            key={p.id}
                            style={{ padding: '18px 22px', borderBottom: i < filteredPlans.length - 1 ? `1px solid ${T.border}` : 'none', transition: '0.1s' }}
                            className="grid-table"
                            onMouseEnter={e => { e.currentTarget.style.background = T.bg; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ 
                                    width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', boxShadow: '0 4px 12px rgba(124,92,252,0.2)'
                                }}>
                                    {(p.planName || 'P').charAt(0)}
                                </div>
                                <div>
                                    <span style={{ display: 'none' }} className="mobile-label">Plan Name</span>
                                    <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{p.planName}</div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ID: {String(p.id).slice(0, 8)}</div>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Pricing</span>
                                <div style={{ fontSize: 18, fontWeight: 900, color: T.text, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <IndianRupee size={15} strokeWidth={2.5} />{Number(p.price).toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>/{p.billingCycle}</div>
                            </div>

                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ display: 'none' }} className="mobile-label">Limits</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8 }}>
                                    <Building2 size={11} color={T.subtle} />
                                    <span style={{ fontSize: 11, fontWeight: 800, color: T.text }}>{p.limits?.branches?.isUnlimited ? '∞' : p.limits?.branches?.value}</span>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: T.subtle, textTransform: 'uppercase' }}>Gyms</span>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">BenefitsCount</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 24, height: 24, borderRadius: 6, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Sparkles size={11} color={T.accent} />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{p.benefitsCount}</span>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: T.muted }}>Perks</span>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Status</span>
                                <StatusPill status={p.status} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }} className="actions-cell">
                                <ActionBtn type="edit" onClick={() => handleEdit(p.id)} title="Modify Strategy"><Edit size={14} strokeWidth={2.5} /></ActionBtn>
                                <ActionBtn type="delete" onClick={() => handleDelete(p.id)} title="Retire Tier"><Trash2 size={14} strokeWidth={2.5} /></ActionBtn>
                            </div>
                        </div>
                    )) : !loading && (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Settings size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>Strategic Void</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No business strategies defined for current ledger selection</p>
                        </div>
                    )}
                </div>
            </div>

            <RightDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Strategy Configuration" subtitle={editId ? 'Refining global tier parameters' : 'Architecting new membership model'}>
                <PlanFormDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} editId={editId} onSuccess={() => { loadPlans(); setIsDrawerOpen(false); }} />
            </RightDrawer>

            <ConfirmationModal 
                isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} 
                onConfirm={processDelete} title="Retire Strategy?" 
                message="This Tier will be removed from future acquisitions. Legacy contracts will persist until manually migrated to new models." 
                confirmText="Confirm Retirement" type="danger" loading={confirmModal.loading} 
            />
        </div>
    );
};

export default PlansList;