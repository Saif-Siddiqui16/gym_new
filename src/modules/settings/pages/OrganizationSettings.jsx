import React, { useState, useEffect } from 'react';
import { Building2, UploadCloud, Globe, DollarSign, Calendar, Save, Loader, Mail, Phone, MapPin, Sparkles, Image as ImageIcon } from 'lucide-react';
import { getTenantSettings, updateTenantSettings } from '../../../api/admin/settingsApi';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC',
  shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s ease' },
    input: { width: '100%', height: 48, borderRadius: 15, border: `2px solid ${T.bg}`, background: T.bg, padding: '0 20px 0 48px', fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: '0.3s', outline: 'none' },
    label: { display: 'block', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 4px' },
    icon: { position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: T.subtle }
};

const OrganizationSettings = ({ role }) => {
    const isManager = role === 'MANAGER';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', location: '', timezone: 'Asia/Kolkata', currency: 'INR', fiscalYearStart: 'April', referralReward: 500 });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getTenantSettings();
            setFormData({ name: data.name || '', phone: data.phone || '', email: data.email || '', location: data.location || '', timezone: data.timezone || 'Asia/Kolkata', currency: data.currency || 'INR', fiscalYearStart: data.fiscalYearStart || 'April', referralReward: data.referralReward || 500 });
            if (data.logo) setLogoPreview(data.logo);
        } catch (error) { toast.error('Failed to load settings'); } finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = { ...formData, referralReward: parseInt(formData.referralReward) };
            if (logoFile) payload.logo = logoFile;
            await updateTenantSettings(payload);
            toast.success('Brand identity synchronized');
        } catch (error) { toast.error('Check server logs'); } finally { setSaving(false); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogoFile(reader.result);
            reader.readAsDataURL(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    if (loading) return <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}><Loader className="animate-spin" style={{ color: T.accent }} size={40} /></div>;

    return (
        <div style={{ fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s }
            `}</style>

            {/* Premium Header Banner (Compact) */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: T.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 10px 25px -8px ${T.accent}80`
                    }}>
                        <Building2 size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>Brand Identity</h1>
                        <p style={{ margin: '4px 0 0', color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Manage your organizational signature and localization</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    style={{ 
                        height: 52, padding: '0 32px', borderRadius: 16, 
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accent3})`, 
                        color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, 
                        textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, 
                        boxShadow: `0 10px 25px -8px ${T.accent}80`, transition: '0.3s'
                    }}
                >
                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} strokeWidth={2.5} />} {saving ? 'Saving...' : 'Deploy Updates'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: 28, alignItems: 'start' }} className="fu1">
                {/* Logo Customization Card */}
                <div style={{ ...S.card, padding: 32, borderRadius: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><ImageIcon size={20} /></div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: '0 0 4px' }}>Network Logo</h3>
                    <p style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 28 }}>Appears on public interfaces</p>
                    
                    <div style={{ position: 'relative', width: 180, height: 180, borderRadius: 32, background: T.bg, border: `2px dashed ${T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 24, background: '#fff' }} />
                        ) : (
                            <>
                                <UploadCloud size={32} color={T.subtle} style={{ marginBottom: 12 }} />
                                <p style={{ fontSize: 12, fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase' }}>Upload</p>
                            </>
                        )}
                        <input type="file" accept="image/*" onChange={handleLogoChange} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    </div>
                    <div style={{ marginTop: 40, padding: '12px 24px', borderRadius: 14, background: T.bg, fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        2048 x 2048 MAX (PNG/STG)
                    </div>
                </div>

                {/* Organizational Structure Card */}
                <div style={{ ...S.card, padding: 40, borderRadius: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${T.border}` }}>
                         <div style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} /></div>
                         <div>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>Profile Matrix</h2>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core operational configuration</p>
                         </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div>
                            <label style={S.label}>Legal Hub Name</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={18} style={S.icon} />
                                <input type="text" name="name" value={formData.name} onChange={handleChange} style={S.input} placeholder="e.g. Roar Fitness Global" />
                            </div>
                        </div>
                        <div>
                            <label style={S.label}>Network Hotline</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={S.icon} />
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={S.input} placeholder="+91 XXXX XXX XXX" />
                            </div>
                        </div>
                        <div>
                            <label style={S.label}>Master Email Node</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={S.icon} />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} style={S.input} placeholder="hq@roarfitness.com" />
                            </div>
                        </div>
                        <div>
                            <label style={S.label}>Fiscal Year Baseline</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={S.icon} />
                                <select name="fiscalYearStart" value={formData.fiscalYearStart} onChange={handleChange} style={{ ...S.input, appearance: 'none' }}>
                                    <option value="April">April 01</option>
                                    <option value="January">January 01</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={S.label}>Headquarters Address</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} style={S.icon} />
                                <input type="text" name="location" value={formData.location} onChange={handleChange} style={{ ...S.input }} placeholder="Commercial Street, Main Hub, City" />
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={S.label}>Referral Rewards (Loyalty Points)</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={18} style={S.icon} />
                                <input type="number" name="referralReward" value={formData.referralReward} onChange={handleChange} style={S.input} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ height: 60 }} />
        </div>
    );
};

export default OrganizationSettings;
