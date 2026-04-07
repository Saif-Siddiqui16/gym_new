import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, Bell, CheckCircle2, Camera, MapPin, Calendar, Activity, X, Key, Loader, Save, RefreshCw } from 'lucide-react';
import { fetchManagerProfile, updateManagerProfile } from '../../api/manager/managerApi';
import { useAuth } from '../../context/AuthContext';
import NotificationsList from '../../components/notifications/NotificationsList';
import apiClient from '../../api/apiClient';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4',
  shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s ease' },
    input: { width: '100%', height: 48, borderRadius: 16, border: `2.5px solid ${T.bg}`, background: T.bg, padding: '0 20px 0 46px', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    label: { display: 'block', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', marginLeft: '4px' },
    icon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: T.subtle },
    btn: { height: 48, padding: '0 28px', borderRadius: 14, background: `linear-gradient(135deg, ${T.accent}, ${T.accent3})`, color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 10px 25px -8px ${T.accent}80` }
};

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', avatar: '' });
    const { login: updateAuthUser } = useAuth();

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await fetchManagerProfile();
            setProfile(data);
            setFormData({
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address || '',
                avatar: data.avatar || ''
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to synchronize identity profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const updated = await updateManagerProfile(formData);
            setProfile(updated);
            updateAuthUser({ ...JSON.parse(localStorage.getItem('userData')), name: updated.name, phone: updated.phone, avatar: updated.avatar });
            toast.success("Identity Matrix Updated!");
            setMessage({ type: 'success', text: 'Identity synchronized successfully!' });
        } catch (error) {
            toast.error("Critical Failure: Sync Refused");
            setMessage({ type: 'error', text: 'Failed to update identity protocols.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error("Key mismatch detected.");
        if (passwordData.newPassword.length < 8) return toast.error("Security violation: Key too simple.");
        setIsChangingPassword(true);
        try {
            await apiClient.post('/auth/change-password', { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
            toast.success("Security keys rotated!");
            setIsPasswordModalOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to rotate security keys.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <Loader className="animate-spin" style={{ color: T.accent }} size={32} />
        </div>
    );

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.15s }
                input::placeholder { color: ${T.subtle}; opacity: 0.8; }
            `}</style>

            {/* Premium Header Banner (White Aesthetic) */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: 100, height: 100, borderRadius: 24, background: T.bg, padding: 3, border: `1px solid ${T.border}`, boxShadow: T.cardShadow }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: 20, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 32, fontWeight: 900 }}>
                                {formData.avatar || profile.avatar ? (
                                    <img src={formData.avatar || profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (profile.name?.charAt(0).toUpperCase())}
                            </div>
                        </div>
                        <label style={{ position: 'absolute', bottom: -6, right: -6, width: 36, height: 36, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, boxShadow: '0 6px 15px rgba(0,0,0,0.1)', cursor: 'pointer', border: `1px solid ${T.border}` }}>
                            <Camera size={16} strokeWidth={2.5} />
                            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                    
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: '0 0 6px 0', letterSpacing: '-1.2px' }}>{profile.name}</h1>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <span style={{ padding: '4px 12px', background: T.accentLight, color: T.accent, borderRadius: 10, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{profile.role?.replace('_', ' ')}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: T.green }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} /> {profile.status}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: T.subtle }}>
                                <Calendar size={14} opacity={0.6} /> Manifested {profile.joinedDate}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ padding: '10px 20px', background: T.greenLight, color: T.green, borderRadius: 14, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={16} strokeWidth={2.5} /> Operational Status: Active
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }} className="fu1">
                {/* Lateral Tab Matrix */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                height: 52, padding: '0 20px', borderRadius: 16, border: 'none', 
                                display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                                background: activeTab === tab.id ? T.accent : '#fff', 
                                color: activeTab === tab.id ? '#FFF' : T.muted,
                                border: activeTab === tab.id ? 'none' : `1px solid ${T.border}`,
                                boxShadow: activeTab === tab.id ? `0 10px 25px -8px ${T.accent}80` : T.cardShadow,
                                transition: '0.3s'
                            }}
                        >
                            <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Identity Matrix */}
                <div style={{ ...S.card, padding: 32 }}>
                    {message.text && (
                        <div style={{ padding: '16px 20px', borderRadius: 16, marginBottom: 28, backgroundColor: message.type === 'success' ? T.greenLight : T.roseLight, color: message.type === 'success' ? T.green : T.rose, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Activity size={18} /> {message.text}
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div>
                                <label style={S.label}>Functional Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={S.icon} />
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={S.input} />
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>Communications (Email)</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={S.icon} />
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={S.input} />
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>Contact Protocol (Phone)</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={S.icon} />
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={S.input} />
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>Physical Matrix (Location)</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} style={S.icon} />
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} style={S.input} />
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
                                <button type="submit" disabled={isSaving} style={S.btn}>
                                    {isSaving ? <Loader size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />} Sync Identity
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={22} /></div>
                                <div>
                                     <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>Authentication Hardening</h2>
                                     <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Manage secure access protocols</p>
                                </div>
                            </div>

                            <div style={{ background: T.roseLight, border: `1px solid ${T.rose}20`, padding: 24, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: 14, fontWeight: 900, color: T.rose, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={16} /> Key Rotation (Password)</h4>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, margin: 0, opacity: 0.8 }}>Update your security keys frequently for maximum hardening.</p>
                                </div>
                                <button onClick={() => setIsPasswordModalOpen(true)} style={{ height: 44, padding: '0 20px', borderRadius: 12, background: T.rose, color: '#FFF', border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 8px 20px -6px ${T.rose}60` }}>
                                    Rotate Cipher
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={22} /></div>
                                <div>
                                     <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>Alert Manifestations</h2>
                                     <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monitor system signals and logs</p>
                                </div>
                            </div>
                            <NotificationsList />
                        </div>
                    )}
                </div>
            </div>

            {/* ──────── CIPHER ROTATION MODAL ──────── */}
            {isPasswordModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100001, background: 'rgba(26,21,51,0.5)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: 480, borderRadius: 32, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.2)', animation: 'fadeUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) both' }}>
                        <div style={{ padding: '32px 40px', background: T.bg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                 <div style={{ width: 6, height: 32, background: T.accent, borderRadius: 6 }} />
                                 <div>
                                     <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: T.text }}>Rotate Keys</h3>
                                     <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Security Protocol 442-A</p>
                                 </div>
                            </div>
                            <button onClick={() => setIsPasswordModalOpen(false)} style={{ background: 'none', border: 'none', color: T.subtle, cursor: 'pointer' }}><X size={32} style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>
                        
                        <form onSubmit={handlePasswordChange} style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div>
                                <label style={S.label}>Current Security Key</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={S.icon} />
                                    <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} style={S.input} placeholder="••••••••••••" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={S.label}>New Key</label>
                                    <div style={{ position: 'relative' }}>
                                        <Key size={18} style={S.icon} />
                                        <input type="password" required value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} style={{ ...S.input, paddingLeft: 46 }} placeholder="••••••" />
                                    </div>
                                </div>
                                <div>
                                    <label style={S.label}>Confirm Key</label>
                                    <div style={{ position: 'relative' }}>
                                        <Shield size={18} style={S.icon} />
                                        <input type="password" required value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} style={{ ...S.input, paddingLeft: 46 }} placeholder="••••••" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={isChangingPassword} style={{ ...S.btn, width: '100%', marginTop: 8 }}>
                                {isChangingPassword ? <Loader size={20} className="animate-spin" /> : <><RefreshCw size={20} strokeWidth={2.5} /> Rotate & Sync</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
