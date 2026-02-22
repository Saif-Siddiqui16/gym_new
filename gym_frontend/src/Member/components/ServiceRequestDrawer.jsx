import React, { useState } from 'react';
import { Send, X, AlertCircle } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import Button from '../../components/ui/Button';

const ServiceRequestDrawer = ({ isOpen, onClose, onSubmit, memberData }) => {
    const [type, setType] = useState('Freeze Membership');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ type, reason });
            setReason('');
            onClose();
        } catch (error) {
            console.error('Error submitting request:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Service Request"
            maxWidth="max-w-md"
            footer={
                <div className="flex gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border-slate-200 text-slate-600 font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        form="request-form"
                        type="submit"
                        disabled={loading || !reason}
                        className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 border-transparent font-bold text-white flex items-center justify-center gap-2"
                    >
                        {loading ? 'Sending...' : <><Send size={16} /> Submit Request</>}
                    </Button>
                </div>
            }
        >
            <form id="request-form" onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="bg-violet-50 p-6 rounded-[24px] border border-violet-100 flex gap-4 text-violet-800 text-sm font-medium leading-relaxed">
                    <AlertCircle className="shrink-0 text-violet-600" size={24} />
                    <p>Your request will be prioritized. Track status updates in your member activity feed.</p>
                </div>

                <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Request Category</label>
                    <select
                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-violet-500 outline-none font-bold text-sm transition-all text-slate-700"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="Freeze Membership">Freeze Membership</option>
                        <option value="Unfreeze Membership">Unfreeze Membership</option>
                        <option value="Request Trainer Change">Trainer Change Request</option>
                    </select>
                </div>

                <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Reason for Request</label>
                    <textarea
                        className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-violet-500 outline-none font-medium text-sm transition-all resize-none h-48 placeholder:text-slate-300 text-slate-700"
                        placeholder="Please elaborate on your request..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                </div>

                {type === 'Freeze Membership' && (
                    <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 flex gap-3">
                        <div className="text-amber-500 shrink-0"><AlertCircle size={18} /></div>
                        <p className="text-[11px] text-amber-800 font-bold leading-normal uppercase tracking-wide">
                            Note: Fee terms and expiry extensions apply based on your specific plan.
                        </p>
                    </div>
                )}
            </form>
        </RightDrawer>
    );
};

export default ServiceRequestDrawer;
