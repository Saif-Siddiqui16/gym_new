import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Phone, Calendar, CreditCard, Check, AlertCircle, ArrowRight, Loader2, Upload, CheckCircle2, ArrowLeft, Sparkles, X, Save } from 'lucide-react';
import { membershipApi } from '../../../api/membershipApi';
import toast from 'react-hot-toast';

import amenityApi from '../../../api/amenityApi';



const MembershipForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: 'Male',
        planId: '',
        startDate: new Date().toISOString().split('T')[0],
        amount: '',
        memberId: '', // For display or binding if needed
        status: 'Active',
        benefits: [],
        medicalHistory: '',
        fitnessGoal: '',
        emergencyName: '',
        emergencyPhone: ''
    });

    const fileInputRef = useRef(null);

    // Load plans and member data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                // 1. Fetch Plans (filtered by tenant in backend)
                const plansData = await membershipApi.getPlans();
                setPlans(plansData);

                // 2. Fetch Amenities
                const amenitiesData = await amenityApi.getAll();
                setAmenities(amenitiesData);

                // 3. Fetch Member if in edit mode
                if (isEditMode) {
                    const data = await membershipApi.getMemberById(id);
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        gender: data.gender || 'Male',
                        planId: data.planId || '',
                        startDate: data.joinDate ? new Date(data.joinDate).toISOString().split('T')[0] : '',
                        amount: '', // Backend might send plan details separately
                        memberId: data.memberId || '',
                        status: data.status || 'Active',
                        benefits: data.benefits || [],
                        medicalHistory: data.medicalHistory || '',
                        fitnessGoal: data.fitnessGoal || '',
                        emergencyName: data.emergencyName || '',
                        emergencyPhone: data.emergencyPhone || ''
                    });
                }
            } catch (error) {
                console.error('Initial load error:', error);
                toast.error('Failed to load required data');
                if (isEditMode) navigate('/memberships');
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [isEditMode, id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'planId') {
            const plan = plans.find(p => p.id === parseInt(value));
            if (plan) {
                setFormData(prev => ({ ...prev, amount: plan.price }));
            }
        }
    };

    const handleDateChange = (e) => {
        setFormData(prev => ({ ...prev, startDate: e.target.value }));
    };

    const handleBenefitToggle = (benefitId) => {
        setFormData(prev => {
            const newBenefits = prev.benefits.includes(benefitId)
                ? prev.benefits.filter(id => id !== benefitId)
                : [...prev.benefits, benefitId];
            return { ...prev, benefits: newBenefits };
        });
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('File size too large (max 5MB)');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }));
                toast.success('Image selected successfully');
            };
            reader.onerror = () => {
                toast.error('Failed to read file');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEditMode) {
                await membershipApi.updateMember(id, formData);
                toast.success('Member updated successfully!');
            } else {
                await membershipApi.createMember(formData);
                toast.success('Member created successfully!');
            }
            navigate('/memberships');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-6 pb-12">
            {/* Premium Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <button
                    onClick={() => navigate('/memberships')}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 transition-colors duration-300 group"
                >
                    <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="font-medium">Back to Memberships</span>
                </button>

                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                            <Sparkles className="text-indigo-600" size={28} />
                            {isEditMode ? 'Edit Membership' : 'New Membership'}
                        </h1>
                        <p className="text-gray-600 text-sm mt-2">
                            {isEditMode ? 'Update membership details and benefits' : 'Create a new membership for your member'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                {/* Membership Details Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <User size={20} />
                            Membership Details
                        </h2>
                    </div>

                    {/* Card Content */}
                    <div className="p-8 space-y-6">
                        {/* Personal Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 group col-span-2 md:col-span-1">
                                <label className="block text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gradient-to-br from-white to-indigo-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-300 transition-all duration-300 shadow-md"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="space-y-3 group col-span-2 md:col-span-1">
                                <label className="block text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gradient-to-br from-white to-indigo-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-300 transition-all duration-300 shadow-md"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-3 group col-span-2 md:col-span-1">
                                <label className="block text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gradient-to-br from-white to-indigo-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-300 transition-all duration-300 shadow-md"
                                    placeholder="+1 234 567 890"
                                    required
                                />
                            </div>

                            <div className="space-y-3 group col-span-2 md:col-span-1">
                                <label className="block text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gradient-to-br from-white to-indigo-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-300 transition-all duration-300 shadow-md"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Plan Selection */}
                        <div className="space-y-3 group mt-6">
                            <label className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Select Plan <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {plans.length === 0 ? (
                                    <div className="col-span-3 py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-gray-500 font-medium">No plans found. Please create membership plans first.</p>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/memberships/plans')}
                                            className="mt-3 text-sm font-bold text-indigo-600 hover:text-indigo-800 underline"
                                        >
                                            Go to Plans Management
                                        </button>
                                    </div>
                                ) : (
                                    plans.map(plan => (
                                        <div
                                            key={plan.id}
                                            onClick={() => handleChange({ target: { name: 'planId', value: plan.id } })}
                                            className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-300 ${parseInt(formData.planId) === plan.id
                                                ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-500/10'
                                                : 'border-slate-100 hover:border-indigo-200 hover:shadow-md'
                                                }`}
                                        >
                                            {parseInt(formData.planId) === plan.id && (
                                                <div className="absolute top-3 right-3 text-indigo-600">
                                                    <Check size={18} strokeWidth={3} />
                                                </div>
                                            )}
                                            <h3 className="font-bold text-slate-800">{plan.name}</h3>
                                            <p className="text-sm text-slate-500 mt-1">{plan.duration} {plan.durationType || 'Month'}{plan.duration > 1 ? 's' : ''}</p>
                                            <div className="mt-3 text-lg font-black text-indigo-600">₹{plan.price}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-3 group">
                                <label className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:text-blue-500" />
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full pl-14 pr-5 py-4 bg-gradient-to-br from-white to-blue-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 hover:shadow-lg transition-all duration-300 shadow-md"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3 group">
                                <label className="block text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gradient-to-br from-white to-emerald-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 shadow-md"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Frozen">Frozen</option>
                                    <option value="Expired">Expired</option>
                                </select>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-5 pt-6 border-t-2 border-gray-100 mt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Included Benefits</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {amenities.map((benefit) => (
                                    <div key={benefit.id} className={`relative flex items-start p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg group ${formData.benefits.includes(benefit.id)
                                        ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 shadow-md'
                                        : 'bg-white border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30'
                                        }`}>
                                        <div className="flex items-center h-5">
                                            <input
                                                id={benefit.id}
                                                type="checkbox"
                                                className="h-5 w-5 rounded-lg border-2 border-gray-300 text-indigo-600 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 cursor-pointer hover:scale-125 checked:scale-125 hover:shadow-lg"
                                                checked={formData.benefits.includes(benefit.id)}
                                                onChange={() => handleBenefitToggle(benefit.id)}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm flex-1">
                                            <label htmlFor={benefit.id} className={`font-semibold cursor-pointer select-none transition-all duration-300 ${formData.benefits.includes(benefit.id)
                                                ? 'text-indigo-700'
                                                : 'text-gray-700 group-hover:text-indigo-600'
                                                }`}>
                                                {benefit.name}
                                            </label>
                                            {benefit.gender && benefit.gender !== 'UNISEX' && (
                                                <span className={`block mt-1 w-max px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${benefit.gender === 'MALE' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                                    {benefit.gender} ONLY
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {amenities.length === 0 && (
                                    <div className="col-span-2 text-center py-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                        <p className="text-slate-500 text-sm">No amenities configured. Add them in settings.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical & Onboarding Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                        <h2 className="text-xl font-bold text-white">Medical & Onboarding</h2>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-3 group">
                            <label className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Medical History / Conditions
                            </label>
                            <textarea
                                name="medicalHistory"
                                className="w-full px-5 py-4 bg-gradient-to-br from-white to-purple-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 hover:border-purple-300 hover:shadow-lg transition-all duration-300 shadow-md resize-none"
                                rows="4"
                                placeholder="Any injuries, surgeries, or conditions we should be aware of?"
                                value={formData.medicalHistory || ''}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 group">
                                <label className="block text-sm font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                    Fitness Goal
                                </label>
                                <select
                                    name="fitnessGoal"
                                    className="w-full px-5 py-4 bg-gradient-to-br from-white to-pink-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 hover:border-pink-300 hover:shadow-lg transition-all duration-300 shadow-md"
                                    value={formData.fitnessGoal || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Goal</option>
                                    <option value="Weight Loss">Weight Loss</option>
                                    <option value="Muscle Gain">Muscle Gain</option>
                                    <option value="Endurance">General Endurance</option>
                                    <option value="Flexibility">Flexibility & Mobility</option>
                                    <option value="Rehabilitation">Rehabilitation</option>
                                </select>
                            </div>

                            <div className="space-y-3 group">
                                <label className="block text-sm font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                                    Emergency Contact Name
                                </label>
                                <input
                                    type="text"
                                    name="emergencyName"
                                    className="w-full px-5 py-4 bg-gradient-to-br from-white to-rose-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 hover:border-rose-300 hover:shadow-lg transition-all duration-300 shadow-md"
                                    placeholder="Name"
                                    value={formData.emergencyName || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 group">
                            <label className="block text-sm font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                Emergency Contact Phone
                            </label>
                            <input
                                type="tel"
                                name="emergencyPhone"
                                className="w-full px-5 py-4 bg-gradient-to-br from-white to-orange-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 hover:shadow-lg transition-all duration-300 shadow-md"
                                placeholder="+91..."
                                value={formData.emergencyPhone || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Biometric Data Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
                        <h2 className="text-xl font-bold text-white">Biometric Data</h2>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                onClick={handleUploadClick}
                                className="border-2 border-dashed border-indigo-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 transition-all duration-300 group relative overflow-hidden"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                {formData.avatar ? (
                                    <div className="absolute inset-0 w-full h-full">
                                        <img src={formData.avatar} alt="Face ID" className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-2 shadow-lg">
                                                <Upload size={24} className="text-indigo-600" />
                                            </div>
                                            <span className="font-bold text-gray-900 bg-white/50 px-3 py-1 rounded-full">Change Photo</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                            <Upload size={32} className="text-white" />
                                        </div>
                                        <span className="text-base font-bold text-gray-900 mb-1">Upload Face ID Avatar</span>
                                        <span className="text-sm text-gray-500">For Turnstile Access</span>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center justify-center">
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                                        Ensure good lighting
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                                        Neutral expression
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full"></div>
                                        No accessories (glasses/hats)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/memberships')}
                        className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} className="transition-transform duration-300 group-hover:rotate-12" />
                        )}
                        {isEditMode ? 'Update Membership' : 'Save Membership'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MembershipForm;
