import React, { useState, useEffect } from 'react';
import { 
    Search, Monitor, Server, RefreshCw, Cpu, Activity, 
    Clock, Shield, Wifi, WifiOff, ChevronDown, ChevronLeft, 
    ChevronRight, HardDrive, Zap, ShieldCheck, Database, Terminal
} from 'lucide-react';
import { fetchHardwareLogs } from '../../api/superadmin/superAdminApi';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF',
  dark: '#020617', darkSlate: '#1E293B'
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: `linear-gradient(135deg, ${T.dark} 0%, ${T.darkSlate} 55%, #334155 100%)`,
        borderRadius: 20, padding: '20px 26px',
        boxShadow: '0 8px 32px rgba(15,23,42,0.28)',
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
                <Icon size={26} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500 }}>{sub}</p>
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
                background: isFirst ? `linear-gradient(135deg, ${T.dark}, ${T.darkSlate})` : T.surface,
                borderRadius: 18, border: isFirst ? 'none' : `1px solid ${T.border}`,
                boxShadow: isFirst ? '0 8px 24px rgba(15,23,42,0.2)' : '0 2px 12px rgba(124,92,252,0.06)',
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
const HardwareLogs = () => {
    const [hardwareLogs, setHardwareLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [filter, setFilter] = useState({ search: '', type: '', status: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => { loadLogs(true); }, []);
    useEffect(() => { setCurrentPage(1); }, [filter]);

    const loadLogs = async (isInitial = false) => {
        if (isInitial) setInitialLoading(true);
        else setLoading(true);
        try {
            const data = await fetchHardwareLogs();
            setHardwareLogs(data || []);
        } catch (e) { console.error(e); }
        finally {
            if (isInitial) setInitialLoading(false);
            else setLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const filteredLogs = hardwareLogs.filter(log => {
        const matchesSearch = (log.name || '').toLowerCase().includes(filter.search.toLowerCase()) ||
            (log.message || '').toLowerCase().includes(filter.search.toLowerCase());
        const matchesType = filter.type === '' || (log.type || '').toLowerCase() === filter.type.toLowerCase();
        const matchesStatus = filter.status === '' || (log.status || '').toLowerCase() === filter.status.toLowerCase();

        return matchesSearch && matchesType && matchesStatus;
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

    const getStatusPill = (status) => {
        const s = status?.toLowerCase();
        const config = {
            connected:    { color: T.green, bg: T.greenLight, label: 'ONLINE' },
            disconnected: { color: T.amber, bg: T.amberLight, label: 'STANDBY' },
            error:        { color: T.rose,  bg: T.roseLight,  label: 'FAULT' },
        }[s] || { color: T.muted, bg: T.bg, label: status };

        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '4px 10px', borderRadius: 20,
                background: config.bg, color: config.color, border: `1px solid ${config.color}20`
            }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: config.color }} />
                {config.label}
            </span>
        );
    };

    if (initialLoading && hardwareLogs.length === 0) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Interrogating Distributed Sensors…</p>
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
                
                .grid-table { display: grid; grid-template-columns: 220px 140px 120px 1.5fr 160px; align-items: center; }
                
                @media (max-width: 1024px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 900px; }
                }
                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 16px 18px !important; }
                    .filter-bar { flex-direction: column; align-items: stretch !important; gap: 12px !important; }
                    .grid-table { grid-template-columns: 1fr !important; gap: 10px; padding: 18px !important; border-bottom: 6px solid ${T.bg} !important; position: relative; }
                    .table-header { display: none !important; }
                    .mobile-label { display: block !important; margin-bottom: 2px; font-size: 8px !important; color: ${T.subtle} !important; text-transform: uppercase; font-weight: 800; }
                }
            `}</style>

            <HeaderBanner 
                title="Hardware Telemetry"
                sub="Global status of biometric sensors, NFC readers & distributed controllers"
                icon={Cpu}
                actions={
                    <button 
                         onClick={() => loadLogs()}
                         style={{
                            background: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, color: T.dark, fontSize: 13, fontWeight: 800,
                            fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            opacity: loading ? 0.7 : 1
                         }}
                         disabled={loading}
                    >
                        <RefreshCw size={15} className={loading ? 'spin' : ''} /> {loading ? 'Interrogating...' : 'Sync Fleet'}
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="grid-metrics">
                <MetricCard title="Fleet Strength" value={hardwareLogs.length} icon={HardDrive} iconColor={T.accent} iconBg={T.accentLight} isFirst={true} />
                <MetricCard title="Online Sensors" value={hardwareLogs.filter(l => l.status === 'connected').length} icon={Wifi} iconColor={T.green} iconBg={T.greenLight} caption="Active nodes" />
                <MetricCard title="IO Throughput" value="1.2 GB/s" icon={Zap} iconColor={T.amber} iconBg={T.amberLight} caption="Telemetry velocity" />
                <MetricCard title="Health Index" value="99.2%" icon={ShieldCheck} iconColor={T.blue} iconBg={T.blueLight} caption="Stability score" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, width: '100%', flexWrap: 'wrap' }} className="filter-bar">
                <div style={{ flex: 1, minWidth: 280, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by node identity or message trace…" 
                        value={filter.search}
                        onChange={e => handleFilterChange('search', e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: T.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <div style={{ width: 220, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                    <Filter size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={filter.type} 
                        onChange={e => handleFilterChange('type', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <option value="">Every Cluster</option>
                        <option value="biometric">Face/Iris Sensors</option>
                        <option value="card reader">NFC/RFID Readers</option>
                        <option value="turnstile">Barrier Controllers</option>
                        <option value="access controller">Nexus Hubs</option>
                    </select>
                </div>
                <div style={{ width: 220, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                    <Activity size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={filter.status} 
                        onChange={e => handleFilterChange('status', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <option value="">Every Status</option>
                        <option value="connected">Online</option>
                        <option value="disconnected">Standby</option>
                        <option value="error">Fault Detected</option>
                    </select>
                </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Node Identity', 'Sector Type', 'Telemetry', 'Log Stream', 'Timestamp'].map((h, j) => (
                            <span key={j} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                        ))}
                    </div>

                    {paginatedLogs.length > 0 ? paginatedLogs.map((log, i) => (
                        <div key={log.id} style={{ padding: '18px 22px', borderBottom: i < paginatedLogs.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ display: 'none' }} className="mobile-label">Node</span>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HardDrive size={18} color={T.accent} strokeWidth={2.2} />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{log.name}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Type</span>
                                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em', background: T.bg, padding: '4px 10px', borderRadius: 8, display: 'inline-block' }}>{log.type}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Sync</span>
                                {getStatusPill(log.status)}
                            </div>

                            <div style={{ paddingRight: 20 }}>
                                <span style={{ display: 'none' }} className="mobile-label">Trace</span>
                                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Terminal size={12} color={T.accent} /> {log.message}
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Timestamp</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: T.muted, fontFamily: 'monospace' }}>
                                    <Clock size={11} color={T.subtle} /> {log.date}
                                </div>
                            </div>
                        </div>
                    )) : !initialLoading && (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Wifi size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>Fleet Stabilized</h3>
                            <p style={{ fontSize: 11, color: T.muted, italic: true }}>No hardware telemetry matching the current frequency scan</p>
                        </div>
                    )}
                </div>
            </div>

            {filteredLogs.length > itemsPerPage && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: `1px solid ${T.border}`, background: T.bg, marginTop: -1, border: `1px solid ${T.border}`, borderTop: 'none', borderRadius: '0 0 18px 18px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>Node Stream <span style={{ color: T.text, fontWeight: 900 }}>{startIndex + 1}</span>–<span style={{ color: T.text, fontWeight: 900 }}>{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of <span style={{ color: T.text, fontWeight: 900 }}>{filteredLogs.length}</span> packets</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: currentPage === 1 ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: currentPage === totalPages ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HardwareLogs;
