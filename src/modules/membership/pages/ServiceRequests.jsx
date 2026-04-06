import React, { useState, useEffect } from 'react';
import { Check, X, Clock, User, ClipboardList, Filter, Search, MessageSquare, Shield, Dumbbell, Utensils, UserPlus, ChevronDown } from 'lucide-react';
import { fetchServiceRequestsAPI, updateServiceRequestStatusAPI } from '../../../api/admin/adminApi';
import { toast } from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

/* ─── Design Tokens ─── */
const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF',
    accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF',
    text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC',
    green: '#22C97A', greenLight: '#E8FBF2',
    amber: '#F59E0B', amberLight: '#FEF3C7',
    rose: '#F43F5E', roseLight: '#FFF1F4',
    blue: '#3B82F6', blueLight: '#EFF6FF',
    violet: '#8B5CF6', violetLight: '#EDE9FE',
    emerald: '#10B981', emeraldLight: '#D1FAE5',
};

/* ─── Helpers ─── */
const CustomSelect = ({ options, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const label = options.find(o => o.value === value)?.label || options[0]?.label;
    return (
        <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(p => !p)} style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 14px',
                background: T.surface, border: `1px solid ${open ? T.accentMid : T.border}`,
                borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: T.text,
                fontFamily: "'Plus Jakarta Sans', sans-serif", width: '100%', justifyContent: 'space-between',
            }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                <ChevronDown size={13} color={T.subtle} style={{ transition: '0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: '100%',
                    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(124,92,252,0.12)', zIndex: 50, padding: 4,
                }}>
                    {options.map(o => (
                        <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} style={{
                            width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none',
                            background: value === o.value ? T.accentLight : 'transparent',
                            color: value === o.value ? T.accent : T.text, cursor: 'pointer',
                            fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>{o.label}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

const getTypeStyle = (type) => {
    const map = {
        'Diet Plan': { icon: Utensils, color: T.emerald, bg: T.emeraldLight },
        'Workout Plan': { icon: Dumbbell, color: T.accent, bg: T.accentLight },
        'Freeze Membership': { icon: Shield, color: T.amber, bg: T.amberLight },
        'Unfreeze Membership': { icon: Shield, color: T.blue, bg: T.blueLight },
        'Request Trainer Change': { icon: UserPlus, color: T.violet, bg: T.violetLight },
        'Request Locker': { icon: Shield, color: T.emerald, bg: T.emeraldLight },
    };
    return map[type] || { icon: ClipboardList, color: T.muted, bg: T.bg };
};

const getStatusStyle = (status) => {
    const map = {
        'Pending': { bg: T.amberLight, color: T.amber, border: '#FDE68A' },
        'Accepted': { bg: T.greenLight, color: T.green, border: '#A7F3D0' },
        'Approved': { bg: T.greenLight, color: T.green, border: '#A7F3D0' },
        'Rejected': { bg: T.roseLight, color: T.rose, border: '#FECDD3' },
        'Cancelled': { bg: T.roseLight, color: T.rose, border: '#FECDD3' },
    };
    return map[status] || { bg: T.bg, color: T.muted, border: T.border };
};

/* ─── Main ─── */
const ServiceRequests = () => {
    const { selectedBranch } = useBranchContext();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Pending');
    const [filterType, setFilterType] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, status: '', loading: false });

    useEffect(() => { loadRequests(); }, [selectedBranch, filterStatus, filterType]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await fetchServiceRequestsAPI({ branchId: selectedBranch, status: filterStatus, type: filterType });
            setRequests(data);
        } catch (err) {
            console.error(err); toast.error('Failed to load service requests');
        } finally { setLoading(false); }
    };

    const processAction = async () => {
        const { id, status } = confirmModal;
        try {
            setConfirmModal(p => ({ ...p, loading: true }));
            await updateServiceRequestStatusAPI(id, status);
            toast.success(`Request ${status} successfully`);
            setConfirmModal({ isOpen: false, id: null, status: '', loading: false });
            loadRequests();
        } catch { toast.error('Failed to update status'); setConfirmModal(p => ({ ...p, loading: false })); }
    };

    const filteredRequests = requests.filter(r =>
        r.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.member?.memberId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = requests.filter(r => r.status === 'Pending').length;

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); *{box-sizing:border-box;} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fadeUp 0.38s ease both;} .fu1{animation-delay:.05s} .fu2{animation-delay:.1s} .fu3{animation-delay:.15s} @keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:${T.subtle};font-weight:600;} input:focus,select:focus{outline:none;} select{appearance:none;}`}</style>

            {/* ══ HEADER ══ */}
            <div className="fu" style={{ marginBottom: 24 }}>
                <div style={{
                    background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 55%, #C084FC 100%)`,
                    borderRadius: 20, padding: '20px 26px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    boxShadow: `0 8px 32px rgba(124,92,252,0.28)`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ClipboardList size={24} color="#fff" strokeWidth={2.2} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>Service Requests</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                <MessageSquare size={12} color="rgba(255,255,255,0.6)" />
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600 }}>Manage plans, freezes, and trainer changes</p>
                            </div>
                        </div>
                    </div>
                    {/* Pending badge */}
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={16} color="rgba(255,255,255,0.8)" />
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Pending: {pendingCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* ══ FILTERS ══ */}
            <div className="fu fu1" style={{
                background: T.surface, borderRadius: 16, padding: '16px 18px',
                border: `1px solid ${T.border}`, boxShadow: '0 2px 8px rgba(124,92,252,0.05)',
                marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'center'
            }}>
                {/* Search */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11,
                    padding: '0 14px', height: 40,
                }}
                    onFocusCapture={e => { e.currentTarget.style.borderColor = T.accentMid; }}
                    onBlurCapture={e => { e.currentTarget.style.borderColor = T.border; }}
                >
                    <Search size={14} color={T.subtle} strokeWidth={2.2} />
                    <input type="text" placeholder="Search member…" value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                </div>

                {/* Status */}
                <CustomSelect value={filterStatus} onChange={setFilterStatus} options={[
                    { value: 'All', label: 'All Status' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Accepted', label: 'Accepted' },
                    { value: 'Rejected', label: 'Rejected' },
                ]} />

                {/* Type */}
                <CustomSelect value={filterType} onChange={setFilterType} options={[
                    { value: 'All', label: 'All Request Types' },
                    { value: 'Diet Plan', label: 'Diet Plan' },
                    { value: 'Workout Plan', label: 'Workout Plan' },
                    { value: 'Freeze Membership', label: 'Freeze Membership' },
                    { value: 'Unfreeze Membership', label: 'Unfreeze Membership' },
                    { value: 'Request Trainer Change', label: 'Trainer Change' },
                    { value: 'Request Locker', label: 'Locker Request' },
                ]} />

                {/* Apply */}
                <button onClick={loadRequests} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    height: 40, padding: '0 18px', borderRadius: 11, border: 'none',
                    background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                    color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: `0 3px 10px rgba(124,92,252,0.25)`,
                    whiteSpace: 'nowrap',
                }}>
                    <Filter size={14} /> Apply
                </button>
            </div>

            {/* ══ REQUEST CARDS ══ */}
            <div className="fu fu2" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loading ? (
                    <div style={{ padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 36, height: 36, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Fetching requests…</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div style={{
                        padding: '52px 0', textAlign: 'center', background: T.surface,
                        borderRadius: 18, border: `2px dashed ${T.border}`
                    }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                            <ClipboardList size={22} color={T.subtle} />
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '-0.2px' }}>No Requests Found</p>
                        <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Try adjusting your filters or search terms</p>
                    </div>
                ) : filteredRequests.map(req => {
                    const { icon: TypeIcon, color: typeColor, bg: typeBg } = getTypeStyle(req.type);
                    const { bg: stBg, color: stColor, border: stBorder } = getStatusStyle(req.status);
                    const isPending = req.status === 'Pending';
                    const isAcceptedPlan = (req.type === 'Diet Plan' || req.type === 'Workout Plan') && req.status === 'Accepted';

                    return (
                        <div key={req.id} style={{
                            background: T.surface, borderRadius: 16,
                            border: `1px solid ${T.border}`,
                            boxShadow: '0 2px 8px rgba(124,92,252,0.05)',
                            overflow: 'hidden', display: 'flex',
                            transition: 'box-shadow 0.15s, border-color 0.15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,92,252,0.12)'; e.currentTarget.style.borderColor = T.accentMid; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,92,252,0.05)'; e.currentTarget.style.borderColor = T.border; }}
                        >
                            {/* Left accent bar */}
                            <div style={{ width: 4, background: isPending ? T.amber : (req.status === 'Accepted' || req.status === 'Approved') ? T.green : T.rose, flexShrink: 0 }} />

                            <div style={{ flex: 1, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                                {/* Left content */}
                                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, minWidth: 260 }}>
                                    <div style={{ width: 46, height: 46, borderRadius: 13, background: typeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <TypeIcon size={20} color={typeColor} strokeWidth={2.2} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* Name + ID */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.2px' }}>{req.member?.name}</h3>
                                            <span style={{ fontSize: 9, fontWeight: 800, background: T.bg, color: T.subtle, padding: '2px 7px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                {req.member?.memberId}
                                            </span>
                                        </div>

                                        {/* Tags row */}
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                            <span style={{ fontSize: 10, fontWeight: 800, background: typeBg, color: typeColor, padding: '3px 9px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                {req.type}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, background: T.bg, color: T.muted, padding: '3px 9px', borderRadius: 8 }}>
                                                <Clock size={10} strokeWidth={2} />
                                                {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            {req.tenant?.name && (
                                                <span style={{ fontSize: 10, fontWeight: 700, background: T.bg, color: T.muted, padding: '3px 9px', borderRadius: 8 }}>
                                                    {req.tenant.name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Details box */}
                                        <div style={{
                                            background: T.bg, border: `1px solid ${T.border}`,
                                            borderRadius: 10, padding: '10px 14px', maxWidth: 480
                                        }}>
                                            <p style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>Details</p>
                                            <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                                                {req.details || 'No additional details provided.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right — status + actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, alignSelf: 'center' }}>
                                    <span style={{
                                        fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                                        padding: '5px 12px', borderRadius: 20,
                                        background: stBg, color: stColor, border: `1px solid ${stBorder}`,
                                    }}>
                                        {req.status}
                                    </span>

                                    {isPending && (
                                        <div style={{ display: 'flex', gap: 7 }}>
                                            {/* Reject */}
                                            <button
                                                onClick={() => setConfirmModal({ isOpen: true, id: req.id, status: 'Rejected', loading: false })}
                                                style={{
                                                    width: 36, height: 36, borderRadius: 10,
                                                    border: `1px solid #FECDD3`, background: T.roseLight, color: T.rose,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', transition: 'all 0.13s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = T.rose; e.currentTarget.style.color = '#fff'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = T.roseLight; e.currentTarget.style.color = T.rose; }}
                                                title="Reject"
                                            >
                                                <X size={16} strokeWidth={2.5} />
                                            </button>
                                            {/* Approve */}
                                            <button
                                                onClick={() => setConfirmModal({ isOpen: true, id: req.id, status: 'Accepted', loading: false })}
                                                style={{
                                                    height: 36, padding: '0 16px', borderRadius: 10,
                                                    background: `linear-gradient(135deg, ${T.green}, #34D399)`,
                                                    color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6,
                                                    fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                                                    cursor: 'pointer', boxShadow: `0 3px 10px rgba(34,201,122,0.3)`,
                                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                    transition: 'all 0.13s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 5px 14px rgba(34,201,122,0.4)`; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 10px rgba(34,201,122,0.3)`; }}
                                                title="Approve"
                                            >
                                                <Check size={15} strokeWidth={2.5} /> Approve
                                            </button>
                                        </div>
                                    )}

                                    {isAcceptedPlan && (
                                        <button
                                            onClick={() => {/* Navigate to plan builder */ }}
                                            style={{
                                                height: 36, padding: '0 16px', borderRadius: 10,
                                                background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                                                color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6,
                                                fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                                                cursor: 'pointer', boxShadow: `0 3px 10px rgba(124,92,252,0.3)`,
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                            }}
                                        >
                                            <ClipboardList size={15} strokeWidth={2.2} /> Build Plan
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={processAction}
                loading={confirmModal.loading}
                title={confirmModal.status === 'Accepted' ? 'Approve Request?' : 'Reject Request?'}
                message={`Are you sure you want to mark this request as ${confirmModal.status}?`}
                confirmText={confirmModal.status === 'Accepted' ? 'Approve' : 'Reject'}
                type={confirmModal.status === 'Accepted' ? 'success' : 'danger'}
            />
        </div>
    );
};

export default ServiceRequests;