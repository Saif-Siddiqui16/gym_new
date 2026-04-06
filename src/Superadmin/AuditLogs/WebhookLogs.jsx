import React, { useState, useEffect } from 'react';
import { 
    Terminal, Search, Filter, RefreshCw, Zap, Clock, ShieldCheck, 
    AlertCircle, Eye, MoreHorizontal, ChevronRight, Download, 
    Activity, Globe, ChevronDown, ChevronLeft, ChevronRight as ChevronRightIcon,
    Database, Network, Cpu, ShieldAlert
} from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import LogPayloadDrawer from './LogPayloadDrawer';
import { fetchWebhookLogs } from '../../api/superadmin/superAdminApi';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF',
  dark: '#0D0A1F', darkSlate: '#1A1533'
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: `linear-gradient(135deg, ${T.dark} 0%, ${T.darkSlate} 55%, #2D274D 100%)`,
        borderRadius: 20, padding: '20px 26px',
        boxShadow: '0 8px 32px rgba(13,10,31,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative'
    }} className="fu">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
            }}>
                <Icon size={26} color={T.accent} strokeWidth={2.2} />
            </div>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
                <p style={{ fontSize: 13, color: '#B0ADCC', margin: '4px 0 0', fontWeight: 500 }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>{actions}</div>
    </div>
);

const MetricCard = ({ title, value, icon: Icon, iconColor, iconBg, caption, isFirst = false }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: isFirst ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : T.surface,
                borderRadius: 18, border: isFirst ? 'none' : `1px solid ${T.border}`,
                boxShadow: isFirst ? '0 8px 24px rgba(124,92,252,0.2)' : '0 2px 12px rgba(124,92,252,0.06)',
                padding: 20, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                cursor: 'default'
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: isFirst ? 'rgba(255,255,255,0.1)' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={isFirst ? '#fff' : iconColor} strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: isFirst ? 'rgba(255,255,255,0.7)' : T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: isFirst ? '#fff' : T.text, marginBottom: 2 }}>{value}</div>
            {caption && <div style={{ fontSize: 9, fontWeight: 700, color: isFirst ? 'rgba(255,255,255,0.5)' : T.subtle }}>{caption}</div>}
        </div>
    );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
