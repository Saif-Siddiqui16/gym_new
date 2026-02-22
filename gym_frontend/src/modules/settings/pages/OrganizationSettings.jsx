import React, { useState } from 'react';
import { ORGANIZATION } from '../data/mockSettingsData';
import { Building, Mail, Phone, MapPin, Globe, CreditCard, Camera, Save, ArrowRight } from 'lucide-react';

const OrganizationSettings = ({ role }) => {
    const isManager = role === 'MANAGER';
    const [formData, setFormData] = useState({
        ...ORGANIZATION,
        openingHours: '06:00 AM - 10:00 PM',
        wifiPassword: 'KiaaanFitness@2024'
    });

    const handleChange = (e) => {
        if (isManager && !['openingHours', 'wifiPassword'].includes(e.target.name)) return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Building size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        {isManager ? 'Branch Operational Details' : 'Organization Settings'}
                                    </h1>
                                    <span className="hidden sm:inline-block px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse">
                                        {isManager ? 'BRANCH SCOPE 📍' : 'GLOBAL SCOPE 🌐'}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                                    {isManager ? 'Update your specific branch details and operation hours' : "Manage your gym's brand identity and global contact details"}
                                </p>
                            </div>
                        </div>
                        <button className="group flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg sm:rounded-xl text-sm font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-105 transition-all w-full lg:w-auto">
                            <Save size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Logo Section */}
                <div className="lg:col-span-1">
                    <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 hover:shadow-xl hover:border-violet-200 transition-all duration-300 h-full text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative mb-4 sm:mb-6">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-xl shadow-violet-200">
                                    <div className="w-full h-full rounded-full border-4 border-white bg-slate-50 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building size={40} className="sm:w-12 sm:h-12 text-slate-300" />
                                        )}
                                    </div>
                                </div>
                                {!isManager && (
                                    <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2.5 sm:p-3 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 hover:scale-110 transition-all duration-300 border-4 border-white">
                                        <Camera size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                                    </button>
                                )}
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-2">Brand Logo</h3>
                            <p className="text-slate-500 text-xs sm:text-sm font-medium mb-4 sm:mb-6 max-w-xs mx-auto">
                                {isManager ? 'Global organization logo (Managed by Admin)' : 'Upload a high-resolution logo. Recommended size: 512x512px.'}
                            </p>
                            {!isManager && (
                                <button className="w-full py-2.5 sm:py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-lg sm:rounded-xl text-sm font-bold hover:border-violet-500 hover:text-violet-600 transition-all duration-300">
                                    Upload New Logo
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 hover:shadow-xl hover:border-violet-200 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2">
                                <h3 className="text-sm font-black text-violet-600 uppercase tracking-widest">Global Brand Identity</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Read-only for Branch Scope</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Organization Name</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Building size={18} className="text-slate-400 group-focus-within/input:text-violet-500 transition-colors" />
                                    </div>
                                    <input
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={isManager}
                                        className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl font-bold transition-all duration-300 ${isManager ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'}`}
                                        placeholder="Enter organization name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-slate-400 group-focus-within/input:text-violet-500 transition-colors" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isManager}
                                        className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl font-bold transition-all duration-300 ${isManager ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'}`}
                                        placeholder="admin@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Phone Number</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone size={18} className="text-slate-400 group-focus-within/input:text-violet-500 transition-colors" />
                                    </div>
                                    <input
                                        name="phone"
                                        type="text"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={isManager}
                                        className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl font-bold transition-all duration-300 ${isManager ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'}`}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Address</label>
                                <div className="relative group/input">
                                    <div className="absolute top-4 left-4 flex items-start pointer-events-none">
                                        <MapPin size={18} className="text-slate-400 group-focus-within/input:text-violet-500 transition-colors" />
                                    </div>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        disabled={isManager}
                                        rows="3"
                                        className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl font-bold transition-all duration-300 resize-none ${isManager ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'}`}
                                        placeholder="Enter full address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Timezone</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Globe size={18} className="text-slate-400 group-focus-within/input:text-violet-500 transition-colors" />
                                    </div>
                                    <select
                                        name="timezone"
                                        value={formData.timezone}
                                        onChange={handleChange}
                                        disabled={isManager}
                                        className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl font-bold transition-all duration-300 appearance-none cursor-pointer ${isManager ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-violet-500'}`}
                                    >
                                        <option>PST (UTC-8)</option>
                                        <option>EST (UTC-5)</option>
                                        <option>IST (UTC+5:30)</option>
                                    </select>
                                    {!isManager && (
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <ArrowRight size={16} className="text-slate-400 rotate-90" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Currency</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CreditCard size={18} className="text-slate-400 group-focus-within/input:text-violet-500 transition-colors" />
                                    </div>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        disabled={isManager}
                                        className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl font-bold transition-all duration-300 appearance-none cursor-pointer ${isManager ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-violet-500'}`}
                                    >
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                        <option>INR (₹)</option>
                                    </select>
                                    {!isManager && (
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <ArrowRight size={16} className="text-slate-400 rotate-90" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Local Details Section */}
                    <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 hover:shadow-xl hover:border-violet-200 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-violet-100"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="border-b border-slate-100 pb-2 mb-2">
                                <h3 className="text-sm font-black text-violet-600 uppercase tracking-widest">Local Operational Details</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active for Branch Scope</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Opening Hours</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Globe size={18} className="text-slate-400 group-focus-within/input:text-violet-500 transition-colors" />
                                        </div>
                                        <input
                                            name="openingHours"
                                            type="text"
                                            value={formData.openingHours}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3.5 bg-violet-50/50 border-2 border-violet-100 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                            placeholder="e.g. 06:00 AM - 10:00 PM"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Guest Wi-Fi Password</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone size={18} className="text-slate-400 group-focus-within/input:text-violet-500 transition-colors" />
                                        </div>
                                        <input
                                            name="wifiPassword"
                                            type="text"
                                            value={formData.wifiPassword}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3.5 bg-violet-50/50 border-2 border-violet-100 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                            placeholder="Set Wi-Fi password"
                                        />
                                    </div>
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
