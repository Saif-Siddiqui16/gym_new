import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Building2, Mail, Phone, MapPin, DollarSign, Sparkles, Server, ArrowRight, Settings, ShieldCheck } from 'lucide-react';
import { fetchGlobalSettings, updateGlobalSettings } from '../../api/superadmin/superAdminApi';
import { toast } from 'react-hot-toast';

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
  rose: '#F43F5E',          
  roseLight: '#FFF1F4',
  blue: '#3B82F6',          
  blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const SectionHead = ({ title, sub }) => (
    <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.3px' }}>{title}</h3>
        {sub && <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, margin: '2px 0 0' }}>{sub}</p>}
    </div>
);

const Field = ({ label, icon: Icon, children, error }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 2 }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }}>
                <Icon size={16} strokeWidth={2.2} />
            </div>
            {children}
        </div>
        {error && <p style={{ fontSize: 10, color: T.rose, fontWeight: 600, margin: '2px 0 0 2px' }}>{error}</p>}
    </div>
);

const FocusInput = (props) => {
    const [focused, setFocused] = useState(false);
    return (
        <input 
            {...props}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            style={{
                width: '100%', height: 44, padding: '0 14px 0 42px', background: T.surface,
                border: `1px solid ${focused ? T.accent : T.border}`, borderRadius: 12,
                fontSize: 13, fontWeight: 600, color: T.text, outline: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: focused ? `0 0 0 4px ${T.accentLight}` : 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
        />
    );
};

const FocusTextarea = (props) => {
    const [focused, setFocused] = useState(false);
    return (
        <textarea 
            {...props}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            style={{
                width: '100%', padding: '12px 14px 12px 42px', background: T.surface,
                border: `1px solid ${focused ? T.accent : T.border}`, borderRadius: 12,
                fontSize: 13, fontWeight: 600, color: T.text, outline: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: focused ? `0 0 0 4px ${T.accentLight}` : 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif", resize: 'none'
            }}
        />
    );
};

const ConfigLink = ({ title, sub, icon: Icon, onClick }) => {
    const [hover, setHover] = useState(false);
    return (
        <button 
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: T.surface,
                border: `1px solid ${hover ? T.accentMid : T.border}`, borderRadius: 16, cursor: 'pointer',
                transition: '0.2s', textAlign: 'left', flex: 1, minWidth: 240,
                boxShadow: hover ? '0 8px 24px rgba(124,92,252,0.1)' : '0 2px 8px rgba(0,0,0,0.02)'
            }}
        >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: hover ? T.accentLight : T.bg, color: hover ? T.accent : T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
                <Icon size={20} strokeWidth={2.2} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{title}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>{sub}</div>
            </div>
            <ArrowRight size={14} color={hover ? T.accent : T.subtle} style={{ transform: hover ? 'translateX(4px)' : 'none', transition: '0.2s' }} />
        </button>
    );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const GeneralSettings = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ orgName: '', address: '', email: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await fetchGlobalSettings();
            setFormData({ orgName: data.siteName, address: data.contactAddress, email: data.supportEmail, phone: data.contactPhone });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateGlobalSettings({ siteName: formData.orgName, contactAddress: formData.address, supportEmail: formData.email, contactPhone: formData.phone });
            toast.success('Settings updated successfully');
            navigate('/dashboard');
        } catch (e) { toast.error('Failed to update settings'); }
        finally { setSaving(false); }
    };

    if (loading) {
        return (
            <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Loading settings…</p>
            </div>
        );
    }

    return (
        <div style={{
            background: T.bg, minHeight: '100vh', padding: '28px 28px 48px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", animation: 'fadeUp 0.38s ease both'
        }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 16px 18px !important; }
                    .config-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            {/* ──────── HEADER BANNER ──────── */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 20, padding: '20px 26px', boxShadow: '0 8px 32px rgba(124,92,252,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, position: 'relative'
            }} className="header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
                    }}>
                        <Settings size={26} color="#fff" strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Global Settings</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500 }}>System-wide parameters & organization profile</p>
                    </div>
                </div>
                <button 
                     onClick={handleSave}
                     disabled={saving}
                     style={{
                        background: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, color: T.accent, fontSize: 13, fontWeight: 800,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        opacity: saving ? 0.7 : 1
                     }}
                >
                    <Save size={16} strokeWidth={2.5} /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {/* ──────── FORM SECTION ──────── */}
            <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: '28px', boxShadow: '0 4px 16px rgba(124,92,252,0.04)', marginBottom: 24 }}>
                <SectionHead title="Business Information" sub="Standardize your company branding and contact details" />
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <Field label="Company Name" icon={Building2}>
                        <FocusInput 
                            placeholder="Roar Fitness Pvt Ltd" 
                            value={formData.orgName} 
                            onChange={e => setFormData(p => ({ ...p, orgName: e.target.value }))} 
                        />
                    </Field>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Company Address" icon={MapPin}>
                            <FocusTextarea 
                                placeholder="Plot 42, Silicon Valley, Cyber City..." 
                                rows={3}
                                value={formData.address}
                                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                            />
                        </Field>
                    </div>

                    <Field label="Support Email" icon={Mail}>
                        <FocusInput 
                            placeholder="admin@roarfitness.com" 
                            value={formData.email}
                            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        />
                    </Field>

                    <Field label="Contact Phone" icon={Phone}>
                        <FocusInput 
                            placeholder="+91 90000 00000" 
                            value={formData.phone}
                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        />
                    </Field>
                </div>
            </div>

            {/* ──────── QUICK NAV ──────── */}
            <h4 style={{ fontSize: 11, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 16px 4px' }}>More Settings</h4>
            <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <ConfigLink 
                    title="Booking Settings" 
                    sub="Manage session limits & rules" 
                    icon={Sparkles} 
                    onClick={() => navigate('/superadmin/general-settings/booking')} 
                />
                <ConfigLink 
                    title="Invoice Settings" 
                    sub="Taxes, Billing & GST" 
                    icon={DollarSign} 
                    onClick={() => navigate('/superadmin/general-settings/invoice')} 
                />
                <ConfigLink 
                    title="Hardware Settings" 
                    sub="Biometrics & Webhooks" 
                    icon={Server} 
                    onClick={() => navigate('/superadmin/general-settings/hardware')} 
                />
            </div>
            
            <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 16, background: T.blueLight, border: `1px solid ${T.blue}20`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShieldCheck size={20} color={T.blue} strokeWidth={2.5} />
                <p style={{ fontSize: 12, fontWeight: 600, color: T.blue, margin: 0 }}>Configuration changes are applied across all branches automatically.</p>
            </div>
        </div>
    );
};

export default GeneralSettings;
