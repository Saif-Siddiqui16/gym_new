import React from 'react';
import { Users, Shuffle, Award, CheckCircle, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: '#FFF', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    btn: { height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

// Mock data internal to keep it self-contained for the redesign
const TRAINER_ASSIGNMENTS = [
    { id: 1, name: 'Vikram Singh', specialty: 'Bodybuilding', activeClients: 18, capacity: 20 },
    { id: 2, name: 'Ananya Rao', specialty: 'Yoga & Pilates', activeClients: 12, capacity: 15 },
    { id: 3, name: 'Rahul Sharma', specialty: 'Crossfit', activeClients: 22, capacity: 25 }
];

const TrainerAssignment = () => {
    const navigate = useNavigate();

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: T.muted, fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '16px', textTransform: 'uppercase' }}><ArrowLeft size={14} /> Back</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: T.accent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.2)' }}><Users size={32} /></div>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Trainer Allocation</h1>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Load balancing & Personal Trainer capacity audit</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {TRAINER_ASSIGNMENTS.map((trainer, i) => {
                    const usage = (trainer.activeClients / trainer.capacity) * 100;
                    const isHighLoad = usage > 80;

                    return (
                        <div key={trainer.id} style={{ ...S.card, padding: '32px', animation: `slideUp 0.4s ease forwards ${i * 0.1}s` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={24} /></div>
                                <span style={{ ...S.badge, background: T.bg, color: T.muted }}>{trainer.specialty}</span>
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: '0 0 8px' }}>{trainer.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                                <TrendingUp size={14} color={isHighLoad ? T.error : T.success} />
                                <span style={{ fontSize: '12px', fontWeight: '800', color: isHighLoad ? T.error : T.success }}>{Math.round(usage)}% Utilization Rate</span>
                            </div>

                            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '900', color: T.muted, textTransform: 'uppercase' }}>
                                <span>Current Load</span>
                                <span style={{ color: T.text }}>{trainer.activeClients} / {trainer.capacity} Clients</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: T.bg, borderRadius: '4px', overflow: 'hidden', marginBottom: '32px' }}>
                                <div style={{ width: `${usage}%`, height: '100%', background: isHighLoad ? T.error : T.accent, borderRadius: '4px', transition: 'width 1s ease' }} />
                            </div>

                            <button style={{ ...S.btn, width: '100%', background: '#FFF', color: T.accent, border: `2px solid ${T.accentMid}` }}><Shuffle size={16} /> Re-assign Roster</button>
                        </div>
                    );
                })}
            </div>

            <div style={{ ...S.card, padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: T.bg, color: T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><CheckCircle size={32} /></div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: '0 0 8px' }}>Clean Queue</h3>
                <p style={{ fontSize: '14px', fontWeight: '600', color: T.muted, margin: 0 }}>All premium members are currently allocated to active trainers.</p>
            </div>
        </div>
    );
};

export default TrainerAssignment;
