import React, { useState, useEffect } from 'react';
import {
    Lock,
    Unlock,
    Clock,
    AlertCircle,
    User,
    Settings,
    Calendar,
    Shield,
    Trash2,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Info,
    Smartphone,
    MapPin,
    Hash,
    Search,
    ChevronDown,
    Trash,
    Zap,
    CreditCard,
    ZapOff,
    Check,
    Coins,
    Sparkles
} from 'lucide-react';
import { lockerApi } from '../../../api/lockerApi';
import { getMembers } from '../../../api/staff/memberApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import RightDrawer from '../../../components/common/RightDrawer';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

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
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

const LockerDetailsDrawer = ({ locker, isOpen, onClose, onSuccess }) => {
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [searchMember, setSearchMember] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, loading: false });

    useEffect(() => {
        if (locker?.status === 'Available' && isOpen) {
            loadMembers();
        }
    }, [locker, isOpen]);

    const loadMembers = async () => {
        try {
            const data = await getMembers();
            setMembers(data || []);
        } catch (error) {
            console.error("Failed to load members", error);
        }
    };

    const handleAssign = async () => {
        if (!selectedMemberId) return toast.error('Please select a member');
        try {
            setLoading(true);
            await lockerApi.assignLocker(locker.id, {
                memberId: selectedMemberId,
                isPaid: isPaid
            });
            toast.success('Locker assigned successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to assign locker');
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async () => {
        try {
            setLoading(true);
            await lockerApi.releaseLocker(locker.id);
            toast.success('Locker released successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to release locker');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMaintenance = async () => {
        try {
            setLoading(true);
            const newStatus = locker.status === 'Maintenance' ? 'Available' : 'Maintenance';
            await lockerApi.toggleMaintenance(locker.id, { status: newStatus });
            toast.success(`Locker moved to ${newStatus}`);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        setConfirmModal({ isOpen: true, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal({ isOpen: true, loading: true });
            await lockerApi.deleteLocker(locker.id);
            toast.success('Locker deleted successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to delete locker');
        } finally {
            setConfirmModal({ isOpen: false, loading: false });
        }
    };

    if (!locker) return null;

    const filteredMembers = members.filter(m =>
        m.name?.toLowerCase().includes(searchMember.toLowerCase()) ||
        m.memberId?.toLowerCase().includes(searchMember.toLowerCase())
    );

    const InfoBlock = ({ label, value, icon: Icon }) => (
        <div style={{ background: '#fff', padding: 16, borderRadius: 16, border: `1.5px solid ${T.border}`, flex: 1, boxShadow: T.cardShadow }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                {Icon && <Icon size={12} />} {label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{value}</div>
        </div>
    );

    return (
        <>
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={`Locker # ${locker.number}`}
            subtitle={locker.area || 'Main Facility'}
        >
            <div style={{ padding: '0 8px', animation: 'fadeIn 0.4s ease-out' }}>
                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: ${T.accentMid}; borderRadius: 10px; }
                `}</style>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Hero Section */}
                    <div style={{ background: T.bg, padding: 24, borderRadius: 28, border: `1.5px solid ${T.border}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: T.accentLight, borderRadius: '50%', filter: 'blur(40px)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 20, background: locker.status === 'Available' ? T.green : locker.status === 'Assigned' ? T.accent : T.amber, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.shadow }}>
                                <Lock size={32} />
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Current Registry</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: T.text, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {locker.number}
                                    <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 8, background: '#fff', color: T.text, border: `1px solid ${T.border}` }}>{locker.size}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InfoBlock label="Financial Logic" value={locker.isChargeable ? `Premium (₹${locker.price}/mo)` : 'Standard'} icon={Coins} />
                        <InfoBlock label="Sector Loc" value={locker.area || 'Zone A'} icon={MapPin} />
                    </div>

                    {/* Detailed Logic */}
                    {locker.status === 'Assigned' && locker.assignedTo ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: 4 }}>Target Occupant</div>
                            <div style={{ background: T.accentLight, padding: 24, borderRadius: 24, border: `1.5px solid ${T.accentMid}`, position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: T.accent, boxShadow: T.cardShadow }}>
                                        {locker.assignedTo.name?.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>{locker.assignedTo.name}</div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: T.accent }}>PID: {locker.assignedTo.memberId}</div>
                                    </div>
                                    <button style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: 'none', color: T.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20, paddingTop: 20, borderTop: `1.5px dashed ${T.accentMid}` }}>
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 800, color: T.muted, opacity: 0.6, textTransform: 'uppercase' }}>Contact</div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{locker.assignedTo.phone || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 800, color: T.muted, opacity: 0.6, textTransform: 'uppercase' }}>Registry Date</div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{new Date(locker.updatedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleRelease}
                                disabled={loading}
                                style={{ width: '100%', height: 54, borderRadius: 16, border: 'none', background: T.rose, color: '#fff', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 10px 20px -10px rgba(244, 63, 94, 0.3)' }}
                            >
                                <XCircle size={18} /> Release Allocation
                            </button>
                        </div>
                    ) : locker.status === 'Available' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: 4 }}>Select Allocation Target</div>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                                <input
                                    type="text"
                                    placeholder="Search by ID or Name..."
                                    value={searchMember}
                                    onChange={(e) => setSearchMember(e.target.value)}
                                    style={{ width: '100%', height: 50, padding: '0 20px 0 52px', background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 16, fontSize: 13, fontWeight: 700, outline: 'none' }}
                                />
                            </div>

                            <div className="custom-scrollbar" style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: '4px' }}>
                                {filteredMembers.length > 0 ? filteredMembers.slice(0, 50).map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedMemberId(m.id)}
                                        style={{ width: '100%', padding: 14, background: selectedMemberId === m.id ? T.accentLight : '#fff', border: `1.5px solid ${selectedMemberId === m.id ? T.accent : T.border}`, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: '0.2s', textAlign: 'left' }}
                                    >
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: selectedMemberId === m.id ? T.accent : T.bg, color: selectedMemberId === m.id ? '#fff' : T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>
                                            {m.name?.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{m.name}</div>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>{m.memberId}</div>
                                        </div>
                                        {selectedMemberId === m.id && <Check size={18} color={T.accent} strokeWidth={3} />}
                                    </button>
                                )) : (
                                    <div style={{ padding: 40, textAlign: 'center', color: T.subtle }}>
                                        <Info size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                                        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>No targets located</div>
                                    </div>
                                )}
                            </div>

                            {selectedMemberId && (
                                <div style={{ animation: 'fadeIn 0.3s ease-out', background: T.greenLight, padding: 20, borderRadius: 24, border: `1.5px solid ${T.green}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: isPaid ? T.green : '#fff', color: isPaid ? '#fff' : T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s', border: `2px solid ${T.green}` }}>
                                            <Check size={20} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Credits Cleared?</div>
                                            <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, marginTop: 2 }}>Mark initial rental payment</div>
                                        </div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative', width: 50, height: 26, background: isPaid ? T.green : T.subtle, borderRadius: 13, transition: '0.3s' }}>
                                        <input
                                            type="checkbox"
                                            checked={isPaid}
                                            onChange={(e) => setIsPaid(e.target.checked)}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', transition: '0.3s', position: 'absolute', left: isPaid ? 26 : 4, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
                                    </label>
                                </div>
                            )}

                            <button
                                onClick={handleAssign}
                                disabled={loading || !selectedMemberId}
                                style={{ width: '100%', height: 54, borderRadius: 16, border: 'none', background: T.accent, color: '#fff', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: T.shadow, opacity: !selectedMemberId ? 0.5 : 1 }}
                            >
                                <Sparkles size={18} /> Confirm Allocation
                            </button>
                        </div>
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', background: T.amberLight, borderRadius: 24, border: `1.5px solid ${T.amber}30` }}>
                            <ZapOff size={32} color={T.amber} style={{ marginBottom: 12 }} />
                            <div style={{ fontSize: 12, fontWeight: 900, color: T.amber, textTransform: 'uppercase' }}>Station Offline</div>
                            <div style={{ fontSize: 10, color: T.amber, marginTop: 4, fontWeight: 600 }}>Currently undergoing maintenance protocols</div>
                        </div>
                    )}

                    {/* Quick Tactics */}
                    <div style={{ marginTop: 12, padding: 20, background: '#fff', borderRadius: 24, border: `1.5px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Override Commands</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <button
                                onClick={handleToggleMaintenance}
                                style={{ height: 44, borderRadius: 12, border: 'none', background: locker.status === 'Maintenance' ? T.greenLight : T.amberLight, color: locker.status === 'Maintenance' ? T.green : T.amber, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
                            >
                                <Zap size={14} /> {locker.status === 'Maintenance' ? 'Restore' : 'Service'}
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{ height: 44, borderRadius: 12, border: 'none', background: T.roseLight, color: T.rose, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
                            >
                                <Trash size={14} /> Purge
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </RightDrawer>

        <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, loading: false })}
            onConfirm={processDelete}
            title="Delete Locker?"
            message="This locker and all assignment history will be permanently removed."
            confirmText="Delete"
            type="danger"
            loading={confirmModal.loading}
        />
        </>
    );
};

export default LockerDetailsDrawer;
