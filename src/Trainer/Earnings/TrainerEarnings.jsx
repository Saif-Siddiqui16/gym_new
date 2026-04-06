import React, { useState, useEffect } from 'react';
import {
    Banknote, TrendingUp, Calendar, Users, FileText, Info,
    Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Shield, IndianRupee, Printer, Download, ArrowRight, Activity
} from 'lucide-react';
import * as trainerApi from '../../api/trainer/trainerApi';
import { toast } from 'react-hot-toast';
import Modal from '../../components/common/Modal';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
   ───────────────────────────────────────────────────────────────────────────── */
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
    subtle: '#B0ADCC',        // placeholder / hints
    green: '#22C97A',         // success
    greenLight: '#E8FBF2',
    amber: '#F59E0B',         // warning
    amberLight: '#FEF3C7',
    rose: '#F43F5E',          // danger
    roseLight: '#FFF1F4',
    blue: '#3B82F6',          // info
    blueLight: '#EFF6FF',
};

// Header Banner Component
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 24, padding: '24px 30px',
        boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative', overflow: 'hidden'
    }} className="fu fu1 print-hidden">
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 2 }}>
            <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', flexShrink: 0
            }}>
                <Icon size={28} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '6px 0 0', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
            {actions}
        </div>
    </div>
);

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, iconColor, iconBg, sub, index = 0 }) => (
    <div style={{
        background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`,
        padding: 24, boxShadow: '0 2px 14px rgba(124,92,252,0.04)', display: 'flex', flexDirection: 'column', gap: 12
    }} className={`fu fu${Math.min(index + 1, 4)}`}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{title}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle, uppercase: true }}>{sub}</div>
        </div>
    </div>
);

const PrintablePayslip = ({ data, activeMonthData }) => {
    if (!data || !activeMonthData) return null;
    return (
        <div style={{ display: 'none', background: '#fff', padding: '60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="print-only">
            <style>{`
                @media print {
                    .print-hidden { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: #fff !important; }
                }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: '#000', margin: 0 }}>{data.summary?.branchName || "Roar Fitness"}</h1>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '2px', marginTop: 4 }}>Official Salary Statement</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>PAYSLIP</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#999' }}>ID: {activeMonthData.id}</div>
                </div>
            </div>
            <div style={{ height: 4, background: '#000', marginBottom: 30 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
                {[
                    { l: 'Trainer Name', v: data.summary?.trainerName },
                    { l: 'Trainer Code', v: data.summary?.trainerCode },
                    { l: 'Pay Period', v: activeMonthData.month },
                    { l: 'Designation', v: data.summary?.position || 'Personal Trainer' }
                ].map((item, i) => (
                    <div key={i} style={{ borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: '#999', textTransform: 'uppercase' }}>{item.l}</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{item.v}</div>
                    </div>
                ))}
            </div>
            <div style={{ width: '100%', marginBottom: 40 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr', borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 800 }}>EARNINGS DESCRIPTION</span>
                    <span style={{ fontSize: 10, fontWeight: 800, textAlign: 'right' }}>AMOUNT (₹)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Base Salary</span>
                        <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{activeMonthData.baseSalary?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr' }}>
                        <div>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>PT Sessions</span>
                            <div style={{ fontSize: 10, color: '#666' }}>({activeMonthData.sessionCount} sessions @ ₹{activeMonthData.sessionRate})</div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{activeMonthData.sessionEarnings?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Commission</span>
                        <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{activeMonthData.commission?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr', color: '#f00', fontStyle: 'italic' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Deductions (PF 12%)</span>
                        <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>- {activeMonthData.pfDeduction?.toLocaleString()}</span>
                    </div>
                </div>
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '4px solid #000', display: 'grid', gridTemplateColumns: '4fr 1fr' }}>
                    <span style={{ fontSize: 18, fontWeight: 900 }}>NET PAYABLE</span>
                    <span style={{ fontSize: 24, fontWeight: 900, textAlign: 'right' }}>₹{activeMonthData.total?.toLocaleString()}</span>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 100 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 160, height: 1, background: '#ccc', marginBottom: 8 }} />
                    <div style={{ fontSize: 10, fontWeight: 800 }}>ADMIN SIGNATURE</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 160, height: 1, background: '#ccc', marginBottom: 8 }} />
                    <div style={{ fontSize: 10, fontWeight: 800 }}>EMPLOYEE SIGNATURE</div>
                </div>
            </div>
        </div>
    );
};

