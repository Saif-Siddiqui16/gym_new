import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, Bell, CheckCircle2, Camera, MapPin, Calendar, Activity, X, Key, Loader, AlertTriangle, Save } from 'lucide-react';
import { fetchManagerProfile, updateManagerProfile } from '../../api/manager/managerApi';
import { useAuth } from '../../context/AuthContext';
import NotificationsList from '../../components/notifications/NotificationsList';
import apiClient from '../../api/apiClient';
import { toast } from 'react-hot-toast';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        avatar: ''
    });
    const { login: updateAuthUser } = useAuth();

    useEffect(() => {
        loadProfile();
    }, []);

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
            console.error("Error loading profile:", error);
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
            const updated = await updateManagerProfile(formData);
            setProfile(updated);

            // Sync with Auth Context
            updateAuthUser({
                ...JSON.parse(localStorage.getItem('userData')),
                name: updated.name,
                phone: updated.phone,
                avatar: updated.avatar
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

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
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading profile...</p>
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
                <p className="text-slate-500 text-sm max-w-xs text-center">
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
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

            <div style={{ ...S.card, marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ height: '140px', background: `linear-gradient(135deg, ${T.accent}, #AE52FF)` }} />
                <div style={{ padding: '0 32px 32px', display: 'flex', gap: '32px', alignItems: 'flex-end', marginTop: '-48px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: T.surface, padding: '4px', boxShadow: '0 8px 24px rgba(124, 92, 252, 0.15)' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '20px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '36px', fontWeight: '900' }}>
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (profile.avatar && profile.avatar.length > 10 ? (
                                    <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    profile.avatar || profile.name?.charAt(0).toUpperCase()
                                ))}
                            </div>
                        </div>
                        <label style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '36px', height: '36px', background: T.surface, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', border: `1px solid ${T.border}` }}>
                            <Camera size={16} />
                            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                    
                    <div style={{ flex: 1, paddingBottom: '8px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: '0 0 8px 0' }}>{profile.name}</h1>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <span style={{ padding: '4px 12px', background: T.accentLight, color: T.accent, borderRadius: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{profile.role.replace('_', ' ')}</span>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: T.success, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Activity size={14} /> {profile.status}</span>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: T.muted, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Calendar size={14} /> Joined {profile.joinedDate}</span>
                        </div>
                    </div>
                    <div style={{ paddingBottom: '16px' }}>
                        <span style={{ padding: '8px 16px', background: T.successLight, color: T.success, borderRadius: '14px', fontSize: '11px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={16} /> Manager Account
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 3fr)', gap: '24px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                height: '48px', padding: '0 20px', borderRadius: '16px', border: 'none', 
                                display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                                background: activeTab === tab.id ? T.accent : T.surface, 
                                color: activeTab === tab.id ? '#FFF' : T.muted,
                                boxShadow: activeTab === tab.id ? '0 8px 20px rgba(124, 92, 252, 0.2)' : `0 2px 8px ${T.border}`
                            }}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ ...S.card, padding: '32px' }}>
                    {message.text && (
                        <div style={{ padding: '16px', borderRadius: '16px', marginBottom: '24px', backgroundColor: message.type === 'success' ? T.successLight : T.dangerLight, color: message.type === 'success' ? T.success : '#F43F5E', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={16} /> {message.text}
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <label style={S.label}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={S.icon} />
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={S.input} />
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={S.icon} />
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={S.input} />
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={S.icon} />
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={S.input} />
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>Location</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16} style={S.icon} />
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} style={S.input} />
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                                <button type="submit" disabled={isSaving} style={S.btn}>
                                    {isSaving ? <Loader size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save Profile Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: '#FFF1F4', border: '1px solid #FFE4E6', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#E11D48', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={16} /> Password Management</h4>
                                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#F43F5E', margin: 0 }}>It's recommended to update your password every 90 days for maximum security.</p>
                                </div>
                                <button onClick={() => setIsPasswordModalOpen(true)} style={{ height: '36px', padding: '0 16px', borderRadius: '10px', background: '#E11D48', color: '#FFF', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                                    Change Password
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <NotificationsList />
                    )}
                </div>
            </div>

            {/* ──────── PASSWORD MODAL ──────── */}
            {isPasswordModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100001, background: 'rgba(13,10,31,0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: T.surface, width: '100%', maxWidth: 460, borderRadius: 32, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'fadeUp 0.3s ease both' }}>
                        <div style={{ padding: '28px 36px', background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
