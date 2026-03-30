import React, { useState } from 'react';
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
    Info
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { membershipApi } from '../../../api/membershipApi';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const ICONS = {
    Dumbbell, User, Users, Utensils, Lock, Thermometer, Zap, Droplets, Activity, Clock, Calendar
};

const BenefitsConfig = () => {
    const [benefits, setBenefits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBenefit, setEditingBenefit] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'recurring', // recurring | global
        limit: '',
        icon: 'Dumbbell',
        description: ''
    });

    const fetchBenefits = async () => {
        try {
            setIsLoading(true);
            const data = await membershipApi.getAmenities();
            setBenefits(data || []);
        } catch (error) {
            toast.error("Failed to fetch benefits");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBenefits();
    }, []);

    const handleEdit = (benefit) => {
        setEditingBenefit(benefit);
        setFormData({
            name: benefit.name,
            type: benefit.type || 'recurring',
            limit: benefit.limit || '',
            icon: benefit.icon || 'Dumbbell',
            description: benefit.description || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await membershipApi.deleteAmenity(confirmModal.id);
            toast.success("Benefit deleted");
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchBenefits();
        } catch (error) {
            toast.error("Failed to delete benefit");
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingBenefit) {
                await membershipApi.updateAmenity(editingBenefit.id, formData);
                toast.success('Benefit updated successfully');
            } else {
                await membershipApi.createAmenity(formData);
                toast.success('Benefit created successfully');
            }
            setIsModalOpen(false);
            setEditingBenefit(null);
            setFormData({ name: '', type: 'recurring', limit: '', icon: 'Dumbbell', description: '' });
            fetchBenefits();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };


    const openCreateModal = () => {
        setEditingBenefit(null);
        setFormData({ name: '', type: 'recurring', limit: '', icon: 'Dumbbell', description: '' });
        setIsModalOpen(true);
    };

    return (
        <>
        <div className="space-y-6 fade-in p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Benefits Configuration</h2>
                    <p className="text-gray-500 font-bold mt-1">Define standard benefits for membership tiers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end mr-6">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                            <Infinity size={12} /> SaaS Sync Active
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Controlled by Plan Limits</span>
                    </div>
                    <Button variant="primary" onClick={openCreateModal} className="px-6 py-3 rounded-xl shadow-lg shadow-violet-200">
                        <Plus size={20} className="mr-2" />
                        Create New Benefit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map(benefit => {
                    const IconComp = ICONS[benefit.icon] || Dumbbell;
                    return (
                        <div key={benefit.id} className="bg-white p-6 rounded-[24px] shadow-xl shadow-gray-100/50 border border-gray-50 hover:border-violet-100 transition-all group relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-primary-light text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <IconComp size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex gap-2 transition-opacity">
                                            <button onClick={() => handleEdit(benefit)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(benefit.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-1">{benefit.name}</h3>
                                <div className="flex items-center gap-1.5 mb-3">
                                    <div className="w-1 h-3 bg-primary rounded-full"></div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">SaaS Sync Logic</span>
                                </div>
                                <p className="text-gray-500 text-sm font-medium mb-4 min-h-[40px] italic line-clamp-2">"{benefit.description}"</p>

                                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                    <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${benefit.type === 'recurring' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                        {benefit.type === 'recurring' ? 'Monthly' : 'Global'}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        Default Limit: <span className="text-gray-900 ml-1 font-black">{benefit.limit}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-primary-light/50 transition-colors pointer-events-none"></div>
                        </div>
                    );
                })}
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
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 mt-1">
                                        <Sparkles size={12} /> Managed by SaaS Subscription
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="p-4 bg-primary-light rounded-2xl border border-violet-100 mb-2">
                                <h4 className="text-[10px] font-black text-primary-hover uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Info size={14} /> Usage Logic Reminder
                                </h4>
                                <p className="text-[11px] font-bold text-primary/70 leading-relaxed">
                                    Individual member usage for this benefit will be capped based on their plan's quota set in Plan Management.
                                </p>
                            </div>

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
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Sync Strategy</label>
                                    <select
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border-transparent focus:bg-white ring-2 ring-transparent focus:ring-violet-100 outline-none font-bold text-sm appearance-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="recurring">Monthly Reset</option>
                                        <option value="global">Lifetime Quota</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Base Usage Cap</label>
                                    <Input
                                        className="w-full h-12 bg-gray-50 border-transparent focus:bg-white transition-all font-bold"
                                        placeholder="e.g. 10 or Unlimited"
                                        value={formData.limit}
                                        onChange={e => setFormData({ ...formData, limit: e.target.value })}
                                        required
                                    />
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
                                                    ? 'bg-primary text-white shadow-lg shadow-violet-200 scale-110'
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
                                    className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white ring-2 ring-transparent focus:ring-violet-100 outline-none font-medium text-sm transition-all resize-none h-24"
                                    placeholder="Brief description of the benefit..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs">Discard</Button>
                                <Button type="submit" variant="primary" className="flex-1 py-4 rounded-xl shadow-lg shadow-violet-200 font-black uppercase tracking-widest text-xs">Commit Benefit</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
            onConfirm={processDelete}
            title="Delete Benefit?"
            message="This benefit configuration will be permanently removed."
            confirmText="Delete"
            type="danger"
            loading={confirmModal.loading}
        />
    </>
    );
};

export default BenefitsConfig;
