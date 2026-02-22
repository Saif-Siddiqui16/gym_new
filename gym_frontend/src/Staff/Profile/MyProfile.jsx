import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, Bell, CheckCircle2, Camera, MapPin, Calendar, Activity, Save, AlertTriangle } from 'lucide-react';
import { fetchStaffProfile, updateStaffProfile } from '../../api/staff/staffApi';
import '../../styles/GlobalDesign.css';

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-violet-600 font-bold bg-violet-50 px-4 py-2 rounded-xl animate-pulse">Loading profile...</p>
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
                    className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all"
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
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-violet-50/30 min-h-screen font-sans animate-fadeIn">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Profile Header Card */}
                <div className="group relative bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 opacity-95"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="relative px-8 pb-8 pt-32">
                        <div className="flex flex-col md:flex-row md:items-end gap-8 -mt-20">
                            <div className="relative group/avatar">
                                <div className="w-40 h-40 rounded-[32px] bg-white p-2 shadow-2xl transform group-hover/avatar:scale-105 transition-transform duration-300 rotate-3 group-hover/avatar:rotate-0">
                                    <div className="w-full h-full rounded-[24px] bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 text-6xl font-black shadow-inner">
                                        {profile.avatar}
                                    </div>
                                </div>
                                <button className="absolute bottom-2 right-2 p-3 bg-white rounded-2xl shadow-lg border border-slate-100 text-violet-600 hover:bg-violet-50 hover:scale-110 active:scale-95 transition-all">
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
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-200 transform scale-105'
                                    : 'bg-white text-slate-500 hover:bg-violet-50 hover:text-violet-700 shadow-sm border border-slate-100'
                                    }`}
                            >
                                <tab.icon size={20} strokeWidth={2.5} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 md:p-10 animate-in slide-in-from-right duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

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
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within:text-violet-500 transition-colors">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within:text-violet-500 transition-colors">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within:text-violet-500 transition-colors">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within:text-violet-500 transition-colors">Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                                    placeholder="Enter city, country"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-100">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <div className="p-8 rounded-[32px] bg-red-50 border border-red-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                                            <Lock size={32} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-red-900 font-bold text-lg mb-1">Password Management</h4>
                                            <p className="text-red-700/80 text-sm font-medium leading-relaxed">It's recommended to update your password every 90 days to ensure maximum security for your account.</p>
                                        </div>
                                        <button className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-red-300 hover:-translate-y-0.5 transition-all">
                                            Change Password
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Account Security</h4>
                                        <div className="p-6 rounded-[28px] border-2 border-slate-100 bg-white hover:border-violet-100 transition-colors space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                                        <Shield size={24} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-bold text-slate-800">Two-Factor Authentication</p>
                                                        <p className="text-xs text-slate-400 font-bold mt-0.5">Add an extra layer of security to your account.</p>
                                                    </div>
                                                </div>
                                                <div className="relative group cursor-pointer">
                                                    <div className="w-14 h-8 bg-emerald-500 rounded-full transition-colors shadow-inner"></div>
                                                    <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform group-hover:scale-110"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
                                    <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center text-violet-300 mb-6 animate-bounce-slow">
                                        <Bell size={48} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-2">Notification Preferences</h3>
                                    <p className="text-slate-500 max-w-sm font-medium leading-relaxed">Customize how you receive alerts, system updates, and important announcements.</p>
                                    <button className="mt-8 px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-violet-50 hover:text-violet-600 transition-all">
                                        Manage Settings
                                    </button>
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
