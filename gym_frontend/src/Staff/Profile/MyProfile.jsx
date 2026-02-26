import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, Bell, CheckCircle2, Camera, MapPin, Calendar, Activity, Save, AlertTriangle, Banknote } from 'lucide-react';
import { fetchStaffProfile, updateStaffProfile, changeStaffPassword } from '../../api/staff/staffApi';
import '../../styles/GlobalDesign.css';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [earnings, setEarnings] = useState([]);
    const [loadingEarnings, setLoadingEarnings] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

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

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'earnings') {
            const loadEarnings = async () => {
                try {
                    setLoadingEarnings(true);
                    const { fetchStaffEarnings } = await import('../../api/staff/staffApi');
                    const data = await fetchStaffEarnings();
                    setEarnings(data);
                } catch (error) {
                    console.error("Error loading earnings:", error);
                } finally {
                    setLoadingEarnings(false);
                }
            };
            loadEarnings();
        }
    }, [activeTab]);

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
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            return;
        }

        try {
            setIsSaving(true);
            setMessage({ type: '', text: '' });
            await changeStaffPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.toString() });
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'earnings', label: 'My Payslips', icon: Banknote },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

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

    return (
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-violet-50/30 min-h-screen font-sans animate-fadeIn">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="group relative bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 opacity-95"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="relative px-8 pb-8 pt-32">
                        <div className="flex flex-col md:flex-row md:items-end gap-8 -mt-20">
                            <div className="relative group/avatar">
                                <div className="w-40 h-40 rounded-[32px] bg-white p-2 shadow-2xl transform group-hover/avatar:scale-105 transition-transform duration-300 rotate-3 group-hover/avatar:rotate-0">
                                    <div className="w-full h-full rounded-[24px] bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 text-6xl font-black shadow-inner">
                                        {profile.avatar || profile.avatarSeed || profile.name.charAt(0)}
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
                                        {profile.role?.replace('_', ' ') || 'Staff'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-100 text-xs font-bold border border-emerald-400/30 shadow-sm">
                                        <Activity size={14} className="text-emerald-300" /> {profile.status || 'Active'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-violet-100 text-xs font-bold border border-white/20 shadow-sm">
                                        <Calendar size={14} className="text-violet-200" /> Member since {profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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

                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 md:p-10 animate-in slide-in-from-right duration-500 relative overflow-hidden min-h-[400px]">
                            {activeTab === 'personal' && (
                                <form onSubmit={handleSave} className="space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3 group">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-violet-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700"
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isSaving} className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-black shadow-lg">
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            )}

                            {activeTab === 'earnings' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h3 className="text-2xl font-black text-slate-800 mb-6">Payroll History</h3>
                                    {loadingEarnings ? (
                                        <div className="flex justify-center py-20">
                                            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : earnings.length > 0 ? (
                                        <div className="space-y-4">
                                            {earnings.map(record => (
                                                <div key={record.id} className="group p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-violet-100 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
                                                            <Banknote size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800">{record.month}</p>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{record.status}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end gap-8">
                                                        <div className="text-right">
                                                            <p className="text-xl font-black text-slate-900">₹{record.total.toLocaleString()}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Net Payable</p>
                                                        </div>
                                                        <button
                                                            className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-violet-600 hover:border-violet-200 hover:shadow-sm transition-all"
                                                            onClick={() => alert('Download coming soon!')}
                                                        >
                                                            <Save size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mx-auto mb-4">
                                                <Activity size={32} />
                                            </div>
                                            <p className="text-slate-500 font-bold">No payroll records found yet.</p>
                                            <p className="text-slate-400 text-xs mt-1">Payrolls appear here once created by the administrator.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8 animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl">
                                            <Lock size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800">Security Settings</h3>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-6 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-violet-500 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-6 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-violet-500 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-6 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-violet-500 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        {message.text && activeTab === 'security' && (
                                            <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                                {message.text}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-black shadow-lg shadow-violet-200 hover:bg-violet-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="p-8 text-center bg-slate-50 rounded-3xl">Notification preferences coming soon.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
