import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Shield, Bell, Save, Loader, Key, X, Lock, Activity, Calendar, CheckCircle2 } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { toast } from 'react-hot-toast';
import { fetchAdminProfile, updateAdminProfile } from '../../api/superadmin/superAdminApi';
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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }

        try {
            setIsChangingPassword(true);
            await apiClient.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Password changed successfully!");
            setIsPasswordModalOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    };
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
            const data = await fetchAdminProfile();
            setProfile(data);
            setFormData({
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address || ''
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

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const updated = await updateAdminProfile(formData);
            setProfile(updated);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-light/30 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full mb-4 animate-spin"></div>
                    <p className="text-lg font-semibold text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-light/30 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                        <Shield size={32} className="text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Could Not Load Profile</h3>
                    <p className="text-slate-500 text-sm">
                        {message.text || 'There was an error fetching your profile. Please try refreshing the page.'}
                    </p>
                    <button
                        onClick={loadProfile}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <div className="min-h-screen ">
            <div className="max-w-full mx-auto space-y-8">

                {/* Profile Header Card */}
                <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
                    {/* Gradient Background Banner */}
                    <div className="h-40 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-36 h-36 rounded-2xl bg-white p-2 shadow-2xl ring-4 ring-white">
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white text-5xl font-black shadow-lg">
                                        {profile.avatar}
                                    </div>
                                </div>
                                <button className="absolute bottom-2 right-2 p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-primary hover:scale-110 hover:bg-primary-light active:scale-95 transition-all duration-300 group-hover:shadow-xl">
                                    <Camera size={18} />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 pb-2">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent mb-2">
                                    {profile.name}
                                </h1>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-light to-purple-50 text-primary-hover text-xs font-bold border border-violet-200 shadow-sm">
                                        {profile.role.replace('_', ' ')}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-sm">
                                        <Activity size={14} className="text-emerald-500" />
                                        {profile.status}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm">
                                        <Calendar size={14} className="text-slate-500" />
                                        Joined {profile.joinedDate}
                                    </span>
                                </div>
                            </div>

                            {/* Verified Badge */}
                            <button className="md:mb-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2">
                                <CheckCircle2 size={18} />
                                Verified Account
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-primary to-primary text-white shadow-lg hover:shadow-xl hover:scale-105'
                                        : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 hover:text-slate-900 hover:shadow-md'
                                    }`}
                            >
                                <tab.icon size={20} className={activeTab === tab.id ? '' : 'text-slate-400'} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 sm:p-10">

                            {/* Success/Error Message */}
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border ${message.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    <CheckCircle2 size={18} />
                                    {message.text}
                                </div>
                            )}

                            {/* Personal Info Tab */}
                            {activeTab === 'personal' && (
                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Personal Information</h3>
                                        <p className="text-sm text-slate-600">Update your personal details and contact information</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300">
                                                    <User size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>

                                        {/* Email Address */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300">
                                                    <Mail size={20} />
                                                </div>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300">
                                                    <Phone size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300">
                                                    <MapPin size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
                                                    placeholder="Enter city, country"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="group relative flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 bg-gradient-to-r from-primary to-primary hover:shadow-primary/30/50"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            {isSaving ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative mr-2"></div>
                                            ) : (
                                                <Save size={20} className="mr-2 relative transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                                            )}
                                            <span className="relative">{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-8">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Security Settings</h3>
                                        <p className="text-sm text-slate-600">Manage your password and account security</p>
                                    </div>

                                    {/* Password Management */}
                                    <div className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200">
                                        <h4 className="text-red-700 font-bold flex items-center gap-2 mb-2">
                                            <Lock size={20} />
                                            Password Management
                                        </h4>
                                        <p className="text-red-600 text-sm font-medium">
                                            It's recommended to update your password every 90 days for maximum security.
                                        </p>
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
                                </div>
                            )}

                            {/* Notifications Tab */}
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
