import React, { useState } from 'react';
import { Megaphone } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import { createAnnouncement } from '../../api/communication/communicationApi';
import { toast } from 'react-hot-toast';

const CreateAnnouncementDrawer = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        targetRole: 'all',
        priority: 0,
        status: 'Active'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await createAnnouncement(formData);
            if (onSuccess) onSuccess(result);
            onClose();
            setFormData({
                title: '',
                content: '',
                targetRole: 'all',
                priority: 0,
                status: 'Active'
            });
        } catch (error) {
            console.error('Error creating announcement:', error);
            toast.error(error || 'Failed to create announcement');
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <React.Fragment>
            <button
                type="button"
                onClick={onClose}
                className="drawer-btn drawer-btn-secondary flex-1"
            >
                Cancel
            </button>
            <button
                type="submit"
                form="create-announcement-form"
                disabled={isSubmitting}
                className="drawer-btn drawer-btn-primary flex-[2]"
            >
                {isSubmitting ? 'Creating...' : 'Create Announcement'}
            </button>
        </React.Fragment>
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Create Announcement"
            subtitle="Broadcast to your members"
            footer={footer}
            maxWidth="max-w-md"
        >
            <form id="create-announcement-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="drawer-form-group">
                    <label className="drawer-label">
                        Announcement Title *
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Weekly Schedule Update"
                        className="drawer-input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="drawer-form-group">
                    <label className="drawer-label">
                        Content Detail *
                    </label>
                    <textarea
                        placeholder="Describe the announcement here..."
                        className="drawer-textarea"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                    />
                </div>

                <div className="drawer-form-group">
                    <label className="drawer-label">
                        Target Role
                    </label>
                    <select
                        className="drawer-select"
                        value={formData.targetRole}
                        onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    >
                        <option value="all">Everyone</option>
                        <option value="member">Members Only</option>
                        <option value="STAFF">Staff Only</option>
                        <option value="TRAINER">Trainers Only</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="drawer-form-group">
                        <label className="drawer-label">
                            Display Priority
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            className="drawer-input"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="drawer-form-group">
                        <label className="drawer-label">
                            Visibility
                        </label>
                        <div
                            onClick={() => setFormData({ ...formData, status: formData.status === 'Active' ? 'Hidden' : 'Active' })}
                            className={`flex items-center justify-between px-4 h-[48px] rounded-xl border transition-all cursor-pointer ${formData.status === 'Active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest">{formData.status === 'Active' ? 'Visible' : 'Hidden'}</span>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${formData.status === 'Active' ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-violet-50/50 rounded-2xl border-2 border-dashed border-violet-100 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl text-violet-500 shadow-sm shrink-0">
                        <Megaphone size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-violet-900 uppercase tracking-widest mb-1">Visibility Tip</p>
                        <p className="text-[10px] text-violet-600 font-bold leading-relaxed uppercase opacity-70">
                            Show announcement to members once created.
                        </p>
                    </div>
                </div>
            </form>
        </RightDrawer>
    );
};

export default CreateAnnouncementDrawer;
