import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle2, Crown, Sparkles, LayoutGrid, List as ListIcon, Users } from 'lucide-react';
import { MEMBERSHIP_PLANS } from '../data/mockMemberships';
import CreateMembershipPlanDrawer from '../components/CreateMembershipPlanDrawer';
import { membershipApi } from '../../../api/membershipApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';

const MembershipPlans = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const { selectedBranch } = useBranchContext();

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (selectedBranch && selectedBranch !== 'all') {
                params.branchId = selectedBranch;
            }
            const data = await membershipApi.getPlans(params);
            setPlans(data);
        } catch (error) {
            toast.error('Failed to fetch plans');
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await membershipApi.deletePlan(id);
                toast.success('Plan deleted successfully');
                fetchPlans();
            } catch (error) {
                toast.error('Failed to delete plan');
            }
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            {/* 📌 STEP 1: PAGE HEADER */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Membership Plans</h1>
                        <p className="text-slate-600 text-sm font-medium mt-1">Design, manage, and optimize your membership tiers</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="px-6 h-11 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-violet-500/30/30 transition-all active:scale-95 flex items-center justify-center gap-2"
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
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
                                    <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">
                                        {plans.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))[0]?.name || '—'}
                                    </p>
                                )}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plans.reduce((acc, p) => acc + (p.memberCount || 0), 0)} total members</p>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                            <Sparkles size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 📋 STEP 3: PLANS LIST */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {filteredPlans.map(plan => (
                    <div key={plan.id} className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-100 transition-all duration-200 md:hover:shadow-xl md:hover:-translate-y-0.5 flex flex-col relative overflow-hidden">
                        {/* Status Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/5 to-transparent rounded-bl-full pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 pr-2">
                                <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{plan.name}</h3>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[40px] font-medium">{plan.description || 'No description provided'}</p>
                                {plan.branch && plan.branch !== '—' && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-violet-100">
                                        📍 {plan.branch}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleDelete(plan.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Price & Duration */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-6 relative z-10 border border-slate-100">
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-slate-900">₹{plan.price.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{plan.duration} {plan.durationType}</span>
                            </div>
                        </div>

                        {/* All properties (No Property Skipping) */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col items-center justify-center min-h-[70px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Usage</p>
                                <p className="text-sm font-black text-slate-800">0</p>
                            </div>
                            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col items-center justify-center min-h-[70px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Enrollment</p>
                                <p className="text-sm font-black text-slate-800">{plan.memberCount || 0} members</p>
                            </div>
                            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col items-center justify-center min-h-[70px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Freezing</p>
                                <p className="text-sm font-black text-slate-800">{plan.freezeDays ? `${plan.freezeDays}d freeze` : '0'}</p>
                            </div>
                        </div>

                        {/* Edit Action */}
                        <div className="mt-auto">
                            <button
                                onClick={() => handleEdit(plan)}
                                className="w-full h-12 bg-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-violet-700 transition-all active:scale-95 shadow-md shadow-violet-200 flex items-center justify-center gap-2"
                            >
                                <Edit2 size={14} />
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
        </div>
    );
};

export default MembershipPlans;
