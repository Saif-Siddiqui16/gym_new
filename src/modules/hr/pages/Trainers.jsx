import { useEffect, useRef, useState } from 'react';
import {
    Users, Plus, Search, Filter, MoreHorizontal, Mail, Phone,
    Award, Clock, DollarSign, TrendingUp, X, Check, Edit2, Trash2,
    Shield, ChevronDown
} from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import { useBranchContext } from '../../../context/BranchContext';
import { ROLES } from '../../../config/roles';
import * as managerApi from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';

// Reusable Custom Dropdown Component (matching BookingReport)
const CustomDropdown = ({ options, value, onChange, icon: Icon, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative min-w-[160px]" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${isOpen ? 'border-primary ring-2 ring-violet-100 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    {Icon && <Icon size={16} className="text-gray-400" />}
                    <span className="font-medium truncate">{value === 'All' ? placeholder : value}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <div className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="py-1">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => { onChange(option); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${value === option ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {option === 'All' ? placeholder : option}
                            {value === option && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Trainers = () => {
    const { selectedBranch } = useBranchContext();
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [sortOption, setSortOption] = useState('All');
    const [filteredTrainers, setFilteredTrainers] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Stats state
    const [trainerKPIs, setTrainerKPIs] = useState({
        activeTrainers: 0,
        generalClients: 0,
        ptClients: 0,
        monthlyRevenue: 0,
        avgClientsPerTrainer: 0
    });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        idType: '',
        idNumber: '',
        specialization: '',
        certifications: '',
        salaryType: 'Monthly',
        baseSalary: '',
        hourlyRate: '',
        ptSharePercent: '',
        bio: '',
        status: 'Active',
        avatar: ''
    });

    useEffect(() => {
        loadData();
    }, [selectedBranch]);

    const loadData = async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch === 'all' ? '' : selectedBranch;
            const [allStaff, trainerStats] = await Promise.all([
                managerApi.getAllStaff(branchId || 'all'),
                managerApi.getTrainerStats(branchId)
            ]);

            // Filter trainers and handle branch scoping manually if needed
            const trainerList = allStaff.filter(s => {
                const isTrainer = s.role === ROLES.TRAINER || s.role === 'TRAINER';
                const branchMatch = !branchId || s.tenantId === parseInt(branchId);
                return isTrainer && branchMatch;
            }).map(s => {
                let config = {};
                try {
                    config = typeof s.config === 'string' ? JSON.parse(s.config) : (s.config || {});
                } catch (e) { }

                return {
                    ...s,
                    baseSalary: (s.baseSalary !== null && s.baseSalary !== undefined) ? Number(s.baseSalary) : null,
                    commissionPercent: s.commissionPercent ?? config.commission ?? config.commissionPercent ?? 0,
                    ptSharePercent: s.ptSharePercent ?? config.ptSharePercent ?? 0,
                    salaryType: config.salaryType || (s.hourlyRate > 0 ? 'Hourly' : 'Monthly'),
                    hourlyRate: s.hourlyRate || config.hourlyRate || 0
                };
            });

            setTrainers(trainerList);
            setTrainerKPIs({
                activeTrainers: trainerStats.activeTrainers || 0,
                generalClients: trainerStats.generalClients || 0,
                ptClients: trainerStats.ptClients || 0,
                monthlyRevenue: trainerStats.monthlyRevenue || 0,
                avgClientsPerTrainer: trainerStats.avgClientsPerTrainer || 0
            });
        } catch (error) {
            console.error('Error loading trainers:', error);
            toast.error('Failed to load trainers data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = trainers.filter(trainer => {
            const matchesSearch = trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trainer.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Branch filter is handled in loadData API call scope, 
            // but status filter can be handled here or by API
            const matchesStatus = showInactive || trainer.status === 'Active';
            
            // Custom Status Sort matching BookingReport pattern
            if (sortOption === 'Active Only') return matchesSearch && trainer.status === 'Active';
            if (sortOption === 'Inactive Only') return matchesSearch && trainer.status !== 'Active';
            
            return matchesSearch && matchesStatus;
        });
        setFilteredTrainers(result);
    }, [trainers, searchTerm, showInactive, sortOption]);

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                role: 'TRAINER',
                // Handle different salary fields based on type
                baseSalary: formData.salaryType === 'Monthly' ? formData.baseSalary : null,
                hourlyRate: formData.salaryType === 'Hourly' ? formData.hourlyRate : null
            };

            const branchId = selectedBranch === 'all' ? null : selectedBranch;

            if (editingTrainer) {
                // Update implementation
                await managerApi.updateStaffAPI(editingTrainer.id, payload);
                toast.success('Trainer updated successfully');
            } else {
                // Create logic - handle "All Branches"
                if (selectedBranch === 'all') {
                    // This is tricky for users. For now, create for the primary or handle in controller.
                    // Assuming controller creates for one or multiples.
                    await managerApi.createStaffAPI({ ...payload, branchId: 'all' });
                } else {
                    await managerApi.createStaffAPI({ ...payload, tenantId: branchId });
                }
                toast.success('Trainer added successfully');
            }

            setIsDrawerOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error saving trainer:', error);
            toast.error(error.response?.data?.message || 'Failed to save trainer');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this trainer?')) return;
        try {
            await managerApi.deleteStaffAPI(id);
            toast.success('Trainer removed successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to remove trainer');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setFormData({ ...formData, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            idType: '',
            idNumber: '',
            specialization: '',
            certifications: '',
            salaryType: 'Monthly',
            baseSalary: '',
            hourlyRate: '',
            ptSharePercent: '',
            bio: '',
            status: 'Active',
            avatar: ''
        });
        setAvatarPreview(null);
        setEditingTrainer(null);
    };

    const openEditDrawer = (trainer) => {
        setEditingTrainer(trainer);

        let parsedConfig = {};
        if (trainer.config) {
            try {
                parsedConfig = typeof trainer.config === 'string' ? JSON.parse(trainer.config) : trainer.config;
            } catch (e) {
                console.error("Failed to parse trainer config", e);
            }
        }

        setFormData({
            name: trainer.name || '',
            email: trainer.email || '',
            phone: trainer.phone || '',
            idType: parsedConfig.idType || '',
            idNumber: parsedConfig.idNumber || '',
            specialization: parsedConfig.specialization || '',
            certifications: parsedConfig.certifications || '',
            salaryType: parsedConfig.salaryType || 'Monthly',
            baseSalary: trainer.baseSalary || '',
            hourlyRate: parsedConfig.hourlyRate || '',
            ptSharePercent: parsedConfig.ptSharePercent || '',
            bio: parsedConfig.bio || '',
            status: trainer.status || 'Active',
            avatar: trainer.avatar || ''
        });
        setAvatarPreview(trainer.avatar || null);
        setIsDrawerOpen(true);
    };

    // Card data for display
    const stats = [
        { label: 'Active Trainers', value: trainerKPIs.activeTrainers, icon: Users, bg: 'bg-primary-light', color: 'text-primary' },
        { label: 'General Clients', value: trainerKPIs.generalClients, icon: Shield, bg: 'bg-indigo-50', color: 'text-indigo-600' },
        { label: 'PT Clients', value: trainerKPIs.ptClients, icon: Award, bg: 'bg-amber-50', color: 'text-amber-600' },
        { label: 'Monthly Revenue', value: `₹${(trainerKPIs.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600' },
        { label: 'Avg Clients/Trainer', value: trainerKPIs.avgClientsPerTrainer, icon: TrendingUp, bg: 'bg-rose-50', color: 'text-rose-600' },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="w-full space-y-8 p-4 sm:p-8">

                {/* Premium Header - Matching BookingReport */}
                <div className="mb-8 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse transition-opacity group-hover:opacity-15"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex flex-shrink-0 items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                                <Users size={24} className="md:w-7 md:h-7" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">
                                    Trainers
                                </h1>
                                <p className="text-slate-600 text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic">Manage team, certifications & client assignments</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setShowInactive(!showInactive)}
                                className={`h-11 px-5 rounded-xl text-xs font-bold transition-all border shadow-sm ${showInactive ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                            >
                                {showInactive ? 'Show All' : 'Show Inactive'}
                            </button>
                            <button
                                onClick={() => { resetForm(); setIsDrawerOpen(true); }}
                                className="h-11 px-6 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Add Trainer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards - Matching BookingReport Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 hover:shadow-2xl hover:border-violet-200 transition-all duration-300 transform md:hover:-translate-y-1 group cursor-pointer">
                            <div className={`p-3 md:p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-all duration-500 shadow-md`}>
                                <stat.icon size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-xl md:text-2xl font-black text-gray-900 leading-none">
                                    {loading ? <span className="text-lg text-gray-300 italic">...</span> : stat.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Card - Matching BookingReport style */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    {/* Filters bar */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/10">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="w-full md:w-48">
                                <CustomDropdown
                                    options={['All', 'Active Only', 'Inactive Only']}
                                    value={sortOption}
                                    onChange={setSortOption}
                                    placeholder="Sort"
                                    icon={Filter}
                                />
                            </div>

                            <div className="relative w-full md:w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="w-full h-11 pl-11 pr-4 bg-white border-2 border-slate-100 rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium text-slate-700"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Section - Matching BookingReport Header Gradient */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gradient-to-r from-primary-light/50 via-purple-50 to-fuchsia-50 border-b-2 border-violet-100">
                                <tr>
                                    <th className="px-8 py-5 text-[11px] font-bold text-primary uppercase tracking-wider">Trainer Profile</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-primary uppercase tracking-wider">Specialization</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-primary uppercase tracking-wider">Contact Channels</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-primary uppercase tracking-wider">Current Status</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-primary uppercase tracking-wider">Earning Config</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-primary uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-primary font-bold text-xs uppercase tracking-widest animate-pulse">Generating list...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTrainers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center text-slate-400 font-medium italic">
                                            No trainers found.
                                        </td>
                                    </tr>
                                ) : filteredTrainers.map((trainer) => (
                                    <tr key={trainer.id} className="hover:bg-gradient-to-r hover:from-primary-light/30 hover:to-transparent transition-all duration-200 group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-violet-100 text-primary flex items-center justify-center font-bold shadow-sm ring-2 ring-white overflow-hidden">
                                                    {trainer.avatar ? (
                                                        <img src={trainer.avatar} alt={trainer.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        trainer.name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{trainer.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 bg-slate-50 px-2 py-0.5 rounded border inline-block">ID: #{trainer.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-white border border-slate-100 text-slate-600 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap">
                                                {trainer.specialization || 'General Training'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-primary transition-colors cursor-pointer">
                                                    <Mail size={12} className="text-slate-300" /> {trainer.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-primary transition-colors cursor-pointer">
                                                    <Phone size={12} className="text-slate-300" /> {trainer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${trainer.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${trainer.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                                {trainer.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 min-w-[120px]">
                                                {trainer.salaryType === 'Hourly' ? (
                                                    <div>
                                                        <p className="font-black text-slate-900">₹{trainer.hourlyRate || 0}/hr</p>
                                                        <p className="text-[10px] font-bold text-primary mt-0.5">{trainer.ptSharePercent || 0}% PT Share</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="font-black text-slate-900">₹{trainer.baseSalary != null ? Number(trainer.baseSalary).toLocaleString('en-IN') : '0'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest leading-none">Monthly Base</p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 transition-all">
                                                <button
                                                    onClick={() => openEditDrawer(trainer)}
                                                    className="w-9 h-9 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
                                                    title="Edit Trainer"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(trainer.id)}
                                                    className="w-9 h-9 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
                                                    title="Delete Trainer"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Trainer Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={editingTrainer ? "Edit Trainer Profile" : "Add Trainer Profile"}
                subtitle="Create a new trainer or link to existing user"
            >
                <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-8 pb-24">

                    {/* Image Placeholder */}
                    <div className="relative flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden group cursor-pointer h-36">
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-slate-200 flex flex-col items-center justify-center text-slate-400 mb-2 group-hover:bg-primary-light transition-colors">
                                <Users size={32} />
                            </div>
                        )}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 ${avatarPreview ? 'opacity-0 group-hover:opacity-100' : 'hidden'} transition-opacity pointer-events-none`}>
                            <p className="text-[10px] font-bold text-white uppercase tracking-widest text-center px-4">Change Photo</p>
                        </div>
                        {!avatarPreview && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 group-hover:text-primary transition-colors">Click to upload photo</p>}
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name *</label>
                                <input
                                    required
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm font-medium"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                                <input
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm font-medium"
                                    placeholder="+91 000 000 0000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email *</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm font-medium"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ID Type</label>
                                <select
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary transition-all text-sm font-medium outline-none bg-white"
                                    value={formData.idType}
                                    onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                                >
                                    <option value="">Select ID Type</option>
                                    <option>Aadhar Card</option>
                                    <option>PAN Card</option>
                                    <option>Driving License</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ID Number</label>
                                <input
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary transition-all text-sm font-medium outline-none"
                                    placeholder="Enter ID number"
                                    value={formData.idNumber}
                                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Specialization</label>
                            <input
                                className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary transition-all text-sm font-medium outline-none"
                                placeholder="Yoga, HIIT, Strength (comma separated)"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Certifications</label>
                            <textarea
                                className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-primary transition-all text-sm font-medium outline-none min-h-[80px]"
                                placeholder="ACE, NASM, CPR Certified"
                                value={formData.certifications}
                                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Salary Type</label>
                                <select
                                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary transition-all text-sm font-medium outline-none bg-white"
                                    value={formData.salaryType}
                                    onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                                >
                                    <option>Monthly</option>
                                    <option>Hourly</option>
                                </select>
                            </div>
                            <div>
                                {formData.salaryType === 'Monthly' ? (
                                    <>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Base Salary</label>
                                        <input
                                            type="number"
                                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary transition-all text-sm font-medium outline-none"
                                            placeholder="0"
                                            value={formData.baseSalary}
                                            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Hourly Rate ($)</label>
                                        <input
                                            type="number"
                                            className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary transition-all text-sm font-medium outline-none"
                                            placeholder="0"
                                            value={formData.hourlyRate}
                                            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">PT Share Percentage (%)</label>
                            <input
                                type="number"
                                className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-primary transition-all text-sm font-medium outline-none"
                                placeholder="40"
                                value={formData.ptSharePercent}
                                onChange={(e) => setFormData({ ...formData, ptSharePercent: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Trainer gets 40%, Gym gets 60% (Before GST)</p>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bio</label>
                            <textarea
                                className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-primary transition-all text-sm font-medium outline-none min-h-[100px]"
                                placeholder="Say something about your experience..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="fixed bottom-0 right-0 w-full max-w-md p-6 bg-white border-t border-slate-100 flex gap-4">
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(false)}
                            className="flex-1 h-12 rounded-2xl bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-100 transition-all border border-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-primary to-primary text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/30/20 hover:shadow-primary/30/40 transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={18} strokeWidth={3} />
                            {editingTrainer ? 'Update Trainer' : 'Create Trainer'}
                        </button>
                    </div>
                </form>
            </RightDrawer>
        </div>
    );
};

export default Trainers;
