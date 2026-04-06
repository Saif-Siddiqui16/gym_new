import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Shield, Bell, Save, Loader, Key, X, Lock, CheckCircle2, Activity, Calendar, AlertTriangle } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { toast } from 'react-hot-toast';
import { fetchStaffProfile, updateStaffProfile } from '../../api/staff/staffApi';
import NotificationsList from '../../components/notifications/NotificationsList';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        avatar: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await fetchStaffProfile();
            setProfile(data);
            setFormData({
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                address: data.address || '',
                avatar: data.avatar || ''
            });
        } catch (error) {
            console.error("Error loading staff profile:", error);
            setMessage({ type: 'error', text: 'Failed to load profile data.' });
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
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const updated = await updateStaffProfile(formData);
            setProfile(updated);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New password and confirm password do not match.");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long.");
            return;
        }

        setIsChangingPassword(true);
        try {
            await apiClient.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success("Password updated successfully!");
            setIsPasswordModalOpen(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error("Error changing password:", error);
            const errorMessage = error.response?.data?.message || "Failed to change password. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-primary font-bold bg-primary-light px-4 py-2 rounded-xl animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <Shield size={32} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Could Not Load Profile</h3>
                <p className="text-slate-500 text-sm text-center max-w-xs">
                    {message.text || 'There was an error fetching your profile. Please try refreshing the page.'}
                </p>
                <button
                    onClick={loadProfile}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    const T = {
        accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
        border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF',
        text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC',
        green: '#22C97A', greenLight: '#E8FBF2',
        rose: '#F43F5E', roseLight: '#FFF1F4',
        amber: '#F59E0B', amberLight: '#FEF3C7',
    };

    const S = {
        ff: "'Plus Jakarta Sans', sans-serif",
        card: { background: T.surface, borderRadius: '32px', border: `1px solid ${T.border}`, boxShadow: '0 8px 32px rgba(124,92,252,0.06)' },
        input: { width: '100%', height: '52px', borderRadius: '16px', border: `2px solid ${T.border}`, background: T.bg, padding: '0 16px 0 46px', fontSize: '14px', fontWeight: '700', color: T.text, outline: 'none', transition: '0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif" },
        label: { display: 'block', fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', marginLeft: '4px' },
        icon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: T.subtle },
        btn: { height: '52px', padding: '0 32px', borderRadius: '16px', background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: '#fff', border: 'none', fontSize: '13px', fontWeight: '900', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: `0 8px 24px rgba(124,92,252,0.3)` }
    };

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                .fu { animation: fadeUp 0.4s ease both }
                input:focus { border-color: ${T.accent} !important; background: #fff !important; box-shadow: 0 0 0 4px ${T.accent}15 !important; }
            `}</style>

            <div className="fu" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* ──────── HEADER ──────── */}
                <div style={{ ...S.card, overflow: 'hidden', marginBottom: 32 }}>
                    <div style={{ height: '140px', background: 'linear-gradient(135deg, #1A1533 0%, #2D274D 55%, #3F396D 100%)', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 40, background: `linear-gradient(to top, ${T.surface}, transparent)` }} />
                    </div>
                    
                    <div style={{ padding: '0 40px 32px', marginTop: '-60px', position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 28 }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: 140, height: 140, borderRadius: 32, background: T.surface, padding: 6, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: 26, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 48, fontWeight: 900 }}>
                                    {(formData.avatar || profile.avatar) ? <img src={formData.avatar || profile.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile.name.charAt(0).toUpperCase()}
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
                                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.green }} /> {profile.status}
                                </span>
                            </div>
                        </div>

                        <div style={{ paddingBottom: 10 }}>
                            <div style={{ background: T.bg, padding: '12px 24px', borderRadius: 16, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <CheckCircle2 size={18} color={T.green} strokeWidth={3} />
                                <span style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: '0.02em' }}>STAFF ACCOUNT</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 3fr)', gap: 32 }}>
                    
                    {/* ──────── TABS ──────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px',
                                    borderRadius: 18, background: isActive ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : T.surface,
                                    border: isActive ? 'none' : `1.5px solid ${T.border}`,
                                    color: isActive ? '#fff' : T.muted, textAlign: 'left', cursor: 'pointer', transition: '0.2s',
                                    fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    boxShadow: isActive ? `0 8px 24px rgba(124,92,252,0.2)` : 'none'
                                }}>
                                    <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ──────── CONTENT ──────── */}
                    <div style={{ ...S.card, padding: 40, minHeight: 460 }}>
                        {message.text && (
                            <div style={{ padding: '14px 20px', borderRadius: 16, background: message.type === 'success' ? T.greenLight : T.roseLight, border: `1px solid ${message.type === 'success' ? T.green : T.rose}30`, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                                {message.type === 'success' ? <CheckCircle2 size={18} color={T.green} /> : <AlertTriangle size={18} color={T.rose} />}
                                <span style={{ fontSize: 13, fontWeight: 800, color: message.type === 'success' ? T.green : T.rose }}>{message.text}</span>
                            </div>
                        )}

                        {activeTab === 'personal' && (
                            <form onSubmit={handleSave} style={{ animation: 'fadeUp 0.3s forwards' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 16, borderBottom: `1.5px solid ${T.bg}` }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} strokeWidth={2.5} /></div>
                                    <h2 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Personal Information</h2>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    <div>
                                        <label style={S.label}>Full Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} style={S.icon} />
                                            <input name="name" value={formData.name} onChange={handleInputChange} style={S.input} placeholder="Full Name" />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={S.label}>Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={S.icon} />
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={S.input} placeholder="Email" />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={S.label}>Phone Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={18} style={S.icon} />
                                            <input name="phone" value={formData.phone} onChange={handleInputChange} style={S.input} placeholder="Phone" />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={S.label}>Location</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={18} style={S.icon} />
                                            <input name="address" value={formData.address} onChange={handleInputChange} style={S.input} placeholder="Location" />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1.5px solid ${T.bg}`, textAlign: 'right' }}>
                                    <button type="submit" disabled={isSaving} style={S.btn}>
                                        {isSaving ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} strokeWidth={2.5} />}
                                        SAVE CHANGES
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
                                
                                <div style={{ background: T.roseLight + '40', border: `1.5px solid ${T.roseLight}`, borderRadius: 24, padding: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fff', border: `1px solid ${T.roseLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.rose, boxShadow: '0 4px 12px rgba(244,63,94,0.1)' }}><Key size={28} strokeWidth={2.5} /></div>
                                        <div>
                                            <h4 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Change Password</h4>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: T.muted, margin: '4px 0 0' }}>Update your account security hash</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsPasswordModalOpen(true)} style={{ padding: '14px 28px', borderRadius: 14, background: T.rose, color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: '0.2s', boxShadow: `0 8px 24px ${T.rose}40` }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>UPDATE PASSWORD</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && <NotificationsList />}
                    </div>
                </div>
            </div>

            {/* ──────── PASSWORD MODAL ──────── */}
            {isPasswordModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100001, background: 'rgba(13,10,31,0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: T.surface, width: '100%', maxWidth: 460, borderRadius: 32, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'fadeUp 0.3s ease both' }}>
                        <div style={{ padding: '28px 36px', background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Reset Security</h3>
                                <p style={{ fontSize: 11, fontWeight: 700, margin: '4px 0 0', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Create a new robust password</p>
                            </div>
                            <button onClick={() => setIsPasswordModalOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', width: 36, height: 36, borderRadius: 12, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} strokeWidth={2.5} /></button>
                        </div>
                        
                        <form onSubmit={handlePasswordChange} style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div>
                                <label style={S.label}>Current Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={S.icon} />
                                    <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} style={S.input} placeholder="••••••••••••" />
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={18} style={S.icon} />
                                    <input type="password" required value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} style={S.input} placeholder="••••••••••••" />
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Shield size={18} style={S.icon} />
                                    <input type="password" required value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} style={S.input} placeholder="••••••••••••" />
                                </div>
                            </div>

                            <button type="submit" disabled={isChangingPassword} style={{ ...S.btn, marginTop: 10 }}>
                                {isChangingPassword ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><Save size={20} strokeWidth={2.5} /> ROTATE PASSWORD</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
