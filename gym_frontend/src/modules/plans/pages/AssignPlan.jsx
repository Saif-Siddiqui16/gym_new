import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { PLANS } from '../data/mockPlans';

// Mock Members for dropdown
const MEMBERS = [
    { id: 'M-101', name: 'John Doe' },
    { id: 'M-102', name: 'Jane Smith' },
    { id: 'M-103', name: 'Bob Jones' }
];

const AssignPlan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const plan = PLANS.find(p => p.id === id);
    const [selectedMember, setSelectedMember] = useState('');
    const [startDate, setStartDate] = useState('');

    if (!plan) return <div>Plan not found</div>;

    const handleAssign = () => {
        if (!selectedMember || !startDate) {
            alert('Please select member and start date');
            return;
        }
        alert(`Assigned ${plan.name} to Member ${selectedMember}`);
        navigate('/plans');
    };

    return (
        <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-4)' }}>
                <button onClick={() => navigate('/plans')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-title" style={{ margin: 0 }}>Assign Plan</h2>
            </div>

            <Card>
                <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{plan.name}</h3>
                    <div style={{ color: 'var(--muted)' }}>{plan.type} • {plan.duration}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label className="text-muted block mb-2 text-sm">Select Member</label>
                        <select
                            value={selectedMember}
                            onChange={e => setSelectedMember(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        >
                            <option value="">-- Choose Member --</option>
                            {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-muted block mb-2 text-sm">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    <Button variant="primary" onClick={handleAssign} style={{ marginTop: '8px' }}>
                        Confirm Assignment
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AssignPlan;
