import React, { useState, useEffect } from 'react';
import {
    Save,
    Plus,
    Trash2,
    CheckCircle2,
    Info,
    Sparkles,
    ChevronDown,
    ChevronRight,
    Building2,
    Activity,
    Gift,
    Infinity,
    Wrench,
    Users
} from 'lucide-react';

import CustomDropdown from '../../components/common/CustomDropdown';
import { addPlan, editPlan, fetchPlans } from '../../api/superadmin/superAdminApi';
import PlanLimitField from './PlanLimitField';

const PlanFormDrawer = ({ isOpen, onClose, editId, onSuccess }) => {
    const [formData, setFormData] = useState({
        planName: '',
        price: '',
        billingCycle: 'Monthly',
        description: '',
        status: true,
        features: [],

        // Organization Limits
        limits: {
            branches: { value: 1, isUnlimited: false },
            managers: { value: 2, isUnlimited: false },
            staff: { value: 5, isUnlimited: false },
            trainers: { value: 3, isUnlimited: false },
            members: { value: 100, isUnlimited: false }
        },

        // Operational Limits
        opsLimits: {
            workouts: { value: 10, isUnlimited: false },
            diets: { value: 10, isUnlimited: false },
            classes: { value: 5, isUnlimited: false },
            checkins: { value: 30, isUnlimited: false },
            leads: { value: 50, isUnlimited: false }
        },

        // Member Benefit Limits
        benefits: []
    });

    const [activeSections, setActiveSections] = useState({
        basic: true,
        limits: true,
        ops: true,
        benefits: true
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (editId) {
                loadPlan(parseInt(editId));
            } else {
                setFormData({
                    planName: '',
                    price: '',
                    billingCycle: 'Monthly',
                    description: '',
                    status: true,
                    features: [],
                    limits: {
                        branches: { value: 1, isUnlimited: false },
                        managers: { value: 2, isUnlimited: false },
                        staff: { value: 5, isUnlimited: false },
                        trainers: { value: 3, isUnlimited: false },
                        members: { value: 100, isUnlimited: false }
                    },
                    opsLimits: {
                        workouts: { value: 10, isUnlimited: false },
                        diets: { value: 10, isUnlimited: false },
                        classes: { value: 5, isUnlimited: false },
                        checkins: { value: 30, isUnlimited: false },
                        leads: { value: 50, isUnlimited: false }
                    },
                    benefits: []
                });
            }
            setErrors({});
        }
    }, [isOpen, editId]);

    const loadPlan = async (id) => {
        const allPlans = await fetchPlans();
        const plan = allPlans.find(p => p.id === id);
        if (plan) {
            setFormData({
                planName: plan.name,
                price: plan.price,
                billingCycle: plan.period,
                description: plan.description || '',
                status: plan.status === 'Active',
                features: plan.features || [],
                limits: plan.limits || formData.limits,
                opsLimits: plan.opsLimits || formData.opsLimits,
                benefits: plan.benefits || []
            });
        }
    };

    const toggleSection = (section) => {
        setActiveSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleLimitChange = (group, field, key, value) => {
        setFormData(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [field]: { ...prev[group][field], [key]: value }
            }
        }));
    };

    const addBenefit = () => {
        setFormData(prev => ({
            ...prev,
            benefits: [...prev.benefits, {
                id: Date.now(),
                name: '',
                limit: '5',
                isUnlimited: false,
                unit: 'Lifetime',
                gender: 'All',
                room: ''
            }]
        }));
    };

    const removeBenefit = (id) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.filter(b => b.id !== id)
        }));
    };

    const updateBenefit = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.map(b => b.id === id ? { ...b, [field]: value } : b)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.planName.trim()) newErrors.planName = 'Plan name is required';
        if (!formData.price) newErrors.price = 'Price is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setActiveSections(prev => ({ ...prev, basic: true }));
            alert("Please fill in all required fields (Name, Price, Description).");
            return;
        }

        setIsSubmitting(true);
        try {
            const planData = {
                name: formData.planName,
                price: formData.price,
                period: formData.billingCycle,
                features: formData.features,
                limits: formData.limits,
                opsLimits: formData.opsLimits,
                benefits: formData.benefits,
                status: formData.status ? 'Active' : 'Inactive',
                description: formData.description
            };

            if (editId) {
                await editPlan(parseInt(editId), planData);
            } else {
                await addPlan(planData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Failed to save plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const CollapsibleHeader = ({ icon: Icon, title, subtitle, section, active, color }) => (
        <div
            onClick={() => toggleSection(section)}
            className={`flex items-center justify-between p-4 cursor-pointer rounded-2xl transition-all ${active ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-white shadow-sm border border-slate-100 ${color}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="font-black text-slate-800 text-sm tracking-tight">{title}</h4>
                    {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subtitle}</p>}
                </div>
            </div>
            {active ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-24">
            {/* SECTION 1: BASIC INFO */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <CollapsibleHeader
                    icon={Wrench}
                    title="Basic Plan Information"
                    subtitle="Plan core details and pricing"
                    section="basic"
                    active={activeSections.basic}
                    color="text-indigo-600"
                />

                {activeSections.basic && (
                    <div className="p-6 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Plan Name *</label>
                            <input
                                type="text"
                                name="planName"
                                className={`w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors.planName ? 'border-red-500 bg-white' : ''}`}
                                placeholder="e.g., Enterprise Premium"
                                value={formData.planName}
                                onChange={handleInputChange}
                            />
                            {errors.planName && <p className="text-xs text-red-500 font-bold">{errors.planName}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Price (₹) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    className={`w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors.price ? 'border-red-500 bg-white' : ''}`}
                                    placeholder="4999"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Billing Cycle</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                    value={formData.billingCycle}
                                    onChange={(e) => setFormData(p => ({ ...p, billingCycle: e.target.value }))}
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Yearly">Yearly</option>
                                    <option value="Lifetime">Lifetime / One-time</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Description *</label>
                            <textarea
                                name="description"
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all min-h-[80px]"
                                placeholder="Describe who this plan is for..."
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* SECTION 2: RESOURCE LIMITS */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <CollapsibleHeader
                    icon={Building2}
                    title="Organization Limits"
                    subtitle="Control branches and accounts"
                    section="limits"
                    active={activeSections.limits}
                    color="text-emerald-600"
                />

                {activeSections.limits && (
                    <div className="p-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <PlanLimitField
                            label="Max Branches"
                            value={formData.limits.branches.value}
                            isUnlimited={formData.limits.branches.isUnlimited}
                            onChange={(v) => handleLimitChange('limits', 'branches', 'value', v)}
                            onToggleUnlimited={(v) => handleLimitChange('limits', 'branches', 'isUnlimited', v)}
                        />
                        <PlanLimitField
                            label="Max Managers"
                            value={formData.limits.managers.value}
                            isUnlimited={formData.limits.managers.isUnlimited}
                            onChange={(v) => handleLimitChange('limits', 'managers', 'value', v)}
                            onToggleUnlimited={(v) => handleLimitChange('limits', 'managers', 'isUnlimited', v)}
                        />
                        <PlanLimitField
                            label="Max Staff Accounts"
                            value={formData.limits.staff.value}
                            isUnlimited={formData.limits.staff.isUnlimited}
                            onChange={(v) => handleLimitChange('limits', 'staff', 'value', v)}
                            onToggleUnlimited={(v) => handleLimitChange('limits', 'staff', 'isUnlimited', v)}
                        />
                        <PlanLimitField
                            label="Max Trainers"
                            value={formData.limits.trainers.value}
                            isUnlimited={formData.limits.trainers.isUnlimited}
                            onChange={(v) => handleLimitChange('limits', 'trainers', 'value', v)}
                            onToggleUnlimited={(v) => handleLimitChange('limits', 'trainers', 'isUnlimited', v)}
                        />
                        <div className="md:col-span-2">
                            <PlanLimitField
                                label="Max Members per Branch"
                                value={formData.limits.members.value}
                                isUnlimited={formData.limits.members.isUnlimited}
                                onChange={(v) => handleLimitChange('limits', 'members', 'value', v)}
                                onToggleUnlimited={(v) => handleLimitChange('limits', 'members', 'isUnlimited', v)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* SECTION 3: OPERATIONAL LIMITS */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <CollapsibleHeader
                    icon={Activity}
                    title="Operational Limits"
                    subtitle="Workout, Diet & Lead controls"
                    section="ops"
                    active={activeSections.ops}
                    color="text-amber-600"
                />

                {activeSections.ops && (
                    <div className="p-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <PlanLimitField
                            label="Active Workout Plans"
                            value={formData.opsLimits.workouts.value}
                            isUnlimited={formData.opsLimits.workouts.isUnlimited}
                            onChange={(v) => handleLimitChange('opsLimits', 'workouts', 'value', v)}
                            onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'workouts', 'isUnlimited', v)}
                        />
                        <PlanLimitField
                            label="Diet Plans"
                            value={formData.opsLimits.diets.value}
                            isUnlimited={formData.opsLimits.diets.isUnlimited}
                            onChange={(v) => handleLimitChange('opsLimits', 'diets', 'value', v)}
                            onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'diets', 'isUnlimited', v)}
                        />
                        <PlanLimitField
                            label="Classes / Schedule"
                            value={formData.opsLimits.classes.value}
                            isUnlimited={formData.opsLimits.classes.isUnlimited}
                            onChange={(v) => handleLimitChange('opsLimits', 'classes', 'value', v)}
                            onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'classes', 'isUnlimited', v)}
                        />
                        <PlanLimitField
                            label="Leads per Month"
                            value={formData.opsLimits.leads.value}
                            isUnlimited={formData.opsLimits.leads.isUnlimited}
                            onChange={(v) => handleLimitChange('opsLimits', 'leads', 'value', v)}
                            onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'leads', 'isUnlimited', v)}
                        />
                    </div>
                )}
            </div>

            {/* SECTION 4: MEMBER BENEFITS */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <CollapsibleHeader
                    icon={Gift}
                    title="Member Benefit Usage Limits"
                    subtitle="Directly syncs with Benefit Tracking"
                    section="benefits"
                    active={activeSections.benefits}
                    color="text-rose-600"
                />

                {activeSections.benefits && (
                    <div className="p-6 pt-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-center bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                            <div>
                                <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Benefit Sync Active</h5>
                                <p className="text-xs font-bold text-slate-500">Configure sessions/access per member tier.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addBenefit}
                                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-200 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus size={16} /> Add Benefit
                            </button>
                        </div>

                        {formData.benefits.map((benefit, index) => (
                            <div key={benefit.id} className="relative group animate-in zoom-in-95 duration-200">
                                <button
                                    type="button"
                                    onClick={() => removeBenefit(benefit.id)}
                                    className="absolute -right-2 -top-2 w-8 h-8 bg-white shadow-lg border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 transition-all z-10"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Benefit Name</label>
                                            <input
                                                type="text"
                                                value={benefit.name}
                                                onChange={(e) => updateBenefit(benefit.id, 'name', e.target.value)}
                                                placeholder="e.g., Sauna Sessions"
                                                className="w-full px-4 py-2 bg-white rounded-xl text-sm font-bold border-2 border-transparent focus:border-rose-500 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Room / Facility</label>
                                            <input
                                                type="text"
                                                value={benefit.room || ''}
                                                onChange={(e) => updateBenefit(benefit.id, 'room', e.target.value)}
                                                placeholder="e.g., Room A, Sauna 1"
                                                className="w-full px-4 py-2 bg-white rounded-xl text-sm font-bold border-2 border-transparent focus:border-rose-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender Separation</label>
                                            <select
                                                value={benefit.gender || 'All'}
                                                onChange={(e) => updateBenefit(benefit.id, 'gender', e.target.value)}
                                                className="w-full px-4 py-2 bg-white rounded-xl text-sm font-bold border-2 border-transparent focus:border-rose-500 outline-none transition-all cursor-pointer"
                                            >
                                                <option value="All">All Genders</option>
                                                <option value="Male">Male Only</option>
                                                <option value="Female">Female Only</option>
                                            </select>
                                        </div>
                                    </div>

                                    <PlanLimitField
                                        label="Quota Limit"
                                        value={benefit.limit}
                                        isUnlimited={benefit.isUnlimited}
                                        onChange={(v) => updateBenefit(benefit.id, 'limit', v)}
                                        onToggleUnlimited={(v) => updateBenefit(benefit.id, 'isUnlimited', v)}
                                        unitValue={benefit.unit}
                                        onUnitChange={(v) => updateBenefit(benefit.id, 'unit', v)}
                                        options={[
                                            { value: 'Per Month', label: 'Per Month' },
                                            { value: 'Per Year', label: 'Per Year' },
                                            { value: 'Lifetime', label: 'Entire Duration' }
                                        ]}
                                    />
                                </div>
                            </div>
                        ))}

                        {formData.benefits.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[32px]">
                                <Infinity size={40} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-sm font-bold text-slate-400">No member benefits configured for this plan.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="fixed bottom-0 right-0 left-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50 flex gap-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 hover:shadow-indigo-300 transition-all active:scale-95"
                >
                    <Save size={18} />
                    {isSubmitting ? 'Saving Configuration...' : (editId ? 'Update & Sync Plan' : 'Establish SaaS Plan')}
                </button>
            </div>
        </form>
    );
};

export default PlanFormDrawer;
