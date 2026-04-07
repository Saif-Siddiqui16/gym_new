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

    /* ─────────────────────────────────────────────────────────────────────────────
       DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
       ───────────────────────────────────────────────────────────────────────── */
    const T = {
        accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
        border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
        muted: '#7B7A8E', subtle: '#B0ADCC',
        shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
        bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
        cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
    };

    const S = {
        ff: "'Plus Jakarta Sans', sans-serif"
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
            <div style={{ background: T.bg, minHeight: '100vh', padding: '32px 32px 64px', fontFamily: S.ff }} className="fu">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                    @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                    .fu { animation: fadeUp 0.4s ease both }
                    .fu1 { animation-delay: 0.1s }
                    .tab-active { background: #fff !important; color: ${T.accent} !important; border: 1.5px solid ${T.border} !important; box-shadow: 0 4px 12px rgba(124,92,252,0.1) !important; }
                `}</style>

                {/* PREMIUM HEADER BANNER */}
                <div style={{
                    background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: T.bannerShadow, border: `1px solid ${T.border}`,
                    position: 'relative', overflow: 'hidden'
                }} className="fu">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ 
                            width: 64, height: 64, borderRadius: 18, background: T.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 10px 25px -8px ${T.accent}80`
                        }}>
                            <Dumbbell size={30} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>
                                {activePlan ? activePlan.name : 'My Workout'}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                <span style={{ color: T.subtle, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Protocol:</span>
                                <span style={{ padding: '4px 10px', background: '#F0ECFF', color: T.accent, borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {activePlan ? activePlan.goal : 'No Plan Assigned'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ padding: '12px 24px', borderRadius: 16, background: '#F9F8FF', border: `1px solid ${T.border}`, textAlign: 'right' }}>
                            <div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Today's Focus</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{DAY_LABELS.find(d => d.key === todayKey)?.focus || 'Rest Day'}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32, alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="fu1">
                        {/* Tab Switcher */}
                        <div style={{ 
                            display: 'flex', gap: 8, padding: 8, background: '#F1F0F9', borderRadius: 20, width: 'fit-content'
                        }}>
                            <button
                                onClick={() => setMemberActiveTab('today')}
                                style={{
                                    height: 44, padding: '0 24px', borderRadius: 14, border: '1.5px solid transparent',
                                    fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: 8,
                                    background: memberActiveTab === 'today' ? '#fff' : 'transparent',
                                    color: memberActiveTab === 'today' ? T.accent : T.muted,
                                    boxShadow: memberActiveTab === 'today' ? '0 4px 12px rgba(124,92,252,0.1)' : 'none',
                                    border: memberActiveTab === 'today' ? `1.5px solid ${T.border}` : '1.5px solid transparent'
                                }}
                            >
                                <Zap size={16} color={memberActiveTab === 'today' ? T.accent : T.muted} strokeWidth={2.5} /> Today
                            </button>
                            <button
                                onClick={() => setMemberActiveTab('plan')}
                                style={{
                                    height: 44, padding: '0 24px', borderRadius: 14, border: '1.5px solid transparent',
                                    fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: 10,
                                    background: memberActiveTab === 'plan' ? '#fff' : 'transparent',
                                    color: memberActiveTab === 'plan' ? T.accent : T.muted,
                                    boxShadow: memberActiveTab === 'plan' ? '0 4px 12px rgba(124,92,252,0.1)' : 'none',
                                    border: memberActiveTab === 'plan' ? `1.5px solid ${T.border}` : '1.5px solid transparent'
                                }}
                            >
                                <Dumbbell size={18} color={memberActiveTab === 'plan' ? T.accent : T.muted} strokeWidth={2.5} /> Full Plan
                            </button>
                        </div>

                        {memberActiveTab === 'plan' && (
                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
                                {DAY_LABELS.map((day) => (
                                    <button
                                        key={day.key}
                                        onClick={() => setMemberActiveDay(day.key)}
                                        style={{
                                            padding: '12px 20px', borderRadius: 16, background: memberActiveDay === day.key ? T.accent : '#fff',
                                            color: memberActiveDay === day.key ? '#fff' : T.muted,
                                            border: `1px solid ${memberActiveDay === day.key ? T.accent : T.border}`,
                                            fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                                            cursor: 'pointer', transition: '0.3s', whiteSpace: 'nowrap',
                                            boxShadow: memberActiveDay === day.key ? `0 8px 16px ${T.accent}30` : 'none'
                                        }}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {loadingPlans ? (
                                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap className="animate-spin" color={T.accent} size={32} /></div>
                            ) : activePlan ? (
                                <>
                                    {/* Focus Card */}
                                    <div style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accent3})`, padding: 32, borderRadius: 28, color: '#fff', boxShadow: `0 15px 35px -10px ${T.accent}50` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={18} /></div>
                                            <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.9 }}>Current Target</span>
                                        </div>
                                        <h3 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>{dayLabelObj?.label} — {dayLabelObj?.focus}</h3>
                                        <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', opacity: 0.8, marginBottom: 4 }}>Total Blocks</div>
                                                <div style={{ fontSize: 20, fontWeight: 900 }}>{exercisesToRender.length || 0} Sets</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', opacity: 0.8, marginBottom: 4 }}>Time Est.</div>
                                                <div style={{ fontSize: 20, fontWeight: 900 }}>45-60 Min</div>
                                            </div>
                                        </div>
                                    </div>

                                    {exercisesToRender.length > 0 ? (
                                        exercisesToRender.map((ex, idx) => (
                                            <div key={idx} style={{ background: '#fff', borderRadius: 24, border: `1px solid ${T.border}`, padding: 24, boxShadow: T.cardShadow, transition: '0.3s' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F0ECFF', color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>{idx + 1}</div>
                                                        <h4 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>{ex.name}</h4>
                                                    </div>
                                                    {ex.equipment && (
                                                        <div style={{ padding: '6px 14px', borderRadius: 10, background: '#F9F8FF', border: `1px solid ${T.border}`, fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>{ex.equipment}</div>
                                                    )}
                                                </div>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: ex.notes ? 20 : 0 }}>
                                                    <div style={{ padding: 16, borderRadius: 15, background: T.bg, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                                                        <div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginBottom: 4 }}>Sets</div>
                                                        <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{ex.sets}</div>
                                                    </div>
                                                    <div style={{ padding: 16, borderRadius: 15, background: T.bg, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                                                        <div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginBottom: 4 }}>Reps</div>
                                                        <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{ex.reps}</div>
                                                    </div>
                                                    <div style={{ padding: 16, borderRadius: 15, background: T.bg, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                                                        <div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginBottom: 4 }}>Rest</div>
                                                        <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{ex.rest}s</div>
                                                    </div>
                                                </div>

                                                {ex.notes && (
                                                    <div style={{ padding: '12px 16px', borderRadius: 14, background: '#FDFCF4', borderLeft: `3px solid #EAB308`, fontSize: 11, color: '#854D0E', fontWeight: 600, fontStyle: 'italic' }}>
                                                        "{ex.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: 60, background: '#fff', borderRadius: 28, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                                            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F9F8FF', color: T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Info size={32} strokeWidth={1.5} /></div>
                                            <h4 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: '0 0 8px' }}>Rest Day Active</h4>
                                            <p style={{ fontSize: 12, color: T.subtle, margin: 0, fontWeight: 600 }}>Enjoy your recovery session. No routines assigned for this day segment.</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ padding: 80, background: '#fff', borderRadius: 32, border: `2px dashed ${T.border}`, textAlign: 'center' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 24, background: '#F9F8FF', color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', opacity: 0.5 }}><Dumbbell size={40} strokeWidth={1} /></div>
                                    <h4 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: '0 0 10px' }}>No Active Blueprint found</h4>
                                    <p style={{ fontSize: 13, color: T.subtle, margin: 0, fontWeight: 600 }}>Please synch with your trainer to deploy your customized workout plan.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Tips Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: '#fff', borderRadius: 28, border: `1px solid ${T.border}`, padding: 32, boxShadow: T.cardShadow }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={18} /></div>
                                <h2 style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tactical Tips</h2>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {[
                                    "Warm up for 5-10 minutes locally",
                                    "Maintain electrolyte hydration",
                                    "Prioritize form over load",
                                    "Strict 60-90s rest protocols",
                                    "Log sessions in progress portal"
                                ].map((tip, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: 14 }}>
                                        <div style={{ marginTop: 4, width: 6, height: 6, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
                                        <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, margin: 0, lineHeight: 1.5 }}>{tip}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: 40, padding: 24, borderRadius: 20, background: T.bg, border: `1px solid ${T.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <Zap size={14} color={T.accent} />
                                    <span style={{ fontSize: 10, fontWeight: 900, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core Mantra</span>
                                </div>
                                <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0 }}>Consistency beats intensity, always.</p>
                            </div>
                        </div>

                        <div style={{ background: '#fff', borderRadius: 28, border: `1px solid ${T.border}`, padding: 24, textAlign: 'center' }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: T.subtle }}>Need a custom diet plan?</div>
                            <button onClick={() => navigate('/member/diet-plans')} style={{ width: '100%', height: 48, marginTop: 16, borderRadius: 14, background: '#F0ECFF', color: T.accent, border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', transition: '0.3s' }}>View Nutrition Strategy</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className=" bg-[#FBFBFE] min-h-screen font-sans">
            <div className="max-w-full mx-auto">

                {/* Templates List */}
                <div className="saas-card mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="section-title mb-0">
                            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                                <BookmarkPlus size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-title">Saved Templates</h2>
                                <p className="page-subtitle text-[10px] mt-1">Reusable training blocks for your branch</p>
                            </div>
                        </div>
                        <button onClick={fetchTemplates} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                            <RefreshCcw size={18} className={loadingTemplates ? 'animate-spin' : ''} />
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
                            <div key={tpl.id} className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-violet-100 hover:shadow-md transition-all group">
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
                                        className="px-4 py-1.5 bg-primary-light text-primary rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan Info Card */}
                <div className="saas-card mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-light pb-6 mb-8">
                        <div className="section-title mb-0">
                             <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-title">Plan Builder</h2>
                                <p className="page-subtitle text-[10px] mt-1">Design customized workout sequences</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSaveAsTemplate}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                            >
                                <BookmarkPlus size={16} />
                                Template
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
                                className="w-full h-11 md:h-12 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Description</label>
                            <input
                                type="text"
                                placeholder="Brief protocol overview..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-11 md:h-12 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
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
                                    ? 'text-primary border-primary bg-white'
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
                                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
                                    <Dumbbell size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-tight">
                                        {DAY_LABELS.find(d => d.key === activeDay).label}
                                    </h3>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-0.5">
                                        {DAY_LABELS.find(d => d.key === activeDay).focus}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => addExercise(activeDay)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary-light text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-100 transition-all"
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
                                                    className="w-full h-11 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={ex.sets}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'sets', e.target.value)}
                                                    className="w-16 h-11 px-2 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-violet-200 transition-all text-center shadow-sm mx-auto"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={ex.reps}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'reps', e.target.value)}
                                                    className="w-16 h-11 px-2 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-violet-200 transition-all text-center shadow-sm mx-auto"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={ex.rest}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'rest', e.target.value)}
                                                    className="w-16 h-11 px-2 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-violet-200 transition-all text-center shadow-sm mx-auto"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    placeholder="Equipment"
                                                    value={ex.equipment}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'equipment', e.target.value)}
                                                    className="w-full h-11 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    placeholder="Notes"
                                                    value={ex.notes}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'notes', e.target.value)}
                                                    className="w-full h-11 px-4 bg-[#F9FAFB] border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
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
                                        <span className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-[10px] font-black text-primary border border-violet-100 italic">
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
                                                className="w-full h-10 px-4 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Sets</label>
                                                <input
                                                    type="text"
                                                    value={ex.sets}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'sets', e.target.value)}
                                                    className="w-full h-10 px-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all text-center shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Reps</label>
                                                <input
                                                    type="text"
                                                    value={ex.reps}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'reps', e.target.value)}
                                                    className="w-full h-10 px-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all text-center shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Rest</label>
                                                <input
                                                    type="text"
                                                    value={ex.rest}
                                                    onChange={(e) => updateExercise(activeDay, ex.id, 'rest', e.target.value)}
                                                    className="w-full h-10 px-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-200 transition-all text-center shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-1">
                                            <input
                                                type="text"
                                                placeholder="Equipment"
                                                value={ex.equipment}
                                                onChange={(e) => updateExercise(activeDay, ex.id, 'equipment', e.target.value)}
                                                className="w-full h-10 px-4 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Notes"
                                                value={ex.notes}
                                                onChange={(e) => updateExercise(activeDay, ex.id, 'notes', e.target.value)}
                                                className="w-full h-10 px-4 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-violet-200 transition-all shadow-sm"
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
                                    className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                >
                                    Add your first exercise
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutPlans;
