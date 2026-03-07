import React, { useState, useEffect } from 'react';
import { Camera, Save, UserPlus, ChevronLeft, Clock, Info } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createStaffAPI, fetchStaffByIdAPI, updateStaffAPI, fetchAvailableUsersAPI, linkStaffAPI } from '../../../api/admin/adminApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';

const StaffForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const isEditMode = !!id;
    const isReadOnly = location.state?.readOnly || false;
    const profileImageRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState('Create New User');
    const [profileImage, setProfileImage] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        branch: '',
        role: 'Staff',
        department: '',
        position: '',
        joiningDate: '',
        salaryType: 'Monthly',
        baseSalary: '',
        commission: '',
        bankName: '',
        accountNumber: '',
        ifsc: '',
        taxId: ''
    });

    const { branches, selectedBranch } = useBranchContext();
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Link Existing State
    const [linkData, setLinkData] = useState({
        userId: '',
        branchId: selectedBranch === 'all' ? '' : selectedBranch,
        role: 'Staff',
        department: '',
        position: '',
        joiningDate: new Date().toISOString().split('T')[0],
        salaryType: 'Monthly',
        baseSalary: '',
        commission: '',
        bankName: '',
        accountNumber: '',
        ifsc: '',
        taxId: ''
    });

    useEffect(() => {
        if (isEditMode) {
            fetchStaffDetails();
        } else if (selectedBranch !== 'all' && !formData.branch) {
            setFormData(prev => ({ ...prev, branch: selectedBranch }));
            setLinkData(prev => ({ ...prev, branchId: selectedBranch }));
        }
    }, [id, selectedBranch]);

    useEffect(() => {
        if (activeTab === 'Link Existing') {
            loadAvailableUsers();
        }
    }, [activeTab, linkData.branchId]);

    const loadAvailableUsers = async () => {
        try {
            setLoadingUsers(true);
            const data = await fetchAvailableUsersAPI(linkData.branchId);
            setAvailableUsers(data || []);
        } catch (error) {
            console.error('Failed to load available users', error);
            // toast.error('Failed to load available users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchStaffDetails = async () => {
        try {
            const data = await fetchStaffByIdAPI(id);
            if (!data) return;

            let displayRole = data.role;
            if (data.role === 'BRANCH_ADMIN') displayRole = 'Admin';

            const formattedJoined = data.joinedDate ? new Date(data.joinedDate).toISOString().split('T')[0] : '';

            let configData = {};
            if (data.config) {
                try {
                    configData = typeof data.config === 'string' ? JSON.parse(data.config) : data.config;
                    if (!configData || typeof configData !== 'object') configData = {};
                } catch (e) {
                    console.error('Error parsing config:', e);
                }
            }

            // Robust mapping of all 15 fields
            setFormData({
                name: data.name || '',
                phone: data.phone || '',
                email: data.email || '',
                branch: data.tenantId || '',
                role: displayRole || 'Staff',
                department: data.department || '',
                position: configData.position || configData.Position || '',
                joiningDate: formattedJoined,
                salaryType: configData.salaryType || configData.SalaryType || 'Monthly',
                baseSalary: (data.baseSalary !== null && data.baseSalary !== undefined) ? data.baseSalary.toString() : '',
                commission: (configData.commission ?? configData.commissionPercent ?? '').toString(),
                bankName: configData.bankName || configData.BankName || '',
                accountNumber: data.accountNumber || '',
                ifsc: data.ifsc || '',
                taxId: configData.taxId || configData.tax_id || configData.pan || configData.PAN || ''
            });

            if (data.avatar) {
                setProfileImage({ data: data.avatar });
            }
        } catch (error) {
            console.error('Failed to fetch staff details', error);
            toast.error('Failed to load staff details');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLinkChange = (e) => {
        const { name, value } = e.target;
        setLinkData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.role) newErrors.role = 'Role is required';
        if (!formData.branch) newErrors.branch = 'Branch is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage({
                    name: file.name,
                    type: file.type,
                    data: reader.result
                });
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
                tenantId: formData.branch, // Map branch selection to tenantId for backend
                avatar: profileImage ? profileImage.data : null
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

    const handleLinkSubmit = async (e) => {
        e.preventDefault();
        if (!linkData.userId || !linkData.branchId || !linkData.role) {
            toast.error('Please fill required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await linkStaffAPI(linkData);
            toast.success('Staff linked successfully!');
            navigate('/hr/staff/management');
        } catch (error) {
            console.error('Failed to link staff', error);
            toast.error(error.response?.data?.message || 'Failed to link staff');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-primary-light/30 p-6 pb-12 min-h-screen">
            <div className="mb-8 relative max-w-full mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                                <UserPlus className="text-primary" size={28} />
                                {isReadOnly ? "Staff Profile" : (isEditMode ? "Edit Employee" : "Add Employee")}
                            </h1>
                            <p className="text-slate-600 text-sm font-medium">
                                {isReadOnly ? "View detailed information of the employee" : "Create a new employee or link an existing user profile"}
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

            <div className="max-w-full mx-auto pb-20">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-8 px-4 sm:px-0">
                    <button
                        className={`px-6 py-3 font-bold text-sm transition-all duration-300 border-b-2 ${activeTab === 'Create New User' ? 'border-primary text-primary-hover' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        onClick={() => setActiveTab('Create New User')}
                    >
                        Create New User
                    </button>
                    <button
                        className={`px-6 py-3 font-bold text-sm transition-all duration-300 border-b-2 ${activeTab === 'Link Existing' ? 'border-primary text-primary-hover' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        onClick={() => setActiveTab('Link Existing')}
                    >
                        Link Existing
                    </button>
                </div>

                {activeTab === 'Create New User' && (
                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Wrapper for the exact structure asked by the user */}
                        <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">

                            {/* Helper Text */}
                            <div className="bg-primary-light/50 text-primary-hover text-sm font-medium px-4 py-3 rounded-xl border border-violet-100 flex items-center gap-2 mb-8 shadow-sm">
                                <Info size={18} className="text-primary shrink-0" />
                                The employee will receive a password setup prompt on their first login.
                            </div>

                            {/* Profile Upload */}
                            <div className="flex flex-col items-center justify-center mb-10">
                                <input
                                    type="file"
                                    ref={profileImageRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <div
                                    onClick={() => !isReadOnly && profileImageRef.current.click()}
                                    className={`relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:bg-slate-200 hover:border-violet-400'} transition-all duration-300 group overflow-hidden shadow-sm`}
                                >
                                    {profileImage ? (
                                        <img src={profileImage.data} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="text-slate-400 group-hover:text-primary transition-colors" size={28} />
                                    )}
                                </div>
                                {!isReadOnly && (
                                    <>
                                        <span className="text-xs font-bold text-slate-500 mt-3 uppercase tracking-wider">Profile Image Upload</span>
                                        <span className="text-[10px] text-slate-400 mt-1">(Click camera to upload)</span>
                                    </>
                                )}
                            </div>

                            {/* Form Fields - Exact Order */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                {/* 1. Full Name * */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Full Name <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        disabled={isReadOnly}
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : (errors.name ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm')}`}
                                    />
                                    {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1.5">{errors.name}</p>}
                                </div>

                                {/* 2. Phone */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        disabled={isReadOnly}
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm'}`}
                                    />
                                </div>

                                {/* 3. Email * */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Email <span className="text-rose-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        disabled={isReadOnly}
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : (errors.email ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm')}`}
                                    />
                                    {errors.email && <p className="text-[10px] text-rose-500 font-bold mt-1.5">{errors.email}</p>}
                                </div>

                                {/* 4. Branch * */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Branch <span className="text-rose-500">*</span></label>
                                    <select
                                        name="branch"
                                        disabled={isReadOnly}
                                        value={formData.branch || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer transition-all ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : (errors.branch ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm')}`}
                                    >
                                        <option value="" disabled>Select branch</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.branchName || b.name}</option>
                                        ))}
                                    </select>
                                    {errors.branch && <p className="text-[10px] text-rose-500 font-bold mt-1.5">{errors.branch}</p>}
                                </div>

                                {/* 5. Role * */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Role <span className="text-rose-500">*</span></label>
                                    <select
                                        name="role"
                                        disabled={isReadOnly}
                                        value={formData.role || 'Staff'}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer transition-all ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : (errors.role ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm')}`}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Trainer">Trainer</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                    {errors.role && <p className="text-[10px] text-rose-500 font-bold mt-1.5">{errors.role}</p>}
                                </div>

                                {/* 6. Department */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        disabled={isReadOnly}
                                        value={formData.department || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm'}`}
                                    />
                                </div>

                                {/* 7. Position */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Position</label>
                                    <input
                                        type="text"
                                        name="position"
                                        disabled={isReadOnly}
                                        value={formData.position || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm'}`}
                                    />
                                </div>

                                {/* 8. Hire Date */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Hire Date</label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        disabled={isReadOnly}
                                        value={formData.joiningDate || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm'}`}
                                    />
                                </div>

                                {/* 9. Salary Type */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Salary Type</label>
                                    <select
                                        name="salaryType"
                                        disabled={isReadOnly}
                                        value={formData.salaryType || 'Monthly'}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer transition-all ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'focus:border-primary hover:border-slate-300 shadow-sm'}`}
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Hourly">Hourly</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Bi-Weekly">Bi-Weekly</option>
                                    </select>
                                </div>

                                {/* 10. Salary (₹) */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Salary (₹)</label>
                                    <input
                                        type="number"
                                        name="baseSalary"
                                        disabled={isReadOnly}
                                        value={formData.baseSalary || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm'}`}
                                    />
                                </div>

                                {/* 11. Commission Percent (%) */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Commission (%)</label>
                                    <input
                                        type="number"
                                        name="commission"
                                        disabled={isReadOnly}
                                        value={formData.commission || ''}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm'}`}
                                    />
                                </div>

                                {/* 12. Bank Name */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Bank Name</label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        disabled={isReadOnly}
                                        value={formData.bankName || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm'}`}
                                    />
                                </div>

                                {/* 13. Account Number */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Account Number</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        disabled={isReadOnly}
                                        value={formData.accountNumber || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm'}`}
                                    />
                                </div>

                                {/* 14. IFSC Code */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">IFSC Code</label>
                                    <input
                                        type="text"
                                        name="ifsc"
                                        disabled={isReadOnly}
                                        value={formData.ifsc || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm'}`}
                                    />
                                </div>

                                {/* 15. PAN / Tax ID */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">PAN / Tax ID</label>
                                    <input
                                        type="text"
                                        name="taxId"
                                        disabled={isReadOnly}
                                        value={formData.taxId || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/80 border-2 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all duration-300 ${isReadOnly ? 'border-slate-100 bg-slate-50/50 cursor-default' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 shadow-sm'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons inside form container but outside the white card */}
                        <div className="flex justify-end items-center gap-4 mt-8">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-8 py-3.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm text-sm"
                            >
                                {isReadOnly ? 'Close' : 'Cancel'}
                            </button>
                            {!isReadOnly && (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-10 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary text-white ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-primary/30/30'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Clock className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {isEditMode ? 'Update Employee' : 'Create Employee'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                )}

                {activeTab === 'Link Existing' && (
                    <form onSubmit={handleLinkSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">

                            {/* Helper Text */}
                            <div className="bg-primary-light/50 text-primary-hover text-sm font-medium px-4 py-3 rounded-xl border border-violet-100 flex items-center gap-2 mb-8 shadow-sm">
                                <Info size={18} className="text-primary shrink-0" />
                                Only profiles that are NOT linked to members are shown.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                {/* User Dropdown */}
                                <div className="relative group md:col-span-2">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">User <span className="text-rose-500">*</span></label>
                                    <select
                                        name="userId"
                                        value={linkData.userId}
                                        onChange={handleLinkChange}
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer transition-all focus:border-primary hover:border-slate-300 shadow-sm"
                                        required
                                    >
                                        <option value="" disabled>{loadingUsers ? 'Loading users...' : 'Select user'}</option>
                                        {availableUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Branch Dropdown */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Branch <span className="text-rose-500">*</span></label>
                                    <select
                                        name="branchId"
                                        value={linkData.branchId}
                                        onChange={handleLinkChange}
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer transition-all focus:border-primary hover:border-slate-300 shadow-sm"
                                        required
                                    >
                                        <option value="" disabled>Select branch</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.branchName || b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Role Selection */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Role <span className="text-rose-500">*</span></label>
                                    <select
                                        name="role"
                                        value={linkData.role}
                                        onChange={handleLinkChange}
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer transition-all focus:border-primary hover:border-slate-300 shadow-sm"
                                        required
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Trainer">Trainer</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                </div>

                                {/* Department */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={linkData.department}
                                        onChange={handleLinkChange}
                                        placeholder="e.g., Fitness, Sales"
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                    />
                                </div>

                                {/* Position */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Position</label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={linkData.position}
                                        onChange={handleLinkChange}
                                        placeholder="e.g., Senior Trainer"
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                    />
                                </div>

                                {/* Hire Date */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Hire Date</label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={linkData.joiningDate}
                                        onChange={handleLinkChange}
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                    />
                                </div>

                                {/* Salary Type */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Salary Type</label>
                                    <select
                                        name="salaryType"
                                        value={linkData.salaryType}
                                        onChange={handleLinkChange}
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer transition-all focus:border-primary hover:border-slate-300 shadow-sm"
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Hourly">Hourly</option>
                                        <option value="Weekly">Weekly</option>
                                    </select>
                                </div>

                                {/* Salary */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Salary (₹)</label>
                                    <input
                                        type="number"
                                        name="baseSalary"
                                        value={linkData.baseSalary}
                                        onChange={handleLinkChange}
                                        placeholder="Salary amount"
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                    />
                                </div>

                                {/* Commission (%) */}
                                <div className="relative group">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Commission (%)</label>
                                    <input
                                        type="number"
                                        name="commission"
                                        value={linkData.commission}
                                        onChange={handleLinkChange}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                    />
                                </div>

                                {/* Bank Details Headings */}
                                <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-800 mb-4">Bank Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                        {/* Bank Name */}
                                        <div className="relative group">
                                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Bank Name</label>
                                            <input
                                                type="text"
                                                name="bankName"
                                                value={linkData.bankName}
                                                onChange={handleLinkChange}
                                                placeholder="e.g., HDFC Bank"
                                                className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                            />
                                        </div>

                                        {/* Account Number */}
                                        <div className="relative group">
                                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Account Number</label>
                                            <input
                                                type="text"
                                                name="accountNumber"
                                                value={linkData.accountNumber}
                                                onChange={handleLinkChange}
                                                placeholder="Account number"
                                                className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                            />
                                        </div>

                                        {/* PAN / Tax ID */}
                                        <div className="relative group">
                                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">PAN / Tax ID</label>
                                            <input
                                                type="text"
                                                name="taxId"
                                                value={linkData.taxId}
                                                onChange={handleLinkChange}
                                                placeholder="PAN number"
                                                className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                            />
                                        </div>

                                        {/* IFSC Code */}
                                        <div className="relative group">
                                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">IFSC Code</label>
                                            <input
                                                type="text"
                                                name="ifsc"
                                                value={linkData.ifsc}
                                                onChange={handleLinkChange}
                                                placeholder="IFSC code"
                                                className="w-full px-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons inside form container but outside the white card */}
                        <div className="flex justify-end items-center gap-4 mt-8">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-8 py-3.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-10 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary text-white ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-primary/30/30'}`}
                            >
                                {isSubmitting ? 'Linking...' : 'Add Employee'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StaffForm;
