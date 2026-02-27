import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Dumbbell,
    User,
    Users,
    Utensils,
    Lock,
    Thermometer,
    Zap,
    Droplets,
    Activity,
    Clock,
    Calendar,
    Infinity,
    Sparkles,
    Info,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import amenityApi from '../../../api/amenityApi';
import { fetchMySubscription } from '../../../api/superadmin/superAdminApi';
import toast from 'react-hot-toast';

const ICONS = {
    Dumbbell, User, Users, Utensils, Lock, Thermometer, Zap, Droplets, Activity, Clock, Calendar
};

const BenefitsConfig = () => {
    const [benefits, setBenefits] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBenefit, setEditingBenefit] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [subData, setSubData] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        status: 'Active',
        gender: 'UNISEX',
        icon: 'Dumbbell',
        description: ''
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [amenitiesData, subscription] = await Promise.all([
                amenityApi.getAll(),
                fetchMySubscription().catch(() => null)
            ]);
            setBenefits(amenitiesData);
            setSubData(subscription);
        } catch (error) {
            toast.error('Failed to load configuration');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (benefit) => {
        setEditingBenefit(benefit);
        setFormData({
            name: benefit.name,
            status: benefit.status,
            gender: benefit.gender,
            icon: benefit.icon || 'Dumbbell',
            description: benefit.description || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this benefit? This might affect existing membership plans.')) {
            try {
                await amenityApi.delete(id);
                toast.success('Benefit removed');
                fetchData();
            } catch (error) {
                toast.error(error);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingBenefit) {
                await amenityApi.update(editingBenefit.id, formData);
                toast.success('Benefit updated');
            } else {
                await amenityApi.create(formData);
                toast.success('Benefit established');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error);
        }
    };

    const openCreateModal = () => {
        setEditingBenefit(null);
        setFormData({ name: '', status: 'Active', gender: 'UNISEX', icon: 'Dumbbell', description: '' });
        setIsModalOpen(true);
    };

    const planLimits = subData?.plan?.limits?.amenities || { value: 'Unlimited', isUnlimited: true };
    const quotaUsed = benefits.length;
    const quotaTotal = planLimits.isUnlimited ? '∞' : planLimits.value;
    const isAtLimit = !planLimits.isUnlimited && quotaUsed >= parseInt(planLimits.value);

    // Filter allowed templates from SaaS Plan
    const allowedTemplates = subData?.plan?.benefits || [];

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <RefreshCw className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Benefits Configuration</h2>
                    <p className="text-gray-500 font-bold mt-1">Define standard benefits for membership tiers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end mr-6">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                            <Infinity size={12} /> SaaS Sync Active
                        </span>
                        <span className="text-[10px] font-black text-slate-900 uppercase">
                            Quota: <span className={isAtLimit ? 'text-red-500' : 'text-indigo-600'}>{quotaUsed} / {quotaTotal}</span>
                        </span>
                    </div>
                    <Button
                        variant="primary"
                        onClick={openCreateModal}
                        disabled={isAtLimit && !editingBenefit}
                        className="px-6 py-3 rounded-xl shadow-lg shadow-indigo-200"
                    >
                        <Plus size={20} className="mr-2" />
                        Create New Benefit
                    </Button>
                </div>
            </div>

            {isAtLimit && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-700">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">You have reached your SaaS plan limit for benefits. Upgrade your subscription to add more.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map(benefit => {
                    const IconComp = ICONS[benefit.icon] || Dumbbell;
                    return (
                        <div key={benefit.id} className="bg-white p-6 rounded-[24px] shadow-xl shadow-gray-100/50 border border-gray-50 hover:border-indigo-100 transition-all group relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <IconComp size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button onClick={() => handleEdit(benefit)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-indigo-600">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(benefit.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-1">{benefit.name}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{benefit.gender}</span>
                                    </div>
                                    {benefit.status === 'Active' ? (
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">Live</span>
                                    ) : (
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">Paused</span>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm font-medium mb-4 min-h-[40px] italic line-clamp-2">"{benefit.description || 'No description provided.'}"</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Established {new Date(benefit.createdAt).toLocaleDateString()}</span>
                                    <div className="p-1 px-2 bg-slate-900 rounded-lg text-[8px] font-black text-white uppercase tracking-tighter">
                                        Active Profile
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50/50 transition-colors pointer-events-none"></div>
                        </div>
                    );
                })}
                {benefits.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">No Benefits Established</h3>
                        <p className="text-gray-500 font-bold mt-2">Start by creating your first member perk or amenity.</p>
                        <Button variant="primary" onClick={openCreateModal} className="mt-6">Establish First Benefit</Button>
                    </div>
                )}
            </div>

            {/* Config Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 overflow-hidden relative">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">
                                        {editingBenefit ? 'Refine Benefit' : 'Establish Benefit'}
                                    </h3>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 mt-1">
                                        <Sparkles size={12} /> Managed by SaaS Subscription
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            {!editingBenefit && allowedTemplates.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Included in your Plan</label>
                                    <div className="flex flex-wrap gap-2">
                                        {allowedTemplates.map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, name: t.name, description: t.description || '' })}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 transition-all ${formData.name === t.name
                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                        : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200'
                                                    }`}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Benefit Designation</label>
                                <Input
                                    className="w-full h-14 bg-gray-50 border-transparent focus:bg-white transition-all font-black text-lg placeholder:text-gray-300"
                                    placeholder="e.g. Steam Room Access"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Gender Restriction</label>
                                    <select
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border-transparent focus:bg-white ring-2 ring-transparent focus:ring-indigo-100 outline-none font-bold text-sm appearance-none"
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="UNISEX">Unisex / All</option>
                                        <option value="MALE">Male Only</option>
                                        <option value="FEMALE">Female Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Status</label>
                                    <select
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border-transparent focus:bg-white ring-2 ring-transparent focus:ring-indigo-100 outline-none font-bold text-sm appearance-none"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active / Live</option>
                                        <option value="Inactive">Paused / Hidden</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Visual Identity (Icon)</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {Object.keys(ICONS).map(iconName => {
                                        const Icon = ICONS[iconName];
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: iconName })}
                                                className={`p-3 rounded-xl flex items-center justify-center transition-all ${formData.icon === iconName
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110'
                                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <Icon size={18} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Detailed Description</label>
                                <textarea
                                    className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white ring-2 ring-transparent focus:ring-indigo-100 outline-none font-medium text-sm transition-all resize-none h-24"
                                    placeholder="Brief description of the benefit..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs">Discard</Button>
                                <Button type="submit" variant="primary" className="flex-1 py-4 rounded-xl shadow-lg shadow-indigo-200 font-black uppercase tracking-widest text-xs">Commit Benefit</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BenefitsConfig;
