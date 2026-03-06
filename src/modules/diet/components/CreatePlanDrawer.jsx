import React, { useState, useEffect } from 'react';
import {
    X,
    Plus,
    Trash2,
    Clock,
    Flame,
    Zap,
    Droplets,
    Target,
    Save,
    ChevronRight,
    Info,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import { getAssignedMembers } from '../../../api/trainer/trainerApi';

const MacroInput = ({ label, value, onChange, color, icon: Icon }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        <div className="relative group">
            <input
                type="number"
                className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl text-center font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                value={value}
                onChange={e => onChange(parseInt(e.target.value) || 0)}
            />
            <div className={`absolute inset-y-0 right-3 flex items-center pointer-events-none text-[10px] font-bold ${color}`}>g</div>
        </div>
    </div>
);

const MacroDistribution = ({ protein, carbs, fats }) => {
    const p = parseInt(protein) || 0;
    const c = parseInt(carbs) || 0;
    const f = parseInt(fats) || 0;

    const pCal = p * 4;
    const cCal = c * 4;
    const fCal = f * 9;
    const totalCal = pCal + cCal + fCal;

    const pPer = totalCal > 0 ? Math.round((pCal / totalCal) * 100) : 0;
    const cPer = totalCal > 0 ? Math.round((cCal / totalCal) * 100) : 0;
    const fPer = totalCal > 0 ? Math.round((fCal / totalCal) * 100) : 100 - pPer - cPer;

    return (
        <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Macro Split</span>
                <span className="text-sm font-black text-indigo-600">{totalCal} <span className="text-[10px] text-gray-400">KCAL</span></span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${pPer}%` }} />
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${cPer}%` }} />
                <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${fPer}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9px] font-black uppercase tracking-tighter">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> P: {pPer}%</div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> C: {cPer}%</div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> F: {fPer}%</div>
            </div>
        </div>
    );
};

