import React, { useState, useEffect, useCallback } from 'react';
import { Gift, Users, UserPlus, CheckCircle, Clock, TrendingUp, Plus, Search, X, Phone, Mail, Loader, ChevronRight } from 'lucide-react';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-hot-toast';

const ReferralSettings = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [referrerVerified, setReferrerVerified] = useState(null);

    const [formData, setFormData] = useState({
        referredName: '',
        phone: '',
        email: '',
        referrerId: ''
    });

    const fetchReferrals = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/referrals');
            setReferrals(res.data || []);
        } catch (err) {
            toast.error('Failed to load referrals');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferrals();
    }, [fetchReferrals]);

    const handleVerifyReferrer = async () => {
        if (!formData.referrerId.trim()) return;
        try {
            setVerifying(true);
            const res = await apiClient.get(`/referrals/verify/${formData.referrerId.trim()}`);
            if (res.data.valid) {
                setReferrerVerified(res.data.referrerName);
                toast.success(`Referrer found: ${res.data.referrerName}`);
            } else {
                setReferrerVerified(null);
                toast.error('No member found with this code');
            }
        } catch {
            toast.error('Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.referredName || !formData.phone) {
            toast.error('Name and Phone are required');
            return;
        }
        try {
            setSubmitting(true);
            await apiClient.post('/referrals', formData);
            toast.success('Referral created successfully!');
            setFormData({ referredName: '', phone: '', email: '', referrerId: '' });
            setReferrerVerified(null);
            setShowForm(false);
            fetchReferrals();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to create referral');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = referrals.filter(r =>
        r.referredName?.toLowerCase().includes(search.toLowerCase()) ||
        r.referrerName?.toLowerCase().includes(search.toLowerCase()) ||
        r.phone?.includes(search)
    );

    const stats = {
        total: referrals.length,
        converted: referrals.filter(r => r.status === 'Converted').length,
        pending: referrals.filter(r => r.status === 'Pending').length,
        rate: referrals.length > 0 ? Math.round((referrals.filter(r => r.status === 'Converted').length / referrals.length) * 100) : 0
    };

    return (
        <div className="space-y-6 p-0 md:p-6 animate-fadeIn">
            {/* Header */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl blur-3xl opacity-10 pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl shadow-violet-500/30/10 border border-white/50 p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent font-black tracking-tighter">
                            Referral Program
                        </h1>
                        <p className="text-slate-400 text-[10px] sm:text-xs mt-1 uppercase tracking-widest font-bold">Configure rewards for members who refer new members</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-2xl text-sm font-black shadow-2xl shadow-violet-500/30/25 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={3} /> Add Referral
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Referrals', value: stats.total, icon: Users, color: 'violet' },
                    { label: 'Converted', value: stats.converted, icon: CheckCircle, color: 'emerald' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
                    { label: 'Conversion Rate', value: `${stats.rate}%`, icon: TrendingUp, color: 'blue' },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-${s.color}-50`}>
                            <s.icon className={`text-${s.color}-600`} size={20} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Add Referral Drawer */}
            {showForm && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><UserPlus size={20} className="text-violet-500" /> Add New Referral</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Record a member referral</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Referrer Code */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Referrer's Member ID (Optional)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. MBR001"
                                        value={formData.referrerId}
                                        onChange={(e) => { setFormData({ ...formData, referrerId: e.target.value }); setReferrerVerified(null); }}
                                        className="flex-1 h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyReferrer}
                                        disabled={verifying || !formData.referrerId}
                                        className="px-4 h-12 bg-slate-900 text-white rounded-xl text-xs font-black disabled:opacity-40 hover:bg-violet-600 transition-all"
                                    >
                                        {verifying ? <Loader className="animate-spin" size={16} /> : 'Verify'}
                                    </button>
                                </div>
                                {referrerVerified && (
                                    <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                                        <CheckCircle size={13} /> Referrer: {referrerVerified}
                                    </p>
                                )}
                            </div>

                            {/* Referred Name */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Referred Person's Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Full Name"
                                    value={formData.referredName}
                                    onChange={(e) => setFormData({ ...formData, referredName: e.target.value })}
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 transition-all"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1"><Phone size={10} /> Phone *</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1"><Mail size={10} /> Email</label>
                                <input
                                    type="email"
                                    placeholder="Email (optional)"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 transition-all"
                                />
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                            <button onClick={() => setShowForm(false)} className="flex-1 py-3.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-[2] py-3.5 bg-violet-600 text-white rounded-xl text-sm font-black shadow-md shadow-violet-200 hover:bg-violet-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader className="animate-spin" size={16} /> : <Gift size={16} />}
                                {submitting ? 'Creating...' : 'Create Referral'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Referrals List */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-black text-slate-900">All Referrals</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search referrals..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-400 transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader className="animate-spin text-violet-500" size={32} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Gift className="text-slate-300" size={32} />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">No referrals found</p>
                        <p className="text-slate-300 text-xs mt-1">Click "Add Referral" to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/70">
                                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Referred Person</th>
                                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Referrer</th>
                                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Contact</th>
                                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Status</th>
                                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((r) => (
                                    <tr key={r.id} className="hover:bg-violet-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0">
                                                    {r.referredName?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-slate-900">{r.referredName || 'N/A'}</p>
                                                    <p className="text-xs text-slate-400 font-bold">{r.email || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <ChevronRight size={14} className="text-slate-300" />
                                                <div>
                                                    <p className="font-bold text-sm text-slate-700">{r.referrerName || 'Unknown'}</p>
                                                    {r.referrerId && <p className="text-[10px] text-slate-400 font-bold">ID: {r.referrerId}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm text-slate-700">{r.phone || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                r.status === 'Converted'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {r.status === 'Converted' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-500">
                                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReferralSettings;
