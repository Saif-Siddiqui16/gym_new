import React, { useState, useEffect } from 'react';
import {
    Activity,
    TrendingUp,
    Scale,
    Percent,
    Calendar,
    Ruler,
    Dumbbell,
    Utensils,
    Search,
    ChevronRight,
    Target,
    Zap,
    Loader2,
    Plus,
    X,
    Check,
    ArrowUp,
    ArrowDown,
    Minus,
    ClipboardList
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import StatsCard from '../../dashboard/components/StatsCard';
import DashboardGrid from '../../dashboard/components/DashboardGrid';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useBranchContext } from '../../../context/BranchContext';
import { ROLES } from '../../../config/roles';
import CustomDropdown from '../../../components/common/CustomDropdown';
import RightDrawer from '../../../components/common/RightDrawer';

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
        weight: '',
        bodyFat: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        measurements: { chest: '', waist: '', hips: '', arms: '', thighs: '' }
    });

    const isManagement = role === ROLES.BRANCH_ADMIN || role === ROLES.MANAGER || role === ROLES.SUPER_ADMIN || role === ROLES.TRAINER;

    const fetchMembers = async () => {
        if (!isManagement) return;
        try {
            setMembersLoading(true);
            const res = await apiClient.get('/admin/members', {
                params: {
                    limit: 1000,
                    branchId: selectedBranch === 'all' ? '' : selectedBranch
                }
            });
            const data = res.data.data || [];
            setMembers(data);

            if (data.length > 0) {
                const memberInList = urlMemberId ? data.find(m => m.id.toString() === urlMemberId) : null;
                const currentInList = selectedMemberId ? data.find(m => m.id.toString() === selectedMemberId) : null;

                if (memberInList) {
                    setSelectedMemberId(urlMemberId);
                } else if (!currentInList) {
                    setSelectedMemberId(data[0].id.toString());
                } else {
                    fetchAll();
                }
            } else {
                setSelectedMemberId('');
                setProgressData({ logs: [], targets: {} });
                setLoading(false);
            }
        } catch (err) {
            console.error('Failed to fetch members', err);
            setLoading(false);
        } finally {
            setMembersLoading(false);
        }
    };

    useEffect(() => {
        if (isManagement) {
            fetchMembers();
        } else if (role) {
            setLoading(false);
        }
    }, [selectedBranch, isManagement, role]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const queryParams = isManagement ? (selectedMemberId ? { memberId: selectedMemberId } : {}) : {};

            console.log('MemberProgress Fetching All Data:', {
                role,
                isManagement,
                selectedMemberId,
                queryParams
            });

            const [progressRes, workoutRes, dietRes] = await Promise.allSettled([
                apiClient.get('/member/progress', { params: queryParams }),
                apiClient.get('/member/workout-plans', { params: queryParams }),
                apiClient.get('/member/diet-plans', { params: queryParams })
            ]);

            if (progressRes.status === 'rejected') {
                console.error('Progress API Failed:', progressRes.reason);
                toast.error('Failed to load progress logs');
            }
            if (workoutRes.status === 'rejected') {
                console.error('Workout API Failed:', workoutRes.reason);
                toast.error('Failed to load workout plans');
            }
            if (dietRes.status === 'rejected') {
                console.error('Diet API Failed:', dietRes.reason);
                toast.error('Failed to load diet plans');
            }

            if (progressRes.status === 'fulfilled') setProgressData(progressRes.value.data);
            else setProgressData({ logs: [], targets: {} });

            if (workoutRes.status === 'fulfilled') {
                console.log('Workout plans received:', workoutRes.value.data);
                setWorkoutPlans(workoutRes.value.data || []);
            } else setWorkoutPlans([]);

            if (dietRes.status === 'fulfilled') {
                console.log('Diet plans received:', dietRes.value.data);
                setDietPlans(dietRes.value.data || []);
            } else setDietPlans([]);
        } catch (err) {
            console.error('Critical failure in fetchAll:', err);
            toast.error('Failed to load progress dashboard');
            setProgressData({ logs: [], targets: {} });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('MemberProgress selectedMemberId changed:', selectedMemberId);
        if (!isManagement) {
            fetchAll();
        } else if (selectedMemberId) {
            fetchAll();
        }
    }, [selectedMemberId, isManagement]);

    const handleLogSubmit = async (e) => {
        e.preventDefault();

        const targetMemberId = isManagement ? selectedMemberId : null;
        if (isManagement && !targetMemberId) {
            toast.error('Please select a member first');
            return;
        }

        setSubmitting(true);
        try {
            await apiClient.post('/member/progress', {
                weight: logForm.weight || null,
                bodyFat: logForm.bodyFat || null,
                notes: logForm.notes,
                date: logForm.date,
                measurements: logForm.measurements,
                memberId: targetMemberId
            });
            toast.success('Progress logged successfully!');
            setShowLogModal(false);
            setLogForm({
                weight: '', bodyFat: '', notes: '',
                date: new Date().toISOString().split('T')[0],
                measurements: { chest: '', waist: '', hips: '', arms: '', thighs: '' }
            });
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to log progress');
        } finally {
            setSubmitting(false);
        }
    };

    const latestLog = progressData.logs?.length > 0 ? progressData.logs[progressData.logs.length - 1] : null;
    const prevLog = progressData.logs?.length > 1 ? progressData.logs[progressData.logs.length - 2] : null;

    const currentWeight = latestLog?.weight ? `${parseFloat(latestLog.weight).toFixed(1)} kg` : '-- kg';
    const currentBodyFat = latestLog?.bodyFat ? `${parseFloat(latestLog.bodyFat).toFixed(1)}%` : '--%';
    const lastUpdated = latestLog ? new Date(latestLog.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'No data';

    let measurements = {};
    if (latestLog?.measurements) {
        try { measurements = typeof latestLog.measurements === 'string' ? JSON.parse(latestLog.measurements) : latestLog.measurements; }
        catch { measurements = {}; }
    }
    const chest = measurements?.chest ? `${measurements.chest} cm` : '-- cm';

    const stats = [
        { title: 'Weight', value: currentWeight, icon: Scale, color: 'primary' },
        { title: 'Chest/Height', value: chest, icon: Ruler, color: 'success' },
        { title: 'Body Fat', value: currentBodyFat, icon: Percent, color: 'warning' },
        { title: 'Last Updated', value: lastUpdated, icon: Calendar, color: 'info' }
    ];

    const tabs = ['Measurements', 'Workout Plan', 'Diet Plan'];

    const getTrend = (field) => {
        if (!latestLog || !prevLog) return null;
        const curr = parseFloat(latestLog[field]);
        const prev = parseFloat(prevLog[field]);
        if (isNaN(curr) || isNaN(prev)) return null;
        const diff = (curr - prev).toFixed(1);
        return { diff, up: curr > prev };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center ">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="saas-container   space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b-2 border-slate-100">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-violet-100">
                        <TrendingUp size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
                            {isManagement ? 'Member Progress' : 'My Progress'}
                        </h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                            {isManagement ? 'Analyze fitness results' : 'Track your fitness journey'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {progressData.targets?.goal && (
                        <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                            <Target size={16} className="text-emerald-600" />
                            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">{progressData.targets.goal}</span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowLogModal(true)}
                        className="flex items-center gap-2 h-11 px-6 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-100 hover:bg-primary-hover transition-all active:scale-95"
                    >
                        <Plus size={16} /> Log Progress
                    </button>
                    {isManagement && (
                        <div className="w-full sm:w-64">
                            <CustomDropdown
                                options={members.map(m => ({ value: m.id.toString(), label: `${m.name} (${m.memberId})` }))}
                                value={selectedMemberId}
                                onChange={setSelectedMemberId}
                                placeholder="Change Member View"
                                searchEnabled={true}
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Section */}
            <DashboardGrid>
                {stats.map((stat, idx) => (
                    <StatsCard key={idx} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} isEarningsLayout={true} />
                ))}
            </DashboardGrid>

            {/* Tabs */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-fit border border-slate-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                                ? 'bg-white text-primary shadow-md ring-1 ring-slate-200'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* ── MEASUREMENTS TAB ── */}
                    {activeTab === 'Measurements' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                                        <Target size={16} />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">My Measurements</h2>
                                </div>
                                <span className="text-xs font-bold text-slate-400">{progressData.logs?.length || 0} entries logged</span>
                            </div>

                            {progressData.logs?.length === 0 ? (
                                <Card className="p-16 border-2 border-slate-100 shadow-2xl shadow-slate-100/20 rounded-[2.5rem] bg-white flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-100 mb-8">
                                        <Search size={40} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-400 tracking-tight uppercase mb-3">No Data Available</h3>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-8">Start tracking your progress today</p>
                                    <button onClick={() => setShowLogModal(true)} className="h-12 px-8 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-100 hover:bg-primary-hover transition-all flex items-center gap-2">
                                        <Plus size={16} /> Log First Entry
                                    </button>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {latestLog && (
                                        <Card className="p-8 border-2 border-slate-100 shadow-xl rounded-[2rem] bg-white">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="font-black text-slate-900 text-lg">Latest Entry</h3>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Date(latestLog.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {latestLog.weight && (
                                                    <MetricCard label="Weight" value={`${parseFloat(latestLog.weight).toFixed(1)} kg`} trend={getTrend('weight')} color="indigo" />
                                                )}
                                                {latestLog.bodyFat && (
                                                    <MetricCard label="Body Fat" value={`${parseFloat(latestLog.bodyFat).toFixed(1)}%`} trend={getTrend('bodyFat')} color="amber" invertTrend />
                                                )}
                                                {measurements?.chest && <MetricCard label="Chest" value={`${measurements.chest} cm`} color="emerald" />}
                                                {measurements?.waist && <MetricCard label="Waist" value={`${measurements.waist} cm`} color="rose" />}
                                                {measurements?.hips && <MetricCard label="Hips" value={`${measurements.hips} cm`} color="purple" />}
                                                {measurements?.arms && <MetricCard label="Arms" value={`${measurements.arms} cm`} color="blue" />}
                                                {measurements?.thighs && <MetricCard label="Thighs" value={`${measurements.thighs} cm`} color="orange" />}
                                            </div>
                                            {latestLog.notes && (
                                                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                                                    <p className="text-sm text-slate-600 font-medium">{latestLog.notes}</p>
                                                </div>
                                            )}
                                        </Card>
                                    )}

                                    {(progressData.targets?.weight || progressData.targets?.bodyFat) && (
                                        <Card className="p-6 border-2 border-emerald-50 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-white">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><Target size={16} /></div>
                                                <h3 className="font-black text-slate-900">Your Targets</h3>
                                            </div>
                                            <div className="flex gap-6 flex-wrap">
                                                {progressData.targets.weight && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Weight</p>
                                                        <p className="text-2xl font-black text-emerald-600">{parseFloat(progressData.targets.weight).toFixed(1)} kg</p>
                                                    </div>
                                                )}
                                                {progressData.targets.bodyFat && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Body Fat</p>
                                                        <p className="text-2xl font-black text-emerald-600">{parseFloat(progressData.targets.bodyFat).toFixed(1)}%</p>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    )}

                                    <Card className="border-2 border-slate-100 rounded-2xl bg-white overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500"><ClipboardList size={16} /></div>
                                            <h3 className="font-black text-slate-900">Progress History</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</th>
                                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Body Fat</th>
                                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[...progressData.logs].reverse().map((log) => (
                                                        <tr key={log.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{log.weight ? `${parseFloat(log.weight).toFixed(1)} kg` : '--'}</td>
                                                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{log.bodyFat ? `${parseFloat(log.bodyFat).toFixed(1)}%` : '--'}</td>
                                                            <td className="px-6 py-4 text-xs text-slate-500 font-medium max-w-xs truncate">{log.notes || '--'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── WORKOUT PLAN TAB ── */}
                    {activeTab === 'Workout Plan' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-1">
                                <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary"><Dumbbell size={16} /></div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Workout Plan</h2>
                            </div>

                            {workoutPlans.length === 0 ? (
                                <Card className="p-16 border-2 border-slate-100 shadow-2xl shadow-slate-100/20 rounded-[2.5rem] bg-white flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6"><Dumbbell size={36} strokeWidth={1} /></div>
                                    <h3 className="text-lg font-black text-slate-400 tracking-tight uppercase mb-2">No Workout Plan Assigned</h3>
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Ask your trainer to create a workout plan for you</p>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {workoutPlans.map((plan) => (
                                        <Card key={plan.id} className="p-8 border-2 border-slate-100 rounded-[2rem] bg-white shadow-xl">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{plan.title || plan.name || 'Workout Plan'}</h3>
                                                    {plan.description && <p className="text-sm text-slate-500 font-medium mt-1">{plan.description}</p>}
                                                </div>
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">{plan.status || 'Active'}</span>
                                            </div>

                                            {plan.days && (() => {
                                                try {
                                                    const daysObj = typeof plan.days === 'string' ? JSON.parse(plan.days) : plan.days;
                                                    const daysWithExercises = Object.entries(daysObj).filter(([_, exercises]) => Array.isArray(exercises) && exercises.length > 0);

                                                    return daysWithExercises.length > 0 ? (
                                                        <div className="space-y-4">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Training Schedule</p>
                                                            {daysWithExercises.map(([dayKey, exercises], dayIdx) => (
                                                                <div key={dayIdx} className="space-y-2">
                                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{dayKey.replace(/([a-z])(\d+)/i, '$1 $2')}</p>
                                                                    {exercises.map((ex, i) => (
                                                                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                                                            <div className="w-7 h-7 rounded-lg bg-violet-100 text-primary flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-black text-slate-900">{ex.name || ex.exercise || 'Exercise'}</p>
                                                                                {(ex.sets || ex.reps) && <p className="text-[10px] font-bold text-slate-400 uppercase">{ex.sets && `${ex.sets} sets`}{ex.reps && ` × ${ex.reps} reps`}</p>}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null;
                                                } catch { return null; }
                                            })()}

                                            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created: {new Date(plan.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── DIET PLAN TAB ── */}
                    {activeTab === 'Diet Plan' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-1">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><Utensils size={16} /></div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Diet Plan</h2>
                            </div>

                            {dietPlans.length === 0 ? (
                                <Card className="p-16 border-2 border-slate-100 shadow-2xl shadow-slate-100/20 rounded-[2.5rem] bg-white flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6"><Utensils size={36} strokeWidth={1} /></div>
                                    <h3 className="text-lg font-black text-slate-400 tracking-tight uppercase mb-2">No Diet Plan Assigned</h3>
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Ask your trainer to create a diet plan for you</p>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {dietPlans.map((plan) => (
                                        <Card key={plan.id} className="p-8 border-2 border-slate-100 rounded-[2rem] bg-white shadow-xl">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{plan.title || plan.name || 'Diet Plan'}</h3>
                                                    {plan.description && <p className="text-sm text-slate-500 font-medium mt-1">{plan.description}</p>}
                                                </div>
                                                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">{plan.status || 'Active'}</span>
                                            </div>

                                            {(plan.calories || plan.protein || plan.carbs || plan.fat) && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                    {plan.calories && <MacroChip label="Calories" value={plan.calories} unit="kcal" color="amber" />}
                                                    {plan.protein && <MacroChip label="Protein" value={plan.protein} unit="g" color="blue" />}
                                                    {plan.carbs && <MacroChip label="Carbs" value={plan.carbs} unit="g" color="emerald" />}
                                                    {plan.fat && <MacroChip label="Fat" value={plan.fat} unit="g" color="rose" />}
                                                </div>
                                            )}

                                            {plan.meals && (() => {
                                                try {
                                                    const meals = typeof plan.meals === 'string' ? JSON.parse(plan.meals) : plan.meals;
                                                    return Array.isArray(meals) && meals.length > 0 ? (
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Meal Schedule</p>
                                                            {meals.map((meal, i) => (
                                                                <div key={i} className="flex items-center gap-3 p-3 bg-amber-50/40 rounded-xl border border-amber-50">
                                                                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-black text-slate-900">{meal.name || meal.meal || 'Meal'}</p>
                                                                        {meal.description && <p className="text-[10px] font-medium text-slate-400">{meal.description}</p>}
                                                                    </div>
                                                                    {meal.time && <p className="text-[10px] font-black text-slate-400 uppercase">{meal.time}</p>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null;
                                                } catch { return null; }
                                            })()}

                                            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created: {new Date(plan.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── LOG PROGRESS DRAWER ── */}
            <RightDrawer
                isOpen={showLogModal}
                onClose={() => setShowLogModal(false)}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xl font-black text-slate-900">Log Progress</span>
                    </div>
                }
                subtitle={isManagement ? 'Select member and record data' : 'Record your measurements'}
            >
                <form onSubmit={handleLogSubmit} className="space-y-6 p-1">
                    {isManagement && (
                        <div className="p-4 bg-primary-light/50 rounded-2xl border-2 border-violet-100/50">
                            <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1 mb-2 block">Select Member</label>
                            <CustomDropdown
                                options={members.map(m => ({ value: m.id.toString(), label: `${m.name} (${m.memberId})` }))}
                                value={selectedMemberId}
                                onChange={setSelectedMemberId}
                                placeholder="Choose a member..."
                                searchEnabled={true}
                                className="w-full"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Weight (kg)" type="number" step="0.1" placeholder="e.g. 72.5"
                            value={logForm.weight} onChange={v => setLogForm({ ...logForm, weight: v })} />
                        <FormField label="Body Fat (%)" type="number" step="0.1" placeholder="e.g. 16.0"
                            value={logForm.bodyFat} onChange={v => setLogForm({ ...logForm, bodyFat: v })} />
                    </div>

                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Body Measurements (cm)</p>
                        <div className="grid grid-cols-2 gap-4">
                            {['chest', 'waist', 'hips', 'arms', 'thighs'].map(key => (
                                <FormField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} type="number" step="0.1" placeholder="cm"
                                    value={logForm.measurements[key]}
                                    onChange={v => setLogForm({ ...logForm, measurements: { ...logForm.measurements, [key]: v } })} />
                            ))}
                        </div>
                    </div>

                    <FormField label="Date" type="date" value={logForm.date} onChange={v => setLogForm({ ...logForm, date: v })} />

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (optional)</label>
                        <textarea value={logForm.notes} rows={3}
                            onChange={e => setLogForm({ ...logForm, notes: e.target.value })}
                            placeholder="How are you feeling? Any observations..."
                            className="w-full mt-2 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-primary outline-none transition-all resize-none"
                        />
                    </div>

                    <button type="submit" disabled={submitting}
                        className="w-full h-14 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-violet-100 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Save Progress Entry
                    </button>
                </form>
            </RightDrawer>
        </div>
    );
};

/* ── Sub-Components ── */

const MetricCard = ({ label, value, trend, color = 'indigo', invertTrend = false }) => {
    const colors = {
        indigo: 'bg-primary-light text-primary-hover',
        amber: 'bg-amber-50 text-amber-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        rose: 'bg-rose-50 text-rose-700',
        purple: 'bg-purple-50 text-primary-hover',
        blue: 'bg-primary-light text-primary-hover',
        orange: 'bg-orange-50 text-orange-700',
    };
    return (
        <div className={`p-4 rounded-2xl ${colors[color]} space-y-1`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
            <p className="text-xl font-black">{value}</p>
            {trend && (
                <div className="flex items-center gap-1 text-[10px] font-black">
                    {trend.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    <span>{Math.abs(trend.diff)} {invertTrend ? (trend.up ? '▲ worsened' : '▼ improved') : (trend.up ? '▲ gained' : '▼ lost')}</span>
                </div>
            )}
        </div>
    );
};

const MacroChip = ({ label, value, unit, color }) => {
    const colors = {
        amber: 'bg-amber-50 border-amber-100 text-amber-700',
        blue: 'bg-primary-light border-violet-100 text-primary-hover',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
        rose: 'bg-rose-50 border-rose-100 text-rose-700',
    };
    return (
        <div className={`p-4 rounded-xl border ${colors[color]} text-center`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
            <p className="text-lg font-black">{value}<span className="text-xs ml-0.5">{unit}</span></p>
        </div>
    );
};

const FormField = ({ label, type, value, onChange, placeholder, step }) => (
    <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            step={step}
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            className="w-full mt-2 h-12 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 text-sm font-bold focus:border-primary outline-none transition-all"
        />
    </div>
);

export default MemberProgress;
