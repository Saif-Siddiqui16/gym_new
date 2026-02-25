import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    Activity as ActivityIcon,
    TrendingUp,
    TrendingDown,
    Calendar,
    Camera,
    Plus,
    Target,
    ChevronRight,
    Scale,
    Percent,
    ArrowUpRight,
    History,
    ChevronLeft,
    Info,
    Camera as PhotoIcon,
    Flame,
    Zap,
    Shield,
    BarChart3,
    AlertCircle
} from 'lucide-react';
import { getProgress, logProgress } from '../../../api/progressApi';
import MeasurementDrawer from '../components/MeasurementDrawer';
import '../../../styles/GlobalDesign.css';

const GoalProgressBar = ({ current, start, target, color }) => {
    const totalChangeNeeded = Math.abs(start - target) || 1;
    const changeAccomplished = Math.abs(start - current);
    const percentage = Math.min(Math.round((changeAccomplished / totalChangeNeeded) * 100), 100);

    return (
        <div className="space-y-3 mt-6">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress to Target</span>
                <span className={`text-sm font-bold`} style={{ color }}>{percentage}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div
                    className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)] relative"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>Start: {start}</span>
                <span>Target: {target}</span>
            </div>
        </div>
    );
};

const MemberProgress = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const memberId = queryParams.get('memberId');
    const isLogModalOpen = location.pathname.includes('/log');

    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [progressHistory, setProgressHistory] = useState([]);
    const [measurements, setMeasurements] = useState({
        chest: { current: 0, change: 0, unit: 'cm' },
        waist: { current: 0, change: 0, unit: 'cm' },
        arms: { current: 0, change: 0, unit: 'cm' },
        legs: { current: 0, change: 0, unit: 'cm' }
    });
    const [photos, setPhotos] = useState([]);
    const [targets, setTargets] = useState({ weight: 78.0, bodyFat: 15.0, goal: '' });

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            setLoading(true);
            const data = await getProgress(memberId);

            if (data && data.targets) {
                setTargets({
                    weight: parseFloat(data.targets.weight) || 78.0,
                    bodyFat: parseFloat(data.targets.bodyFat) || 15.0,
                    goal: data.targets.goal || ''
                });
            }

            if (data && data.logs && data.logs.length > 0) {
                // Normalize date
                const normalized = data.logs.map(item => ({
                    ...item,
                    dateLabel: new Date(item.date).toLocaleDateString(),
                    weight: parseFloat(item.weight),
                    bodyFat: parseFloat(item.bodyFat)
                }));
                setProgressHistory(normalized);

                // Extract latest measurements
                const latest = normalized[normalized.length - 1];
                const prev = normalized.length > 1 ? normalized[normalized.length - 2] : null;

                if (latest.measurements) {
                    const m = latest.measurements;
                    const pm = prev?.measurements || {};
                    setMeasurements({
                        chest: { current: m.chest || 0, change: (parseFloat(m.chest) || 0) - (parseFloat(pm.chest) || 0), unit: 'cm' },
                        waist: { current: m.waist || 0, change: (parseFloat(m.waist) || 0) - (parseFloat(pm.waist) || 0), unit: 'cm' },
                        arms: { current: m.arms || 0, change: (parseFloat(m.arms) || 0) - (parseFloat(pm.arms) || 0), unit: 'cm' },
                        legs: { current: m.legs || 0, change: (parseFloat(m.legs) || 0) - (parseFloat(pm.legs) || 0), unit: 'cm' }
                    });
                }

                if (latest.photos) {
                    setPhotos(latest.photos || []);
                }
            }
        } catch (error) {
            console.error("Failed to load progress:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProgress = async (formData) => {
        try {
            const payload = {
                weight: formData.weight,
                bodyFat: formData.bodyFat,
                measurements: {
                    chest: formData.chest,
                    waist: formData.waist,
                    arms: formData.arms,
                    legs: formData.legs
                },
                memberId: memberId,
                date: new Date()
            };
            await logProgress(payload);
            const redirectUrl = memberId ? `/progress?memberId=${memberId}` : '/progress';
            navigate(redirectUrl);
            loadProgress();
        } catch (error) {
            console.error("Failed to save progress:", error);
        }
    };

    if (role !== 'MEMBER' && !memberId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No Member Selected</h3>
                <p className="text-gray-500 mt-2 max-w-xs">Please select a member from your list to view or log their progress.</p>
                <button
                    onClick={() => {
                        if (role === 'TRAINER') navigate('/trainer/members/assigned');
                        else navigate('/dashboard');
                    }}
                    className="mt-6 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Calibrating Metrics...</p>
            </div>
        );
    }

    // Fallback if no data
    const hasData = progressHistory.length > 0;
    const currentWeight = hasData ? progressHistory[progressHistory.length - 1].weight : 80;
    const startWeight = hasData ? progressHistory[0].weight : 80;
    const targetWeight = targets.weight;

    const currentBodyFat = hasData ? progressHistory[progressHistory.length - 1].bodyFat : 20.0;
    const startBodyFat = hasData ? progressHistory[0].bodyFat : 20.0;
    const targetBodyFat = targets.bodyFat;

    const weightChange = (currentWeight - startWeight).toFixed(1);
    const weightTrend = (hasData && progressHistory.length > 1)
        ? (currentWeight < progressHistory[progressHistory.length - 2].weight ? 'down' : 'up')
        : 'neutral';

    const milestones = [
        { id: 'm1', label: `Weight Goal (${targetWeight}kg)`, target: targetWeight, current: currentWeight, completed: currentWeight <= targetWeight },
        { id: 'm2', label: `Body Fat Goal (${targetBodyFat}%)`, target: targetBodyFat, current: currentBodyFat, completed: currentBodyFat <= targetBodyFat },
        { id: 'm3', label: '100% Consistency', target: 100, current: hasData ? 85 : 0, completed: false }
    ];


    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 pb-12 min-h-screen font-sans selection:bg-violet-100 selection:text-violet-900">
            {/* Background Gradients (Subtle) */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-50" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-50" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">

                {/* Premium Header with Gradient */}
                <div className="mb-8 relative animate-in slide-in-from-top-5 duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                                    <ActivityIcon className="text-violet-600" size={32} />
                                    Transformation Lab
                                </h1>
                                <p className="text-slate-600 text-sm md:text-base font-medium max-w-2xl">
                                    Track, analyze, and optimize your fitness journey with <span className="text-violet-600 font-bold">precision metrics</span>.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(memberId ? `/progress/log?memberId=${memberId}` : '/progress/log')}
                                className="group relative px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/30 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-violet-500/50 hover:shadow-xl"
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative flex items-center gap-2">
                                    <Plus size={18} strokeWidth={3} />
                                    LOG NEW DATA
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Weight Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm group-hover:bg-violet-600 group-hover:text-white">
                                <Scale size={20} strokeWidth={2.5} />
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${weightTrend === 'down' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                {weightTrend === 'down' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                {Math.abs(weightChange)} kg
                            </div>
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Body Mass</div>
                        <div className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{currentWeight} <span className="text-lg font-bold text-slate-400">kg</span></div>
                        <GoalProgressBar current={currentWeight} start={startWeight} target={targetWeight} color="#7C3AED" />
                    </div>

                    {/* Body Fat Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-fuchsia-50 text-fuchsia-600 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm group-hover:bg-fuchsia-600 group-hover:text-white">
                                <Percent size={20} strokeWidth={2.5} />
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] font-bold flex items-center gap-1">
                                <TrendingDown size={12} />
                                -3.6 %
                            </div>
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Composition</div>
                        <div className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{currentBodyFat} <span className="text-lg font-bold text-slate-400">%</span></div>
                        <GoalProgressBar current={currentBodyFat} start={startBodyFat} target={targetBodyFat} color="#C026D3" />
                    </div>

                    {/* BMI Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm group-hover:bg-blue-600 group-hover:text-white">
                                <Zap size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">Optimal</span>
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">BMI Score</div>
                        <div className="text-3xl font-black text-slate-900 mb-2 tracking-tight">24.2</div>
                        <div className="flex items-center gap-2 mt-auto pt-6 text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                            <ArrowUpRight size={14} className="text-blue-500" />
                            <span className="text-slate-900 font-bold">+0.4</span> since update
                        </div>
                    </div>

                    {/* Milestone Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-violet-500/10 transition-all duration-500" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-violet-50 text-violet-600 rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-sm group-hover:bg-violet-600 group-hover:text-white">
                                    <Target size={20} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">Next Peak</span>
                            </div>
                            <div className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-violet-700 transition-colors">
                                {milestones.find(m => !m.completed)?.label || 'All Goals Completed!'}
                            </div>
                        </div>
                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                <span className="text-slate-400 group-hover:text-slate-500 transition-colors">Progress</span>
                                <span className="text-violet-600">
                                    {Math.round((milestones[0].current / milestones[0].target) * 100)}%
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-600 relative overflow-hidden" style={{ width: `${Math.min(Math.round((milestones[0].current / milestones[0].target) * 100), 100)}%` }}>
                                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Measurement Breakdown (Left Column) */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                        <div className="bg-white rounded-[24px] shadow-xl border border-slate-100 p-8 h-full flex flex-col">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200 rounded-2xl flex items-center justify-center">
                                        <ActivityIcon size={24} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Anatomical Metrics</h2>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'overview' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Grid View
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'history' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Timeline
                                    </button>
                                </div>
                            </div>

                            {/* Conditional Tabs Content */}
                            {activeTab === 'overview' ? (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                                        {Object.entries(measurements).map(([part, data]) => (
                                            <div key={part} className="group cursor-pointer p-5 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 border border-slate-100 hover:border-violet-100 hover:-translate-y-1">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 group-hover:text-violet-500 transition-colors">{part}</div>
                                                <div className="text-xl font-black text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
                                                    {data.current} <span className="text-xs text-slate-400 font-bold">{data.unit}</span>
                                                </div>
                                                <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${data.change >= 0 ? 'text-violet-600' : 'text-emerald-600'}`}>
                                                    {data.change >= 0 ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                                                    {Math.abs(data.change).toFixed(1)} {data.unit}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Performance Analytics */}
                                    <div className="flex-1 min-h-[250px] bg-slate-50 rounded-2xl border border-slate-100 p-6 relative overflow-hidden flex flex-col">
                                        <div className="flex items-center justify-between mb-6 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500">
                                                    <BarChart3 size={18} />
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Weekly Load</h3>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400">Past 7 Days</div>
                                        </div>

                                        <div className="flex items-end justify-between h-40 gap-4 mt-auto">
                                            {[40, 65, 30, 85, 55, 90, 45].map((h, i) => (
                                                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group h-full">
                                                    <div className="w-full bg-slate-200 rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:bg-violet-200" style={{ height: `${h}%` }}>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-violet-500 h-0 transition-all duration-700 delay-100 group-hover:h-full opacity-0 group-hover:opacity-100" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-violet-600 uppercase">
                                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 animate-in fade-in duration-500">
                                    <div className="bg-slate-50 rounded-[32px] border border-slate-100 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-200 bg-slate-100/50">
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Body Weight</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Body Fat %</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Trend</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {progressHistory.slice().reverse().map((entry, idx, arr) => {
                                                    const prevEntry = arr[idx + 1];
                                                    const diff = prevEntry ? (entry.weight - prevEntry.weight).toFixed(1) : 0;
                                                    return (
                                                        <tr key={idx} className="hover:bg-white transition-colors group">
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400">
                                                                        <Calendar size={14} />
                                                                    </div>
                                                                    <span className="font-bold text-slate-900">{entry.dateLabel}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className="text-sm font-black text-slate-900">{entry.weight} kg</span>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className="text-sm font-bold text-slate-500">{entry.bodyFat}%</span>
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                {idx < arr.length - 1 ? (
                                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${diff <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                        {diff > 0 ? '+' : ''}{diff} kg
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Baseline</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Consistent Evolution Card */}
                            <div className="p-8 bg-gradient-to-br from-violet-50 via-white to-purple-50 rounded-2xl border border-violet-100/50 relative overflow-hidden group hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-500 mt-auto">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl -mr-20 -mt-20 group-hover:bg-white/60 transition-all duration-700" />

                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-violet-600 shadow-md shadow-violet-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                            <TrendingUp size={28} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 mb-1">Consistent Evolution</h3>
                                            <p className="text-slate-500 text-sm font-medium">You've reached <span className="text-violet-600 font-bold bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">92%</span> of your quarterly metabolic targets.</p>
                                        </div>
                                    </div>
                                    <button className="group/btn px-6 py-3 bg-white text-violet-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all shadow-md shadow-violet-100 hover:shadow-violet-500/20 border border-violet-50">
                                        <span className="group-hover/btn:hidden">View Audit</span>
                                        <span className="hidden group-hover/btn:flex items-center gap-2">Explore Report <ArrowUpRight size={14} /></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transformation Gallery & Actions (Right Column) */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                        {/* Visual History */}
                        <div className="bg-white rounded-[24px] shadow-xl border border-slate-100 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 text-white shadow-lg shadow-slate-200 rounded-xl flex items-center justify-center">
                                        <PhotoIcon size={20} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Visual History</h2>
                                </div>
                                <button className="text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline">View All</button>
                            </div>

                            <div className="space-y-4">
                                {hasData && photos.length > 0 ? (
                                    <>
                                        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden group shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-100">
                                            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Latest Scan</span>
                                            </div>
                                            <img src={photos[photos.length - 1].url} alt="Current Progress" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />

                                            <div className="absolute bottom-5 left-5 right-5">
                                                <div className="text-[10px] font-bold text-white/70 mb-1 uppercase tracking-wider">{photos[photos.length - 1].date}</div>
                                                <div className="text-xl font-black text-white">Current Physique</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {photos.slice(0, -1).map(photo => (
                                                <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-100 cursor-pointer">
                                                    <img src={photo.url} alt={photo.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                            ))}
                                            <button className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/10 transition-all duration-300 group">
                                                <Plus size={20} strokeWidth={2.5} />
                                                <span className="text-[10px] font-bold uppercase">Add Photo</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <button className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/10 transition-all duration-300 group">
                                        <Camera size={32} strokeWidth={2} />
                                        <span className="text-xs font-black uppercase tracking-widest">No Photos Yet</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Status / Next Session (Filling Empty Space) */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[24px] shadow-xl shadow-slate-200 p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <Calendar size={18} />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-widest text-white/80">Up Next</span>
                                </div>
                                <h3 className="text-2xl font-black mb-2">Upper Body Power</h3>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-300 mb-6">
                                    <span>Today, 5:00 PM</span>
                                    <span className="w-1 h-1 bg-slate-500 rounded-full" />
                                    <span>60 min</span>
                                </div>
                                <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-violet-50 transition-colors shadow-lg">
                                    Start Workout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Milestone Roadmap (Light Theme) */}
                <div className="relative overflow-hidden bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-slate-100 group">
                    {/* Ambient Background Effects */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-[120px] mix-blend-multiply opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-[100px] mix-blend-multiply opacity-30" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl border border-violet-100 shadow-sm">
                                    <Target size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-1">Strategic Roadmaps</h2>
                                    <p className="text-slate-500 font-medium tracking-wide text-sm">Your journey to peak performance</p>
                                </div>
                            </div>
                            <button className="px-6 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all">
                                View Full Plan
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-[50px] left-[15%] right-[15%] h-[4px] bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-1/2 bg-gradient-to-r from-emerald-500 via-violet-500 to-slate-100 relative">
                                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                                </div>
                            </div>

                            {milestones.map((mile, i) => {
                                const isCompleted = mile.completed;
                                const isActive = !mile.completed && (i === 0 || milestones[i - 1].completed);

                                return (
                                    <div key={mile.id} className="relative z-10 flex flex-col items-center">

                                        {/* Node Icon */}
                                        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 shadow-xl transition-all duration-500 border-[6px] relative group/node cursor-pointer ${isCompleted
                                            ? 'bg-white border-emerald-50 text-emerald-500 shadow-emerald-500/10'
                                            : isActive
                                                ? 'bg-white border-violet-50 text-violet-600 shadow-violet-500/20 scale-110'
                                                : 'bg-white border-slate-50 text-slate-300'
                                            }`}>
                                            {/* Glow Effect for Active/Completed */}
                                            {(isActive || isCompleted) && (
                                                <div className={`absolute inset-0 rounded-[24px] blur-xl opacity-20 ${isCompleted ? 'bg-emerald-500' : 'bg-violet-500'}`} />
                                            )}

                                            <div className="relative z-10 text-2xl font-black">
                                                {isCompleted ? <Target size={32} strokeWidth={3} /> : i + 1}
                                            </div>

                                            {/* Active Pulse */}
                                            {isActive && (
                                                <div className="absolute -inset-[8px] rounded-[36px] border-2 border-violet-100 animate-ping opacity-40" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className={`text-center transition-all duration-300 ${isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}>
                                            <h4 className={`text-lg font-black mb-3 ${isCompleted ? 'text-emerald-600' : isActive ? 'text-slate-900' : 'text-slate-400'
                                                }`}>
                                                {mile.label}
                                            </h4>

                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-6 ${isCompleted
                                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                : isActive
                                                    ? 'bg-violet-50 border-violet-100 text-violet-600 shadow-sm'
                                                    : 'bg-slate-50 border-slate-100 text-slate-400'
                                                }`}>
                                                {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Locked'}
                                            </div>

                                            {/* Detailed Progress Bar */}
                                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-[2px] shadow-inner border border-slate-200/50">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-violet-500' : 'bg-slate-300'
                                                        }`}
                                                    style={{ width: `${Math.min(Math.round((mile.current / mile.target) * 100), 100)}%` }}
                                                >
                                                    {isActive && <div className="absolute inset-0 bg-white/30 animate-[shimmer_1.5s_infinite]" />}
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                <span>0%</span>
                                                <span className={isActive ? 'text-violet-600' : ''}>{Math.round(Math.min((mile.current / mile.target) * 100, 100))}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Measurement Modal */}
            {isLogModalOpen && (
                <MeasurementDrawer
                    isOpen={true}
                    onClose={() => navigate(memberId ? `/progress?memberId=${memberId}` : '/progress')}
                    onSave={handleSaveProgress}
                />
            )}
        </div>
    );
};

export default MemberProgress;
