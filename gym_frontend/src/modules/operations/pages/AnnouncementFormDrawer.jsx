import React, { useState } from 'react';
import { Megaphone, Calendar, Users, Send, Target, Eye, XCircle, Clock, BellRing, Sparkles } from 'lucide-react';
import { announcementApi } from '../../../api/announcementApi';
import toast from 'react-hot-toast';

const AudiencePreview = ({ audience }) => {
    const counts = {
        'All Members': 1240,
        'Active Members': 850,
        'Expired Members': 390,
        'Staff Only': 45,
        'Trainers Only': 12
    };

    return (
        <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                    <Users size={16} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Estimated Reach</p>
                    <p className="text-sm font-bold text-slate-700">{counts[audience] || 0} People</p>
                </div>
            </div>
            <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[8px] font-black text-indigo-600">+</div>
            </div>
        </div>
    );
};

const AnnouncementFormDrawer = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        targetAudience: 'All Members',
        scheduledTime: '',
        priority: 'Normal',
        broadcastType: 'Now' // 'Now' or 'Scheduled'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const audiences = ['All Members', 'Active Members', 'Expired Members', 'Staff Only', 'Trainers Only'];
    const priorities = ['Normal', 'High', 'Urgent'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await announcementApi.addAnnouncement({
                title: formData.title,
                message: formData.message,
                priority: formData.priority.toLowerCase(),
                targetAudience: formData.targetAudience.toLowerCase()
            });
            toast.success("Announcement broadcasted successfully!");
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to broadcast announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-gray-50/50">
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-12">
                {/* Header Banner */}
                <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/20 shadow-inner">
                            <Megaphone size={40} className="text-indigo-400 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Broadcast Message</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Send updates to your gym community</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Announcement Title</label>
                        <div className="relative">
                            <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400" size={20} />
                            <input
                                required
                                type="text"
                                placeholder="Summer Bootcamp 2024 is here!"
                                className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[28px] text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Detailed Message</label>
                        <textarea
                            required
                            rows="5"
                            placeholder="Type your message here... You can use emojis too! 🚀"
                            className="w-full p-8 bg-white border-2 border-slate-100 rounded-[32px] text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-sm resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Audience</label>
                        <div className="flex flex-wrap gap-2">
                            {audiences.map(aud => (
                                <button
                                    key={aud}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, targetAudience: aud })}
                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.targetAudience === aud
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-100 hover:text-indigo-600'
                                        }`}
                                >
                                    {aud}
                                </button>
                            ))}
                        </div>
                        <AudiencePreview audience={formData.targetAudience} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Broadcasting Schedule</label>
                            <div className="flex p-1 bg-white border-2 border-slate-100 rounded-2xl">
                                {['Now', 'Scheduled'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, broadcastType: type })}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.broadcastType === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Urgency Level</label>
                            <div className="flex gap-2">
                                {priorities.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.priority === p
                                            ? (p === 'Urgent' ? 'bg-rose-600 border-rose-600 text-white shadow-rose-200' : 'bg-slate-900 border-slate-900 text-white shadow-slate-200')
                                            : 'bg-white border-slate-100 text-slate-400'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {formData.broadcastType === 'Scheduled' && (
                        <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Publish Date & Time</label>
                            <div className="relative">
                                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="datetime-local"
                                    className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[28px] text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                    value={formData.scheduledTime}
                                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="shrink-0 p-8 bg-white border-t border-slate-50 flex gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            <span>{formData.broadcastType === 'Now' ? 'Broadcast Now' : 'Schedule Broadcast'}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default AnnouncementFormDrawer;
