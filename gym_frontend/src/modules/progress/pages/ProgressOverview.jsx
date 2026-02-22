import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { CURRENT_STATS } from '../data/mockProgressData';

const ProgressOverview = () => {
    const navigate = useNavigate();

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 className="text-title">Progress Tracking</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" onClick={() => navigate('/progress/metrics')}>Body Metrics</Button>
                    <Button variant="outline" onClick={() => navigate('/progress/strength')}>Strength</Button>
                    <Button variant="outline" onClick={() => navigate('/progress/history')}>History</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <SummaryCard icon={TrendingDown} label="Current Weight" value={CURRENT_STATS.weight} subValue={CURRENT_STATS.weightChange} color="#2563EB" />
                <SummaryCard icon={Activity} label="Body Fat %" value={CURRENT_STATS.bodyFat} subValue={CURRENT_STATS.bodyFatChange} color="#10B981" />
                <SummaryCard icon={Calendar} label="Attendance" value={CURRENT_STATS.attendance} subValue="Last 30 days" color="#F59E0B" />
                <SummaryCard icon={TrendingUp} label="Strength Gain" value={CURRENT_STATS.strengthScore} subValue="Overall" color="#8B5CF6" />
            </div>

            {/* Mock Charts Area */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-4)' }}>
                <Card title="Weight Progress">
                    <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                        {/* Mock Line Chart Bars */}
                        {[60, 65, 62, 70, 68, 75, 72].map((h, i) => (
                            <div key={i} style={{ width: '10%', height: `${h}%`, background: '#BFDBFE', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                                {i === 6 && <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#2563EB', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Now</div>}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: 'var(--muted)', fontSize: '0.75rem' }}>
                        <span>Week 1</span>
                        <span>Week 7</span>
                    </div>
                </Card>

                <Card title="Attendance Insights">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className="text-muted">Total Sessions</span>
                            <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>24</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '4px' }}>
                            <div style={{ width: '80%', height: '100%', background: '#F59E0B', borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                            You are consistent! Great job maintaining a 4-day streak.
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const SummaryCard = ({ icon: Icon, label, value, subValue, color }) => (
    <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                <Icon size={20} />
            </div>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>{label}</span>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>{value}</div>
        <div style={{ fontSize: '0.875rem', color: subValue.includes('-') && label !== 'Weight' ? '#EF4444' : '#10B981' }}>{subValue}</div>
    </Card>
);

export default ProgressOverview;
