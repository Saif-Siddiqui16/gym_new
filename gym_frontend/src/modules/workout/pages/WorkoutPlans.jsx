import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Dumbbell,
    ChevronRight,
    Plus,
    Search,
    Calendar,
    Clock,
    Target,
    Zap,
    TrendingUp,
    Timer,
    Flame,
    Music,
    MoreHorizontal,
    Edit2,
    Trash2,
    ArrowUpRight,
    Activity,
    Info,
    ChevronLeft,
    User,
    Play
} from 'lucide-react';
import { WORKOUT_PLANS, MEMBER_WORKOUT_STATUS } from '../data/mockWorkoutData';
import CreateWorkoutDrawer from '../components/CreateWorkoutDrawer';
import AssignWorkoutDrawer from '../components/AssignWorkoutDrawer';
import '../../../styles/GlobalDesign.css';
import { getWorkoutPlans, createWorkoutPlan, updateWorkoutPlan, toggleWorkoutPlanStatus } from '../../../api/trainer/trainerApi';
import { fetchMemberWorkoutPlans } from '../../../api/member/memberApi';
import { toast } from 'react-hot-toast';

const WorkoutPlans = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Role check
    const isTrainer = role === 'TRAINER' || role === 'SUPER_ADMIN' || role === 'MANAGER' || role === 'BRANCH_ADMIN';

    // State management
    const [plans, setPlans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activePlan, setActivePlan] = useState(null);
    const [activeDay, setActiveDay] = useState('monday');
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    // Fetch plans
    React.useEffect(() => {
        loadPlans();
    }, [isTrainer]);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = isTrainer ? await getWorkoutPlans() : await fetchMemberWorkoutPlans();
            setPlans(data);
            if (data.length > 0) {
                setActivePlan(data[0]);
            }
        } catch (error) {
            console.error('Failed to load plans:', error);
            toast.error('Failed to load workout plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async (planData) => {
        try {
            if (editingPlan && editingPlan.id) {
                await updateWorkoutPlan(editingPlan.id, planData);
                toast.success('Protocol updated successfully');
            } else {
                await createWorkoutPlan(planData);
                toast.success('Protocol created successfully');
            }
            await loadPlans();
            setIsCreateModalOpen(false);
            setEditingPlan(null);
        } catch (error) {
            console.error('Error saving plan', error);
            toast.error('Failed to save protocol');
        }
    };

    const handleDeletePlan = async (planId) => {
        if (window.confirm('Are you sure you want to deactivate this workout protocol?')) {
            try {
                await toggleWorkoutPlanStatus(planId);
                toast.success('Protocol deactivated successfully');
                await loadPlans();
            } catch (error) {
                console.error('Error deleting plan', error);
                toast.error('Failed to deactivate protocol');
            }
        }
    };

    const openAssignModal = (planId) => {
        setSelectedPlanId(planId);
        setAssignModalOpen(true);
    };

    const handleAssignPlan = (selectedMembers) => {
        console.log(`Assigned Plan ${selectedPlanId} to members:`, selectedMembers);
        setAssignModalOpen(false);
    };

    const openEditModal = (plan) => {
        setEditingPlan(plan);
        setIsCreateModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingPlan(null);
        setIsCreateModalOpen(true);
    };

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="p-6 md:p-8 min-h-screen font-sans bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight mb-2">
                            {isTrainer ? 'Training Architecture' : 'Force & Hypertrophy'}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">
                            {isTrainer
                                ? 'Design and manage evidence-based training protocols.'
                                : `Executing the ${activePlan?.name} protocol. Focus on form and tempo.`}
                        </p>
                    </div>
                    {isTrainer && (
                        <button
                            onClick={openCreateModal}
                            className="group px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200 hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            Create Protocol
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    {/* Sidebar: Plan Explorer (Trainer/Admin Only) */}
                    {isTrainer ? (
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white p-4 md:p-6 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search Protocols..."
                                        className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-xl font-semibold border-transparent focus:bg-white focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:font-bold placeholder:text-slate-400 text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {plans.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setActivePlan(plan)}
                                            className={`w-full p-4 md:p-5 rounded-2xl text-left transition-all relative group cursor-pointer border ${activePlan?.id === plan.id
                                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 border-transparent shadow-lg shadow-violet-200'
                                                : 'bg-white border-slate-100 hover:border-violet-100 hover:shadow-md hover:shadow-violet-500/5'
                                                }`}
                                        >
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className={`p-2 rounded-xl ${activePlan?.id === plan.id ? 'bg-white/20 text-white' : 'bg-violet-50 text-violet-600'}`}>
                                                        <Dumbbell size={18} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => openAssignModal(plan.id)}
                                                            className={`p-1.5 rounded-lg transition-colors ${activePlan?.id === plan.id ? 'text-white/80 hover:bg-white/20 hover:text-white' : 'text-slate-400 hover:bg-violet-50 hover:text-violet-600'}`}
                                                            title="Assign"
                                                        >
                                                            <User size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(plan)}
                                                            className={`p-1.5 rounded-lg transition-colors ${activePlan?.id === plan.id ? 'text-white/80 hover:bg-white/20 hover:text-white' : 'text-slate-400 hover:bg-violet-50 hover:text-violet-600'}`}
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePlan(plan.id)}
                                                            className={`p-1.5 rounded-lg transition-colors ${activePlan?.id === plan.id ? 'text-white/80 hover:bg-white/20 hover:text-red-200' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h3 className={`text-base font-bold mb-1 ${activePlan?.id === plan.id ? 'text-white' : 'text-slate-900'}`}>
                                                    {plan.name}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-bold ${activePlan?.id === plan.id ? 'text-violet-100' : 'text-slate-500'}`}>
                                                        {plan.level || plan.difficulty || 'Advanced'}
                                                    </span>
                                                    <div className={`w-1 h-1 rounded-full ${activePlan?.id === plan.id ? 'bg-violet-300' : 'bg-slate-300'}`}></div>
                                                    <span className={`text-xs font-bold ${activePlan?.id === plan.id ? 'text-violet-100' : 'text-slate-500'}`}>
                                                        {plan.duration || '12 Weeks'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Member Quick Summary Card (Light Theme) */
                        <div className="lg:col-span-4 space-y-6 md:space-y-8">
                            <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 relative overflow-hidden h-full flex flex-col justify-between min-h-[400px] border border-slate-100 shadow-xl shadow-slate-200/50 group">
                                {/* Ambient Background Gradient */}
                                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-100/50 rounded-full blur-[80px] opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-fuchsia-100/50 rounded-full blur-[80px] opacity-60" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6 md:mb-8">
                                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 text-white">
                                            <TrendingUp size={24} className="md:w-7 md:h-7" strokeWidth={2.5} />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Current Week</div>
                                            <div className="text-xl md:text-2xl font-black text-slate-900">
                                                Week {activePlan ? Math.ceil((new Date() - new Date(activePlan.createdAt)) / (1000 * 60 * 60 * 24 * 7)) || 1 : 1}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 md:space-y-8">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-3">
                                                <span className="text-slate-600">Protocol Progress</span>
                                                <span className="text-violet-600">
                                                    {activePlan ? Math.min(100, Math.ceil(((new Date() - new Date(activePlan.createdAt)) / (1000 * 60 * 60 * 24 * 7 * 12)) * 100)) : 0}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200">
                                                <div
                                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full relative overflow-hidden shadow-sm transition-all duration-1000"
                                                    style={{ width: `${activePlan ? Math.min(100, Math.ceil(((new Date() - new Date(activePlan.createdAt)) / (1000 * 60 * 60 * 24 * 7 * 12)) * 100)) : 0}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="bg-slate-50/80 p-5 md:p-6 rounded-2xl flex items-center justify-between border border-slate-100">
                                                <div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</div>
                                                    <div className="text-base md:text-lg font-black text-emerald-600 uppercase tracking-tight">Active Plan</div>
                                                </div>
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500">
                                                    <Activity size={20} className="animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/progress')}
                                    className="relative z-10 w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-1 transition-all mt-6 md:mt-8 flex items-center justify-center gap-3 overflow-hidden group/btn"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Open Progress Lab <ChevronRight size={16} />
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Right Content: Daily Protocol */}
                    <div className="lg:col-span-8 space-y-6 md:space-y-8">
                        {/* Day Selector */}
                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                            {daysOfWeek.map((day) => {
                                const hasProtocol = activePlan?.days?.[day];
                                return (
                                    <button
                                        key={day}
                                        onClick={() => setActiveDay(day)}
                                        className={`flex-shrink-0 px-6 py-3.5 rounded-xl text-sm font-bold transition-all border ${activeDay === day
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200 border-transparent scale-105'
                                            : hasProtocol
                                                ? 'bg-white border-slate-200 text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700'
                                                : 'bg-slate-50 border-transparent text-slate-300 cursor-not-allowed'
                                            }`}
                                    >
                                        {day.toUpperCase()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Workout Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {[
                                { label: 'Total Volume', value: activePlan?.volume || 'N/A', icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
                                { label: 'Est. Duration', value: activePlan?.timePerSession || activePlan?.avgDuration || '60 min', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                                { label: 'Intensity', value: activePlan?.intensity || 'High', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
                            ].map((stat, i) => (
                                <div key={i} className={`bg-white p-6 rounded-[24px] shadow-sm border ${stat.border} flex items-center gap-5 hover:shadow-lg transition-all hover:-translate-y-1`}>
                                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                        <stat.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{stat.label}</div>
                                        <div className="text-xl font-black text-slate-900">{stat.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Exercise List */}
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-violet-600 shadow-sm border border-slate-100">
                                        <Calendar size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900 tracking-tight">{activePlan ? `Day ${daysOfWeek.indexOf(activeDay) + 1}: ${activePlan.name}` : "Today's Protocol"}</h2>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Focus: {activePlan?.goal || 'Strength & Power'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl text-xs font-bold border border-slate-200 hover:border-violet-500 hover:text-violet-600 transition-all shadow-sm flex-1 md:flex-none">
                                        <Music size={14} /> Playlist
                                    </button>
                                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:-translate-y-0.5 flex-1 md:flex-none">
                                        <Timer size={14} /> Start Session
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {activePlan?.days?.[activeDay] ? (
                                        activePlan.days[activeDay].map((exercise, idx) => (
                                            <div key={exercise.id} className="group flex flex-col md:flex-row items-stretch md:items-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5 transition-all gap-6 relative overflow-hidden">
                                                {/* Hover Highlight */}
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="flex items-center gap-5 md:w-1/3">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner text-slate-400 font-black text-lg group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-violet-700 transition-colors">{exercise.name}</h4>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                            {exercise.notes ? (exercise.notes.length > 20 ? exercise.notes.substring(0, 20) + '...' : exercise.notes) : 'Standard Movement'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                                    <div className="text-center md:text-left">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sets</div>
                                                        <div className="text-sm font-bold text-slate-900 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">{exercise.sets}</div>
                                                    </div>
                                                    <div className="text-center md:text-left">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Reps</div>
                                                        <div className="text-sm font-bold text-slate-900 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">{exercise.reps}</div>
                                                    </div>
                                                    <div className="text-center md:text-left">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">RPE</div>
                                                        <div className="text-sm font-bold text-orange-600 flex items-center gap-1">
                                                            <Flame size={12} fill="currentColor" /> {exercise.rpe}/10
                                                        </div>
                                                    </div>
                                                    <div className="text-center md:text-left">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Rest</div>
                                                        <div className="text-sm font-bold text-violet-600">{exercise.rest}</div>
                                                    </div>
                                                </div>

                                                <button className="hidden md:flex w-10 h-10 bg-slate-50 rounded-xl items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all border border-transparent hover:border-violet-100">
                                                    <Info size={18} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm">
                                                <Zap size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Rest & Recovery Day</h3>
                                            <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                                                No specific protocol scheduled. Focus on active recovery and hydration.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Creation/Edit Modal */}
            <CreateWorkoutDrawer
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSavePlan}
                initialData={editingPlan}
            />

            {/* Assignment Modal */}
            <AssignWorkoutDrawer
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onAssign={handleAssignPlan}
                planName={plans.find(p => p.id === selectedPlanId)?.name}
            />
        </div>
    );
};

export default WorkoutPlans;
