import React, { useState, useEffect } from 'react';
import { Percent, DollarSign, Calendar, Zap, Hash, Target, CheckCircle2, Search, Users } from 'lucide-react';
import { createCoupon, updateCoupon } from '../../api/storeApi';
import { getMembers } from '../../api/manager/managerApi';
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
        maximumDiscount: '',
        minPurchase: '0',
        maxUses: '0',
        applicableService: 'All',
        visibilityType: 'Public',
        targetedMemberIds: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Active'
    });
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [loadingMembers, setLoadingMembers] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && coupon) {
            setFormData({
                code: coupon.code || '',
                description: coupon.description || '',
                type: coupon.type || 'Percentage',
                value: coupon.value || '',
                maximumDiscount: coupon.maximumDiscount || '',
                minPurchase: coupon.minPurchase || '0',
                maxUses: coupon.maxUses || '0',
                applicableService: coupon.applicableService || 'All',
                visibilityType: coupon.visibilityType || 'Public',
                targetedMemberIds: coupon.targetedMemberIds ? JSON.parse(coupon.targetedMemberIds) : [],
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
                maximumDiscount: '',
                minPurchase: '0',
                maxUses: '0',
                applicableService: 'All',
                visibilityType: 'Public',
                targetedMemberIds: [],
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                status: 'Active'
            });
        }
    }, [mode, coupon, isOpen]);

    useEffect(() => {
        if (formData.visibilityType === 'Targeted' && members.length === 0) {
            fetchMembers();
        }
    }, [formData.visibilityType]);

    const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
            const response = await getMembers({ limit: 1000 }); // Fetch up to 1000 members for selection
            setMembers(response.data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
            toast.error('Failed to load members');
        } finally {
            setLoadingMembers(false);
        }
    };

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

                {/* Maximum Discount (Only for Percentage) */}
                {formData.type === 'Percentage' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <DollarSign size={12} strokeWidth={3} /> Maximum Discount Cap (₹)
                        </label>
                        <input
                            type="number"
                            value={formData.maximumDiscount}
                            onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })}
                            placeholder="Leave empty for no limit"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                )}

                {/* Service & Visibility */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Applicable Service</label>
                        <select
                            value={formData.applicableService}
                            onChange={(e) => setFormData({ ...formData, applicableService: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="All">All Services</option>
                            <option value="Membership">Membership</option>
                            <option value="PT">Personal Training</option>
                            <option value="POS">Store / POS</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visibility Type</label>
                        <select
                            value={formData.visibilityType}
                            onChange={(e) => setFormData({ ...formData, visibilityType: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="Public">Public (Show All)</option>
                            <option value="Targeted">Targeted (Specific Members)</option>
                            <option value="Private">Private (Code Only)</option>
                        </select>
                    </div>
                </div>

                {/* Targeted Member Selection */}
                {formData.visibilityType === 'Targeted' && (
                    <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <Users size={12} strokeWidth={3} /> Target Members
                            </label>
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {formData.targetedMemberIds.length} Selected
                            </span>
                        </div>
                        
                        {/* Member Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                placeholder="Search by name or ID..."
                                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm"
                            />
                        </div>

                        {/* Members List */}
                        <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {loadingMembers ? (
                                <div className="py-8 text-center text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                                    Scanning Database...
                                </div>
                            ) : members.filter(m => 
                                m.name?.toLowerCase().includes(memberSearch.toLowerCase()) || 
                                m.memberId?.toLowerCase().includes(memberSearch.toLowerCase())
                            ).length === 0 ? (
                                <div className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    No members found
                                </div>
                            ) : (
                                members.filter(m => 
                                    m.name?.toLowerCase().includes(memberSearch.toLowerCase()) || 
                                    m.memberId?.toLowerCase().includes(memberSearch.toLowerCase())
                                ).map(member => (
                                    <div 
                                        key={member.id}
                                        onClick={() => {
                                            const currentIds = [...formData.targetedMemberIds];
                                            const index = currentIds.indexOf(member.id);
                                            if (index === -1) {
                                                currentIds.push(member.id);
                                            } else {
                                                currentIds.splice(index, 1);
                                            }
                                            setFormData({ ...formData, targetedMemberIds: currentIds });
                                        }}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                            formData.targetedMemberIds.includes(member.id)
                                            ? 'bg-white border-primary shadow-md'
                                            : 'bg-white/50 border-white hover:border-slate-200'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                            formData.targetedMemberIds.includes(member.id)
                                            ? 'bg-primary border-primary'
                                            : 'bg-white border-slate-200'
                                        }`}>
                                            {formData.targetedMemberIds.includes(member.id) && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-900 truncate uppercase tracking-wide">{member.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {member.memberId}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {formData.targetedMemberIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, targetedMemberIds: [] })}
                                className="w-full py-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>
                )}

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
