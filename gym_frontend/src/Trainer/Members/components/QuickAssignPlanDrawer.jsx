import React, { useState } from 'react';
import { X, Calendar, Check, Search, ClipboardList, Info, ArrowRight } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';

const QuickAssignPlanDrawer = ({ isOpen, onClose, memberName, memberId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [notes, setNotes] = useState('');

    // Mock Plans - In real app, filter by loggedInTrainerId
    const MOCK_PLANS = [
        { id: 'DP-101', name: 'Lean Bulk High Protein', type: 'Diet', duration: '4 Weeks', trainer_id: 'T-101' },
        { id: 'DP-102', name: 'Keto Shred Protocol', type: 'Diet', duration: '8 Weeks', trainer_id: 'T-101' },
        { id: 'WP-201', name: 'Hypertrophy Mastery 2.0', type: 'Workout', duration: '12 Weeks', trainer_id: 'T-101' },
        { id: 'WP-202', name: 'Strength 5x5 Foundation', type: 'Workout', duration: '6 Weeks', trainer_id: 'T-101' },
    ];

    const filteredPlans = MOCK_PLANS.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssign = () => {
        const assignmentData = {
            memberId,
            planId: selectedPlanId,
            startDate,
            endDate,
            notes
        };
        console.log('Final Assignment Data:', assignmentData);
        // Simulate API call
        alert(`Plan assigned to ${memberName} successfully!`);
        onClose();
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Plan to ${memberName}`}
            subtitle="Configure plan duration and specific notes"
            maxWidth="max-w-xl"
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                    {/* Plan Selection Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 flex items-center gap-2">
                                <ClipboardList size={14} /> Select Protocol
                            </label>
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                Trainer Plans only
                            </span>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="Search your diet or workout plans..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
                            {filteredPlans.map(plan => {
                                const isSelected = selectedPlanId === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${isSelected
                                                ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100'
                                                : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {plan.type.charAt(0)}
                                            </div>
                                            <div>
                                                <p className={`font-black text-sm uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
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
                            })}
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Calendar size={16} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Protocol Timeline</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Coach's Directive (Optional)</label>
                            <div className="relative">
                                <Info className="absolute left-3 top-3 text-slate-300" size={16} />
                                <textarea
                                    placeholder="Add specific instructions, focus points or motivational notes for the athlete..."
                                    className="w-full h-24 pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-indigo-500 outline-none resize-none transition-all"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 pt-6 mt-8 flex items-center justify-between bg-white relative">
                    <button
                        onClick={onClose}
                        className="px-6 py-3.5 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedPlanId || !startDate || !endDate}
                        className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 flex items-center gap-2"
                    >
                        Confirm Assignment <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </RightDrawer>
    );
};

export default QuickAssignPlanDrawer;
