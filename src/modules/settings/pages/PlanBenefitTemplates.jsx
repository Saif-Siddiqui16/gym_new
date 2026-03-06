import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, CheckCircle2, Crown, Package, Download, Loader, CheckCheck, Info, GitBranch } from 'lucide-react';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';

const MEMBERSHIP_PLAN_TEMPLATES = [
    { id: 'tpl_1', name: 'Basic Monthly', price: 1500, duration: 30, durationType: 'Days', description: 'Gym access only — 30 days', benefits: ['Gym Access'] },
    { id: 'tpl_2', name: 'Standard Monthly', price: 2500, duration: 30, durationType: 'Days', description: 'Gym + Group Classes — 30 days', benefits: ['Gym Access', 'Group Classes'] },
    { id: 'tpl_3', name: 'Premium Monthly', price: 4000, duration: 30, durationType: 'Days', description: 'Full access with all amenities — 30 days', benefits: ['Gym Access', 'Group Classes', 'Steam Room', 'Locker'] },
    { id: 'tpl_4', name: 'Quarterly Plan', price: 10800, duration: 90, durationType: 'Days', description: 'Full access — 90 days with 10% discount', benefits: ['Gym Access', 'Group Classes'] },
    { id: 'tpl_5', name: 'Half Yearly Plan', price: 20400, duration: 180, durationType: 'Days', description: 'Full access — 180 days with 15% discount', benefits: ['Gym Access', 'Group Classes', 'Swimming Pool'] },
    { id: 'tpl_6', name: 'Annual Plan', price: 36000, duration: 365, durationType: 'Days', description: 'Full access — 365 days with 25% discount', benefits: ['Gym Access', 'Group Classes', 'Steam Room', 'Swimming Pool', 'Locker'] },
    { id: 'tpl_7', name: 'Day Pass', price: 200, duration: 1, durationType: 'Days', description: 'Single day gym access', benefits: ['Gym Access'] },
    { id: 'tpl_8', name: 'Student Plan', price: 1000, duration: 30, durationType: 'Days', description: 'Discounted monthly plan for students', benefits: ['Gym Access'] },
];

const BENEFIT_TEMPLATES = [
    { id: 'bt_1', name: 'Gym Access', description: 'Full gym floor access', bookable: false },
    { id: 'bt_2', name: 'Swimming Pool', description: 'Pool access with lane booking', bookable: true },
    { id: 'bt_3', name: 'Steam Room', description: 'Steam and sauna facility', bookable: true },
    { id: 'bt_4', name: 'Group Classes', description: 'All group fitness classes', bookable: true },
    { id: 'bt_5', name: 'Personal Training', description: '1-on-1 trainer sessions', bookable: true },
    { id: 'bt_6', name: 'Locker', description: 'Personal locker assignment', bookable: false },
    { id: 'bt_7', name: 'Towel Service', description: 'Fresh towel each visit', bookable: false },
    { id: 'bt_8', name: 'Nutrition Consultation', description: 'Diet plan consultations', bookable: true },
    { id: 'bt_9', name: 'Body Composition Analysis', description: 'InBody / body scan sessions', bookable: true },
    { id: 'bt_10', name: 'Parking', description: 'Dedicated parking spot', bookable: false },
];

