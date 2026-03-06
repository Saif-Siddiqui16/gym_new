import React, { useState } from 'react';
import { lockerApi } from '../../../api/lockerApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';

const AddLockerDrawer = ({ onClose, onSuccess }) => {
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        number: '',
        size: 'Medium',
        area: '',
        notes: '',
        isChargeable: false,
        status: 'Available'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.number) return toast.error('Locker number is required');

        try {
            setLoading(true);
            await lockerApi.addLocker({
                ...formData,
                tenantId: selectedBranch
            });
            toast.success('Locker created successfully');
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
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-800">Add New Locker</h2>
                <p className="text-sm text-slate-500 mt-1">Create a new locker for the branch</p>
            </div>

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
            </div>

            <div className="p-6 border-t border-slate-200 sticky bottom-0 bg-white">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#0a1b2e] text-white rounded-lg text-sm font-medium hover:bg-[#1a2b3e] disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Locker'}
                </button>
            </div>
        </form>
    );
};

export default AddLockerDrawer;
