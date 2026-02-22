import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, Bell, CheckCircle2, Camera, MapPin, Calendar, Activity, Save } from 'lucide-react';
import { fetchAdminProfile, updateAdminProfile } from '../../api/superadmin/superAdminApi';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full mb-4 animate-spin"></div>
                    <p className="text-lg font-semibold text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
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
                        className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all"
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Profile Header Card */}
                <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
                    {/* Gradient Background Banner */}
                    <div className="h-40 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-36 h-36 rounded-2xl bg-white p-2 shadow-2xl ring-4 ring-white">
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-5xl font-black shadow-lg">
                                        {profile.avatar}
                                    </div>
                                </div>
                                <button className="absolute bottom-2 right-2 p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-violet-600 hover:scale-110 hover:bg-violet-50 active:scale-95 transition-all duration-300 group-hover:shadow-xl">
                                    <Camera size={18} />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 pb-2">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                                    {profile.name}
                                </h1>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 text-xs font-bold border border-violet-200 shadow-sm">
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
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
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
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8">

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
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                                    <User size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>

                                        {/* Email Address */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                                    <Mail size={20} />
                                                </div>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                                    <Phone size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                                    <MapPin size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
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
                                            className="group relative flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-violet-500/50"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                                        <button className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300">
                                            Change Password
                                        </button>
                                    </div>

                                    {/* Two-Factor Authentication */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account Security</h4>
                                        <div className="p-6 rounded-xl border-2 border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all duration-300">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                                                    <p className="text-xs text-slate-600 mt-1">Add an extra layer of security to your account.</p>
                                                </div>
                                                <div className="relative w-14 h-7 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-md cursor-pointer hover:scale-105 transition-transform duration-300">
                                                    <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center text-violet-600 mb-6 shadow-lg">
                                        <Bell size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Notification Preferences</h3>
                                    <p className="text-slate-600 max-w-md font-medium">
                                        Customize how you receive alerts and system updates.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
