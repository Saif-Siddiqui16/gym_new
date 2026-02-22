import React, { useState } from 'react';
import {
    X,
    Plus,
    Trash2,
    Clock,
    Flame,
    Zap,
    Target,
    Save,
    ChevronRight,
    ChevronLeft,
    Info,
    Activity,
    Dumbbell
} from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import { getAssignedMembers } from '../../../api/trainer/trainerApi';

const MacroInput = ({ label, value, onChange, placeholder, icon: Icon }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        <div className="relative group">
            <input
                type="text"
                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:font-normal placeholder:text-gray-400"
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    </div>
);

const CreateWorkoutDrawer = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(initialData || {
        name: '',
        clientId: '',
        description: '',
        target: 'Muscle Gain',
        durationWeeks: 12,
        durationDays: 4,
        difficulty: 'Intermediate',
        intensity: 'High',
        days: {
            monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
        }
    });

    const [clients, setClients] = useState([]);

    React.useEffect(() => {
        if (isOpen) {
            getAssignedMembers({ limit: 100 })
                .then(res => setClients(res?.data || []))
                .catch(console.error);
        }
    }, [isOpen]);

    const [currentDay, setCurrentDay] = useState('monday');
    const [newExercise, setNewExercise] = useState({
        name: '',
        sets: 3,
        reps: '10-12',
        rpe: 8,
        rest: '90s',
        notes: ''
    });

    if (!isOpen) return null;

    const handleAddExercise = () => {
        if (!newExercise.name) return;
        setFormData(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [currentDay]: [...prev.days[currentDay], { ...newExercise, id: Date.now().toString() }]
            }
        }));
        setNewExercise({ name: '', sets: 3, reps: '10-12', rpe: 8, rest: '90s', notes: '' });
    };

    const removeExercise = (day, id) => {
        setFormData(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: prev.days[day].filter(ex => ex.id !== id)
            }
        }));
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Protocol' : 'Protocol Architect'}
            subtitle={`Step ${step} of 2: ${step === 1 ? 'Definitions' : 'Orchestration'}`}
            maxWidth="max-w-5xl"
            footer={
                <div className="flex items-center justify-between w-full">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <div className="flex items-center gap-4">
                        {step === 2 && (
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (step === 1) setStep(2);
                                else {
                                    if (!formData.name || !formData.clientId) {
                                        alert('Please fill in Plan Name and Assign a Client.');
                                        return;
                                    }
                                    onSave({
                                        ...formData,
                                        id: formData.id || 'wp-' + Date.now(),
                                        exercisesCount: Object.values(formData.days).flat().length,
                                        avgDuration: formData.avgDuration || '60 min'
                                    });
                                }
                            }}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                        >
                            {step === 1 ? 'Next Step' : 'Save Protocol'}
                            {step === 1 ? <ChevronRight size={18} /> : <Save size={18} />}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {step === 1 ? (
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Protocol Identity</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                placeholder="e.g. Hypertrophy Mastery 2.0"
                                                className="flex-1 h-14 px-4 bg-white border border-gray-200 rounded-xl text-lg font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:font-normal placeholder:text-gray-400"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                            <select
                                                className="flex-1 h-14 bg-white border border-gray-200 px-4 rounded-xl text-sm font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none"
                                                value={formData.clientId}
                                                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                            >
                                                <option value="">Select Client</option>
                                                {clients.map(client => (
                                                    <option key={client.id} value={client.id}>{client.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Description</label>
                                        <textarea
                                            placeholder="Scientific objectives & background..."
                                            className="w-full h-32 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none placeholder:font-normal placeholder:text-gray-400"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Strategy</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Muscle Gain', 'Fat Loss', 'Strength', 'Endurance'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setFormData({ ...formData, target: t })}
                                                className={`h-12 rounded-xl text-xs font-bold transition-all border ${formData.target === t
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Intensity Level</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Low', 'Moderate', 'High'].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setFormData({ ...formData, intensity: d })}
                                                className={`h-12 rounded-xl text-xs font-bold transition-all border ${formData.intensity === d
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Clock size={14} /> Duration Schedule
                                    </label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1">
                                            <input
                                                type="number"
                                                className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-bold focus:border-indigo-500 outline-none"
                                                value={formData.durationWeeks}
                                                onChange={e => setFormData({ ...formData, durationWeeks: e.target.value })}
                                            />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Weeks</span>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <input
                                                type="number"
                                                className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-bold focus:border-indigo-500 outline-none"
                                                value={formData.durationDays}
                                                onChange={e => setFormData({ ...formData, durationDays: e.target.value })}
                                            />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Days / Week</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Activity size={14} /> Difficulty Tier
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 bg-white border border-gray-200 rounded-xl text-sm px-4 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none"
                                            value={formData.difficulty}
                                            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                        >
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                            <option>Pro-Athlete</option>
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Day Selector & Overview */}
                            <div className="lg:col-span-3 space-y-4">
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setCurrentDay(day)}
                                        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all font-bold text-sm uppercase tracking-wider ${currentDay === day
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-white text-gray-500 hover:text-indigo-600 hover:text-indigo-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span>{day.slice(0, 3)}</span>
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${currentDay === day ? 'bg-white/20' : 'bg-gray-100'}`}>
                                            {formData.days[day].length}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Exercise Orchestrator */}
                            <div className="lg:col-span-9 space-y-8">
                                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                            <Dumbbell size={16} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Add Movement to <span className="capitalize">{currentDay}</span></h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <MacroInput label="Movement Name" icon={Dumbbell} value={newExercise.name} onChange={val => setNewExercise({ ...newExercise, name: val })} placeholder="e.g. Barbell Squat" />
                                        </div>
                                        <MacroInput label="Sets" icon={Target} value={newExercise.sets} onChange={val => setNewExercise({ ...newExercise, sets: val })} />
                                        <MacroInput label="Reps/Tempo" icon={Activity} value={newExercise.reps} onChange={val => setNewExercise({ ...newExercise, reps: val })} placeholder="e.g. 8-10 or 3010" />
                                        <MacroInput label="Target RPE" icon={Zap} value={newExercise.rpe} onChange={val => setNewExercise({ ...newExercise, rpe: val })} />
                                        <MacroInput label="Rest Period" icon={Clock} value={newExercise.rest} onChange={val => setNewExercise({ ...newExercise, rest: val })} placeholder="e.g. 90s" />
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                                <Info size={12} /> Notes
                                            </label>
                                            <textarea
                                                placeholder="Technical notes, queueing..."
                                                className="w-full h-20 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none transition-all"
                                                value={newExercise.notes}
                                                onChange={e => setNewExercise({ ...newExercise, notes: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddExercise}
                                        className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} /> Add Movement
                                    </button>
                                </div>

                                {/* Active Day List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                            {currentDay} Schedule
                                        </h4>
                                        <span className="text-xs font-bold text-gray-400">{formData.days[currentDay].length} Exercises</span>
                                    </div>

                                    {formData.days[currentDay].length === 0 ? (
                                        <div className="py-12 text-center bg-gray-50/50 rounded-[24px] border border-dashed border-gray-200 text-gray-400">
                                            <p className="font-semibold text-sm">No exercises added yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {formData.days[currentDay].map((ex, idx) => (
                                                <div key={ex.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-all group">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-xs text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-gray-900 text-sm">{ex.name}</h5>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md">
                                                                {ex.sets} Sets
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md">
                                                                {ex.reps} Reps
                                                            </span>
                                                            {ex.rpe && <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md">RPE {ex.rpe}</span>}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeExercise(currentDay, ex.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </RightDrawer>
    );
};

export default CreateWorkoutDrawer;
