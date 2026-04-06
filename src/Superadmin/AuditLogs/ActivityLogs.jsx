import React, { useState, useEffect } from 'react';
import { 
    Search, Calendar, Filter, Download, Activity, Shield, 
    Clock, User, Globe, ChevronDown, ChevronLeft, ChevronRight, 
    Share2, Terminal, Zap, ShieldCheck, History, BarChart3, Fingerprint, Lock
} from 'lucide-react';
import { fetchActivityLogs, exportTable } from '../../api/superadmin/superAdminApi';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF'
};

// Header Banner Component
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 24, padding: '24px 30px',
        boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative', overflow: 'hidden'
    }} className="fu fu1">
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 2 }}>
            <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', flexShrink: 0
            }}>
                <Icon size={28} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '6px 0 0', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
            {actions}
        </div>
    </div>
);

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, bg, subtitle, index }) => (
    <div style={{
        background: T.surface, borderRadius: 22, border: `1px solid ${T.border}`,
        padding: 24, boxShadow: '0 2px 14px rgba(124,92,252,0.04)', display: 'flex', flexDirection: 'column', gap: 12
    }} className={`fu fu${index + 2}`}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{title}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle }}>{subtitle}</div>
        </div>
    </div>
);

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ search: '', module: '', date: '' });
    const [startIndex, setStartIndex] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => { loadLogs(); }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await fetchActivityLogs();
            setLogs(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.user?.toLowerCase().includes(filter.search.toLowerCase()) ||
            log.action?.toLowerCase().includes(filter.search.toLowerCase()) ||
            log.affectedMember?.toLowerCase().includes(filter.search.toLowerCase());
        const matchesModule = filter.module === '' || log.module?.toLowerCase() === filter.module.toLowerCase();
        const matchesDate = filter.date === '' || log.date?.includes(filter.date);
        return matchesSearch && matchesModule && matchesDate;
    });

    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const currentPage = Math.floor(startIndex / itemsPerPage) + 1;

    const handleExport = () => exportTable('Activity Logs');
    const handlePrevPage = () => { if (startIndex >= itemsPerPage) setStartIndex(startIndex - itemsPerPage); };
    const handleNextPage = () => { if (startIndex + itemsPerPage < filteredLogs.length) setStartIndex(startIndex + itemsPerPage); };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; }
                
                .grid-header {
                    display: grid; grid-template-columns: 1.2fr 1.5fr 1.5fr 1fr 2fr;
                    padding: 14px 24px; background: ${T.accentLight}; color: ${T.accent};
                    font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
                }
                .grid-row {
                    display: grid; grid-template-columns: 1.2fr 1.5fr 1.5fr 1fr 2fr; 
                    padding: 18px 24px; border-bottom: 1px solid ${T.border}; align-items: center; transition: 0.2s;
                    background: ${T.surface};
                }
                .grid-row:hover { background: ${T.bg}; }
            `}</style>

            <HeaderBanner 
                title="Activity Ledger" 
                sub="Immutable forensic audit trail of all administrative orchestrations" 
                icon={ShieldCheck}
                actions={
                    <button onClick={handleExport} style={{ background: '#fff', border: 'none', padding: '10px 18px', borderRadius: 12, color: T.accent, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                        <Download size={16} /> Export Audit
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 28 }}>
                <MetricCard title="System Events" value={logs.length} icon={History} color={T.accent} bg={T.accentLight} subtitle="Audit entries" index={0} />
                <MetricCard title="System Pulses" value="1.4k" icon={Activity} color={T.blue} bg={T.blueLight} subtitle="Daily activity" index={1} />
                <MetricCard title="Secured Log" value="100%" icon={Lock} color={T.green} bg={T.greenLight} subtitle="Encryption" index={2} />
                <MetricCard title="IO Capacity" value="99%" icon={Zap} color={T.amber} bg={T.amberLight} subtitle="Sync speed" index={3} />
            </div>

            {/* Filter Bar */}
            <div className="fu fu3" style={{ background: T.surface, padding: 16, borderRadius: 24, border: `1px solid ${T.border}`, display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} color={T.subtle} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" placeholder="Search by principal, action or entity..." 
                        value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                        style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: 14, border: `1px solid ${T.border}`, background: T.bg, fontSize: 13, fontWeight: 600, color: T.text, outline: 'none' }}
                    />
                </div>
                <div style={{ width: 200, position: 'relative' }}>
                    <Filter size={16} color={T.subtle} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <select 
                        value={filter.module} onChange={e => setFilter(f => ({ ...f, module: e.target.value }))}
                        style={{ width: '100%', padding: '11px 12px 11px 36px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.bg, fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', appearance: 'none', outline: 'none' }}
                    >
                        <option value="">Every Domain</option>
                        <option value="General Settings">Governance</option>
                        <option value="Member Management">Stakeholders</option>
                        <option value="Payments">Financials</option>
                        <option value="Auth">Security</option>
                    </select>
                    <ChevronDown size={14} color={T.subtle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
                <div style={{ position: 'relative' }}>
                    <Calendar size={16} color={T.subtle} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="date" value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))}
                        style={{ padding: '10px 12px 10px 38px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.bg, fontSize: 12, fontWeight: 800, color: T.text, outline: 'none' }}
                    />
                </div>
            </div>

            <div className="fu fu3" style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                <div className="grid-header">
                    {['Timestamp', 'Principal / Agent', 'Intervention', 'Domain', 'Context & Payload Summary'].map(h => <span key={h}>{h}</span>)}
                </div>
                {loading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center' }}>
                         <div className="spinner" style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                         <p style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>Forensic Scan In Progress...</p>
                    </div>
                ) : paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log, i) => (
                        <div key={log.id || i} className="grid-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: T.muted }}>
                                <Clock size={12} color={T.accent} /> {log.date}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{(log.user || '?').charAt(0)}</div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{log.user}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: T.text, letterSpacing: '-0.3px' }}>{log.action}</div>
                                {log.affectedMember && <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle, marginTop: 2 }}>Target: {log.affectedMember}</div>}
                            </div>
                            <div>
                                <span style={{ fontSize: 9, fontWeight: 900, background: T.bg, color: T.accent, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase' }}>{log.module}</span>
                            </div>
                            <div style={{ fontSize: 12, color: T.muted, fontWeight: 600, fontStyle: 'italic', lineHeight: 1.5 }}>
                                {log.details}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: T.subtle }}><Share2 size={32} /></div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: '0 0 8px' }}>Log Buffer Empty</h3>
                        <p style={{ fontSize: 13, color: T.muted }}>No administrative pulse detected for this cross-reference</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredLogs.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: T.surface, border: `1px solid ${T.border}`, borderTop: 'none', borderRadius: '0 0 24px 24px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Showing record <span style={{ color: T.text }}>{startIndex + 1}</span> to <span style={{ color: T.text }}>{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of <span style={{ color: T.text }}>{filteredLogs.length}</span> entries</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handlePrevPage} disabled={currentPage === 1} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`, background: '#fff', color: currentPage === 1 ? T.subtle : T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}><ChevronLeft size={18} /></button>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`, background: '#fff', color: currentPage === totalPages ? T.subtle : T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}><ChevronRight size={18} /></button>
                    </div>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
};

export default ActivityLogs;
