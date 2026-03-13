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
    Search
} from 'lucide-react';
import { lockerApi } from '../../../api/lockerApi';
import { getMembers } from '../../../api/staff/memberApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import RightDrawer from '../../../components/common/RightDrawer';

const LockerDetailsDrawer = ({ locker, isOpen, onClose, onSuccess }) => {
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [searchMember, setSearchMember] = useState('');
    const [isPaid, setIsPaid] = useState(false);

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

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this locker?')) return;
        try {
            setLoading(true);
            await lockerApi.deleteLocker(locker.id);
            toast.success('Locker deleted successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to delete locker');
        } finally {
            setLoading(false);
        }
    };

    if (!locker) return null;

    const filteredMembers = members.filter(m =>
        m.name?.toLowerCase().includes(searchMember.toLowerCase()) ||
        m.memberId?.toLowerCase().includes(searchMember.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Assigned': return 'bg-primary/10 text-primary border-primary/20';
            case 'Maintenance': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={`Locker #${locker.number}`}
            subtitle={locker.area || 'Main Facility'}
            footer={
                <div className="flex flex-col gap-4 w-full">
                    {locker.status === 'Assigned' ? (
                        <button
                            onClick={handleRelease}
                            disabled={loading}
                            className="w-full py-5 bg-rose-600 text-white rounded-2.5xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Executing Protocol...' : (
                                <>
                                    TERMINATE ASSIGNMENT <Unlock size={18} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                                </>
                            )}
                        </button>
                    ) : locker.status === 'Available' ? (
                        <button
                            onClick={handleAssign}
                            disabled={loading || !selectedMemberId}
                            className="w-full py-5 bg-primary text-white rounded-2.5xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-hover transition-all shadow-xl shadow-violet-100 flex items-center justify-center gap-3 group disabled:opacity-40 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none active:scale-95"
                        >
                            {loading ? 'Executing Assignment...' : (
                                <>
                                    {selectedMemberId ? 'CONFIRM ALLOCATION' : 'SELECT TARGET MEMBER'} <CheckCircle2 size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    ) : null}

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleToggleMaintenance}
                            className={`py-4 border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${locker.status === 'Maintenance'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                                }`}
                        >
                            {locker.status === 'Maintenance' ? 'Finish Service' : 'Start Service'}
                        </button>
                        <button
                            onClick={onClose}
                            className="py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-8 pb-4">
                <div className="flex items-center gap-6 p-6 bg-slate-50/80 rounded-[2.5rem] border border-slate-100 mb-2 shadow-inner">
                    <div className="w-16 h-16 bg-[#0a1b2e] flex items-center justify-center rounded-[1.5rem] shadow-xl relative ring-4 ring-white">
                        <Lock size={28} className="text-white" />
                        <div className={`w-4 h-4 rounded-full absolute -top-1 -right-1 border-4 border-white ${locker.status === 'Available' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                            locker.status === 'Assigned' ? 'bg-[#7c3aed] shadow-[0_0_10px_rgba(124,58,237,0.5)]' :
                                'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                            }`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic line-clamp-1">Asset #{locker.number}</h3>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(locker.status)}`}>
                                {locker.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <MapPin size={12} strokeWidth={3} className="text-primary/40" /> {locker.area || 'Main Facility'}
                        </div>
                    </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Hash size={10} className="text-violet-400" /> Size
                        </span>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wide">{locker.size || 'Medium'}</span>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Shield size={10} className="text-violet-400" /> Type
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">{locker.isChargeable ? 'Premium' : 'Standard'}</span>
                            {locker.isChargeable && (
                                <span className="text-[10px] font-black text-primary bg-primary-light px-2 py-0.5 rounded-lg border border-violet-100">
                                    ₹{locker.price}/mo
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {locker.status === 'Assigned' && locker.assignedTo ? (
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Current Occupant Trace</h4>
                        <div className="p-6 bg-primary-light/30 border border-violet-100/50 rounded-[2.5rem] space-y-6 shadow-sm relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-violet-100 flex items-center justify-center text-primary font-black text-xl italic ring-2 ring-primary-light">
                                    {locker.assignedTo.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-md font-black text-slate-900 leading-none">{locker.assignedTo.name}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">PID: {locker.assignedTo.memberId}</p>

                                    {locker.assignedTo?.expiryDate && new Date(locker.assignedTo.expiryDate) < new Date() && (
                                        <div className="mt-2 flex">
                                            <span className="bg-rose-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-rose-100 animate-pulse border border-rose-400/20">
                                                Membership Expired
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-violet-100/50 relative z-10">
                                <div className="flex items-center gap-2.5 text-[10px] text-slate-600 font-black uppercase tracking-widest">
                                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-violet-400 border border-primary-light shadow-sm">
                                        <Smartphone size={14} />
                                    </div>
                                    {locker.assignedTo.phone || 'DATA N/A'}
                                </div>
                                <div className="flex items-center gap-2.5 text-[10px] text-slate-600 font-black uppercase tracking-widest">
                                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-violet-400 border border-primary-light shadow-sm">
                                        <Calendar size={14} />
                                    </div>
                                    Since {new Date(locker.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900/5 rounded-3xl border border-slate-100 flex items-start gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                                <Info size={20} />
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mt-1">
                                Note: Releasing this asset will clear the assignment log and mark the unit as Available for reallocation.
                            </p>
                        </div>
                    </div>
                ) : locker.status === 'Available' ? (
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Assign to Member</h4>

                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" size={20} strokeWidth={3} />
                            <input
                                type="text"
                                placeholder="Trace by ID or Profile Name..."
                                value={searchMember}
                                onChange={(e) => setSearchMember(e.target.value)}
                                className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-slate-100 rounded-2.5xl text-[11px] font-black focus:outline-none focus:border-primary/20 focus:bg-white transition-all placeholder:text-slate-400 uppercase tracking-widest"
                            />
                        </div>
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar border border-slate-50 rounded-2.5xl p-3 space-y-2 bg-slate-50/20 shadow-inner">
                            {filteredMembers.length > 0 ? filteredMembers.map(m => {
                                let hasLockerBenefit = false;
                                if (m.plan?.benefits) {
                                    try {
                                        const benefits = typeof m.plan.benefits === 'string'
                                            ? JSON.parse(m.plan.benefits)
                                            : m.plan.benefits;
                                        if (Array.isArray(benefits)) {
                                            hasLockerBenefit = benefits.some(b =>
                                                (typeof b === 'string' && b.toLowerCase().includes('locker')) ||
                                                (b.name && b.name.toLowerCase().includes('locker'))
                                            );
                                        }
                                    } catch (e) { }
                                }

                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedMemberId(m.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${selectedMemberId === m.id
                                            ? 'bg-white border-primary shadow-lg shadow-primary-light scale-[1.02] z-10 relative'
                                            : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-300 ${selectedMemberId === m.id ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {m.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 tracking-tight">{m.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[9px] text-primary font-black uppercase tracking-widest">{m.memberId}</p>
                                                    {hasLockerBenefit && (
                                                        <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter shadow-sm shadow-emerald-100">
                                                            Free Locker Included
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedMemberId === m.id && (
                                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white scale-110 animate-in zoom-in duration-300">
                                                <CheckCircle2 size={16} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            }) : (
                                <div className="py-12 flex flex-col items-center opacity-30">
                                    <Info size={32} className="mb-3" />
                                    <p className="text-[10px] text-slate-900 font-black uppercase tracking-[0.2em]">Sector Empty</p>
                                </div>
                            )}
                        </div>

                        {locker.isChargeable && selectedMemberId && (
                            <div className="space-y-4">
                                {(() => {
                                    const selectedMember = members.find(m => m.id === selectedMemberId);
                                    let hasLockerBenefit = false;
                                    if (selectedMember?.plan?.benefits) {
                                        try {
                                            const benefits = typeof selectedMember.plan.benefits === 'string'
                                                ? JSON.parse(selectedMember.plan.benefits)
                                                : selectedMember.plan.benefits;
                                            if (Array.isArray(benefits)) {
                                                hasLockerBenefit = benefits.some(b =>
                                                    (typeof b === 'string' && b.toLowerCase().includes('locker')) ||
                                                    (b.name && b.name.toLowerCase().includes('locker'))
                                                );
                                            }
                                        } catch (e) { }
                                    }

                                    if (hasLockerBenefit) {
                                        return (
                                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-2">
                                                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                                                    <Shield size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-emerald-900 uppercase">Complimentary Assignment</p>
                                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Locker is included in {selectedMember.plan?.name}</p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-primary-light/30 border border-violet-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Paid Assignment Required</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                                        Monthly Fee: <span className="text-primary font-black px-2 py-0.5 bg-white rounded-lg border border-violet-100">₹{locker.price}</span>
                                                    </p>
                                                </div>
                                                <div className="w-10 h-10 bg-white border border-violet-100 rounded-xl flex items-center justify-center text-primary shadow-sm">
                                                    <Hash size={20} />
                                                </div>
                                            </div>

                                            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-900 tracking-tight">Payment Received?</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Mark as paid for first month</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={isPaid}
                                                        onChange={(e) => setIsPaid(e.target.checked)}
                                                    />
                                                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                                </label>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold italic text-center uppercase tracking-widest">
                                                * An invoice will be automatically generated for the member.
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50/80 rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-amber-500 shadow-xl mb-6 ring-4 ring-amber-50 animate-pulse">
                            <Settings size={40} />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] italic">Station Offline</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-[200px]">
                            Asset under maintenance protocol. No external assignments permitted.
                        </p>
                    </div>
                )}
            </div>
        </RightDrawer>
    );
};

export default LockerDetailsDrawer;
