import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Calendar, MapPin, Key, Shield, Activity, Users, 
    LayoutDashboard, Clock, Search, Loader2, Save, X, Lock, Camera, Bell,
    RefreshCw, ChevronRight, UserCheck, ShieldCheck, MailCheck, Fingerprint
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import NotificationsList from '../../components/notifications/NotificationsList';
import Loader from '../../components/common/Loader';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF', dark: '#0D0A1F'
};

const SectionHeader = ({ icon: Icon, title, subtitle, color = T.accent }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>{subtitle}</p>}
        </div>
    </div>
);

const PremiumCard = ({ children, style = {}, index = 0 }) => {
    return (
        <div 
            style={{
                background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`,
                padding: 32, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`,
                ...style
            }}
        >
            {children}
        </div>
    );
};

const InputGroup = ({ label, icon: Icon, value, onChange, readOnly, placeholder, type = 'text', hint }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 4 }}>{label}</label>
        <div style={{ position: 'relative' }}>
             <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <input 
                type={type} value={value} onChange={e => onChange && onChange(e.target.value)}
                readOnly={readOnly} placeholder={placeholder}
                style={{
                    width: '100%', height: 56, borderRadius: 16, background: readOnly ? T.bg : '#fff',
                    border: `2px solid ${readOnly ? 'transparent' : T.border}`, padding: '0 16px 0 48px',
                    fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', transition: '0.2s',
                    cursor: readOnly ? 'default' : 'text'
                }}
            />
        </div>
        {hint && <p style={{ fontSize: 9, fontWeight: 800, color: T.amber, textTransform: 'uppercase', margin: 0, marginLeft: 4 }}>{hint}</p>}
    </div>
);

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { login: updateAuthUser } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');

    const [formData, setFormData] = useState({ phone: '', emergencyName: '', emergencyPhone: '', avatar: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/member/profile');
            setProfile(res.data);
            setFormData({
                phone: res.data.phone || '',
                emergencyName: res.data.emergencyName || '',
                emergencyPhone: res.data.emergencyPhone || '',
                avatar: res.data.avatar || ''
            });
        } catch (err) {
            console.error("Failed to fetch profile", err);
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setFormData(prev => ({ ...prev, avatar: reader.result })); };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await apiClient.put('/member/profile', formData);
            toast.success("Profile updated successfully");
            const updatedProfile = res.data.member || res.data;
            updateAuthUser({
                ...JSON.parse(localStorage.getItem('userData')),
                name: updatedProfile.name,
                phone: updatedProfile.phone,
                avatar: updatedProfile.avatar
            });
            await fetchProfile();
            setIsEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error("Passwords do not match");
        try {
            await apiClient.post('/member/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Password changed successfully");
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password");
        }
    };

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    if (loading) return <Loader message="Accessing your security vault..." />;

    if (!profile) return (
        <div style={{ textAlign: 'center', padding: 100 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text }}>Profile Not Found</h2>
            <p style={{ color: T.muted, fontWeight: 600 }}>We couldn't load your profile data. Please try again.</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '12px 24px', background: T.accent, color: '#fff', borderRadius: 12, border: 'none', fontWeight: 900 }}>RETRY</button>
        </div>
    );

    const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

    return (
        <div className="dashboard-container" style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                .animate-fadeIn { animation: fadeUp 0.4s ease both; }

                @media (max-width: 1024px) {
                    .section-grid { grid-template-columns: 1fr 1fr !important; }
                }

                @media (max-width: 768px) {
                    .dashboard-container { padding: 20px 20px 80px !important; }
                    .header-banner { flex-direction: column !important; align-items: stretch !important; padding: 24px !important; gap: 24px !important; }
                    .header-content-container { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 16px !important; }
                    .header-text-box { display: flex; flexDirection: column; align-items: center; }
                    .banner-subtitle { margin-top: 4px !important; }
                    
                    .header-banner-actions { flex-direction: column !important; width: 100% !important; }
                    .header-banner-actions button, .header-banner-actions div { width: 100% !important; }
                    .header-banner-actions button { justify-content: center !important; height: 52px !important; }
                    
                    .tabs-container { overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
                    .tabs-container::-webkit-scrollbar { display: none; }
                    .tabs-container button { white-space: nowrap; flex-shrink: 0; padding: 12px 20px !important; }

                    .profile-summary-row { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 24px !important; }
                    .profile-summary-info { align-items: center !important; }
                    .profile-status-box { flex-direction: column !important; gap: 8px !important; }
                    
                    .section-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
                    .membership-summary-grid { flex-direction: column !important; width: 100% !important; }
                    
                    .security-card { flex-direction: column !important; align-items: center !important; text-align: center !important; padding: 32px 24px !important; gap: 24px !important; }
                    .security-card > div { flex-direction: column !important; align-items: center !important; }
                    .security-card button { width: 100% !important; }
                }

                @media (max-width: 480px) {
                    .banner-title { font-size: 22px !important; }
                    .profile-name { font-size: 24px !important; }
                    .premium-card { padding: 24px 20px !important; }
                    .tabs-container button { padding: 12px 16px !important; font-size: 10px !important; }
                }
            `}</style>

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="animate-fadeIn header-banner">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div className="header-content-container" style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div className="header-icon-box" style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <UserCheck size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div className="header-text-box">
                        <h1 className="banner-title" style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>My Profile</h1>
                        <p className="banner-subtitle" style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>Manage your personal identity and security</p>
                    </div>
                </div>
                <div className="header-banner-actions" style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 2 }}>
                    <button onClick={() => setShowPasswordModal(true)} style={{ padding: '0 20px', height: 44, background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 14, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><Key size={16} /> Reset Password</button>
                    {isEditing ? (
                        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                            <button onClick={() => setIsEditing(false)} style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                            <button onClick={handleSaveProfile} disabled={saving} style={{ flex: 1, height: 44, background: '#FFE16A', color: '#1A1533', borderRadius: 14, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,225,106,0.2)' }}>{saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Save Changes</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} style={{ padding: '0 28px', height: 44, background: '#fff', color: T.accent, borderRadius: 14, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Edit Profile</button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* TABS */}
                <div style={{ display: 'flex', gap: 12 }} className="animate-fadeIn tabs-container">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 24px', borderRadius: 16, border: `2px solid ${activeTab === tab.id ? T.accent : T.surface}`,
                                background: activeTab === tab.id ? T.accent : T.surface,
                                color: activeTab === tab.id ? '#fff' : T.muted,
                                fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: 10,
                                boxShadow: activeTab === tab.id ? '0 8px 24px rgba(124,92,252,0.2)' : 'none',
                                animation: 'fadeUp 0.3s ease both'
                            }}
                        >
                            <tab.icon size={16} strokeWidth={2.5} /> {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'personal' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* PROFILE SUMMARY BAR */}
                        <PremiumCard index={0} style={{ padding: '24px 40px', background: 'linear-gradient(135deg, #fff 0%, #F9F8FF 100%)' }}>
                            <div className="profile-summary-row" style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <div style={{ width: 120, height: 120, borderRadius: '50%', background: T.accent, border: '6px solid #fff', boxShadow: '0 12px 32px rgba(124,92,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {formData.avatar ? <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.avatar ? <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{initials}</span>)}
                                    </div>
                                    {isEditing && (
                                        <label style={{ position: 'absolute', bottom: 4, right: 4, width: 36, height: 36, borderRadius: 12, background: '#fff', border: `1px solid ${T.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                                            <Camera size={18} />
                                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
                                        </label>
                                    )}
                                </div>
                                <div className="profile-summary-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h2 className="profile-name" style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>{profile.name}</h2>
                                    <div className="profile-status-box" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                                        <span style={{ fontSize: 10, fontWeight: 900, color: profile.status === 'Active' ? T.green : T.rose, background: profile.status === 'Active' ? T.greenLight : T.roseLight, padding: '4px 12px', borderRadius: 8, textTransform: 'uppercase' }}>{profile.status} Member</span>
                                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.subtle }} />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>{profile.plan?.name || 'Standard Plan'}</span>
                                    </div>
                                    <p style={{ fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 12 }}>ID: {profile.memberId}</p>
                                </div>
                            </div>
                        </PremiumCard>

                        {/* PERSONAL INFO DETAILS */}
                        <PremiumCard index={1}>
                            <SectionHeader icon={ShieldCheck} title="Personal Details" subtitle="Verification & Contact" />
                            <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                <InputGroup label="Full Name" icon={User} value={profile.name} readOnly={true} hint="Contact admin to change legal name" />
                                <InputGroup label="Email Address" icon={Mail} value={profile.email} readOnly={true} hint="Registered email cannot be modified" />
                                <InputGroup label="Phone Number" icon={Phone} value={isEditing ? formData.phone : profile.phone} onChange={v => setFormData({...formData, phone: v})} readOnly={!isEditing} />
                                <InputGroup label="Member Since" icon={Calendar} value={profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-GB') : 'N/A'} readOnly={true} />
                            </div>
                        </PremiumCard>

                        {/* EMERGENCY CONTACT */}
                        <PremiumCard index={2} style={{ background: T.bg }}>
                            <SectionHeader icon={Activity} title="Emergency Contact" subtitle="Trusted Reach-out" color={T.rose} />
                            <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                <InputGroup label="Contact Name" icon={User} value={isEditing ? formData.emergencyName : profile.emergencyName} onChange={v => setFormData({...formData, emergencyName: v})} readOnly={!isEditing} placeholder="Primary Contact Person" />
                                <InputGroup label="Contact Phone" icon={Phone} value={isEditing ? formData.emergencyPhone : profile.emergencyPhone} onChange={v => setFormData({...formData, emergencyPhone: v})} readOnly={!isEditing} placeholder="Emergency Phone Number" />
                            </div>
                        </PremiumCard>

                        <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
                            {/* BRANCH INFO */}
                            <PremiumCard index={3}>
                                <SectionHeader icon={MapPin} title="Branch Access" subtitle="Your Home Gym" color={T.blue} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, borderRadius: 20, background: T.bg }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fff', color: T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}><MapPin size={28} /></div>
                                    <div>
                                        <h4 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>{profile.branch || 'Main Branch'}</h4>
                                        <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0, marginTop: 4 }}>Registered Home Branch</p>
                                    </div>
                                </div>
                            </PremiumCard>

                            {/* MEMBERSHIP SUMMARY */}
                            <PremiumCard index={4}>
                                <SectionHeader icon={Shield} title="Membership Overview" subtitle="Plan Details" color={T.green} />
                                <div className="membership-summary-grid" style={{ display: 'flex', gap: 20 }}>
                                    {[
                                        { label: 'Active Plan', value: profile.plan?.name || 'Standard', color: T.accent },
                                        { label: 'Start Date', value: profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-GB') : 'N/A', color: T.text },
                                        { label: 'Expiry Date', value: profile.expiryDate ? new Date(profile.expiryDate).toLocaleDateString('en-GB') : 'N/A', color: T.rose },
                                    ].map((item, i) => (
                                        <div key={i} style={{ flex: 1, padding: 20, borderRadius: 20, background: T.bg }}>
                                            <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0, marginBottom: 4 }}>{item.label}</p>
                                            <p style={{ fontSize: 13, fontWeight: 900, color: item.color, margin: 0 }}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </PremiumCard>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <PremiumCard index={0} className="security-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 40, background: T.roseLight }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fff', color: T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(244,63,94,0.1)' }}><Lock size={32} /></div>
                                <div>
                                    <h4 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>Password Security</h4>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: T.rose, margin: '4px 0 0' }}>Update your password regularly to keep your account safe.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPasswordModal(true)} style={{ height: 52, padding: '0 32px', background: T.rose, color: '#fff', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(244,63,94,0.3)' }}>Rotate Password</button>
                        </PremiumCard>
                        
                        <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <PremiumCard index={1} style={{ opacity: 0.6 }}>
                                <SectionHeader icon={Fingerprint} title="Biometric Access" subtitle="Multi-factor Security" />
                                <p style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Face-recognition and fingerprint access for gym entries. Configuration available at branch office.</p>
                            </PremiumCard>
                            <PremiumCard index={2} style={{ opacity: 0.6 }}>
                                <SectionHeader icon={ShieldCheck} title="Account Privacy" subtitle="Data Management" />
                                <p style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Your personal data is encrypted and managed according to Roar Fitness privacy standards.</p>
                            </PremiumCard>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="animate-fadeIn">
                        <NotificationsList />
                    </div>
                )}

            </div>

             {/* PASSWORD MODAL */}
            {showPasswordModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100001, background: 'rgba(13,10,31,0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: T.surface, width: '100%', maxWidth: 460, borderRadius: 32, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'fadeUp 0.3s ease both' }}>
                        <div style={{ padding: '28px 36px', background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Security Shield</h3>
                                <p style={{ fontSize: 11, fontWeight: 700, margin: '4px 0 0', opacity: 0.8, textTransform: 'uppercase' }}>Update your access credentials</p>
                            </div>
                            <button onClick={() => setShowPasswordModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', width: 36, height: 36, borderRadius: 12, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleChangePassword} style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <InputGroup label="Current Password" icon={Lock} type="password" value={passwordData.currentPassword} onChange={v => setPasswordData({...passwordData, currentPassword: v})} placeholder="••••••••••••" />
                            <InputGroup label="New Password" icon={Key} type="password" value={passwordData.newPassword} onChange={v => setPasswordData({...passwordData, newPassword: v})} placeholder="••••••••••••" />
                            <InputGroup label="Confirm Password" icon={UserCheck} type="password" value={passwordData.confirmPassword} onChange={v => setPasswordData({...passwordData, confirmPassword: v})} placeholder="••••••••••••" />
                            <button type="submit" style={{ height: 56, width: '100%', padding: '0 32px', borderRadius: 16, background: T.rose, color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 24px rgba(244,63,94,0.3)', marginTop: 8 }}>Rotate Password</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
