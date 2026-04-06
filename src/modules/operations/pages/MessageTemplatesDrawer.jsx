import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, Smartphone, Copy, Check, Search, Plus, Loader2, ArrowLeft, MoreVertical, LayoutGrid } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import { fetchMessageTemplates } from '../../../api/communication/communicationApi';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../api/apiClient';
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

const MessageTemplatesDrawer = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('WhatsApp');
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [backendTemplates, setBackendTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form state for new template
    const [newTemplate, setNewTemplate] = useState({
        title: '',
        tag: 'General',
        body: '',
        channel: 'WhatsApp'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadTemplates();
        }
    }, [isOpen]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await fetchMessageTemplates({ branchId: user?.tenantId });
            setBackendTemplates(data || []);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await apiClient.post('/communication/templates', {
                ...newTemplate,
                channel: activeTab // Use currently active tab as channel
            });
            toast.success("Template created successfully!");
            setIsCreating(false);
            setNewTemplate({ title: '', tag: 'General', body: '', channel: 'WhatsApp' });
            loadTemplates();
        } catch (error) {
            toast.error("Failed to create template");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Template copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredTemplates = backendTemplates.filter(t =>
        t.channel === activeTab &&
        ((t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.content || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const InputLabel = ({ children }) => (
        <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>
            {children}
        </label>
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={isCreating ? "Design Template" : "Communication Assets"}
            subtitle={isCreating ? "Craft a reusable message block" : "Manage your high-fidelity message templates"}
            maxWidth="max-w-2xl"
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>
                <style>{`
                    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .anim { animation: slideIn 0.4s ease-out backwards; }
                    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                `}</style>

                {isCreating ? (
                    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 32, flex: 1, background: T.bg }}>
                        <button
                            onClick={() => setIsCreating(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                                color: T.accent, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer'
                            }}
                        >
                            <ArrowLeft size={14} strokeWidth={3} /> Return to Assets
                        </button>

                        <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="anim">
                            <div style={{ background: '#fff', padding: 28, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow }}>
                                <InputLabel>Template Designation</InputLabel>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Welcome Protocol Beta"
                                    style={{
                                        width: '100%', height: 48, padding: '0 20px', borderRadius: 14, border: `2px solid ${T.border}`,
                                        background: T.bg, fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.background = '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; }}
                                    value={newTemplate.title}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                                <div>
                                    <InputLabel>Category Tag</InputLabel>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            style={{
                                                width: '100%', height: 48, padding: '0 40px 0 20px', borderRadius: 14, border: `2px solid ${T.border}`,
                                                background: '#fff', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s',
                                                appearance: 'none', cursor: 'pointer'
                                            }}
                                            onFocus={e => { e.target.style.borderColor = T.accent; }}
                                            onBlur={e => { e.target.style.borderColor = T.border; }}
                                            value={newTemplate.tag}
                                            onChange={(e) => setNewTemplate({ ...newTemplate, tag: e.target.value })}
                                        >
                                            <option>General</option>
                                            <option>Welcome</option>
                                            <option>Reminder</option>
                                            <option>Promotion</option>
                                            <option>Followup</option>
                                        </select>
                                        <LayoutGrid size={16} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <InputLabel>Asset Content</InputLabel>
                                <textarea
                                    required
                                    rows={8}
                                    placeholder="Describe the interaction logic..."
                                    style={{
                                        width: '100%', padding: '24px', borderRadius: 20, border: `2px solid ${T.border}`,
                                        background: '#fff', fontSize: 14, fontWeight: 600, color: T.text, outline: 'none', transition: '0.3s',
                                        resize: 'none', lineHeight: 1.6
                                    }}
                                    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                                    value={newTemplate.body}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                                />
                                <p style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 12, marginLeft: 4 }}>
                                    Supported Tokens: {'{{name}}'}, {'{{member_id}}'}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%', height: 56, borderRadius: 16, border: 'none',
                                    background: T.accent, color: '#fff', fontSize: 14, fontWeight: 900, textTransform: 'uppercase',
                                    letterSpacing: '0.1em', cursor: submitting ? 'not-allowed' : 'pointer', transition: '0.3s',
                                    boxShadow: T.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
                                }}
                                onMouseEnter={e => { if(!submitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { if(!submitting) e.currentTarget.style.transform = 'none'; }}
                            >
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={3} />}
                                {submitting ? 'Archiving...' : 'Save Asset'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* Search and Tabs Header */}
                        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 32, background: '#fff', borderBottom: `1.5px solid ${T.border}`, flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                                        <MessageCircle size={24} strokeWidth={2.5} />
                                    </div>
                                    <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Template Library</h3>
                                </div>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', height: 44,
                                        background: T.accent, color: '#fff', border: 'none', borderRadius: 12,
                                        fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                                        cursor: 'pointer', transition: '0.3s', boxShadow: T.shadow
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                                >
                                    <Plus size={16} strokeWidth={3} /> Create
                                </button>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                                <input
                                    type="text"
                                    placeholder="Index search by name or logic..."
                                    style={{
                                        width: '100%', height: 50, padding: '0 20px 0 52px', borderRadius: 14, border: `2px solid ${T.border}`,
                                        background: T.bg, fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.background = '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg; }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', background: T.bg, padding: 6, borderRadius: 18, border: `1.5px solid ${T.border}` }}>
                                {[
                                    { name: 'WhatsApp', icon: MessageCircle },
                                    { name: 'SMS', icon: Smartphone },
                                    { name: 'Email', icon: Mail }
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.name;
                                    return (
                                        <button
                                            key={tab.name}
                                            onClick={() => setActiveTab(tab.name)}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1, height: 40,
                                                borderRadius: 14, border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
                                                letterSpacing: '0.05em', cursor: 'pointer', transition: '0.2s',
                                                background: isActive ? '#fff' : 'transparent',
                                                color: isActive ? T.accent : T.muted,
                                                boxShadow: isActive ? T.cardShadow : 'none'
                                            }}
                                        >
                                            <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                                            {tab.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Templates List */}
                        <div className="custom-scrollbar" style={{ flex: 1, padding: 40, display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
                            {loading ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                                    <Loader2 className="animate-spin" size={32} color={T.accent} />
                                    <p style={{ fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Syncing Library Assets...</p>
                                </div>
                            ) : filteredTemplates.length > 0 ? (
                                filteredTemplates.map((template, idx) => (
                                    <div 
                                        key={template.id} 
                                        className="anim" 
                                        style={{ 
                                            background: '#fff', borderRadius: 28, border: `1px solid ${T.border}`, padding: 28, 
                                            boxShadow: T.cardShadow, transition: '0.3s', animationDelay: `${idx * 0.05}s`,
                                            position: 'relative', overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `linear-gradient(135deg, ${T.accentLight}, transparent)`, borderRadius: '0 0 0 100%' }} />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <h4 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>{template.name}</h4>
                                                <span style={{ 
                                                    display: 'inline-block', width: 'fit-content', padding: '4px 12px', borderRadius: 8, 
                                                    background: template.category === 'Welcome' ? T.greenLight : template.category === 'Reminder' ? T.amberLight : T.accentLight,
                                                    color: template.category === 'Welcome' ? T.green : template.category === 'Reminder' ? T.amber : T.accent,
                                                    fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em'
                                                }}>
                                                    {template.category || 'General'}
                                                </span>
                                            </div>
                                            <button style={{ width: 32, height: 32, borderRadius: 10, background: T.bg, border: 'none', color: T.subtle, cursor: 'pointer' }}><MoreVertical size={16} /></button>
                                        </div>

                                        <div style={{ background: T.bg, padding: 20, borderRadius: 16, border: `1px solid ${T.border}`, marginBottom: 24 }}>
                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: T.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                                {template.content}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleCopy(template.content, template.id)}
                                            style={{
                                                width: '100%', height: 50, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                                fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: '0.3s',
                                                background: copiedId === template.id ? T.green : '#fff',
                                                color: copiedId === template.id ? '#fff' : T.text,
                                                border: copiedId === template.id ? 'none' : `2px solid ${T.border}`,
                                                boxShadow: copiedId === template.id ? '0 8px 16px rgba(34, 201, 122, 0.2)' : 'none'
                                            }}
                                            onMouseEnter={e => { if(copiedId !== template.id) e.currentTarget.style.borderColor = T.accent; }}
                                            onMouseLeave={e => { if(copiedId !== template.id) e.currentTarget.style.borderColor = T.border; }}
                                        >
                                            {copiedId === template.id ? <Check size={18} strokeWidth={3} /> : <Copy size={16} />}
                                            {copiedId === template.id ? 'Asset Copied' : 'Copy Template'}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div style={{ height: '60%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 30, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, boxShadow: T.cardShadow }}>
                                        <Search size={32} />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h5 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: 0 }}>No Assets Found</h5>
                                        <p style={{ fontSize: 12, fontWeight: 500, color: T.muted, margin: '4px 0 0' }}>Initialize your first {activeTab} protocol</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </RightDrawer>
    );
};

export default MessageTemplatesDrawer;

