import React, { useState, useEffect, useCallback } from 'react';
import { 
    Sparkles, CheckCircle2, Crown, Package, Download, Loader, CheckCheck, Info, 
    GitBranch, Circle, Building2, LayoutGrid, Check, CheckCircle
} from 'lucide-react';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' },
    badge: { fontSize: 9, fontWeight: 900, textTransform: 'uppercase', padding: '6px 14px', borderRadius: 12, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }
};

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
            setSelectedPlans([]); setSelectedBenefits([]); setImportResults(null);
        } catch {}
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
            setImporting(true); setImportResults(null);
            let plansImported = 0, plansSkipped = 0, benefitsImported = 0;
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};

            for (const id of selectedPlans) {
                const plan = MEMBERSHIP_PLAN_TEMPLATES.find(p => p.id === id);
                if (isPlanExisting(plan.name)) { plansSkipped++; continue; }
                try {
                    await apiClient.post('/admin/plans', { name: plan.name, description: plan.description, price: plan.price, duration: plan.duration, durationType: plan.durationType, benefits: plan.benefits, status: 'Active' }, { headers });
                    plansImported++;
                } catch { plansSkipped++; }
            }

            for (const id of selectedBenefits) {
                const b = BENEFIT_TEMPLATES.find(x => x.id === id);
                if (isBenefitExisting(b.name)) continue;
                try {
                    await apiClient.post('/admin/amenities', { name: b.name, description: b.description, bookable: b.bookable }, { headers });
                    benefitsImported++;
                } catch {}
            }

            setImportResults({ plansImported, plansSkipped, benefitsImported });
            setSelectedPlans([]); setSelectedBenefits([]); await fetchExisting();
            if (plansImported > 0 || benefitsImported > 0) toast.success(`Deployment Successful!`); 
            else toast.error('Check existing records');
        } catch (err) { toast.error('Import failed'); } finally { setImporting(false); }
    };

    return (
        <div style={{ fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.2s }
            `}</style>

            {/* Premium Header Banner (Compact Version) */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 28,
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative'
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: T.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 10px 25px -8px ${T.accent}80`
                    }}>
                        <Sparkles size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>Pre-built Templates</h1>
                        <p style={{ margin: '4px 0 0', color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scale your locations with ready-made membership programs</p>
                        {selectedBranch && (
                            <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 12, background: T.bg, color: T.accent, fontSize: 10, fontWeight: 800 }}>
                                <Building2 size={13} /> Importing into: {selectedBranch.name}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sections Container (Compact) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="fu1">
                
                {/* Membership Plans Section */}
                <div style={{ background: '#fff', borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Crown size={20} /></div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>Membership Plans</h2>
                                <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Deployment-ready plan catalog</p>
                            </div>
                        </div>
                        <div style={{ padding: '6px 16px', borderRadius: 12, background: selectedPlans.length > 0 ? T.accent : T.bg, color: selectedPlans.length > 0 ? '#fff' : T.subtle, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>
                            {selectedPlans.length} SELECTED
                        </div>
                    </div>

                    <div style={{ padding: 32, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                        {MEMBERSHIP_PLAN_TEMPLATES.map((plan) => {
                            const exists = isPlanExisting(plan.name);
                            const selected = selectedPlans.includes(plan.id);
                            return (
                                <div key={plan.id} onClick={() => togglePlan(plan.id)} style={{
                                    padding: 24, borderRadius: 24, border: `2.5px solid ${selected ? T.accent : (exists ? T.bg : T.bg)}`,
                                    background: exists ? '#FCFCFF' : (selected ? '#F5F3FF' : '#fff'),
                                    position: 'relative', cursor: exists ? 'default' : 'pointer', transition: '0.3s',
                                    opacity: exists ? 0.6 : 1
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <div style={{ 
                                            width: 40, height: 40, borderRadius: 12, 
                                            background: (selected || exists) ? T.accent : T.bg, 
                                            color: (selected || exists) ? '#fff' : T.subtle,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {exists ? <Check size={22} strokeWidth={3} /> : (selected ? <CheckCircle size={22} strokeWidth={3} /> : <Circle size={22} strokeWidth={2.5} />)}
                                        </div>
                                        <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>₹{plan.price.toLocaleString('en-IN')}</div>
                                    </div>
                                    <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 900, color: T.text }}>{plan.name}</h3>
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.muted, lineHeight: 1.5 }}>{plan.description}</p>
                                    {exists && (
                                        <div style={{ marginTop: 20, ...S.badge, background: T.greenLight, color: T.green, display: 'inline-flex' }}>
                                            <CheckCircle2 size={13} /> ALREADY IN BRANCH
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Benefit Types Section */}
                <div style={{ background: '#fff', borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} /></div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>Benefit Types</h2>
                                <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inventory of core facilities and perks</p>
                            </div>
                        </div>
                        <div style={{ padding: '6px 16px', borderRadius: 12, background: selectedBenefits.length > 0 ? T.accent : T.bg, color: selectedBenefits.length > 0 ? '#fff' : T.subtle, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>
                            {selectedBenefits.length} SELECTED
                        </div>
                    </div>

                    <div style={{ padding: 32, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                        {BENEFIT_TEMPLATES.map((benefit) => {
                            const exists = isBenefitExisting(benefit.name);
                            const selected = selectedBenefits.includes(benefit.id);
                            return (
                                <div key={benefit.id} onClick={() => toggleBenefit(benefit.id)} style={{
                                    padding: 28, borderRadius: 28, border: `2.5px solid ${selected ? T.accent : (exists ? T.bg : T.bg)}`,
                                    background: exists ? '#FCFCFF' : (selected ? '#F5F3FF' : '#fff'),
                                    display: 'flex', alignItems: 'center', gap: 24, cursor: exists ? 'default' : 'pointer', transition: '0.3s',
                                    opacity: exists ? 0.6 : 1
                                }}>
                                    <div style={{ 
                                        width: 52, height: 52, borderRadius: 16, 
                                        background: (selected || exists) ? T.accent : T.bg, 
                                        color: (selected || exists) ? '#fff' : T.subtle,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0
                                    }}>
                                        {exists ? <Check size={28} strokeWidth={3} /> : (selected ? <CheckCircle size={28} strokeWidth={3} /> : <Circle size={28} strokeWidth={2.5} />)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: T.text }}>{benefit.name}</h3>
                                            {benefit.bookable && <span style={{ fontSize: 9, fontWeight: 930, color: T.accent, background: T.bg, padding: '3px 10px', borderRadius: 8 }}>BOOKABLE</span>}
                                        </div>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.muted }}>{benefit.description}</p>
                                        {exists && (
                                            <div style={{ marginTop: 12, ...S.badge, background: T.greenLight, color: T.green, display: 'inline-flex' }}>
                                                <CheckCircle2 size={12} /> IN BRANCH
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Import Action Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fu2">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 10px' }}>
                         <Info size={18} color={T.subtle} />
                         <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.muted }}>New programs will be synchronized directly into your selected branch. Pre-existing records are automatically preserved.</p>
                    </div>
                    <button 
                        onClick={handleImport}
                        disabled={totalSelected === 0 || importing}
                        style={{ 
                            height: 72, borderRadius: 28, 
                            background: totalSelected > 0 ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : T.bg,
                            color: totalSelected > 0 ? '#fff' : T.subtle,
                            border: 'none', fontSize: 15, fontWeight: 900, textTransform: 'uppercase', 
                            letterSpacing: '0.1em', cursor: totalSelected > 0 ? 'pointer' : 'default', transition: '0.3s',
                            boxShadow: totalSelected > 0 ? T.bannerShadow : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14
                        }}
                        onMouseOver={e => totalSelected > 0 && (e.currentTarget.style.transform = 'translateY(-4px)')}
                        onMouseOut={e => totalSelected > 0 && (e.currentTarget.style.transform = 'none')}
                    >
                        {importing ? <Loader className="animate-spin" size={24} /> : <Download size={24} strokeWidth={2.5} />}
                        {importing ? 'Synchronizing catalog...' : `Import ${totalSelected} Selected Modules`}
                    </button>
                </div>
            </div>
            
            <div style={{ height: 60 }} />
        </div>
    );
};

export default PlanBenefitTemplates;
