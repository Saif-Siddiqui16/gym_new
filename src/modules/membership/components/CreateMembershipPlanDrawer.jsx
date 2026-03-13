import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RightDrawer from '../../../components/common/RightDrawer';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import amenityApi from '../../../api/amenityApi';

const CreateMembershipPlanDrawer = ({ isOpen, onClose, onSave, initialData }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        discountedPrice: '',
        duration: 30,
        durationType: 'Months',
        admissionFee: 0,
        maxFreezeDays: 0,
        allowTransfer: false,
        showInPurchase: true,
        showOnDashboard: true,
        includeLocker: false,
        benefits: []
    });
    const [amenities, setAmenities] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const fetchAmenities = async () => {
                try {
                    const data = await amenityApi.getAll();
                    console.log('[CreateMembershipPlanDrawer] Fetched amenities:', data);
                    setAmenities(data);
                } catch (error) {
                    console.error('Failed to fetch amenities:', error);
                }
            };
            fetchAmenities();

            if (initialData) {
                // Ensure benefits is an array for the frontend
                let benefitsArray = [];
                try {
                    benefitsArray = initialData.benefits
                        ? (typeof initialData.benefits === 'string' ? JSON.parse(initialData.benefits) : initialData.benefits)
                        : [];
                } catch (e) {
                    benefitsArray = [];
                }
                setFormData({
                    ...initialData,
                    benefits: Array.isArray(benefitsArray) ? benefitsArray : []
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    price: 0,
                    discountedPrice: '',
                    duration: 30,
                    durationType: 'Months',
                    admissionFee: 0,
                    maxFreezeDays: 0,
                    allowTransfer: false,
                    showInPurchase: true,
                    showOnDashboard: true,
                    includeLocker: false,
                    benefits: []
                });
            }
        }
    }, [isOpen, initialData]);

    const handleBenefitToggle = (benefitId) => {
        setFormData(prev => {
            const exists = prev.benefits.find(b => b.id === benefitId);
            if (exists) {
                return { ...prev, benefits: prev.benefits.filter(b => b.id !== benefitId) };
            } else {
                return {
                    ...prev,
                    benefits: [...prev.benefits, { id: benefitId, limit: 'Unlimited' }]
                };
            }
        });
    };

    const handleLimitChange = (benefitId, newLimit) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.map(b => b.id === benefitId ? { ...b, limit: newLimit } : b)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const Toggle = ({ checked, onChange, title, description }) => (
        <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
            <div className="flex-1 pr-4">
                <h4 className="text-sm font-bold text-gray-900">{title}</h4>
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer pt-1">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
        </div>
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Add Membership Plan"
            subtitle="Create a new membership plan with benefits"
            maxWidth="max-w-2xl"
            footer={
                <div className="flex gap-3 w-full justify-end px-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="membership-plan-form"
                        variant="primary"
                        className="flex-1 h-11 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform active:scale-95"
                    >
                        {initialData ? 'Update Plan' : 'Create Plan'}
                    </Button>
                </div>
            }
        >
            <form id="membership-plan-form" onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Plan Name */}
                <div className="drawer-form-group">
                    <label className="drawer-label">Plan Name *</label>
                    <input
                        className="drawer-input"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Monthly Basic"
                        required
                    />
                </div>

                {/* 2. Description */}
                <div className="drawer-form-group">
                    <label className="drawer-label">Description</label>
                    <textarea
                        className="drawer-textarea"
                        placeholder="Briefly describe what this plan includes..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* 3 & 4. Price & Discounted Price */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="drawer-form-group mb-0">
                        <label className="drawer-label">Base Price (₹) *</label>
                        <input
                            type="number"
                            className="drawer-input"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="drawer-form-group mb-0">
                        <label className="drawer-label">Special Price (₹)</label>
                        <input
                            type="number"
                            className="drawer-input"
                            value={formData.discountedPrice}
                            onChange={e => setFormData({ ...formData, discountedPrice: Number(e.target.value) })}
                            placeholder="Optional"
                        />
                    </div>
                </div>

                {/* 5, 6 & 7. Duration, Admission Fee, Max Freeze Days */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="drawer-form-group mb-0">
                        <label className="drawer-label">Duration (Days) *</label>
                        <input
                            type="number"
                            className="drawer-input"
                            value={formData.duration}
                            onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="drawer-form-group mb-0">
                        <label className="drawer-label">Admission Fee (₹)</label>
                        <input
                            type="number"
                            className="drawer-input"
                            value={formData.admissionFee}
                            onChange={e => setFormData({ ...formData, admissionFee: Number(e.target.value) })}
                        />
                    </div>
                    <div className="drawer-form-group mb-0">
                        <label className="drawer-label">Max Freeze</label>
                        <input
                            type="number"
                            className="drawer-input"
                            value={formData.maxFreezeDays}
                            onChange={e => setFormData({ ...formData, maxFreezeDays: Number(e.target.value) })}
                        />
                    </div>
                </div>

                {/* Toggles */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                    <Toggle
                        title="Allow membership transfer"
                        description="Transferable"
                        checked={formData.allowTransfer}
                        onChange={(e) => setFormData({ ...formData, allowTransfer: e.target.checked })}
                    />
                    <Toggle
                        title="Show plan in purchase options"
                        description="Active"
                        checked={formData.showInPurchase}
                        onChange={(e) => setFormData({ ...formData, showInPurchase: e.target.checked })}
                    />
                    <Toggle
                        title="Show on member dashboard"
                        description="Visible to Members"
                        checked={formData.showOnDashboard}
                        onChange={(e) => setFormData({ ...formData, showOnDashboard: e.target.checked })}
                    />
                    <Toggle
                        title="Includes physical locker"
                        description="Free Locker"
                        checked={formData.includeLocker}
                        onChange={(e) => setFormData({ ...formData, includeLocker: e.target.checked })}
                    />
                </div>

                {/* Plan Benefits */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between pb-2">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Plan Benefits</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 opacity-70">Assign limits for facilities</p>
                        </div>
                        <button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/branchadmin/settings/amenities')}
                            className="text-xs h-8 px-3"
                        >
                            Manage Types
                        </button>
                    </div>

                    <div className="space-y-3">
                        {amenities.map(benefit => {
                            const isSelected = formData.benefits?.find(b => b.id === benefit.id);
                            return (
                                <div
                                    key={benefit.id}
                                    className={`p-4 rounded-xl border-2 transition-all ${isSelected
                                        ? 'border-primary bg-primary-light/10'
                                        : 'border-slate-100 bg-white'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            onClick={() => handleBenefitToggle(benefit.id)}
                                            className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-slate-300'
                                                }`}
                                        >
                                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-col justify-between items-start gap-1">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm">{benefit.name}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60 mt-0.5">{benefit.description || 'Facility access'}</p>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                                    <label className="drawer-label mb-1"> Usage Limit (Total) </label>
                                                    <input
                                                        type="text"
                                                        className="drawer-input h-9 px-3"
                                                        value={isSelected.limit}
                                                        onChange={e => handleLimitChange(benefit.id, e.target.value)}
                                                        placeholder="e.g. 5 or Unlimited"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {amenities.length === 0 && (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">No benefits defined</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </RightDrawer>
    );
};

export default CreateMembershipPlanDrawer;
