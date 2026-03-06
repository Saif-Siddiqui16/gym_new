import React, { useState } from 'react';
import { Calendar, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import Button from '../../components/ui/Button';

const MemberFreezeDrawer = ({ isOpen, onClose, onSubmit, memberName }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: 'Travel',
        notes: ''
    });

    const [loading, setLoading] = useState(false);

    const reasons = ['Medical', 'Travel', 'Personal', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            setFormData({
                startDate: '',
                endDate: '',
                reason: 'Travel',
                notes: ''
            });
            onClose();
        } catch (error) {
            console.error('Error submitting freeze request:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Request Membership Freeze"
            subtitle="Initiate a pause on your account benefits"
            maxWidth="max-w-md"
            footer={
                <div className="flex gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px]"
                    >
                        Cancel
                    </Button>
                    <Button
                        form="freeze-request-form"
                        type="submit"
                        disabled={loading || !formData.startDate || !formData.endDate}
                        className="flex-1 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-100 border-transparent font-black text-white text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : 'Submit Request'}
                    </Button>
                </div>
            }
        >
            <form id="freeze-request-form" onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Information Callout */}
                <div className="bg-orange-50 p-6 rounded-[28px] border border-orange-100 flex gap-4 text-orange-800 text-xs font-bold leading-relaxed shadow-sm">
                    <div className="p-2 bg-white rounded-xl text-orange-500 shadow-sm shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <p>Freezing your membership will pause access to all facilities and extend your billing cycle by the total duration of the freeze. <span className="text-orange-900 underline underline-offset-2">Terms apply</span>.</p>
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Start Date</label>
                        <div className="relative group">
                            <input
                                type="date"
                                className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-400 focus:bg-white outline-none font-bold text-sm transition-all text-slate-700"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">End Date</label>
                        <div className="relative group">
                            <input
                                type="date"
                                className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-400 focus:bg-white outline-none font-bold text-sm transition-all text-slate-700"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                            />
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                        </div>
                    </div>
                </div>

                {/* Reason Select */}
                <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Primary Reason</label>
                    <select
                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-400 focus:bg-white outline-none font-bold text-sm transition-all text-slate-700 appearance-none"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    >
                        {reasons.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Additional Notes (Optional)</label>
                    <textarea
                        className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-400 focus:bg-white outline-none font-medium text-sm transition-all resize-none h-32 placeholder:text-slate-300 text-slate-700"
                        placeholder="Provide any additional details for our team..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                {/* Requirements Checklist */}
                <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Compliance Check</p>
                    {[
                        "Free of pending dues",
                        "Minimum 7 days duration",
                        "Standard freeze fee may apply"
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-1">
                            <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{item}</span>
                        </div>
                    ))}
                </div>
            </form>
        </RightDrawer>
    );
};

export default MemberFreezeDrawer;
