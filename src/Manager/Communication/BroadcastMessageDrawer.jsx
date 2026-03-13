import React, { useState, useEffect } from 'react';
import { ChevronDown, Info, Send, Loader2 } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import { fetchMessageTemplates, sendBroadcastMessage } from '../../api/communication/communicationApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BroadcastMessageDrawer = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        channel: 'WhatsApp',
        templateId: '',
        audience: 'All Members',
        message: ''
    });

    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadTemplates();
        }
    }, [isOpen, formData.channel]);

    const loadTemplates = async () => {
        try {
            setLoadingTemplates(true);
            const data = await fetchMessageTemplates({
                branchId: user?.tenantId,
                channel: formData.channel
            });
            setTemplates(data || []);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleTemplateChange = (e) => {
        const id = e.target.value;
        const selected = templates.find(t => t.id === parseInt(id));
        setFormData({
            ...formData,
            templateId: id,
            message: selected ? selected.content : formData.message
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.message) return toast.error("Please enter a message");

        try {
            setIsSubmitting(true);
            await sendBroadcastMessage({
                channel: formData.channel,
                message: formData.message,
                audience: formData.audience,
                templateId: formData.templateId ? parseInt(formData.templateId) : null
            });

            toast.success(`Broadcast queued for ${formData.audience}`);
            onSuccess?.();
            onClose();
            setFormData({
                channel: 'WhatsApp',
                templateId: '',
                audience: 'All Members',
                message: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send broadcast");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Broadcast Message"
            subtitle="Send a message to multiple members at once"
            maxWidth="max-w-2xl"
            footer={
                <div className="flex gap-3 w-full justify-end px-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 h-11 border-2 border-slate-100 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="broadcast-form"
                        disabled={isSubmitting}
                        className="px-8 h-11 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-100 hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send size={16} />
                                <span>Send Broadcast</span>
                            </>
                        )}
                    </button>
                </div>
            }
        >
            <div className="px-8 py-8 h-full custom-scrollbar ">
                <form id="broadcast-form" onSubmit={handleSubmit} className="space-y-8 pb-10">

                    {/* Channel Selector */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Channel</label>
                        <div className="relative group">
                            <select
                                className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-black text-slate-900 transition-all outline-none bg-slate-50/50 appearance-none cursor-pointer"
                                value={formData.channel}
                                onChange={(e) => setFormData({ ...formData, channel: e.target.value, templateId: '' })}
                            >
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="SMS">SMS</option>
                                <option value="Email">Email</option>
                            </select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" />
                        </div>
                    </div>

                    {/* Template Selection */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Use Template (Optional) {loadingTemplates && <Loader2 size={12} className="inline animate-spin ml-2" />}
                        </label>
                        <div className="relative group">
                            <select
                                className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-black text-slate-900 transition-all outline-none bg-slate-50/50 appearance-none cursor-pointer"
                                value={formData.templateId}
                                onChange={handleTemplateChange}
                            >
                                <option value="">Select a saved template...</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                                {templates.length === 0 && !loadingTemplates && (
                                    <option value="" disabled>No templates found for this branch</option>
                                )}
                            </select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" />
                        </div>
                    </div>

                    {/* Audience Selection */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Audience</label>
                        <div className="relative group">
                            <select
                                className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-black text-slate-900 transition-all outline-none bg-slate-50/50 appearance-none cursor-pointer"
                                value={formData.audience}
                                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                            >
                                <option value="All Members">All Members</option>
                                <option value="Active Members">Active Members</option>
                                <option value="Expired Members">Expired Members</option>
                                <option value="Staff">Staff</option>
                            </select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" />
                        </div>
                    </div>

                    {/* Message Field */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message *</label>
                        <textarea
                            required
                            rows={6}
                            placeholder="Enter your message..."
                            className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold text-slate-700 transition-all outline-none bg-slate-50/50 resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Use variables like {'{{member_name}}'}, {'{{member_id}}'}</p>
                    </div>

                    {/* Information Notice */}
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 relative overflow-hidden group shadow-sm transition-all hover:bg-white hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary transition-transform">
                                <Info size={16} />
                            </div>
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Configuration Note</h4>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                            Note: External delivery requires API configuration in Settings. Broadcasts are logged in the history tab.
                        </p>
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

export default BroadcastMessageDrawer;
