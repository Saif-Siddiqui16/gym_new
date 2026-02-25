import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Users, MapPin, Search, ChevronRight, Building, Phone, Mail, Check, X, Shield, Filter, UserCheck, UserPlus, Eye, Trash2, Loader } from 'lucide-react';
import { fetchBranches, createBranch, updateBranch, deleteBranch } from '../../../api/superadmin/branchApi';
import { toast } from 'react-hot-toast';
import RightDrawer from '../../../components/common/RightDrawer';
import '../../../styles/GlobalDesign.css';

const BranchList = () => {
    const navigate = useNavigate();
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        branchName: '',
        owner: '',
        phone: '',
        email: '',
        location: '',
        status: 'Active'
    });

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            setLoading(true);
            const data = await fetchBranches();
            // Backend returns { gyms: [], total: ... } or just array depending on implementation. 
            // Controller extract shows: res.json({ gyms: formattedGyms, ... })
            setBranches(data.gyms || []);
        } catch (error) {
            console.error('Failed to load branches:', error);
            toast.error('Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    const staffList = [
        { id: 101, name: 'Rahul V.', role: 'Trainer', status: 'Available' },
        { id: 102, name: 'Pooja K.', role: 'Manager', status: 'Assigned' },
        { id: 103, name: 'Vikram S.', role: 'Trainer', status: 'Available' },
        { id: 104, name: 'Anita D.', role: 'Staff', status: 'Available' },
    ];

    const handleAssignStaff = (branch) => {
        console.log("Assign Staff:", branch.gymName);
        setSelectedBranch(branch);
        setIsAssignDrawerOpen(true);
    };

    const handleViewBranch = (branch) => {
        setSelectedBranch(branch);
        setIsViewDrawerOpen(true);
    };

    const handleEditBranch = (branch) => {
        setSelectedBranch(branch);
        setFormData({
            name: branch.gymName, // gymName maps to Name
            branchName: branch.branchName || '',
            owner: branch.owner || '',
            phone: branch.phone || '',
            email: '', // Email usually not editable or not returned in list for security if sensitive, but here needed for update? 
            // Actually updateGym updates Tenant. Email is in User. So we might not update email here easily without separate endpoint.
            // For now, let's just populate what we can.
            location: branch.location || '',
            status: branch.status
        });
        setIsEditDrawerOpen(true);
    };

    const handleDeleteBranch = async (id) => {
        if (window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
            try {
                await deleteBranch(id);
                toast.success('Branch deleted successfully');
                loadBranches();
            } catch (error) {
                console.error('Failed to delete branch:', error);
                toast.error('Failed to delete branch');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveBranch = async () => {
        try {
            if (!formData.branchName || !formData.email) {
                toast.error('Branch Name and Email are required');
                return;
            }

            // Map frontend form to backend expectations
            // Backend expects: gymName, branchName, owner, phone, location, email
            const payload = {
                gymName: formData.branchName, // Using Branch Name as Gym Name for simplicity or both
                branchName: formData.branchName,
                owner: formData.owner,
                phone: formData.phone,
                location: formData.location,
                email: formData.email
            };

            await createBranch(payload);
            toast.success('Branch created successfully');
            setIsAddDrawerOpen(false);
            setFormData({
                name: '',
                branchName: '',
                owner: '',
                phone: '',
                email: '',
                location: '',
                status: 'Active'
            });
            loadBranches();
        } catch (error) {
            console.error('Failed to save branch:', error);
            const errMsg = error.response?.data?.message || error.message || 'Failed to create branch';
            toast.error(errMsg);
        }
    };

    const handleUpdateBranch = async () => {
        try {
            const payload = {
                name: formData.name,
                branchName: formData.branchName, // Using name as branchName
                owner: formData.owner,
                phone: formData.phone,
                location: formData.location,
                status: formData.status
            };

            await updateBranch(selectedBranch.id, payload);
            toast.success('Branch updated successfully');
            setIsEditDrawerOpen(false);
            loadBranches();
        } catch (error) {
            console.error('Failed to update branch:', error);
            toast.error('Failed to update branch');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            {/* Page Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Building size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    Branch Management
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Configure and manage your gym locations and staff assignments</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAddDrawerOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-xl hover:shadow-violet-500/50 text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Add New Branch
                        </button>
                    </div>
                </div>
            </div>

            {/* Branch Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by branch name or code..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-xs font-bold">
                        <Filter size={14} />
                        Filtered by Active
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Branch Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Branch Code</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Manager</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Staff</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader className="animate-spin" size={20} /> Loading branches...
                                        </div>
                                    </td>
                                </tr>
                            ) : branches.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-500">No branches found.</td>
                                </tr>
                            ) : branches.map((branch) => (
                                <tr key={branch.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                <MapPin size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">{branch.gymName || branch.branchName}</div>
                                                <div className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{branch.location || 'No address'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-500 tracking-wider font-mono uppercase">
                                            BR-{branch.id.toString().padStart(3, '0')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600 italic">
                                        {branch.owner || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">
                                            <Users size={12} />
                                            {branch.members || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${branch.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                                            <div className={`h-1 w-1 rounded-full ${branch.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                            {branch.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {/*
                                            <button
                                                onClick={() => handleAssignStaff(branch)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-violet-100 transition-all cursor-pointer"
                                            >
                                                <UserPlus size={14} />
                                                Assign Staff
                                            </button>
                                            */}
                                            <button
                                                onClick={() => handleViewBranch(branch)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEditBranch(branch)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                                title="Edit Branch"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBranch(branch.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                                title="Delete Branch"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Branch Drawer */}
            <RightDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                title="Add New Branch"
                subtitle="Fill in the details to create a new location"
                footer={(
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setIsAddDrawerOpen(false)}
                            className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveBranch}
                            className="px-8 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105 active:scale-95"
                        >
                            Save Branch
                        </button>
                    </div>
                )}
            >
                <div className="flex flex-col gap-6 p-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Branch Name</label>
                        <input name="branchName" value={formData.branchName} onChange={handleInputChange} type="text" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:border-violet-500 transition-all font-medium" placeholder="E.g. Southside Studio" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Manager Name</label>
                            <input name="owner" value={formData.owner} onChange={handleInputChange} type="text" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:border-violet-500 transition-all font-medium" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:border-violet-500 transition-all font-medium">
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-slate-300" size={18} />
                            <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:border-violet-500 transition-all font-medium" placeholder="+91 00000 00000" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
                            <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:border-violet-500 transition-all font-medium" placeholder="branch@gym.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Address</label>
                        <textarea name="location" value={formData.location} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:border-violet-500 transition-all font-medium resize-none" placeholder="Full branch address..."></textarea>
                    </div>
                </div>
            </RightDrawer>

            {/* View Branch Drawer */}
            <RightDrawer
                isOpen={isViewDrawerOpen}
                onClose={() => setIsViewDrawerOpen(false)}
                title="Branch Details"
                subtitle={selectedBranch?.name}
                footer={(
                    <button
                        onClick={() => setIsViewDrawerOpen(false)}
                        className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                        Close View
                    </button>
                )}
            >
                {selectedBranch && (
                    <div className="flex flex-col gap-8 p-6">
                        <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-violet-600 mb-4">
                                <Building size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{selectedBranch.gymName || selectedBranch.branchName}</h3>
                            <span className="px-2 py-0.5 bg-violet-600 text-white rounded text-[10px] font-black uppercase tracking-widest mt-2">BR-{selectedBranch.id.toString().padStart(3, '0')}</span>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Branch Overview</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Manager</span>
                                    <span className="text-sm font-bold text-slate-800">{selectedBranch.owner}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Total Staff</span>
                                    <span className="text-sm font-bold text-slate-800">{selectedBranch.members || 0} Members</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Status</span>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">{selectedBranch.status}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Location Details</h4>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                                <div className="flex gap-3">
                                    <MapPin size={18} className="text-slate-300 mt-1" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Address</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedBranch.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </RightDrawer>

            {/* Edit Branch Drawer */}
            <RightDrawer
                isOpen={isEditDrawerOpen}
                onClose={() => setIsEditDrawerOpen(false)}
                title="Edit Branch"
                subtitle="Update location details"
                footer={(
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setIsEditDrawerOpen(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">Cancel</button>
                        <button
                            onClick={handleUpdateBranch}
                            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-slate-200 transition-all hover:scale-105 active:scale-95"
                        >
                            Update Changes
                        </button>
                    </div>
                )}
            >
                {selectedBranch && (
                    <div className="flex flex-col gap-6 p-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Branch Name</label>
                            <input
                                name="name"
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-violet-500 outline-none transition-all shadow-sm"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Manager</label>
                                <input
                                    name="owner"
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-violet-500 outline-none transition-all shadow-sm"
                                    value={formData.owner}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
                                <select
                                    name="status"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-violet-500 outline-none transition-all shadow-sm"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Address</label>
                            <textarea
                                name="location"
                                rows="3"
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-violet-500 outline-none transition-all shadow-sm resize-none"
                                value={formData.location}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>
                    </div>
                )}
            </RightDrawer>

            {/* Assign Staff Drawer */}
            <RightDrawer
                isOpen={isAssignDrawerOpen}
                onClose={() => setIsAssignDrawerOpen(false)}
                title="Assign Staff"
                subtitle={selectedBranch ? `Relocating staff to ${selectedBranch.name}` : "Manage branch staff"}
                maxWidth="max-w-2xl"
                footer={(
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setIsAssignDrawerOpen(false)}
                            className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button className="px-10 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-slate-200 transition-all transform hover:scale-105 active:scale-95">
                            Update Assignment
                        </button>
                    </div>
                )}
            >
                <div className="flex flex-col gap-8 p-6">
                    {/* Filter & Search */}
                    <div className="flex gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-3 text-slate-300 group-focus-within:text-violet-500" size={18} />
                            <input type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm border-2 border-slate-100 focus:border-violet-500 outline-none transition-all" placeholder="Search staff by name or role..." />
                        </div>
                        <button className="p-2.5 border-2 border-slate-100 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Available Staff */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={14} className="text-blue-500" /> Available Staff
                                </h4>
                                <span className="text-[10px] font-bold text-slate-300">Total: 3</span>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {staffList.map(staff => (
                                    <div key={staff.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group hover:border-violet-200 transition-all">
                                        <div>
                                            <div className="text-sm font-bold text-slate-700">{staff.name}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{staff.role}</div>
                                        </div>
                                        <button className="p-1.5 bg-white border border-slate-200 text-slate-300 rounded-lg hover:text-emerald-500 hover:border-emerald-500 transition-all">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assigned Staff */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <UserCheck size={14} className="text-emerald-500" /> Assigned Staff
                                </h4>
                                <span className="text-[10px] font-bold text-slate-300">Total: 2</span>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <div className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl flex items-center justify-between group">
                                    <div>
                                        <div className="text-sm font-bold text-emerald-800">Amit Singh</div>
                                        <div className="text-[10px] text-emerald-600 font-medium">Head Manager</div>
                                    </div>
                                    <button className="p-1.5 bg-white border border-emerald-100 text-rose-400 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

export default BranchList;
