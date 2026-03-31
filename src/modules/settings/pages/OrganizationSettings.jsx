import React, { useState, useEffect } from 'react';
import { Building2, UploadCloud, Globe, DollarSign, Calendar, Save, Loader } from 'lucide-react';
import { getTenantSettings, updateTenantSettings } from '../../../api/admin/settingsApi';
import { toast } from 'react-hot-toast';

const OrganizationSettings = ({ role }) => {
    const isManager = role === 'MANAGER';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        location: '',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        fiscalYearStart: 'April',
        referralReward: 500
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getTenantSettings();
            setFormData({
                name: data.name || '',
                phone: data.phone || '',
                email: data.email || '',
                location: data.location || '',
                timezone: data.timezone || 'Asia/Kolkata',
                currency: data.currency || 'INR',
                fiscalYearStart: data.fiscalYearStart || 'April',
                referralReward: data.referralReward || 500
            });
            if (data.logo) {
                setLogoPreview(data.logo);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                location: formData.location,
                timezone: formData.timezone,
                currency: formData.currency,
                fiscalYearStart: formData.fiscalYearStart,
                referralReward: parseInt(formData.referralReward)
            };
            if (logoFile) {
                payload.logo = logoFile;
            }

            await updateTenantSettings(payload);
            toast.success('Organization settings updated successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoFile(reader.result);
            };
            reader.readAsDataURL(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn p-0 md:p-6">
            {/* Header */}
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-fuchsia-600 rounded-3xl blur-3xl opacity-10 pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl shadow-primary/30/10 border border-white/50 p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent font-black tracking-tighter">Organization Settings</h1>
                        <p className="text-slate-400 text-[10px] sm:text-xs mt-1 uppercase tracking-widest font-bold">Manage your brand identity and global localization</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-primary via-primary to-fuchsia-600 text-white rounded-2xl text-sm font-black shadow-2xl shadow-primary/30/25 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto uppercase tracking-widest disabled:opacity-50"
                    >
                        {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} strokeWidth={3} />}
                        {saving ? 'Saving...' : 'Save Brand'}
                    </button>
                </div>

                {/* Secondary Save Button with proper spacing */}
                <div className="mt-8 flex justify-end px-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary px-10 h-12 shadow-xl shadow-primary/20 flex items-center gap-2 hover:-translate-y-0.5 transition-all"
                    >
                        {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? 'Saving...' : 'Save Brand Identity'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-full overflow-hidden">
                {/* Gym Logo Section */}
                <div className="bg-white/80 backdrop-blur-md rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center group/card transition-all duration-300 hover:shadow-xl hover:border-violet-100 w-full min-w-0">
                    <div className="w-full mb-8 text-center pt-2">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Brand Logo</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Appears on public website and receipts</p>
                    </div>

                    <div className="w-full aspect-square border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-primary-light/50 hover:border-violet-300 transition-all cursor-pointer group relative overflow-hidden">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo Preview" className="absolute inset-0 w-full h-full object-contain p-4 bg-white" />
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-violet-200 transition-all duration-300">
                                    <UploadCloud className="text-slate-400 group-hover:text-primary transition-colors" size={32} />
                                </div>
                                <div className="text-center px-2">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-primary transition-colors">Upload Logo</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">JPG, PNG up to 2MB</p>
                                </div>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleLogoChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Organization Details Section */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100 p-6 sm:p-10 transition-all duration-300 hover:shadow-xl hover:border-violet-100 w-full min-w-0 overflow-hidden">
                    <div className="mb-10 pb-6 border-b border-slate-50 flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                            <Building2 size={24} strokeWidth={3} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Organization Profile</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">Core business details and fiscal localization</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 font-black">
                        {/* Organization Name */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Legal Organization Name</label>
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full h-14 pl-14 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                                />
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors pointer-events-none">
                                    <Building2 size={20} strokeWidth={3} />
                                </div>
                            </div>
                        </div>

                        {/* Public Phone */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Public Phone (for Reports)</label>
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full h-14 pl-14 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                                />
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors pointer-events-none">
                                    <Globe size={20} strokeWidth={3} />
                                </div>
                            </div>
                        </div>

                        {/* Public Email */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Public Email (for Reports)</label>
                            <div className="relative group/input">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full h-14 pl-14 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                                />
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors pointer-events-none">
                                    <Globe size={20} strokeWidth={3} />
                                </div>
                            </div>
                        </div>

                        {/* Business Address */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Business Address (for Reports)</label>
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full h-14 pl-14 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                                />
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors pointer-events-none">
                                    <Building2 size={20} strokeWidth={3} />
                                </div>
                            </div>
                        </div>

                        {/* Fiscal Year Start */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Fiscal Year Start</label>
                            <div className="relative group/input">
                                <select
                                    name="fiscalYearStart"
                                    value={formData.fiscalYearStart}
                                    onChange={handleChange}
                                    className="w-full h-14 pl-14 pr-10 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 appearance-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer font-bold"
                                >
                                    <option>April</option>
                                    <option>January</option>
                                </select>
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors pointer-events-none">
                                    <Calendar size={20} strokeWidth={3} />
                                </div>
                            </div>
                        </div>

                        {/* Referral Reward */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Referral Reward (Points)</label>
                            <div className="relative group/input">
                                <input
                                    type="number"
                                    name="referralReward"
                                    value={formData.referralReward}
                                    onChange={handleChange}
                                    placeholder="Enter points (e.g. 500)"
                                    className="w-full h-14 pl-14 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                                />
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors pointer-events-none">
                                    <DollarSign size={20} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationSettings;
