import React, { useState } from 'react';
import { Megaphone, Users, Calendar, Clock, Send, XCircle, CheckCircle, BellRing } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import CustomDropdown from '../../components/common/CustomDropdown';
import { createAnnouncement } from '../../api/manager/managerApi';

const CreateAnnouncementDrawer = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        audience: 'All Members',
        scheduledTime: '',
        isScheduled: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createAnnouncement({
                title: formData.title,
                message: formData.message,
                audience: formData.audience,
                status: formData.isScheduled ? 'Scheduled' : 'Posted',
                date: formData.isScheduled ? new Date(formData.scheduledTime).toLocaleString() : new Date().toLocaleString()
            });
            onSuccess();
            onClose();
            setFormData({
                title: '',
                message: '',
                audience: 'All Members',
                scheduledTime: '',
                isScheduled: false
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="New Announcement"
            subtitle="Broadcast updates to your community"
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Header Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                        <Megaphone size={32} className="mb-4 text-indigo-100" />
                        <h3 className="text-lg font-black tracking-tight">Broadcast Center</h3>
                        <p className="text-indigo-100 text-xs font-medium mt-1 opacity-80">Send important updates, offers, or news to your members and staff instantly.</p>
                    </div>

                    {/* Title */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <BellRing size={14} className="text-indigo-500" />
                            Subject Line *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Gym Maintenance this Sunday"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-indigo-500 transition-all placeholder:font-medium"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    {/* Audience */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Users size={14} className="text-indigo-500" />
                            Target Audience *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {['All Members', 'Active Members', 'Trainers', 'Staff'].map(aud => (
                                <button
                                    key={aud}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, audience: aud })}
                                    className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${formData.audience === aud
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    {aud}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Body */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} className="text-indigo-500" />
                            Message Content *
                        </label>
                        <textarea
                            rows="6"
                            placeholder="Type your announcement here..."
                            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-indigo-500 transition-all resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                        />
                    </div>

                    {/* Scheduling Toggle */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isScheduled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Schedule for Later</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">Send automatically at a specific time</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isScheduled}
                                    onChange={(e) => setFormData({ ...formData, isScheduled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        {formData.isScheduled && (
                            <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                                <input
                                    type="datetime-local"
                                    className="w-full px-4 py-3 bg-white border-2 border-indigo-100 rounded-xl font-bold text-slate-700 focus:border-indigo-500 transition-all"
                                    value={formData.scheduledTime}
                                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-4 bg-white border-t border-slate-100 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {formData.isScheduled ? <Calendar size={18} /> : <Send size={18} />}
                        {isSubmitting ? 'Processing...' : (formData.isScheduled ? 'Schedule' : 'Send Now')}
                    </button>
                </div>
            </form>
        </RightDrawer>
    );
};

export default CreateAnnouncementDrawer;
