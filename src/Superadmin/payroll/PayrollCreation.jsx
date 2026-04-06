import React, { useState, useEffect } from 'react';
import { 
    FilePlus, XCircle, Banknote, Users, Calendar, Clock, 
    CheckCircle, IndianRupee, TrendingUp, MinusCircle, 
    Sparkles, ArrowLeft, Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../config/roles';
import { fetchPayrollStaffAPI, createPayrollAPI } from '../../api/admin/adminApi';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 20, padding: '20px 26px',
        boxShadow: '0 8px 32px rgba(124,92,252,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative'
    }} className="fu">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
            }}>
                <Icon size={26} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500 }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>{actions}</div>
    </div>
);

const Field = ({ label, icon: Icon, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 2 }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.accent, pointerEvents: 'none', zIndex: 2 }}>
                <Icon size={16} strokeWidth={2.2} />
            </div>
            {children}
        </div>
    </div>
);

const PayrollCreation = ({ role = ROLES.SUPER_ADMIN }) => {
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [month, setMonth] = useState('January');
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear.toString());
    const [incentives, setIncentives] = useState(0);
    const [deductions, setDeductions] = useState(0);
    const [status, setStatus] = useState('Pending');

    useEffect(() => {
        const loadStaff = async () => {
            try {
                const data = await fetchPayrollStaffAPI();
                setStaffList(data || []);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        loadStaff();
    }, []);

    const selectedStaff = staffList.find(s => s.id === parseInt(selectedStaffId));
    const baseSalary = selectedStaff?.baseSalary ? Number(selectedStaff.baseSalary) : 0;
    const netSalary = baseSalary + Number(incentives) - Number(deductions);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStaffId) return toast.error("Please select a staff member");

        const payrollData = { staffId: selectedStaffId, month, year, amount: netSalary, status };
        try {
            await createPayrollAPI(payrollData);
            toast.success("Payroll established successfully");
            navigate('/superadmin/payroll/history');
        } catch (error) { toast.error(error.response?.data?.message || error.message); }
    };

    return (
        <div style={{
            background: T.bg, minHeight: '100vh', padding: '28px 28px 48px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", animation: 'fadeUp 0.38s ease both'
        }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                
                input, select { 
                    width: 100%; height: 44px; padding: 0 14px 0 42px; background: ${T.surface};
                    border: 1px solid ${T.border}; borderRadius: 12px; font-size: 13px; font-weight: 700; color: ${T.text};
                    outline: none; transition: 0.2s; font-family: 'Plus Jakarta Sans', sans-serif;
                }
                input:focus, select:focus { border-color: ${T.accent}; box-shadow: 0 0 0 4px ${T.accentLight}; }
                select { appearance: none; cursor: pointer; }
            `}</style>

            <HeaderBanner 
                title="Payroll Provisioning"
                sub="Generate settlement records, incentives & deductions"
                icon={FilePlus}
                actions={
                    <button 
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 10, padding: '10px 16px', cursor: 'pointer', color: '#fff',
                            fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8
                        }}
                    >
                        <ArrowLeft size={16} /> Discard
                    </button>
                }
            />

            <div style={{ 
                background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, 
                padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' 
            }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    
                    {/* Period & Agent Selection */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        <Field label="Target Personnel" icon={Users}>
                            <select value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} required disabled={loading}>
                                <option value="">{loading ? 'Synchronizing…' : 'Select Employee'}</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                            </select>
                        </Field>
                        
                        <Field label="Settlement Month" icon={Calendar}>
                            <select value={month} onChange={e => setMonth(e.target.value)}>
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Fiscal Year" icon={Calendar}>
                            <select value={year} onChange={e => setYear(e.target.value)}>
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y.toString()}>{y}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Breakdown Card */}
                    <div style={{ background: T.bg, borderRadius: 20, padding: 24, border: `1px solid ${T.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <Banknote size={18} color={T.accent} strokeWidth={2.5} />
                            <h3 style={{ fontSize: 11, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Calculation Breakdown</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                            <div>
                                <label style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>Base Compensation</label>
                                <div style={{ height: 52, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 16, fontWeight: 900, color: T.text }}>
                                    ₹{baseSalary.toLocaleString()}
                                </div>
                            </div>

                            <Field label="Incentives (+)" icon={TrendingUp}>
                                <input 
                                    type="number" style={{ height: 52, fontSize: 16, borderLeft: `4px solid ${T.green}` }} 
                                    value={incentives} onChange={e => setIncentives(e.target.value)} 
                                />
                            </Field>

                            <Field label="Deductions (-)" icon={MinusCircle}>
                                <input 
                                    type="number" style={{ height: 52, fontSize: 16, borderLeft: `4px solid ${T.rose}` }} 
                                    value={deductions} onChange={e => setDeductions(e.target.value)} 
                                />
                            </Field>
                        </div>

                        <div style={{ marginTop: 32, paddingTop: 32, borderTop: `1px dashed ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Settlement Amount</div>
                                <div style={{ fontSize: 36, fontWeight: 900, color: T.accent, letterSpacing: '-1px' }}>₹{netSalary.toLocaleString()}</div>
                            </div>

                            <div style={{ display: 'flex', background: '#fff', padding: 6, borderRadius: 16, border: `1px solid ${T.border}` }}>
                                <button
                                    type="button"
                                    onClick={() => setStatus('Paid')}
                                    style={{
                                        padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                        fontSize: 11, fontWeight: 900, transition: '0.2s',
                                        background: status === 'Paid' ? T.green : 'transparent',
                                        color: status === 'Paid' ? '#fff' : T.muted
                                    }}
                                >PAID</button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('Pending')}
                                    style={{
                                        padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                        fontSize: 11, fontWeight: 900, transition: '0.2s',
                                        background: status === 'Pending' ? T.amber : 'transparent',
                                        color: status === 'Pending' ? '#fff' : T.muted
                                    }}
                                >PENDING</button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%', height: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
                            background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                            color: '#fff', fontSize: 15, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            boxShadow: `0 8px 24px rgba(124,92,252,0.3)`, transition: '0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(124,92,252,0.4)`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(124,92,252,0.3)`; }}
                    >
                        <Send size={18} strokeWidth={2.5} /> Finalize & Issue Settlement
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PayrollCreation;
