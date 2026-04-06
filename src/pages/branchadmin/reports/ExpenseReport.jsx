import React, { useState, useEffect } from 'react';
import { Receipt, Download, Filter, Search, Calendar, CreditCard, ShoppingBag, Zap, PieChart, Loader2, ArrowRight, Shield, Activity, Star } from 'lucide-react';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';
import { exportPdf } from '../../../utils/exportPdf';

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

const ExpenseReport = () => {
    const getToday = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDate, setSelectedDate] = useState(getToday());
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState([
        { label: 'Total Expenses', value: '₹0', icon: CreditCard, bg: T.roseLight, color: T.rose },
        { label: 'Operational Costs', value: '₹0', icon: Zap, bg: T.accentLight, color: T.accent },
        { label: 'Inventory Buy', value: '₹0', icon: ShoppingBag, bg: T.amberLight, color: T.amber },
    ]);

    const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/branch-admin/reports/expenses', { params: { date: selectedDate } });
            const iconMap = { CreditCard, Zap, ShoppingBag };
            setStats(response.data.stats.map(s => ({
                ...s,
                icon: iconMap[s.icon] || CreditCard,
                bg: s.icon === 'CreditCard' ? T.roseLight : s.icon === 'Zap' ? T.accentLight : T.amberLight,
                color: s.icon === 'CreditCard' ? T.rose : s.icon === 'Zap' ? T.accent : T.amber
            })));
            setExpenseData(response.data.expenseData);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReport(); }, [selectedDate]);

    const handleExport = () => {
        if (expenseData.length === 0) return toast.error("No data available to export.");
        const headers = ["Date", "Category", "Description", "Amount", "Status"];
        const rows = expenseData.map(row => [row.date, row.category, row.description, row.amount, row.status]);
        exportPdf({ title: 'Expense Report', filename: `expense_report_${selectedDate}`, headers, rows, gymName: "Roar Fitness" });
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; }
                
                .grid-header {
                    display: grid; grid-template-columns: 1fr 1fr 2fr 1fr 100px;
                    padding: 14px 24px; background: ${T.accentLight}; color: ${T.accent};
                    font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
                }
                .grid-row {
                    display: grid; grid-template-columns: 1fr 1fr 2fr 1fr 100px; 
                    padding: 18px 24px; border-bottom: 1px solid ${T.border}; align-items: center; transition: 0.2s;
                    background: ${T.surface};
                }
                .grid-row:hover { background: ${T.bg}; }
            `}</style>

            <HeaderBanner 
                title="Expense Report" 
                sub="Audit your operational expenditures and overhead costs accurately" 
                icon={Receipt}
                actions={
                    <button onClick={handleExport} style={{ background: '#fff', border: 'none', padding: '10px 20px', borderRadius: 12, color: T.accent, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                        <Download size={16} /> Export PDF
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 28 }}>
                {stats.map((stat, i) => <MetricCard key={i} index={i} {...stat} subtitle="Operating Ledger" />)}
            </div>

            {/* Content Container */}
            <div className="fu fu3" style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                            <input 
                                type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} 
                                style={{ padding: '10px 12px 10px 38px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.bg, fontSize: 13, fontWeight: 700, color: T.text, outline: 'none' }}
                            />
                        </div>
                        <button 
                            onClick={() => {
                                const cats = expenseData.reduce((acc, exp) => { acc[exp.category] = (acc[exp.category] || 0) + 1; return acc; }, {});
                                const breakdown = Object.entries(cats).map(([cat, count]) => `${cat}: ${count}`).join(', ');
                                if (breakdown) toast.success(`Categories: ${breakdown}`); else toast.error('No data');
                            }}
                            style={{ background: T.blueLight, border: 'none', padding: '10px 16px', borderRadius: 12, color: T.blue, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <PieChart size={14} /> Distribution
                        </button>
                    </div>
                    <div style={{ position: 'relative', width: 280 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                        <input 
                            type="text" placeholder="Search operational costs..." 
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.bg, fontSize: 13, fontWeight: 600, color: T.text, outline: 'none' }}
                        />
                    </div>
                </div>

                <div className="grid-header">
                    {['Transaction Date', 'Cost Category', 'Description', 'Amount', 'Status'].map(h => <span key={h}>{h}</span>)}
                </div>

                {loading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center', background: '#fff' }}>
                        <div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>Updating Spreadsheet...</p>
                    </div>
                ) : expenseData.length === 0 ? (
                    <div style={{ padding: '100px 20px', textAlign: 'center', background: '#fff' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: T.subtle }}><Receipt size={28} /></div>
                        <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>No expenses recorded</h3>
                        <p style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Try a different audit period</p>
                    </div>
                ) : (
                    expenseData
                        .filter(row => row.description.toLowerCase().includes(searchTerm.toLowerCase()) || row.category.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((row, i) => (
                            <div key={row.id || i} className="grid-row">
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>{row.date}</div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: T.accent }}>{row.category}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{row.description}</div>
                                <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>{row.amount}</div>
                                <div>
                                    <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 20, background: row.status === 'Paid' ? T.greenLight : T.amberLight, color: row.status === 'Paid' ? T.green : T.amber }}>{row.status}</span>
                                </div>
                            </div>
                        ))
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
};

export default ExpenseReport;
