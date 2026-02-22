import React, { useState } from 'react';
import { PLANS } from '../data/mockPlans';
import Card from '../../../components/ui/Card';
import { Coffee, Sun, Moon, Info } from 'lucide-react';

const MemberPlanView = () => {
    // Mock: Assume member has the first Diet plan and first Workout plan assigned
    const assignedDiet = PLANS.find(p => p.type === 'Diet');
    const assignedWorkout = PLANS.find(p => p.type === 'Workout');

    const [activeTab, setActiveTab] = useState('diet'); // 'diet' | 'workout'

    return (
        <div className="fade-in">
            <h2 className="text-title" style={{ marginBottom: 'var(--space-4)' }}>My Current Plan</h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                <TabButton label="Diet Plan" active={activeTab === 'diet'} onClick={() => setActiveTab('diet')} />
                <TabButton label="Workout Schedule" active={activeTab === 'workout'} onClick={() => setActiveTab('workout')} />
            </div>

            {/* Content */}
            {activeTab === 'diet' && assignedDiet && (
                <div className="fade-in">
                    <Card className="mb-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{assignedDiet.name}</h3>
                                <div className="text-muted">{assignedDiet.target} • {assignedDiet.duration}</div>
                            </div>
                            <span style={{ padding: '4px 12px', background: '#EFF6FF', color: '#2563EB', borderRadius: '12px', height: 'fit-content', fontSize: '0.875rem', fontWeight: 600 }}>Active</span>
                        </div>
                    </Card>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <MealCard title="Breakfast" icon={Coffee} items={assignedDiet.structure.breakfast} />
                        <MealCard title="Lunch" icon={Sun} items={assignedDiet.structure.lunch} />
                        <MealCard title="Snacks" icon={Info} items={assignedDiet.structure.snacks} />
                        <MealCard title="Dinner" icon={Moon} items={assignedDiet.structure.dinner} />
                    </div>
                </div>
            )}

            {activeTab === 'workout' && assignedWorkout && (
                <div className="fade-in">
                    <Card className="mb-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{assignedWorkout.name}</h3>
                                <div className="text-muted">{assignedWorkout.target} • {assignedWorkout.duration}</div>
                            </div>
                            <span style={{ padding: '4px 12px', background: '#ECFDF5', color: '#10B981', borderRadius: '12px', height: 'fit-content', fontSize: '0.875rem', fontWeight: 600 }}>Active</span>
                        </div>
                    </Card>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {assignedWorkout.structure.map((dayPlan, idx) => (
                            <Card key={idx} title={dayPlan.day}>
                                <div style={{ marginBottom: '12px', color: 'var(--primary)', fontWeight: 600 }}>{dayPlan.focus}</div>
                                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                    {dayPlan.exercises.map((ex, i) => (
                                        <li key={i} style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                                            <strong>{ex.name}</strong> <br />
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{ex.sets} sets x {ex.reps}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const TabButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            padding: '12px 24px',
            border: 'none',
            background: 'none',
            borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
            color: active ? 'var(--primary)' : 'var(--muted)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
        }}
    >
        {label}
    </button>
);

const MealCard = ({ title, icon: Icon, items }) => (
    <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--primary)' }}>
            <Icon size={20} />
            <h4 style={{ margin: 0 }}>{title}</h4>
        </div>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {items && items.map((item, i) => (
                <li key={i} style={{ marginBottom: '4px', fontSize: '0.9rem' }}>{item}</li>
            ))}
        </ul>
    </Card>
);

export default MemberPlanView;
