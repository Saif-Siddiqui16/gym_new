import React, { useState, useEffect } from 'react';
import {
    Activity,
    Shield,
    AlertCircle,
    Clock,
    CheckCircle2,
    Filter,
    Terminal,
    Loader2,
    User,
    Building,
    RefreshCcw,
    Zap,
    Cpu,
    ArrowUpRight
} from 'lucide-react';
import { fetchSystemHealthAPI } from '../../../api/admin/adminApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import StatsCard from '../../dashboard/components/StatsCard';

const WebhookSettings = () => {
    const { selectedBranch } = useBranchContext();
    const [activeTab, setActiveTab] = useState('All');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ logs: [], stats: { total: '0', open: '0', resolved: '0', today: '0' } });

    useEffect(() => {
        loadData();
    }, [selectedBranch, activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Ensure if 'all' is selected, we pass the appropriate value the backend expects
            const branchId = selectedBranch === 'all' ? '' : selectedBranch;
            const res = await fetchSystemHealthAPI({
                branchId,
                status: activeTab === 'All' ? undefined : activeTab
            });
            setData(res);
        } catch (error) {
            console.error("System Health error", error);
            toast.error('Failed to load system health data');
        } finally {
            setLoading(false);
        }
    };

    const statsCards = [
        { label: 'Total Logs', value: data.stats.total, color: 'indigo', icon: Activity, subtitle: 'Monitoring events' },
        { label: 'Open Issues', value: data.stats.open, color: 'rose', icon: Zap, subtitle: 'Requires attention' },
        { label: 'Resolved Today', value: data.stats.resolved, color: 'emerald', icon: CheckCircle2, subtitle: 'Auto-fixed' },
        { label: 'System Uptime', value: '99.9%', color: 'blue', icon: Cpu, subtitle: 'Real-time' },
    ];

    const tabs = ['All', 'Open', 'Resolved'];

    const T = {
        accent: '#7C5CFC', accentLight: '#F0ECFF', border: '#EAE7FF', bg: '#F6F5FF', 
        surface: '#FFFFFF', text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC',
        success: '#22C97A', successLight: '#E8FBF2', danger: '#F43F5E', dangerLight: '#FFF1F4',
        info: '#3B82F6', infoLight: '#EFF6FF'
    };

    const S = {
        ff: "'Plus Jakarta Sans', sans-serif",
        card: { background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08)', padding: '24px' },
        btn: { height: '44px', padding: '0 20px', borderRadius: '14px', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: T.accent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(124, 92, 252, 0.4)' }}>
                        <Activity size={28} />
                    </div>
                    <div>
                         <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>System Health</h1>
                         <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Real-time Diagnostic Intelligence</p>
                    </div>
                </div>
                <button 
                    onClick={loadData}
                    style={{ ...S.btn, background: T.surface, color: T.text, border: `1px solid ${T.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                >
                    <RefreshCcw size={16} /> Refresh Diagnostics
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={24} /></div>
                    <div><p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Total Logs</p><h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: '2px 0' }}>{data.stats.total}</h2><p style={{ fontSize: '10px', fontWeight: '700', color: T.subtle, margin: 0 }}>Monitoring events</p></div>
                </div>
                <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: T.dangerLight, color: T.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={24} /></div>
                    <div><p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Open Issues</p><h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: '2px 0' }}>{data.stats.open}</h2><p style={{ fontSize: '10px', fontWeight: '700', color: T.subtle, margin: 0 }}>Requires attention</p></div>
                </div>
                <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: T.successLight, color: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={24} /></div>
                    <div><p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Resolved Today</p><h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: '2px 0' }}>{data.stats.resolved}</h2><p style={{ fontSize: '10px', fontWeight: '700', color: T.subtle, margin: 0 }}>Auto-fixed</p></div>
                </div>
                <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: T.infoLight, color: T.info, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cpu size={24} /></div>
                    <div><p style={{ fontSize: '10px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>System Uptime</p><h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: '2px 0' }}>99.9%</h2><p style={{ fontSize: '10px', fontWeight: '700', color: T.subtle, margin: 0 }}>Real-time</p></div>
                </div>
            </div>

            <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', background: T.bg, padding: '6px', borderRadius: '16px' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{ ...S.btn, height: '36px', background: activeTab === tab ? T.surface : 'transparent', color: activeTab === tab ? T.accent : T.muted, boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: '900', color: T.success, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.success }} />
                        Real-time Monitoring Active
                    </div>
                </div>

                <div style={{ padding: '24px', minHeight: '400px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', opacity: 0.5 }}>
                            <Loader2 size={40} className="animate-spin" color={T.accent} style={{ marginBottom: '20px' }} />
                            <p style={{ fontSize: '12px', fontWeight: '800', color: T.text, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Synchronizing Core Engine...</p>
                        </div>
                    ) : data.logs.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: T.successLight, color: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: T.text, margin: '0 0 12px 0' }}>System Status Optimal</h3>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>No critical anomalies detected</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {data.logs.map(log => (
                                <div key={log.id} style={{ padding: '24px', background: T.bg, borderRadius: '20px', border: `1px solid ${T.border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', background: log.status === 'Open' ? T.dangerLight : T.successLight, color: log.status === 'Open' ? T.danger : T.success }}>{log.status}</span>
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: T.muted, display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> {new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div style={{ fontSize: '10px', fontWeight: '900', color: T.accent, textTransform: 'uppercase', letterSpacing: '0.1em', background: T.surface, padding: '8px 16px', borderRadius: '12px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Terminal size={12} /> Action: {log.action || 'UNDEFINED'}
                                        </div>
                                    </div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} color={T.subtle} /> {log.affectedEntity || 'Core System Trace'}</h4>
                                    <div style={{ background: T.surface, padding: '16px', borderRadius: '16px', border: `1px solid ${T.border}`, fontFamily: 'monospace', fontSize: '12px', color: T.muted, fontWeight: '600', marginBottom: '20px' }}>
                                        {log.details || 'No trace available'}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: `1px solid ${T.border}` }}>
                                        <div style={{ display: 'flex', gap: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '32px', height: '32px', background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}><User size={14} /></div><span style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{log.user || 'Unknown'}</span></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '32px', height: '32px', background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}><Building size={14} /></div><span style={{ fontSize: '10px', fontWeight: '900', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{log.branch || 'Global'}</span></div>
                                        </div>
                                        <button style={{ ...S.btn, background: T.text, color: '#FFF' }}>Generate AI Fix <ArrowUpRight size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebhookSettings;
