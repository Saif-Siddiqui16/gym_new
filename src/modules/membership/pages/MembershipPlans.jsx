import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle2, Crown, Sparkles, LayoutGrid, List as ListIcon, Users } from 'lucide-react';
import CreateMembershipPlanDrawer from '../components/CreateMembershipPlanDrawer';
import { membershipApi } from '../../../api/membershipApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import amenityApi from '../../../api/amenityApi';

const MembershipPlans = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });
    const [amenities, setAmenities] = useState([]);

    const { selectedBranch } = useBranchContext();

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (selectedBranch && selectedBranch !== 'all') {
                params.branchId = selectedBranch;
            }
            const [plansData, amenitiesData] = await Promise.all([
                membershipApi.getPlans(params),
                amenityApi.getAll()
            ]);
            setPlans(plansData);
            setAmenities(amenitiesData);
        } catch (error) {
            toast.error('Failed to fetch plans data');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchPlans();
    }, [selectedBranch]);

    const handleSavePlan = async (planData) => {
        try {
            const payload = { ...planData };

            // Pass branchId to backend for multi-branch or single-branch creation
            if (!selectedBranch || selectedBranch === 'all') {
                payload.branchId = 'all';
            } else {
                payload.branchId = selectedBranch;
            }

            if (editingPlan) {
                await membershipApi.updatePlan(editingPlan.id, payload);
                toast.success('Plan updated successfully');
            } else {
                await membershipApi.createPlan(payload);
                if (!selectedBranch || selectedBranch === 'all') {
                    toast.success('Plan created for all branches!');
                } else {
                    toast.success('Plan created successfully');
                }
            }
            fetchPlans();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setIsCreateDrawerOpen(true);
    };

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await membershipApi.deletePlan(confirmModal.id);
            toast.success('Plan deleted successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchPlans();
        } catch (error) {
            toast.error('Failed to delete plan');
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const openCreate = () => {
        setEditingPlan(null);
        setIsCreateDrawerOpen(true);
    };

    const filteredPlans = plans.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen ">
            {/* 📌 STEP 1: PAGE HEADER */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">Membership Plans</h1>
                        <p className="text-slate-600 text-sm font-medium mt-1">Design, manage, and optimize your membership tiers</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="px-6 h-11 bg-gradient-to-r from-primary to-primary text-white rounded-xl text-sm font-bold shadow-md hover:shadow-primary/30/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Create Plan
                    </button>
                </div>
            </div>

            {/* 📊 STEP 2: TOP KPI SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Active Plans */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between group transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="flex items-start justify-between w-full">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Active Plans</p>
                            <h3 className="text-3xl font-black text-slate-900">{plans.length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-md">
                            <Crown size={20} />
                        </div>
                    </div>
                </div>

                {/* Active Members */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between group transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="flex items-start justify-between w-full">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Active Members</p>
                            <h3 className="text-3xl font-black text-slate-900">{plans.reduce((acc, p) => acc + (p.memberCount || 0), 0)}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                            <Users size={20} />
                        </div>
                    </div>
                </div>

                {/* Avg Plan Price */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between group transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5">
                    <div className="flex items-start justify-between w-full">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Avg Plan Price</p>
                            <h3 className="text-3xl font-black text-slate-900">
                                ₹{plans.length > 0 ? Math.round(plans.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0) / plans.length).toLocaleString() : 0}
                            </h3>
                            <div className="mt-2 space-y-0.5">
                                {plans.length > 0 && (
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                        {plans.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))[0]?.name || '—'}
                                    </p>
                                )}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plans.reduce((acc, p) => acc + (p.memberCount || 0), 0)} total members</p>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-md">
                            <Sparkles size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 📋 STEP 3: PLANS LIST */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {filteredPlans.map(plan => (
                    <div key={plan.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col overflow-hidden">

                        {/* Card Top */}
                        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 pr-2">
                                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">{plan.name}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{plan.description || 'No description'}</p>
                                </div>
                                <button onClick={() => handleDelete(plan.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                            {plan.branch && plan.branch !== '—' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/8 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                                    📍 {plan.branch}
                                </span>
                            )}
                            {/* Price */}
                            <div className="flex items-end gap-2 mt-3">
                                <span className="text-3xl font-black text-slate-900">₹{plan.price.toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{plan.duration} {plan.durationType}</span>
                                {plan.status === 'Inactive' && (
                                    <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-full">Inactive</span>
                                )}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-5 pt-4 pb-5 flex flex-col flex-1">

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-4 min-h-[22px]">
                                {plan.allowTransfer && (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-100">Transferable</span>
                                )}
                                {plan.includeLocker && (
                                    <span className="px-2 py-0.5 bg-cyan-50 text-cyan-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-cyan-100">Locker Included</span>
                                )}
                                {!plan.showInPurchase && (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-wider rounded-md">Hidden App</span>
                                )}
                                {!plan.showOnDashboard && (
                                    <span className="px-2 py-0.5 bg-orange-50 text-orange-400 text-[9px] font-black uppercase tracking-wider rounded-md border border-orange-100">Hidden Dashboard</span>
                                )}
                            </div>

                            {/* Benefits */}
                            {plan.benefits && plan.benefits.length > 0 && (
                                <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Included Benefits</p>
                                    <ul className="space-y-1.5">
                                        {plan.benefits.map((benefit, idx) => {
                                            const flexAmenity = amenities.find(a => a.id === benefit.id);
                                            return (
                                                <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                                                    <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 size={10} className="text-primary" />
                                                    </span>
                                                    {flexAmenity ? flexAmenity.name : 'Benefit'}
                                                    {benefit.limit && benefit.limit !== 'Unlimited' && (
                                                        <span className="ml-auto text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{benefit.limit}x</span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2 mb-5 mt-auto">
                                <div className="flex flex-col items-center py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Usage</p>
                                    <p className="text-xs font-black text-slate-800">Unlimited</p>
                                </div>
                                <div className="flex flex-col items-center py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Members</p>
                                    <p className="text-xs font-black text-slate-800">{plan.memberCount || 0}</p>
                                </div>
                                <div className="flex flex-col items-center py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Freeze</p>
                                    <p className="text-xs font-black text-slate-800">{plan.cancellationWindow ? `${plan.cancellationWindow}d` : 'None'}</p>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <button
                                onClick={() => handleEdit(plan)}
                                className="w-full h-10 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary-hover transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Edit2 size={13} />
                                Edit Plan
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <CreateMembershipPlanDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
                onSave={handleSavePlan}
                initialData={editingPlan}
            />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Delete Plan?"
                message="This membership plan will be permanently removed."
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default MembershipPlans;
