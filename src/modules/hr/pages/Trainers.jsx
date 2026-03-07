import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Filter, MoreHorizontal, Mail, Phone,
    Award, Clock, DollarSign, TrendingUp, X, Check, Edit2, Trash2,
    Shield
} from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import { useBranchContext } from '../../../context/BranchContext';
import { ROLES } from '../../../config/roles';
import * as managerApi from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';

const Trainers = () => {
    const { selectedBranch } = useBranchContext();
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    // Stats
    const [stats, setStats] = useState({
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
        status: 'Active'
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
            setStats({
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
            status: 'Active'
        });
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
            status: trainer.status || 'Active'
        });
        setIsDrawerOpen(true);
    };

    const filteredTrainers = trainers.filter(t => {
        const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showInactive ? true : t.status === 'Active';
        return matchesSearch && matchesStatus;
    });

    const kpiCards = [
        { label: 'Active Trainers', value: stats.activeTrainers, icon: Users, variant: 'blue' },
        { label: 'General Clients', value: stats.generalClients, icon: Shield, variant: 'indigo' },
        { label: 'PT Clients', value: stats.ptClients, icon: Award, variant: 'blue' },
        { label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, variant: 'indigo' },
        { label: 'Avg Clients/Trainer', value: stats.avgClientsPerTrainer, icon: TrendingUp, variant: 'blue' }
    ];

    return (
        <div className="min-h-screen ">
            <div className="max-w-full mx-auto space-y-8">

                {/* Premium Header */}
                <div className="mb-8 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-10 animate-pulse pointer-events-none group-hover:opacity-15 transition-opacity"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-100  flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg shadow-violet-200 transition-transform duration-300 group-hover:scale-105">
                                <Users size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">
                                    Trainers
                                </h1>
                                <p className="text-slate-600 text-sm font-medium mt-1">Manage trainers, certifications, and client assignments</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setShowInactive(!showInactive)}
                                className={`px-5 h-11 rounded-xl text-xs font-bold transition-all border-2 ${showInactive ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 shadow-sm'}`}
                            >
                                {showInactive ? 'Show All' : 'Show Inactive'}
                            </button>
                            <button
                                onClick={() => { resetForm(); setIsDrawerOpen(true); }}
                                className="h-11 px-6 bg-gradient-to-r from-primary to-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30/20 hover:shadow-primary/30/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Add Trainer
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {kpiCards.map((kpi, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between h-full group transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5 relative overflow-hidden">
                            {/* Background Decorative Circle */}
                            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl transition-opacity group-hover:opacity-100 opacity-50 pointer-events-none"></div>

                            <div className="flex items-start justify-between w-full relative z-10">
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{kpi.label}</p>
                                    <h3 className="text-3xl font-black text-slate-900 truncate">{kpi.value}</h3>
                                </div>
                                <div className={`w-12 h-12 flex-shrink-0 rounded-xl ${kpi.variant === 'blue' ? 'bg-primary-light text-primary' : 'bg-primary-light text-primary'} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    <kpi.icon size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Search/Filter Bar */}
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-12 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-sm focus:border-primary transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
                            <select className="bg-transparent text-sm font-bold text-slate-600 outline-none">
                                <option>Recent First</option>
                                <option>A-Z</option>
                            </select>
                        </div>
                    </div>

                    {/* Trainer List */}
                    <div className="saas-table-wrapper border-0 rounded-none">
                        <table className="saas-table saas-table-responsive">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trainer Details</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Info</th>
                                    <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-12 text-center text-slate-400 italic pointer-events-none" data-label="Status">
                                            Loading trainers...
                                        </td>
                                    </tr>
                                ) : filteredTrainers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-12 text-center text-slate-400 italic pointer-events-none" data-label="Status">
                                            No trainers found.
                                        </td>
                                    </tr>
                                ) : filteredTrainers.map((trainer) => (
                                    <tr key={trainer.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6" data-label="Trainer Details">
                                            <div className="flex items-center gap-4 justify-end sm:justify-start">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-violet-100 flex items-center justify-center text-primary font-bold text-lg">
                                                    {trainer.name?.charAt(0)}
                                                </div>
                                                <div className="text-right sm:text-left">
                                                    <p className="font-bold text-slate-900">{trainer.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{trainer.salaryType || 'Monthly'} Plan</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6" data-label="Specialization">
                                            <div className="flex justify-end sm:justify-start">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                                                    {trainer.specialization || 'General Training'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6" data-label="Contact">
                                            <div className="space-y-1 text-right sm:text-left">
                                                <div className="flex items-center justify-end sm:justify-start gap-2 text-xs text-slate-600">
                                                    <Mail size={12} className="text-slate-400" /> {trainer.email}
                                                </div>
                                                <div className="flex items-center justify-end sm:justify-start gap-2 text-xs text-slate-600">
                                                    <Phone size={12} className="text-slate-400" /> {trainer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6" data-label="Status">
                                            <div className="flex justify-end sm:justify-start">
                                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${trainer.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    <div className={`w-1 h-1 rounded-full mr-1.5 ${trainer.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    {trainer.status}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6" data-label="Salary Info">
                                            <div className="text-right sm:text-left">
                                                {trainer.salaryType === 'Hourly' ? (
                                                    <div>
                                                        <p className="font-bold text-slate-900">₹{trainer.hourlyRate || 0}/hr</p>
                                                        <p className="text-[10px] font-bold text-emerald-600">{trainer.ptSharePercent || 0}% PT Share</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="font-bold text-slate-900">₹{trainer.baseSalary != null ? Number(trainer.baseSalary).toLocaleString('en-IN') : '0'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">Monthly Base</p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right" data-label="Actions">
                                            <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 sm:transition-all">
                                                <button onClick={() => openEditDrawer(trainer)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-primary transition-all shadow-sm border border-transparent hover:border-slate-100">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(trainer.id)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-all shadow-sm border border-transparent hover:border-slate-100">
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
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-2">
                            <Users size={40} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to upload photo</p>
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
