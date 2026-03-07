import React, { useState } from 'react';
import { lockerApi } from '../../../api/lockerApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';
import Button from '../../../components/ui/Button';

const AddLockerDrawer = ({ onClose, onSuccess }) => {
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        number: '',
        size: 'Medium',
        area: '',
        notes: '',
        isChargeable: false,
        price: '0',
        status: 'Available'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.number) return toast.error('Locker number is required');

        try {
            setLoading(true);
            const response = await lockerApi.addLocker({
                ...formData,
                tenantId: selectedBranch
            });
            toast.success(response.message || 'Locker created successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create locker');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Locker Number</label>
                    <input
                        type="text"
                        placeholder="A-001"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        className="w-full px-4 py-2 border border-orange-400 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Size</label>
                    <select
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
                    >
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Area / Location</label>
                    <input
                        type="text"
                        placeholder="e.g. Men's Changing Room"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes (Optional)</label>
                    <textarea
                        placeholder="Any notes..."
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
                    ></textarea>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900 leading-none">Is Chargeable?</p>
                            <p className="text-[10px] text-slate-500 mt-1">Enable for rental fees</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.isChargeable}
                            onChange={(e) => setFormData({ ...formData, isChargeable: e.target.checked })}
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                </div>

                {formData.isChargeable && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 italic">Monthly Rental Price</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-slate-200 sticky bottom-0 bg-white">
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform active:scale-95"
                >
                    Create Locker
                </Button>
            </div>
        </form>
    );
};

export default AddLockerDrawer;
