import React, { useState, useEffect } from 'react';
import { 
    Search, AlertTriangle, AlertCircle, FileText, Download, 
    ShieldAlert, Clock, Bug, ChevronDown, ChevronLeft, ChevronRight, 
    Activity, Zap, ShieldCheck, History, Terminal
} from 'lucide-react';
import { fetchErrorLogs, exportTable } from '../../api/superadmin/superAdminApi';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 55%, #9F1239 100%)',
        borderRadius: 20, padding: '20px 26px',
        boxShadow: '0 8px 32px rgba(244,63,94,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative'
    }} className="fu">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
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
                background: isFirst ? `linear-gradient(135deg, ${T.rose}, ${T.amber})` : T.surface,
                borderRadius: 18, border: isFirst ? 'none' : `1px solid ${T.border}`,
                boxShadow: isFirst ? '0 8px 24px rgba(244,63,94,0.2)' : '0 2px 12px rgba(124,92,252,0.06)',
                padding: 20, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                cursor: 'default'
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: isFirst ? 'rgba(255,255,255,0.2)' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
const ErrorLogs = () => {
    const [errorLogs, setErrorLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ search: '', severity: '', date: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => { loadLogs(); }, []);
    useEffect(() => { setCurrentPage(1); }, [filter]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await fetchErrorLogs();
            setErrorLogs(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleFilterChange = (name, value) => {
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const handleExport = () => exportTable('Error Protocol', errorLogs);

    const filteredLogs = errorLogs.filter(log => {
        const matchesSearch = log.message?.toLowerCase().includes(filter.search.toLowerCase()) ||
            log.code?.toLowerCase().includes(filter.search.toLowerCase());
        const matchesSeverity = filter.severity === '' || log.severity?.toLowerCase() === filter.severity.toLowerCase();
        const matchesDate = filter.date === '' || log.date?.includes(filter.date);

        return matchesSearch && matchesSeverity && matchesDate;
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

    const getSeverityPill = (severity) => {
        const s = severity?.toLowerCase();
        const config = {
            high:   { color: T.rose,  bg: T.roseLight,  label: 'CRITICAL' },
            medium: { color: T.amber, bg: T.amberLight, label: 'WARNING' },
            low:    { color: T.green, bg: T.greenLight, label: 'NOTICE' },
        }[s] || { color: T.muted, bg: T.bg, label: severity };

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

    if (loading && errorLogs.length === 0) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Tracing Exceptions…</p>
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
                
                .grid-table { display: grid; grid-template-columns: 140px 1.5fr 1fr 120px 180px; align-items: center; }
                
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
                title="Exception Registry"
                sub="High-priority triage of system failures, runtime crashes & stack traces"
                icon={ShieldAlert}
                actions={
                    <button 
                         onClick={handleExport}
                         style={{
                            background: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, color: T.rose, fontSize: 13, fontWeight: 800,
                            fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                         }}
                    >
                        <Download size={15} /> Export Failures
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="grid-metrics">
                <MetricCard title="Total Failures" value={errorLogs.length} icon={AlertTriangle} iconColor={T.accent} iconBg={T.accentLight} isFirst={true} />
                <MetricCard title="Critical Nodes" value={errorLogs.filter(l => l.severity === 'high').length} icon={AlertCircle} iconColor={T.rose} iconBg={T.roseLight} caption="Requires triage" />
                <MetricCard title="System Health" value="94.2%" icon={Zap} iconColor={T.green} iconBg={T.greenLight} caption="Core stability" />
                <MetricCard title="Recovery Rate" value="100%" icon={ShieldCheck} iconColor={T.blue} iconBg={T.blueLight} caption="Resilience score" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, width: '100%', flexWrap: 'wrap' }} className="filter-bar">
                <div style={{ flex: 1, minWidth: 280, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by error code, module or stack message…" 
                        value={filter.search}
                        onChange={e => handleFilterChange('search', e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: T.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <div style={{ width: 220, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                    <Filter size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={filter.severity} 
                        onChange={e => handleFilterChange('severity', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <option value="">Across All Impacts</option>
                        <option value="high">Critical Only</option>
                        <option value="medium">Medium Risk</option>
                        <option value="low">Low Priority</option>
                    </select>
                </div>
                <div style={{ width: 180, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={16} color={T.subtle} />
                    <input 
                        type="date" value={filter.date}
                        onChange={e => handleFilterChange('date', e.target.value)}
                        style={{ border: 'none', background: 'transparent', fontSize: 12, fontWeight: 800, color: T.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Node Code', 'Exception Payload', 'Sector', 'Impact', 'Trace Time'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                        ))}
                    </div>

                    {paginatedLogs.length > 0 ? paginatedLogs.map((log, i) => (
                        <div key={log.id} style={{ padding: '18px 22px', borderBottom: i < paginatedLogs.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Code</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: log.severity === 'high' ? T.rose : T.amber, boxShadow: `0 0 10px ${log.severity === 'high' ? T.rose : T.amber}` }} />
                                    <span style={{ fontSize: 11, fontWeight: 900, color: T.text, fontFamily: 'monospace', background: T.bg, padding: '4px 8px', borderRadius: 6 }}>{log.code}</span>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Payload</span>
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.5, paddingRight: 20 }}>{log.message}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Cluster</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: T.muted }}>
                                    <Terminal size={12} color={T.accent} /> {log.module}
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Protocol</span>
                                {getSeverityPill(log.severity)}
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Timestamp</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: T.text, fontFamily: 'monospace' }}>
                                    <Clock size={11} color={T.subtle} /> {log.date}
                                </div>
                            </div>
                        </div>
                    )) : !loading && (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><History size={24} color={T.green} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>Sector Clear</h3>
                            <p style={{ fontSize: 11, color: T.muted, italic: true }}>No runtime exceptions captured in the current trace telemetry</p>
                        </div>
                    )}
                </div>
            </div>

            {filteredLogs.length > itemsPerPage && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: `1px solid ${T.border}`, background: T.bg, marginTop: -1, border: `1px solid ${T.border}`, borderTop: 'none', borderRadius: '0 0 18px 18px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>Telemetry Nodes <span style={{ color: T.text, fontWeight: 900 }}>{startIndex + 1}</span>–<span style={{ color: T.text, fontWeight: 900 }}>{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of <span style={{ color: T.text, fontWeight: 900 }}>{filteredLogs.length}</span> failures</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: currentPage === 1 ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: currentPage === totalPages ? T.subtle : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ErrorLogs;
