import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle2, Crown, Sparkles, LayoutGrid, List as ListIcon } from 'lucide-react';
import { MEMBERSHIP_PLANS } from '../data/mockMemberships';
import CreateMembershipPlanDrawer from '../components/CreateMembershipPlanDrawer';
import { membershipApi } from '../../../api/membershipApi';
import toast from 'react-hot-toast';

const MembershipPlans = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const data = await membershipApi.getPlans();
            setPlans(data);
        } catch (error) {
            toast.error('Failed to fetch plans');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchPlans();
    }, []);

    const handleSavePlan = async (planData) => {
        try {
            if (editingPlan) {
                await membershipApi.updatePlan(editingPlan.id, planData);
                toast.success('Plan updated successfully');
            } else {
                await membershipApi.createPlan(planData);
                toast.success('Plan created successfully');
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
        <div className="p-6 pb-20 animate-in fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Crown className="text-yellow-500 fill-yellow-500" />
                        Membership Plans
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Configure plan tiers, pricing, and benefits.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} strokeWidth={3} />
                    Create New Plan
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search plans..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <ListIcon size={20} />
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {filteredPlans.map(plan => (
                    <div key={plan.id} className="group relative bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100 min-h-[500px] flex flex-col hover:border-indigo-100 transition-all hover:-translate-y-1">

                        {/* Actions */}
                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(plan)} className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-indigo-600 tracking-tight">₹{plan.price}</span>
                                <span className="text-sm font-bold text-gray-400">/ {plan.duration} {plan.durationType}</span>
                            </div>
                            <p className="text-gray-500 font-medium mt-3 text-sm leading-relaxed">{plan.description}</p>
                        </div>

                        {/* Booking Rules */}
                        <div className="space-y-3 pt-6 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={12} className="text-yellow-500" />
                                Booking Rules
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold border border-violet-100 italic">
                                    {plan.creditsPerBooking} Credit / Booking
                                </span>
                                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                                    Max {plan.maxBookingsPerDay}/day • {plan.maxBookingsPerWeek}/week
                                </span>
                                <span className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-100">
                                    {plan.cancellationWindow}h Cancellation
                                </span>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-3 pt-6 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={12} className="text-yellow-500" />
                                {plan.benefits?.length} Included Benefits
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {plan.benefits?.slice(0, 3).map((b, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                        {b.limit === 'Unlimited' ? '∞' : b.limit} {(b.id || 'benefit').replace(/_/g, ' ')}
                                    </span>
                                ))}
                                {plan.benefits?.length > 3 && (
                                    <span key={3} className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold border border-gray-100">
                                        +{plan.benefits.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto pt-8">
                            <button onClick={() => handleEdit(plan)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95">
                                Edit Plan Details
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
