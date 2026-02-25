import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Utensils,
    ChevronRight,
    Plus,
    Search,
    Calendar,
    Clock,
    Flame,
    Zap,
    Droplets,
    User,
    Filter,
    MoreHorizontal,
    Edit2,
    Trash2,
    Activity,
    Eye,
    Power,
    CheckCircle2
} from 'lucide-react';
import { DIET_PLANS, MEMBER_DIET_STATUS, ASSIGNED_CLIENTS } from '../data/mockDietData';
import CreatePlanDrawer from '../components/CreatePlanDrawer';
import AssignPlanDrawer from '../components/AssignPlanDrawer';
import '../../../styles/GlobalDesign.css';
import { getDietPlans, createDietPlan, updateDietPlan, toggleDietPlanStatus } from '../../../api/trainer/trainerApi';
import { fetchMemberDietPlans } from '../../../api/member/memberApi';
import { toast } from 'react-hot-toast';

const DietPlans = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isTrainer = role === 'TRAINER' || role === 'SUPER_ADMIN' || role === 'MANAGER' || role === 'BRANCH_ADMIN';

    // State management
    const [plans, setPlans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activePlan, setActivePlan] = useState(null);
    const [activeMealTab, setActiveMealTab] = useState(0);
    const [loading, setLoading] = useState(true);

    // Modals & Actions
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [planToEdit, setPlanToEdit] = useState(null);

    // Fetch plans
    React.useEffect(() => {
        loadPlans();
    }, [isTrainer]);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = isTrainer ? await getDietPlans() : await fetchMemberDietPlans();
            setPlans(data);
            if (data.length > 0) {
                setActivePlan(data[0]);
            }
        } catch (error) {
            console.error('Failed to load plans:', error);
            toast.error('Failed to load diet plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async (planData) => {
        try {
            if (planToEdit && planToEdit.id) {
                await updateDietPlan(planToEdit.id, planData);
                toast.success('Plan updated successfully');
            } else {
                await createDietPlan(planData);
                toast.success('Plan created successfully');
            }
            await loadPlans();
            setIsCreateModalOpen(false);
            setPlanToEdit(null);
        } catch (error) {
            console.error('Error saving plan', error);
            toast.error('Failed to save plan');
        }
    };

    const handleToggleStatus = async (planId, e) => {
        e.stopPropagation();
        try {
            await toggleDietPlanStatus(planId);
            toast.success('Status toggled successfully');
            await loadPlans();
        } catch (error) {
            console.error('Error toggling status', error);
            toast.error('Failed to change status');
        }
    };

    const getClientName = (id) => {
        const planObj = plans.find(p => p.clientId === id);
        return planObj?.client?.name || 'Unassigned';
    };

    const filteredPlans = plans.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(p.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const TrainerTableView = () => (
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden fade-in">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Plan Name</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Client</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Goal</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Calories</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredPlans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Utensils size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 line-clamp-1">{plan.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-gray-600">{getClientName(plan.clientId)}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${plan.target === 'Weight Loss' ? 'bg-rose-50 text-rose-600' :
                                        plan.target === 'Muscle Gain' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                        {plan.target}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-black text-gray-900">{plan.calories} <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">kcal</span></span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${plan.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <div className={`w-1 h-1 rounded-full ${plan.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                        {plan.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => { setActivePlan(plan); setIsCreateModalOpen(false); }}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setPlanToEdit(plan); setIsCreateModalOpen(true); }}
                                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                            title="Edit Plan"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleToggleStatus(plan.id, e)}
                                            className={`p-2 rounded-lg transition-all ${plan.status === 'Active' ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'
                                                }`}
                                            title={plan.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        >
                                            <Power size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredPlans.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <Search size={48} strokeWidth={1} className="mb-4 opacity-20" />
                        <p className="text-sm font-bold">No diet plans found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const TrainerCardView = () => (
        <div className="md:hidden space-y-4 fade-in">
            {filteredPlans.map((plan) => (
                <div key={plan.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Utensils size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900 leading-tight">{plan.name}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{getClientName(plan.clientId)}</p>
                            </div>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${plan.target === 'Weight Loss' ? 'bg-rose-50 text-rose-600' :
                            plan.target === 'Muscle Gain' ? 'bg-emerald-50 text-emerald-600' :
                                'bg-blue-50 text-blue-600'
                            }`}>
                            {plan.target}
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-y border-gray-50">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Daily Calories</p>
                            <p className="text-sm font-black text-gray-900">{plan.calories} <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">kcal</span></p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${plan.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                            <div className={`w-1 h-1 rounded-full ${plan.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {plan.status}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setActivePlan(plan); setIsCreateModalOpen(false); }}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                            >
                                View
                            </button>
                            <button
                                onClick={() => { setPlanToEdit(plan); setIsCreateModalOpen(true); }}
                                className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
                            >
                                Edit
                            </button>
                        </div>
                        <button
                            onClick={(e) => handleToggleStatus(plan.id, e)}
                            className={`p-2.5 rounded-xl border transition-all ${plan.status === 'Active' ? 'text-rose-500 bg-rose-50 border-rose-100' : 'text-emerald-500 bg-emerald-50 border-emerald-100'}`}
                        >
                            <Power size={18} />
                        </button>
                    </div>
                </div>
            ))}
            {filteredPlans.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                    <Search size={48} strokeWidth={1} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold text-center">No diet plans found matching your search.</p>
                </div>
            )}
        </div>
    );

    const MemberDetailView = () => {
        if (!activePlan) return null;
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 fade-in">
                {/* Protocol Info (Sidebar) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{activePlan.target}</div>
                                    <h2 className="text-lg font-black text-gray-900 leading-tight">{activePlan.name}</h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-transparent">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Calories / Day</div>
                                    <div className="text-2xl font-black text-indigo-600">{activePlan.calories} <span className="text-xs text-gray-400 uppercase tracking-widest">kcal</span></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {['protein', 'carbs', 'fats'].map((m) => (
                                        <div key={m} className="p-3 bg-white border border-gray-100 rounded-xl text-center">
                                            <div className="text-[9px] font-black uppercase tracking-tighter text-gray-400 capitalize">{m.slice(0, 1)}</div>
                                            <div className="text-sm font-bold text-gray-900">{activePlan.macros[m]}g</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                                        <span className="text-gray-400">Consistency Focus</span>
                                        <span className="text-indigo-600">
                                            {activePlan ? Math.min(100, Math.ceil(((new Date() - new Date(activePlan.createdAt)) / (1000 * 60 * 60 * 24 * 7 * 4)) * 100)) : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${activePlan ? Math.min(100, Math.ceil(((new Date() - new Date(activePlan.createdAt)) / (1000 * 60 * 60 * 24 * 7 * 4)) * 100)) : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-8 mt-8 border-t border-gray-50 space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-2xl">
                                <p className="text-[11px] font-bold text-indigo-900 leading-relaxed italic">
                                    "{activePlan.notes || 'No specific instructions provided.'}"
                                </p>
                            </div>
                            {!isTrainer && (
                                <button className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-100">
                                    MARK COMPLETE <CheckCircle2 size={16} />
                                </button>
                            )}
                            {isTrainer && (
                                <button
                                    onClick={() => setActivePlan(null)}
                                    className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all"
                                >
                                    BACK TO LIST
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meals Breakdown */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Utensils size={18} className="text-indigo-500" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Meal Sequence</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(activePlan.meals) ? activePlan.meals.map((meal, index) => (
                            <div key={meal.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-all group overflow-hidden relative">
                                <div className="relative z-10 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            <Clock size={12} strokeWidth={3} /> {meal.time}
                                        </div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{meal.cals} KCAL</div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{meal.name}</h4>
                                        <p className="text-[11px] text-gray-500 font-bold leading-relaxed">{meal.notes}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                                            <div className="text-[8px] font-black text-gray-400 uppercase">P</div>
                                            <div className="text-xs font-black text-gray-700">{meal.protein}g</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                                            <div className="text-[8px] font-black text-gray-400 uppercase">C</div>
                                            <div className="text-xs font-black text-gray-700">{meal.carbs}g</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                                            <div className="text-[8px] font-black text-gray-400 uppercase">F</div>
                                            <div className="text-xs font-black text-gray-700">{meal.fats}g</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="text-4xl font-black italic">{index + 1}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                                <Utensils size={40} className="mb-4 opacity-20" />
                                <p className="text-sm font-bold">No meal sequence defined for this plan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-[#FBFBFE] min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-1">
                            {isTrainer ? 'Diet Plans' : 'My Protocol'}
                        </h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                            {isTrainer
                                ? 'Precise nutritional scheduling & macro management'
                                : `Active Protocol: ${activePlan?.name || 'No Active Plan'}`}
                        </p>
                    </div>
                    {isTrainer && (
                        <div className="flex items-center gap-3">
                            <div className="relative group flex-1 md:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search plans or clients..."
                                    className="w-full md:w-64 h-11 pl-10 pr-4 bg-white rounded-xl font-bold border border-gray-100 focus:border-indigo-500 outline-none transition-all text-xs"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => { setPlanToEdit(null); setIsCreateModalOpen(true); }}
                                className="h-11 px-6 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-3"
                            >
                                <Plus size={16} strokeWidth={3} />
                                Create Plan
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                {isTrainer && !activePlan && (
                    <>
                        <TrainerTableView />
                        <TrainerCardView />
                    </>
                )}
                {(activePlan || !isTrainer) && <MemberDetailView />}

            </div>

            {/* Structured Creator Drawer */}
            <CreatePlanDrawer
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setPlanToEdit(null);
                }}
                onSave={handleSavePlan}
                editData={planToEdit}
            />

            {/* Assignment Drawer (Maintained) */}
            <AssignPlanDrawer
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onAssign={(ids) => console.log('Assigned to:', ids)}
                planName={plans.find(p => p.id === selectedPlanId)?.name}
            />
        </div>
    );
};

export default DietPlans;
