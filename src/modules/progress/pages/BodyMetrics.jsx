import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ruler } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { BODY_METRICS } from '../data/mockProgressData';

const BodyMetrics = () => {
    const navigate = useNavigate();

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-4)' }}>
                <button onClick={() => navigate('/progress')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-title" style={{ margin: 0 }}>Body Metrics</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                {BODY_METRICS.map((metric, idx) => (
                    <Card key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>{metric.label}</span>
                            <Ruler size={14} className="text-muted" />
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                            {metric.value}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: metric.change.startsWith('+') && metric.label !== 'Weight' ? '#10B981' :
                                metric.change.startsWith('-') && metric.label === 'Weight' ? '#10B981' : '#2563EB',
                            fontWeight: 500
                        }}>
                            {metric.change}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BodyMetrics;
