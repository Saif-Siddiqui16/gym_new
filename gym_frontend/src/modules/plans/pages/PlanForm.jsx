import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { PLANS } from '../data/mockPlans';

const PlanForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        type: 'Diet', // Diet | Workout
        duration: '4 Weeks',
        target: 'Fat Loss',
        difficulty: 'Beginner',
        dietStructure: { breakfast: [], lunch: [], snacks: [], dinner: [] },
        workoutStructure: []
    });

    useEffect(() => {
        if (isEditMode) {
            const plan = PLANS.find(p => p.id === id);
            if (plan) {
                setFormData({
                    name: plan.name,
                    type: plan.type,
                    duration: plan.duration,
                    target: plan.target,
                    difficulty: plan.difficulty,
                    dietStructure: plan.type === 'Diet' ? plan.structure : { breakfast: [], lunch: [], snacks: [], dinner: [] },
                    workoutStructure: plan.type === 'Workout' ? plan.structure : []
                });
            }
        }
    }, [id, isEditMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Plan saved successfully!');
        navigate('/plans');
    };

    return (
        <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 className="text-title" style={{ marginBottom: 'var(--space-4)' }}>{isEditMode ? 'Edit Plan' : 'Create New Plan'}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
                {/* 1. Basic Info */}
                <Card title="Plan Information">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label className="text-muted block mb-2 text-sm">Plan Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            />
                        </div>
                        <div>
                            <label className="text-muted block mb-2 text-sm">Plan Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                disabled={isEditMode}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="Diet">Diet Plan</option>
                                <option value="Workout">Workout Plan</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-muted block mb-2 text-sm">Duration</label>
                            <select
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="4 Weeks">4 Weeks</option>
                                <option value="6 Weeks">6 Weeks</option>
                                <option value="8 Weeks">8 Weeks</option>
                                <option value="12 Weeks">12 Weeks</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-muted block mb-2 text-sm">difficulty</label>
                            <select
                                value={formData.difficulty}
                                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* 2. Plan Structure (Conditional) */}
                {formData.type === 'Diet' ? (
                    <Card title="Diet Structure (Daily)">
                        {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => (
                            <div key={meal} style={{ marginBottom: '20px' }}>
                                <h4 style={{ textTransform: 'capitalize', marginBottom: '8px', fontSize: '0.875rem' }}>{meal}</h4>
                                <textarea
                                    rows="2"
                                    placeholder={`Enter items for ${meal}...`}
                                    value={formData.dietStructure[meal]?.join(', ') || ''}
                                    onChange={(e) => {
                                        const newStructure = { ...formData.dietStructure };
                                        newStructure[meal] = e.target.value.split(',');
                                        setFormData({ ...formData, dietStructure: newStructure });
                                    }}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                />
                                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Comma separated</div>
                            </div>
                        ))}
                    </Card>
                ) : (
                    <Card title="Workout Splits">
                        <div className="text-center p-4 text-muted bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            For demo purposes, workout editing is simplified.
                            <br />
                            <Button variant="outline" size="small" type="button" style={{ marginTop: '12px' }}>
                                <Plus size={14} /> Add Workout Day
                            </Button>
                        </div>
                        {/* Mock display of existing days if editing */}
                        {formData.workoutStructure.map((day, idx) => (
                            <div key={idx} style={{ marginTop: '12px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <strong>{day.day}</strong>: {day.focus}
                            </div>
                        ))}
                    </Card>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <Button variant="outline" type="button" onClick={() => navigate('/plans')}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        Save Plan
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PlanForm;
