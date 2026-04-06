import React, { useState, useEffect } from 'react';
import { ChevronDown, Info, Send, Loader2, MessageSquare, Radio, Users, ShieldAlert } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import { fetchMessageTemplates, sendBroadcastMessage } from '../../../api/communication/communicationApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        
  accent2: '#9B7BFF',       
  accentLight: '#F0ECFF',   
  accentMid: '#E4DCFF',     
  border: '#EAE7FF',        
  bg: '#F6F5FF',            
  surface: '#FFFFFF',       
  text: '#1A1533',          
  muted: '#7B7A8E',         
  subtle: '#B0ADCC',        
  green: '#22C97A',         
  greenLight: '#E8FBF2',
  amber: '#F59E0B',         
  amberLight: '#FEF3C7',
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

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

    const InputLabel = ({ children }) => (
        <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>
            {children}
        </label>
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Broadcast Message"
            subtitle="Engage your members across multiple channels"
            maxWidth="max-w-2xl"
            footer={
                <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-end', padding: '0 8px' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '0 24px', height: 48, borderRadius: 14, border: `2px solid ${T.border}`,
                            background: '#fff', color: T.text, fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: '0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.bg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="broadcast-form"
                        disabled={isSubmitting}
                        style={{
                            padding: '0 32px', height: 48, borderRadius: 14, border: 'none',
                            background: T.accent, color: '#fff', fontSize: 13, fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: '0.3s', boxShadow: T.shadow, display: 'flex', alignItems: 'center', gap: 10
                        }}
                        onMouseEnter={e => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { if(!isSubmitting) e.currentTarget.style.transform = 'none'; }}
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                        {isSubmitting ? 'Sending...' : 'Dispatch Broadcast'}
                    </button>
                </div>
            }
        >
            <div className="custom-scrollbar" style={{ padding: '32px 40px', background: T.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
                <style>{`
                    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .form-anim { animation: slideIn 0.4s ease-out backwards; }
                    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                `}</style>

                <form id="broadcast-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
                    
                    {/* Channel Selector */}
                    <div className="form-anim" style={{ background: '#fff', padding: 28, borderRadius: 28, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ width: 60, height: 60, borderRadius: 20, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                            <Radio size={28} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InputLabel>Communication Channel</InputLabel>
                            <div style={{ position: 'relative' }}>
                                <select
                                    style={{
                                        width: '100%', height: 48, padding: '0 20px', borderRadius: 14, border: `2px solid ${T.border}`,
                                        background: T.bg, fontSize: 13, fontWeight: 800, color: T.text, outline: 'none', transition: '0.3s',
                                        appearance: 'none', cursor: 'pointer'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.background = '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; }}
                                    value={formData.channel}
                                    onChange={(e) => setFormData({ ...formData, channel: e.target.value, templateId: '' })}
                                >
                                    <option value="WhatsApp">WhatsApp Business</option>
                                    <option value="SMS">Standard SMS</option>
                                    <option value="Email">Professional Email</option>
                                </select>
                                <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                            </div>
                        </div>
                    </div>

                    {/* Multi-Field Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div className="form-anim" style={{ animationDelay: '0.1s' }}>
                            <InputLabel>Audience Tier</InputLabel>
                            <div style={{ position: 'relative' }}>
                                <select
                                    style={{
                                        width: '100%', height: 54, padding: '0 44px 0 20px', borderRadius: 16, border: `2px solid ${T.border}`,
                                        background: '#fff', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s',
                                        appearance: 'none', cursor: 'pointer'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                                    value={formData.audience}
                                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                >
                                    <option value="All Members">All Active Sync</option>
                                    <option value="Active Members">Premium Members</option>
                                    <option value="Expired Members">Lapsed Leads</option>
                                    <option value="Staff">Operations Staff</option>
                                </select>
                                <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                                <Users size={18} style={{ position: 'absolute', right: 48, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none', opacity: 0.5 }} />
                            </div>
                        </div>

                        <div className="form-anim" style={{ animationDelay: '0.2s' }}>
                            <InputLabel>Template Logic {loadingTemplates && <Loader2 size={12} className="inline animate-spin ml-2" />}</InputLabel>
                            <div style={{ position: 'relative' }}>
                                <select
                                    style={{
                                        width: '100%', height: 54, padding: '0 44px 0 20px', borderRadius: 16, border: `2px solid ${T.border}`,
                                        background: '#fff', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s',
                                        appearance: 'none', cursor: 'pointer'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                                    value={formData.templateId}
                                    onChange={handleTemplateChange}
                                >
                                    <option value="">Start from scratch...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                                <MessageSquare size={18} style={{ position: 'absolute', right: 48, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none', opacity: 0.5 }} />
                            </div>
                        </div>
                    </div>

                    {/* Message Box */}
                    <div className="form-anim" style={{ animationDelay: '0.3s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <InputLabel>Draft Message *</InputLabel>
                            <span style={{ fontSize: 9, fontWeight: 900, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Personalization Enabled</span>
                        </div>
                        <textarea
                            required
                            rows={8}
                            placeholder="Type your message here... Use {{member_name}} for dynamic insertion."
                            style={{
                                width: '100%', padding: '24px', borderRadius: 24, border: `2px solid ${T.border}`,
                                background: '#fff', fontSize: 14, fontWeight: 600, color: T.text, outline: 'none', transition: '0.3s',
                                resize: 'none', lineHeight: 1.6, boxShadow: T.cardShadow
                            }}
                            onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 6px ${T.accentLight}`; }}
                            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                            {['{{member_name}}', '{{member_id}}', '{{expiry_date}}'].map(tag => (
                                <button key={tag} type="button" onClick={() => setFormData({...formData, message: formData.message + tag})} style={{ padding: '6px 12px', background: T.accentLight, color: T.accent, border: 'none', borderRadius: 10, fontSize: 10, fontWeight: 800, cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = T.accentMid} onMouseLeave={e => e.currentTarget.style.background = T.accentLight}>{tag}</button>
                            ))}
                        </div>
                    </div>

                    {/* Info Notice */}
                    <div className="form-anim" style={{ animationDelay: '0.4s', p: 24, background: '#fff', borderRadius: 24, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'flex-start', gap: 16, padding: 24 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: T.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.amber, flexShrink: 0 }}>
                            <ShieldAlert size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: 0 }}>Regulatory Compliance</h4>
                            <p style={{ fontSize: 12, fontWeight: 500, color: T.muted, margin: '4px 0 0', lineHeight: 1.5 }}>
                                Ensure your message follows anti-spam regulations. Standard carrier rates may apply for SMS/WhatsApp services. 
                                Broadcast performance can be monitored in the <b>Communications Ledger</b>.
                            </p>
                        </div>
                    </div>

                </form>
            </div>
        </RightDrawer>
    );
};

export default BroadcastMessageDrawer;