const PlanBenefitTemplates = () => {
    const { selectedBranch } = useBranchContext();
    const [selectedPlans, setSelectedPlans] = useState([]);
    const [selectedBenefits, setSelectedBenefits] = useState([]);
    const [existingPlanNames, setExistingPlanNames] = useState([]);
    const [existingAmenityNames, setExistingAmenityNames] = useState([]);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState(null);

    const fetchExisting = useCallback(async () => {
        try {
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};
            const [plansRes, amenitiesRes] = await Promise.all([
                apiClient.get('/admin/plans', { headers }),
                apiClient.get('/admin/amenities', { headers }).catch(() => ({ data: [] })),
            ]);
            setExistingPlanNames((plansRes.data || []).map(p => p.name?.toLowerCase()));
            setExistingAmenityNames((amenitiesRes.data || []).map(a => a.name?.toLowerCase()));
            // Reset selections when branch changes
            setSelectedPlans([]);
            setSelectedBenefits([]);
            setImportResults(null);
        } catch {
            // Silently fail - won't block template display
        }
    }, [selectedBranch]);

    useEffect(() => { fetchExisting(); }, [fetchExisting]);

    const isPlanExisting = (name) => existingPlanNames.includes(name.toLowerCase());
    const isBenefitExisting = (name) => existingAmenityNames.includes(name.toLowerCase());

    const togglePlan = (id) => {
        const plan = MEMBERSHIP_PLAN_TEMPLATES.find(p => p.id === id);
        if (isPlanExisting(plan.name)) return;
        setSelectedPlans(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const toggleBenefit = (id) => {
        const b = BENEFIT_TEMPLATES.find(b => b.id === id);
        if (isBenefitExisting(b.name)) return;
        setSelectedBenefits(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const totalSelected = selectedPlans.length + selectedBenefits.length;

    const handleImport = async () => {
        if (totalSelected === 0) return;
        try {
            setImporting(true);
            setImportResults(null);
            let plansImported = 0;
            let plansSkipped = 0;
            let benefitsImported = 0;

            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};

            // Import selected plans
            for (const id of selectedPlans) {
                const plan = MEMBERSHIP_PLAN_TEMPLATES.find(p => p.id === id);
                if (isPlanExisting(plan.name)) { plansSkipped++; continue; }
                try {
                    await apiClient.post('/admin/plans', {
                        name: plan.name,
                        description: plan.description,
                        price: plan.price,
                        duration: plan.duration,
                        durationType: plan.durationType,
                        benefits: plan.benefits,
                        status: 'Active',
                    }, { headers });
                    plansImported++;
                } catch { plansSkipped++; }
            }

            // Import selected benefit types (as amenities)
            for (const id of selectedBenefits) {
                const b = BENEFIT_TEMPLATES.find(x => x.id === id);
                if (isBenefitExisting(b.name)) continue;
                try {
                    await apiClient.post('/admin/amenities', {
                        name: b.name,
                        description: b.description,
                        bookable: b.bookable,
                    }, { headers }).catch(() => null);
                    benefitsImported++;
                } catch { /* skip */ }
            }

            setImportResults({ plansImported, plansSkipped, benefitsImported });
            setSelectedPlans([]);
            setSelectedBenefits([]);
            await fetchExisting();

            if (plansImported > 0 || benefitsImported > 0) {
                const branchName = selectedBranch?.name || 'branch';
                toast.success(`Imported ${plansImported} plans into ${branchName}!`);
            } else {
                toast.error('Nothing was imported. All selected items may already exist.');
            }
        } catch (err) {
            toast.error('Import failed: ' + (err?.message || 'Unknown error'));
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-8 p-0 md:p-6 animate-fadeIn">
            {/* Header */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-3xl blur-3xl opacity-10 pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl shadow-indigo-500/10 border border-white/50 p-6 sm:p-10">
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shrink-0">
                            <Sparkles size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pre-built Templates</h1>
                            <p className="text-slate-500 text-sm font-medium mt-1 max-w-2xl">
                                Select and import ready-made membership plans and benefit types into your branch. Items that already exist are marked and cannot be re-imported.
                            </p>
                            {selectedBranch && (
                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl text-xs font-black text-indigo-600">
                                    <GitBranch size={12} /> Importing into: {selectedBranch.name}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Import Results */}
            {importResults && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4">
                    <CheckCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="font-black text-emerald-800 text-sm">Import Successful!</p>
                        <p className="text-emerald-600 text-xs font-bold mt-0.5">
                            {importResults.plansImported} plans • {importResults.benefitsImported} benefits imported
                            {importResults.plansSkipped > 0 && ` • ${importResults.plansSkipped} already existed (skipped)`}
                        </p>
                    </div>
                </div>
            )}

            {/* Membership Plans Section */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Crown size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900">Membership Plans</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Select plans to import into your branch</p>
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedPlans.length > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedPlans.length} selected
                    </span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MEMBERSHIP_PLAN_TEMPLATES.map((plan) => {
                        const exists = isPlanExisting(plan.name);
                        const selected = selectedPlans.includes(plan.id);
                        return (
                            <div
                                key={plan.id}
                                onClick={() => togglePlan(plan.id)}
                                className={`group relative rounded-2xl border-2 p-5 transition-all duration-200 ${
                                    exists
                                        ? 'border-slate-100 bg-slate-50/70 cursor-not-allowed opacity-70'
                                        : selected
                                        ? 'border-indigo-500 bg-indigo-50/30 shadow-md -translate-y-0.5 cursor-pointer'
                                        : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm cursor-pointer'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                        exists ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : selected ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'border-slate-200 text-transparent group-hover:border-indigo-300'
                                    }`}>
                                        <CheckCircle2 size={13} strokeWidth={3} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-3 mb-1">
                                            <h3 className="font-black text-slate-800 text-sm">{plan.name}</h3>
                                            <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-black ${selected ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-100 text-indigo-600'}`}>
                                                ₹{plan.price.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold">{plan.description}</p>
                                        {exists && (
                                            <span className="inline-flex items-center gap-1 mt-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                                <CheckCheck size={10} /> Already in branch
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Benefit Types Section */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                            <Package size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900">Benefit Types</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Amenities and perks to include in plans</p>
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedBenefits.length > 0 ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedBenefits.length} selected
                    </span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {BENEFIT_TEMPLATES.map((benefit) => {
                        const exists = isBenefitExisting(benefit.name);
                        const selected = selectedBenefits.includes(benefit.id);
                        return (
                            <div
                                key={benefit.id}
                                onClick={() => toggleBenefit(benefit.id)}
                                className={`group relative rounded-2xl border-2 p-5 transition-all duration-200 ${
                                    exists
                                        ? 'border-slate-100 bg-slate-50/70 cursor-not-allowed opacity-70'
                                        : selected
                                        ? 'border-violet-500 bg-violet-50/30 shadow-md -translate-y-0.5 cursor-pointer'
                                        : 'border-slate-100 bg-white hover:border-violet-200 hover:shadow-sm cursor-pointer'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                        exists ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : selected ? 'bg-violet-600 border-violet-600 text-white'
                                        : 'border-slate-200 text-transparent group-hover:border-violet-300'
                                    }`}>
                                        <CheckCircle2 size={13} strokeWidth={3} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-slate-800 text-sm">{benefit.name}</h3>
                                            {benefit.bookable && (
                                                <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded text-[9px] font-black uppercase tracking-widest border border-violet-100">
                                                    Bookable
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold">{benefit.description}</p>
                                        {exists && (
                                            <span className="inline-flex items-center gap-1 mt-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                                <CheckCheck size={10} /> Already in branch
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-3 px-2">
                <Info size={14} className="text-slate-300 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 font-bold">Plans will be created directly in your branch. Benefits marked "Already in branch" are automatically skipped during import.</p>
            </div>

            {/* Import Button */}
            <div className="pb-4">
                <button
                    onClick={handleImport}
                    disabled={totalSelected === 0 || importing}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 ${
                        totalSelected > 0 && !importing
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99]'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {importing ? <Loader className="animate-spin" size={20} /> : <Download size={20} />}
                    {importing ? 'Importing...' : `Import Selected (${totalSelected} items)`}
                </button>
            </div>
        </div>
    );
};

export default PlanBenefitTemplates;