const CreatePlanDrawer = ({ isOpen, onClose, onSave, editData = null }) => {
    const initialFormState = {
        name: '',
        clientId: '',
        target: 'Weight Loss',
        duration: '4',
        calories: 0,
        macros: { protein: 0, carbs: 0, fats: 0 },
        meals: [
            { id: 1, name: 'Breakfast', time: '08:00 AM', cals: 0, protein: 0, carbs: 0, fats: 0, notes: '', isExpanded: true }
        ],
        notes: '',
        status: 'Active'
    };

    const [formData, setFormData] = useState(editData || initialFormState);
    const [clients, setClients] = useState([]);

    useEffect(() => {
        if (editData) setFormData(editData);
        else setFormData(initialFormState);
    }, [editData, isOpen]);

    useEffect(() => {
        if (isOpen) {
            getAssignedMembers({ limit: 100 })
                .then(res => setClients(res?.data || []))
                .catch(console.error);
        }
    }, [isOpen]);

    // Auto-calculate calories whenever macros change
    useEffect(() => {
        const p = parseInt(formData.macros.protein) || 0;
        const c = parseInt(formData.macros.carbs) || 0;
        const f = parseInt(formData.macros.fats) || 0;
        const total = (p * 4) + (c * 4) + (f * 9);
        setFormData(prev => ({ ...prev, calories: total }));
    }, [formData.macros]);

    const handleAddMeal = () => {
        const nextId = formData.meals.length > 0 ? Math.max(...formData.meals.map(m => m.id)) + 1 : 1;
        setFormData(prev => ({
            ...prev,
            meals: [...prev.meals, {
                id: nextId,
                name: `Meal ${formData.meals.length + 1}`,
                time: '12:00 PM',
                cals: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
                notes: '',
                isExpanded: true
            }]
        }));
    };

    const handleRemoveMeal = (id) => {
        setFormData(prev => ({
            ...prev,
            meals: prev.meals.filter(m => m.id !== id)
        }));
    };

    const updateMeal = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            meals: prev.meals.map(m => m.id === id ? { ...m, [field]: value } : m)
        }));
    };

    const toggleMealExpand = (id) => {
        setFormData(prev => ({
            ...prev,
            meals: prev.meals.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m)
        }));
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!formData.name || !formData.clientId) {
            alert('Please fill in Plan Name and Assign a Client.');
            return;
        }
        onSave({
            ...formData,
            id: editData?.id || `DP-${Math.floor(Math.random() * 10000)}`
        });
    };

    if (!isOpen) return null;

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? 'Edit Diet Plan' : 'Create Diet Plan'}
            subtitle="Configure structured nutritional protocols"
        >
            <div className="flex flex-col h-full bg-white">
                <div className="flex-1 overflow-y-auto px-4 md:px-5 pb-8 space-y-8 custom-scrollbar">

                    {/* SECTION 1: BASIC INFO */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Basic Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Plan Name</label>
                                <input
                                    type="text"
                                    className="w-full h-11 bg-gray-50 border border-gray-100 px-4 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="e.g. 12-Week Lean Bulk"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Assign To Client</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-11 bg-gray-50 border border-gray-100 px-4 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all appearance-none"
                                        value={formData.clientId}
                                        onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                    >
                                        <option value="">Select Client</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Goal Type</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-11 bg-gray-50 border border-gray-100 px-4 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all appearance-none"
                                        value={formData.target}
                                        onChange={e => setFormData({ ...formData, target: e.target.value })}
                                    >
                                        <option>Weight Loss</option>
                                        <option>Muscle Gain</option>
                                        <option>Maintenance</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Duration (Weeks)</label>
                                <input
                                    type="number"
                                    className="w-full h-11 bg-gray-50 border border-gray-100 px-4 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="4"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: MACRO INPUT */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Macro Configuration</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <MacroInput
                                label="Protein"
                                icon={Zap}
                                color="text-indigo-500"
                                value={formData.macros.protein}
                                onChange={v => setFormData({ ...formData, macros: { ...formData.macros, protein: v } })}
                            />
                            <MacroInput
                                label="Carbs"
                                icon={Flame}
                                color="text-emerald-500"
                                value={formData.macros.carbs}
                                onChange={v => setFormData({ ...formData, macros: { ...formData.macros, carbs: v } })}
                            />
                            <MacroInput
                                label="Fats"
                                icon={Droplets}
                                color="text-rose-500"
                                value={formData.macros.fats}
                                onChange={v => setFormData({ ...formData, macros: { ...formData.macros, fats: v } })}
                            />
                        </div>

                        <MacroDistribution
                            protein={formData.macros.protein}
                            carbs={formData.macros.carbs}
                            fats={formData.macros.fats}
                        />
                    </div>

                    {/* SECTION 3: MEAL DISTRIBUTION */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Meal Distribution</h3>
                            </div>
                            <button
                                onClick={handleAddMeal}
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                <Plus size={14} strokeWidth={3} /> Add Meal
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.meals.map((meal, index) => (
                                <div key={meal.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <div
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleMealExpand(meal.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{meal.name || `Meal ${index + 1}`}</h4>
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                                                    <span>{meal.time}</span>
                                                    <span>•</span>
                                                    <span className="text-indigo-600">{meal.cals} KCAL</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveMeal(meal.id); }}
                                                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            {meal.isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                        </div>
                                    </div>

                                    {meal.isExpanded && (
                                        <div className="p-4 pt-0 border-t border-gray-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Meal Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full h-9 bg-gray-50 border border-gray-100 px-3 rounded-lg text-xs font-bold focus:bg-white outline-none"
                                                        value={meal.name}
                                                        onChange={e => updateMeal(meal.id, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Time</label>
                                                    <input
                                                        type="text"
                                                        className="w-full h-9 bg-gray-50 border border-gray-100 px-3 rounded-lg text-xs font-bold focus:bg-white outline-none"
                                                        value={meal.time}
                                                        onChange={e => updateMeal(meal.id, 'time', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Cals</label>
                                                    <input
                                                        type="number"
                                                        className="w-full h-9 bg-gray-50 border border-gray-100 px-2 rounded-lg text-xs font-bold text-center focus:bg-white outline-none"
                                                        value={meal.cals}
                                                        onChange={e => updateMeal(meal.id, 'cals', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">P (g)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full h-9 bg-gray-50 border border-gray-100 px-2 rounded-lg text-xs font-bold text-center focus:bg-white outline-none"
                                                        value={meal.protein}
                                                        onChange={e => updateMeal(meal.id, 'protein', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">C (g)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full h-9 bg-gray-50 border border-gray-100 px-2 rounded-lg text-xs font-bold text-center focus:bg-white outline-none"
                                                        value={meal.carbs}
                                                        onChange={e => updateMeal(meal.id, 'carbs', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">F (g)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full h-9 bg-gray-50 border border-gray-100 px-2 rounded-lg text-xs font-bold text-center focus:bg-white outline-none"
                                                        value={meal.fats}
                                                        onChange={e => updateMeal(meal.id, 'fats', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Food Notes / Ingredients</label>
                                                <textarea
                                                    className="w-full h-20 bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs font-medium focus:bg-white outline-none resize-none"
                                                    placeholder="2 slices whole grain bread, 3 egg whites..."
                                                    value={meal.notes}
                                                    onChange={e => updateMeal(meal.id, 'notes', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 4: NOTES */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">General Instructions</h3>
                        </div>
                        <textarea
                            className="w-full h-32 bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none"
                            placeholder="e.g. Drink 3L water daily, Avoid sugary drinks..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>

                {/* SECTION 5: SAVE ACTION */}
                <div className="p-4 md:p-6 bg-white border-t border-gray-100 mt-auto">
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-[2] h-12 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em]"
                        >
                            <Save size={18} /> Save Plan
                        </button>
                    </div>
                </div>
            </div>
        </RightDrawer>
    );
};

export default CreatePlanDrawer;
