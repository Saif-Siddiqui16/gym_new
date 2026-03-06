import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    AlertTriangle,
    XOctagon,
    Clock,
    User,
    ChevronRight,
    Unlock,
    IndianRupee,
    History,
    AlertCircle,
    MoreVertical,
    CheckCircle2,
    Lock,
    MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchLiveAccess } from '../../../api/branchAdmin/branchAdminApi';

const LiveAccessControl = ({ userRole = 'STAFF' }) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [checkins, setCheckins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [overrideReason, setOverrideReason] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchLiveAccess();
            setCheckins(data || []);
        } catch (err) {
            console.error('LiveAccessControl fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // Auto-refresh every 60 seconds
        const refreshTimer = setInterval(loadData, 60000);
        return () => clearInterval(refreshTimer);
    }, []);

    // Clock tick every 10 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const getStatus = (member) => {
        const today = new Date();
        const expiryDate = new Date(member.expiry);
        const balance = member.balance || 0;

        if (expiryDate < today) return { type: 'RED', label: 'EXPIRED - STOP', icon: XOctagon, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100 shadow-rose-100' };
        if (balance > 0) return { type: 'RED', label: 'PAYMENT DUE - STOP', icon: AlertTriangle, iconColor: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100 shadow-rose-100' };

        // Expiring within 3 days
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) return { type: 'YELLOW', label: 'EXPIRING SOON', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100 shadow-amber-100' };

        return { type: 'GREEN', label: 'ACTIVE - ALLOWED', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100 shadow-emerald-100' };
    };

    const isManager = userRole === 'MANAGER' || userRole === 'BRANCH_ADMIN';

    const handleAction = (member) => {
        const status = getStatus(member);
        if (status.type === 'RED') {
            setSelectedMember(member);
            setShowOverrideModal(true);
        } else if (status.type === 'YELLOW') {
            alert(`Reminder sent to ${member.member}`);
        } else {
            navigate('/memberships/' + member.id);
        }
    };

    const confirmOverride = () => {
        if (!overrideReason.trim()) return alert('Please enter an override reason.');
        alert(`Entry overridden for ${selectedMember.member} by ${userRole}. Reason: ${overrideReason}`);
        setShowOverrideModal(false);
        setSelectedMember(null);
        setOverrideReason('');
    };

    return (
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden mb-8">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white relative">
                        <Lock size={28} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Live Access Control</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">Monitor Operational</span>
                            <span className="text-[10px] font-bold text-slate-400 italic">Last Refresh: {currentTime}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        <History size={16} /> Security Logs
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Info</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Membership Plan</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dues / Expiry</th>
                            <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Status</th>
                            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {checkins.map(member => {
                            const status = getStatus(member);
                            return (
                                <tr key={member.id} className={`group transition-colors ${status.type === 'RED' ? 'bg-rose-50/30' : 'hover:bg-slate-50/80'}`}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={member.photo} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform" alt="" />
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${status.type === 'RED' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-slate-900 block group-hover:text-slate-700 transition-colors uppercase tracking-tight">{member.member}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged: {member.time}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-700 tracking-tight">{member.plan}</span>
                                            <span className="text-[10px] font-medium text-slate-400 uppercase">Premium Member</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-black tabular-nums ${member.balance > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                                                ₹{member.balance?.toLocaleString() || 0} Dues
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase italic">Exp: {member.expiry}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`mx-auto flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border ${status.bg} ${status.color} ${status.border} shadow-sm max-w-[180px]`}>
                                            <status.icon size={16} strokeWidth={3} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">{status.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => handleAction(member)}
                                            className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status.type === 'RED'
                                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 hover:scale-105 active:scale-95'
                                                : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-slate-200'
                                                }`}
                                        >
                                            {status.type === 'RED' ? 'Authorize' : 'View Profile'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden p-4 space-y-4">
                {checkins.map(member => {
                    const status = getStatus(member);
                    return (
                        <div key={member.id} className={`p-4 rounded-3xl border ${status.type === 'RED' ? 'bg-rose-50/30 border-rose-100' : 'bg-white border-slate-100'} shadow-sm`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={member.photo} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md" alt="" />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${status.type === 'RED' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-black text-slate-900 block uppercase tracking-tight">{member.member}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged: {member.time}</span>
                                    </div>
                                </div>
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${status.bg} ${status.color}`}>
                                    <status.icon size={16} strokeWidth={3} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</p>
                                    <p className="text-sm font-bold text-slate-700">{member.plan}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dues</p>
                                    <p className={`text-sm font-black tabular-nums ${member.balance > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                                        ₹{member.balance?.toLocaleString() || 0}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAction(member)}
                                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status.type === 'RED'
                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                                    : 'bg-white border-2 border-slate-100 text-slate-600'
                                    }`}
                            >
                                {status.type === 'RED' ? 'Authorize Entry' : 'View Profile'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Override Modal */}
            {showOverrideModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-10 text-center">
                            <div className="w-24 h-24 rounded-[32px] bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-8 animate-bounce transition-all">
                                <XOctagon size={48} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3 uppercase italic">Access Blocked</h2>
                            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                <span className="font-black text-rose-600">{selectedMember?.member}</span> has outstanding dues of <span className="font-black">₹{selectedMember?.balance}</span> or an expired membership. Gym entry is restricted.
                            </p>

                            <div className="space-y-4 mb-8">
                                <button
                                    onClick={() => navigate('/finance/cashier')}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <IndianRupee size={18} /> Receive Payment
                                </button>

                                {isManager ? (
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="text-left">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Override Reason (Manager Only)</label>
                                            <textarea
                                                value={overrideReason}
                                                onChange={(e) => setOverrideReason(e.target.value)}
                                                placeholder="e.g. Authorized by director / Technical issues"
                                                className="w-full p-6 h-32 rounded-3xl border-2 border-slate-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 font-bold text-sm outline-none transition-all bg-slate-50/50"
                                            />
                                        </div>
                                        <button
                                            onClick={confirmOverride}
                                            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Unlock size={18} /> Forced Override entry
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 opacity-60">
                                        <Lock size={16} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Manager Authorization Required for Override</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => { setShowOverrideModal(false); setSelectedMember(null); }}
                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Dismiss Check-in
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveAccessControl;
