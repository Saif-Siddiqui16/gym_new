import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dumbbell,
    UtensilsCrossed,
    Plus,
    Trash2,
    Search,
    Bell,
    Moon,
    BookmarkPlus,
    User,
    Save,
    ChevronRight,
    Zap,
    TrendingUp,
    Clock,
    CheckCircle2,
    Info,
    RefreshCcw,
    MoreVertical,
    Target
} from 'lucide-react';
import { ROLES } from '../../../config/roles';
import Card from '../../../components/ui/Card';
import '../../../styles/GlobalDesign.css';
import { toast } from 'react-hot-toast';
import apiClient from '../../../api/apiClient';

const DAY_LABELS = [
    { key: 'day1', label: 'Day 1', focus: 'Chest & Triceps' },
    { key: 'day2', label: 'Day 2', focus: 'Back & Biceps' },
    { key: 'day3', label: 'Day 3', focus: 'Legs & Glutes' },
    { key: 'day4', label: 'Day 4', focus: 'Shoulders & Arms' },
    { key: 'day5', label: 'Day 5', focus: 'Core & Cardio' },
    { key: 'day6', label: 'Day 6', focus: 'Full Body' },
    { key: 'day7', label: 'Day 7', focus: 'Rest & Recovery' },
];

const WorkoutPlans = ({ role }) => {
    const navigate = useNavigate();
    const isMember = role === ROLES.MEMBER;

    // View States
    const [memberActiveTab, setMemberActiveTab] = useState('today');
    const [myPlans, setMyPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [memberActiveDay, setMemberActiveDay] = useState('day1');

    React.useEffect(() => {
        if (isMember) {
            fetchMyPlans();
        }
    }, [isMember]);

    const fetchMyPlans = async () => {
        try {
            setLoadingPlans(true);
            const res = await apiClient.get('/member/workout-plans');
            setMyPlans(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingPlans(false);
        }
    };

    // Trainer States
    const [planName, setPlanName] = useState('');
    const [description, setDescription] = useState('');
    const [activeDay, setActiveDay] = useState('day1');
    const [workoutExercises, setWorkoutExercises] = useState({
        day1: [{ id: Date.now(), name: 'Bench Press', sets: '3', reps: '12', rest: '60', equipment: 'Barbell', notes: 'Focus on form' }],
        day2: [], day3: [], day4: [], day5: [], day6: [], day7: []
    });

    const addExercise = (day) => {
        const newEx = {
            id: Date.now(),
            name: '',
            sets: '',
            reps: '',
            rest: '',
            equipment: '',
            notes: ''
        };
        setWorkoutExercises(prev => ({
            ...prev,
            [day]: [...prev[day], newEx]
        }));
    };

    const updateExercise = (day, id, field, value) => {
        setWorkoutExercises(prev => ({
            ...prev,
            [day]: prev[day].map(ex => ex.id === id ? { ...ex, [field]: value } : ex)
        }));
    };

    const removeExercise = (day, id) => {
        setWorkoutExercises(prev => ({
            ...prev,
            [day]: prev[day].filter(ex => ex.id !== id)
        }));
    };

    // Trainer Templates
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    React.useEffect(() => {
        if (!isMember) {
            fetchTemplates();
        }
    }, [isMember]);

    const fetchTemplates = async () => {
        try {
            setLoadingTemplates(true);
            const res = await apiClient.get('/trainer/workout-plans');
            setTemplates(res.data || []);
        } catch (err) {
            console.error('Failed to fetch templates:', err);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await apiClient.patch(`/trainer/workout-plans/${id}/status`);
            toast.success('Status updated');
            fetchTemplates();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleSaveAsTemplate = async () => {
        if (!planName.trim()) {
            toast.error('Please enter a plan name first');
            return;
        }

        try {
            toast.loading('Saving template...', { id: 'saveTemplate' });

            const payload = {
                clientId: 0,
                name: planName,
                level: 'Intermediate',
                duration: '4 Weeks',
                goal: description || 'General Fitness',
                volume: 'Medium',
                timePerSession: '60 min',
                intensity: 'Medium',
                status: 'Active',
                days: workoutExercises
            };

            await apiClient.post('/trainer/workout-plans', payload);
            toast.success('Template saved successfully', { id: 'saveTemplate' });
            fetchTemplates();
            // Reset form
            setPlanName('');
            setDescription('');
            setWorkoutExercises({
                day1: [{ id: Date.now(), name: 'Bench Press', sets: '3', reps: '12', rest: '60', equipment: 'Barbell', notes: 'Focus on form' }],
                day2: [], day3: [], day4: [], day5: [], day6: [], day7: []
            });
        } catch (error) {
            console.error('Save failed:', error);
            const msg = error.response?.data?.message || 'Failed to save template';
            toast.error(msg, { id: 'saveTemplate' });
        }
    };

    if (isMember) {
        const activePlan = myPlans.length > 0 ? myPlans[0] : null;

        let parsedDays = {};
        if (activePlan && activePlan.days) {
            try {
                parsedDays = JSON.parse(activePlan.days);
            } catch (e) {
                console.error("Error parsing plan days", e);
            }
        }

        // Today's fallback logic
        const currentDayIndex = new Date().getDay(); // 0 is Sunday
        const mapToDayKey = ['day7', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6']; // mapping JS day to day1-7
        const todayKey = mapToDayKey[currentDayIndex];

        const dayToRender = memberActiveTab === 'today' ? todayKey : memberActiveDay;
        const exercisesToRender = parsedDays[dayToRender] || [];
        const dayLabelObj = DAY_LABELS.find(d => d.key === dayToRender);

        return (
            <div className="saas-container h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8 space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 md:pb-8 border-b-2 border-slate-100">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 animate-in zoom-in duration-500 shrink-0">
                            <Dumbbell size={24} className="md:w-8 md:h-8" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-0.5 md:mb-1 truncate">
                                {activePlan ? activePlan.name : 'My Workout'}
                            </h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest shrink-0">
                                    Goal:
                                </span>
                                <span className="px-2 md:px-3 py-0.5 md:py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-indigo-100 truncate">
                                    {activePlan ? activePlan.goal : 'No Plan Assigned'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 max-w-4xl">
                    {/* Tab Switcher: Today's Workout / My Plan */}
                    <div className="p-1 px-1.5 bg-slate-100/50 rounded-2xl w-full sm:w-fit flex items-center gap-1 border border-white shadow-sm shadow-slate-200/50 overflow-x-auto no-scrollbar scrollbar-hide">
                        <button
                            onClick={() => setMemberActiveTab('today')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 whitespace-nowrap ${memberActiveTab === 'today'
                                ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                                }`}
                        >
                            <Zap
                                size={16}
                                className={`transition-colors ${memberActiveTab === 'today' ? 'text-indigo-600' : 'text-slate-400 opacity-60'}`}
                            />
                            Today
                        </button>
                        <button
                            onClick={() => setMemberActiveTab('plan')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 whitespace-nowrap ${memberActiveTab === 'plan'
                                ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                                }`}
                        >
                            <Dumbbell
                                size={16}
                                className={`transition-colors ${memberActiveTab === 'plan' ? 'text-indigo-600' : 'text-slate-400 opacity-60'}`}
                            />
                            Full Plan
                        </button>
                    </div>

                    {memberActiveTab === 'plan' && (
                        <div className="flex overflow-x-auto border-b border-gray-100 bg-[#FCFCFE] rounded-t-xl mb-4">
                            {DAY_LABELS.map((day) => (
                                <button
                                    key={day.key}
                                    onClick={() => setMemberActiveDay(day.key)}
                                    className={`flex-shrink-0 px-6 py-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${memberActiveDay === day.key
                                        ? 'text-indigo-600 border-indigo-600 bg-white'
                                        : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-white/60'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="space-y-6">
                        {loadingPlans ? (
                            <div className="flex justify-center p-10"><Zap className="animate-pulse text-indigo-400" /></div>
                        ) : activePlan ? (
                            <>
                                {/* Today's Workout Card - Progress Info */}
                                <Card className="p-4 md:p-6 border-2 border-slate-100 shadow-sm rounded-3xl bg-white space-y-4 md:space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
                                            {dayLabelObj?.label} — {dayLabelObj?.focus}
                                        </h3>
                                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Current Focus
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 pt-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">To Do: {exercisesToRender.length || 0} Sets</span>
                                        </div>
                                    </div>
                                </Card>

                                {exercisesToRender.length > 0 ? (
                                    <div className="space-y-4">
                                        {exercisesToRender.map((ex, idx) => (
                                            <Card key={idx} className="p-5 border-2 border-slate-50 hover:border-indigo-100 bg-[#FCFCFE] rounded-2xl transition-all">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[12px] font-black text-indigo-600">
                                                            {idx + 1}
                                                        </span>
                                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{ex.name}</h4>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 mt-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sets</p>
                                                        <p className="text-sm font-bold text-slate-800">{ex.sets}</p>
                                                    </div>
                                                    <div className="text-center border-x border-slate-100">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reps</p>
                                                        <p className="text-sm font-bold text-slate-800">{ex.reps}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rest</p>
                                                        <p className="text-sm font-bold text-slate-800">{ex.rest}s</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                                    {ex.equipment && (
                                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                            <Target size={12} /> {ex.equipment}
                                                        </span>
                                                    )}
                                                    {ex.notes && (
                                                        <p className="text-[11px] text-slate-500 italic flex-1 border-l-2 border-indigo-200 pl-3 py-1 bg-white rounded-r-lg">
                                                            "{ex.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="p-6 md:p-10 border-2 border-slate-100 shadow-sm rounded-3xl bg-white">
                                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 shrink-0">
                                                <Info size={24} className="md:w-8 md:h-8" strokeWidth={1.5} />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-[11px] md:text-sm font-black text-slate-900 uppercase tracking-tight">
                                                    Rest Day or No Exercises
                                                </h4>
                                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                                                    There are no routines assigned for this day segment.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card className="p-6 md:p-10 border-2 border-slate-100 shadow-sm rounded-3xl bg-white">
                                <div className="flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 shrink-0">
                                        <Dumbbell size={24} className="md:w-8 md:h-8" strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[11px] md:text-sm font-black text-slate-900 uppercase tracking-tight">
                                            No Active Program Found
                                        </h4>
                                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                                            Contact your trainer or branch admin to generate and assign your new training block!
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Tips Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <Info size={16} />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">💡 Workout Tips</h2>
                        </div>

                        <Card className="p-6 md:p-8 border-2 border-slate-100 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all">
                            <ul className="space-y-4 md:space-y-6">
                                {[
                                    "Warm up for 5-10 minutes before starting your workout",
                                    "Stay hydrated throughout your session",
                                    "Focus on proper form over heavy weights",
                                    "Rest 60-90 seconds between sets",
                                    "Track your progress in the My Progress section"
                                ].map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-3 md:gap-4 group">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 group-hover:bg-white transition-colors" />
                                        </div>
                                        <p className="text-[10px] md:text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-wide">
                                            {tip}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 text-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                                        <Target size={18} className="md:w-5 md:h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest">Pro Tip</p>
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-600 uppercase tracking-tight truncate">Consistency beats intensity.</p>
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

                {/* Templates List */}
                <div className="saas-card p-6 md:p-8 rounded-2xl md:rounded-[32px] bg-white border border-gray-100 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight">Saved Templates</h2>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Reusable training blocks for your branch</p>
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
                                <Dumbbell size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No templates saved yet</p>
                            </div>
                        ) : templates.map((tpl) => (
                            <div key={tpl.id} className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-black text-gray-900 uppercase tracking-tight truncate flex-1">{tpl.name}</h4>
                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border shrink-0 ${tpl.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                        }`}>
                                        {tpl.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    <span className="flex items-center gap-1"><TrendingUp size={12} /> {tpl.level}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Target size={12} /> {tpl.goal}</span>
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
                                        className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan Info Card */}
                <div className="saas-card !p-5 md:!p-8 !mb-8 !rounded-2xl md:!rounded-[32px] bg-white border-gray-100 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight">Plan Builder</h2>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Design customized workout sequences</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSaveAsTemplate}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                            >
                                <BookmarkPlus size={16} />
                                Template
                            </button>
                            <button
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                            >
                                <User size={16} />
                                Assign
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Plan Name <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. Muscle Gain - Phase 1"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                className="w-full h-11 md:h-12 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Description</label>
                            <input
                                type="text"
                                placeholder="Brief protocol overview..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-11 md:h-12 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Workout Builder Section */}
                <div className="saas-card !p-0 !mb-0 !rounded-[32px] bg-white border-gray-100 shadow-sm overflow-hidden">
                    {/* Day Selector Tabs */}
                    <div className="flex overflow-x-auto border-b border-gray-50 bg-[#FCFCFE]">
                        {DAY_LABELS.map((day) => (
                            <button
                                key={day.key}
                                onClick={() => setActiveDay(day.key)}
                                className={`flex-shrink-0 px-8 py-5 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeDay === day.key
                                    ? 'text-indigo-600 border-indigo-600 bg-white'
                                    : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-white/60'
                                    }`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {/* Day Header Info */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Dumbbell size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-tight">
                                        {DAY_LABELS.find(d => d.key === activeDay).label}
                                    </h3>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-0.5">
                                        {DAY_LABELS.find(d => d.key === activeDay).focus}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => addExercise(activeDay)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                            >
                                <Plus size={16} strokeWidth={3} />
                                Add Exercise
                            </button>
                        </div>

                        {/* Exercise Table - Card View on Mobile */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 w-[25%] px-2">Exercise Name</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center px-2">Sets</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center px-2">Reps</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center px-2">Rest (s)</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Equipment</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Notes</th>
                                        <th className="pb-4 w-12 px-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {workoutExercises[activeDay].map((ex) => (
                                        <tr key={ex.id}>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Bench Press"
                                                    value={ex.name}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'name', e.target.value)}
                                                    className="w-full h-11 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all shadow-sm"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={ex.sets}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'sets', e.target.value)}
                                                    className="w-16 h-11 px-2 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all text-center shadow-sm mx-auto"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={ex.reps}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'reps', e.target.value)}
                                                    className="w-16 h-11 px-2 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all text-center shadow-sm mx-auto"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={ex.rest}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'rest', e.target.value)}
                                                    className="w-16 h-11 px-2 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all text-center shadow-sm mx-auto"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    placeholder="Equipment"
                                                    value={ex.equipment}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'equipment', e.target.value)}
                                                    className="w-full h-11 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all shadow-sm"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    placeholder="Notes"
                                                    value={ex.notes}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'notes', e.target.value)}
                                                    className="w-full h-11 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all shadow-sm"
                                                />
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <button
                                                    onClick={() => removeExercise(activeDay, ex.id)}
                                                    className="p-2.5 text-red-100 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View for Builder */}
                        <div className="md:hidden space-y-6">
                            {workoutExercises[activeDay].map((ex, idx) => (
                                <div key={ex.id} className="p-5 border-2 border-slate-50 rounded-2xl bg-[#FCFCFE] space-y-4 relative group">
                                    <div className="flex items-center justify-between">
                                        <span className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100 italic">
                                            {idx + 1}
                                        </span>
                                        <button
                                            onClick={() => removeExercise(activeDay, ex.id)}
                                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Exercise Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Bench Press"
                                                value={ex.name}
                                                onChange={(e) => updateExercise(activeDay, ex.id, 'name', e.target.value)}
                                                className="w-full h-10 px-4 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all shadow-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Sets</label>
                                                <input
                                                    type="text"
                                                    value={ex.sets}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'sets', e.target.value)}
                                                    className="w-full h-10 px-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all text-center shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Reps</label>
                                                <input
                                                    type="text"
                                                    value={ex.reps}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'reps', e.target.value)}
                                                    className="w-full h-10 px-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all text-center shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Rest</label>
                                                <input
                                                    type="text"
                                                    value={ex.rest}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'rest', e.target.value)}
                                                    className="w-full h-10 px-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all text-center shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-1">
                                            <input
                                                type="text"
                                                placeholder="Equipment"
                                                value={ex.equipment}
                                                onChange={(e) => updateExercise(activeDay, ex.id, 'equipment', e.target.value)}
                                                className="w-full h-10 px-4 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all shadow-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Notes"
                                                value={ex.notes}
                                                onChange={(e) => updateExercise(activeDay, ex.id, 'notes', e.target.value)}
                                                className="w-full h-10 px-4 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-indigo-200 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {workoutExercises[activeDay].length === 0 && (
                            <div className="py-12 md:py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100 mt-4">
                                <Dumbbell size={48} strokeWidth={1} className="mb-4 opacity-20" />
                                <p className="text-sm font-bold text-center px-4 uppercase tracking-widest">No exercises added for this day.</p>
                                <button
                                    onClick={() => addExercise(activeDay)}
                                    className="mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                                >
                                    Add your first exercise
                                </button>
                            </div>
                        )}
                    </div>
                </div>
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

export default WorkoutPlans;
