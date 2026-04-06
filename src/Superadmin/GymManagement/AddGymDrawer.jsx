import React, { useState, useEffect } from 'react';
import {
    Building2, MapPin, User, Mail, Phone, Home,
    CheckCircle2, Sparkles, CreditCard, ChevronDown, Activity, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addGym, updateGym, fetchPlans } from '../../api/superadmin/superAdminApi';
import RightDrawer from '../../components/common/RightDrawer';

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
───────────────────────────────────────────── */
const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF',
    accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF',
    text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC',
    green: '#22C97A', greenLight: '#E8FBF2',
    amber: '#F59E0B', amberLight: '#FEF3C7',
    rose: '#F43F5E', roseLight: '#FFF1F4',
};

/* ─── Field Input ─── */
const Field = ({ label, icon: Icon, iconColor = T.accent, iconBg = T.accentLight, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={12} color={iconColor} strokeWidth={2.5} />
            </div>
            {label}
        </label>
        {children}
    </div>
);

const inputStyle = (focused) => ({
    width: '100%', padding: '12px 16px',
    background: focused ? T.surface : T.bg,
    border: `1.5px solid ${focused ? T.accent : T.border}`,
    borderRadius: 14, fontSize: 13, fontWeight: 700, color: T.text,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: 'none', transition: 'all 0.15s',
    boxShadow: focused ? `0 0 0 4px ${T.accentLight}` : 'none',
});

const FocusInput = ({ type = 'text', name, value, onChange, placeholder, required }) => {
    const [focused, setFocused] = useState(false);
    return (
        <input
            type={type} name={name} value={value} onChange={onChange}
            placeholder={placeholder} required={required}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={inputStyle(focused)}
        />
    );
};

const FocusTextarea = ({ name, value, onChange, placeholder, required, rows = 3 }) => {
    const [focused, setFocused] = useState(false);
    return (
        <textarea
            name={name} value={value} onChange={onChange}
            placeholder={placeholder} required={required} rows={rows}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...inputStyle(focused), resize: 'none', lineHeight: 1.6 }}
        />
    );
};

