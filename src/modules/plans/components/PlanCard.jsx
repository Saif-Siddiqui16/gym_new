import React from 'react';
import { Clock, BarChart, User, ArrowRight } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const PlanCard = ({ plan, onAssign, onView }) => {
    const isDiet = plan.type === 'Diet';

    return (
        <Card className="h-full flex flex-col">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    background: isDiet ? '#EFF6FF' : '#ECFDF5',
                    color: isDiet ? '#2563EB' : '#10B981'
                }}>
                    {plan.type}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500 }}>
                    {plan.target}
                </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
                {plan.name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--muted)' }}>
                    <Clock size={16} /> <span>{plan.duration}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--muted)' }}>
                    <BarChart size={16} /> <span>{plan.difficulty}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--muted)' }}>
                    <User size={16} /> <span>By {plan.author}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="outline" size="small" style={{ flex: 1 }} onClick={() => onView(plan.id)}>
                    View
                </Button>
                <Button variant="primary" size="small" style={{ flex: 1 }} onClick={() => onAssign(plan.id)}>
                    Assign
                </Button>
            </div>
        </Card>
    );
};

export default PlanCard;
