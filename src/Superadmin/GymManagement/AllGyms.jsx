import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Plus, Download, Pencil, Ban, Trash2, MapPin, Phone, 
    Eye, Building2, ChevronLeft, ChevronRight, ChevronDown, Sparkles,
    User, ArrowRight, ShieldCheck, Zap, IndianRupee
} from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import AddGymDrawer from './AddGymDrawer';
import { fetchAllGyms, deleteGym, toggleGymStatus, exportTable } from '../../api/superadmin/superAdminApi';
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
        edit: { color: T.blue, bg: T.blueLight },
        toggle: { color: T.amber, bg: T.amberLight },
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
    const isActive = status === 'Active';
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

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
const AllGyms = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGym, setSelectedGym] = useState(null);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalGyms, setTotalGyms] = useState(0);

    const loadGyms = async () => {
        setLoading(true);
        try {
            const data = await fetchAllGyms({ search: searchTerm, status: filterStatus, page, limit: 10 });
            setGyms(data.gyms || []);
            setTotalPages(data.totalPages || 1);
            setTotalGyms(data.total || 0);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        const timer = setTimeout(loadGyms, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus, page]);

    const handleDelete = (id) => setConfirmModal({ isOpen: true, id, loading: false });
    const processDelete = async () => {
        try {
            setConfirmModal(p => ({ ...p, loading: true }));
            await deleteGym(confirmModal.id);
            toast.success('Gym deleted successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            loadGyms();
        } catch (e) {
            toast.error('Operation failed');
            setConfirmModal(p => ({ ...p, loading: false }));
        }
    };

    const handleToggleStatus = async (id) => {
        try { 
            await toggleGymStatus(id); 
            loadGyms(); 
            toast.success('Status updated successfully');
        } catch { toast.error('Failed to update status'); }
    };

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
                
                .grid-table { display: grid; grid-template-columns: 2.2fr 1.5fr 1.5fr 1.2fr 1fr 140px; align-items: center; }
                
                @media (max-width: 1024px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 1000px; }
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
                title="Gym Network"
                sub="Enterprise branch management & franchise synchronization"
                icon={Building2}
                actions={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button 
                             onClick={() => exportTable('Gyms')}
                             style={{
                                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
                                padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif"
                             }}
                        >
                            <Download size={15} /> Export
                        </button>
                        <button 
                            onClick={() => { setSelectedGym(null); setIsAddDrawerOpen(true); }}
                            style={{
                                background: '#fff', border: 'none', borderRadius: 10,
                                padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                color: T.accent, fontSize: 13, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Plus size={16} strokeWidth={3} /> Add Gym
                        </button>
                    </div>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="grid-metrics">
                <MetricCard title="Total Branches" value={totalGyms} icon={Building2} iconColor={T.accent} iconBg={T.accentLight} isFirst={true} />
                <MetricCard title="Active Network" value={gyms.filter(g => g.status === 'Active').length} icon={ShieldCheck} iconColor={T.green} iconBg={T.greenLight} caption="Healthy connectivity" />
                <MetricCard title="Revenue Stream" value="₹12.4k" icon={IndianRupee} iconColor={T.blue} iconBg={T.blueLight} caption="Est. Subscription" />
                <MetricCard title="Expansion" value="+2" icon={Zap} iconColor={T.amber} iconBg={T.amberLight} caption="Added this month" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} className="filter-bar">
                <div style={{ flex: 1, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by brand, branch or owner…" 
                        value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <div style={{ width: 220, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                    <ShieldCheck size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active only</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden', position: 'relative' }} className="table-wrapper">
                {loading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 34, height: 34, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                )}
                
                <div className="table-content">
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Gym Details', 'Owner / Contact', 'Location', 'Subscription', 'Status', 'Actions'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 5 ? 'center' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {gyms.length > 0 ? gyms.map((g, i) => (
                        <div 
                            key={g.id}
                            style={{ padding: '16px 22px', borderBottom: i < gyms.length - 1 ? `1px solid ${T.border}` : 'none', transition: '0.1s' }}
                            className="grid-table"
                            onMouseEnter={e => { e.currentTarget.style.background = T.bg; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ 
                                    width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', boxShadow: '0 4px 12px rgba(124,92,252,0.2)'
                                }}>
                                    {(g.gymName || 'G').charAt(0)}
                                </div>
                                <div>
                                    <span style={{ display: 'none' }} className="mobile-label">Brand</span>
                                    <div style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{g.gymName}</div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>{g.branchName}</div>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Owner</span>
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{g.owner}</div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: T.subtle, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                    <Phone size={10} /> {g.phone}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ display: 'none' }} className="mobile-label">Location</span>
                                <MapPin size={12} color={T.subtle} style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.location}</span>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Plan</span>
                                <span style={{ fontSize: 10, fontWeight: 900, color: T.accent, background: T.accentLight, padding: '4px 10px', borderRadius: 20, border: `1px solid ${T.accent}30` }}>{g.planName || 'TRIAL'}</span>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Status</span>
                                <StatusPill status={g.status} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }} className="actions-cell">
                                <ActionBtn type="view" onClick={() => { setSelectedGym(g); setIsViewDrawerOpen(true); }} title="Audit Details"><Eye size={14} strokeWidth={2.5} /></ActionBtn>
                                <ActionBtn type="edit" onClick={() => { setSelectedGym(g); setIsAddDrawerOpen(true); }} title="Update Config"><Pencil size={14} strokeWidth={2.5} /></ActionBtn>
                                <ActionBtn type="toggle" onClick={() => handleToggleStatus(g.id)} title="Suspend / Activate"><Ban size={14} strokeWidth={2.5} /></ActionBtn>
                                <ActionBtn type="delete" onClick={() => handleDelete(g.id)} title="Destroy Record"><Trash2 size={14} strokeWidth={2.5} /></ActionBtn>
                            </div>
                        </div>
                    )) : !loading && (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Search size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>Query returned no results</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No gyms matching the criteria were identified in the network</p>
                        </div>
                    )}

                    {gyms.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: `1px solid ${T.border}`, background: T.bg }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>
                                Showing <span style={{ color: T.text, fontWeight: 900 }}>{(page - 1) * 10 + 1}</span>–<span style={{ color: T.text, fontWeight: 900 }}>{Math.min(page * 10, totalGyms)}</span> of <span style={{ color: T.text, fontWeight: 900 }}>{totalGyms}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button 
                                    onClick={() => page > 1 && setPage(page - 1)} disabled={page === 1}
                                    style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: page === 1 ? T.subtle : T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                ><ChevronLeft size={16} /></button>
                                <button 
                                    onClick={() => page < totalPages && setPage(page + 1)} disabled={page === totalPages}
                                    style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: page === totalPages ? T.subtle : T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                ><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <RightDrawer isOpen={isViewDrawerOpen} onClose={() => setIsViewDrawerOpen(false)} title="Gym Intelligence" subtitle={selectedGym?.gymName}>
                {selectedGym && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, padding: 28, borderRadius: 24, textAlign: 'center', color: '#fff', boxShadow: '0 12px 32px rgba(124,92,252,0.25)' }}>
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, fontWeight: 900 }}>{(selectedGym.gymName || 'G').charAt(0)}</div>
                            <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px' }}>{selectedGym.gymName}</h2>
                            <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, margin: 0 }}>{selectedGym.branchName}</p>
                        </div>

                        <div style={{ display: 'grid', gap: 12 }}>
                            <div style={{ padding: 18, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                <label style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Principal Contact</label>
                                <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{selectedGym.owner}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: T.muted, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}><Phone size={14} color={T.accent} /> {selectedGym.phone}</div>
                            </div>
                            <div style={{ padding: 18, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}` }}>
                                <label style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>Geo Location</label>
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, display: 'flex', gap: 8, lineHeight: 1.5 }}><MapPin size={14} style={{ marginTop: 2 }} color={T.accent} /> {selectedGym.location}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                             <button onClick={() => setIsViewDrawerOpen(false)} style={{ flex: 1, height: 48, borderRadius: 14, border: `1px solid ${T.border}`, background: '#fff', color: T.muted, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Dismiss</button>
                             <button onClick={() => { setIsViewDrawerOpen(false); setIsAddDrawerOpen(true); }} style={{ flex: 1.5, height: 48, borderRadius: 14, border: 'none', background: T.text, color: '#fff', fontSize: 13, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Pencil size={14} /> Update Config
                             </button>
                        </div>
                    </div>
                )}
            </RightDrawer>

            <AddGymDrawer 
                isOpen={isAddDrawerOpen} 
                onClose={() => { setIsAddDrawerOpen(false); setSelectedGym(null); }} 
                onSuccess={loadGyms} 
                editData={selectedGym} 
            />
            
            <ConfirmationModal 
                isOpen={confirmModal.isOpen} 
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} 
                onConfirm={processDelete} 
                title="Destroy Network Asset?" 
                message="This will permanently eliminate the gym branch from the franchise ledger. This action cannot be reversed." 
                confirmText="Terminate Asset" 
                type="danger" 
                loading={confirmModal.loading} 
            />
        </div>
    );
};

export default AllGyms;