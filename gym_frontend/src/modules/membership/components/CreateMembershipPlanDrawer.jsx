import React, { useState, useEffect } from 'react';
import { X, Save, Check, Dumbbell, AlertTriangle } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import amenityApi from '../../../api/amenityApi';

const CreateMembershipPlanDrawer = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: '',
        durationType: 'Months',
        description: '',
        benefits: []
    });
    const [amenities, setAmenities] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const fetchAmenities = async () => {
                try {
                    const data = await amenityApi.getAll();
                    setAmenities(data);
                } catch (error) {
                    console.error('Failed to fetch amenities:', error);
                }
            };
            fetchAmenities();

            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    name: '',
                    price: '',
                    duration: '',
                    durationType: 'Months',
                    description: '',
                    creditsPerBooking: 1,
                    maxBookingsPerDay: 1,
                    maxBookingsPerWeek: 7,
                    cancellationWindow: 4,
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

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Membership Plan' : 'Create Membership Plan'}
            subtitle="Configure plan details and benefits"
            maxWidth="max-w-2xl"
            footer={
                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-3 rounded-xl">Cancel</Button>
                    <Button
                        type="submit"
                        form="membership-plan-form"
                        variant="primary"
                        className="flex-1 py-3 rounded-xl shadow-lg shadow-indigo-200"
                    >
                        <Save size={18} className="mr-2" />
                        Save Plan
                    </Button>
                </div>
            }
        >
            <form id="membership-plan-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Plan Details</h3>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plan Name</label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Gold Annual"
                            className="font-bold"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (₹)</label>
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="e.g. 19999"
                                className="font-bold"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                                <Input
                                    type="number"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g. 12"
                                    className="font-bold"
                                    required
                                />
                            </div>
                            <div className="w-1/3">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unit</label>
                                <select
                                    className="w-full h-12 bg-gray-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                                    value={formData.durationType}
                                    onChange={e => setFormData({ ...formData, durationType: e.target.value })}
                                >
                                    <option>Months</option>
                                    <option>Days</option>
                                    <option>Years</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea
                            className="w-full p-4 bg-gray-50 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none resize-none h-24 transition-all"
                            placeholder="What does this plan include?"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Booking & Consumption */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Booking & Consumption</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Credits / Booking</label>
                            <Input
                                type="number"
                                value={formData.creditsPerBooking}
                                onChange={e => setFormData({ ...formData, creditsPerBooking: e.target.value })}
                                className="font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cancellation Window (Hrs)</label>
                            <Input
                                type="number"
                                value={formData.cancellationWindow}
                                onChange={e => setFormData({ ...formData, cancellationWindow: e.target.value })}
                                className="font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Bookings / Day</label>
                            <Input
                                type="number"
                                value={formData.maxBookingsPerDay}
                                onChange={e => setFormData({ ...formData, maxBookingsPerDay: e.target.value })}
                                className="font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Bookings / Week</label>
                            <Input
                                type="number"
                                value={formData.maxBookingsPerWeek}
                                onChange={e => setFormData({ ...formData, maxBookingsPerWeek: e.target.value })}
                                className="font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Benefits Configuration */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Included Benefits</h3>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                            {formData.benefits?.length || 0} Selected
                        </span>
                    </div>

                    <div className="space-y-3">
                        {amenities.map(benefit => {
                            const isSelected = formData.benefits?.find(b => b.id === benefit.id);
                            return (
                                <div
                                    key={benefit.id}
                                    className={`p-4 rounded-xl border-2 transition-all ${isSelected
                                        ? 'border-indigo-500 bg-indigo-50/10'
                                        : 'border-gray-100 bg-white hover:border-indigo-200'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            onClick={() => handleBenefitToggle(benefit.id)}
                                            className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                                                }`}
                                        >
                                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-col justify-between items-start gap-1">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{benefit.name}</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">{benefit.description || 'Facility access'}</p>
                                                </div>
                                                {benefit.gender && benefit.gender !== 'UNISEX' && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${benefit.gender === 'MALE' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                                        {benefit.gender} ONLY
                                                    </span>
                                                )}
                                            </div>

                                            {isSelected && (
                                                <div className="mt-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                                            Usage Limit (Total)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="w-full h-9 px-3 bg-white border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-100"
                                                            value={isSelected.limit}
                                                            onChange={e => handleLimitChange(benefit.id, e.target.value)}
                                                            placeholder="e.g. 5 or Unlimited"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {amenities.length === 0 && (
                            <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">No amenities found. Please add them in Settings first.</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </RightDrawer>
    );
};

export default CreateMembershipPlanDrawer;
