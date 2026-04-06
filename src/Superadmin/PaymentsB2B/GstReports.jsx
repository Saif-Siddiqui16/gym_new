import React, { useState, useEffect } from 'react';
import { FileText, Download, Clock, CheckCircle, Shield, ArrowRight, Activity, Star, IndianRupee, Printer, Percent, BarChart3 } from 'lucide-react';
import { fetchGSTReports, exportTable } from '../../api/superadmin/superAdminApi';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF'
};

// Header Banner Component
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 24, padding: '24px 30px',
        boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative', overflow: 'hidden'
    }} className="fu fu1">
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
const MetricCard = ({ title, value, icon: Icon, color, bg, subtitle, index }) => (
    <div style={{
        background: T.surface, borderRadius: 22, border: `1px solid ${T.border}`,
        padding: 24, boxShadow: '0 2px 14px rgba(124,92,252,0.04)', display: 'flex', flexDirection: 'column', gap: 12
    }} className={`fu fu${index + 1}`}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{title}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle }}>{subtitle}</div>
        </div>
    </div>
);

const GstReports = () => {
    const [gstData, setGstData] = useState([]);
    const [summaryData, setSummaryData] = useState({
        totalCollected: '₹0',
        pending: '₹0',
        paid: '₹0'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadGstReports(); }, []);

    const loadGstReports = async () => {
        try {
            setLoading(true);
            const data = await fetchGSTReports();
            setGstData(data || []);
            const totalNum = (data || []).reduce((acc, r) => acc + parseFloat(r.gstAmount?.toString().replace(/[^0-9.-]+/g, "") || 0), 0);
            setSummaryData({
                totalCollected: `₹${totalNum.toLocaleString('en-IN')}`,
                pending: `₹${(totalNum * 0.4).toLocaleString('en-IN')}`,
                paid: `₹${(totalNum * 0.6).toLocaleString('en-IN')}`
            });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleExport = () => { exportTable('GST Reports', gstData); };

    if (loading) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                .spinner { width: 44px; height: 44px; border: 3px solid ${T.accentMid}; border-top-color: ${T.accent}; border-radius: 50%; animation: spin 0.8s linear infinite; }
            `}</style>
            <div className="spinner" />
            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Audit In Progress...</div>
        </div>
    );

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; }
                
                .grid-header {
                    display: grid; grid-template-columns: 1.2fr 2fr 1fr 0.8fr 1.2fr 1.2fr;
                    padding: 14px 24px; background: ${T.accentLight}; color: ${T.accent};
                    font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
                }
                .grid-row {
                    display: grid; grid-template-columns: 1.2fr 2fr 1fr 0.8fr 1.2fr 1.2fr; 
                    padding: 18px 24px; border-bottom: 1px solid ${T.border}; align-items: center; transition: 0.2s;
                    background: ${T.surface};
                }
                .grid-row:hover { background: ${T.bg}; }
            `}</style>

            <HeaderBanner 
                title="GST Reports" 
                sub="Comprehensive audit of tax collections across entire franchise network" 
                icon={BarChart3}
                actions={
                    <button onClick={handleExport} style={{ background: '#fff', border: 'none', padding: '10px 18px', borderRadius: 12, color: T.accent, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                        <Download size={16} /> Export Reports
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
                <MetricCard title="Total GST" value={summaryData.totalCollected} icon={Percent} color={T.accent} bg={T.accentLight} subtitle="Collected tax" index={0} />
                <MetricCard title="GST Pending" value={summaryData.pending} icon={Clock} color={T.amber} bg={T.amberLight} subtitle="Filing due" index={1} />
                <MetricCard title="GST Paid" value={summaryData.paid} icon={CheckCircle} color={T.green} bg={T.greenLight} subtitle="To Dept." index={2} />
            </div>

            <div className="fu fu3" style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                <div className="grid-header">
                    {['Invoice No', 'Gym Name', 'Base Amount', 'GST %', 'GST Tax', 'Audit Date'].map(h => <span key={h}>{h}</span>)}
                </div>
                {gstData.length > 0 ? gstData.map((record, i) => (
                    <div key={record.invoiceNo || i} className="grid-row">
                        <div style={{ fontSize: 13, fontWeight: 900, color: T.accent }}>{record.invoiceNo}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{record.gymName}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{record.amount}</div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: T.muted }}>{record.gstPercent}</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>{record.gstAmount}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.subtle }}>{new Date(record.date).toLocaleDateString('en-IN')}</div>
                    </div>
                )) : (
                    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: T.subtle }}><FileText size={32} /></div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: '0 0 8px' }}>No GST records found</h3>
                        <p style={{ fontSize: 13, color: T.muted }}>Roster currently empty of tax records</p>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 30 }} className="fu fu4">
                <div style={{ background: T.surface, borderRadius: 24, padding: 24, border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.accent, marginBottom: 16 }}>
                        <Activity size={18} />
                        <span style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>Tax Breakdown</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: T.muted }}><span>CGST (9%)</span> <span style={{ color: T.text }}>₹{(parseFloat(summaryData.totalCollected.replace(/[^0-9.-]+/g, "") || 0) * 0.5).toLocaleString('en-IN')}</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: T.muted }}><span>SGST (9%)</span> <span style={{ color: T.text }}>₹{(parseFloat(summaryData.totalCollected.replace(/[^0-9.-]+/g, "") || 0) * 0.5).toLocaleString('en-IN')}</span></div>
                         <div style={{ height: 1, background: T.border }} />
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, color: T.accent }}><span>TOTAL AUDIT TAX</span> <span>{summaryData.totalCollected}</span></div>
                    </div>
                </div>
                <div style={{ background: T.surface, borderRadius: 24, padding: 24, border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.amber, marginBottom: 16 }}>
                        <Shield size={18} />
                        <span style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>Filing Status</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>Current Period</span> <span style={{ fontSize: 10, fontWeight: 900, background: T.amberLight, color: T.amber, padding: '4px 10px', borderRadius: 8 }}>PENDING</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>Last Month</span> <span style={{ fontSize: 10, fontWeight: 900, background: T.greenLight, color: T.green, padding: '4px 10px', borderRadius: 8 }}>FILED</span></div>
                         <div style={{ height: 1, background: T.border }} />
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>Next Due Date</span> <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>20 Feb 2026</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GstReports;
