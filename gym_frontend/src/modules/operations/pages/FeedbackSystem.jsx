import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../../../api/feedbackApi';
import toast from 'react-hot-toast';
import { Star, MessageSquare, ExternalLink, ThumbsUp, RefreshCw, MessageCircle, BarChart2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const FeedbackSystem = ({ role = 'ADMIN' }) => {
    const isMember = role === 'MEMBER';
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [feedbackType, setFeedbackType] = useState('Suggestion');
    const [memberRating, setMemberRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [REVIEWS, setReviews] = useState([]);

    useEffect(() => {
        if (!isMember) {
            loadFeedback();
        }
    }, [isMember]);

    const loadFeedback = async () => {
        try {
            const data = await feedbackApi.getAllFeedback();
            const formatted = data.map(f => ({
                id: f.id,
                user: f.member,
                rating: f.rating,
                date: f.date,
                text: f.comment,
                source: 'App'
            }));
            setReviews(formatted);
        } catch (error) {
            toast.error('Failed to load feedback');
        }
    };

    const handleConnect = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsConnected(true);
            setIsSyncing(false);
            alert("Successfully connected to 'Kiaan Gyms' Google Business Profile!");
        }, 1500);
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await feedbackApi.addFeedback({
                memberId: 1, // Optional: normally extract from context or let backend use token
                rating: memberRating,
                comment: `[${feedbackType}] ${comment}`
            });
            setSubmitted(true);
        } catch (error) {
            toast.error('Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isMember) {
        return (
            <div className="fade-in space-y-8 p-4 md:p-8">
                {/* Custom Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-slate-100 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Feedback Hub</h1>
                        <p className="text-slate-500 font-medium">Help us evolve by sharing your experience.</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    {!submitted ? (
                        <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 rounded-[32px]">
                            <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                                {/* Left Side: Design Element */}
                                <div className="md:col-span-2 bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-800 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                                            <MessageSquare size={28} className="text-violet-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black leading-tight">Your Voice <br />Matters.</h2>
                                            <p className="text-violet-100 text-sm font-medium leading-relaxed opacity-80">
                                                Every piece of feedback helps us build a more premium experience for you.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative z-10 pt-10">
                                        <div className="flex items-center gap-2 text-xs font-bold text-violet-200 uppercase tracking-widest">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            Active System
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Form */}
                                <div className="md:col-span-3 p-8 lg:p-12 bg-white">
                                    <form onSubmit={handleSubmitFeedback} className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">How would you rate us?</label>
                                            <div className="flex gap-3">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setMemberRating(star)}
                                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${memberRating >= star
                                                            ? 'bg-amber-100 text-amber-500 scale-105 shadow-md shadow-amber-200'
                                                            : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        <Star size={20} fill={memberRating >= star ? 'currentColor' : 'none'} strokeWidth={memberRating >= star ? 0 : 2} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">What's this about?</label>
                                            <select
                                                value={feedbackType}
                                                onChange={(e) => setFeedbackType(e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-violet-500 transition-all cursor-pointer text-slate-700"
                                            >
                                                <option>Suggestion</option>
                                                <option>Complaint</option>
                                                <option>Praise</option>
                                                <option>Equipment Request</option>
                                            </select>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Your Message</label>
                                            <textarea
                                                rows="4"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Tell us what's on your mind..."
                                                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-violet-500 transition-all resize-none placeholder:text-slate-300 text-slate-700"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || memberRating === 0}
                                            className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-violet-200"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <RefreshCw className="animate-spin" size={18} />
                                                    Transmitting...
                                                </div>
                                            ) : (
                                                "Submit Feedback"
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="bg-white rounded-[4rem] shadow-2xl p-20 text-center space-y-10 animate-in fade-in zoom-in duration-700 border border-slate-100">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                                <div className="relative w-full h-full bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                                    <ThumbsUp size={36} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Submission Received!</h2>
                                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                                    We've received your feedback. Our team will review it shortly.
                                </p>
                            </div>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-lg"
                            >
                                Send Another
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
            {/* Premium Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <MessageCircle size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Member Feedback
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse">
                                        PREMIUM ✨
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mt-1">Monitor reviews and ratings from all sources</p>
                            </div>
                        </div>

                        {!isConnected ? (
                            <button
                                onClick={handleConnect}
                                disabled={isSyncing}
                                className="group flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:border-violet-500 hover:text-violet-600 hover:shadow-md transition-all duration-300"
                            >
                                {isSyncing ? <RefreshCw className="animate-spin" size={18} /> : <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />}
                                {isSyncing ? 'Connecting...' : 'Connect Google Reviews'}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-100 shadow-sm animate-fade-in">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                Connected to Google Business
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Premium Stats Card */}
                <div className="lg:col-span-1 group relative bg-white rounded-2xl shadow-lg border border-slate-100 p-8 hover:shadow-xl hover:border-amber-200 transition-all duration-300 overflow-hidden h-fit">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                        <div className="text-center mb-6">
                            <h3 className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">Overall Rating</h3>
                            <div className="text-6xl font-black bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">4.8</div>
                            <div className="flex justify-center gap-1 mb-2 text-amber-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} fill="currentColor" strokeWidth={0} />)}
                            </div>
                            <div className="text-sm font-bold text-slate-400">Based on 128 Reviews</div>
                        </div>

                        <div className="space-y-3 pt-6 border-t-2 border-slate-50">
                            {[5, 4, 3, 2, 1].map(stars => (
                                <div key={stars} className="flex items-center gap-3">
                                    <span className="text-xs font-black text-slate-400 w-3">{stars}</span>
                                    <Star size={12} className="text-slate-300" fill="currentColor" strokeWidth={0} />
                                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${stars >= 4 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                                stars === 3 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                                    'bg-gradient-to-r from-red-400 to-red-500'
                                                }`}
                                            style={{ width: stars === 5 ? '70%' : stars === 4 ? '20%' : '5%' }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 w-6 text-right">
                                        {stars === 5 ? '70%' : stars === 4 ? '20%' : '5%'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Premium Reviews List */}
                <div className="lg:col-span-3 space-y-4">
                    {REVIEWS.map(review => (
                        <div key={review.id} className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:translate-x-1 transition-all duration-300 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-6">
                                <div className="shrink-0 flex md:flex-col items-center gap-3 md:w-32 text-center md:border-r md:border-slate-100 md:pr-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 rounded-full flex items-center justify-center font-black text-xl shadow-inner">
                                        {review.user.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900">{review.user}</div>
                                        <div className="text-xs font-semibold text-slate-400 mt-0.5">{review.date}</div>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-1 text-amber-400">
                                            {[...Array(review.rating)].map((_, i) => <Star key={i} size={18} fill="currentColor" strokeWidth={0} />)}
                                            {[...Array(5 - review.rating)].map((_, i) => <Star key={i} size={18} className="text-slate-200" fill="currentColor" strokeWidth={0} />)}
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${review.source === 'Google' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                            {review.source === 'Google' && <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" className="w-3 h-3" />}
                                            {review.source}
                                        </span>
                                    </div>

                                    <p className="text-slate-600 font-medium leading-relaxed mb-4 italic">
                                        "{review.text}"
                                    </p>

                                    <div className="flex gap-4 pt-4 border-t border-slate-50">
                                        <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-violet-600 transition-colors group/btn">
                                            <MessageSquare size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            Reply
                                        </button>
                                        <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors group/btn">
                                            <ThumbsUp size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            Helpful
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeedbackSystem;
