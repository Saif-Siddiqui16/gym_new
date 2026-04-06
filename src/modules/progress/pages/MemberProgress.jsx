import React, { useState, useEffect } from 'react';
import {
    Activity, TrendingUp, Scale, Percent, Calendar, Ruler, Dumbbell, 
    Utensils, Search, ChevronRight, Target, Zap, Loader2, Plus, X, Check, 
    ArrowUp, ArrowDown, Minus, ClipboardList, RefreshCw, LayoutDashboard,
    Flame, Sparkles, Trophy, UserCheck
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useBranchContext } from '../../../context/BranchContext';
import { ROLES } from '../../../config/roles';
import CustomDropdown from '../../../components/common/CustomDropdown';
import RightDrawer from '../../../components/common/RightDrawer';
import Loader from '../../../components/common/Loader';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF', dark: '#0D0A1F'
};

const SectionHeader = ({ icon: Icon, title, subtitle, color = T.accent }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>{subtitle}</p>}
        </div>
    </div>
);

const PremiumCard = ({ children, style = {}, index = 0 }) => (
    <div 
        style={{
            background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`,
            padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`,
            ...style
        }}
    >
        {children}
    </div>
);

const MetricCard = ({ title, value, icon: Icon, color, bg, subtitle, trend, index }) => (
    <div 
        style={{
            background: T.surface, padding: 24, borderRadius: 24, border: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column', gap: 16, flex: 1,
            animation: `fadeUp 0.4s ease both ${0.3 + index * 0.05}s`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, background: trend.up ? T.roseLight : T.greenLight, color: trend.up ? T.rose : T.green, fontSize: 10, fontWeight: 900 }}>
                    {trend.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {Math.abs(trend.diff)}
                </div>
            )}
        </div>
        <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle, textTransform: 'uppercase', marginTop: 4 }}>{subtitle}</div>
        </div>
    </div>
);

const MacroChip = ({ label, value, unit, color, icon: Icon }) => {
    const colors = {
        amber: { bg: T.amberLight, border: T.amber, text: T.amber },
        blue: { bg: T.blueLight, border: T.blue, text: T.blue },
        emerald: { bg: T.greenLight, border: T.green, text: T.green },
        rose: { bg: T.roseLight, border: T.rose, text: T.rose },
    };
    const c = colors[color] || colors.blue;
    return (
        <div style={{ padding: 16, borderRadius: 16, background: c.bg, border: `1px solid ${c.text}20`, textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 9, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>{value}<span style={{ fontSize: 12, opacity: 0.6, marginLeft: 2 }}>{unit}</span></p>
        </div>
    );
};

const FormField = ({ label, type, value, onChange, placeholder, step }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 4 }}>{label}</label>
        <input 
            type={type} step={step} value={value} placeholder={placeholder} 
            onChange={e => onChange(e.target.value)}
            style={{
                width: '100%', height: 50, borderRadius: 14, background: '#fff', 
                border: `2px solid ${T.border}`, padding: '0 16px', fontSize: 14, 
                fontWeight: 700, color: T.text, outline: 'none', transition: '0.2s'
            }}
        />
    </div>
);

