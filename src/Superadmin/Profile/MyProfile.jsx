import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Shield, Bell, Save, Loader, Key, X, Lock, Activity, Calendar, CheckCircle2, Headset, Sparkles, ChevronRight, Hash } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { toast } from 'react-hot-toast';
import { fetchAdminProfile, updateAdminProfile, fetchGlobalSettings, updateGlobalSettings } from '../../api/superadmin/superAdminApi';
import NotificationsList from '../../components/notifications/NotificationsList';

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF',
  text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC',
  green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4',
  amber: '#F59E0B', amberLight: '#FEF3C7',
};

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [globalSettings, setGlobalSettings] = useState({ supportNumber: '' });
    const [isSavingSupport, setIsSavingSupport] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', avatar: '' });

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const [profileData, settingsData] = await Promise.all([ fetchAdminProfile(), fetchGlobalSettings() ]);
            setProfile(profileData);
            setGlobalSettings({ supportNumber: settingsData.supportNumber || '' });
            setFormData({ name: profileData.name, email: profileData.email, phone: profileData.phone, address: profileData.address || '', avatar: profileData.avatar || '' });
        } catch (error) { console.error(error); toast.error("Profile Link Severed"); }
        finally { setLoading(false); }
    };

    const handleInputChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            const updated = await updateAdminProfile(formData);
            setProfile(updated);
            toast.success('Core Identity Updated');
        } catch (error) { toast.error('Update Failed'); }
        finally { setIsSaving(true); setIsSaving(false); }
    };

    const handleSaveSupport = async (e) => {
        if (e) e.preventDefault();
        setIsSavingSupport(true);
        try {
            await updateGlobalSettings(globalSettings);
            toast.success('Support Channel Verified');
        } catch (error) { toast.error('Sync Interrupted'); }
        finally { setIsSavingSupport(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error("Hash Mismatch!"); return; }
        setIsChangingPassword(true);
        try {
            await apiClient.post('/auth/change-password', { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
            toast.success("Security Hash Rotated");
            setIsPasswordModalOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) { toast.error(error.response?.data?.message || "Encryption Fault"); }
        finally { setIsChangingPassword(false); }
    };

    const inputStyle = (type) => ({
        width: '100%', padding: '12px 16px 12px 44px', background: T.bg, border: `1.5px solid ${T.border}`,
        borderRadius: '14px', fontSize: '14px', fontWeight: 700, color: T.text, outline: 'none', transition: '0.2s',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    });

    if (loading) {
        return (
            <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            </div>
        );
    }

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'support', label: 'Support', icon: Headset },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
            `}</style>

            <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
                
                {/* ──────── PROFILE HEADER ──────── */}
                <div style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 8px 32px rgba(124,92,252,0.06)', marginBottom: 32 }}>
                    <div style={{ height: '140px', background: 'linear-gradient(135deg, #1A1533 0%, #2D274D 55%, #3F396D 100%)', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 40, background: `linear-gradient(to top, ${T.surface}, transparent)` }} />
                    </div>
                    
                    <div style={{ padding: '0 40px 32px', marginTop: '-60px', position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 28 }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: 140, height: 140, borderRadius: 32, background: T.surface, padding: 6, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: 26, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 48, fontWeight: 900 }}>
                                    {formData.avatar ? <img src={formData.avatar} style={{ width: '100%', height: '100%', objectCover: 'cover' }} /> : (profile?.name?.charAt(0) || 'A')}
                                </div>
                            </div>
                            <label style={{ position: 'absolute', bottom: -4, right: -4, width: 44, height: 44, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: T.accent }}>
                                <Camera size={18} strokeWidth={2.5} />
                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        
                        <div style={{ flex: 1, paddingBottom: 10 }}>
                            <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-1px' }}>{profile.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                                <span style={{ fontSize: 9, fontWeight: 900, background: T.accentLight, color: T.accent, padding: '5px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{profile.role.replace('_', ' ')}</span>
                                <span style={{ fontSize: 9, fontWeight: 900, background: T.greenLight, color: T.green, padding: '5px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.green }} /> ACTIVE
                                </span>
                            </div>
                        </div>

                        <div style={{ paddingBottom: 10 }}>
                            <div style={{ background: T.bg, padding: '12px 24px', borderRadius: 16, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <CheckCircle2 size={18} color={T.green} strokeWidth={3} />
                                <span style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: '0.02em' }}>IDENTITY VERIFIED</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32 }}>
                    
                    {/* ──────── TABS ──────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                                    borderRadius: 18, background: isActive ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : 'transparent',
                                    border: isActive ? 'none' : `1.5px solid transparent`,
                                    color: isActive ? '#fff' : T.muted, textAlign: 'left', cursor: 'pointer', transition: '0.2s',
                                    fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em'
                                }}
                                    onMouseEnter={e => { if(!isActive) { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; } }}
                                    onMouseLeave={e => { if(!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = T.muted; } }}
                                >
                                    <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ──────── TAB CONTENT ──────── */}
                    <div style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, padding: '40px', boxShadow: '0 8px 32px rgba(124,92,252,0.04)' }}>
                        
                        {activeTab === 'personal' && (
                            <form onSubmit={handleSave} style={{ animation: 'fadeUp 0.3s forwards' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 16, borderBottom: `1.5px solid ${T.bg}` }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} strokeWidth={2.5} /></div>
                                    <h2 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Personal Information</h2>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                            <input name="name" value={formData.name} onChange={handleInputChange} style={inputStyle()} placeholder="Full Name" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle()} placeholder="admin@domain.com" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                            <input name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle()} placeholder="+91 00000 00000" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Location</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                            <input name="address" value={formData.address} onChange={handleInputChange} style={inputStyle()} placeholder="Location" />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1.5px solid ${T.bg}`, textAlign: 'right' }}>
                                    <button type="submit" disabled={isSaving} style={{ padding: '14px 44px', borderRadius: 14, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: '#fff', border: 'none', fontSize: 13, fontWeight: 900, cursor: 'pointer', transition: '0.2s', boxShadow: `0 8px 24px rgba(124,92,252,0.3)` }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                        {isSaving ? 'Saving...' : 'SAVE CHANGES'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'support' && (
                            <form onSubmit={handleSaveSupport} style={{ animation: 'fadeUp 0.3s forwards' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 16, borderBottom: `1.5px solid ${T.bg}` }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.amberLight, color: T.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Headset size={20} strokeWidth={2.5} /></div>
                                    <h2 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Support Settings</h2>
                                </div>
                                <p style={{ fontSize: 12, fontWeight: 600, color: T.muted, lineHeight: 1.6, marginBottom: 24 }}>This support number will be shown to users when their account is suspended.</p>
                                
                                <div style={{ maxWidth: 440 }}>
                                    <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Support Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Hash size={18} color={T.amber} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                                        <input value={globalSettings.supportNumber} onChange={e => setGlobalSettings({ ...globalSettings, supportNumber: e.target.value })} style={inputStyle()} placeholder="+91 12345 67890" />
                                    </div>
                                </div>

                                <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1.5px solid ${T.bg}`, textAlign: 'right' }}>
                                    <button type="submit" disabled={isSavingSupport} style={{ padding: '14px 44px', borderRadius: 14, background: T.amber, color: '#fff', border: 'none', fontSize: 13, fontWeight: 900, cursor: 'pointer', transition: '0.2s', boxShadow: `0 8px 24px rgba(245,158,11,0.3)` }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                        {isSavingSupport ? 'Saving...' : 'SAVE SUPPORT'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <div style={{ animation: 'fadeUp 0.3s forwards' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 16, borderBottom: `1.5px solid ${T.bg}` }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.roseLight, color: T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={20} strokeWidth={2.5} /></div>
                                    <h2 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Security Settings</h2>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                                    <div style={{ background: T.roseLight + '40', border: `1.5px solid ${T.roseLight}`, borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: `1px solid ${T.roseLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.rose }}><Key size={22} strokeWidth={2.5} /></div>
                                            <div>
                                                <h4 style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: 0 }}>Change Password</h4>
                                                <p style={{ fontSize: 11, fontWeight: 600, color: T.muted, margin: '2px 0 0' }}>Update your account password</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsPasswordModalOpen(true)} style={{ padding: '10px 20px', borderRadius: 12, border: `1.5px solid ${T.rose}30`, background: '#fff', color: T.rose, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = T.rose; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = T.rose; }}>UPDATE PASSWORD</button>
                                    </div>
                                    <div style={{ background: T.bg, borderRadius: 20, padding: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}><Shield size={22} strokeWidth={2.5} /></div>
                                        <div>
                                            <h4 style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: 0 }}>2FA Authentication</h4>
                                            <p style={{ fontSize: 11, fontWeight: 600, color: T.muted, margin: '2px 0 0' }}>Two-factor authentication is active</p>
                                        </div>
                                        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 900, background: T.greenLight, color: T.green, padding: '4px 10px', borderRadius: 8 }}>ENABLED</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div style={{ animation: 'fadeUp 0.3s forwards' }}>
                                <NotificationsList />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ──────── PASSWORD MODAL ──────── */}
            {isPasswordModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000001, background: 'rgba(13,10,31,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: T.surface, width: '100%', maxWidth: 440, borderRadius: 28, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', animation: 'fadeUp 0.3s ease both' }}>
                        <div style={{ padding: '24px 32px', background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Change Password</h3>
                            <button onClick={() => setIsPasswordModalOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', width: 32, height: 32, borderRadius: 10, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} strokeWidth={2.5} /></button>
                        </div>
                        <form onSubmit={handlePasswordChange} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>Current Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} style={inputStyle()} placeholder="Enter current password" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input type="password" required value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} style={inputStyle()} placeholder="Enter new password" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Shield size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input type="password" required value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} style={inputStyle()} placeholder="Confirm new password" />
                                </div>
                            </div>
                            <button type="submit" disabled={isChangingPassword} style={{ marginTop: 10, padding: '14px', borderRadius: '16px', background: T.accent, color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: '0.2s', boxShadow: `0 8px 24px ${T.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                {isChangingPassword ? <Loader size={18} className="animate-spin" /> : <><Save size={18} strokeWidth={2.5} /> SAVE PASSWORD</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
