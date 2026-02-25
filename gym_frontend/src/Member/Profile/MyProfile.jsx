import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, Bell, CheckCircle2, Camera, MapPin, Calendar, Activity, Zap, Save, Snowflake, Flame, Dumbbell, Clock, Pause, Play } from 'lucide-react';
import { fetchMemberProfile, updateMemberProfile, freezeMembership, unfreezeMembership } from '../../api/member/memberApi';
import '../../styles/GlobalDesign.css';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isFreezing, setIsFreezing] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        const data = await fetchMemberProfile();
        setProfile(data);
        setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address || ''
        });
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            setIsSaving(false);
            return;
        }

        try {
            const updated = await updateMemberProfile(formData);
            setProfile(updated);

            // clear password fields
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFreezeMembership = async () => {
        setIsFreezing(true);
        try {
            const updated = await freezeMembership();
            setProfile(updated);
            setMessage({ type: 'success', text: 'Membership frozen successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to freeze membership.' });
        } finally {
            setIsFreezing(false);
        }
    };

    const handleUnfreezeMembership = async () => {
        setIsFreezing(true);
        try {
            const updated = await unfreezeMembership();
            setProfile(updated);
            setMessage({ type: 'success', text: 'Membership unfrozen successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to unfreeze membership.' });
        } finally {
            setIsFreezing(false);
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Expired': return 'bg-red-50 text-red-700 border-red-200';
            case 'Payment Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Frozen': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
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

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Profile Header Card */}
                <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
                    {/* Gradient Background Banner */}
                    <div className="h-40 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
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
                                <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                                    {profile.name}
                                </h1>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 text-xs font-bold border border-violet-200 shadow-sm">
                                        {profile.plan}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusBadgeColor(profile.membershipStatus)}`}>
                                        {profile.membershipStatus === 'Active' && <CheckCircle2 size={14} />}
                                        {profile.membershipStatus === 'Frozen' && <Snowflake size={14} />}
                                        {profile.membershipStatus === 'Expired' && <Clock size={14} />}
                                        {profile.membershipStatus === 'Payment Pending' && <Zap size={14} />}
                                        {profile.membershipStatus}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm">
                                        <Calendar size={14} className="text-slate-500" />
                                        Joined {profile.joinedDate}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button className="md:mb-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200 hover:shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2">
                                <CheckCircle2 size={18} />
                                Verified Member
                            </button>
                        </div>
                    </div>
                </div>

                {/* Membership Details & Benefit Wallet */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Membership Details Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Membership Details</h3>
                                <p className="text-sm text-slate-600 font-medium">Your current plan information</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl">
                                <Activity size={24} className="text-violet-600" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Plan Name</p>
                                <p className="text-lg font-bold text-slate-900">{profile.plan}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
                                    <p className="text-sm font-bold text-slate-900">{new Date(profile.membershipStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Expiry Date</p>
                                    <p className="text-sm font-bold text-slate-900">{new Date(profile.membershipExpiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Freeze/Unfreeze Button - Only visible for Admin/Manager */}
                        {(profile.currentUserRole === 'ADMIN' || profile.currentUserRole === 'MANAGER') && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                {profile.membershipStatus === 'Active' ? (
                                    <button
                                        onClick={handleFreezeMembership}
                                        disabled={isFreezing}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isFreezing ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Pause size={18} />
                                                Freeze Membership
                                            </>
                                        )}
                                    </button>
                                ) : profile.membershipStatus === 'Frozen' ? (
                                    <button
                                        onClick={handleUnfreezeMembership}
                                        disabled={isFreezing}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isFreezing ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Play size={18} />
                                                Unfreeze Membership
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <p className="text-xs font-bold text-slate-500">Freeze/Unfreeze not available for {profile.membershipStatus} status</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Benefit Wallet Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Benefit Wallet</h3>
                                <p className="text-sm text-slate-600 font-medium">Your available credits</p>
                            </div>
                            <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 text-xs font-bold border border-violet-200 shadow-sm">
                                {profile.planValidity}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Sauna Sessions */}
                            <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Flame size={20} className="text-orange-600" />
                                    </div>
                                    <span className="text-2xl font-black text-orange-600">{profile.benefitWallet.saunaSessions}</span>
                                </div>
                                <p className="text-xs font-bold text-orange-900 uppercase tracking-wider">Sauna Sessions</p>
                                <p className="text-[10px] text-orange-700 mt-1 font-medium">Left</p>
                            </div>

                            {/* Ice Bath Credits */}
                            <div className="p-5 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-100 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Snowflake size={20} className="text-cyan-600" />
                                    </div>
                                    <span className="text-2xl font-black text-cyan-600">{profile.benefitWallet.iceBathCredits}</span>
                                </div>
                                <p className="text-xs font-bold text-cyan-900 uppercase tracking-wider">Ice Bath Credits</p>
                                <p className="text-[10px] text-cyan-700 mt-1 font-medium">Left</p>
                            </div>

                            {/* PT Sessions */}
                            <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 hover:shadow-lg transition-all duration-300 col-span-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Dumbbell size={20} className="text-violet-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-violet-900 uppercase tracking-wider">PT Sessions Remaining</p>
                                            <p className="text-[10px] text-violet-700 mt-0.5 font-medium">Personal Training</p>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-black text-violet-600">{profile.benefitWallet.ptSessions}</span>
                                </div>
                            </div>
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
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-105'
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
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 animate-in slide-in-from-right duration-500">

                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${message.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <Shield size={18} />}
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Personal Information</h3>
                                        <p className="text-sm text-slate-600 font-medium">Update your profile details and contact information.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                                    <User size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-violet-200 transition-all duration-300 shadow-sm"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                                    <Mail size={20} />
                                                </div>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    readOnly
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-500 text-sm font-bold cursor-not-allowed transition-all duration-300 shadow-sm"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                                    <Phone size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-violet-200 transition-all duration-300 shadow-sm"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Location</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                                    <MapPin size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-violet-200 transition-all duration-300 shadow-sm"
                                                    placeholder="Enter city, country"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-100">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="group relative flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-violet-500/50 w-full md:w-auto"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            {isSaving ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative mr-2"></div>
                                            ) : (
                                                <Save size={20} className="mr-2 relative transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                                            )}
                                            <span className="relative z-10">{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Security Settings</h3>
                                        <p className="text-sm text-slate-600 font-medium">Manage your password and account security</p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-100">
                                        <h4 className="text-red-700 font-bold flex items-center gap-2 mb-2">
                                            <Lock size={20} /> Password Management
                                        </h4>
                                        <p className="text-red-800/70 text-sm font-medium">It's recommended to update your password every 90 days for maximum security.</p>
                                        <form onSubmit={handleSave} className="space-y-4">
                                            <div>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder="New Password"
                                                    className="w-full mt-4 px-4 py-3 bg-white border border-red-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Confirm New Password"
                                                    className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:outline-none transition-all"
                                                />
                                            </div>
                                            <button type="submit" disabled={isSaving || !formData.password} className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                                {isSaving ? 'Updating...' : 'Change Password'}
                                            </button>
                                        </form>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest px-1">Account Security</h4>
                                        <div className="p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-violet-100 transition-all duration-300 group cursor-pointer">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">Two-Factor Authentication</p>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">Add an extra layer of security to your account.</p>
                                                </div>
                                                <div className="relative w-12 h-6 bg-slate-300 rounded-full shadow-inner transition-all hover:bg-slate-400">
                                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all text-emerald-500"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center text-violet-600 mb-6 shadow-inner">
                                        <Bell size={40} className="animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Notification Preferences</h3>
                                    <p className="text-slate-500 max-w-sm font-medium leading-relaxed">Customize how you receive alerts, session reminders, and system updates.</p>
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