const MemberProgress = () => {
    const { role, user: authUser } = useAuth();
    const { selectedBranch } = useBranchContext();
    const [activeTab, setActiveTab] = useState('Measurements');
    const [loading, setLoading] = useState(true);
    const [membersLoading, setMembersLoading] = useState(false);
    const [progressData, setProgressData] = useState({ logs: [], targets: {} });
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [dietPlans, setDietPlans] = useState([]);
    const [members, setMembers] = useState([]);
    const [searchParams] = useSearchParams();
    const urlMemberId = searchParams.get('memberId') || searchParams.get('memberid');
    const [selectedMemberId, setSelectedMemberId] = useState(urlMemberId || '');
    const [showLogModal, setShowLogModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [logForm, setLogForm] = useState({
        weight: '', bodyFat: '', notes: '',
        date: new Date().toISOString().split('T')[0],
        measurements: { chest: '', waist: '', hips: '', arms: '', thighs: '' }
    });

    const isManagement = role === ROLES.BRANCH_ADMIN || role === ROLES.MANAGER || role === ROLES.SUPER_ADMIN || role === ROLES.TRAINER;

    const fetchMembers = async () => {
        if (!isManagement) return;
        try {
            setMembersLoading(true);
            const res = await apiClient.get('/admin/members', {
                params: { limit: 1000, branchId: selectedBranch === 'all' ? '' : selectedBranch }
            });
            const data = res.data.data || [];
            setMembers(data);
            if (data.length > 0) {
                const memberInList = urlMemberId ? data.find(m => m.id.toString() === urlMemberId) : null;
                const currentInList = selectedMemberId ? data.find(m => m.id.toString() === selectedMemberId) : null;
                if (memberInList) setSelectedMemberId(urlMemberId);
                else if (!currentInList) setSelectedMemberId(data[0].id.toString());
                else fetchAll();
            } else {
                setSelectedMemberId(''); setProgressData({ logs: [], targets: {} }); setLoading(false);
            }
        } catch (err) { console.error('Failed to fetch members', err); setLoading(false); }
        finally { setMembersLoading(false); }
    };

    useEffect(() => {
        if (isManagement) fetchMembers();
        else if (role) setLoading(false);
    }, [selectedBranch, isManagement, role]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const queryParams = isManagement ? (selectedMemberId ? { memberId: selectedMemberId } : {}) : {};
            const [progressRes, workoutRes, dietRes] = await Promise.allSettled([
                apiClient.get('/member/progress', { params: queryParams }),
                apiClient.get('/member/workout-plans', { params: queryParams }),
                apiClient.get('/member/diet-plans', { params: queryParams })
            ]);
            if (progressRes.status === 'fulfilled') setProgressData(progressRes.value.data);
            else setProgressData({ logs: [], targets: {} });
            if (workoutRes.status === 'fulfilled') setWorkoutPlans(workoutRes.value.data || []);
            else setWorkoutPlans([]);
            if (dietRes.status === 'fulfilled') setDietPlans(dietRes.value.data || []);
            else setDietPlans([]);
        } catch (err) { toast.error('Failed to load dashboard'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!isManagement) fetchAll();
        else if (selectedMemberId) fetchAll();
    }, [selectedMemberId, isManagement]);

    const handleLogSubmit = async (e) => {
        if (e) e.preventDefault();
        const targetMemberId = isManagement ? selectedMemberId : null;
        if (isManagement && !targetMemberId) return toast.error('Check member selection');
        setSubmitting(true);
        try {
            await apiClient.post('/member/progress', { ...logForm, memberId: targetMemberId });
            toast.success('Progress logged!');
            setShowLogModal(false);
            setLogForm({ weight: '', bodyFat: '', notes: '', date: new Date().toISOString().split('T')[0], measurements: { chest: '', waist: '', hips: '', arms: '', thighs: '' } });
            fetchAll();
        } catch (err) { toast.error('Update failed'); }
        finally { setSubmitting(false); }
    };

    const latestLog = progressData.logs?.length > 0 ? progressData.logs[progressData.logs.length - 1] : null;
    const prevLog = progressData.logs?.length > 1 ? progressData.logs[progressData.logs.length - 2] : null;
    
    const getTrend = (field) => {
        if (!latestLog || !prevLog) return null;
        const curr = parseFloat(latestLog[field]), prev = parseFloat(prevLog[field]);
        if (isNaN(curr) || isNaN(prev)) return null;
        return { diff: (curr - prev).toFixed(1), up: curr > prev };
    };

    const curWeight = latestLog?.weight ? `${parseFloat(latestLog.weight).toFixed(1)} kg` : '--';
    const curBF = latestLog?.bodyFat ? `${parseFloat(latestLog.bodyFat).toFixed(1)}%` : '--';
    const updAt = latestLog ? new Date(latestLog.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Pending';

    let msrs = {};
    try { msrs = typeof latestLog?.measurements === 'string' ? JSON.parse(latestLog.measurements) : (latestLog?.measurements || {}); }
    catch { msrs = {}; }

    const tabs = ['Measurements', 'Workout Plan', 'Diet Plan'];

    if (loading) return <Loader message="Analyzing your evolution..." />;

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                .animate-fadeIn { animation: fadeUp 0.4s ease both; }
            `}</style>

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="animate-fadeIn">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <TrendingUp size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>{isManagement ? 'Member Evolution' : 'My Fitness Progress'}</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>Analyze statistics, workout results and body changes</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                     {isManagement && (
                        <div style={{ width: 300 }}>
                            <CustomDropdown
                                options={members.map(m => ({ value: m.id.toString(), label: `${m.name} (${m.memberId})` }))}
                                value={selectedMemberId} onChange={setSelectedMemberId} searchEnabled={true}
                            />
                        </div>
                    )}
                    <button onClick={() => setShowLogModal(true)} style={{ padding: '0 24px', height: 44, background: '#fff', color: T.accent, borderRadius: 14, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={18} /> Log Data</button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* KPI STATS */}
                <div style={{ display: 'flex', gap: 24 }}>
                    <MetricCard title="Weight" value={curWeight} icon={Scale} color={T.accent} bg={T.accentLight} subtitle="Last Record" trend={getTrend('weight')} index={0} />
                    <MetricCard title="Body Fat" value={curBF} icon={Percent} color={T.amber} bg={T.amberLight} subtitle="Overall Composition" trend={getTrend('bodyFat')} index={1} />
                    <MetricCard title="Chest Size" value={msrs.chest ? `${msrs.chest} cm` : '--'} icon={Ruler} color={T.green} bg={T.greenLight} subtitle="Target: Lean" index={2} />
                    <MetricCard title="Last Log" value={updAt} icon={Calendar} color={T.blue} bg={T.blueLight} subtitle="Update Status" index={3} />
                </div>

                {/* TABS VIEW */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fadeIn">
                    <div style={{ display: 'flex', gap: 12, padding: 6, background: 'rgba(124,92,252,0.04)', borderRadius: 18, alignSelf: 'flex-start', border: `1px solid ${T.bg}` }}>
                         {tabs.map(tab => (
                            <button 
                                key={tab} onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '10px 24px', borderRadius: 12, border: 'none',
                                    background: activeTab === tab ? '#fff' : 'transparent',
                                    color: activeTab === tab ? T.accent : T.muted,
                                    fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    cursor: 'pointer', transition: '0.2s',
                                    boxShadow: activeTab === tab ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
                        {activeTab === 'Measurements' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                
                                {progressData.logs.length === 0 ? (
                                    <PremiumCard index={0} style={{ padding: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ opacity: 0.1, marginBottom: 20 }}><Activity size={80} /></div>
                                        <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text }}>No Evolutionary Data</h3>
                                        <p style={{ color: T.muted, fontWeight: 700, marginTop: 4 }}>Begin your journey by logging your first body stats.</p>
                                        <button onClick={() => setShowLogModal(true)} style={{ marginTop: 24, padding: '12px 32px', background: T.accent, color: '#fff', borderRadius: 12, border: 'none', fontWeight: 900, cursor: 'pointer' }}>START TRACKING</button>
                                    </PremiumCard>
                                ) : (
                                    <>
                                        {/* RECENT SNAPSHOT */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                                            <PremiumCard index={0}>
                                                <SectionHeader icon={Activity} title="Current Snapshot" subtitle="Latest anatomical data" />
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                                    {['waist', 'hips', 'arms', 'thighs', 'chest'].map((m) => msrs[m] && (
                                                        <div key={m} style={{ padding: 20, borderRadius: 20, background: T.bg, border: `1px solid ${T.border}` }}>
                                                            <p style={{ fontSize: 9, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 4 }}>{m}</p>
                                                            <p style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>{msrs[m]} <span style={{ fontSize: 11, opacity: 0.5 }}>cm</span></p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </PremiumCard>
                                            <PremiumCard index={1} style={{ background: T.dark, border: 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.1)', color: '#FFE16A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trophy size={20} /></div>
                                                    <div>
                                                        <h4 style={{ fontSize: 13, fontWeight: 900, color: '#fff', textTransform: 'uppercase', margin: 0 }}>Fitness Goal</h4>
                                                        <p style={{ fontSize: 16, fontWeight: 900, color: '#FFE16A', margin: 0 }}>{progressData.targets?.goal || 'Maintain Balance'}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 12 }}>
                                                    {progressData.targets?.weight && <div style={{ flex: 1, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                                                        <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', margin: '0 0 4px' }}>Target Wt</p>
                                                        <p style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>{progressData.targets.weight}kg</p>
                                                    </div>}
                                                    {progressData.targets?.bodyFat && <div style={{ flex: 1, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                                                        <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', margin: '0 0 4px' }}>Target BF</p>
                                                        <p style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>{progressData.targets.bodyFat}%</p>
                                                    </div>}
                                                </div>
                                            </PremiumCard>
                                        </div>

                                        {/* TABLE LOGS */}
                                        <PremiumCard index={2}>
                                            <SectionHeader icon={ClipboardList} title="Evolution History" subtitle="Full track record" />
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ textAlign: 'left', borderBottom: `2px solid ${T.bg}` }}>
                                                            <th style={{ padding: '16px 20px', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>Timeline</th>
                                                            <th style={{ padding: '16px 20px', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>Weight (KG)</th>
                                                            <th style={{ padding: '16px 20px', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>Body Fat (%)</th>
                                                            <th style={{ padding: '16px 20px', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>Trainer Observations</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {[...progressData.logs].reverse().map((log, i) => (
                                                            <tr key={log.id} style={{ borderBottom: `1px solid ${T.bg}`, transition: '0.2s' }}>
                                                                <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 800, color: T.text }}>{new Date(log.date).toLocaleDateString('en-GB')}</td>
                                                                <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 900, color: T.accent }}>{log.weight || '--'}</td>
                                                                <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 900, color: T.amber }}>{log.bodyFat || '--'}%</td>
                                                                <td style={{ padding: '16px 20px', fontSize: 12, fontWeight: 600, color: T.muted }}>{log.notes || '--'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </PremiumCard>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'Workout Plan' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {workoutPlans.length === 0 ? (
                                    <PremiumCard index={0} style={{ padding: 60, textAlign: 'center', opacity: 0.7 }}>
                                         <Dumbbell size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                         <h4 style={{ fontSize: 15, fontWeight: 900, color: T.text }}>No Assigned Workout Routine</h4>
                                         <p style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Contact your PT to initialize a focused workout program.</p>
                                    </PremiumCard>
                                ) : workoutPlans.map((plan, idx) => (
                                    <PremiumCard key={plan.id} index={idx}>
                                        <SectionHeader icon={Dumbbell} title={plan.title || 'Training Program'} subtitle="Dynamic Routine" color={T.accent} />
                                        {plan.description && <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>{plan.description}</p>}
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                            {Object.entries(typeof plan.days === 'string' ? JSON.parse(plan.days) : (plan.days || {})).map(([day, exrs]) => (
                                                <div key={day} style={{ padding: 24, borderRadius: 20, background: T.bg, border: `1px solid ${T.border}` }}>
                                                    <h4 style={{ fontSize: 11, fontWeight: 900, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{day} Schedule</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {exrs.map((e, i) => (
                                                            <div key={i} style={{ padding: '12px 16px', borderRadius: 12, background: '#fff', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{e.name || e.exercise}</span>
                                                                <span style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>{e.sets} Sets × {e.reps}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </PremiumCard>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Diet Plan' && (
                             <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {dietPlans.length === 0 ? (
                                    <PremiumCard index={0} style={{ padding: 60, textAlign: 'center', opacity: 0.7 }}>
                                         <Utensils size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                         <h4 style={{ fontSize: 15, fontWeight: 900, color: T.text }}>No Nutrition Plan Assigned</h4>
                                         <p style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Fuel your results with a tailored nutrition strategy.</p>
                                    </PremiumCard>
                                ) : dietPlans.map((plan, idx) => (
                                    <PremiumCard key={plan.id} index={idx}>
                                        <SectionHeader icon={Utensils} title={plan.title || 'Nutrition Blueprint'} subtitle="Daily Macros & Meals" color={T.amber} />
                                        
                                        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                            <MacroChip label="Calories" value={plan.calories || 0} unit="KCAL" color="amber" />
                                            <MacroChip label="Protein" value={plan.protein || 0} unit="G" color="blue" />
                                            <MacroChip label="Carbs" value={plan.carbs || 0} unit="G" color="emerald" />
                                            <MacroChip label="Fats" value={plan.fat || 0} unit="G" color="rose" />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            { (typeof plan.meals === 'string' ? JSON.parse(plan.meals) : (plan.meals || [])).map((m, i) => (
                                                <div key={i} style={{ padding: '16px 24px', borderRadius: 16, background: T.amberLight, color: T.amber, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${T.amber}15` }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.amber }} />
                                                        <div>
                                                            <p style={{ fontSize: 14, fontWeight: 900, margin: 0 }}>{m.name || m.meal}</p>
                                                            <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, margin: 0 }}>{m.description}</p>
                                                        </div>
                                                    </div>
                                                    <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.time || 'Schedule'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </PremiumCard>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

             {/* LOG DRAWER */}
            <RightDrawer isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Log Health Evolution" subtitle="Record body metrics">
                <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 4 }}>
                    {isManagement && (
                        <div style={{ padding: 20, background: T.bg, borderRadius: 20 }}>
                            <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Search Member</label>
                            <CustomDropdown options={members.map(m => ({ value: m.id.toString(), label: `${m.name} (${m.memberId})` }))} value={selectedMemberId} onChange={setSelectedMemberId} searchEnabled={true} />
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <FormField label="Current Weight (kg)" type="number" step="0.1" value={logForm.weight} onChange={v => setLogForm({...logForm, weight: v})} placeholder="e.g. 74.5" />
                        <FormField label="Body Fat (%)" type="number" step="0.1" value={logForm.bodyFat} onChange={v => setLogForm({...logForm, bodyFat: v})} placeholder="e.g. 14.5" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                         <p style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Anthropometric Measures (cm)</p>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {['chest', 'waist', 'hips', 'arms', 'thighs'].map(key => (
                                <FormField key={key} label={key} type="number" step="0.1" value={logForm.measurements[key]} onChange={v => setLogForm({...logForm, measurements: { ...logForm.measurements, [key]: v }})} placeholder="cm" />
                            ))}
                         </div>
                    </div>
                    <FormField label="Observation Timeline" type="date" value={logForm.date} onChange={v => setLogForm({...logForm, date: v})} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                         <label style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 4 }}>Field Notes</label>
                         <textarea value={logForm.notes} onChange={e => setLogForm({...logForm, notes: e.target.value})} rows={4} style={{ padding: 16, borderRadius: 16, background: '#fff', border: `2px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.text, outline: 'none', resize: 'none' }} placeholder="Notes about physical state, mood, or energy levels..." />
                    </div>
                    <button type="submit" disabled={submitting} style={{ height: 56, width: '100%', padding: '0 32px', background: T.accent, color: '#fff', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(124,92,252,0.2)' }}>
                        {submitting ? <RefreshCw className="animate-spin" size={20} /> : <Check size={20} />} Commit Record
                    </button>
                </form>
            </RightDrawer>

        </div>
    );
};

export default MemberProgress;
