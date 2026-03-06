import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { HISTORY_LOGS } from '../data/mockProgressData';

const ProgressHistory = () => {
    const navigate = useNavigate();
    const [filterDate, setFilterDate] = useState('');

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate('/progress')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-title" style={{ margin: 0 }}>Progress History</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    />
                    <Button variant="outline"><Filter size={16} /> Filter</Button>
                </div>
            </div>

            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '16px 0', color: 'var(--muted)' }}>Date</th>
                            <th style={{ padding: '16px 0', color: 'var(--muted)' }}>Weight</th>
                            <th style={{ padding: '16px 0', color: 'var(--muted)' }}>Body Fat</th>
                            <th style={{ padding: '16px 0', color: 'var(--muted)' }}>Attendance</th>
                            <th style={{ padding: '16px 0', color: 'var(--muted)' }}>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {HISTORY_LOGS.map((log, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '16px 0', fontWeight: 500 }}>{log.date}</td>
                                <td style={{ padding: '16px 0' }}>{log.weight}</td>
                                <td style={{ padding: '16px 0' }}>{log.bodyFat}</td>
                                <td style={{ padding: '16px 0' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                        background: log.attendance === 'Present' ? '#ECFDF5' : '#FEF2F2',
                                        color: log.attendance === 'Present' ? '#10B981' : '#EF4444'
                                    }}>
                                        {log.attendance}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 0', color: 'var(--muted)', fontStyle: 'italic' }}>
                                    {log.notes || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default ProgressHistory;
