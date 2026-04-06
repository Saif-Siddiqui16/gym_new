import React, { useState } from 'react';
import { ChevronDown, Loader2, Megaphone, Zap, Users, Info } from 'lucide-react';
import { addAnnouncement } from '../../../api/communication/communicationApi';
import RightDrawer from '../../../components/common/RightDrawer';
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
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

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

    const InputLabel = ({ children }) => (
        <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>
            {children}
        </label>
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Create Announcement"
            subtitle="Broadcast a new message to your community"
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
                        form="announcement-form"
                        disabled={isSubmitting}
                        style={{
                            padding: '0 32px', height: 48, borderRadius: 14, border: 'none',
                            background: T.accent, color: '#fff', fontSize: 13, fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: '0.3s', boxShadow: T.shadow, display: 'flex', alignItems: 'center', gap: 10
                        }}
                        onMouseEnter={e => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { if(!isSubmitting) e.currentTarget.style.transform = 'none'; }}
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                        {isSubmitting ? 'Processing...' : 'Broadcast Now'}
                    </button>
                </div>
            }
        >
            <div style={{ padding: '32px 40px', background: T.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
                <style>{`
                    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .form-anim { animation: slideIn 0.4s ease-out backwards; }
                `}</style>
                
                <form id="announcement-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                    {/* Header Card */}
                    <div className="form-anim" style={{ background: '#fff', padding: 28, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 18, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                            <Megaphone size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Announcement Details</h3>
                            <p style={{ fontSize: 12, fontWeight: 500, color: T.muted, margin: '4px 0 0' }}>Define the message and target audience</p>
                        </div>
                    </div>

                    {/* Title Field */}
                    <div className="form-anim" style={{ animationDelay: '0.1s' }}>
                        <InputLabel>Announcement Title *</InputLabel>
                        <input
                            required
                            type="text"
                            placeholder="Brief catchy headline..."
                            style={{
                                width: '100%', height: 54, padding: '0 20px', borderRadius: 16, border: `2px solid ${T.border}`,
                                background: '#fff', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s'
                            }}
                            value={formData.title}
                            onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Content Field */}
                    <div className="form-anim" style={{ animationDelay: '0.2s' }}>
                        <InputLabel>Broadcast Message Content *</InputLabel>
                        <textarea
                            required
                            rows={6}
                            placeholder="Type your announcement here..."
                            style={{
                                width: '100%', padding: '20px', borderRadius: 20, border: `2px solid ${T.border}`,
                                background: '#fff', fontSize: 14, fontWeight: 600, color: T.text, outline: 'none', transition: '0.3s',
                                resize: 'none', lineHeight: 1.6
                            }}
                            onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    {/* Grid Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
                        <div className="form-anim" style={{ animationDelay: '0.3s' }}>
                            <InputLabel>Target Audience</InputLabel>
                            <div style={{ position: 'relative' }}>
                                <select
                                    style={{
                                        width: '100%', height: 54, padding: '0 44px 0 20px', borderRadius: 16, border: `2px solid ${T.border}`,
                                        background: '#fff', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s',
                                        appearance: 'none', cursor: 'pointer'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                >
                                    <option>All Members</option>
                                    <option>Active Members</option>
                                    <option>Expired Members</option>
                                    <option>Staff Only</option>
                                    <option>Trainers Only</option>
                                </select>
                                <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                                <Users size={18} style={{ position: 'absolute', right: 48, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none', opacity: 0.5 }} />
                            </div>
                        </div>

                        <div className="form-anim" style={{ animationDelay: '0.4s' }}>
                            <InputLabel>Priority (0-10)</InputLabel>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                style={{
                                    width: '100%', height: 54, padding: '0 20px', borderRadius: 16, border: `2px solid ${T.border}`,
                                    background: '#fff', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s'
                                }}
                                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="form-anim" style={{ animationDelay: '0.5s', display: 'flex', itemsCenter: 'center', justifyContent: 'space-between', padding: '24px 28px', background: 'linear-gradient(135deg, #fff, #F9F9FF)', border: `1px solid ${T.border}`, borderRadius: 24, boxShadow: T.cardShadow }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: formData.isActive ? T.greenLight : T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: formData.isActive ? T.green : T.accent }}>
                                <Info size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: 0 }}>Active Visibility</p>
                                <p style={{ fontSize: 11, fontWeight: 600, color: T.subtle, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Show this to members immediately</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                            style={{
                                position: 'relative', display: 'inline-flex', height: 28, width: 52, flexShrink: 0, cursor: 'pointer',
                                borderRadius: 100, border: '2px solid transparent', transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)', outline: 'none',
                                background: formData.isActive ? T.green : T.subtle
                            }}
                        >
                            <span
                                style={{
                                    pointerEvents: 'none', display: 'inline-block', height: 24, width: 24, transform: formData.isActive ? 'translateX(24px)' : 'translateX(0)',
                                    borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />
                        </button>
                    </div>

                </form>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            `}</style>
        </RightDrawer>
    );
};

export default AnnouncementFormDrawer;

