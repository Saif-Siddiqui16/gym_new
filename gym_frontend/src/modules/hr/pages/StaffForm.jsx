import React, { useState, useEffect } from 'react';
import { Upload, Save, UserPlus, Building2, DollarSign, FileText, ChevronLeft, Info, Star, Award, Zap, TrendingUp, Target, Percent, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createStaffAPI, fetchStaffByIdAPI, updateStaffAPI } from '../../../api/admin/adminApi';
import toast from 'react-hot-toast';

// Initial State with Nested Configurations
const initialTrainerConfig = {
    specialization: '',
    commissionType: 'percentage', // percentage | fixed
    commissionValue: '',
    ptRate: '', // Optional: Per session rate
    experience: ''
};

const initialSalesConfig = {
    commissionPercent: '',
    monthlyTarget: '',
    bonusPercent: ''
};

const initialManagerConfig = {
    performanceBonus: ''
};

// --- Sub-Components for Config Sections ---

const TrainerConfigSection = ({ config, errors, onChange }) => (
    <div className="bg-gradient-to-br from-violet-50 to-white rounded-xl shadow-lg border border-violet-100 p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-violet-900 flex items-center gap-2">
                <Award className="text-violet-600" size={20} />
                Trainer Configuration
            </h3>
            <div className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                PT Sync Active
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">Specialization <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input
                        type="text"
                        value={config?.specialization || ''}
                        onChange={(e) => onChange('trainerConfig', 'specialization', e.target.value)}
                        placeholder="e.g. Yoga, HIIT, Rehab"
                        className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none transition-all duration-300 ${errors['trainerConfig.specialization'] ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 hover:border-violet-300'}`}
                    />
                    <Star size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" />
                </div>
                {errors['trainerConfig.specialization'] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors['trainerConfig.specialization']}</p>}
            </div>

            <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">Experience (Years)</label>
                <div className="relative">
                    <input
                        type="number"
                        value={config?.experience || ''}
                        onChange={(e) => onChange('trainerConfig', 'experience', e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 hover:border-violet-300 transition-all duration-300"
                    />
                    <Zap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" />
                </div>
            </div>

            <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">Commission Type</label>
                <select
                    value={config?.commissionType || 'percentage'}
                    onChange={(e) => onChange('trainerConfig', 'commissionType', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 hover:border-violet-300 appearance-none cursor-pointer"
                >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                </select>
            </div>

            <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">Commission Value <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input
                        type="number"
                        value={config?.commissionValue || ''}
                        onChange={(e) => onChange('trainerConfig', 'commissionValue', e.target.value)}
                        placeholder={config?.commissionType === 'percentage' ? "0-100" : "Amount"}
                        className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none transition-all duration-300 ${errors['trainerConfig.commissionValue'] ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 hover:border-violet-300'}`}
                    />
                    {config?.commissionType === 'percentage' ? (
                        <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" />
                    ) : (
                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" />
                    )}
                </div>
                {errors['trainerConfig.commissionValue'] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors['trainerConfig.commissionValue']}</p>}
            </div>
        </div>
    </div>
);

const SalesConfigSection = ({ config, errors, onChange }) => (
    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-lg border border-emerald-100 p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={20} />
                Sales Configuration
            </h3>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                Incentive Sync
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Commission %</label>
                <div className="relative">
                    <input
                        type="number"
                        value={config?.commissionPercent || ''}
                        onChange={(e) => onChange('salesConfig', 'commissionPercent', e.target.value)}
                        placeholder="0-100"
                        className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none transition-all duration-300 ${errors['salesConfig.commissionPercent'] ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-300'}`}
                    />
                    <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                </div>
                {errors['salesConfig.commissionPercent'] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors['salesConfig.commissionPercent']}</p>}
            </div>

            <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Monthly Target (₹)</label>
                <div className="relative">
                    <input
                        type="number"
                        value={config?.monthlyTarget || ''}
                        onChange={(e) => onChange('salesConfig', 'monthlyTarget', e.target.value)}
                        placeholder="Target Amount"
                        className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none transition-all duration-300 ${errors['salesConfig.monthlyTarget'] ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-300'}`}
                    />
                    <Target size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                </div>
                {errors['salesConfig.monthlyTarget'] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors['salesConfig.monthlyTarget']}</p>}
            </div>
            <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Bonus over Target %</label>
                <div className="relative">
                    <input
                        type="number"
                        value={config?.bonusPercent || ''}
                        onChange={(e) => onChange('salesConfig', 'bonusPercent', e.target.value)}
                        placeholder="Optional"
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-300 transition-all duration-300"
                    />
                    <Award size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                </div>
            </div>
        </div>
    </div>
);

const ManagerConfigSection = ({ config, errors, onChange }) => (
    <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-lg border border-orange-100 p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                <Briefcase className="text-orange-600" size={20} />
                Manager Configuration
            </h3>
            <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                Branch Level
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">Performance Bonus (Annual %)</label>
                <div className="relative">
                    <input
                        type="number"
                        value={config?.performanceBonus || ''}
                        onChange={(e) => onChange('managerConfig', 'performanceBonus', e.target.value)}
                        placeholder="e.g. 10"
                        className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none transition-all duration-300 ${errors['managerConfig.performanceBonus'] ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 hover:border-orange-300'}`}
                    />
                    <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
                </div>
                {errors['managerConfig.performanceBonus'] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors['managerConfig.performanceBonus']}</p>}
            </div>
        </div>
    </div>
);

const StaffForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const govtIdRef = React.useRef(null);
    const contractRef = React.useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        dob: '',
        department: 'Training',
        role: 'Trainer',
        joiningDate: '',
        status: 'Active',
        baseSalary: '',
        accountNumber: '',
        ifsc: '',
        trainerConfig: initialTrainerConfig,
        salesConfig: null,
        managerConfig: null
    });

    const [documents, setDocuments] = useState({ govtId: null, contract: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            fetchStaffDetails();
        }
    }, [id]);

    const fetchStaffDetails = async () => {
        try {
            const data = await fetchStaffByIdAPI(id);
            // Map plain role to frontend role names if needed
            let displayRole = data.role;
            if (data.role === 'BRANCH_ADMIN') displayRole = 'Admin';

            // Format dates
            const formattedDob = data.dob ? new Date(data.dob).toISOString().split('T')[0] : '';
            const formattedJoined = data.joinedDate ? new Date(data.joinedDate).toISOString().split('T')[0] : '';

            setFormData({
                ...data,
                role: displayRole,
                dob: formattedDob,
                joiningDate: formattedJoined,
                baseSalary: data.baseSalary || '',
                trainerConfig: data.role === 'TRAINER' ? data.config : initialTrainerConfig,
                managerConfig: data.role === 'MANAGER' ? data.config : initialManagerConfig,
                salesConfig: data.role === 'STAFF' ? data.config : initialSalesConfig,
            });
            if (data.documents) {
                setDocuments(data.documents);
            }
        } catch (error) {
            console.error('Failed to fetch staff details', error);
            toast.error('Failed to load staff details');
        }
    };

    // Keep the role logic but only if NOT in initial load of edit mode
    useEffect(() => {
        if (!isEditMode) {
            setFormData(prev => {
                const newData = { ...prev };
                if (prev.role === 'Trainer') {
                    newData.trainerConfig = initialTrainerConfig;
                    newData.salesConfig = null;
                    newData.managerConfig = null;
                } else if (prev.role === 'Manager') {
                    newData.managerConfig = initialManagerConfig;
                    newData.trainerConfig = null;
                    newData.salesConfig = null;
                } else {
                    newData.trainerConfig = null;
                    newData.salesConfig = null;
                    newData.managerConfig = null;
                }
                return newData;
            });
        }
    }, [formData.role, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfigChange = (configType, field, value) => {
        setFormData(prev => ({
            ...prev,
            [configType]: {
                ...prev[configType],
                [field]: value
            }
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.role) newErrors.role = 'Role is required';

        if (formData.role === 'Trainer' && formData.trainerConfig) {
            if (!formData.trainerConfig.commissionValue) {
                newErrors['trainerConfig.commissionValue'] = 'Commission value is required';
            }
            if (!formData.trainerConfig.specialization) newErrors['trainerConfig.specialization'] = 'Specialization is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocuments(prev => ({
                    ...prev,
                    [type]: {
                        name: file.name,
                        type: file.type,
                        data: reader.result
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                documents: documents
            };

            if (isEditMode) {
                await updateStaffAPI(id, payload);
                toast.success('Staff profile updated successfully!');
            } else {
                await createStaffAPI(payload);
                toast.success('Staff profile created successfully!');
            }
            navigate('/hr/staff/management');
        } catch (error) {
            console.error('Failed to submit staff form', error);
            toast.error(error.response?.data?.message || 'Failed to save staff profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 pb-12 min-h-screen">
            <div className="mb-8 relative max-w-6xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                                <UserPlus className="text-violet-600" size={28} />
                                {isEditMode ? 'Update Staff Profile' : 'New Staff Profile'}
                            </h1>
                            <p className="text-slate-600 text-sm">
                                {isEditMode ? 'Modify existing record and sync changes.' : 'Create a new employee record with role-specific sync.'}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-md hover:scale-105 transition-all duration-300 shadow-sm group"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                            Back
                        </button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <UserPlus className="text-violet-600" size={20} />
                                Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm focus:outline-none transition-all duration-300 ${errors.name ? 'border-red-500' : 'border-slate-200 focus:border-violet-500'}`}
                                    />
                                    {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.name}</p>}
                                </div>
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        placeholder="+91..."
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-all duration-300"
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        placeholder="email@example.com"
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm focus:outline-none transition-all duration-300 ${errors.email ? 'border-red-500' : 'border-slate-200 focus:border-violet-500'}`}
                                    />
                                    {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email}</p>}
                                </div>
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Building2 className="text-violet-600" size={20} />
                                Employment Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department || 'Training'}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option>Training</option>
                                        <option>Sales</option>
                                        <option>Operations</option>
                                        <option>Housekeeping</option>
                                    </select>
                                </div>
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Assigned Role <span className="text-red-500">*</span></label>
                                    <select
                                        name="role"
                                        value={formData.role || 'Trainer'}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Trainer">Trainer</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                </div>
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Joining Date</label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={formData.joiningDate || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-300"
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status || 'Active'}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option>Active</option>
                                        <option>Probation</option>
                                        <option>On Leave</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <DollarSign className="text-violet-600" size={20} />
                                Financials & Payroll (Base)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Base Salary (Monthly)</label>
                                    <input
                                        type="number"
                                        name="baseSalary"
                                        value={formData.baseSalary || ''}
                                        onChange={handleChange}
                                        placeholder="₹ 0.00"
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-300"
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Bank Account Number</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber || ''}
                                        onChange={handleChange}
                                        placeholder="Account number..."
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-300"
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">IFSC Code</label>
                                    <input
                                        type="text"
                                        name="ifsc"
                                        value={formData.ifsc || ''}
                                        onChange={handleChange}
                                        placeholder="IFSC..."
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.role === 'Trainer' && (
                            <TrainerConfigSection
                                config={formData.trainerConfig}
                                errors={errors}
                                onChange={handleConfigChange}
                            />
                        )}
                        {formData.role === 'Manager' && (
                            <ManagerConfigSection
                                config={formData.managerConfig}
                                errors={errors}
                                onChange={handleConfigChange}
                            />
                        )}

                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="text-violet-600" size={20} />
                                Documents
                            </h3>
                            <div className="space-y-4">
                                <input
                                    type="file"
                                    ref={govtIdRef}
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'govtId')}
                                />
                                <div
                                    onClick={() => govtIdRef.current.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group ${documents.govtId ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/30'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md ${documents.govtId ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'}`}>
                                        {documents.govtId ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {documents.govtId ? documents.govtId.name : 'Upload Government ID'}
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={contractRef}
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'contract')}
                                />
                                <div
                                    onClick={() => contractRef.current.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group ${documents.contract ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/30'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md ${documents.contract ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'}`}>
                                        {documents.contract ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {documents.contract ? documents.contract.name : 'Upload Contract'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`group relative w-full px-6 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <Clock className="w-5 h-5 animate-spin relative" />
                            ) : (
                                <Save className="w-5 h-5 relative transition-transform duration-300 group-hover:scale-110" />
                            )}
                            <span className="relative">{isSubmitting ? 'Processing...' : isEditMode ? 'Update Profile' : 'Save Profile'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default StaffForm;
