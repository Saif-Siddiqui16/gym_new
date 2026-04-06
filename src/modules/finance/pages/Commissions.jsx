import React, { useState, useRef, useEffect } from 'react';
import { User, Award, TrendingUp, DollarSign, Calendar, Trophy, Target, ChevronDown, CheckCircle } from 'lucide-react';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: '#FFF', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    input: { height: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${T.border}`, fontSize: '14px', fontWeight: '600', color: T.text, outline: 'none', transition: 'all 0.2s ease', background: '#FFF' },
    btn: { height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

const COMMISSIONS = [
    { id: 1, trainer: 'John Doe', sessions: 45, tier: 'Gold (20%)', totalSales: 54000, commission: 10800 },
    { id: 2, trainer: 'Sarah Coach', sessions: 32, tier: 'Silver (15%)', totalSales: 38400, commission: 5760 },
    { id: 3, trainer: 'Mike Trainer', sessions: 50, tier: 'Platinum (25%)', totalSales: 60000, commission: 15000 },
];

const CustomDropdown = ({ options, value, onChange, icon: Icon, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', minWidth: '200px' }}>
            <button
                type="button" onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%', height: '48px', padding: '0 16px', borderRadius: '14px',
                    border: `2px solid ${isOpen ? T.accent : T.border}`, background: '#FFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: isOpen ? '0 0 0 4px ' + T.accentLight : 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {Icon && <Icon size={18} color={T.muted} />}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: T.text }}>{value}</span>
                </div>
                <ChevronDown size={18} color={T.muted} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </button>
            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: '#FFF', borderRadius: '16px', border: `1px solid ${T.border}`,
                    boxShadow: '0 15px 30px -5px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden'
                }}>
                    {options.map((opt) => (
                        <button
                            key={opt} type="button" onClick={() => { onChange(opt); setIsOpen(false); }}
                            style={{
                                width: '100%', padding: '12px 16px', border: 'none', background: value === opt ? T.accentLight : 'transparent',
                                color: value === opt ? T.accent : T.text, fontSize: '14px', fontWeight: '600', textAlign: 'left',
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                        >
                            {opt}
                            {value === opt && <CheckCircle size={16} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Commissions = () => {
    const [selectedMonth, setSelectedMonth] = useState('February 2025');

    const totalCommissions = COMMISSIONS.reduce((sum, c) => sum + c.commission, 0);
    const totalSales = COMMISSIONS.reduce((sum, c) => sum + c.totalSales, 0);
    const totalSessions = COMMISSIONS.reduce((sum, c) => sum + c.sessions, 0);

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Trainer Commissions</h1>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Monthly performance & earnings audit</p>
                </div>
                <CustomDropdown options={['February 2025', 'January 2025', 'December 2024']} value={selectedMonth} onChange={setSelectedMonth} icon={Calendar} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {[
                    { label: 'Total Commissions', value: `₹${totalCommissions.toLocaleString()}`, icon: DollarSign, color: T.accent, bg: T.accentLight },
                    { label: 'Total Sales', value: `₹${totalSales.toLocaleString()}`, icon: TrendingUp, color: T.success, bg: '#ECFDF5' },
                    { label: 'Total Sessions', value: totalSessions, icon: Target, color: '#4F46E5', bg: '#EEF2FF' },
                ].map((stat, i) => (
                    <div key={i} style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', animation: `slideUp 0.4s ease forwards ${i * 0.1}s` }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><stat.icon size={24} color={stat.color} /></div>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{stat.label}</p>
                            <p style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {COMMISSIONS.map((comm, idx) => (
                    <div key={comm.id} style={{ ...S.card, padding: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden', animation: `slideUp 0.4s ease forwards ${idx * 0.1}s` }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `radial-gradient(circle, ${T.accentLight} 0%, transparent 70%)`, opacity: 0.5, zIndex: 0 }}></div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: T.accent, border: '4px solid #FFF', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.2)' }}><User size={32} /></div>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: T.text, margin: '0 0 8px' }}>{comm.trainer}</h3>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#FFFBEB', color: '#D97706', borderRadius: '10px', fontSize: '11px', fontWeight: '900', border: '1px solid #FEF3C7', marginBottom: '24px' }}><Award size={14} /> {comm.tier}</div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: `1px solid ${T.bg}`, paddingTop: '24px', marginBottom: '24px' }}>
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '4px' }}>Sessions</p>
                                    <p style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>{comm.sessions}</p>
                                </div>
                                <div style={{ borderLeft: `1px solid ${T.bg}` }}>
                                    <p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', marginBottom: '4px' }}>Total Sales</p>
                                    <p style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: 0 }}>₹{comm.totalSales.toLocaleString()}</p>
                                </div>
                            </div>

                            <div style={{ padding: '20px', background: '#F0FDF4', borderRadius: '20px', border: '1px solid #DCFCE7', textAlign: 'center' }}>
                                <p style={{ fontSize: '10px', fontWeight: '900', color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>Net Commission</p>
                                <p style={{ fontSize: '24px', fontWeight: '900', color: '#166534', margin: 0 }}>₹{comm.commission.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Commissions;
