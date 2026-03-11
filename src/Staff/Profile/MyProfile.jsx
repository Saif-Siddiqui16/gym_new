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
        address: ''
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
                address: data.address || ''
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

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <div className="p-0 md:p-8 bg-gradient-to-br from-slate-50 via-white to-primary-light/30 min-h-screen font-sans animate-fadeIn">
            <div className="max-w-full mx-auto space-y-8">

                {/* Profile Header Card */}
                <div className="group relative bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-fuchsia-600 opacity-95"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="relative px-4 sm:px-8 pb-8 pt-32">
                        <div className="flex flex-col md:flex-row md:items-end gap-8 -mt-20">
                            <div className="relative group/avatar">
                                <div className="w-40 h-40 rounded-[32px] bg-white p-2 shadow-2xl transform group-hover/avatar:scale-105 transition-transform duration-300 rotate-3 group-hover/avatar:rotate-0">
                                    <div className="w-full h-full rounded-[24px] bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-primary text-6xl font-black shadow-inner">
                                        {profile.avatar}
                                    </div>
                                </div>
                                <button className="absolute bottom-2 right-2 p-3 bg-white rounded-2xl shadow-lg border border-slate-100 text-primary hover:bg-primary-light hover:scale-110 active:scale-95 transition-all">
                                    <Camera size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="flex-1 pb-4 text-white">
                                <h1 className="text-4xl font-black tracking-tight mb-3 drop-shadow-md">{profile.name}</h1>
                                <div className="flex flex-wrap gap-3">
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30 shadow-sm">
                                        {profile.role.replace('_', ' ')}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-100 text-xs font-bold border border-emerald-400/30 shadow-sm">
                                        <Activity size={14} className="text-emerald-300" /> {profile.status}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-violet-100 text-xs font-bold border border-white/20 shadow-sm">
                                        <Calendar size={14} className="text-violet-200" /> Joined {profile.joinedDate}
                                    </span>
                                </div>
                            </div>

                            <div className="md:mb-4">
                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl text-white font-bold text-sm border border-white/20 shadow-lg">
                                    <CheckCircle2 size={18} className="text-emerald-400" /> Staff Account
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-3">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-primary to-primary text-white shadow-xl shadow-violet-200 transform scale-105'
                                        : 'bg-white text-slate-500 hover:bg-primary-light hover:text-primary-hover shadow-sm border border-slate-100'
                                    }`}
                            >
                                <tab.icon size={20} strokeWidth={2.5} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-4 sm:p-10 animate-in slide-in-from-right duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

                            {message.text && (
                                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <form onSubmit={handleSave} className="space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3 group">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within:text-primary transition-colors">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within:text-primary transition-colors">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within:text-primary transition-colors">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within:text-primary transition-colors">Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                                                    placeholder="Enter city, country"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-100">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-8 py-4 bg-gradient-to-r from-primary to-primary text-white rounded-2xl text-sm font-black shadow-xl shadow-primary/30/30 hover:shadow-2xl hover:shadow-primary/30/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Save size={20} strokeWidth={2.5} />
                                            )}
                                            Save Profile Changes
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8 relative z-10">
                                    <div className="p-5 sm:p-8 rounded-[32px] bg-red-50 border border-red-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                                            <Lock size={32} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-red-900 font-bold text-lg mb-1">Password Management</h4>
                                            <p className="text-red-700/80 text-sm font-medium leading-relaxed">It's recommended to update your password every 90 days to ensure maximum security for your account.</p>
                                        </div>
                                        <button
                                            onClick={() => setIsPasswordModalOpen(true)}
                                            className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-red-300 hover:-translate-y-0.5 transition-all"
                                        >
                                            Change Password
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Key className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-medium text-gray-900 dark:text-white">Change Password</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                                            </div>
                                        </div>
                                        <div className="text-indigo-600 dark:text-indigo-400 font-medium">Update</div>
                                    </button>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <NotificationsList />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                            <h3 className="text-xl font-bold">Change Password</h3>
                            <button
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Key className="w-4 h-4 text-gray-400" />
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isChangingPassword ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Updating Password...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Update Password
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
