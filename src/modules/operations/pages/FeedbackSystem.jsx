import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
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
    ExternalLink,
    Share2,
    MapPin
} from 'lucide-react';
import StatsCard from '../../../modules/dashboard/components/StatsCard';
import { feedbackApi } from '../../../api/feedbackApi';
import RightDrawer from '../../../components/common/RightDrawer';
import toast from 'react-hot-toast';

const FeedbackSystem = ({ role }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [newFeedback, setNewFeedback] = useState({ rating: 5, comment: '' });
    const [googleConfig, setGoogleConfig] = useState({ enabled: false, link: '' });
    const [showGoogleSuccess, setShowGoogleSuccess] = useState(false);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const data = await feedbackApi.getAllFeedback();
            setFeedback(data.feedback || []);
            setGoogleConfig({
                enabled: data.googleBusinessEnabled,
                link: data.googleReviewLink
            });
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishToGoogle = async (id) => {
        try {
            await feedbackApi.publishToGoogle(id);
            fetchFeedback();
            toast.success('Feedback marked as published to Google');
        } catch (error) {
            console.error('Error publishing to Google:', error);
            toast.error('Failed to mark as published');
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
            if (newFeedback.rating >= 4 && googleConfig.enabled && googleConfig.link) {
                setShowGoogleSuccess(true);
            }
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
            case 'Reviewed': return 'bg-primary-light text-primary';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    return (
        <div className="min-h-screen space-y-8 animate-fadeIn text-sans">

            {/* Header Section */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg transition-transform duration-300 shrink-0">
                            <MessageSquare size={24} className="sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">
                                {role === 'MEMBER' ? 'My Feedback' : 'Member Feedback'}
                            </h1>
                            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
                                {role === 'MEMBER' ? 'Share your thoughts and track responses' : 'Review and manage feedback submitted by members'}
                            </p>
                        </div>
                    </div>

                    {role === 'MEMBER' && (
                        <button
                            onClick={() => setIsSubmitModalOpen(true)}
                            className="w-full sm:w-auto px-6 h-11 bg-gradient-to-r from-primary to-primary text-white rounded-xl text-sm font-bold shadow-md hover:shadow-primary/30/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={18} />
                            Submit Feedback
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Feedback', value: stats.total, icon: MessageSquare, color: 'from-primary to-primary' },
                    { label: 'Average Rating', value: stats.avgRating, icon: Star, color: 'from-amber-400 to-orange-500' },
                    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'from-blue-500 to-indigo-600' },
                    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' }
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between h-full group transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                        <div className="flex items-start justify-between w-full">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">{kpi.label}</p>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-3xl font-black text-slate-900">{kpi.value}</h3>
                                    {kpi.label === 'Average Rating' && (
                                        <div className="flex items-center gap-0.5 mb-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star 
                                                    key={s} 
                                                    size={12} 
                                                    className={Math.round(kpi.value) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} 
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                                <kpi.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* All Feedback Content Area */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-none">All Feedback</h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Comprehensive list of member reviews</p>
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
                                className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold transition-all outline-none bg-white font-sans"
                            />
                        </div>

                        <div className="relative min-w-[140px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-12 px-4 appearance-none rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-bold transition-all outline-none bg-white cursor-pointer pr-10 font-sans"
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

                <div className="saas-table-wrapper border-0 rounded-none overflow-x-auto">
                    <table className="saas-table saas-table-responsive w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                {role !== 'MEMBER' && <th className="px-6 py-4">Member</th>}
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4">Feedback</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                {role !== 'MEMBER' && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredFeedback.length > 0 ? (
                                filteredFeedback.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        {role !== 'MEMBER' && <td className="px-6 py-4 font-bold text-slate-900">{item.member}</td>}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star 
                                                            key={s} 
                                                            size={14} 
                                                            className={`${item.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} transition-colors`} 
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-black text-slate-400 ml-1">({item.rating})</span>
                                                {item.isPublishedToGoogle && (
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary-light text-primary rounded-md ml-2 border border-violet-100 shadow-sm animate-in fade-in zoom-in duration-300">
                                                        <ExternalLink size={10} className="animate-pulse" />
                                                        <span className="text-[8px] font-black uppercase tracking-tighter">Google</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-500 font-medium max-w-md line-clamp-2">{item.comment}</p>
                                        </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        <td className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase">{item.date}</td>

                                        {role !== 'MEMBER' && (
                                            <td className="px-6 py-4 text-right relative">
                                                <div className="flex items-center justify-end gap-2">
                                                    {(item.status || 'Pending') === 'Pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(item.id, 'Reviewed')}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary-hover hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-colors"
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
                                                        <div className="flex items-center gap-2">
                                                            {item.rating >= 4 && !item.isPublishedToGoogle && googleConfig.enabled && (
                                                                <button
                                                                    onClick={() => handlePublishToGoogle(item.id)}
                                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-lg text-xs font-bold transition-all shadow-md shadow-violet-100 active:scale-95"
                                                                    title="Mark as published to Google"
                                                                >
                                                                    <Share2 size={14} className="animate-pulse" />
                                                                    Publish to Google
                                                                </button>
                                                            )}
                                                            <span className="text-xs font-bold text-slate-400 italic bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Resolved</span>
                                                        </div>
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
            <RightDrawer
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                title="Submit Feedback"
                subtitle="Share your experience with us"
                maxWidth="max-w-lg"
                footer={
                    <button
                        form="feedback-form"
                        type="submit"
                        className="w-full h-12 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-violet-200 hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={16} />
                        Submit Request
                    </button>
                }
            >
                <form id="feedback-form" onSubmit={handleFeedbackSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                                    className={`p-3 rounded-xl transition-all ${newFeedback.rating >= star ? 'bg-amber-50 text-amber-400' : 'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:scale-105 active:scale-95'}`}
                                >
                                    <Star size={24} className={newFeedback.rating >= star ? "fill-amber-400" : ""} />
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                            {newFeedback.rating === 5 && "⭐ Excellent - I love it!"}
                            {newFeedback.rating === 4 && "⭐ Good - Pretty satisfied"}
                            {newFeedback.rating === 3 && "⭐ Average - It's okay"}
                            {newFeedback.rating === 2 && "⭐ Poor - Needs improvement"}
                            {newFeedback.rating === 1 && "⭐ Terrible - Very disappointed"}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Feedback</label>
                        <textarea
                            required
                            rows={6}
                            placeholder="Tell us what you loved or what we could improve..."
                            value={newFeedback.comment}
                            onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                            className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all outline-none resize-none"
                        />
                    </div>
                </form>
            </RightDrawer>

            {/* Google Success Modal */}
            <GoogleSuccessModal
                isOpen={showGoogleSuccess}
                onClose={() => setShowGoogleSuccess(false)}
                link={googleConfig.link}
            />
        </div>
    );
};

/* Google Success Modal */
const GoogleSuccessModal = ({ isOpen, onClose, link }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-md"
            showCloseButton={false}
        >
            <div className="p-10 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light rounded-full -mr-16 -mt-16 blur-2xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-light rounded-full -ml-16 -mb-16 blur-2xl opacity-50"></div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all border border-slate-100 shadow-sm z-10"
                >
                    <X size={20} />
                </button>

                <div className="text-center space-y-8 relative">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-xl shadow-violet-200 animate-bounce-subtle">
                                <Star size={44} fill="white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                                <Check size={16} strokeWidth={4} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Thank You!</h2>
                        <p className="text-slate-500 font-bold text-sm tracking-wide leading-relaxed">
                            We're thrilled you had a great experience! Would you mind sharing your review on Google to help others find us?
                        </p>
                    </div>

                    <div className="pt-4 space-y-4">
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onClose}
                            className="w-full h-16 rounded-[1.25rem] bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                                <MapPin size={14} className="text-primary" />
                            </div>
                            Review us on Google Maps
                        </a>

                        <button
                            onClick={onClose}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>

                    <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};


export default FeedbackSystem;
