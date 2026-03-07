import React, { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { addAnnouncement } from '../../../api/communication/communicationApi';
import RightDrawer from '../../../components/common/RightDrawer';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';

const AnnouncementFormDrawer = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        targetAudience: 'All Members',
        priority: 0,
        isActive: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            return toast.error("Title and Content are required");
        }

        try {
            setIsSubmitting(true);

            // Map labels to backend role keys
            const roleMap = {
                'All Members': 'all',
                'Active Members': 'member',
                'Expired Members': 'expired',
                'Staff Only': 'STAFF',
                'Trainers Only': 'TRAINER'
            };

            const payload = {
                title: formData.title,
                content: formData.content,
                targetRole: roleMap[formData.targetAudience] || 'all',
                priority: parseInt(formData.priority) || 0,
                status: formData.isActive ? 'Active' : 'Inactive'
            };

            await addAnnouncement(payload);
            toast.success("Announcement broadcasted successfully!");
            onSuccess?.();
            onClose();
            // Reset form
            setFormData({
                title: '',
                content: '',
                targetAudience: 'All Members',
                priority: 0,
                isActive: true
            });
        } catch (error) {
            console.error('Failed to create announcement:', error);
            toast.error(error.response?.data?.message || "Failed to create announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Create Announcement"
            subtitle="Create a new announcement for your members"
            maxWidth="max-w-2xl"
            footer={
                <div className="flex gap-3 w-full justify-end px-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="px-6 h-11 rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="announcement-form"
                        variant="primary"
                        loading={isSubmitting}
                        className="px-8 h-11 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform active:scale-95"
                    >
                        Create Announcement
                    </Button>
                </div>
            }
        >
            <div className="px-8 py-8">
                <form id="announcement-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* Title Field */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title *</label>
                        <input
                            required
                            type="text"
                            placeholder="Announcement title"
                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold transition-all outline-none bg-slate-50/50"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Content Field */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Content *</label>
                        <textarea
                            required
                            rows={5}
                            placeholder="Announcement content..."
                            className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold transition-all outline-none bg-slate-50/50 resize-none"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Audience</label>
                        <div className="relative group">
                            <select
                                className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold transition-all outline-none bg-slate-50/50 appearance-none cursor-pointer"
                                value={formData.targetAudience}
                                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                            >
                                <option>All Members</option>
                                <option>Active Members</option>
                                <option>Expired Members</option>
                                <option>Staff Only</option>
                                <option>Trainers Only</option>
                            </select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" />
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority (0-10)</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold transition-all outline-none bg-slate-50/50"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50/30 border-2 border-slate-50 rounded-2xl group transition-all hover:bg-white hover:border-slate-100 shadow-sm">
                        <div className="space-y-0.5">
                            <p className="text-[13px] font-black text-slate-900 tracking-tight">Active Status</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Show announcement to members</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.isActive ? 'bg-[#4f46e5]' : 'bg-slate-200'
                                }`}
                        >
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                </form>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </RightDrawer>
    );
};

export default AnnouncementFormDrawer;
