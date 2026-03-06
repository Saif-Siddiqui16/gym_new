import React from 'react';
import { Dumbbell, User, Users, Utensils, Lock, Thermometer, Check } from 'lucide-react';
import { BENEFITS } from '../data/mockMemberships';

const iconMap = {
    Dumbbell,
    User,
    Users,
    Utensils,
    Lock,
    Thermometer
};

const BenefitsList = ({ benefitIds = [], layout = 'list' }) => {
    // benefitIds is an array of strings e.g., ['gym_access', 'diet_plan']
    const safeBenefitIds = Array.isArray(benefitIds) ? benefitIds : [];

    const activeBenefits = BENEFITS.filter(b => safeBenefitIds.includes(b.id));

    if (activeBenefits.length === 0) return <div className="text-muted">No benefits included.</div>;

    if (layout === 'grid') {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                {activeBenefits.map(benefit => {
                    const Icon = iconMap[benefit.icon] || Check;
                    return (
                        <div key={benefit.id} style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: 'var(--space-3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)'
                        }}>
                            <div style={{
                                width: '32px', height: '32px',
                                background: '#EFF6FF', color: 'var(--primary)',
                                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{benefit.name}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Default 'list' layout (simple horizontal or minimal)
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {activeBenefits.map(benefit => {
                const Icon = iconMap[benefit.icon] || Check;
                return (
                    <div key={benefit.id} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#F9FAFB', padding: '4px 8px', borderRadius: '6px',
                        border: '1px solid var(--border-color)', fontSize: '0.875rem'
                    }}>
                        <Icon size={14} className="text-muted" />
                        <span>{benefit.name}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default BenefitsList;
