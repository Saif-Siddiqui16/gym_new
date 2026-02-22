import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, Bell, CheckCircle2, Camera, MapPin, Calendar, Activity } from 'lucide-react';
import { fetchManagerProfile, updateManagerProfile } from '../../api/manager/managerApi';
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
            const data = await fetchManagerProfile();
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
            const updated = await updateManagerProfile(formData);
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
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-300">
                    <div className="h-32 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-50 blur-2xl"></div>
                    </div>
                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-12">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl ring-4 ring-violet-100">
                                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-5xl font-black">
                                        {profile.avatar}
                                    </div>
                                </div>
                                <button className="absolute bottom-2 right-2 p-2.5 bg-white rounded-xl shadow-lg border border-violet-100 text-violet-600 hover:scale-110 hover:rotate-6 active:scale-95 transition-all duration-300">
                                    <Camera size={18} />
                                </button>
                            </div>

                            <div className="flex-1 pb-2">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile.name}</h1>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 text-xs font-bold border border-violet-200">
                                        {profile.role.replace('_', ' ')}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase">
                                        <Activity size={14} className="text-green-500" /> {profile.status}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase">
                                        <Calendar size={14} className="text-blue-400" /> Joined {profile.joinedDate}
                                    </span>
                                </div>
                            </div>

                            <button className="md:mb-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                                <CheckCircle2 size={18} /> Manager Account
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-500/50'
                                    : 'text-gray-500 hover:bg-white border border-transparent hover:border-violet-100 hover:text-violet-600 hover:shadow-md'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 hover:shadow-2xl hover:border-violet-200 transition-all duration-300">

                            {message.text && (
                                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    <Activity size={18} /> {message.text}
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 h-12 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all hover:border-slate-300"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 h-12 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all hover:border-slate-300"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 h-12 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all hover:border-slate-300"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 h-12 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all hover:border-slate-300"
                                                    placeholder="Enter city, country"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <CheckCircle2 size={18} />
                                            )}
                                            Save Profile Changes
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8">
                                    <div className="p-6 rounded-[28px] bg-red-50/30 border border-red-100/50">
                                        <h4 className="text-red-700 font-bold flex items-center gap-2">
                                            <Lock size={18} /> Password Management
                                        </h4>
                                        <p className="text-red-600/70 text-sm mt-1 font-medium">It's recommended to update your password every 90 days for maximum security.</p>
                                        <button className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 active:scale-95 transition-all">
                                            Change Password
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest px-1">Account Security</h4>
                                        <div className="p-6 rounded-[28px] border border-gray-100 bg-gray-50/30 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">Two-Factor Authentication</p>
                                                    <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                                                </div>
                                                <div className="w-12 h-6 bg-green-500 rounded-full relative">
                                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                        <Bell size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Notification Preferences</h3>
                                    <p className="text-gray-500 max-w-xs mt-2 font-medium">Customize how you receive alerts and system updates.</p>
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
