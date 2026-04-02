import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Trash2,
    RefreshCcw,
    CheckCircle2,
    ChevronRight,
    Clock,
    UtensilsCrossed,
    BookmarkPlus,
    Info,
    Leaf,
    Droplets,
    Activity,
    Target,
    X,
    Save
} from 'lucide-react';
import { ROLES } from '../../../config/roles';
import Card from '../../../components/ui/Card';
import { toast } from 'react-hot-toast';
import apiClient from '../../../api/apiClient';

const DietPlans = ({ role }) => {
    const navigate = useNavigate();
    const isMember = role === ROLES.MEMBER;

    // Member View Props
    const [activePlan, setActivePlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [requesting, setRequesting] = useState(false);

    React.useEffect(() => {
        if (isMember) {
            fetchMemberPlan();
        }
    }, [isMember]);

    const fetchMemberPlan = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/member/diet-plans');
            setActivePlan(res.data && res.data.length > 0 ? res.data[0] : null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPlan = async () => {
        try {
            setRequesting(true);
            await apiClient.post('/member/diet-plans/request');
            toast.success('Diet plan requested! Our team will prepare it soon.');
        } catch (err) {
            toast.error('Failed to request plan. Please try again.');
        } finally {
            setRequesting(false);
        }
    };

    if (isMember) {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <Leaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing Nutrition Matrix...</p>
                </div>
            );
        }

        let macrosObj = { protein: '0g', carbs: '0g', fat: '0g' };
        let mealsArr = [];

        if (activePlan) {
            try {
                macrosObj = typeof activePlan.macros === 'string' ? JSON.parse(activePlan.macros) : (activePlan.macros || macrosObj);
                mealsArr = typeof activePlan.meals === 'string' ? JSON.parse(activePlan.meals) : (activePlan.meals || []);
            } catch (e) {
                console.error("Error parsing diet plan data", e);
            }
        }

        return (
            <div className="space-y-8 fade-in">
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 bg-white p-8 rounded-3xl border border-border-color shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-gradient"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                                <UtensilsCrossed size={32} />
                            </div>
                            <div>
                                <h1 className="page-title">
                                    {activePlan ? activePlan.name : 'Daily Nutrition'}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                                        {activePlan ? activePlan.target : 'No Active Plan'}
                                    </span>
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={12} /> Duration: {activePlan ? activePlan.duration : '--'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {activePlan && (
                            <div className="flex items-center gap-8 px-6 md:border-l-2 border-slate-50 relative z-10">
                                <div className="text-center group cursor-help">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 group-hover:text-primary transition-colors">Calories</p>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{activePlan.calories}<span className="text-xs text-slate-400 ml-1">kcal</span></p>
                                </div>
                                <div className="text-center group cursor-help">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 group-hover:text-emerald-500 transition-colors">Protein</p>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{macrosObj.protein}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center gap-2 shadow-2xl shadow-slate-200 relative overflow-hidden">
                        <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 -rotate-12" />
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Status</p>
                        <h4 className="text-xl font-black uppercase tracking-tighter">
                            {activePlan ? 'In Progress' : 'Optimal Ready'}
                        </h4>
                        <div className="w-12 h-1 bg-primary rounded-full mt-2"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Meal Schedule */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="section-title">
                                <div className="w-1 h-6 rounded-full bg-primary"></div>
                                Protocol Schedule
                            </div>
                        </div>

                        {activePlan ? (
                            <>
                                <div className="grid gap-6">
                                    {mealsArr.map((meal, idx) => (
                                        <Card key={idx} className="group p-0 border-2 border-slate-50 hover:border-violet-100 bg-white rounded-[2.5rem] transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1">
                                            <div className="flex flex-col md:flex-row h-full">
                                                <div className="md:w-48 bg-slate-50 p-8 flex flex-col items-center justify-center text-center gap-3 border-r border-slate-100 group-hover:bg-primary-light transition-colors">
                                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                                                        <Clock size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-900 uppercase leading-none mb-1">{meal.time}</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Time</p>
                                                    </div>
                                                </div>

                                                <div className="flex-1 p-8 md:p-10 relative">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div>
                                                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{meal.name}</h4>
                                                            <div className="flex gap-4">
                                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase bg-primary-light px-3 py-1 rounded-full border border-violet-100">
                                                                    <Activity size={10} /> {meal.calories} kcal
                                                                </span>
                                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                                                    <Target size={10} /> {meal.macros?.protein || '0g'} Protein
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                                            <CheckCircle2 size={20} />
                                                        </div>
                                                    </div>

                                                    <div className="relative">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 rounded-full"></div>
                                                        <p className="pl-6 text-[12px] font-bold text-slate-600 leading-relaxed italic uppercase tracking-wide">
                                                            {meal.items || meal.description || meal.food || 'No details provided.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                {activePlan.notes && (
                                    <div className="p-8 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/10 text-sm font-bold text-slate-700 italic relative overflow-hidden">
                                        <Info className="absolute -right-4 -top-4 w-20 h-20 text-primary/5" />
                                        " {activePlan.notes} "
                                    </div>
                                )}
                            </>
                        ) : (
                            <Card className="p-16 border-2 border-dashed border-slate-200 shadow-sm rounded-[3rem] bg-white">
                                <div className="flex flex-col items-center justify-center text-center space-y-8">
                                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border-2 border-slate-100 rotate-12">
                                        <Leaf size={48} strokeWidth={1} />
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                            No Nutrition Protocol
                                        </h2>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                                            Your high-performance diet plan hasn't been generated. Contact your personal coach or request one below.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRequestPlan}
                                        disabled={requesting}
                                        className="px-12 h-16 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-slate-200 hover:bg-primary hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:transform-none">
                                        {requesting ? 'Processing Request...' : 'Request Protocol'}
                                    </button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Tips Section */}
                    <div className="md:col-span-1 space-y-8">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                <Info size={16} />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">🥗 Protocol Insight</h2>
                        </div>

                        <Card className="p-0 border-2 border-slate-50 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="bg-slate-900 p-8 text-white relative">
                                <Leaf className="absolute -right-4 -top-4 w-20 h-20 text-white/5 -rotate-12" />
                                <h4 className="text-lg font-black uppercase tracking-tight mb-1">Nutrition Rules</h4>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Maximum Performance</p>
                            </div>
                            <div className="p-8 space-y-8">
                                <ul className="space-y-6">
                                    {[
                                        "Eat 3-5 high-protein meals daily",
                                        "Hydrate: 4L water minimum per day",
                                        "Zero processed sugar intake",
                                        "Prioritize sleep: 7.5h - 9h target",
                                        "Final meal 3h before resting"
                                    ].map((tip, idx) => (
                                        <li key={idx} className="flex items-start gap-4 group">
                                            <div className="mt-1.5 w-4 h-4 rounded-full bg-primary-light flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-white transition-colors" />
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-wide">
                                                {tip}
                                            </p>
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-8 border-t border-slate-50">
                                    <div className="flex flex-col gap-4 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                                        <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0 relative z-10 group-hover:scale-110 transition-transform">
                                            <Droplets size={24} />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Coach Essential</p>
                                            <p className="text-xs font-bold text-emerald-900 uppercase leading-snug">Fuel your body like an athlete.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className=" bg-[#FBFBFE] min-h-screen font-sans">
            <div className="max-w-full mx-auto">
                {/* Header with Switcher */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-2 p-1 md:p-1.5 bg-white border border-gray-100 rounded-2xl w-full md:w-fit shadow-sm overflow-x-auto no-scrollbar scrollbar-hide">
                        <button
                            onClick={() => navigate('/workout-plans')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-bold text-gray-400 hover:bg-gray-50 transition-all whitespace-nowrap"
                        >
                            <Target size={16} />
                            Workout Plan
                        </button>
                        <button
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-bold bg-[#F3F4F6] text-[#1A1A1A] transition-all shadow-sm whitespace-nowrap"
                        >
                            <UtensilsCrossed size={16} />
                            Diet Plan
                        </button>
                    </div>
                </div>

                <TrainerDietBuilder />
            </div>

            <style>{`
                .saas-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .saas-card:hover {
                    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
                }
                ::-webkit-scrollbar {
                    height: 4px;
                }
                ::-webkit-scrollbar-thumb {
                    background: #E5E7EB;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

// Trainer UI Component
const TrainerDietBuilder = () => {
    const navigate = useNavigate();
    const [planName, setPlanName] = useState('');
    const [target, setTarget] = useState('');
    const [duration, setDuration] = useState('4 Weeks');
    const [calories, setCalories] = useState('');
    const [macros, setMacros] = useState({ protein: '', carbs: '', fat: '' });
    const [notes, setNotes] = useState('');
    const [meals, setMeals] = useState([
        { id: Date.now(), name: 'Breakfast', time: '08:00 AM', items: '', calories: '', macros: { protein: '', carbs: '', fat: '' } }
    ]);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    React.useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoadingTemplates(true);
            const res = await apiClient.get('/trainer/diet-plans');
            setTemplates(res.data || []);
        } catch (err) {
            console.error('Failed to fetch templates:', err);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await apiClient.patch(`/trainer/diet-plans/${id}/status`);
            toast.success('Status updated');
            fetchTemplates();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const addMeal = () => {
        setMeals([...meals, { id: Date.now(), name: '', time: '', items: '', calories: '', macros: { protein: '', carbs: '', fat: '' } }]);
    };

    const updateMeal = (id, field, value) => {
        setMeals(meals.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const updateMealMacro = (id, macroField, value) => {
        setMeals(meals.map(m => {
            if (m.id === id) {
                return { ...m, macros: { ...m.macros, [macroField]: value } };
            }
            return m;
        }));
    };

    const removeMeal = (id) => {
        setMeals(meals.filter(m => m.id !== id));
    };

    const handleSaveTemplate = async () => {
        if (!planName.trim()) {
            toast.error('Please enter a plan name first');
            return;
        }

        try {
            setSaving(true);
            toast.loading('Saving diet template...', { id: 'saveDiet' });

            const payload = {
                clientId: 0,
                name: planName,
                target: target || 'General Nutrition',
                duration: duration,
                calories: parseInt(calories) || 0,
                macros: JSON.stringify(macros),
                meals: JSON.stringify(meals),
                notes: notes,
                status: 'Active'
            };

            await apiClient.post('/trainer/diet-plans', payload);
            toast.success('Diet template saved successfully!', { id: 'saveDiet' });
            fetchTemplates();
            // Reset form
            setPlanName('');
            setTarget('');
            setCalories('');
            setNotes('');
            setMeals([{ id: Date.now(), name: 'Breakfast', time: '08:00 AM', items: '', calories: '', macros: { protein: '', carbs: '', fat: '' } }]);
        } catch (error) {
            console.error('Failed to save template:', error);
            const msg = error.response?.data?.message || 'Failed to save diet template';
            toast.error(msg, { id: 'saveDiet' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Templates List */}
            <div className="saas-card  rounded-2xl md:rounded-[32px] bg-white border border-gray-100 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <BookmarkPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Saved Protocols</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ready-to-use nutrition blocks</p>
                        </div>
                    </div>
                    <button onClick={fetchTemplates} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 border border-transparent hover:border-slate-100">
                        <RefreshCcw size={18} className={loadingTemplates ? 'animate-spin text-primary' : ''} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingTemplates ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-44 bg-slate-50 animate-pulse rounded-[2rem] border border-slate-100" />
                        ))
                    ) : templates.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                            <UtensilsCrossed size={48} className="mx-auto text-slate-200 mb-6 opacity-20" />
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-loose">No protocols digitized yet. <br />Start building your first one below.</p>
                        </div>
                    ) : templates.map((tpl) => (
                        <div key={tpl.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-violet-200 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <h4 className="font-black text-slate-900 uppercase tracking-tight truncate flex-1">{tpl.name}</h4>
                                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border shrink-0 ${tpl.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                    }`}>
                                    {tpl.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">
                                <span className="flex items-center gap-1.5"><Activity size={14} className="text-primary" /> {tpl.calories} kcal</span>
                                <span className="text-slate-200">•</span>
                                <span className="flex items-center gap-1.5"><Target size={14} className="text-emerald-500" /> {tpl.target}</span>
                            </div>
                            <div className="flex items-center justify-between pt-5 border-t border-slate-50 relative z-10">
                                <button
                                    onClick={() => handleToggleStatus(tpl.id)}
                                    className="text-[9px] font-black text-slate-300 uppercase hover:text-slate-900 transition-colors tracking-widest"
                                >
                                    Cycle Status
                                </button>
                                <button
                                    onClick={() => navigate('/trainer/members/assigned')}
                                    className="px-5 py-2 bg-primary-light text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    Deploy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Builder Implementation */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-12 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
                            <Target size={28} />
                        </div>
                        <div>
                            <h2 className="page-title">Diet Plan Builder</h2>
                            <p className="page-subtitle">Design customized nutrition protocols</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveTemplate}
                        disabled={saving}
                        className="h-14 px-10 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? (
                            <RefreshCcw size={16} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={16} />
                        )}
                        {saving ? 'Saving...' : 'Save Template'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Plan Name <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g. Fat Loss - Aggressive"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Goal</label>
                        <input
                            type="text"
                            placeholder="e.g. Weight Loss"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Total Calories</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="e.g. 2000"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                                className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">kcal</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Target Protein
                        </label>
                        <input
                            type="text"
                            placeholder="150g"
                            value={macros.protein}
                            onChange={(e) => setMacros({ ...macros, protein: e.target.value })}
                            className="w-full h-14 px-6 bg-primary-light/30 border-2 border-violet-100 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:border-primary transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Target Carbs
                        </label>
                        <input
                            type="text"
                            placeholder="200g"
                            value={macros.carbs}
                            onChange={(e) => setMacros({ ...macros, carbs: e.target.value })}
                            className="w-full h-14 px-6 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Target Fats
                        </label>
                        <input
                            type="text"
                            placeholder="60g"
                            value={macros.fat}
                            onChange={(e) => setMacros({ ...macros, fat: e.target.value })}
                            className="w-full h-14 px-6 bg-amber-50/50 border-2 border-amber-100 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:border-amber-500 transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Plan Duration</label>
                        <input
                            type="text"
                            placeholder="e.g. 4 Weeks"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all"
                        />
                    </div>

                    <div className="space-y-2 lg:col-span-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Coach Direction & Principles</label>
                        <textarea
                            placeholder="Provide general guidance, hydration rules, or banned foods..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all resize-none min-h-[120px]"
                        />
                    </div>
                </div>
            </div>

            {/* Meals Section */}
            <div className="bg-slate-50 rounded-[3rem] border border-slate-200/60 p-1 md:p-2 overflow-hidden shadow-inner">
                <div className="bg-white rounded-[2.8rem] p-8 md:p-12 space-y-12">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-2">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                                <UtensilsCrossed size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    Meal Schedule
                                </h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                                    Detailed consumption targets per meal
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={addMeal}
                            className="h-14 px-8 bg-slate-50 text-slate-900 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-3 group"
                        >
                            <Plus size={18} strokeWidth={3} className="text-primary group-hover:text-white transition-colors" />
                            Add Daily Meal
                        </button>
                    </div>

                    <div className="space-y-8">
                        {meals.length === 0 ? (
                            <div className="py-24 flex flex-col items-center justify-center text-slate-300 bg-slate-50/50 rounded-[2.5rem] border-4 border-dashed border-slate-100/60">
                                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg mb-6 border border-slate-50">
                                    <UtensilsCrossed size={40} strokeWidth={1} className="opacity-20 text-slate-900" />
                                </div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] text-center px-4">No meals added to this protocol.</p>
                                <button
                                    onClick={addMeal}
                                    className="mt-6 text-[11px] font-black uppercase tracking-widest text-primary hover:scale-105 transition-transform bg-primary-light px-6 py-2 rounded-full"
                                >
                                    Define your first meal
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                {meals.map((meal, index) => (
                                    <div key={meal.id} className="group bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-2xl hover:border-violet-100 transition-all duration-500 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 group-hover:bg-primary transition-colors"></div>

                                        <button
                                            onClick={() => removeMeal(meal.id)}
                                            className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all border border-slate-100"
                                        >
                                            <X size={20} />
                                        </button>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                            {/* Meal Meta */}
                                            <div className="lg:col-span-4 space-y-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-1.5 h-6 rounded-full bg-primary/20"></div>
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Meal Configuration</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Description / Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Early Breakfast"
                                                        value={meal.name}
                                                        onChange={(e) => updateMeal(meal.id, 'name', e.target.value)}
                                                        className="w-full h-12 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-[11px] font-black text-slate-700 uppercase tracking-tight outline-none focus:border-primary focus:bg-white transition-all"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Serving Time</label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                placeholder="08:00 AM"
                                                                value={meal.time}
                                                                onChange={(e) => updateMeal(meal.id, 'time', e.target.value)}
                                                                className="w-full h-12 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-[11px] font-black text-slate-700 outline-none focus:border-primary focus:bg-white transition-all"
                                                            />
                                                            <Clock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Approx KCAL</label>
                                                        <input
                                                            type="number"
                                                            placeholder="450"
                                                            value={meal.calories}
                                                            onChange={(e) => updateMeal(meal.id, 'calories', e.target.value)}
                                                            className="w-full h-12 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-[11px] font-black text-slate-700 outline-none focus:border-primary focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Meal Content */}
                                            <div className="lg:col-span-8 flex flex-col gap-6">
                                                <div className="flex-1 flex flex-col space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                                                        <span>Food Items & Preparation</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    </label>
                                                    <textarea
                                                        placeholder="e.g. 150g Grilled Chicken Breast + 1 Cup Steamed Broccoli + 50g Brown Rice..."
                                                        value={meal.items}
                                                        onChange={(e) => updateMeal(meal.id, 'items', e.target.value)}
                                                        className="w-full h-full p-6 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-[12px] font-bold text-slate-600 outline-none focus:border-primary focus:bg-white transition-all resize-none min-h-[120px] shadow-inner"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex flex-col gap-1 hover:bg-primary/10 transition-colors">
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Protein</span>
                                                        <input
                                                            type="text"
                                                            placeholder="0g"
                                                            value={meal.macros?.protein || ''}
                                                            onChange={(e) => updateMealMacro(meal.id, 'protein', e.target.value)}
                                                            className="w-full bg-transparent text-sm font-black text-slate-900 outline-none placeholder:text-primary/30"
                                                        />
                                                    </div>
                                                    <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex flex-col gap-1 hover:bg-emerald-500/10 transition-colors">
                                                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">Carbs</span>
                                                        <input
                                                            type="text"
                                                            placeholder="0g"
                                                            value={meal.macros?.carbs || ''}
                                                            onChange={(e) => updateMealMacro(meal.id, 'carbs', e.target.value)}
                                                            className="w-full bg-transparent text-sm font-black text-slate-900 outline-none placeholder:text-emerald-600/30"
                                                        />
                                                    </div>
                                                    <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 flex flex-col gap-1 hover:bg-amber-500/10 transition-colors">
                                                        <span className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em]">Fats</span>
                                                        <input
                                                            type="text"
                                                            placeholder="0g"
                                                            value={meal.macros?.fat || ''}
                                                            onChange={(e) => updateMealMacro(meal.id, 'fat', e.target.value)}
                                                            className="w-full bg-transparent text-sm font-black text-slate-900 outline-none placeholder:text-amber-600/30"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Save Action */}
                    {meals.length > 0 && (
                        <div className="mt-12 flex justify-center pb-4">
                            <button
                                onClick={handleSaveTemplate}
                                disabled={saving}
                                className="h-16 px-16 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.25em] shadow-2xl shadow-slate-300 hover:bg-primary hover:scale-105 transition-all flex items-center gap-4 group disabled:opacity-50"
                            >
                                {saving ? (
                                    <RefreshCcw size={20} className="animate-spin text-primary" />
                                ) : (
                                    <Save size={20} className="group-hover:animate-bounce" />
                                )}
                                {saving ? 'Finalizing...' : 'Save Diet Protocol'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DietPlans;
