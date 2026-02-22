import React from 'react';
import { Shield, Check, X, Users, Lock, ChevronRight, Edit2, AlertCircle } from 'lucide-react';
import { ROLES_MATRIX } from '../data/mockSettingsData';

const RolesPermissions = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Users size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Roles & Permissions
                                    </h1>
                                    <span className="hidden sm:inline-block px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse">
                                        PREMIUM ✨
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1">Manage access control and user privileges</p>
                            </div>
                        </div>
                        <button className="group flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg sm:rounded-xl text-sm font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-105 transition-all w-full lg:w-auto">
                            <Shield size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                            Create New Role
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Table Card */}
            <div className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/10 to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative z-10 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="text-left py-5 px-6 text-xs font-black uppercase tracking-widest text-slate-400">Role Name</th>
                                <th className="text-center py-5 px-6 text-xs font-black uppercase tracking-widest text-slate-400">Members</th>
                                <th className="text-center py-5 px-6 text-xs font-black uppercase tracking-widest text-slate-400">Financials</th>
                                <th className="text-center py-5 px-6 text-xs font-black uppercase tracking-widest text-slate-400">Settings</th>
                                <th className="text-center py-5 px-6 text-xs font-black uppercase tracking-widest text-slate-400">Reports</th>
                                <th className="text-right py-5 px-6 text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ROLES_MATRIX.map((role, idx) => (
                                <tr key={idx} className="group/row hover:bg-violet-50/30 transition-colors duration-200">
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${role.role === 'Super Admin' ? 'bg-purple-100 text-purple-600' :
                                                role.role === 'Manager' ? 'bg-indigo-100 text-indigo-600' :
                                                    role.role === 'Trainer' ? 'bg-emerald-100 text-emerald-600' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                <Lock size={16} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{role.role}</div>
                                                <div className="text-xs font-medium text-slate-400">{role.users || 0} Users</div>
                                            </div>
                                        </div>
                                    </td>

                                    {[
                                        role.permissions.members,
                                        role.permissions.finance,
                                        role.permissions.settings,
                                        role.permissions.reports
                                    ].map((perm, pIdx) => (
                                        <td key={pIdx} className="py-5 px-6 text-center">
                                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full shadow-sm transition-transform duration-300 group-hover/row:scale-110 ${perm
                                                ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 shadow-emerald-200'
                                                : 'bg-gradient-to-br from-red-50 to-red-100 text-red-400'
                                                }`}>
                                                {perm ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                                            </div>
                                        </td>
                                    ))}

                                    <td className="py-5 px-6 text-right">
                                        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm hover:border-violet-500 hover:text-violet-600 hover:shadow-md transition-all duration-300">
                                            <Edit2 size={12} strokeWidth={2.5} /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-amber-800 text-sm">Permission Updates</h4>
                    <p className="text-amber-700 text-xs mt-1">
                        Changes to role permissions may take up to 5 minutes to propagate to all active user sessions.
                        Users may need to re-login to see updated access rights.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RolesPermissions;
