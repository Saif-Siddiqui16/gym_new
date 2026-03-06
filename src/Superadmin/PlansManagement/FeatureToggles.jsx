import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';

import { fetchPlans, togglePlanFeature, updatePlanFeatures } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const FeatureToggles = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [plans, setPlans] = useState([]);
    const [allPlansData, setAllPlansData] = useState([]);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        const data = await fetchPlans();
        setAllPlansData(data);
        setPlans(data.map(p => ({ id: p.id, name: p.name })));
    };

    // Features with descriptions and toggle states
    const [features, setFeatures] = useState([
        { id: 'gym_management', name: 'Gym Management', description: 'Manage gym branches, locations, and settings', enabled: false },
        { id: 'trainer_management', name: 'Trainer Management', description: 'Assign and manage trainers, track sessions', enabled: false },
        { id: 'member_management', name: 'Member Management', description: 'Complete member lifecycle management', enabled: false },
        { id: 'payment_reports', name: 'Payment Reports', description: 'Financial reports, invoices, and GST reports', enabled: false },
        { id: 'analytics_dashboard', name: 'Analytics Dashboard', description: 'Advanced analytics and business insights', enabled: false },
        { id: 'access_control', name: 'Access Control', description: 'Entry/exit logs and access management', enabled: false },
        { id: 'locker_management', name: 'Locker Management', description: 'Assign and manage lockers for members', enabled: false },
        { id: 'booking_system', name: 'Booking System', description: 'Sauna, ice bath, and facility bookings', enabled: false },
        { id: 'wallet_management', name: 'Wallet Management', description: 'Member benefit wallet and credit system', enabled: false },
        { id: 'task_management', name: 'Task Management', description: 'Assign and track staff tasks', enabled: false }
    ]);

    const handlePlanChange = (val) => {
        const planId = val;
        setSelectedPlan(planId);

        if (planId) {
            const plan = allPlansData.find(p => p.id === parseInt(planId));
            const enabledFeatureIds = plan?.features || [];

            setFeatures(prevFeatures =>
                prevFeatures.map(feature => ({
                    ...feature,
                    enabled: enabledFeatureIds.includes(feature.id)
                }))
            );
        } else {
            setFeatures(prevFeatures =>
                prevFeatures.map(feature => ({ ...feature, enabled: false }))
            );
        }
    };

    const handleFeatureToggle = (featureId) => {
        setFeatures(prevFeatures =>
            prevFeatures.map(feature =>
                feature.id === featureId
                    ? { ...feature, enabled: !feature.enabled }
                    : feature
            )
        );
    };

    const handleSave = async () => {
        if (!selectedPlan) {
            alert('Please select a plan first');
            return;
        }

        setIsSaving(true);
        try {
            const planId = parseInt(selectedPlan);
            const enabledFeatures = features
                .filter(f => f.enabled)
                .map(f => f.id);

            await updatePlanFeatures(planId, enabledFeatures);

            setIsSaving(false);
            alert('Features updated successfully!');
            navigate('/superadmin/plans/list');
        } catch (error) {
            console.error('Error saving features:', error);
            alert('Failed to save features');
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setSelectedPlan('');
        setFeatures(prevFeatures =>
            prevFeatures.map(feature => ({
                ...feature,
                enabled: false
            }))
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            {/* Page Header - Back Button */}
            <div className="w-full max-w-5xl mb-6">
                <button
                    onClick={() => navigate('/superadmin/plans/list')}
                    className="group flex items-center text-gray-500 hover:text-indigo-600 transition-colors duration-200"
                >
                    <div className="p-1 rounded-full group-hover:bg-indigo-50 transition-colors duration-200 mr-2">
                        {/* ChevronLeft or ArrowLeft - keeping consistent with other pages if possible, using whatever was imported or standard icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    </div>
                    <span className="font-medium">Back to Plans</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl items-start mb-2">
                <h1 className="text-2xl font-bold text-gray-800 md:hidden mb-4">Feature Toggles</h1>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="px-6 py-8 sm:px-10 border-b border-gray-100 bg-white">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Feature Toggles</h2>
                    <p className="text-sm text-gray-500 mt-2">Manage availability of features for specific subscription plans.</p>
                </div>

                <div className="px-6 py-8 sm:px-10 space-y-8">
                    {/* Plan Selector */}
                    <div className="max-w-md">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Plan
                        </label>
                        <div className="relative">
                            <CustomDropdown
                                options={plans.map(p => ({ value: p.id, label: p.name }))}
                                value={selectedPlan}
                                onChange={handlePlanChange}
                                placeholder="Choose a plan to manage features..."
                                className="w-full"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    {selectedPlan ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {features.map((feature) => (
                                    <div
                                        key={feature.id}
                                        className={`p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 ${feature.enabled ? 'bg-indigo-50/30 border-indigo-200' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className="flex-1">
                                            <h3 className={`text-sm font-bold ${feature.enabled ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                {feature.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center pt-0.5">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={feature.enabled}
                                                    onChange={() => handleFeatureToggle(feature.id)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="pt-8 flex flex-col-reverse md:flex-row items-center justify-end gap-4 border-t border-gray-100 mt-8">
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="w-full md:w-auto px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full md:w-auto flex items-center justify-center px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 border border-transparent rounded-xl text-sm font-semibold text-white hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={18} className="mr-2" />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                <SettingsIcon className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No Plan Selected</h3>
                            <p className="text-sm text-gray-500 max-w-sm mt-1">
                                Select a subscription plan from the dropdown above to view and manage its enabled features.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper icon component for empty state
const SettingsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export default FeatureToggles;
