import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import Button from '../../../components/ui/Button';
import PlanCard from '../components/PlanCard';
import { PLANS } from '../data/mockPlans';

const PlansOverview = () => {
    const navigate = useNavigate();
    const [filterType, setFilterType] = useState('All'); // All, Diet, Workout

    const filteredPlans = PLANS.filter(p => filterType === 'All' || p.type === filterType);

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 className="text-title">Diet & Workout Plans</h2>
                <Button variant="primary" onClick={() => navigate('/plans/new')}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Create New Plan
                </Button>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                {['All', 'Diet', 'Workout'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            background: filterType === type ? 'var(--primary)' : 'white',
                            color: filterType === type ? 'white' : 'var(--muted)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        {type} Plans
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {filteredPlans.map(plan => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onView={(id) => navigate(`/plans/${id}/edit`)} // Using edit as view for now/admin
                        onAssign={(id) => navigate(`/plans/assign/${id}`)}
                    />
                ))}
            </div>
        </div>
    );
};

export default PlansOverview;
