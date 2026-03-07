import React, { useState } from 'react';
import { Lock, MapPin, Box, CheckCircle, X, AlignLeft, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import RightDrawer from '../../components/common/RightDrawer';

const CreateLockerDrawer = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        number: '',
        size: 'Medium',
        area: '',
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { addLocker } = await import('../../api/staff/lockerApi');
            const result = await addLocker(formData);
            if (result.success) {
                toast.success('Locker created successfully');
                if (onSuccess) onSuccess();
                onClose();
                setFormData({ number: '', size: 'Medium', area: '', notes: '' });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('An error occurred while creating locker');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Locker"
            subtitle="Create a new locker for the branch"
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white font-sans">
                <div className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Locker Number */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Locker Number</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="A-001"
                                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all shadow-sm"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Size */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Size</label>
                        <div className="relative group">
                            <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={18} />
                            <select
                                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-violet-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat shadow-sm"
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            >
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                            </select>
                        </div>
                    </div>

                    {/* Area / Location */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Area / Location</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="e.g. Men's Changing Room"
                                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all shadow-sm"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes (Optional)</label>
                        <div className="relative group">
                            <AlignLeft className="absolute left-4 top-6 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={18} />
                            <textarea
                                placeholder="Any notes..."
                                rows={4}
                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all shadow-sm resize-none"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-slate-50 flex gap-4 bg-white/80 backdrop-blur-md sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-12 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[1.5] h-12 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-200 hover:bg-violet-700 hover:scale-105 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Locker'}
                    </button>
                </div>
            </form>
        </RightDrawer>
    );
};

export default CreateLockerDrawer;
