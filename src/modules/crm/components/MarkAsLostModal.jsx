import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/ui/Button';

const MarkAsLostModal = ({ isOpen, onClose, onConfirm, submitting }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const reasons = [
        'Too Expensive',
        'No Response',
        'Joined Other Gym',
        'Not Interested',
        'Other'
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showCloseButton={false}
            maxWidth="max-w-md"
        >
            <div className="bg-white overflow-hidden animate-scaleIn">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <X size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Mark as Lost</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Please provide a reason</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
                        <AlertCircle className="text-amber-600 shrink-0" size={18} />
                        <p className="text-xs font-semibold text-amber-700 leading-relaxed">
                            Marking this lead as lost will move it out of your active pipeline. You can still find it in the lead list later.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Reason</label>
                        <div className="grid grid-cols-1 gap-2">
                            {reasons.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setReason(r)}
                                    className={`flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all duration-200 text-sm font-bold ${
                                        reason === r 
                                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-md' 
                                        : 'border-slate-100 bg-white text-slate-600 hover:border-rose-100 hover:bg-slate-50'
                                    }`}
                                >
                                    {r}
                                    {reason === r && <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm animate-pulse" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose} className="rounded-xl h-12 px-6 text-xs font-black uppercase tracking-widest">
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => onConfirm(reason)} 
                        disabled={!reason} 
                        loading={submitting} 
                        className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-12 px-8 shadow-xl shadow-rose-200 text-xs font-black uppercase tracking-widest"
                    >
                        Confirm Lost
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default MarkAsLostModal;
