import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Trash2, RefreshCcw, CheckCircle2, ChevronRight, Clock,
    UtensilsCrossed, BookmarkPlus, Info, Leaf, Droplets, Activity,
    Target, X, Save, Shield, BarChart3, Star, Heart, Flame
} from 'lucide-react';
import { ROLES } from '../../../config/roles';
import toast from 'react-hot-toast';
import apiClient from '../../../api/apiClient';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF'
};

// Header Banner Component
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 24, padding: '24px 30px',
        boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative', overflow: 'hidden'
    }} className="fu fu1">
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 2 }}>
            <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', flexShrink: 0
            }}>
                <Icon size={28} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '6px 0 0', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
            {actions}
        </div>
    </div>
);

const DietPlans = ({ role }) => {
    const navigate = useNavigate();
    const isMember = role === ROLES.MEMBER;

    const [activePlan, setActivePlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        if (isMember) fetchMemberPlan();
    }, [isMember]);

    const fetchMemberPlan = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/member/diet-plans');
            setActivePlan(res.data && res.data.length > 0 ? res.data[0] : null);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleRequestPlan = async () => {
        try {
            setRequesting(true);
            await apiClient.post('/member/diet-plans/request');
            toast.success('Diet plan requested successfully!');
        } catch (err) { toast.error('Failed to request plan.'); }
        finally { setRequesting(false); }
    };

    if (isMember) {
        if (loading) return (
            <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } } .sp { border: 3px solid ${T.accentMid}; border-top-color: ${T.accent}; animation: spin 0.8s linear infinite; }`}</style>
                <div className="sp" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                <p style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>Analyzing Nutrition Matrix...</p>
            </div>
        );

        let macrosObj = { protein: '0g', carbs: '0g', fat: '0g' };
        let mealsArr = [];
        if (activePlan) {
            try {
                macrosObj = typeof activePlan.macros === 'string' ? JSON.parse(activePlan.macros) : (activePlan.macros || macrosObj);
                mealsArr = typeof activePlan.meals === 'string' ? JSON.parse(activePlan.meals) : (activePlan.meals || []);
            } catch (e) { console.error(e); }
        }

        return (
            <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                    * { box-sizing: border-box; }
                    @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                    .fu { animation: fadeUp 0.38s ease both; }
                `}</style>

                <HeaderBanner 
                    title={activePlan ? activePlan.name : "Nutrition Protocol"} 
                    sub={activePlan ? `Your current diet plan for ${activePlan.target}` : "Request a personalized nutrition protocol from your coach"} 
                    icon={UtensilsCrossed}
                    actions={
                        !activePlan && (
                            <button onClick={handleRequestPlan} disabled={requesting} style={{ background: '#fff', border: 'none', padding: '12px 24px', borderRadius: 14, color: T.accent, fontSize: 11, fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                                {requesting ? 'Requesting...' : 'Request New Plan'}
                            </button>
                        )
                    }
                />

                {activePlan ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 30 }} className="fu">
                        {/* MEAL SCHEDULE */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 4, height: 18, background: T.accent, borderRadius: 4 }} />
                                Your Daily Meals
                            </div>
                            {mealsArr.map((meal, idx) => (
                                <div key={idx} style={{ background: T.surface, borderRadius: 32, border: `1px solid ${T.border}`, padding: 28, display: 'flex', gap: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: '0.3s' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Clock size={28} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div>
                                                <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>{meal.name}</h3>
                                                <p style={{ fontSize: 12, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: '2px 0 0' }}>{meal.time} Schedule</p>
                                            </div>
                                            <div style={{ background: T.greenLight, color: T.green, padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 900 }}>{meal.calories} KCAL</div>
                                        </div>
                                        <p style={{ fontSize: 14, color: T.text, fontWeight: 600, lineHeight: 1.6, background: T.bg, padding: 16, borderRadius: 16, margin: 0, border: `1px solid ${T.border}` }}>
                                            {meal.items || meal.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* MACROS & TIPS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ background: '#1A1533', padding: 32, borderRadius: 32, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                                <h4 style={{ fontSize: 12, fontWeight: 900, color: T.accent2, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>Target Macros</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900 }}>{macrosObj.protein}</div><div style={{ fontSize: 9, fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Protein</div></div>
                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900 }}>{macrosObj.carbs}</div><div style={{ fontSize: 9, fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Carbs</div></div>
                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 900 }}>{macrosObj.fat}</div><div style={{ fontSize: 9, fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Fats</div></div>
                                </div>
                                <div style={{ marginTop: 24, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                                    "{activePlan.notes}"
                                </div>
                            </div>

                            <div style={{ background: T.surface, padding: 32, borderRadius: 32, border: `1px solid ${T.border}` }}>
                                <h4 style={{ fontSize: 14, fontWeight: 900, color: T.text, textTransform: 'uppercase', marginBottom: 20 }}>Nutrition Rules</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {[
                                        "Prioritize high-quality protein",
                                        "Hydrate: 4L water daily",
                                        "Zero processed sugar intake",
                                        "Final meal 3h before rest"
                                    ].map((t, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: 8, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={14} /></div>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>{t}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: T.surface, padding: 80, borderRadius: 40, border: `2px dashed ${T.border}`, textAlign: 'center' }} className="fu">
                        <UtensilsCrossed size={64} color={T.subtle} style={{ marginBottom: 24 }} />
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text, margin: 0 }}>No Active Protocol</h2>
                        <p style={{ fontSize: 14, color: T.muted, maxWidth: 360, margin: '12px auto 30px' }}>Your coach hasn't assigned a nutrition schedule yet. Request one to start your journey.</p>
                        <button onClick={handleRequestPlan} disabled={requesting} style={{ background: T.accent, color: '#fff', border: 'none', padding: '16px 40px', borderRadius: 18, fontSize: 14, fontWeight: 900, cursor: 'pointer', boxShadow: '0 12px 24px rgba(124,92,252,0.2)' }}>
                            {requesting ? 'Initializing...' : 'Initialize Protocol'}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // TRAINER / ADMIN VIEW
    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .box { background: ${T.surface}; borderRadius: 32px; border: 1px solid ${T.border}; padding: 32px; boxShadow: 0 4px 20px rgba(0,0,0,0.02); }
                input, textarea, select { width: 100%; padding: 14px 20px; borderRadius: 14px; border: 1px solid ${T.border}; background: ${T.bg}; fontSize: 14px; fontWeight: 600; color: ${T.text}; outline: none; margin-top: 8px; }
                input:focus, textarea:focus { border-color: ${T.accent}; background: #fff; }
                label { fontSize: 11px; fontWeight: 900; color: ${T.muted}; textTransform: uppercase; letterSpacing: 1px; }
            `}</style>

            <HeaderBanner title="Elite Diet Builder" sub="Design and deploy high-performance nutrition matrices for members" icon={Target} />
            <TrainerDietBuilder />
        </div>
    );
};

const TrainerDietBuilder = () => {
    const navigate = useNavigate();
    const [planName, setPlanName] = useState('');
    const [target, setTarget] = useState('');
    const [duration, setDuration] = useState('4 Weeks');
    const [calories, setCalories] = useState('');
    const [macros, setMacros] = useState({ protein: '', carbs: '', fat: '' });
    const [notes, setNotes] = useState('');
    const [meals, setMeals] = useState([{ id: Date.now(), name: 'Breakfast', time: '08:00 AM', items: '', calories: '', macros: { protein: '', carbs: '', fat: '' } }]);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState([]);

    const fetchTemplates = async () => {
        try {
            const res = await apiClient.get('/trainer/diet-plans');
            setTemplates(res.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchTemplates(); }, []);

    const addMeal = () => setMeals([...meals, { id: Date.now(), name: '', time: '', items: '', calories: '', macros: { protein: '', carbs: '', fat: '' } }]);
    const removeMeal = (id) => setMeals(meals.filter(m => m.id !== id));
    const updateMeal = (id, f, v) => setMeals(meals.map(m => m.id === id ? { ...m, [f]: v } : m));

    const handleSave = async () => {
        if (!planName) return toast.error('Enter plan name');
        try {
            setSaving(true);
            await apiClient.post('/trainer/diet-plans', {
                name: planName, target, duration, calories: parseInt(calories) || 0,
                macros: JSON.stringify(macros), meals: JSON.stringify(meals), notes, status: 'Active'
            });
            toast.success('Template Saved!'); fetchTemplates();
        } catch (e) { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="fu">
            {/* LIBRARY */}
            <div className="box">
                <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, marginBottom: 20 }}>Saved Protocols</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    {templates.map((tpl, i) => (
                        <div key={i} style={{ padding: 24, borderRadius: 24, border: `1px solid ${T.border}`, background: T.surface, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{tpl.name}</div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, textTransform: 'uppercase', marginTop: 4 }}>{tpl.target}</div>
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, fontWeight: 800 }}>{tpl.calories} KCAL</span>
                                <button onClick={() => navigate('/trainer/members/assigned')} style={{ border: 'none', background: 'none', color: T.accent, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>ASSIGN MEMBER</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BUILDER */}
            <div className="box" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text }}>Protocol Architect</h3>
                    <button onClick={handleSave} disabled={saving} style={{ background: T.accent, color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 14, fontSize: 13, fontWeight: 900, cursor: 'pointer' }}>
                        {saving ? 'Saving...' : 'Authorize Template'}
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div><label>Plan Title</label><input placeholder="e.g. Lean Bulk v1" value={planName} onChange={e => setPlanName(e.target.value)} /></div>
                    <div><label>Target Goal</label><input placeholder="e.g. Hypertrophy" value={target} onChange={e => setTarget(e.target.value)} /></div>
                    <div><label>Daily Calorie Target</label><input type="number" value={calories} onChange={e => setCalories(e.target.value)} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div><label>Protein</label><input placeholder="g" value={macros.protein} onChange={e => setMacros({...macros, protein: e.target.value})} /></div>
                        <div><label>Carbs</label><input placeholder="g" value={macros.carbs} onChange={e => setMacros({...macros, carbs: e.target.value})} /></div>
                        <div><label>Fats</label><input placeholder="g" value={macros.fat} onChange={e => setMacros({...macros, fat: e.target.value})} /></div>
                    </div>
                </div>
                <div style={{ marginTop: 10 }}>
                    <label>Coach Directives</label>
                    <textarea rows="3" placeholder="Hydration rules, banned foods..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Meal Modules</h4>
                        <button onClick={addMeal} style={{ background: T.bg, border: `1px solid ${T.border}`, padding: '8px 16px', borderRadius: 10, fontSize: 11, fontWeight: 900, cursor: 'pointer' }}>+ ADD MEAL</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {meals.map((m, i) => (
                            <div key={i} style={{ padding: 24, borderRadius: 24, background: T.bg, border: `1px solid ${T.border}`, position: 'relative' }}>
                                <button onClick={() => removeMeal(m.id)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: T.rose, cursor: 'pointer' }}><Trash2 size={18} /></button>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                                    <div><label>MEAL NAME</label><input value={m.name} onChange={e => updateMeal(m.id, 'name', e.target.value)} /></div>
                                    <div><label>TIME</label><input value={m.time} onChange={e => updateMeal(m.id, 'time', e.target.value)} /></div>
                                    <div><label>CALORIES</label><input value={m.calories} onChange={e => updateMeal(m.id, 'calories', e.target.value)} /></div>
                                </div>
                                <label>FOOD INVENTORY & ITEMS</label>
                                <textarea rows="2" placeholder="e.g. 150g Chicken, 1 Cup Rice" value={m.items} onChange={e => updateMeal(m.id, 'items', e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DietPlans;
