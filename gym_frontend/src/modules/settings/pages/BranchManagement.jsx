import React from 'react';
import { Plus, Edit2, MapPin, Users, Briefcase, TrendingUp, MoreVertical, Sparkles } from 'lucide-react';
import { BRANCHES } from '../data/mockSettingsData';
import { fetchAllGyms, addGym } from '../../../api/superadmin/superAdminApi';
import { useState, useEffect } from 'react';

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        gymName: '',
        branchName: '',
        owner: '',
        phone: '',
        email: '',
        location: ''
    });

    const fetchBranches = async () => {
        try {
            const data = await fetchAllGyms();
            // Map backend data to UI format
            // Backend returns { gyms: [...] }
            const gymList = data.gyms || [];

            const formattedBranches = gymList.map(gym => ({
                id: gym.id,
                name: gym.gymName + (gym.branchName ? ` - ${gym.branchName}` : ''),
                location: gym.location || 'N/A',
                manager: gym.owner || 'N/A', // Using owner as manager for now
                status: gym.status || 'Active',
                members: gym.members || 0
            }));

            setBranches(formattedBranches);
        } catch (error) {
            console.error("Failed to fetch branches:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addGym(formData);
            setShowModal(false);
            setFormData({
                gymName: '',
                branchName: '',
                owner: '',
                phone: '',
                email: '',
                location: ''
            });
            fetchBranches(); // Refresh list
        } catch (error) {
            console.error("Failed to add branch:", error);
            alert("Failed to add branch. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6 flex-shrink-0">
                                <MapPin size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Branch Management
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse whitespace-nowrap">
                                        PREMIUM ✨
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">Manage gym locations and their details</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-105 transition-all w-full sm:w-auto"
                        >
                            <Plus size={18} strokeWidth={2.5} className="transition-all duration-300 group-hover:rotate-90" />
                            Add Branch
                        </button>
                    </div>
                </div>
            </div>

            {/* Branches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {branches.map(branch => (
                    <div key={branch.id} className="group relative bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-500 hover:-translate-y-1">
                        {/* Card Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative p-6 z-10">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-violet-200 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                    {branch.name.charAt(0)}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${branch.status === 'Active'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/20'
                                        : 'bg-slate-50 text-slate-500 border-slate-100'
                                        } shadow-sm`}>
                                        {branch.status}
                                    </span>
                                    <button className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-slate-800 mb-1 group-hover:text-violet-700 transition-colors">
                                    {branch.name}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                                    <MapPin size={14} className="text-violet-400" />
                                    {branch.location}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">
                                        <Briefcase size={12} /> Manager
                                    </div>
                                    <div className="font-bold text-slate-700 text-sm truncate">{branch.manager}</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">
                                        <Users size={12} /> Members
                                    </div>
                                    <div className="font-bold text-slate-700 text-sm">{branch.members}</div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                className="w-full py-3 flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:border-violet-500 hover:text-violet-600 hover:shadow-lg transition-all duration-300 group/btn"
                            >
                                <Edit2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                Manage Branch
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Branch Card Placeholder */}
                <button
                    onClick={() => setShowModal(true)}
                    className="group relative min-h-[300px] flex flex-col items-center justify-center p-6 border-3 border-dashed border-slate-200 rounded-3xl hover:border-violet-400 hover:bg-violet-50/30 transition-all duration-300"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4 group-hover:bg-white group-hover:text-violet-500 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                        <Plus size={32} strokeWidth={3} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400 group-hover:text-violet-600 transition-colors">Add New Branch</h3>
                </button>
            </div>

            {/* Add Branch Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Add New Branch</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gym Name</label>
                                    <input
                                        type="text"
                                        name="gymName"
                                        value={formData.gymName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all font-medium text-slate-700"
                                        placeholder="e.g. Gold's Gym"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch Name</label>
                                    <input
                                        type="text"
                                        name="branchName"
                                        value={formData.branchName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all font-medium text-slate-700"
                                        placeholder="e.g. Downtown"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Manager/Owner</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            name="owner"
                                            value={formData.owner}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all font-medium text-slate-700"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all font-medium text-slate-700"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all font-medium text-slate-700"
                                    placeholder="branch@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all font-medium text-slate-700"
                                        placeholder="123 Main St, City, Country"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.02] transition-all"
                                >
                                    Create Branch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
