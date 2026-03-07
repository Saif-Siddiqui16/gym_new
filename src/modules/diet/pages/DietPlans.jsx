import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UtensilsCrossed,
    Clock,
    Plus,
    CheckCircle2,
    Info,
    RefreshCcw,
    ChevronRight,
    Leaf,
    Droplets,
    Activity,
    Target
} from 'lucide-react';
import { ROLES } from '../../../config/roles';
import Card from '../../../components/ui/Card';
import '../../../styles/GlobalDesign.css';
import { toast } from 'react-hot-toast';
import apiClient from '../../../api/apiClient';

const DietPlans = ({ role }) => {
    const navigate = useNavigate();
    const isMember = role === ROLES.MEMBER;

    const [dietPlans, setDietPlans] = React.useState([]);
    const [loadingPlans, setLoadingPlans] = React.useState(false);
    const [requesting, setRequesting] = React.useState(false);

    React.useEffect(() => {
        if (isMember) {
            fetchMyPlans();
        }
    }, [isMember]);

    const fetchMyPlans = async () => {
        try {
            setLoadingPlans(true);
            const res = await apiClient.get('/member/diet-plans');
            setDietPlans(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingPlans(false);
        }
    };

    const handleRequestPlan = async () => {
        try {
            setRequesting(true);
            await apiClient.post('/member/service-requests', {
                type: 'Diet Plan',
                rawType: 'diet_plan',
                details: 'Member requested a personalized diet plan.'
            });
            toast.success('Diet plan requested successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to request diet plan. Please try again.');
        } finally {
            setRequesting(false);
        }
    };

    if (isMember) {
        const activePlan = dietPlans.length > 0 ? dietPlans[0] : null;
        let macrosObj = { protein: '0g', carbs: '0g', fat: '0g' };
        let mealsArr = [];

        if (activePlan) {
            try {
                if (activePlan.macros) {
                    macrosObj = typeof activePlan.macros === 'string' ? JSON.parse(activePlan.macros) : activePlan.macros;
                }
            } catch (e) {
                console.warn('Could not parse macros data', e);
            }
            try {
                if (activePlan.meals) {
                    mealsArr = typeof activePlan.meals === 'string' ? JSON.parse(activePlan.meals) : activePlan.meals;
                    if (!Array.isArray(mealsArr)) {
                        // Sometimes meals might be an object instead of array depending on structure
                        mealsArr = Object.values(mealsArr);
                    }
                }
            } catch (e) {
                console.warn('Could not parse meals data', e);
            }
        }

        return (
            <div className="saas-container h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8 space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b-2 border-slate-100">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-100 animate-in zoom-in duration-500 shrink-0">
                            <UtensilsCrossed size={32} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-1 truncate">
                                {activePlan ? activePlan.name : 'My Diet Plan'}
                            </h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest shrink-0">
                                    Target:
                                </span>
                                <span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-violet-100 truncate">
                                    {activePlan ? activePlan.target : 'Your personalized nutrition guide'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleRequestPlan}
                        disabled={requesting}
                        className="w-full sm:w-auto px-8 h-12 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-100 hover:bg-violet-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                        <RefreshCcw size={16} strokeWidth={3} className={`transition-transform duration-500 ${requesting ? 'animate-spin' : 'group-hover:rotate-180'}`} /> Request New Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
                    {/* Main Section */}
                    <div className="md:col-span-2 space-y-6">
                        {loadingPlans ? (
                            <div className="flex justify-center p-12"><RefreshCcw className="animate-spin text-violet-400" size={32} /></div>
                        ) : activePlan ? (
                            <>
                                {/* Macros Overview */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                                        <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2"><Activity size={16} /></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calories</p>
                                        <p className="text-lg font-black text-slate-900">{activePlan.calories || '0'} kcal</p>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                                        <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mb-2"><Droplets size={16} /></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protein</p>
                                        <p className="text-lg font-black text-slate-900">{macrosObj.protein || '0g'}</p>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2"><Leaf size={16} /></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carbs</p>
                                        <p className="text-lg font-black text-slate-900">{macrosObj.carbs || '0g'}</p>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                                        <div className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center mb-2"><Target size={16} /></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fats</p>
                                        <p className="text-lg font-black text-slate-900">{macrosObj.fat || macrosObj.fats || '0g'}</p>
                                    </div>
                                </div>

                                {/* Meals Sequence */}
                                <div className="space-y-4">
                                    {mealsArr.length > 0 ? mealsArr.map((meal, idx) => (
                                        <Card key={idx} className="p-5 border border-slate-100 hover:border-violet-100 bg-[#FCFCFE] rounded-2xl transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-[12px] font-black text-violet-600">
                                                        <UtensilsCrossed size={14} />
                                                    </span>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{meal.name || `Meal ${idx + 1}`}</h4>
                                                        {meal.time && (
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                                <Clock size={10} /> {meal.time}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {meal.calories && (
                                                    <span className="px-3 py-1 bg-white border border-slate-100 text-[10px] font-black text-slate-600 rounded-lg shadow-sm whitespace-nowrap self-start sm:self-auto">
                                                        {meal.calories} kcal
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                {meal.items || meal.description || meal.food || 'No details provided.'}
                                            </div>
                                            {meal.macros && (
                                                <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
                                                    <span>Pro: {meal.macros.protein || '0g'}</span>
                                                    <span>Carb: {meal.macros.carbs || '0g'}</span>
                                                    <span>Fat: {meal.macros.fat || '0g'}</span>
                                                </div>
                                            )}
                                        </Card>
                                    )) : (
                                        <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                            <p className="text-xs font-bold uppercase tracking-widest">No meals detailed in this plan.</p>
                                        </div>
                                    )}
                                </div>
                                {activePlan.notes && (
                                    <div className="p-5 bg-violet-50/50 rounded-2xl border border-violet-100 text-sm font-bold text-slate-700 italic">
                                        " {activePlan.notes} "
                                    </div>
                                )}
                            </>
                        ) : (
                            <Card className="p-10 border-2 border-slate-100 shadow-sm rounded-3xl bg-white">
                                <div className="flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-100">
                                        <Leaf size={40} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                                            No Active Diet Plan
                                        </h2>
                                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-md mx-auto">
                                            You don't have a personalized diet plan yet. Request one from your trainer!
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRequestPlan}
                                        disabled={requesting}
                                        className="px-10 h-14 bg-violet-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-900/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                        {requesting ? 'Requesting...' : 'Request Diet Plan'}
                                    </button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Tips Section */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                <Info size={16} />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">🥗 Nutrition Tips</h2>
                        </div>

                        <Card className="p-6 border-2 border-slate-100 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all">
                            <ul className="space-y-6">
                                {[
                                    "Eat 3-5 small meals throughout the day",
                                    "Drink at least 8 glasses of water daily",
                                    "Include protein in every meal",
                                    "Avoid processed foods and sugary drinks",
                                    "Eat your last meal 2-3 hours before sleeping"
                                ].map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-3 group">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-violet-50 flex items-center justify-center shrink-0 group-hover:bg-violet-600 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-600 group-hover:bg-white transition-colors" />
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-wide">
                                            {tip}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <div className="flex flex-col gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 shrink-0">
                                        <Leaf size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Nutritionist Tip</p>
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Fuel your body, feed your soul.</p>
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
        <div className="p-4 md:p-8 bg-[#FBFBFE] min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
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

                {/* Trainer Diet Builder Implementation */}
                <TrainerDietBuilder />
            </div>

            {/* Global Design Extras */}
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

// Extracted logic for Trainer Diet Builder for cleaner code
const TrainerDietBuilder = () => {
    const navigate = useNavigate();
    const [planName, setPlanName] = React.useState('');
    const [target, setTarget] = React.useState('');
    const [duration, setDuration] = React.useState('4 Weeks');
    const [calories, setCalories] = React.useState('');
    const [macros, setMacros] = React.useState({ protein: '', carbs: '', fat: '' });
    const [notes, setNotes] = React.useState('');
    const [meals, setMeals] = React.useState([
        { id: Date.now(), name: 'Breakfast', time: '08:00 AM', items: '', calories: '', macros: { protein: '', carbs: '', fat: '' } }
    ]);
    const [saving, setSaving] = React.useState(false);

    const [templates, setTemplates] = React.useState([]);
    const [loadingTemplates, setLoadingTemplates] = React.useState(false);

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
                clientId: 0, // 0 indicates it's a template
                name: planName,
                target: target || 'General Nutrition',
                duration: duration,
                calories: parseInt(calories) || 0,
                macros: macros,
                meals: meals,
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Templates List */}
            <div className="saas-card p-6 md:p-8 rounded-2xl md:rounded-[32px] bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight">Saved Templates</h2>
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Reusable diet protocols for your branch</p>
                    </div>
                    <button onClick={fetchTemplates} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <RefreshCcw size={16} className={loadingTemplates ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loadingTemplates ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-40 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
                        ))
                    ) : templates.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                            <UtensilsCrossed size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No templates saved yet</p>
                        </div>
                    ) : templates.map((tpl) => (
                        <div key={tpl.id} className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-violet-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-black text-gray-900 uppercase tracking-tight truncate flex-1">{tpl.name}</h4>
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border shrink-0 ${tpl.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                    }`}>
                                    {tpl.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                <span className="flex items-center gap-1"><Activity size={12} /> {tpl.calories} kcal</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Target size={12} /> {tpl.target}</span>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => handleToggleStatus(tpl.id)}
                                    className="text-[9px] font-black text-gray-400 uppercase hover:text-gray-900 transition-colors"
                                >
                                    Toggle Status
                                </button>
                                <button
                                    onClick={() => navigate('/trainer/members/assigned')}
                                    className="px-4 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all"
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plan Info Card */}
            <div className="saas-card p-6 md:p-8 rounded-2xl md:rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight">Diet Plan Builder</h2>
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Design customized nutrition protocols</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveTemplate}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-violet-100 hover:bg-violet-700 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="space-y-1.5 lg:col-span-2">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Plan Name <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g. Fat Loss - Aggressive"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            className="w-full h-11 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Target</label>
                        <input
                            type="text"
                            placeholder="e.g. Weight Loss"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full h-11 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Total Calories</label>
                        <input
                            type="number"
                            placeholder="e.g. 2000"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            className="w-full h-11 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
                        />
                    </div>

                    {/* Global Macros */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Target Protein (g)</label>
                        <input
                            type="text"
                            placeholder="150g"
                            value={macros.protein}
                            onChange={(e) => setMacros({ ...macros, protein: e.target.value })}
                            className="w-full h-11 px-4 bg-violet-50/50 border border-violet-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Target Carbs (g)</label>
                        <input
                            type="text"
                            placeholder="200g"
                            value={macros.carbs}
                            onChange={(e) => setMacros({ ...macros, carbs: e.target.value })}
                            className="w-full h-11 px-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-emerald-200 transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Target Fats (g)</label>
                        <input
                            type="text"
                            placeholder="60g"
                            value={macros.fat}
                            onChange={(e) => setMacros({ ...macros, fat: e.target.value })}
                            className="w-full h-11 px-4 bg-amber-50/50 border border-amber-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-amber-200 transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Duration</label>
                        <input
                            type="text"
                            placeholder="e.g. 4 Weeks"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full h-11 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
                        />
                    </div>

                    <div className="space-y-1.5 lg:col-span-4">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Coach's Directive / Rules</label>
                        <textarea
                            placeholder="General guidance for the member (e.g. Drink 3L water daily...)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm resize-none min-h-[80px]"
                        />
                    </div>
                </div>
            </div>

            {/* Meals Section */}
            <div className="saas-card rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 border-b border-gray-50 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                            <UtensilsCrossed size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-tight">
                                Meal Schedule
                            </h3>
                            <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mt-0.5">
                                Add daily consumption targets
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={addMeal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-50 text-violet-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-100 transition-all w-full sm:w-auto justify-center"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Meal
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-6 bg-[#FCFCFE]">
                    {meals.length === 0 ? (
                        <div className="py-12 md:py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100">
                            <UtensilsCrossed size={48} strokeWidth={1} className="mb-4 opacity-20" />
                            <p className="text-sm font-bold text-center px-4 uppercase tracking-widest">No meals defined yet.</p>
                            <button
                                onClick={addMeal}
                                className="mt-4 text-[10px] font-black uppercase tracking-widest text-violet-600 hover:underline"
                            >
                                Add your first meal
                            </button>
                        </div>
                    ) : (
                        meals.map((meal, index) => (
                            <div key={meal.id} className="bg-white border-2 border-slate-50 rounded-2xl p-5 md:p-6 shadow-sm relative group hover:border-violet-100 transition-all">
                                <button
                                    onClick={() => removeMeal(meal.id)}
                                    className="absolute top-4 right-4 p-2 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
                                >
                                    ✕
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-3 space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Meal Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Breakfast"
                                                value={meal.name}
                                                onChange={(e) => updateMeal(meal.id, 'name', e.target.value)}
                                                className="w-full h-10 px-3 bg-[#F9FAFB] border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Time</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 08:00 AM"
                                                value={meal.time}
                                                onChange={(e) => updateMeal(meal.id, 'time', e.target.value)}
                                                className="w-full h-10 px-3 bg-[#F9FAFB] border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Calories</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 450"
                                                value={meal.calories}
                                                onChange={(e) => updateMeal(meal.id, 'calories', e.target.value)}
                                                className="w-full h-10 px-3 bg-[#F9FAFB] border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-9 space-y-4">
                                        <div className="space-y-1.5 h-full flex flex-col">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Food Items & Instructions</label>
                                            <textarea
                                                placeholder="e.g. 4 scrambled eggs, 2 slices of whole wheat toast, 1 apple..."
                                                value={meal.items}
                                                onChange={(e) => updateMeal(meal.id, 'items', e.target.value)}
                                                className="w-full flex-1 p-3 bg-[#F9FAFB] border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all resize-none min-h-[100px]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex items-center gap-2 bg-violet-50/50 p-2 rounded-lg border border-violet-100/50">
                                                <span className="text-[9px] font-black text-violet-600 uppercase w-10">Pro</span>
                                                <input
                                                    type="text"
                                                    placeholder="0g"
                                                    value={meal.macros?.protein || ''}
                                                    onChange={(e) => updateMealMacro(meal.id, 'protein', e.target.value)}
                                                    className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none placeholder:text-violet-300"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                                                <span className="text-[9px] font-black text-emerald-600 uppercase w-10">Carb</span>
                                                <input
                                                    type="text"
                                                    placeholder="0g"
                                                    value={meal.macros?.carbs || ''}
                                                    onChange={(e) => updateMealMacro(meal.id, 'carbs', e.target.value)}
                                                    className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none placeholder:text-emerald-300"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                                                <span className="text-[9px] font-black text-amber-600 uppercase w-10">Fat</span>
                                                <input
                                                    type="text"
                                                    placeholder="0g"
                                                    value={meal.macros?.fat || ''}
                                                    onChange={(e) => updateMealMacro(meal.id, 'fat', e.target.value)}
                                                    className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none placeholder:text-amber-300"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DietPlans;
