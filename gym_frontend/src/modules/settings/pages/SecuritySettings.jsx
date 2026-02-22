import React, { useState } from 'react';
import { Shield, Lock, Smartphone, Globe, AlertTriangle, Monitor, CheckCircle, Save } from 'lucide-react';

const SecuritySettings = ({ role }) => {
    const isReadOnly = role === 'MANAGER';
    const [passwordPolicy, setPasswordPolicy] = useState({
        minLength: '10 Characters',
        expiry: 'Every 90 Days'
    });

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Shield size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Security Settings
                                    </h1>
                                    <span className="hidden sm:inline-block px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse">
                                        {isReadOnly ? 'READ-ONLY 🔒' : 'PREMIUM ✨'}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                                    {isReadOnly ? 'Viewing global security policies (Management scope)' : 'Configure security policies and access controls'}
                                </p>
                            </div>
                        </div>
                        {!isReadOnly && (
                            <button className="group flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg sm:rounded-xl text-sm font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-105 transition-all w-full lg:w-auto">
                                <Save size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                                Save Configuration
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
                {/* Password Policy Card */}
                <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 hover:shadow-xl hover:border-violet-200 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl group-hover:bg-violet-100 transition-colors">
                                <Lock size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Password Policy</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Minimum Length</label>
                                <select
                                    value={passwordPolicy.minLength}
                                    onChange={(e) => !isReadOnly && setPasswordPolicy({ ...passwordPolicy, minLength: e.target.value })}
                                    disabled={isReadOnly}
                                    className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-all duration-300 appearance-none ${isReadOnly ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'}`}
                                >
                                    <option>8 Characters</option>
                                    <option>10 Characters</option>
                                    <option>12 Characters</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Password Expiry</label>
                                <select
                                    value={passwordPolicy.expiry}
                                    onChange={(e) => !isReadOnly && setPasswordPolicy({ ...passwordPolicy, expiry: e.target.value })}
                                    disabled={isReadOnly}
                                    className={`w-full px-4 py-3 border-2 rounded-xl font-bold transition-all duration-300 appearance-none ${isReadOnly ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'}`}
                                >
                                    <option>Never</option>
                                    <option>Every 90 Days</option>
                                    <option>Every 180 Days</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2FA Card */}
                <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 hover:shadow-xl hover:border-violet-200 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl border border-amber-100 group-hover:bg-amber-100 transition-colors shrink-0">
                                <Smartphone size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-1">Two-Factor Authentication (2FA)</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md">
                                    Require OTP verification for all staff and admin logins to enhance account security.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${twoFactorEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <button
                                onClick={() => !isReadOnly && setTwoFactorEnabled(!twoFactorEnabled)}
                                disabled={isReadOnly}
                                className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-violet-500/20 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : (twoFactorEnabled ? 'bg-violet-600' : 'bg-slate-200')} `}
                            >
                                <span
                                    className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'} `}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active Sessions Card */}
                <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 hover:shadow-xl hover:border-violet-200 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                <Globe size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Active Sessions</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Current Session */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                                        <Monitor size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">Windows PC - Chrome</div>
                                        <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            Current Session • San Francisco, CA
                                        </div>
                                    </div>
                                </div>
                                <span className="self-start sm:self-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-lg uppercase tracking-wide whitespace-nowrap">
                                    Active
                                </span>
                            </div>

                            {/* Other Session */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 shrink-0">
                                        <Smartphone size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-700">iPhone 13 - Safari</div>
                                        <div className="text-xs font-medium text-slate-500">
                                            Los Angeles, CA • 2 hours ago
                                        </div>
                                    </div>
                                </div>
                                <button
                                    disabled={isReadOnly}
                                    className={`self-start sm:self-center px-4 py-2 bg-white rounded-lg text-xs font-bold transition-all shadow-sm w-full sm:w-auto ${isReadOnly ? 'text-slate-300 border-slate-100 cursor-not-allowed' : 'text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200'} `}
                                >
                                    Revoke
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
