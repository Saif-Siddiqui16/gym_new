import React, { useState, useEffect } from 'react';
import { Info, Send } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import { sendBroadcast, getTemplates } from '../../api/communication/communicationApi';
import { toast } from 'react-hot-toast';

const BroadcastMessageDrawer = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        channel: 'WhatsApp',
        templateId: '',
        audience: 'All Members',
        message: ''
    });

    const [templates, setTemplates] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await getTemplates(null, formData.channel);
                setTemplates(data);
            } catch (error) {
                console.error('Error fetching templates:', error);
            }
        };
        if (isOpen) fetchTemplates();
    }, [isOpen, formData.channel]);

    const handleTemplateChange = (id) => {
        const template = templates.find(t => t.id === parseInt(id));
        setFormData({
            ...formData,
            templateId: id,
            message: template ? template.content : formData.message
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await sendBroadcast(formData);
            onSuccess?.(formData);
            onClose();
            setFormData({
                channel: 'WhatsApp',
                templateId: '',
                audience: 'All Members',
                message: ''
            });
        } catch (error) {
            console.error('Broadcast Error:', error);
            toast.error(error || 'Failed to send broadcast');
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
                form="broadcast-form"
                disabled={isSubmitting}
                className="drawer-btn drawer-btn-primary flex-[2]"
            >
                {isSubmitting ? 'Sending...' : 'Send Broadcast'}
            </button>
        </React.Fragment>
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Broadcast Message"
            subtitle="Reach your audience instantly"
            maxWidth="max-w-md"
            footer={footer}
        >
            <form id="broadcast-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="drawer-form-group">
                    <label className="drawer-label">
                        Broadcast Channel
                    </label>
                    <select
                        className="drawer-select"
                        value={formData.channel}
                        onChange={(e) => setFormData({ ...formData, channel: e.target.value, templateId: '' })}
                    >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="SMS">SMS</option>
                        <option value="Email">Email</option>
                        <option value="Push Notification">Push Notification</option>
                    </select>
                </div>

                <div className="drawer-form-group">
                    <label className="drawer-label">
                        Message Template (Optional)
                    </label>
                    <select
                        className="drawer-select"
                        value={formData.templateId}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                    >
                        <option value="">Select a saved template...</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div className="drawer-form-group">
                    <label className="drawer-label">
                        Target Audience
                    </label>
                    <select
                        className="drawer-select"
                        value={formData.audience}
                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    >
                        <option value="All Members">All Members</option>
                        <option value="Active Members">Active Members</option>
                        <option value="Expired Members">Expired Members</option>
                    </select>
                </div>

                <div className="drawer-form-group">
                    <label className="drawer-label">
                        Message Body *
                    </label>
                    <textarea
                        required
                        placeholder="Type your message here..."
                        className="drawer-textarea"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                    <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Use variables like <span className="text-primary">{"{{member_name}}"}</span>, <span className="text-primary">{"{{member_code}}"}</span>
                    </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                    <Info className="text-amber-500 shrink-0" size={18} />
                    <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase opacity-80">
                        Email requires a Resend API key. SMS and WhatsApp require respective configurations in Settings.
                    </p>
                </div>
            </form>
        </RightDrawer>
    );
};

export default BroadcastMessageDrawer;
