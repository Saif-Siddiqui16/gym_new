import React, { useState } from 'react';
import { X, Search, CheckCircle2, User, Dumbbell } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';

const AssignWorkoutDrawer = ({ isOpen, onClose, onAssign, planName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    // Date & Notes States
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [notes, setNotes] = useState('');

    // Mock members data - In real app, fetch from API
    const MOCK_MEMBERS = [
        { id: 'M-101', name: 'John Doe', currentPlan: 'Hypertrophy Mastery 2.0' },
        { id: 'M-102', name: 'Jane Smith', currentPlan: null },
        { id: 'M-103', name: 'Mike Monitor', currentPlan: 'Strength 5x5' },
        { id: 'M-104', name: 'Alice Cooper', currentPlan: null },
        { id: 'M-105', name: 'Bob Builder', currentPlan: 'Endurance Basics' },
    ];

    const filteredMembers = MOCK_MEMBERS.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    if (!isOpen) return null;

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Protocol"
            subtitle={planName}
            maxWidth="max-w-lg"
            footer={
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 bg-white text-gray-600 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onAssign({
                                members: selectedMembers,
                                startDate,
                                endDate,
                                notes
                            });
                            onClose();
                        }}
                        disabled={selectedMembers.length === 0 || !startDate}
                        className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 active:scale-95 text-sm flex items-center justify-center gap-2"
                    >
                        Assign Protocol
                    </button>
                </div>
            }
        >
            <div className="flex flex-col h-full">
                {/* Search & List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {/* Assignment Settings */}
                    <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Start Date</label>
                                <input type="date" className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-indigo-500 outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">End Date (Estimated)</label>
                                <input type="date" className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-indigo-500 outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Coach Notes (Optional)</label>
                            <textarea className="w-full h-20 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:border-indigo-500 outline-none resize-none" placeholder="Specific focus areas for this member..." value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search athletes..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        {filteredMembers.map(member => {
                            const isSelected = selectedMembers.includes(member.id);
                            return (
                                <div
                                    key={member.id}
                                    onClick={() => toggleMember(member.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected
                                        ? 'bg-indigo-50 border-indigo-200 shadow-inner'
                                        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>{member.name}</p>
                                            <p className="text-xs font-semibold text-gray-400">
                                                {member.currentPlan ? `Current: ${member.currentPlan}` : 'No active protocol'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                        : 'border-gray-200 text-transparent group-hover:border-gray-300'
                                        }`}>
                                        <CheckCircle2 size={14} strokeWidth={4} />
                                    </div>
                                </div>
                            );
                        })}

                        {filteredMembers.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <User size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-bold">No athletes found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RightDrawer>
    );
};

export default AssignWorkoutDrawer;
