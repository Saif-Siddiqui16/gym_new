import React, { useState, useEffect } from 'react';
import { User, UserCheck, MessageSquare, AlertCircle } from 'lucide-react';
import RightDrawer from '../common/RightDrawer';
import CustomDropdown from '../common/CustomDropdown';

const MOCK_TRAINERS = [
    'Alex Johnson (Pro)',
    'Samantha Reed (Master)',
    'Michael Chen (Elite)',
    'Emily Davis',
    'Robert Wilson',
    'Jessica Taylor'
];

const TrainerChangeRequestDrawer = ({
    isOpen,
    onClose,
    member,
    onSubmit
}) => {
    const [newTrainer, setNewTrainer] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setNewTrainer('');
            setReason('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            const requestData = {
                id: Date.now(),
                memberName: member?.name,
                memberId: member?.memberId,
                currentTrainer: member?.trainer || 'Not Assigned',
                newTrainer,
                reason,
                status: 'Pending',
                requestDate: new Date().toISOString().split('T')[0]
            };

            console.log('Trainer Change Request Submitted:', requestData);
            onSubmit(requestData);
            setIsSubmitting(false);
            onClose();
        }, 800);
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Change Trainer"
            subtitle={`Request for ${member?.name}`}
            maxWidth="max-w-md"
            footer={
                <div className="flex gap-3 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-11 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="trainer-change-form"
                        disabled={!newTrainer || !reason || isSubmitting}
                        className={`flex-1 h-11 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                            ${(!newTrainer || !reason || isSubmitting)
                                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-violet-200 hover:scale-[1.02] active:scale-[0.98]'}`}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <UserCheck size={18} />
                                Submit Request
                            </>
                        )}
                    </button>
                </div>
            }
        >
            <form id="trainer-change-form" onSubmit={handleSubmit} className="space-y-6 px-6 py-6 mt-2">
                {/* Info Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Trainer</p>
                            <p className="text-sm font-bold text-slate-700">{member?.trainer || 'Not Assigned'}</p>
                        </div>
                    </div>
                </div>

                {/* New Trainer Selection */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        <UserCheck size={14} className="text-violet-500" />
                        Select New Trainer <span className="text-rose-500">*</span>
                    </label>
                    <CustomDropdown
                        options={MOCK_TRAINERS}
                        value={newTrainer}
                        onChange={setNewTrainer}
                        placeholder="Choose a trainer"
                    />
                </div>

                {/* Reason Field */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        <MessageSquare size={14} className="text-violet-500" />
                        Reason for Change <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        required
                        className="w-full min-h-[120px] p-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all text-sm bg-slate-50/50 hover:bg-white placeholder:text-slate-300 outline-none resize-none"
                        placeholder="Please explain why you want to change your trainer..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                {/* Guidelines */}
                <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed font-medium">
                        Change requests are reviewed by the branch manager. You will receive an update within 24-48 hours.
                    </p>
                </div>
            </form>
        </RightDrawer>
    );
};

export default TrainerChangeRequestDrawer;
