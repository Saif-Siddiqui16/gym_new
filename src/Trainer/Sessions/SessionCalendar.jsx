import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, User, CheckCircle, Users, Package } from 'lucide-react';
import { ptApi } from '../../api/ptApi';
import { useAuth } from '../../context/AuthContext';
import { useBranchContext } from '../../context/BranchContext';
import toast from 'react-hot-toast';

const SessionCalendar = () => {
    const { user } = useAuth();
    const { selectedBranch } = useBranchContext();
    const [ptClients, setPtClients] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const [formData, setFormData] = useState({
        clientId: '',
        ptAccountId: '',
        sessionDate: new Date().toISOString().split('T')[0],
        sessionTime: '10:00',
        duration: 60,
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, [selectedBranch]);

    const loadData = async () => {
        try {
            // Load PT accounts (active memberships) for the specific branch
            const accountsRes = await ptApi.getAccounts(selectedBranch === 'all' ? '' : selectedBranch);
            const accounts = accountsRes.data || [];
            setPtClients(accounts);

            // Extract unique client list for form dropdown
            const seen = new Set();
            const uniqueClients = [];
            accounts.forEach(acc => {
                if (acc.member && !seen.has(acc.member.id)) {
                    seen.add(acc.member.id);
                    uniqueClients.push({
                        id: acc.member.id,
                        name: acc.member.name,
                        ptAccountId: acc.id,
                        fullAccount: acc
                    });
                }
            });
            setClients(uniqueClients);
        } catch (err) {
            console.error('Error loading PT clients:', err);
            toast.error('Failed to load PT clients');
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // If client is changed, update the selected client object and ptAccountId
        if (field === 'clientId') {
            const client = clients.find(c => c.id == value);
            if (client) {
                setSelectedClient(client.fullAccount);
                setFormData(prev => ({ ...prev, ptAccountId: client.ptAccountId }));
            } else {
                setSelectedClient(null);
                setFormData(prev => ({ ...prev, ptAccountId: '' }));
            }
        }
    };

    const handleClientSelect = (account) => {
        setSelectedClient(account);
        setFormData(prev => ({
            ...prev,
            clientId: account.member?.id || '',
            ptAccountId: account.id
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) return toast.error('Trainer information missing');

        setLoading(true);
        try {
            const sessionData = {
                memberId: parseInt(formData.clientId),
                trainerId: user.id,
                ptAccountId: parseInt(formData.ptAccountId),
                date: formData.sessionDate,
                time: formData.sessionTime,
                duration: parseInt(formData.duration),
                notes: formData.notes
            };

            await ptApi.logSession(sessionData);
            setSubmitted(true);
            toast.success('Session scheduled successfully!');
        } catch (err) {
            console.error('Error scheduling session:', err);
            toast.error(err.response?.data?.message || 'Failed to schedule session');
        } finally {
            setLoading(false);
        }
    };

    const activeCount = ptClients.filter(a => a.status === 'Active').length;

    if (submitted) {
        return (
            <div className="saas-container p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-12 flex flex-col items-center gap-4 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                        <CheckCircle size={32} className="text-emerald-500" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Session Scheduled!</h2>
                    <p className="text-slate-500 text-sm">Your PT session has been booked successfully.</p>
                    <button
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({ clientId: '', sessionDate: '', sessionTime: '10:00', duration: 60, notes: '' });
                            setSelectedClient(null);
                        }}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                    >
                        Schedule Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="saas-container p-4 md:p-6 space-y-6">

            {/* Page Header */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800">Schedule PT Session</h1>
                <p className="text-slate-500 text-sm mt-1">Book a personal training session with your client</p>
            </div>

            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* ── LEFT: Schedule Form ── */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">

                        {/* Section Header */}
                        <div className="px-8 py-6 border-b border-slate-100">
                            <h2 className="text-base font-bold text-slate-800">Session Details</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Fill in the session information</p>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">

                            {/* Select Client */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <User size={13} className="text-slate-400" />
                                    Select Client
                                </label>
                                <select
                                    required
                                    value={formData.clientId}
                                    onChange={(e) => handleChange('clientId', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                >
                                    <option value="">Choose a client</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {selectedClient && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-100 rounded-xl mt-1">
                                        <div className="w-5 h-5 rounded-lg bg-violet-600 flex items-center justify-center text-white text-[9px] font-black">
                                            {(selectedClient.member?.name || 'C').charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-violet-700">{selectedClient.member?.name}</span>
                                        <span className="text-[10px] text-violet-400 ml-auto">{selectedClient.package?.name} · {selectedClient.remainingSessions} sessions left</span>
                                    </div>
                                )}
                            </div>

                            {/* Session Date */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <Calendar size={13} className="text-slate-400" />
                                    Session Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.sessionDate}
                                    onChange={(e) => handleChange('sessionDate', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                />
                            </div>

                            {/* Session Time */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <Clock size={13} className="text-slate-400" />
                                    Session Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.sessionTime}
                                    onChange={(e) => handleChange('sessionTime', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                />
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <Clock size={13} className="text-slate-400" />
                                    Duration (minutes)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="15"
                                        max="240"
                                        step="5"
                                        value={formData.duration}
                                        onChange={(e) => handleChange('duration', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">min</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {[30, 45, 60, 90].map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => handleChange('duration', d)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${formData.duration == d
                                                ? 'bg-violet-600 !text-white shadow-sm shadow-violet-200'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            {d} min
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Session Notes */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <FileText size={13} className="text-slate-400" />
                                    Session Notes
                                    <span className="text-[10px] normal-case text-slate-300 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="Focus areas, workout plan, etc."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                                >
                                    <Calendar size={16} strokeWidth={2.5} />
                                    {loading ? 'Scheduling...' : 'Schedule Session'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

                {/* ── RIGHT: Your PT Clients ── */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">

                        {/* Panel Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                                <Users size={18} className="text-violet-600" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Your PT Clients</h2>
                                <p className="text-[11px] text-slate-400">{activeCount} active client{activeCount !== 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        {/* Client List */}
                        <div className="divide-y divide-slate-50">
                            {ptClients.length === 0 ? (
                                <div className="px-6 py-10 text-center">
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Users size={18} className="text-slate-300" />
                                    </div>
                                    <p className="text-xs text-slate-400">No PT clients assigned yet</p>
                                </div>
                            ) : (
                                ptClients.map(acc => {
                                    const isActive = acc.status === 'Active';
                                    const isSelected = selectedClient?.id === acc.id;
                                    const progress = acc.totalSessions > 0
                                        ? (acc.remainingSessions / acc.totalSessions) * 100
                                        : 0;

                                    return (
                                        <button
                                            key={acc.id}
                                            type="button"
                                            onClick={() => handleClientSelect(acc)}
                                            className={`w-full px-6 py-4 text-left transition-all group ${isSelected ? 'bg-violet-50/60' : 'hover:bg-slate-50/70'}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${isSelected ? 'bg-violet-600 !text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        {(acc.member?.name || 'C').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700 leading-tight">{acc.member?.name || 'Unknown'}</p>
                                                        <p className="text-[10px] text-slate-400">{acc.member?.memberId || ''}</p>
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600">
                                                        Active
                                                    </span>
                                                )}
                                            </div>

                                            {/* Package Details */}
                                            <div className="mt-2 bg-slate-50 rounded-xl px-3 py-2.5">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Package size={11} className="text-violet-400" />
                                                        <span className="text-[11px] font-bold text-slate-600">{acc.package?.name || 'Package'}</span>
                                                    </div>
                                                    <span className="text-[11px] font-black text-violet-600">{acc.remainingSessions} left</span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-violet-500 to-violet-500 rounded-full transition-all"
                                                        style={{ width: `${Math.max(progress, 4)}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-1">{acc.remainingSessions} of {acc.totalSessions} sessions remaining</p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SessionCalendar;

