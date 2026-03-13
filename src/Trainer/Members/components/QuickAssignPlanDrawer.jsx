import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, Search, ClipboardList, Info, ArrowRight } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';

const QuickAssignPlanDrawer = ({ isOpen, onClose, memberName, memberId, onSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [notes, setNotes] = useState('');
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const [dietRes, workoutRes] = await Promise.all([
                apiClient.get('/trainer/diet-plans'),
                apiClient.get('/trainer/workout-plans')
            ]);

            const combinedPlans = [
                ...(dietRes.data || []).map(p => ({ ...p, type: 'Diet' })),
                ...(workoutRes.data || []).map(p => ({ ...p, type: 'Workout' }))
            ];
            setPlans(combinedPlans);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            toast.error('Failed to load protocols');
        } finally {
            setLoading(false);
        }
    };

    const filteredPlans = plans.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssign = async () => {
        if (!selectedPlan) return;

        try {
            setLoading(true);
            const commonData = {
                clientId: memberId,
                name: selectedPlan.name,
                duration: selectedPlan.duration,
                notes: notes || selectedPlan.notes,
                status: 'Active',
                startDate: startDate ? new Date(startDate).toISOString() : null,
                endDate: endDate ? new Date(endDate).toISOString() : null,
            };

            if (selectedPlan.type === 'Diet') {
                await apiClient.post('/trainer/diet-plans', {
                    ...commonData,
                    target: selectedPlan.target,
                    calories: selectedPlan.calories,
                    macros: selectedPlan.macros,
                    meals: selectedPlan.meals
                });
            } else {
                await apiClient.post('/trainer/workout-plans', {
                    ...commonData,
                    level: selectedPlan.level,
                    goal: selectedPlan.goal,
                    volume: selectedPlan.volume,
                    timePerSession: selectedPlan.timePerSession,
                    intensity: selectedPlan.intensity,
                    days: selectedPlan.days
                });
            }

            toast.success(`Protocol assigned to ${memberName} successfully!`);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to assign protocol:', error);
            toast.error('Assignment failed');
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <React.Fragment>
            <button
                onClick={onClose}
                className="drawer-btn drawer-btn-secondary flex-1"
                disabled={loading}
            >
                Cancel
            </button>
            <button
                onClick={handleAssign}
                disabled={!selectedPlan || loading}
                className="drawer-btn drawer-btn-primary flex-[2]"
            >
                {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
        </React.Fragment>
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Plan to ${memberName}`}
            subtitle="Configure plan duration and specific notes"
            maxWidth="max-w-xl"
            footer={footer}
        >
            <div className="space-y-8">
                {/* Plan Selection Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="drawer-label mb-0 flex items-center gap-2">
                            <ClipboardList size={14} /> Select Protocol
                        </label>
                        <span className="text-[10px] font-black text-primary bg-primary-light px-2 py-0.5 rounded-md uppercase tracking-widest">
                            Trainer Protocols
                        </span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="text"
                            placeholder="Search your diet or workout plans..."
                            className="drawer-input pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                        {loading && plans.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-slate-400 text-sm italic">Loading protocols...</p>
                            </div>
                        ) : filteredPlans.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <ClipboardList className="mx-auto text-slate-300 mb-2" size={24} />
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No protocols found</p>
                                <p className="text-slate-400 text-[10px] mt-1 italic">Create plans in Plan Builder first</p>
                            </div>
                        ) : (
                            filteredPlans.map(plan => {
                                const isSelected = selectedPlan?.id === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between group ${isSelected
                                            ? 'bg-primary border-primary shadow-md'
                                            : 'bg-white border-slate-100 hover:border-violet-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-[10px] uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {plan.type.charAt(0)}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                                    {plan.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                                        {plan.type} • {plan.duration}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected && <Check size={18} className="text-white" strokeWidth={3} />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white text-primary rounded-lg flex items-center justify-center shadow-sm">
                            <Calendar size={16} />
                        </div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Protocol Timeline</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="drawer-form-group mb-0">
                            <label className="drawer-label">Start Date</label>
                            <input
                                type="date"
                                className="drawer-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="drawer-form-group mb-0">
                            <label className="drawer-label">End Date</label>
                            <input
                                type="date"
                                className="drawer-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="drawer-form-group mb-0">
                        <label className="drawer-label">Coach's Directive (Optional)</label>
                        <textarea
                            placeholder="Add specific instructions for the athlete..."
                            className="drawer-textarea focus:border-primary focus:ring-primary/10"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </RightDrawer>
    );
};

export default QuickAssignPlanDrawer;