const TrainerEarnings = () => {
    const [activeMonth, setActiveMonth] = useState('');
    const [loading, setLoading] = useState(true);
    const [earningsData, setEarningsData] = useState(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => { loadEarnings(); }, []);

    const loadEarnings = async () => {
        try {
            setLoading(true);
            const data = await trainerApi.getTrainerEarnings();
            setEarningsData(data);
            if (data.history?.length > 0) setActiveMonth(data.history[0].month);
        } catch (e) { toast.error('Failed to load earnings'); }
        finally { setLoading(false); }
    };

    const handleUpdateStatus = async (status, reason = '') => {
        if (!activeMonthData?.id) return toast.error('No record found');
        try {
            setLoading(true);
            await trainerApi.updatePayrollStatusAPI(activeMonthData.id, status, reason);
            toast.success(`Salary status: ${status}`);
            await loadEarnings();
        } catch (e) { toast.error(e.message || 'Update failed'); }
        finally { setLoading(false); }
    };

    if (loading) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                .spinner { width: 44px; height: 44px; border: 3px solid ${T.accentMid}; border-top-color: ${T.accent}; border-radius: 50%; animation: spin 0.8s linear infinite; }
            `}</style>
            <div className="spinner" />
            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Initializing Portal...
            </div>
        </div>
    );

    const activeMonthData = earningsData?.history?.find(h => h.month === activeMonth) || earningsData?.history?.[0];

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; } .fu4 { animation-delay: .2s; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            <PrintablePayslip data={earningsData} activeMonthData={activeMonthData} />

            <HeaderBanner 
                title="My Earnings" 
                sub="Track your monthly performance and professional growth"
                icon={Shield}
                actions={
                    <button onClick={() => window.print()} style={{ border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <Printer size={16} />
                    </button>
                }
            />

            {/* Month Tabs */}
            <div className="fu fu2" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 0', marginBottom: 24 }} className="no-scrollbar">
                {earningsData?.history?.map((item) => (
                    <button
                        key={item.month} onClick={() => setActiveMonth(item.month)}
                        style={{
                            padding: '10px 24px', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px',
                            background: activeMonth === item.month ? T.accent : T.surface,
                            color: activeMonth === item.month ? '#fff' : T.muted,
                            boxShadow: activeMonth === item.month ? '0 8px 16px rgba(124,92,252,0.2)' : 'none',
                            transition: '0.2s', flexShrink: 0
                        }}
                    >{item.month}</button>
                ))}
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
                <MetricCard title="Sessions" value={activeMonthData?.sessionCount || 0} sub={activeMonthData?.month} icon={Calendar} iconColor={T.accent} iconBg={T.accentLight} index={0} />
                <MetricCard title="Rate / Session" value={`₹${activeMonthData?.sessionRate || 0}`} sub="Personal Training" icon={IndianRupee} iconColor={T.blue} iconBg={T.blueLight} index={1} />
                <MetricCard title="Session Pay" value={`₹${activeMonthData?.sessionEarnings?.toLocaleString() || 0}`} sub="Base session earnings" icon={TrendingUp} iconColor={T.green} iconBg={T.greenLight} index={2} />
                <MetricCard title="Commissions" value={`₹${activeMonthData?.commission?.toLocaleString() || 0}`} sub="Sales & Performance" icon={Users} iconColor={T.amber} iconBg={T.amberLight} index={3} />
            </div>

            {/* Main Details Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 30, alignItems: 'start' }}>
                <div className="fu fu4" style={{ background: T.surface, borderRadius: 24, padding: 32, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 4 }}>TOTAL PAYOUT FOR {activeMonthData?.month}</div>
                            <h2 style={{ fontSize: 42, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-1px' }}>₹{activeMonthData?.total?.toLocaleString() || 0}</h2>
                        </div>
                        {activeMonthData?.status && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: T.accentLight, color: T.accent }}>
                                <Clock size={16} />
                                <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>{activeMonthData.status}</span>
                            </div>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, background: T.bg, padding: 20, borderRadius: 20, border: `1px solid ${T.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: T.muted }}>
                            <span>Base Monthly Salary</span>
                            <span style={{ fontWeight: 800, color: T.text }}>₹{activeMonthData?.baseSalary?.toLocaleString() || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: T.muted }}>
                            <span>Session Credits</span>
                            <span style={{ fontWeight: 800, color: T.text }}>₹{activeMonthData?.sessionEarnings?.toLocaleString() || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: T.muted }}>
                            <span>Bonus & Commission</span>
                            <span style={{ fontWeight: 800, color: T.text }}>₹{activeMonthData?.commission?.toLocaleString() || 0}</span>
                        </div>
                        <div style={{ height: 1, background: T.border }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: T.rose }}>
                            <span>Deductions (PF)</span>
                            <span style={{ fontWeight: 800 }}>- ₹{activeMonthData?.pfDeduction?.toLocaleString() || 0}</span>
                        </div>
                    </div>

                    {activeMonthData?.status === 'Approved' && (
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button onClick={() => handleUpdateStatus('Confirmed')} style={{ flex: 1, padding: '14px', borderRadius: 14, background: T.green, color: '#fff', border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <CheckCircle size={18} /> Confirm Payout
                            </button>
                            <button onClick={() => { setRejectionReason(''); setIsRejectionModalOpen(true); }} style={{ flex: 1, padding: '14px', borderRadius: 14, background: T.roseLight, color: T.rose, border: `1px solid ${T.rose}`, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <XCircle size={18} /> Report Issue
                            </button>
                        </div>
                    )}
                </div>

                <div className="fu fu4" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, borderRadius: 24, padding: 32, textAlign: 'center', color: '#fff', boxShadow: '0 12px 30px rgba(124,92,252,0.25)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', backdropFilter: 'blur(10px)' }}>
                            <FileText size={32} />
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 900, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px' }}>PAYSLIP</h3>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 24 }}>Official breakdown of your monthly salary</p>
                        <button onClick={() => window.print()} style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#fff', color: T.accent, border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <Download size={18} /> Download Slip
                        </button>
                    </div>

                    <div style={{ background: T.surface, borderRadius: 24, padding: 24, border: `1px solid ${T.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.accent, marginBottom: 16 }}>
                            <Info size={18} />
                            <span style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>Salary Guidelines</span>
                        </div>
                        <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                            Earnings are estimates based on session data. Final payouts are adjusted for PF (12%), attendance logic, and company tax policies.
                        </p>
                    </div>
                </div>
            </div>

            <Modal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)} title="Report Discrepancy" maxWidth="max-w-md">
                <div style={{ padding: 24 }}>
                    <p style={{ fontSize: 13, color: T.muted, marginBottom: 20, fontWeight: 600 }}>Please explain why you believe the calculated earnings are incorrect. Admin will review within 24 hours.</p>
                    <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Explain the error (e.g., missing sessions, wrong commission)..." style={{ width: '100%', height: 120, padding: 14, borderRadius: 14, border: `1px solid ${T.border}`, background: T.bg, outline: 'none', fontSize: 13, fontWeight: 600, resize: 'none' }} />
                    <button 
                        onClick={() => { if (!rejectionReason.trim()) return toast.error('Enter reason'); handleUpdateStatus('Rejected', rejectionReason); setIsRejectionModalOpen(false); }}
                        style={{ width: '100%', marginTop: 20, padding: 14, borderRadius: 14, background: T.rose, color: '#fff', border: 'none', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer' }}
                    >Submit Dispute</button>
                </div>
            </Modal>
        </div>
    );
};

export default TrainerEarnings;
