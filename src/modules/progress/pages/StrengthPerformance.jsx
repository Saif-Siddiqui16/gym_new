import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { STRENGTH_PROGRESS } from '../data/mockProgressData';

const StrengthPerformance = () => {
    const navigate = useNavigate();

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-4)' }}>
                <button onClick={() => navigate('/progress')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-title" style={{ margin: 0 }}>Strength & Performance</h2>
            </div>

            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '16px 0', color: 'var(--muted)', width: '30%' }}>Exercise</th>
                            <th style={{ padding: '16px 0', color: 'var(--muted)' }}>Starting</th>
                            <th style={{ padding: '16px 0', color: 'var(--muted)' }}>Current</th>
                            <th style={{ padding: '16px 0', color: 'var(--muted)' }}>Best</th>
                            <th style={{ padding: '16px 0', color: 'var(--muted)', width: '20%' }}>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {STRENGTH_PROGRESS.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '16px 0', fontWeight: 600 }}>{item.exercise}</td>
                                <td style={{ padding: '16px 0' }}>{item.start}</td>
                                <td style={{ padding: '16px 0', fontWeight: 600, color: 'var(--primary)' }}>{item.current}</td>
                                <td style={{ padding: '16px 0' }}>{item.best}</td>
                                <td style={{ padding: '16px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ flex: 1, height: '6px', background: '#F3F4F6', borderRadius: '4px' }}>
                                            <div style={{ width: `${Math.min(item.progress, 100)}%`, height: '100%', background: '#10B981', borderRadius: '4px' }}></div>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10B981' }}>+{item.progress}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default StrengthPerformance;
