import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Key,
    Shield,
    Activity,
    Users,
    LayoutDashboard,
    Clock,
    Search,
    Loader2,
    Save,
    X,
    Lock,
    Camera
} from 'lucide-react';
import Card from '../../components/ui/Card';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { login: updateAuthUser } = useAuth();

    // Form States
    const [formData, setFormData] = useState({
        phone: '',
        emergencyName: '',
        emergencyPhone: '',
        avatar: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const fetchProfile = async () => {
        try {
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

    useEffect(() => {
        fetchProfile();
    }, []);

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

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await apiClient.put('/member/profile', formData);
            toast.success("Profile updated successfully");

            // Update Auth Context if name or phone or avatar changed
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
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-2xl font-black text-slate-900">Profile Not Found</h2>
                <p className="text-slate-500 mt-2">We couldn't load your profile information. Please try again later.</p>
            </div>
        );
    }

    const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

    return (
        <div className="saas-container h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-20 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 sm:py-6 px-1 sm:px-2 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-indigo-100/50 rounded-xl sm:rounded-2xl shadow-inner border border-indigo-100 flex items-center justify-center shrink-0">
                        <User size={28} className="sm:w-9 sm:h-9 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">
                            My Profile
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">
                            Manage your personal information
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-8 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 group whitespace-nowrap"
                    >
                        <Key size={13} className="group-hover:rotate-12 transition-transform shrink-0" /> Reset Password
                    </button>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="h-10 sm:h-11 px-4 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
                            >
                                <X size={18} />
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="h-10 sm:h-11 px-6 bg-indigo-600 text-white rounded-xl sm:rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-8 bg-indigo-600 border-2 border-indigo-600 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 whitespace-nowrap"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Summary Section */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                <Card className="p-5 sm:p-8 border border-white rounded-2xl sm:rounded-[32px] bg-white shadow-2xl shadow-indigo-100/30 relative overflow-hidden group hover:shadow-indigo-200/40 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <User size={180} />
                    </div>
                    <div className="relative z-10 flex items-center gap-5 sm:gap-10">
                        <div className="relative shrink-0 group/avatar">
                            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-2xl sm:text-4xl font-black border-4 sm:border-[6px] border-white shadow-2xl shadow-indigo-200 ring-4 sm:ring-8 ring-indigo-100/30 overflow-hidden">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (profile.avatar ? (
                                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                ))}
                            </div>
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-indigo-100 text-indigo-600 hover:scale-110 hover:bg-indigo-50 active:scale-95 transition-all duration-300 cursor-pointer group-hover/avatar:shadow-indigo-200 flex items-center justify-center">
                                    <Camera size={18} className="sm:w-5 sm:h-5" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            )}
                        </div>
                        <div className="space-y-2 sm:space-y-3 min-w-0">
                            <div>
                                <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none truncate">{profile.name || 'Demo Member'}</h2>
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 sm:mt-2 flex items-center gap-2">
                                    Member ID: <span className="text-indigo-600 font-black">{profile.memberId || 'MEM001'}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1 flex-wrap">
                                <span className={`px-2.5 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] shadow-sm whitespace-nowrap border ${profile.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    {profile.status || 'Active'}
                                </span>
                                <span className="px-2.5 sm:px-4 py-1.5 bg-white text-slate-600 border border-slate-100 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group/badge whitespace-nowrap">
                                    {profile.plan?.name || 'No Active Plan'}
                                    <div className="absolute bottom-1 left-4 right-4 h-0.5 bg-indigo-200/50 rounded-full" />
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Personal Information Section */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                <Card className="p-5 sm:p-10 border border-white rounded-2xl sm:rounded-[40px] bg-white shadow-2xl shadow-indigo-100/30 space-y-6 sm:space-y-10 group hover:shadow-indigo-200/40 transition-all duration-500">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Personal Information</h3>
                        <p className="text-sm text-slate-400 font-medium">Your personal details and contact information</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 sm:gap-y-10">
                        {/* Full Name */}
                        <div className="space-y-3 group/field">
                            <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest opacity-60 group-hover/field:opacity-100 transition-opacity">
                                <User size={14} className="text-indigo-500" />
                                <span>Full Name</span>
                            </div>
                            <div className="h-14 w-full bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-5 text-slate-900 font-bold text-sm shadow-inner transition-colors">
                                {profile.name}
                            </div>
                            <p className="text-[10px] text-amber-600/80 font-black uppercase tracking-tighter">Contact admin to change your name</p>
                        </div>

                        {/* Email */}
                        <div className="space-y-3 group/field">
                            <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest opacity-60 group-hover/field:opacity-100 transition-opacity">
                                <Mail size={14} className="text-indigo-500" />
                                <span>Email Address</span>
                            </div>
                            <div className="h-14 w-full bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-5 text-slate-900 font-bold text-sm shadow-inner transition-colors">
                                {profile.email || 'N/A'}
                            </div>
                            <p className="text-[10px] text-indigo-400/80 font-black uppercase tracking-tighter">Email cannot be changed</p>
                        </div>

                        {/* Phone */}
                        <div className="space-y-3 group/field">
                            <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest opacity-60 group-hover/field:opacity-100 transition-opacity">
                                <Phone size={14} className="text-indigo-500" />
                                <span>Phone Number</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-14 w-full bg-white border-2 border-indigo-100 rounded-2xl px-5 text-slate-900 font-bold text-sm outline-none focus:border-indigo-600 transition-colors shadow-sm"
                                />
                            ) : (
                                <div className="h-14 w-full bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-5 text-slate-900 font-bold text-sm shadow-inner group-hover/field:border-indigo-100 transition-colors">
                                    {profile.phone || 'N/A'}
                                </div>
                            )}
                        </div>

                        {/* Member Since */}
                        <div className="space-y-3 group/field">
                            <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest opacity-60 group-hover/field:opacity-100 transition-opacity">
                                <Calendar size={14} className="text-indigo-500" />
                                <span>Member Since</span>
                            </div>
                            <div className="h-14 w-full bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-5 text-slate-900 font-bold text-sm shadow-inner transition-colors">
                                {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-GB') : 'N/A'}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-3 group/field">
                            <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest opacity-60 group-hover/field:opacity-100 transition-opacity">
                                <Activity size={14} className="text-indigo-500" />
                                <span>Current Status</span>
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <div className={`w-2 h-2 rounded-full ${profile.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                <span className={`text-xs font-black uppercase tracking-widest underline underline-offset-4 decoration-indigo-200 ${profile.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    Profile {profile.status || 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Emergency Contact Section */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                <Card className="p-5 sm:p-10 border border-white rounded-2xl sm:rounded-[40px] bg-white shadow-2xl shadow-indigo-100/30 space-y-6 sm:space-y-10 group hover:shadow-indigo-200/40 transition-all duration-500">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-rose-50 rounded-xl sm:rounded-2xl text-rose-600 shadow-inner border border-rose-100 shrink-0">
                            <Shield size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Emergency Contact</h3>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium">Contact person in case of emergency</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5 sm:gap-y-8">
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-60">Contact Name</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.emergencyName}
                                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                                    placeholder="Enter name"
                                    className="h-14 w-full bg-white border-2 border-indigo-100 rounded-2xl px-5 text-slate-900 font-bold text-sm outline-none focus:border-indigo-600 transition-colors shadow-sm"
                                />
                            ) : (
                                <div className={`h-14 w-full bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center px-5 text-sm shadow-inner ${profile.emergencyName ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}`}>
                                    {profile.emergencyName || 'Emergency contact name'}
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-60">Contact Phone</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.emergencyPhone}
                                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                    placeholder="Enter phone"
                                    className="h-14 w-full bg-white border-2 border-indigo-100 rounded-2xl px-5 text-slate-900 font-bold text-sm outline-none focus:border-indigo-600 transition-colors shadow-sm"
                                />
                            ) : (
                                <div className={`h-14 w-full bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center px-5 text-sm shadow-inner ${profile.emergencyPhone ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}`}>
                                    {profile.emergencyPhone || 'Emergency contact phone'}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Membership Details Section */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
                <Card className="p-5 sm:p-10 border border-white rounded-2xl sm:rounded-[40px] bg-white shadow-2xl shadow-indigo-100/30 space-y-6 sm:space-y-10 group hover:shadow-indigo-200/40 transition-all duration-500">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Membership Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-5 sm:gap-y-8">
                        <div className="space-y-2 group/val">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/val:text-indigo-500 transition-colors">Plan</p>
                            <p className="text-lg font-black text-slate-900 tracking-tight">{profile.plan?.name || 'No Active Plan'}</p>
                            <div className="w-8 h-1 bg-indigo-100 rounded-full" />
                        </div>
                        <div className="space-y-2 group/val">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/val:text-emerald-500 transition-colors">Start Date</p>
                            <p className="text-lg font-black text-slate-900 tracking-tight">{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                            <div className="w-8 h-1 bg-emerald-100 rounded-full" />
                        </div>
                        <div className="space-y-2 group/val">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/val:text-rose-500 transition-colors">End Date</p>
                            <p className="text-lg font-black text-slate-900 tracking-tight">{profile.expiryDate ? new Date(profile.expiryDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                            <div className="w-8 h-1 bg-rose-100 rounded-full" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Branch Section */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
                <Card className="p-5 sm:p-10 border border-white rounded-2xl sm:rounded-[40px] bg-white shadow-2xl shadow-indigo-100/30 group hover:shadow-indigo-200/40 transition-all duration-500">
                    <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
                        <div className="p-2.5 sm:p-3 bg-indigo-50/50 rounded-xl sm:rounded-2xl text-indigo-600 shadow-inner shrink-0">
                            <MapPin size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Branch Location</h3>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-slate-50/50 border border-slate-100 rounded-2xl sm:rounded-3xl group-hover:bg-white transition-colors duration-500">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100/50 border border-indigo-50 sm:scale-110">
                            <MapPin size={24} className="sm:w-8 sm:h-8" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">{profile.branch || 'Main Branch'}</p>
                            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">Your registered home branch</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-md p-8 bg-white rounded-[32px] shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 shadow-inner">
                                <Lock size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Change Password</h3>
                            <p className="text-sm text-slate-400 font-medium mt-1">Update your security credentials</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold focus:border-indigo-600 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold focus:border-indigo-600 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold focus:border-indigo-600 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full h-14 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-6"
                            >
                                Update Password
                            </button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
