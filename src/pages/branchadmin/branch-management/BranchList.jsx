import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, MapPin, Search, Building2, Phone, Mail, Eye, Trash2, Loader, Clock, User, Globe, Navigation, Hash } from 'lucide-react';
import { fetchBranches, createBranch, updateBranch, deleteBranch } from '../../../api/superadmin/branchApi';
import { getAllStaff } from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';
import RightDrawer from '../../../components/common/RightDrawer';
import { useBranchContext } from '../../../context/BranchContext';

const BranchList = () => {
    const navigate = useNavigate();
    const { refreshBranches } = useBranchContext();
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [branches, setBranches] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Updated formData structure to separate Branch and Manager info
    const [formData, setFormData] = useState({
        branchName: '',
        branchCode: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        branchPhone: '',
        branchEmail: '',
        openingTime: '06:00',
        closingTime: '22:00',
        managerId: 'No manager',
        managerName: '',
        managerEmail: '',
        managerPhone: '',
        status: 'Active'
    });

    useEffect(() => {
        loadBranches();
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const data = await getAllStaff();
            setStaffList(data || []);
        } catch (error) {
            console.error('Failed to load staff for manager selection:', error);
        }
    };

    const loadBranches = async () => {
        try {
            setLoading(true);
            const data = await fetchBranches();
            setBranches(data.gyms || []);
        } catch (error) {
            console.error('Failed to load branches:', error);
            toast.error('Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    const handleViewBranch = (branch) => {
        setSelectedBranch(branch);
        setIsViewDrawerOpen(true);
    };

    const handleEditBranch = (branch) => {
        setSelectedBranch(branch);
        setFormData({
            branchName: branch.branchName || branch.gymName || '',
            branchCode: branch.branchCode || `BR-${branch.id?.toString().padStart(3, '0')}`,
            address: branch.address || branch.location || '',
            city: branch.city || '',
            state: branch.state || '',
            postalCode: branch.postalCode || '',
            country: branch.country || 'India',
            branchPhone: branch.phone || '',
            branchEmail: branch.email || '',
            openingTime: branch.openingTime || '06:00',
            closingTime: branch.closingTime || '22:00',
            managerId: branch.managerId || 'No manager',
            managerName: branch.managerName || branch.owner || '',
            managerEmail: branch.managerEmail || '',
            managerPhone: branch.phone || '',
            status: branch.status || 'Active'
        });
        setIsEditDrawerOpen(true);
    };

    const handleDeleteBranch = async (id) => {
        if (window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
            try {
                await deleteBranch(id);
                toast.success('Branch deleted successfully');
                loadBranches();
                refreshBranches();
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
            if (!formData.branchName || !formData.managerEmail) {
                toast.error('Branch Name and Manager Email are required');
                return;
            }

            const combinedLocation = `${formData.address}${formData.city ? ', ' + formData.city : ''}${formData.state ? ', ' + formData.state : ''}${formData.postalCode ? ' - ' + formData.postalCode : ''}, ${formData.country}`;

            const payload = {
                gymName: formData.branchName,
                branchName: formData.branchName,
                branchCode: formData.branchCode,
                owner: formData.managerName,
                manager: formData.managerName,
                email: formData.managerEmail,
                phone: formData.managerPhone || formData.branchPhone,
                location: combinedLocation,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,
                openingTime: formData.openingTime,
                closingTime: formData.closingTime,
                status: formData.status
            };

            await createBranch(payload);
            toast.success('Branch created successfully');
            setIsAddDrawerOpen(false);
            resetForm();
            loadBranches();
            refreshBranches();
        } catch (error) {
            console.error('Failed to save branch:', error);
            const errMsg = error.response?.data?.message || error.message || 'Failed to create branch';
            toast.error(errMsg);
        }
    };

    const resetForm = () => {
        setFormData({
            branchName: '',
            branchCode: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
            branchPhone: '',
            branchEmail: '',
            openingTime: '06:00',
            closingTime: '22:00',
            managerId: 'No manager',
            managerName: '',
            managerEmail: '',
            managerPhone: '',
            status: 'Active'
        });
    };

    const handleUpdateBranch = async () => {
        try {
            const combinedLocation = `${formData.address}${formData.city ? ', ' + formData.city : ''}${formData.state ? ', ' + formData.state : ''}${formData.postalCode ? ' - ' + formData.postalCode : ''}, ${formData.country}`;

            const payload = {
                name: formData.branchName,
                gymName: formData.branchName,
                branchName: formData.branchName,
                branchCode: formData.branchCode,
                owner: formData.managerName,
                manager: formData.managerName,
                phone: formData.managerPhone || formData.branchPhone,
                location: combinedLocation,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,
                email: formData.managerEmail,
                openingTime: formData.openingTime,
                closingTime: formData.closingTime,
                status: formData.status
            };
            await updateBranch(selectedBranch.id, payload);
            toast.success('Branch updated successfully');
            setIsEditDrawerOpen(false);
            loadBranches();
            refreshBranches();
        } catch (error) {
            console.error('Failed to update branch:', error);
            toast.error('Failed to update branch');
        }
    };

    return (
        <div className="saas-container font-black overflow-x-hidden">
            {/* Premium Header */}
            <div className="relative mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-fuchsia-600 rounded-3xl blur-3xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl shadow-primary/30/10 border border-white/50 p-6 sm:p-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-xl shadow-primary/30/40 transition-all duration-500 hover:scale-110 hover:rotate-6">
                                <Building2 size={32} strokeWidth={3} />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent tracking-tighter">
                                    Branch Management
                                </h1>
                                <p className="text-slate-400 text-[10px] sm:text-xs mt-1 uppercase tracking-widest opacity-80 leading-none font-bold">
                                    Manage your gym locations Across the network
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { resetForm(); setIsAddDrawerOpen(true); }}
                            className="flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-primary via-primary to-fuchsia-600 text-white rounded-2xl text-sm font-black shadow-2xl shadow-primary/30/25 hover:scale-[1.02] active:scale-95 transition-all w-full lg:w-auto"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Add Branch
                        </button>
                    </div>
                </div>
            </div>

            {/* All Branches Section */}
            <div className="bg-white/80 backdrop-blur-md rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group hover:text-primary transition-colors">
                            <MapPin size={24} strokeWidth={3} />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl text-slate-800 tracking-tight font-black">All Branches</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none font-bold">Database Records</p>
                        </div>
                    </div>
                    <div className="relative w-full xl:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} strokeWidth={3} />
                        <input
                            type="text"
                            placeholder="Search by branch name or code..."
                            className="w-full pl-14 pr-6 py-3.5 sm:py-4 bg-slate-50/50 border-2 border-slate-100 rounded-[20px] text-sm text-slate-800 focus:bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full overflow-x-auto scrollbar-hide">
                    {/* Desktop Table View */}
                    <table className="w-full text-left border-collapse table-auto hidden md:table min-w-[1000px] lg:min-w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Branch</th>
                                <th className="px-4 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Code</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Manager</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hidden xl:table-cell">Location</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hidden 2xl:table-cell">Contact</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-20 text-slate-400 font-bold">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader className="animate-spin text-primary" size={40} strokeWidth={3} />
                                            <span className="text-[10px] uppercase tracking-widest opacity-50">Syncing locations...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : branches.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-20 text-slate-400 font-bold">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-2">
                                                <Building2 size={40} className="opacity-20" />
                                            </div>
                                            <span className="text-lg text-slate-800">No branches found</span>
                                            <span className="text-[10px] uppercase tracking-widest opacity-50">Add your first gym location to get started</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : branches.filter(b => (b.gymName || b.branchName)?.toLowerCase().includes(searchTerm.toLowerCase())).map((branch) => (
                                <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                                                <MapPin size={20} strokeWidth={3} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm text-slate-800 truncate font-bold">{branch.gymName || branch.branchName}</div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-tighter truncate md:hidden">Code: BR-{branch.id.toString().padStart(3, '0')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6 text-center font-bold">
                                        <span className="px-3 py-1.5 bg-slate-100 rounded-xl text-[10px] text-slate-500 tracking-wider">
                                            BR-{branch.id?.toString().padStart(3, '0')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 hidden lg:table-cell font-bold">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 border border-white flex-shrink-0">
                                                {(branch.managerName || branch.owner)?.[0] || 'M'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-700 truncate font-black">{branch.managerName || branch.owner || 'Not Assigned'}</span>
                                                {branch.managerEmail && <span className="text-[10px] text-slate-400 font-bold tracking-tight lowercase">{branch.managerEmail}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 hidden xl:table-cell font-bold">
                                        <div className="max-w-[200px]">
                                            <div className="text-sm text-slate-600 truncate">{branch.location || 'N/A'}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Primary Address</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 hidden 2xl:table-cell font-bold">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Phone size={12} className="text-slate-300" />
                                                {branch.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Mail size={12} className="text-slate-300" />
                                                <span className="truncate max-w-[150px]">{branch.email || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-bold">
                                        <span className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded-full ${branch.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-slate-400 bg-slate-50 border border-slate-100'}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${branch.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                            {branch.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-right">
                                            <button
                                                onClick={() => handleViewBranch(branch)}
                                                className="p-3 text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} strokeWidth={3} />
                                            </button>
                                            <button
                                                onClick={() => handleEditBranch(branch)}
                                                className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                title="Edit Branch"
                                            >
                                                <Edit2 size={18} strokeWidth={3} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBranch(branch.id)}
                                                className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Delete Branch"
                                            >
                                                <Trash2 size={18} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile/Tablet Stacked View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {loading ? (
                            <div className="text-center py-20 text-slate-400 font-bold">
                                <Loader className="animate-spin text-primary mx-auto mb-4" size={40} strokeWidth={3} />
                                <span className="text-[10px] uppercase tracking-widest opacity-50">Syncing locations...</span>
                            </div>
                        ) : branches.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 font-bold px-6">
                                <Building2 size={40} className="opacity-20 mx-auto mb-4" />
                                <span className="text-lg text-slate-800">No branches found</span>
                            </div>
                        ) : branches.filter(b => (b.gymName || b.branchName)?.toLowerCase().includes(searchTerm.toLowerCase())).map((branch) => (
                            <div key={branch.id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                                            <MapPin size={20} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 leading-tight">{branch.gymName || branch.branchName}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">BR-{branch.id?.toString().padStart(3, '0')}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${branch.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                        <div className={`h-1 w-1 rounded-full ${branch.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                        {branch.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    {(branch.managerName || branch.owner) && (
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Manager</p>
                                            <p className="text-[11px] font-black text-slate-700">{branch.managerName || branch.owner}</p>
                                        </div>
                                    )}
                                    {branch.phone && (
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                                            <p className="text-[11px] font-bold text-slate-700">{branch.phone}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-4">
                                    <button onClick={() => handleViewBranch(branch)} className="p-2.5 text-slate-400 hover:text-primary border border-slate-100 rounded-xl transition-all"><Eye size={18} strokeWidth={3} /></button>
                                    <button onClick={() => handleEditBranch(branch)} className="p-2.5 text-slate-400 hover:text-emerald-600 border border-slate-100 rounded-xl transition-all"><Edit2 size={18} strokeWidth={3} /></button>
                                    <button onClick={() => handleDeleteBranch(branch.id)} className="p-2.5 text-slate-400 hover:text-rose-600 border border-slate-100 rounded-xl transition-all"><Trash2 size={18} strokeWidth={3} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── ADD NEW BRANCH DRAWER ── */}
            <RightDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                title="Add New Branch"
                subtitle="Register a new gym location to the network"
                maxWidth="max-w-2xl"
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <button
                            type="button"
                            onClick={() => setIsAddDrawerOpen(false)}
                            className="px-6 h-11 border-2 border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all font-black uppercase tracking-widest text-[10px]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveBranch}
                            className="px-6 h-11 bg-gradient-to-r from-primary to-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30/30 transition-all font-black uppercase tracking-widest text-[10px]"
                        >
                            Create Branch
                        </button>
                    </div>
                }
            >
                <div className="px-6 py-6 space-y-8 font-black">
                    {/* Section 1: Basic Information */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 leading-none">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">1</span>
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Branch Name <span className="text-rose-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    name="branchName"
                                    placeholder="e.g., Downtown Branch"
                                    value={formData.branchName}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-bold placeholder:font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Branch Code <span className="text-rose-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    name="branchCode"
                                    placeholder="e.g., DT01"
                                    value={formData.branchCode}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-bold placeholder:font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Location Details */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 leading-none">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">2</span>
                            Location Details
                        </h3>
                        <div className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Address</label>
                                <textarea
                                    name="address"
                                    rows={3}
                                    placeholder="Street address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all resize-none font-bold placeholder:font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="e.g., Mumbai"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-bold placeholder:font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="e.g., Maharashtra"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-bold placeholder:font-bold"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        placeholder="e.g., 400001"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-bold placeholder:font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        placeholder="India"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-bold placeholder:font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Manager Configuration */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 leading-none">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">3</span>
                            Manager Configuration
                        </h3>
                        <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Assign Manager</label>
                                <select
                                    name="managerId"
                                    value={formData.managerId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'No manager') {
                                            setFormData(prev => ({
                                                ...prev,
                                                managerId: 'No manager',
                                                managerName: '',
                                                managerEmail: '',
                                                managerPhone: ''
                                            }));
                                        } else if (val === 'new') {
                                            setFormData(prev => ({
                                                ...prev,
                                                managerId: 'new',
                                                managerName: '',
                                                managerEmail: '',
                                                managerPhone: ''
                                            }));
                                        } else {
                                            const selectedStaff = staffList.find(s => s.id.toString() === val);
                                            if (selectedStaff) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    managerId: val,
                                                    managerName: selectedStaff.name,
                                                    managerEmail: selectedStaff.email,
                                                    managerPhone: selectedStaff.phone || ''
                                                }));
                                            }
                                        }
                                    }}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all appearance-none cursor-pointer font-bold shadow-sm"
                                >
                                    <option value="No manager">No manager (Draft)</option>
                                    <optgroup label="Direct Assignment">
                                        <option value="new">+ Register New Manager Account</option>
                                    </optgroup>
                                    {staffList.length > 0 && (
                                        <optgroup label="Select Existing Staff">
                                            {staffList.map(staff => (
                                                <option key={staff.id} value={staff.id}>
                                                    {staff.name} ({staff.role})
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>

                            {(formData.managerId !== 'No manager') && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Manager Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="Manager Name"
                                            value={formData.managerName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
                                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-violet-400 transition-all font-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Manager Email (Login ID)</label>
                                        <input
                                            type="email"
                                            placeholder="Login Email"
                                            value={formData.managerEmail}
                                            onChange={(e) => setFormData(prev => ({ ...prev, managerEmail: e.target.value }))}
                                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-violet-400 transition-all font-black"
                                            disabled={formData.managerId !== 'new'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Manager Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="Contact Number"
                                            value={formData.managerPhone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, managerPhone: e.target.value }))}
                                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-violet-400 transition-all font-black"
                                        />
                                    </div>
                                    {formData.managerId === 'new' && (
                                        <div className="sm:col-span-2 bg-primary-light p-3 rounded-xl border border-violet-100">
                                            <p className="text-[10px] text-primary font-bold leading-relaxed tracking-tight">
                                                Note: A new manager account will be created with default password 123456
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 4: Contact & Operations */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 leading-none">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">4</span>
                            Branch Contact & Ops
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Branch Phone</label>
                                <input
                                    type="tel"
                                    name="branchPhone"
                                    placeholder="+91 9876543210"
                                    value={formData.branchPhone}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-bold placeholder:font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Branch Email (Public)</label>
                                <input
                                    type="email"
                                    name="branchEmail"
                                    placeholder="contact@branch.com"
                                    value={formData.branchEmail}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-bold placeholder:font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Opening Time</label>
                                <input
                                    type="time"
                                    name="openingTime"
                                    value={formData.openingTime}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Closing Time</label>
                                <input
                                    type="time"
                                    name="closingTime"
                                    value={formData.closingTime}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </RightDrawer>

            {/* ── VIEW BRANCH DRAWER ── */}
            <RightDrawer
                isOpen={isViewDrawerOpen}
                onClose={() => setIsViewDrawerOpen(false)}
                title="Branch Details"
                subtitle={selectedBranch?.memberId || 'Location Insight'}
                maxWidth="max-w-lg"
                footer={
                    <div className="flex gap-3 w-full">
                        <button onClick={() => { setIsViewDrawerOpen(false); setTimeout(() => handleEditBranch(selectedBranch), 200); }} className="flex-1 h-11 border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all font-black uppercase tracking-widest text-[10px]">Edit Branch</button>
                        <button onClick={() => setIsViewDrawerOpen(false)} className="flex-1 h-11 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all font-black uppercase tracking-widest text-[10px]">Close</button>
                    </div>
                }
            >
                {selectedBranch && (
                    <div className="px-6 py-6 space-y-6 font-black leading-tight text-left">
                        {/* Avatar + Name */}
                        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-primary-hover flex items-center justify-center text-2xl font-black border-2 border-violet-200 flex-shrink-0">
                                <Building2 size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedBranch.gymName || selectedBranch.branchName}</h3>
                                <p className="text-xs font-mono text-primary mt-0.5">ID: {selectedBranch.id}</p>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedBranch.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                        {selectedBranch.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                                Location Insight
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    ['Branch Name', selectedBranch.gymName || selectedBranch.branchName || 'N/A'],
                                    ['Branch Code', selectedBranch.branchCode || `BR-${selectedBranch.id}`],
                                    ['Primary Manager', selectedBranch.managerName || selectedBranch.owner || 'Unassigned'],
                                    ['Manager Email', selectedBranch.managerEmail || 'N/A'],
                                    ['Branch Phone', selectedBranch.phone || 'N/A'],
                                    ['Operational Address', selectedBranch.address || selectedBranch.location || 'N/A'],
                                    ['City', selectedBranch.city || '—'],
                                    ['State', selectedBranch.state || '—'],
                                    ['Postal Code', selectedBranch.postalCode || '—'],
                                    ['Country', selectedBranch.country || 'India'],
                                    ['Opening Time', selectedBranch.openingTime || '06:00'],
                                    ['Closing Time', selectedBranch.closingTime || '22:00'],
                                ].map(([label, val]) => (
                                    <div key={label} className={`group bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 hover:border-violet-200 transition-colors ${label === 'Operational Address' ? 'sm:col-span-2' : ''}`}>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                                        <p className="text-sm font-bold text-slate-800 break-words">{val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </RightDrawer>

            {/* ── EDIT BRANCH DRAWER ── */}
            <RightDrawer
                isOpen={isEditDrawerOpen}
                onClose={() => setIsEditDrawerOpen(false)}
                title="Edit Branch"
                subtitle={`Updating location for ${selectedBranch?.gymName || ''}`}
                maxWidth="max-w-2xl"
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <button type="button" onClick={() => setIsEditDrawerOpen(false)} className="px-6 h-11 border-2 border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all font-black uppercase tracking-widest text-[10px]">Discard</button>
                        <button onClick={handleUpdateBranch} className="px-6 h-11 bg-gradient-to-r from-primary to-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30/30 transition-all font-black uppercase tracking-widest text-[10px]">Save Changes</button>
                    </div>
                }
            >
                <div className="px-6 py-6 space-y-8 font-black leading-tight text-left">
                    {/* Section 1: Core Information */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 leading-none">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">1</span>
                            Core Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Branch Name</label>
                                <input
                                    type="text"
                                    name="branchName"
                                    placeholder="Enter branch name"
                                    value={formData.branchName}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Branch Code</label>
                                <input
                                    type="text"
                                    name="branchCode"
                                    placeholder="e.g., BR01"
                                    value={formData.branchCode}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-black"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Address */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2 leading-none">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">2</span>
                            Location Details
                        </h3>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Operational Address</label>
                            <textarea
                                name="address"
                                rows={3}
                                placeholder="Address details"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all resize-none font-black"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-black"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Postal Code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    placeholder="ZIP/Postal Code"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    placeholder="Country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-black"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Manager Configuration */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 leading-none">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">3</span>
                            Manager Configuration
                        </h3>
                        <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Assign Manager</label>
                                <select
                                    name="managerId"
                                    value={formData.managerId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'No manager') {
                                            setFormData(prev => ({
                                                ...prev,
                                                managerId: 'No manager',
                                                managerName: '',
                                                managerEmail: '',
                                                managerPhone: ''
                                            }));
                                        } else if (val === 'new') {
                                            setFormData(prev => ({
                                                ...prev,
                                                managerId: 'new',
                                                managerName: '',
                                                managerEmail: '',
                                                managerPhone: ''
                                            }));
                                        } else {
                                            const selectedStaff = staffList.find(s => s.id.toString() === val);
                                            if (selectedStaff) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    managerId: val,
                                                    managerName: selectedStaff.name,
                                                    managerEmail: selectedStaff.email,
                                                    managerPhone: selectedStaff.phone || ''
                                                }));
                                            }
                                        }
                                    }}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all appearance-none cursor-pointer font-black shadow-sm"
                                >
                                    <option value="No manager">No manager (Draft)</option>
                                    <optgroup label="Direct Assignment">
                                        <option value="new">+ Register New Manager Account</option>
                                    </optgroup>
                                    {staffList.length > 0 && (
                                        <optgroup label="Select Existing Staff">
                                            {staffList.map(staff => (
                                                <option key={staff.id} value={staff.id}>
                                                    {staff.name} ({staff.role})
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>

                            {(formData.managerId !== 'No manager') && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Manager Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="Manager Name"
                                            value={formData.managerName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
                                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-black text-slate-700 outline-none focus:border-violet-400 transition-all font-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Manager Email</label>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={formData.managerEmail}
                                            onChange={(e) => setFormData(prev => ({ ...prev, managerEmail: e.target.value }))}
                                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-black text-slate-700 outline-none focus:border-violet-400 transition-all font-black"
                                            disabled={formData.managerId !== 'new'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Manager Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            value={formData.managerPhone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, managerPhone: e.target.value }))}
                                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-black text-slate-700 outline-none focus:border-violet-400 transition-all font-black"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 4: Operations */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 leading-none">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">4</span>
                            Operations & Status
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Opening Time</label>
                                <input
                                    type="time"
                                    name="openingTime"
                                    value={formData.openingTime}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Closing Time</label>
                                <input
                                    type="time"
                                    name="closingTime"
                                    value={formData.closingTime}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all font-black"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Branch Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm text-slate-800 bg-white outline-none transition-all appearance-none cursor-pointer font-black"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

export default BranchList;