const WebhookLogs = () => {
    const [selectedLog, setSelectedLog] = useState(null);
    const [webhookLogs, setWebhookLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterMethod, setFilterMethod] = useState('All');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [stats, setStats] = useState({
        totalEvents: '0',
        successRate: '0%',
        failedLast24h: '0',
        activeWebhooks: '0'
    });

    useEffect(() => { loadLogs(); }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await fetchWebhookLogs();
            if (data && data.logs) {
                setWebhookLogs(data.logs);
                setStats(data.stats);
            } else { setWebhookLogs(data || []); }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const filteredLogs = webhookLogs.filter(log => {
        const matchesSearch = (log.event || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.statusCode || '').toString().includes(searchTerm);
        const matchesStatus = filterStatus === 'All' || log.status === filterStatus.toLowerCase();
        const matchesMethod = filterMethod === 'All' || log.method === filterMethod;
        return matchesSearch && matchesStatus && matchesMethod;
    });

    const handleViewLog = (log) => { setSelectedLog(log); setIsDrawerOpen(true); };

    if (loading && webhookLogs.length === 0) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Synchronizing Nexus Pulse…</p>
        </div>
    );

    return (
        <div style={{
            background: T.bg, minHeight: '100vh', padding: '28px 28px 48px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", animation: 'fadeUp 0.38s ease both'
        }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                .spin { animation: spin 0.8s linear infinite; }
                
                .grid-table { display: grid; grid-template-columns: 140px 1.5fr 140px 1.2fr 80px; align-items: center; }
                
                @media (max-width: 1024px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 900px; }
                }
                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 16px 18px !important; }
                    .filter-bar { flex-direction: column; align-items: stretch !important; gap: 12px !important; }
                    .grid-table { grid-template-columns: 1fr !important; gap: 12px; padding: 18px !important; border-bottom: 8px solid ${T.bg} !important; position: relative; }
                    .table-header { display: none !important; }
                    .mobile-label { display: block !important; margin-bottom: 2px; font-size: 8px !important; color: ${T.subtle} !important; text-transform: uppercase; font-weight: 800; }
                }
            `}</style>

            <HeaderBanner 
                title="Nexus Broadcaster"
                sub="Real-time ingestion engine for biometric callbacks & logic orchestration"
                icon={Terminal}
                actions={
                    <button 
                         onClick={loadLogs}
                         style={{
                            background: T.accent, border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 13, fontWeight: 800,
                            boxShadow: '0 4px 12px rgba(124,92,252,0.3)', opacity: loading ? 0.7 : 1
                         }}
                         disabled={loading}
                    >
                        <RefreshCw size={15} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Live Sync'}
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="stats-grid">
                <MetricCard title="Broadcasts" value={stats.totalEvents} icon={Zap} iconColor={T.accent} iconBg={T.accentLight} isFirst={true} />
                <MetricCard title="Success Rate" value={stats.successRate} icon={ShieldCheck} iconColor={T.green} iconBg={T.greenLight} caption="Ingestion health" />
                <MetricCard title="Dropouts" value={stats.failedLast24h} icon={AlertCircle} iconColor={T.rose} iconBg={T.roseLight} caption="Failed handshakes" />
                <MetricCard title="Nodes" value={stats.activeWebhooks} icon={Globe} iconColor={T.blue} iconBg={T.blueLight} caption="Active API vectors" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, width: '100%', flexWrap: 'wrap' }} className="filter-bar">
                <div style={{ flex: 1, minWidth: 280, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by packet vector, event logic or status code…" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: T.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <div style={{ width: 180, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                    <Network size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <option value="All">Every Health</option>
                        <option value="Success">Ingested</option>
                        <option value="Failed">Dropped</option>
                    </select>
                </div>
                <div style={{ width: 180, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                    <Database size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <option value="All">Every Method</option>
                        <option value="POST">POST Flow</option>
                        <option value="GET">GET Flow</option>
                    </select>
                </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Packet Vector', 'Logic Intelligence', 'Capture Code', 'Network Target', 'Inspect'].map((h, j) => (
                            <span key={j} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                        ))}
                    </div>

                    {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
                        <div key={log.id} style={{ padding: '16px 22px', borderBottom: i < filteredLogs.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s', cursor: 'pointer' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }} onClick={() => handleViewLog(log)}>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Vector</span>
                                <div style={{ fontSize: 11, fontWeight: 900, color: T.accent, fontFamily: 'monospace', background: T.accentLight, padding: '4px 8px', borderRadius: 6, width: 'fit-content' }}>#{log.id.slice(0,8)}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Intelligence</span>
                                <div style={{ fontSize: 13, fontWeight: 900, color: T.text, letterSpacing: '-0.2px' }}>{log.event}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: T.muted, marginTop: 3 }}>
                                    <Clock size={10} color={T.subtle} /> {log.time}
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Sync</span>
                                <span style={{ 
                                    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 900, 
                                    padding: '4px 12px', borderRadius: 20, background: log.status === 'success' ? T.greenLight : T.roseLight,
                                    color: log.status === 'success' ? T.green : T.rose, border: `1px solid ${log.status === 'success' ? T.green : T.rose}30`
                                }}>
                                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                                    {log.statusCode} {log.status}
                                </span>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Target</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 9, fontWeight: 900, color: '#fff', background: T.dark, padding: '2px 6px', borderRadius: 4 }}>{log.method}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{log.endpoint}</span>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <span style={{ display: 'none' }} className="mobile-label">Audit</span>
                                <button style={{ width: 34, height: 34, borderRadius: 10, background: T.accentLight, color: T.accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
                                    <Eye size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )) : !loading && (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Activity size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>Nexus Quiet</h3>
                            <p style={{ fontSize: 11, color: T.muted, italic: true }}>No broadcast packets detected for the current frequency scan</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', background: T.bg, borderRadius: '0 0 18px 18px', border: `1px solid ${T.border}`, borderTop: 'none', marginTop: -1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.muted }}>Stream Capacity: <span style={{ color: T.text, fontWeight: 900 }}>{filteredLogs.length}</span> event packets detected</div>
            </div>

            <RightDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Nexus Intelligence" subtitle={`Registry: ${selectedLog?.id}`}>
                <LogPayloadDrawer selectedLog={selectedLog} onClose={() => setIsDrawerOpen(false)} />
            </RightDrawer>
        </div>
    );
};

export default WebhookLogs;
