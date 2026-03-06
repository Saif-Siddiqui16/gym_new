import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Zap,
    Building2,
    Activity,
    Gift,
    ChevronDown,
    ChevronRight,
    Wrench,
    Infinity
} from 'lucide-react';

import { addPlan, editPlan, fetchPlans } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';
import PlanLimitField from './PlanLimitField';

const CreatePlan = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const editId = queryParams.get('edit');

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
        if (editId) {
            loadPlan(parseInt(editId));
        }
    }, [editId]);

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
                unit: 'Per Month'
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
            navigate('/superadmin/plans/list');
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
            className={`flex items-center justify-between p-5 cursor-pointer rounded-[24px] transition-all ${active ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-white shadow-sm border border-slate-100 ${color}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h4 className="font-black text-slate-800 tracking-tight">{title}</h4>
                    {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{subtitle}</p>}
                </div>
            </div>
            {active ? <ChevronDown size={24} className="text-slate-400" /> : <ChevronRight size={24} className="text-slate-400" />}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/superadmin/plans/list')}
                    className="group flex items-center text-slate-500 hover:text-indigo-600 transition-all mb-8"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm tracking-tight">Back to SaaS Plans</span>
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                            {editId ? 'Refine SaaS Tier' : 'Establish New Tier'}
                        </h1>
                        <p className="text-slate-500 font-bold mt-1">Configure global resource quotas and member benefits.</p>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.status ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {formData.status ? 'Tier Publicly Active' : 'Tier Hidden / Draft'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.status}
                                onChange={() => setFormData(p => ({ ...p, status: !p.status }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600"></div>
                        </label>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 pb-24">
                    {/* SECTION 1: BASIC INFO */}
                    <div className="bg-white rounded-[32px] border-2 border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                        <CollapsibleHeader
                            icon={Wrench}
                            title="Basic Configuration"
                            subtitle="Core identity and billing"
                            section="basic"
                            active={activeSections.basic}
                            color="text-indigo-600"
                        />

                        {activeSections.basic && (
                            <div className="p-8 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Plan Designation *</label>
                                    <input
                                        type="text"
                                        name="planName"
                                        className={`w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-lg font-black text-slate-800 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors.planName ? 'border-red-500 bg-white' : ''}`}
                                        placeholder="e.g., Global Enterprise Plus"
                                        value={formData.planName}
                                        onChange={handleInputChange}
                                    />
                                    {errors.planName && <p className="text-xs text-red-500 font-black italic">{errors.planName}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Subscription Price (₹) *</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                            <input
                                                type="number"
                                                name="price"
                                                className={`w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-2xl font-black text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors.price ? 'border-red-500 bg-white' : ''}`}
                                                placeholder="9999"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Billing Interval</label>
                                        <select
                                            className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-black text-slate-600 uppercase tracking-widest focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            value={formData.billingCycle}
                                            onChange={(e) => setFormData(p => ({ ...p, billingCycle: e.target.value }))}
                                        >
                                            <option value="Monthly">Monthly Cycle</option>
                                            <option value="Quarterly">Quarterly Cycle</option>
                                            <option value="Yearly">Yearly Cycle</option>
                                            <option value="Lifetime">One-time / Lifetime</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Marketing Description *</label>
                                    <textarea
                                        name="description"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all min-h-[120px] resize-none"
                                        placeholder="Highlight why this plan is perfect for scaling gyms..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: RESOURCE LIMITS */}
                    <div className="bg-white rounded-[32px] border-2 border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                        <CollapsibleHeader
                            icon={Building2}
                            title="Organization Resource Quotas"
                            subtitle="Define infrastructure limits"
                            section="limits"
                            active={activeSections.limits}
                            color="text-emerald-600"
                        />

                        {activeSections.limits && (
                            <div className="p-8 pt-2 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                                <PlanLimitField
                                    label="Maximum Branches"
                                    value={formData.limits.branches.value}
                                    isUnlimited={formData.limits.branches.isUnlimited}
                                    onChange={(v) => handleLimitChange('limits', 'branches', 'value', v)}
                                    onToggleUnlimited={(v) => handleLimitChange('limits', 'branches', 'isUnlimited', v)}
                                    unit="Branches"
                                />
                                <PlanLimitField
                                    label="Administrative Managers"
                                    value={formData.limits.managers.value}
                                    isUnlimited={formData.limits.managers.isUnlimited}
                                    onChange={(v) => handleLimitChange('limits', 'managers', 'value', v)}
                                    onToggleUnlimited={(v) => handleLimitChange('limits', 'managers', 'isUnlimited', v)}
                                    unit="Total"
                                />
                                <PlanLimitField
                                    label="Staff / Employee Accounts"
                                    value={formData.limits.staff.value}
                                    isUnlimited={formData.limits.staff.isUnlimited}
                                    onChange={(v) => handleLimitChange('limits', 'staff', 'value', v)}
                                    onToggleUnlimited={(v) => handleLimitChange('limits', 'staff', 'isUnlimited', v)}
                                    unit="Accounts"
                                />
                                <PlanLimitField
                                    label="Professional Trainers"
                                    value={formData.limits.trainers.value}
                                    isUnlimited={formData.limits.trainers.isUnlimited}
                                    onChange={(v) => handleLimitChange('limits', 'trainers', 'value', v)}
                                    onToggleUnlimited={(v) => handleLimitChange('limits', 'trainers', 'isUnlimited', v)}
                                    unit="Trainers"
                                />
                                <div className="md:col-span-2">
                                    <PlanLimitField
                                        label="Active Member Quota (per Branch)"
                                        value={formData.limits.members.value}
                                        isUnlimited={formData.limits.members.isUnlimited}
                                        onChange={(v) => handleLimitChange('limits', 'members', 'value', v)}
                                        onToggleUnlimited={(v) => handleLimitChange('limits', 'members', 'isUnlimited', v)}
                                        unit="Active Members"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: OPERATIONAL LIMITS */}
                    <div className="bg-white rounded-[32px] border-2 border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                        <CollapsibleHeader
                            icon={Activity}
                            title="Operational Execution Limits"
                            subtitle="Software feature controls"
                            section="ops"
                            active={activeSections.ops}
                            color="text-amber-600"
                        />

                        {activeSections.ops && (
                            <div className="p-8 pt-2 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                                <PlanLimitField
                                    label="Active Workout Blueprints"
                                    value={formData.opsLimits.workouts.value}
                                    isUnlimited={formData.opsLimits.workouts.isUnlimited}
                                    onChange={(v) => handleLimitChange('opsLimits', 'workouts', 'value', v)}
                                    onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'workouts', 'isUnlimited', v)}
                                />
                                <PlanLimitField
                                    label="Active Diet Plan Database"
                                    value={formData.opsLimits.diets.value}
                                    isUnlimited={formData.opsLimits.diets.isUnlimited}
                                    onChange={(v) => handleLimitChange('opsLimits', 'diets', 'value', v)}
                                    onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'diets', 'isUnlimited', v)}
                                />
                                <PlanLimitField
                                    label="Class Types / Schedules"
                                    value={formData.opsLimits.classes.value}
                                    isUnlimited={formData.opsLimits.classes.isUnlimited}
                                    onChange={(v) => handleLimitChange('opsLimits', 'classes', 'value', v)}
                                    onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'classes', 'isUnlimited', v)}
                                />
                                <PlanLimitField
                                    label="Inquiry Leads / Month"
                                    value={formData.opsLimits.leads.value}
                                    isUnlimited={formData.opsLimits.leads.isUnlimited}
                                    onChange={(v) => handleLimitChange('opsLimits', 'leads', 'value', v)}
                                    onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'leads', 'isUnlimited', v)}
                                />
                            </div>
                        )}
                    </div>

                    {/* SECTION 4: MEMBER BENEFITS */}
                    <div className="bg-white rounded-[32px] border-2 border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                        <CollapsibleHeader
                            icon={Gift}
                            title="Tier-specific Member Benefits"
                            subtitle="Quota sync for end-users"
                            section="benefits"
                            active={activeSections.benefits}
                            color="text-rose-600"
                        />

                        {activeSections.benefits && (
                            <div className="p-8 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-rose-50/50 p-6 rounded-[24px] border border-rose-100 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                                            <Infinity size={28} />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-black text-rose-700 tracking-tight flex items-center gap-2">
                                                Benefit Quota Logic <span className="px-2 py-0.5 bg-rose-200 text-rose-700 rounded-md text-[8px] uppercase">Active</span>
                                            </h5>
                                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">Automated synchronization with member dashboard</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addBenefit}
                                        className="w-full sm:w-auto px-6 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-200 flex items-center justify-center gap-2 hover:bg-rose-700 hover:-translate-y-1 active:translate-y-0 transition-all"
                                    >
                                        <Plus size={18} /> Configure New Benefit
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formData.benefits.map((benefit, index) => (
                                        <div key={benefit.id} className="relative group animate-in zoom-in-95 duration-200">
                                            <button
                                                type="button"
                                                onClick={() => removeBenefit(benefit.id)}
                                                className="absolute -right-3 -top-3 w-10 h-10 bg-white shadow-xl border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:rotate-90 transition-all z-10"
                                            >
                                                <Trash2 size={20} />
                                            </button>

                                            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Benefit Designation</label>
                                                    <input
                                                        type="text"
                                                        value={benefit.name}
                                                        onChange={(e) => updateBenefit(benefit.id, 'name', e.target.value)}
                                                        placeholder="e.g., Ice Bath Sessions"
                                                        className="w-full px-5 py-3 bg-white rounded-2xl text-sm font-black border-2 border-transparent focus:border-rose-500 outline-none transition-all shadow-sm"
                                                    />
                                                </div>

                                                <PlanLimitField
                                                    label="Usage Allocation"
                                                    value={benefit.limit}
                                                    isUnlimited={benefit.isUnlimited}
                                                    onChange={(v) => updateBenefit(benefit.id, 'limit', v)}
                                                    onToggleUnlimited={(v) => updateBenefit(benefit.id, 'isUnlimited', v)}
                                                    unitValue={benefit.unit}
                                                    onUnitChange={(v) => updateBenefit(benefit.id, 'unit', v)}
                                                    options={[
                                                        { value: 'Per Month', label: 'Per Month' },
                                                        { value: 'Per Year', label: 'Per Year' },
                                                        { value: 'Lifetime', label: 'Lifetime Auth' }
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {formData.benefits.length === 0 && (
                                    <div className="text-center py-20 border-4 border-dashed border-slate-50 rounded-[40px] bg-slate-50/30">
                                        <Gift size={60} className="mx-auto text-slate-200 mb-4 stroke-1" />
                                        <h6 className="text-lg font-black text-slate-300 tracking-tight">No Tier Benefits defined.</h6>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Members will only have access to core gym features.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FORM ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/superadmin/plans/list')}
                            className="flex-1 py-5 bg-white border-2 border-slate-200 text-slate-600 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all border-b-4 active:translate-y-1 active:border-b-0"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 hover:shadow-indigo-400 hover:-translate-y-1 active:translate-y-0 transition-all"
                        >
                            <Save size={24} />
                            {isSubmitting ? 'Syncing with SaaS Engine...' : (editId ? 'Commit & Synchronize Plan' : 'Establish Global SaaS Tier')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePlan;
