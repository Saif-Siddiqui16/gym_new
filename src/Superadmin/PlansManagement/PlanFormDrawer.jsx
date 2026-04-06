import React, { useState, useEffect } from 'react';
import {
    Save, Plus, Trash2, CheckCircle2, Info, Sparkles, ChevronDown, ChevronRight,
    Building2, Activity, Gift, Infinity, Wrench, Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import CustomDropdown from '../../components/common/CustomDropdown';
import { addPlan, editPlan, fetchPlans } from '../../api/superadmin/superAdminApi';
import PlanLimitField from './PlanLimitField';

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        // primary purple
  accent2: '#9B7BFF',       // lighter purple
  accentLight: '#F0ECFF',   // purple tint bg
  accentMid: '#E4DCFF',     // purple border/focus
  border: '#EAE7FF',        // default borders
  bg: '#F6F5FF',            // page background
  surface: '#FFFFFF',       // card/input surface
  text: '#1A1533',          // primary text
  muted: '#7B7A8E',         // secondary text
  subtle: '#B0ADCC',        // subtle icons/placeholders
  green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7',
  rose: '#F43F5E', roseLight: '#FFF1F4',
};

const PlanFormDrawer = ({ isOpen, onClose, editId, onSuccess }) => {
    const [formData, setFormData] = useState({
        planName: '', price: '', billingCycle: 'Monthly', description: '', status: true,
        features: [],
        limits: {
            branches: { value: 1, isUnlimited: false },
            managers: { value: 2, isUnlimited: false },
            staff: { value: 5, isUnlimited: false },
            trainers: { value: 3, isUnlimited: false },
            members: { value: 100, isUnlimited: false }
        },
        opsLimits: {
            workouts: { value: 10, isUnlimited: false },
            diets: { value: 10, isUnlimited: false },
            classes: { value: 5, isUnlimited: false },
            checkins: { value: 30, isUnlimited: false },
            leads: { value: 50, isUnlimited: false }
        },
        benefits: []
    });

    const [activeSections, setActiveSections] = useState({ basic: true, limits: true, ops: true, benefits: true });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (editId) { loadPlan(parseInt(editId)); }
            else { resetForm(); }
            setErrors({});
        }
    }, [isOpen, editId]);

    const resetForm = () => setFormData({
        planName: '', price: '', billingCycle: 'Monthly', description: '', status: true, features: [],
        limits: { branches: { value: 1, isUnlimited: false }, managers: { value: 2, isUnlimited: false }, staff: { value: 5, isUnlimited: false }, trainers: { value: 3, isUnlimited: false }, members: { value: 100, isUnlimited: false } },
        opsLimits: { workouts: { value: 10, isUnlimited: false }, diets: { value: 10, isUnlimited: false }, classes: { value: 5, isUnlimited: false }, checkins: { value: 30, isUnlimited: false }, leads: { value: 50, isUnlimited: false } },
        benefits: []
    });

    const loadPlan = async (id) => {
        const allPlans = await fetchPlans();
        const plan = allPlans.find(p => p.id === id);
        if (plan) {
            setFormData(prev => ({
                ...prev,
                planName: plan.name, price: plan.price, billingCycle: plan.period, description: plan.description || '', status: plan.status === 'Active',
                features: plan.features || [],
                limits: { branches: plan.limits?.branches || prev.limits.branches, managers: plan.limits?.managers || prev.limits.managers, staff: plan.limits?.staff || prev.limits.staff, trainers: plan.limits?.trainers || prev.limits.trainers, members: plan.limits?.members || prev.limits.members },
                opsLimits: { workouts: plan.opsLimits?.workouts || prev.opsLimits.workouts, diets: plan.opsLimits?.diets || prev.opsLimits.diets, classes: plan.opsLimits?.classes || prev.opsLimits.classes, checkins: plan.opsLimits?.checkins || prev.opsLimits.checkins, leads: plan.opsLimits?.leads || prev.opsLimits.leads },
                benefits: plan.benefits || []
            }));
        }
    };

    const toggleSection = (section) => setActiveSections(prev => ({ ...prev, [section]: !prev[section] }));
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };
    const handleLimitChange = (group, field, key, value) => {
        setFormData(prev => ({ ...prev, [group]: { ...prev[group], [field]: { ...prev[group][field], [key]: value } } }));
    };

    const addBenefit = () => setFormData(prev => ({ ...prev, benefits: [...prev.benefits, { id: Date.now(), name: '', limit: '5', isUnlimited: false, unit: 'Lifetime', gender: 'All', room: '' }] }));
    const removeBenefit = (id) => setFormData(prev => ({ ...prev, benefits: prev.benefits.filter(b => b.id !== id) }));
    const updateBenefit = (id, field, value) => setFormData(prev => ({ ...prev, benefits: prev.benefits.map(b => b.id === id ? { ...b, [field]: value } : b) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.planName.trim()) newErrors.planName = 'Plan name required';
        if (!formData.price) newErrors.price = 'Price required';
        if (!formData.description.trim()) newErrors.description = 'Description required';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); toast.error("Please fill all fields"); return; }

        setIsSubmitting(true);
        try {
            const planData = { name: formData.planName, price: formData.price, period: formData.billingCycle, features: formData.features, limits: formData.limits, opsLimits: formData.opsLimits, benefits: formData.benefits, status: formData.status ? 'Active' : 'Inactive', description: formData.description };
            if (editId) await editPlan(parseInt(editId), planData);
            else await addPlan(planData);
            onSuccess(); onClose();
        } catch (error) { console.error(error); toast.error('Failed to save plan'); }
        finally { setIsSubmitting(false); }
    };

    const CollapsibleHeader = ({ icon: Icon, title, subtitle, section, active, color }) => (
        <div
            onClick={() => toggleSection(section)}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', cursor: 'pointer', borderRadius: '18px',
                background: active ? T.bg : 'transparent', border: `1.5px solid ${active ? T.accentMid : 'transparent'}`,
                transition: '0.2s', marginBottom: '8px'
            }}
            onMouseEnter={e => { if(!active) e.currentTarget.style.background = T.bg; }}
            onMouseLeave={e => { if(!active) e.currentTarget.style.background = 'transparent'; }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: T.surface, border: `1px solid ${T.border}`, color: color, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.3px' }}>{title}</h4>
                    {subtitle && <p style={{ fontSize: '9px', fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0' }}>{subtitle}</p>}
                </div>
            </div>
            <div style={{ color: T.subtle, transform: active ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>
                <ChevronDown size={18} />
            </div>
        </div>
    );

    const InputLabel = ({ children }) => (
        <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            {children}
        </label>
    );

    const inputStyle = (err) => ({
        width: '100%', padding: '12px 16px', background: T.bg, border: `1.5px solid ${err ? T.rose : T.border}`,
        borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: T.text, outline: 'none', transition: 'all 0.2s',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

            {/* SECTION 1: BASIC INFO */}
            <div style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, padding: '12px', boxShadow: '0 4px 20px rgba(124,92,252,0.04)' }}>
                <CollapsibleHeader icon={Wrench} title="Basic Information" subtitle="Plan details and pricing" section="basic" active={activeSections.basic} color={T.accent} />
                {activeSections.basic && (
                    <div style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeUp 0.3s forwards' }}>
                        <div>
                            <InputLabel>Plan Name *</InputLabel>
                            <input type="text" name="planName" style={inputStyle(errors.planName)} placeholder="e.g., Premium Monthly" value={formData.planName} onChange={handleInputChange} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                            {errors.planName && <p style={{ fontSize: '11px', color: T.rose, fontWeight: 700, margin: '6px 0 0' }}>{errors.planName}</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <InputLabel>Price (₹) *</InputLabel>
                                <input type="number" name="price" style={inputStyle(errors.price)} placeholder="4999" value={formData.price} onChange={handleInputChange} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                            </div>
                            <div>
                                <InputLabel>Billing Cycle</InputLabel>
                                <select style={inputStyle()} value={formData.billingCycle} onChange={(e) => setFormData(p => ({ ...p, billingCycle: e.target.value }))} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border}>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Yearly">Yearly</option>
                                    <option value="Lifetime">Lifetime</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <InputLabel>Description *</InputLabel>
                            <textarea name="description" style={{ ...inputStyle(errors.description), minHeight: '100px', resize: 'none' }} placeholder="Briefly describe this plan..." value={formData.description} onChange={handleInputChange} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                        </div>
                    </div>
                )}
            </div>

            {/* SECTION 2: RESOURCE QUOTAS */}
            <div style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, padding: '12px', boxShadow: '0 4px 20px rgba(124,92,252,0.04)' }}>
                <CollapsibleHeader icon={Building2} title="Resource Limits" subtitle="Gym, staff and member limits" section="limits" active={activeSections.limits} color={T.green} />
                {activeSections.limits && (
                    <div style={{ padding: '16px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', animation: 'fadeUp 0.3s forwards' }}>
                        <PlanLimitField label="Gyms" value={formData.limits.branches.value} isUnlimited={formData.limits.branches.isUnlimited} onChange={(v) => handleLimitChange('limits', 'branches', 'value', v)} onToggleUnlimited={(v) => handleLimitChange('limits', 'branches', 'isUnlimited', v)} />
                        <PlanLimitField label="Managers" value={formData.limits.managers.value} isUnlimited={formData.limits.managers.isUnlimited} onChange={(v) => handleLimitChange('limits', 'managers', 'value', v)} onToggleUnlimited={(v) => handleLimitChange('limits', 'managers', 'isUnlimited', v)} />
                        <PlanLimitField label="Staff" value={formData.limits.staff.value} isUnlimited={formData.limits.staff.isUnlimited} onChange={(v) => handleLimitChange('limits', 'staff', 'value', v)} onToggleUnlimited={(v) => handleLimitChange('limits', 'staff', 'isUnlimited', v)} />
                        <PlanLimitField label="Trainers" value={formData.limits.trainers.value} isUnlimited={formData.limits.trainers.isUnlimited} onChange={(v) => handleLimitChange('limits', 'trainers', 'value', v)} onToggleUnlimited={(v) => handleLimitChange('limits', 'trainers', 'isUnlimited', v)} />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <PlanLimitField label="Members" value={formData.limits.members.value} isUnlimited={formData.limits.members.isUnlimited} onChange={(v) => handleLimitChange('limits', 'members', 'value', v)} onToggleUnlimited={(v) => handleLimitChange('limits', 'members', 'isUnlimited', v)} />
                        </div>
                    </div>
                )}
            </div>

            {/* SECTION 3: OPERATIONAL THROUGHPUT */}
            <div style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, padding: '12px', boxShadow: '0 4px 20px rgba(124,92,252,0.04)' }}>
                <CollapsibleHeader icon={Activity} title="Usage Limits" subtitle="Workouts, diets and leads limits" section="ops" active={activeSections.ops} color={T.amber} />
                {activeSections.ops && (
                    <div style={{ padding: '16px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', animation: 'fadeUp 0.3s forwards' }}>
                        <PlanLimitField label="Workouts" value={formData.opsLimits.workouts.value} isUnlimited={formData.opsLimits.workouts.isUnlimited} onChange={(v) => handleLimitChange('opsLimits', 'workouts', 'value', v)} onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'workouts', 'isUnlimited', v)} />
                        <PlanLimitField label="Diets" value={formData.opsLimits.diets.value} isUnlimited={formData.opsLimits.diets.isUnlimited} onChange={(v) => handleLimitChange('opsLimits', 'diets', 'value', v)} onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'diets', 'isUnlimited', v)} />
                        <PlanLimitField label="Classes" value={formData.opsLimits.classes.value} isUnlimited={formData.opsLimits.classes.isUnlimited} onChange={(v) => handleLimitChange('opsLimits', 'classes', 'value', v)} onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'classes', 'isUnlimited', v)} />
                        <PlanLimitField label="Leads" value={formData.opsLimits.leads.value} isUnlimited={formData.opsLimits.leads.isUnlimited} onChange={(v) => handleLimitChange('opsLimits', 'leads', 'value', v)} onToggleUnlimited={(v) => handleLimitChange('opsLimits', 'leads', 'isUnlimited', v)} />
                    </div>
                )}
            </div>

            {/* SECTION 4: PERK REGISTRY */}
            <div style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, padding: '12px', boxShadow: '0 4px 20px rgba(124,92,252,0.04)' }}>
                <CollapsibleHeader icon={Gift} title="Special Benefits" subtitle="Add perks and extra features" section="benefits" active={activeSections.benefits} color={T.rose} />
                {activeSections.benefits && (
                    <div style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeUp 0.3s forwards' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.roseLight, padding: '14px 18px', borderRadius: '18px', border: `1px solid ${T.rose}20` }}>
                            <div>
                                <h5 style={{ fontSize: '9px', fontWeight: 900, color: T.rose, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Benefits List</h5>
                                <p style={{ fontSize: '11px', fontWeight: 700, color: T.muted, margin: '2px 0 0' }}>Add special benefits for this plan</p>
                            </div>
                            <button type="button" onClick={addBenefit} style={{ padding: '8px 16px', border: 'none', background: T.rose, color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 4px 12px ${T.rose}40` }}>
                                <Plus size={14} strokeWidth={3} /> Add Benefit
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {formData.benefits.map((b) => (
                                <div key={b.id} style={{ position: 'relative', background: T.bg, padding: '20px', borderRadius: '20px', border: `1.5px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <button type="button" onClick={() => removeBenefit(b.id)} style={{ position: 'absolute', top: '-10px', right: '-10px', width: '28px', height: '28px', borderRadius: '50%', background: T.surface, border: `1px solid ${T.border}`, color: T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} onMouseEnter={e => e.currentTarget.style.background = T.roseLight} onMouseLeave={e => e.currentTarget.style.background = T.surface}><Trash2 size={12} /></button>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <InputLabel>Benefit Name</InputLabel>
                                            <input type="text" value={b.name} onChange={(e) => updateBenefit(b.id, 'name', e.target.value)} placeholder="e.g., Free Diet Plan" style={{ ...inputStyle(), padding: '10px 12px', fontSize: '13px' }} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                                        </div>
                                        <div>
                                            <InputLabel>Facility/Room</InputLabel>
                                            <input type="text" value={b.room} onChange={(e) => updateBenefit(b.id, 'room', e.target.value)} placeholder="e.g., Spa Area" style={{ ...inputStyle(), padding: '10px 12px', fontSize: '13px' }} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                                        </div>
                                    </div>
                                    <PlanLimitField label="Usage Limit" value={b.limit} isUnlimited={b.isUnlimited} onChange={(v) => updateBenefit(b.id, 'limit', v)} onToggleUnlimited={(v) => updateBenefit(b.id, 'isUnlimited', v)} unitValue={b.unit} onUnitChange={(v) => updateBenefit(b.id, 'unit', v)} options={[{ value: 'Per Month', label: 'Per Month' }, { value: 'Per Year', label: 'Per Year' }, { value: 'Lifetime', label: 'Lifetime' }]} />
                                </div>
                            ))}
                        </div>

                        {formData.benefits.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 0', border: `2px dashed ${T.border}`, borderRadius: '24px' }}>
                                <Sparkles size={32} color={T.subtle} style={{ marginBottom: '10px' }} />
                                <p style={{ fontSize: '12px', fontWeight: 700, color: T.subtle }}>No benefits added yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* GLOBAL FOOTER ACTIONS */}
            <div style={{ position: 'fixed', bottom: 0, right: 0, width: '100%', padding: '24px 32px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${T.border}`, zIndex: 100, display: 'flex', gap: '12px' }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: T.bg, border: `1.5px solid ${T.border}`, color: T.muted, fontSize: '13px', fontWeight: 900, cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = T.accent} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>Cancel Sequence</button>
                <button 
                    onClick={handleSubmit} disabled={isSubmitting}
                    style={{ 
                        flex: 2, padding: '14px', borderRadius: '14px', 
                        background: isSubmitting ? T.accentMid : `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                        color: '#fff', border: 'none', fontSize: '13px', fontWeight: 900, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: `0 8px 24px rgba(124,92,252,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}
                >
                    <Save size={18} strokeWidth={2.5} /> {isSubmitting ? 'Saving...' : (editId ? 'Update Plan' : 'Create Plan')}
                </button>
            </div>
        </div>
    );
};

export default PlanFormDrawer;
