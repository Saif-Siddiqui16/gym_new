import React, { useState, useEffect } from 'react';
import { Building2, UploadCloud, Globe, DollarSign, Calendar, Save, Loader } from 'lucide-react';
import { getTenantSettings, updateTenantSettings } from '../../../api/admin/settingsApi';
import { toast } from 'react-hot-toast';

const OrganizationSettings = ({ role }) => {
    const isManager = role === 'MANAGER';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        location: '',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        fiscalYearStart: 'April',
        referralReward: 500
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getTenantSettings();
            setFormData({
                name: data.name || '',
                phone: data.phone || '',
                email: data.email || '',
                location: data.location || '',
                timezone: data.timezone || 'Asia/Kolkata',
                currency: data.currency || 'INR',
                fiscalYearStart: data.fiscalYearStart || 'April',
                referralReward: data.referralReward || 500
            });
            if (data.logo) {
                setLogoPreview(data.logo);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                location: formData.location,
                timezone: formData.timezone,
                currency: formData.currency,
                fiscalYearStart: formData.fiscalYearStart,
                referralReward: parseInt(formData.referralReward)
            };
            if (logoFile) {
                payload.logo = logoFile;
            }

            await updateTenantSettings(payload);
            toast.success('Organization settings updated successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoFile(reader.result);
            };
            reader.readAsDataURL(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    const T = {
        accent: '#7C5CFC', accentLight: '#F0ECFF', border: '#EAE7FF', bg: '#F6F5FF', 
        surface: '#FFFFFF', text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC'
    };

    const S = {
        ff: "'Plus Jakarta Sans', sans-serif",
        card: { background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08)', padding: '32px' },
        btn: { height: '48px', padding: '0 24px', borderRadius: '14px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.2s', background: T.accent, color: '#fff' },
        input: { width: '100%', height: '48px', borderRadius: '14px', border: `2px solid ${T.border}`, background: T.bg, padding: '0 16px 0 44px', fontSize: '13px', fontWeight: '700', color: T.text, outline: 'none' },
        label: { display: 'block', fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 4px' },
        icon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: T.subtle }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <Loader className="animate-spin text-primary" size={40} color={T.accent} />
            </div>
        );
    }

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
            
            <div style={{ ...S.card, marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                     <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.accent, margin: 0 }}>Organization Settings</h1>
                     <p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Manage your brand identity and global localization</p>
                </div>
                <button onClick={handleSave} disabled={saving} style={S.btn}>
                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} Save Brand Identity
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '24px', alignItems: 'start' }}>
                {/* Logo Card */}
                <div style={{ ...S.card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: '0 0 4px 0' }}>Brand Logo</h3>
                    <p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Appears on public website</p>
                    
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '20px', border: `2px dashed ${T.border}`, background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '16px', background: '#fff' }} />
                        ) : (
                            <>
                                <div style={{ width: '48px', height: '48px', background: T.surface, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: `1px solid ${T.border}` }}><UploadCloud color={T.subtle} size={24} /></div>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Logo</p>
                                <p style={{ fontSize: '9px', fontWeight: '800', color: T.subtle, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>JPG, PNG up to 2MB</p>
                            </>
                        )}
                        <input type="file" accept="image/*" onChange={handleLogoChange} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    </div>
                </div>

                {/* Info Card */}
                <div style={{ ...S.card }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: T.bg, color: T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={24} />
                        </div>
                        <div>
                             <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>Organization Profile</h3>
                             <p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Core business details</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
                        <div>
                            <label style={S.label}>Legal Organization Name</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={16} style={S.icon} />
                                <input type="text" name="name" value={formData.name} onChange={handleChange} style={S.input} />
                            </div>
                        </div>
                        <div>
                            <label style={S.label}>Public Phone</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={16} style={S.icon} />
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={S.input} />
                            </div>
                        </div>
                        <div>
                            <label style={S.label}>Public Email</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={16} style={S.icon} />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} style={S.input} />
                            </div>
                        </div>
                        <div>
                            <label style={S.label}>Fiscal Year Start</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={S.icon} />
                                <select name="fiscalYearStart" value={formData.fiscalYearStart} onChange={handleChange} style={{ ...S.input, appearance: 'none' }}>
                                    <option value="April">April</option>
                                    <option value="January">January</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={S.label}>Business Address</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={16} style={S.icon} />
                                <input type="text" name="location" value={formData.location} onChange={handleChange} style={S.input} />
                            </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={S.label}>Referral Reward (Points)</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={16} style={S.icon} />
                                <input type="number" name="referralReward" value={formData.referralReward} onChange={handleChange} style={S.input} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationSettings;
