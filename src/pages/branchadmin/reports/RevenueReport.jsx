import React, { useState, useEffect } from 'react';
import { 
    DollarSign, Download, Filter, Search, Calendar, ChevronDown, Check, 
    TrendingUp, CreditCard, Banknote, Wallet, Loader2, ArrowRight, ShieldCheck
} from 'lucide-react';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';
import { exportPdf } from '../../../utils/exportPdf';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        
  accent2: '#9B7BFF',       
  accentLight: '#F0ECFF',   
  accentMid: '#E4DCFF',     
  border: '#EAE7FF',        
  bg: '#F6F5FF',            
  surface: '#FFFFFF',       
  text: '#1A1533',          
  muted: '#7B7A8E',         
  subtle: '#B0ADCC',        
  green: '#22C97A',         
  greenLight: '#E8FBF2',
  amber: '#F59E0B',         
  amberLight: '#FEF3C7',
  rose: '#F43F5E',          
  roseLight: '#FFF1F4',
  blue: '#3B82F6',          
  blueLight: '#EFF6FF',
};

const MetricCard = ({ label, value, icon: Icon, color, bg, index }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: T.surface, padding: 24, borderRadius: 24, border: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', gap: 20, cursor: 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hover ? '0 12px 30px rgba(124,92,252,0.12)' : '0 2px 14px rgba(0,0,0,0.02)',
                animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`
            }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>{value}</div>
            </div>
        </div>
    );
};

const RevenueReport = () => {
    const getToday = () => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    };

    const [selectedDate, setSelectedDate] = useState(getToday());
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState([
        { label: 'Total Revenue', value: '₹0', icon: DollarSign, bg: T.accentLight, color: T.accent },
        { label: 'Monthly Target', value: '₹5,00,000', icon: TrendingUp, bg: T.greenLight, color: T.green },
        { label: 'Pending Payments', value: '₹0', icon: Banknote, bg: T.amberLight, color: T.amber },
    ]);

    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/branch-admin/reports/revenue', {
                params: { date: selectedDate }
            });

            if (response.data.stats) {
                setStats(response.data.stats.map(s => ({
                    ...s,
                    icon: s.icon === 'DollarSign' ? DollarSign : (s.icon === 'TrendingUp' ? TrendingUp : Banknote),
                    bg: s.label.includes('Revenue') ? T.accentLight : (s.label.includes('Target') ? T.greenLight : T.amberLight),
                    color: s.label.includes('Revenue') ? T.accent : (s.label.includes('Target') ? T.green : T.amber)
                })));
            }
            setRevenueData(response.data.revenueData || []);
        } catch (error) {
            console.error('Failed to fetch revenue report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedDate]);

    const handleExport = () => {
        const filtered = revenueData.filter(row =>
            row.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.service.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filtered.length === 0) {
            toast.error("No data available to export.");
            return;
        }

        const headers = ["Date", "Member", "Service", "Amount", "Mode", "Status"];
        const rows = filtered.map(row => [
            row.date,
            row.member,
            row.service,
            row.amount,
            row.mode,
            row.status
        ]);

        exportPdf({
            title: 'Revenue Report',
            filename: `revenue_report_${selectedDate}`,
            headers,
            rows,
            gymName: "Roar Fitness"
        });
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                .fu { animation: fadeUp 0.4s ease both; }
            `}</style>

            {/* ──────── HEADER BANNER ──────── */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="fu">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                    }}>
                        <DollarSign size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>Revenue Report</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: '4px 0 0', fontWeight: 600 }}>Track payments, collection trends and financial health</p>
                    </div>
                </div>
                <button
                    onClick={handleExport}
                    style={{
                        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                        padding: '12px 24px', borderRadius: 12, color: '#fff', fontSize: 11, fontWeight: 900,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                        textTransform: 'uppercase', letterSpacing: '0.1em', transition: '0.2s',
                        backdropFilter: 'blur(8px)'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                    <Download size={18} /> Export as PDF
                </button>
            </div>

            {/* ──────── KPI CARDS ──────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
                {stats.map((stat, i) => (
                    <MetricCard key={i} {...stat} index={i} />
                ))}
            </div>

            {/* ──────── FILTERS & TABLE ──────── */}
            <div style={{ background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`, boxShadow: '0 2px 14px rgba(0,0,0,0.02)', overflow: 'hidden' }} className="fu">
                {/* Filter Bar */}
                <div style={{ padding: '24px 30px', borderBottom: `1px solid ${T.border}`, background: 'rgba(0,0,0,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ position: 'relative', width: 220 }}>
                            <Calendar size={16} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                type="date"
                                style={{ width: '100%', height: 44, borderRadius: 14, border: `2px solid ${T.border}`, padding: '0 14px 0 42px', fontSize: 12, fontWeight: 700, color: T.text, background: '#fff', transition: '0.2s', outline: 'none' }}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div style={{ position: 'relative', width: 300 }}>
                            <Search size={16} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                placeholder="Search payments..."
                                style={{ width: '100%', height: 44, borderRadius: 14, border: `2px solid ${T.border}`, padding: '0 14px 0 42px', fontSize: 12, fontWeight: 700, color: T.text, background: '#fff', transition: '0.2s', outline: 'none' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {revenueData.length} RECORDS FOUND
                    </div>
                </div>

                {/* Table Content */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                                {['Date', 'Member', 'Service', 'Amount', 'Mode', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '16px 30px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody style={{ divide: `1px solid ${T.border}` }}>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: 80, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                            <Loader2 size={32} color={T.accent} style={{ animation: 'spin 1s linear infinite' }} />
                                            <p style={{ fontSize: 12, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gathering Revenue Data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : revenueData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: 80, textAlign: 'center', color: T.subtle, fontSize: 13, fontWeight: 800, fontStyle: 'italic' }}>
                                        No transactions found for this period
                                    </td>
                                </tr>
                            ) : (
                                revenueData
                                    .filter(row => row.member.toLowerCase().includes(searchTerm.toLowerCase()) || row.service.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((row, i) => (
                                        <tr key={row.id} style={{ borderTop: `1px solid ${T.bg}`, transition: '0.2s' }} className="table-row">
                                            <td style={{ padding: '16px 30px', fontSize: 12, fontWeight: 700, color: T.muted }}>{row.date}</td>
                                            <td style={{ padding: '16px 30px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>
                                                        {row.member.charAt(0)}
                                                    </div>
                                                    <span style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{row.member}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 30px', fontSize: 12, fontWeight: 700, color: T.muted }}>{row.service}</td>
                                            <td style={{ padding: '16px 30px', fontSize: 16, fontWeight: 900, color: T.accent }}>{row.amount}</td>
                                            <td style={{ padding: '16px 30px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: T.muted }}>
                                                    {row.mode === 'Cash' ? <Wallet size={14} /> : <CreditCard size={14} />}
                                                    {row.mode.toUpperCase()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 30px' }}>
                                                <span style={{
                                                    padding: '6px 12px', borderRadius: 8, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                                    background: row.status === 'Paid' ? T.greenLight : (row.status === 'Partial' ? T.amberLight : T.roseLight),
                                                    color: row.status === 'Paid' ? T.green : (row.status === 'Partial' ? T.amber : T.rose)
                                                }}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueReport;
