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
                <React.Fragment>
                    <button
                        type="button"
                        onClick={onClose}
                        className="drawer-btn drawer-btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="trainer-change-form"
                        disabled={!newTrainer || !reason || isSubmitting}
                        className="drawer-btn drawer-btn-primary flex-1"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </React.Fragment>
            }
        >
            <form id="trainer-change-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Info Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="drawer-label mb-0">Current Trainer</p>
                            <p className="text-sm font-bold text-slate-700">{member?.trainer || 'Not Assigned'}</p>
                        </div>
                    </div>
                </div>

                {/* New Trainer Selection */}
                <div className="drawer-form-group">
                    <label className="drawer-label">
                        Select New Trainer *
                    </label>
                    <CustomDropdown
                        options={MOCK_TRAINERS}
                        value={newTrainer}
                        onChange={setNewTrainer}
                        placeholder="Choose a trainer"
                    />
                </div>

                {/* Reason Field */}
                <div className="drawer-form-group">
                    <label className="drawer-label">
                        Reason for Change *
                    </label>
                    <textarea
                        required
                        className="drawer-textarea"
                        placeholder="Please explain why you want to change your trainer..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                {/* Guidelines */}
                <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 leading-relaxed font-bold uppercase opacity-80">
                        Requests are reviewed by management. Updates take 24-48 hours.
                    </p>
                </div>
            </form>
        </RightDrawer>
    );
};

export default TrainerChangeRequestDrawer;
