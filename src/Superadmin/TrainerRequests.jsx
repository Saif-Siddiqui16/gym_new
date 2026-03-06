import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    CheckCircle2,
    Loader2,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchTrainerRequestsAPI, updateTrainerRequestAPI } from '../api/admin/adminApi';

const TrainerRequests = ({ role }) => {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Types');

    // Filter Options
    const filters = ['All Types', 'Pending', 'Active', 'Rejected']; // Note: Active means Approved

    const loadRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchTrainerRequestsAPI();
            setTrainers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load trainer requests:', error);
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await updateTrainerRequestAPI(id, newStatus);
            toast.success(`Request marked as ${newStatus}`);
            loadRequests(); // refresh the list
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error(error.response?.data?.message || 'Failed to update request');
        }
    };

    // Filter logic
    const filteredTrainers = trainers.filter((t) => {
        const matchesSearch =
            (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.email || '').toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === 'All Types') return matchesSearch;
        return matchesSearch && (t.status || 'Pending') === statusFilter;
    });

    // Stats calculation
    const pendingCount = trainers.filter(t => (t.status || 'Pending') === 'Pending').length;
    // Approving sets user to Active, rejecting sets to Rejected
    const approvedCount = trainers.filter(t => t.status === 'Active').length;
    const rejectedCount = trainers.filter(t => t.status === 'Rejected').length;

    const stats = [
        { label: 'Pending', value: pendingCount, color: 'amber', icon: Clock },
        { label: 'Approved', value: approvedCount, color: 'emerald', icon: CheckCircle2 },
        { label: 'Rejected', value: rejectedCount, color: 'rose', icon: XCircle },
    ];

    const getStatusBadge = (status) => {
        const s = status || 'Pending';
        switch (s) {
            case 'Pending':
                return <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">Pending</span>;
            case 'Active':
                return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">Approved</span>;
            case 'Rejected':
                return <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-100">Rejected</span>;
            default:
                return <span className="px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-xs font-bold border border-slate-100">{s}</span>;
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-violet-50/30 min-h-screen p-6 md:p-8 font-sans pb-24 text-slate-800">
            {/* Header section */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Trainer Approvals
                        </h1>
                        <p className="text-slate-500 font-bold mt-1">Review and process trainer signup requests</p>
                    </div>
                    <button
                        onClick={loadRequests}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 bg-${card.color}-50 text-${card.color}-600 rounded-xl flex items-center justify-center transition-transform`}>
                                <card.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                                <h3 className="text-2xl font-black text-slate-800">{loading ? '—' : card.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-600/10 focus:border-violet-600 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto no-scrollbar whitespace-nowrap">
                            <Filter size={14} className="text-slate-400" />
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${statusFilter === filter
                                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {filter === 'Active' ? 'Approved' : filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/60 backdrop-blur-md rounded-[32px] shadow-sm border border-white/50 overflow-hidden">
                    {loading ? (
                        <div className="py-24 text-center">
                            <Loader2 className="animate-spin mx-auto text-violet-500 mb-4" size={40} />
                            <p className="text-slate-500 font-bold">Loading requests...</p>
                        </div>
                    ) : filteredTrainers.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">
                                {searchQuery || statusFilter !== 'All Types' ? 'No matching requests' : 'All caught up!'}
                            </h3>
                            <p className="text-slate-500 font-bold">
                                {searchQuery || statusFilter !== 'All Types' ? 'Adjust your filters to see more.' : 'No pending trainer requests right now.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Trainer Info</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Specialization</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Contact</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    {filteredTrainers.map(trainer => (
                                        <tr key={trainer.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                                                        {(trainer.name || '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{trainer.name}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{trainer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {trainer.role || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                                {trainer.phone || '—'}
                                            </td>
                                            <td className="px-8 py-5">
                                                {getStatusBadge(trainer.status)}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {(trainer.status || 'Pending') === 'Pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(trainer.id, 'Active')}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(trainer.id, 'Rejected')}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            <XCircle size={14} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-400 italic">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerRequests;
