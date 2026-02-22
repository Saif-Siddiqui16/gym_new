import React, { useState } from 'react';
import { Lock, MapPin, DollarSign, Box, CheckCircle, AlertCircle } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import { addLocker } from '../../api/staff/lockerApi'; // Mock API function needs to be assumed or created

const CreateLockerDrawer = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        number: '',
        area: 'Men\'s Changing Room',
        size: 'Medium',
        isPaid: false,
        price: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addLocker({
                ...formData,
                price: formData.isPaid ? parseFloat(formData.price) : 0
            });
            onSuccess();
            onClose();
            setFormData({
                number: '',
                area: 'Men\'s Changing Room',
                size: 'Medium',
                isPaid: false,
                price: ''
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Locker"
            subtitle="Register new storage unit"
            maxWidth="max-w-md"
            footer={
                <div className="flex gap-3 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="create-locker-form"
                        disabled={isSubmitting}
                        className="flex-[2] px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={18} />
                        {isSubmitting ? 'Creating...' : 'Create Locker'}
                    </button>
                </div>
            }
        >
            <form id="create-locker-form" onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Locker Number */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Lock size={14} className="text-violet-500" />
                            Locker Number *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. L-101"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-violet-500 transition-all uppercase"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            required
                        />
                    </div>

                    {/* Area/Location */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={14} className="text-violet-500" />
                            Location Area
                        </label>
                        <select
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-violet-500 transition-all appearance-none"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        >
                            <option>Men's Changing Room</option>
                            <option>Women's Changing Room</option>
                            <option>General Hallway</option>
                            <option>VIP Lounge</option>
                        </select>
                    </div>

                    {/* Size */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Box size={14} className="text-violet-500" />
                            Size Configuration
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Small', 'Medium', 'Large'].map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, size })}
                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${formData.size === size
                                        ? 'border-violet-600 bg-violet-50 text-violet-700'
                                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Billing Toggle */}
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Paid Locker?</h4>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Require subscription for usage</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isPaid}
                                    onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                            </label>
                        </div>

                        {formData.isPaid && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign size={14} className="text-violet-500" />
                                    Monthly Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="e.g. 500"
                                    className="w-full px-4 py-3 bg-white border-2 border-violet-100 rounded-xl font-bold text-violet-800 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required={formData.isPaid}
                                />
                            </div>
                        )}
                    </div>

                </div>


            </form>
        </RightDrawer>
    );
};

export default CreateLockerDrawer;
