import React, { useState, useEffect } from 'react';
import { X, Percent, DollarSign, Calendar, Info, Zap, Hash, Target, CheckCircle2 } from 'lucide-react';
import { createCoupon, updateCoupon } from '../../api/storeApi';
import { toast } from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';

const CouponDrawer = ({ isOpen, onClose, coupon, mode = 'add', onSuccess }) => {
    const { selectedBranch, branches } = useBranchContext();
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'Percentage',
        value: '',
        minPurchase: '0',
        maxUses: '0',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && coupon) {
            setFormData({
                code: coupon.code || '',
                description: coupon.description || '',
                type: coupon.type || 'Percentage',
                value: coupon.value || '',
                minPurchase: coupon.minPurchase || '0',
                maxUses: coupon.maxUses || '0',
                startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
                status: coupon.status || 'Active'
            });
        } else {
            setFormData({
                code: '',
                description: '',
                type: 'Percentage',
                value: '',
                minPurchase: '0',
                maxUses: '0',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                status: 'Active'
            });
        }
    }, [mode, coupon, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const branchLabel = selectedBranch === 'all'
                ? 'all branches'
                : (branches.find(b => b.id.toString() === selectedBranch.toString())?.name || 'branch');

            toast.dismiss();
            if (mode === 'add') {
                await createCoupon({ ...formData, branchId: selectedBranch });
                toast.success(`Coupon created successfully for ${branchLabel}`);
            } else {
                await updateCoupon(coupon.id, formData);
                toast.success('Coupon updated successfully');
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-in">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            {mode === 'add' ? <Zap className="text-amber-500" size={20} /> : <Info className="text-blue-500" size={20} />}
                            {mode === 'add' ? 'Create New Coupon' : 'Edit Coupon Details'}
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                            {mode === 'add' ? 'Setup your promo code' : `Updating ${formData.code}`}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Code Section */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Hash size={12} /> Coupon Code
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g. SUMMER20"
                                required
                                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleGenerateCode}
                                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-all"
                            >
                                Generate
                            </button>
                        </div>
                    </div>

                    {/* Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Target size={12} /> Discount Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all appearance-none cursor-pointer"
                            >
                                <option value="Percentage">Percentage (%)</option>
                                <option value="Fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                {formData.type === 'Percentage' ? <Percent size={12} /> : <DollarSign size={12} />}
                                Value
                            </label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                placeholder={formData.type === 'Percentage' ? '20' : '500'}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
                            />
                        </div>
                    </div>

                    {/* Min Purchase & Max Uses */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Purchase (₹)</label>
                            <input
                                type="number"
                                value={formData.minPurchase}
                                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Uses (0 = ∞)</label>
                            <input
                                type="number"
                                value={formData.maxUses}
                                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
                            />
                        </div>
                    </div>

                    {/* Validity Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} /> Valid From
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} /> Valid Until
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief details about this offer..."
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all resize-none"
                        />
                    </div>

                    {/* Status */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black text-slate-900">Current Status</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Toggle active state</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active' })}
                            className={`w-12 h-6 rounded-full transition-all relative ${formData.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.status === 'Active' ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] py-4 bg-violet-600 text-white rounded-xl text-sm font-black shadow-md shadow-violet-200 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <CheckCircle2 size={18} />
                                {mode === 'add' ? 'Create Coupon' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CouponDrawer;
