import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, Bell, CheckCircle2, Camera, MapPin, Calendar, Activity, Save } from 'lucide-react';
import { fetchTrainerProfile, updateTrainerProfile, changeTrainerPassword } from '../../api/trainer/trainerApi';
import { X } from 'lucide-react';
import '../../styles/GlobalDesign.css';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        avatar: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await fetchTrainerProfile();
            setProfile(data);
            setFormData({
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address || '',
                avatar: data.avatar || ''
            });
        } catch (error) {
            console.error("Load Profile Error:", error);
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
        if (e) e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const updated = await updateTrainerProfile(formData);
            setProfile(updated);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: typeof error === 'string' ? error : 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        setIsSaving(true);
        try {
            await changeTrainerPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            alert("Password updated successfully!");
        } catch (error) {
            alert(error || "Failed to update password");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="h-16 w-16 border-4 border-violet-600 border-t-transparent rounded-full mb-4 animate-spin"></div>
                    <p className="text-lg font-semibold text-slate-600 tracking-tight">
                        {!profile && !loading ? 'Failed to load profile' : 'Accessing Secure Profile...'}
                    </p>
                    {!profile && !loading && (
                        <button
                            onClick={() => loadProfile()}
                            className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors"
                        >
                            Retry Connection
                        </button>
                    )}
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Profile Header Card */}
                <div className="relative bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-700">
                    <div className="h-40 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl ring-8 ring-white/50">
                                    <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-5xl font-black shadow-inner overflow-hidden">
                                        {formData.avatar ? (
                                            <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            profile.name?.charAt(0)
                                        )}
                                    </div>
                                </div>
                                <label className="absolute bottom-2 right-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-200 text-violet-600 hover:scale-110 hover:bg-violet-50 active:scale-95 transition-all duration-300 cursor-pointer group-hover:shadow-violet-200">
                                    <Camera size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            </div>

                            <div className="flex-1 pb-4">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                        {profile.name}
                                    </h1>
                                    <div className="mt-1 px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-violet-200">
                                        {profile.role.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-black border border-emerald-100 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        {profile.status}
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-2xl text-xs font-black border border-slate-100 shadow-sm">
                                        <Calendar size={14} className="text-slate-400" />
                                        Since {profile.joinedDate}
                                    </div>
                                </div>
                            </div>

                            <div className="md:mb-4">
                                <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 hover:shadow-2xl hover:bg-slate-800 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-emerald-400" />
                                    Verified Professional
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3 space-y-3">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
                                className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-sm font-black tracking-wide transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-violet-600 text-white shadow-xl shadow-violet-200 -translate-x-2'
                                    : 'bg-white text-slate-500 hover:bg-violet-50 hover:text-violet-600 border border-slate-100'
                                    }`}
                            >
                                <tab.icon size={22} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="lg:col-span-9">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 md:p-12 animate-in slide-in-from-bottom-8 duration-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/50 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>

                            {message.text && (
                                <div className={`mb-10 p-5 rounded-2xl flex items-center gap-4 text-sm font-bold border-2 animate-in fade-in slide-in-from-top-4 ${message.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-lg shadow-emerald-50'
                                    : 'bg-red-50 text-red-700 border-red-100 shadow-lg shadow-red-50'
                                    }`}>
                                    <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-emerald-200/50' : 'bg-red-200/50'}`}>
                                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <Shield size={20} />}
                                    </div>
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <form onSubmit={handleSave} className="space-y-10 relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Professional Dossier</h3>
                                            <p className="text-slate-500 font-bold mt-2">Update your public identity and contact gateways</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { label: 'Display Name', name: 'name', type: 'text', icon: User, placeholder: 'Test Trainer' },
                                            { label: 'Secure Email', name: 'email', type: 'email', icon: Mail, placeholder: 'trainer@gym.com' },
                                            { label: 'Direct Line', name: 'phone', type: 'text', icon: Phone, placeholder: 'Enter phone' },
                                            { label: 'Base Location', name: 'address', type: 'text', icon: MapPin, placeholder: 'Enter city, country' }
                                        ].map((field) => (
                                            <div key={field.name} className="space-y-3">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                                <div className="relative group/field">
                                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within/field:text-violet-600 transition-colors duration-300">
                                                        <field.icon size={20} />
                                                    </div>
                                                    <input
                                                        type={field.type}
                                                        name={field.name}
                                                        value={formData[field.name]}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all duration-300"
                                                        placeholder={field.placeholder}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-10 flex border-t border-slate-50">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="group relative flex items-center justify-center px-12 py-5 rounded-[1.5rem] font-black text-white shadow-2xl transition-all duration-300 transform hover:-translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-700"></div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-fuchsia-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            {isSaving ? (
                                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin relative mr-4"></div>
                                            ) : (
                                                <Save size={24} className="mr-3 relative transition-transform duration-500 group-hover:rotate-[360deg]" />
                                            )}
                                            <span className="relative text-lg tracking-tight">{isSaving ? 'Encrypting...' : 'Deploy Profile Updates'}</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-slate-900 text-white rounded-xl"><Lock size={20} /></div> Access Control
                                            </h4>
                                            <p className="text-slate-500 font-bold">Manage your cryptographic primary access key</p>
                                        </div>
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-xl"
                                        >
                                            Modify Passkey
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30 transition-all duration-300 group/secure">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl group-hover/secure:scale-110 transition-transform"><Shield size={24} /></div>
                                                <div className="relative w-14 h-8 bg-emerald-500 rounded-full shadow-inner p-1 cursor-pointer">
                                                    <div className="absolute right-1 w-6 h-6 bg-white rounded-full shadow-sm"></div>
                                                </div>
                                            </div>
                                            <h5 className="text-lg font-black text-slate-900 mb-2">Biometric Bridge</h5>
                                            <p className="text-slate-400 text-sm font-bold">Enabled via local security subsystem (FaceID/Fingerprint)</p>
                                        </div>

                                        <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 group/secure">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover/secure:scale-110 transition-transform"><Bell size={24} /></div>
                                                <div className="relative w-14 h-8 bg-slate-200 rounded-full shadow-inner p-1 cursor-pointer">
                                                    <div className="absolute left-1 w-6 h-6 bg-white rounded-full shadow-sm"></div>
                                                </div>
                                            </div>
                                            <h5 className="text-lg font-black text-slate-900 mb-2">Login Alerts</h5>
                                            <p className="text-slate-400 text-sm font-bold">Receive instant signals for new session initiations</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
                                    <div className="w-32 h-32 bg-violet-50 rounded-[2.5rem] flex items-center justify-center text-violet-600 mb-8 shadow-inner ring-4 ring-white relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-violet-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                        <Bell size={64} className="group-hover:rotate-12 transition-transform duration-500" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Signal Matrix</h3>
                                    <p className="text-slate-400 max-w-sm font-bold text-lg leading-relaxed">Customize your cognitive load by filtering system-wide notifications and alerts.</p>
                                    <button className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all">Establish Protocols</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isSaving && setShowPasswordModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-300 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 to-indigo-600"></div>

                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Modify Passkey</h3>
                                <p className="text-slate-500 font-bold text-sm mt-1">Establish new cryptographically secure credentials</p>
                            </div>
                            <button onClick={() => setShowPasswordModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            {[
                                { label: 'Current Key', name: 'currentPassword', type: 'password', icon: Lock },
                                { label: 'New Primary Key', name: 'newPassword', type: 'password', icon: Shield },
                                { label: 'Validate New Key', name: 'confirmPassword', type: 'password', icon: CheckCircle2 }
                            ].map((f) => (
                                <div key={f.name} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-violet-600 transition-colors">
                                            <f.icon size={20} />
                                        </div>
                                        <input
                                            type={f.type}
                                            value={passwordData[f.name]}
                                            onChange={(e) => setPasswordData({ ...passwordData, [f.name]: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:border-violet-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-4"
                                >
                                    {isSaving ? (
                                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Shield size={22} className="text-violet-400" />
                                            Update Keys
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