/* ─── Inline Select ─── */
const InlineSelect = ({ options, value, onChange, placeholder }) => {
    const [open, setOpen] = useState(false);
    const selected = options.find(o => (o.value ?? o) === value);
    const label = selected ? (selected.label ?? selected) : placeholder;

    return (
        <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setOpen(p => !p)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: open ? T.surface : T.bg,
                border: `1.5px solid ${open ? T.accent : T.border}`, borderRadius: 14,
                fontSize: 13, fontWeight: 800, color: value ? T.text : T.subtle,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: open ? `0 0 0 4px ${T.accentLight}` : 'none',
                transition: 'all 0.15s',
            }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{label}</span>
                <ChevronDown size={14} color={T.subtle} strokeWidth={2.5} style={{ flexShrink: 0, marginLeft: 8, transition: '0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18,
                    boxShadow: '0 12px 40px rgba(124,92,252,0.18)', zIndex: 100, padding: 8,
                    maxHeight: 250, overflowY: 'auto', animation: 'scaleUp 0.2s ease-out'
                }}>
                    {options.map(o => {
                        const val = o.value ?? o;
                        const lbl = o.label ?? o;
                        const isActive = value === val;
                        return (
                            <button key={val} type="button" onClick={() => { onChange(val); setOpen(false); }} style={{
                                width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 11,
                                border: 'none', background: isActive ? T.accentLight : 'transparent',
                                color: isActive ? T.accent : T.text, cursor: 'pointer',
                                fontSize: 13, fontWeight: isActive ? 800 : 700,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                transition: '0.1s',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.bg; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >{lbl}</button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ─── Section Header ─── */
const SectionHead = ({ icon: Icon, iconColor, iconBg, title }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        paddingBottom: 16, borderBottom: `1.5px solid ${T.border}`, marginBottom: 20,
    }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${iconBg}` }}>
            <Icon size={18} color={iconColor} strokeWidth={2.5} />
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 900, color: iconColor, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</h2>
    </div>
);

const AddGymDrawer = ({ isOpen, onClose, onSuccess, editData }) => {
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [formData, setFormData] = useState({
        gymName: '', branchName: '', ownerName: '',
        email: '', phone: '', address: '', status: 'Active', planId: '',
    });

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const data = await fetchPlans();
                setPlans(data.map(p => ({ value: p.id, label: `${p.name} (₹${p.price})` })));
            } catch (e) { console.error(e); }
        };
        if (isOpen) {
            loadPlans();
            setFormData(editData ? {
                gymName: editData.gymName || '', branchName: editData.branchName || '',
                ownerName: editData.owner || '', email: editData.managerEmail || '',
                phone: editData.phone || '', address: editData.location || '',
                status: editData.status || 'Active', planId: editData.planId || '',
            } : { gymName: '', branchName: '', ownerName: '', email: '', phone: '', address: '', status: 'Active', planId: '' });
        }
    }, [isOpen, editData]);

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editData && !formData.planId) { toast.error('Please select a plan'); return; }
        setLoading(true);
        try {
            const payload = { ...formData, owner: formData.ownerName, location: formData.address };
            if (editData) {
                if (!payload.planId) delete payload.planId;
                await updateGym(editData.id, payload);
                toast.success('Gym updated successfully');
            } else {
                await addGym(payload);
                toast.success('Gym added successfully');
            }
            onSuccess(); onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save gym');
        } finally { setLoading(false); }
    };

    const Footer = (
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <button type="button" onClick={onClose} style={{
                flex: 1, padding: '14px', background: T.bg, color: T.muted,
                border: `1.5px solid ${T.border}`, borderRadius: 14,
                fontSize: 13, fontWeight: 900, cursor: 'pointer', transition: '0.2s',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
            >
                Cancel
            </button>
            <button type="submit" form="add-gym-form" disabled={loading} style={{
                flex: 2, padding: '14px', 
                background: loading ? T.accentMid : `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 13, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : `0 8px 24px rgba(124,92,252,0.3)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: '0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
            >
                {loading ? (
                    <>
                        <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Saving...
                    </>
                ) : (
                    <>
                        <Sparkles size={18} strokeWidth={2.5} />
                        {editData ? 'Update Gym' : 'Add Gym'}
                    </>
                )}
            </button>
        </div>
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? 'Edit Gym' : 'Add New Gym'}
            subtitle={editData ? `Managing ${editData.gymName}` : 'Add a new gym branch to the system'}
            maxWidth="540px"
            footer={Footer}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes scaleUp { from { opacity: 0; transform: scale(0.98) translateY(10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
                #add-gym-form input::placeholder { color: ${T.subtle}; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; }
            `}</style>

            <form id="add-gym-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '8px 4px' }}>

                {/* ── SECTION 1: Gym Details ── */}
                <div style={{ animation: 'scaleUp 0.3s ease both' }}>
                    <SectionHead icon={Building2} iconColor={T.accent} iconBg={T.accentLight} title="Gym Details" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <Field label="Gym Name" icon={Activity} iconColor={T.accent} iconBg={T.accentLight}>
                            <FocusInput name="gymName" value={formData.gymName} onChange={handleChange} placeholder="e.g. Roar Fitness" required />
                        </Field>
                        <Field label="Branch Name" icon={MapPin} iconColor={T.accent} iconBg={T.accentLight}>
                            <FocusInput name="branchName" value={formData.branchName} onChange={handleChange} placeholder="e.g. Mumbai South" required />
                        </Field>
                    </div>
                </div>

                {/* ── SECTION 2: Owner Info ── */}
                <div style={{ animation: 'scaleUp 0.35s ease both' }}>
                    <SectionHead icon={User} iconColor={T.green} iconBg={T.greenLight} title="Owner Information" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <Field label="Owner Name" icon={User} iconColor={T.green} iconBg={T.greenLight}>
                            <FocusInput name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Name of the owner" required />
                        </Field>
                        <Field label="Phone Number" icon={Phone} iconColor={T.amber} iconBg={T.amberLight}>
                            <FocusInput type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 00000 00000" required />
                        </Field>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <Field label="Admin Email" icon={Mail} iconColor={T.rose} iconBg={T.roseLight}>
                                <FocusInput type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@example.com" required />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 3: Settings ── */}
                <div style={{ animation: 'scaleUp 0.4s ease both' }}>
                    <SectionHead icon={Home} iconColor={T.accent} iconBg={T.accentLight} title="Gym Settings" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Field label="Full Address" icon={MapPin} iconColor={T.accent} iconBg={T.accentLight}>
                            <FocusTextarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter full gym address..." required rows={3} />
                        </Field>
                        <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: 20 }}>
                            <Field label="Status" icon={CheckCircle2} iconColor={T.green} iconBg={T.greenLight}>
                                <InlineSelect
                                    options={['Active', 'Suspended']}
                                    value={formData.status}
                                    onChange={v => setFormData(p => ({ ...p, status: v }))}
                                    placeholder="Select Status"
                                />
                            </Field>
                            <Field label="Subscription Plan" icon={CreditCard} iconColor={T.accent} iconBg={T.accentLight}>
                                <InlineSelect
                                    options={plans}
                                    value={formData.planId}
                                    onChange={v => setFormData(p => ({ ...p, planId: v }))}
                                    placeholder="Choose Plan"
                                />
                            </Field>
                        </div>
                    </div>
                </div>

            </form>
        </RightDrawer>
    );
};

export default AddGymDrawer;