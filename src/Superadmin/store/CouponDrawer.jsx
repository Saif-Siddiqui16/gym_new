import React, { useState, useEffect } from 'react';
import { Percent, DollarSign, Calendar, Zap, Hash, Target, CheckCircle2 } from 'lucide-react';
import { createCoupon, updateCoupon } from '../../api/storeApi';
import { toast } from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';
import RightDrawer from '../../components/common/RightDrawer';

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
        } else if (isOpen) {
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

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Create New Coupon' : 'Edit Coupon Details'}
            subtitle={mode === 'add' ? 'Setup your promo code' : `Updating details for ${formData.code}`}
            footer={
                <div className="flex gap-4 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-white text-slate-500 border-2 border-slate-100 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        form="coupon-form"
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-violet-200 hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <CheckCircle2 size={18} />
                                {mode === 'add' ? 'Create Coupon' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            }
        >
            <form id="coupon-form" onSubmit={handleSubmit} className="space-y-8 pb-4">
                {/* Code Section */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Hash size={12} strokeWidth={3} /> Coupon Code *
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g. SUMMER20"
                            required
                            className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={handleGenerateCode}
                            className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition-all shadow-sm"
                        >
                            Generate
                        </button>
                    </div>
                </div>

                {/* Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <Target size={12} strokeWidth={3} /> Discount Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="Percentage">Percentage (%)</option>
                            <option value="Fixed">Fixed Amount (₹)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                            {formData.type === 'Percentage' ? <Percent size={12} strokeWidth={3} /> : <DollarSign size={12} strokeWidth={3} />}
                            Value *
                        </label>
                        <input
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            placeholder={formData.type === 'Percentage' ? '20' : '500'}
                            required
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Min Purchase & Max Uses */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Purchase (₹)</label>
                        <input
                            type="number"
                            value={formData.minPurchase}
                            onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Uses (0 = ∞)</label>
                        <input
                            type="number"
                            value={formData.maxUses}
                            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Validity Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <Calendar size={12} strokeWidth={3} /> Valid From
                        </label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <Calendar size={12} strokeWidth={3} /> Valid Until
                        </label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief details about this offer..."
                        rows={3}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all resize-none shadow-sm"
                    />
                </div>

                {/* Status Toggle */}
                <div className="p-5 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-black text-slate-900">Current Status</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active vs Inactive</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active' })}
                        className={`w-14 h-7 rounded-full transition-all relative ${formData.status === 'Active' ? 'bg-emerald-500 shadow-md shadow-emerald-200' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${formData.status === 'Active' ? 'left-8' : 'left-1'}`} />
                    </button>
                </div>
            </form>
        </RightDrawer>
    );
};

export default CouponDrawer;
