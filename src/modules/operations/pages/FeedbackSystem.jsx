import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Star,
    Clock,
    CheckCircle2,
    Search,
    Filter,
    BarChart3,
    ArrowUpRight,
    MoreHorizontal,
    Loader2,
    Check,
    X,
    ExternalLink
} from 'lucide-react';
import StatsCard from '../../../modules/dashboard/components/StatsCard';
import { feedbackApi } from '../../../api/feedbackApi';

import toast from 'react-hot-toast';

const FeedbackSystem = ({ role }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [newFeedback, setNewFeedback] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const data = await feedbackApi.getAllFeedback();
            setFeedback(data);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await feedbackApi.updateFeedbackStatus(id, status);
            fetchFeedback();
            setActiveMenu(null);
            toast.success('Feedback status updated');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            toast.loading('Submitting feedback...', { id: 'submit-feedback' });
            await feedbackApi.addFeedback(newFeedback);
            toast.success('Feedback submitted successfully!', { id: 'submit-feedback' });
            setIsSubmitModalOpen(false);
            setNewFeedback({ rating: 5, comment: '' });
            fetchFeedback();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback. Try again.', { id: 'submit-feedback' });
        }
    };

    const stats = {
        total: feedback.length,
        avgRating: feedback.length > 0
            ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1)
            : '0',
        pending: feedback.filter(f => f.status === 'Pending').length,
        resolved: feedback.filter(f => f.status === 'Resolved').length
    };

    const filteredFeedback = feedback.filter(f => {
        const searchLow = searchTerm.toLowerCase();
        const matchesSearch =
            (f.member || '').toLowerCase().includes(searchLow) ||
            (f.comment || '').toLowerCase().includes(searchLow);
        const matchesStatus = statusFilter === 'All Status' || f.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-emerald-50 text-emerald-600';
            case 'Pending': return 'bg-amber-50 text-amber-600';
            case 'Reviewed': return 'bg-blue-50 text-blue-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 md:p-8 space-y-8 animate-fadeIn text-sans">

            {/* Header Section */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-10 pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                                <MessageSquare size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{role === 'MEMBER' ? 'My Feedback' : 'Member Feedback'}</h1>
                                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
                                    {role === 'MEMBER' ? 'Share your thoughts and track responses' : 'Review and manage feedback submitted by members'}
                                </p>
                            </div>
                        </div>

                        {role === 'MEMBER' && (
                            <button
                                onClick={() => setIsSubmitModalOpen(true)}
                                className="h-12 px-6 rounded-xl bg-violet-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-violet-200 hover:bg-violet-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                <MessageSquare size={16} />
                                Submit Feedback
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Feedback" value={stats.total.toString()} icon={MessageSquare} color="primary" isEarningsLayout={true} />
                <StatsCard title="Average Rating" value={stats.avgRating} icon={Star} color="warning" isEarningsLayout={true} />
                <StatsCard title="Pending Review" value={stats.pending.toString()} icon={Clock} color="info" isEarningsLayout={true} />
                <StatsCard title="Resolved" value={stats.resolved.toString()} icon={CheckCircle2} color="success" isEarningsLayout={true} />
            </div>

            {/* All Feedback Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">All Feedback</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Comprehensive list of member reviews</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search feedback..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-semibold transition-all outline-none bg-white font-sans"
                            />
                        </div>

                        <div className="relative min-w-[140px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-12 px-4 appearance-none rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-bold transition-all outline-none bg-white cursor-pointer pr-10 font-sans"
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Reviewed</option>
                                <option>Resolved</option>
                            </select>
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <div className="saas-table-wrapper border-0 rounded-none overflow-visible">
                    <table className="saas-table saas-table-responsive w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                {role !== 'MEMBER' && <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>}
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rating</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Feedback</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                {role !== 'MEMBER' && <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredFeedback.length > 0 ? (
                                filteredFeedback.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        {role !== 'MEMBER' && <td className="px-8 py-5 font-bold text-slate-900">{item.member}</td>}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-bold text-slate-900">{item.rating}</span>
                                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm text-slate-500 font-medium max-w-md line-clamp-2">{item.comment}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-slate-400 text-[10px] uppercase">{item.date}</td>

                                        {role !== 'MEMBER' && (
                                            <td className="px-8 py-5 text-right relative">
                                                <div className="flex items-center justify-end gap-2">
                                                    {(item.status || 'Pending') === 'Pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(item.id, 'Reviewed')}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                                                            >
                                                                <Check size={14} />
                                                                Review
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(item.id, 'Resolved')}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                                Resolve
                                                            </button>
                                                        </>
                                                    ) : (item.status === 'Reviewed') ? (
                                                        <button
                                                            onClick={() => handleStatusUpdate(item.id, 'Resolved')}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            Resolve
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-400 italic">Resolved</span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center pointer-events-none">
                                        <div className="flex flex-col items-center gap-5">
                                            <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                                <MessageSquare size={48} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">No feedback recorded yet</h3>
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Member reviews and feedback will appear here</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Submit Feedback Modal */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsSubmitModalOpen(false)}
                            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Submit Feedback</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Share your experience with us</p>
                            </div>
                        </div>

                        <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                                            className={`p-3 rounded-xl transition-all ${newFeedback.rating >= star ? 'bg-amber-50 text-amber-400' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                                        >
                                            <Star size={24} className={newFeedback.rating >= star ? "fill-amber-400" : ""} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Feedback</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Tell us what you loved or what we could improve..."
                                    value={newFeedback.comment}
                                    onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                                    className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm font-medium transition-all outline-none resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-violet-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={16} />
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FeedbackSystem;
