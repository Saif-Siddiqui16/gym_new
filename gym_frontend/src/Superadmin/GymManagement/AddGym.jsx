import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, User, Mail, Phone, Home, CheckCircle2, Sparkles } from 'lucide-react';
import { addGym } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const AddGym = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        gymName: '',
        branchName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active',
    });

    const statusOptions = ['Active', 'Suspended'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (status) => {
        setFormData((prev) => ({ ...prev, status }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addGym({
                ...formData,
                owner: formData.ownerName,
                location: formData.address
            });
            navigate('/superadmin/gyms/all');
        } catch (error) {
            console.error('Error adding gym:', error);
            alert('Failed to add gym');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 lg:p-8">
            {/* Premium Header with Back Button */}
            <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <button
                                    onClick={() => navigate('/superadmin/gyms/all')}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 hover:from-violet-100 hover:to-purple-100 flex items-center justify-center text-slate-600 hover:text-violet-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 flex-shrink-0"
                                >
                                    <ArrowLeft size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                                </button>
                                <div className="min-w-0">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Add New Gym
                                    </h1>
                                    <p className="text-slate-600 text-xs sm:text-sm mt-1">Register a new gym branch in the system</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Form Card */}
            <div className="max-w-5xl mx-auto">
                <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Gradient Accent Bar */}
                    <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"></div>

                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                        {/* Gym Information Section */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                    <Building2 size={16} className="sm:w-5 sm:h-5 text-violet-600" strokeWidth={2.5} />
                                </div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900">Gym Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {/* Gym Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                        <Building2 size={14} className="sm:w-4 sm:h-4 text-violet-500" />
                                        Gym Name
                                    </label>
                                    <input
                                        type="text"
                                        name="gymName"
                                        value={formData.gymName}
                                        onChange={handleChange}
                                        placeholder="e.g. FitPulse Elite"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 hover:border-violet-300 transition-all duration-300 shadow-sm"
                                        required
                                    />
                                </div>

                                {/* Branch Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                        <MapPin size={14} className="sm:w-4 sm:h-4 text-blue-500" />
                                        Branch Name
                                    </label>
                                    <input
                                        type="text"
                                        name="branchName"
                                        value={formData.branchName}
                                        onChange={handleChange}
                                        placeholder="e.g. Downtown Hub"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-blue-300 transition-all duration-300 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Owner & Contact Section */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                                    <User size={16} className="sm:w-5 sm:h-5 text-emerald-600" strokeWidth={2.5} />
                                </div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900">Owner & Contact Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {/* Owner Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        <User size={14} className="sm:w-4 sm:h-4 text-emerald-500" />
                                        Owner Name
                                    </label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-emerald-300 transition-all duration-300 shadow-sm"
                                        required
                                    />
                                </div>

                                {/* Contact Phone */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                        <Phone size={14} className="sm:w-4 sm:h-4 text-orange-500" />
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 hover:border-orange-300 transition-all duration-300 shadow-sm"
                                        required
                                    />
                                </div>

                                {/* Email Address */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                        <Mail size={14} className="sm:w-4 sm:h-4 text-pink-500" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@gym.com"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 hover:border-pink-300 transition-all duration-300 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location & Status Section */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Home size={16} className="sm:w-5 sm:h-5 text-indigo-600" strokeWidth={2.5} />
                                </div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900">Location & Status</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {/* Address */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                        <MapPin size={14} className="sm:w-4 sm:h-4 text-indigo-500" />
                                        Physical Address
                                    </label>
                                    <textarea
                                        name="address"
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Full street address, City, State, ZIP"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-indigo-300 transition-all duration-300 shadow-sm resize-none"
                                        required
                                    />
                                </div>

                                {/* Status Dropdown */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        <CheckCircle2 size={14} className="sm:w-4 sm:h-4 text-green-500" />
                                        Gym Status
                                    </label>
                                    <CustomDropdown
                                        options={statusOptions}
                                        value={formData.status}
                                        onChange={handleStatusChange}
                                        placeholder="Select Status"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate('/superadmin/gyms/all')}
                                className="group px-6 sm:px-8 py-2.5 sm:py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-violet-300 hover:text-violet-600 rounded-lg sm:rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-lg sm:rounded-xl text-sm font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                                            Create Gym
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddGym;
