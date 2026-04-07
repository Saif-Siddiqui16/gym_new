import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield, Activity, RefreshCw, Download, Search, Calendar, Filter, Clock,
    User, ChevronDown, ClipboardList, ChevronLeft, ChevronRight, Loader,
    CheckCircle, XCircle, Edit, Plus, Trash2, Eye, ShieldAlert, Monitor, Info, Loader2
} from 'lucide-react';
import { fetchAuditLogsAPI } from '../../../api/admin/adminApi';
import { useBranchContext } from '../../../context/BranchContext';
import { toast } from 'react-hot-toast';
import { exportPdf } from '../../../utils/exportPdf';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF', shadow: '0 12px 40px -12px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    input: { width: '100%', height: 48, borderRadius: 16, border: `2.5px solid ${T.bg}`, background: T.bg, padding: '0 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: '0.3s', outline: 'none' },
    th: { padding: '20px 24px', fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left', borderBottom: `1px solid ${T.bg}` }
};

const ACTION_ICONS = {
    CREATE: { icon: Plus, color: T.green, bg: T.greenLight },
    UPDATE: { icon: Edit, color: T.accent, bg: T.accentLight },
    DELETE: { icon: Trash2, color: T.rose, bg: T.roseLight },
    LOGIN: { icon: CheckCircle, color: T.accent, bg: T.accentLight },
    LOGOUT: { icon: XCircle, color: T.muted, bg: T.bg },
    VIEW: { icon: Eye, color: T.amber, bg: T.amberLight },
};

const getActionStyle = (action) => {
    const normalized = (action || '').toUpperCase();
    for (const key of Object.keys(ACTION_ICONS)) {
        if (normalized.includes(key)) return ACTION_ICONS[key];
    }
    return { icon: Activity, color: T.accent, bg: T.accentLight };
};

const formatDate = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const AuditStatsCard = ({ title, value, icon: Icon, color, bg, index }) => (
    <div style={{ ...S.card, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }} className={`fu fu${index + 1}`}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
            <h4 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: T.text }}>{value}</h4>
        </div>
    </div>
);

const AuditLogs = () => {
    const { selectedBranch } = useBranchContext();
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ total: 0, today: 0, mostActive: 'N/A' });
    const [filterActions, setFilterActions] = useState([]);
    const [filterModules, setFilterModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    
    const defaults = (() => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);
        return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] };
    })();

    const [filters, setFilters] = useState({ search: '', action: '', module: '', from: defaults.from, to: defaults.to });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const loadLogs = useCallback(async (currentFilters = filters, currentPage = page) => {
        try {
            setLoading(true);
            const params = {
                ...(selectedBranch && selectedBranch !== 'all' ? { branchId: selectedBranch } : {}),
                search: currentFilters.search || undefined,
                action: currentFilters.action || undefined,
                module: currentFilters.module || undefined,
                from: currentFilters.from || undefined,
                to: currentFilters.to || undefined,
                page: currentPage,
                limit: 50
            };
            const data = await fetchAuditLogsAPI(params);
            setLogs(data.logs || []);
            setStats(data.stats || { total: 0, today: 0, mostActive: 'N/A' });
            setFilterActions(data.filters?.actions || []);
            setFilterModules(data.filters?.modules || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (error) {
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [selectedBranch, filters, page]);

    useEffect(() => { setPage(1); loadLogs(filters, 1); }, [selectedBranch]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        setPage(1);
        loadLogs(newFilters, 1);
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const params = {
                ...(selectedBranch && selectedBranch !== 'all' ? { branchId: selectedBranch } : {}),
                search: filters.search || undefined,
                action: filters.action || undefined,
                module: filters.module || undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
                page: 1, limit: 1000
            };
            const data = await fetchAuditLogsAPI(params);
            const rows = (data.logs || []).map(log => [
                formatDate(log.createdAt),
                log.user?.name || 'Unknown',
                log.action || '',
                log.module || '',
                log.affectedEntity || '',
                log.details || ''
            ]);
            const headers = ['Date', 'Actor', 'Action', 'Module', 'Entity', 'Details'];
            exportPdf({ title: 'Audit Logs Report', filename: `audit-logs-${new Date().toISOString().split('T')[0]}`, headers, rows, gymName: "Roar Fitness" });
        } catch (error) { toast.error('Export failed'); } finally { setExporting(false); }
    };

    return (
        <div style={{ padding: 32, background: T.bg, minHeight: '100vh', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.15s } .fu3 { animation-delay: 0.2s }
                select { appearance: none; -webkit-appearance: none; }
                input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
                .tab-cell { transition: 0.2s; }
                tr:hover .tab-cell { background: rgba(0,0,0,0.01) !important; }
            `}</style>

            {/* Premium Header Banner (Matching White Aesthetic - Compact) */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.shadow, border: `1px solid ${T.border}`
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: T.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>
                        <ShieldAlert size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>Audit Logs</h1>
                        <p style={{ margin: '4px 0 0', color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monitor system interactions and security events</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                        onClick={() => loadLogs(filters, page)}
                        style={{ height: 48, padding: '0 24px', borderRadius: 14, border: `2.2px solid ${T.bg}`, background: '#fff', color: T.text, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: '0.3s' }}
                    >
                         <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={exporting}
                        style={{ height: 48, padding: '0 24px', borderRadius: 14, background: T.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: T.shadow }}
                    >
                        {exporting ? <Loader size={16} className="animate-spin" /> : <Download size={16} />} Export
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
                <AuditStatsCard title="Total Logs" value={loading ? '...' : (total || 0).toLocaleString()} icon={ClipboardList} color={T.accent} bg={T.accentLight} index={0} />
                <AuditStatsCard title="Today's Activity" value={loading ? '...' : (stats.today || 0).toLocaleString()} icon={Activity} color={T.green} bg={T.greenLight} index={1} />
                <AuditStatsCard title="Most Active" value={loading ? '...' : (stats.mostActive || 'N/A')} icon={User} color={T.blue} bg={T.blueLight} index={2} />
            </div>

            {/* Filters Bar (Compact) */}
            <div className="fu fu1" style={{ ...S.card, padding: 20, marginBottom: 28, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                        <input style={{ ...S.input, paddingLeft: 40 }} placeholder="Search actor..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select style={S.input} value={filters.action} onChange={e => handleFilterChange('action', e.target.value)}>
                            <option value="">All Actions</option>
                            {filterActions.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select style={S.input} value={filters.module} onChange={e => handleFilterChange('module', e.target.value)}>
                            <option value="">Modules</option>
                            {filterModules.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                    </div>
                    <input type="date" style={{ ...S.input, padding: '0 12px' }} value={filters.from} onChange={e => handleFilterChange('from', e.target.value)} />
                    <input type="date" style={{ ...S.input, padding: '0 12px' }} value={filters.to} onChange={e => handleFilterChange('to', e.target.value)} />
                </div>
            </div>

            {/* Table Area */}
            <div className="fu fu2" style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ background: '#fff' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.01)' }}>
                                <th style={S.th}>Date & Time</th>
                                <th style={S.th}>Actor / Identity</th>
                                <th style={S.th}>Branch</th>
                                <th style={S.th}>Action Event</th>
                                <th style={S.th}>Module</th>
                                <th style={S.th}>Entity</th>
                                <th style={S.th}>Log Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '100px 0', textAlign: 'center' }}>
                                        <Loader2 size={40} className="animate-spin" style={{ color: T.accent, margin: '0 auto 16px' }} />
                                        <p style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '1px' }}>Synchronizing logs...</p>
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => {
                                    const style = getActionStyle(log.action);
                                    return (
                                        <tr key={log.id} style={{ borderBottom: `1px solid ${T.bg}` }}>
                                            <td style={{ padding: '18px 24px', fontSize: 13, fontWeight: 700, color: T.muted }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <Clock size={14} opacity={0.4} /> {formatDate(log.createdAt)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '18px 24px' }}>
                                                <div style={{ fontWeight: 900, fontSize: 14, color: T.text }}>{log.user?.name || `Admin`}</div>
                                                <div style={{ fontSize: 11, color: T.subtle, fontWeight: 700 }}>{log.user?.email || 'system'}</div>
                                            </td>
                                            <td style={{ padding: '18px 24px' }}>
                                                <span style={{ fontSize: 9, fontWeight: 900, color: T.accent, background: T.accentLight, padding: '4px 12px', borderRadius: 10, textTransform: 'uppercase' }}>
                                                    {log.user?.branch || 'Main Branch'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '18px 24px' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 14, background: style.bg, color: style.color, border: `1.5px solid ${style.color}15` }}>
                                                    <style.icon size={12} strokeWidth={3} />
                                                    <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>{log.action}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '18px 24px', fontSize: 13, fontWeight: 800, color: T.text }}>{log.module || '—'}</td>
                                            <td style={{ padding: '18px 24px', fontSize: 13, fontWeight: 700, color: T.muted }}>{log.affectedEntity || '—'}</td>
                                            <td style={{ padding: '18px 24px', maxWidth: 300 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.details}>
                                                    {log.details || '—'}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: '100px 0', textAlign: 'center' }}>
                                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                             <Monitor size={48} color={T.subtle} style={{ opacity: 0.5 }} />
                                        </div>
                                        <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>No Activity Logs</h3>
                                        <p style={{ fontSize: 13, color: T.muted, margin: '8px 0 0' }}>Try adjusting your filters to see more results.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Layer */}
            {!loading && totalPages > 1 && (
                <div className="fu fu3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Showing Page {page} of {totalPages} <span style={{ mx: 10, opacity: 0.4 }}>|</span> {total} total events
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            style={{ width: 44, height: 44, borderRadius: 14, border: `2px solid ${T.border}`, background: '#fff', color: T.text, cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div style={{ height: 44, padding: '0 20px', borderRadius: 14, background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>{page}</div>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            style={{ width: 44, height: 44, borderRadius: 14, border: `2px solid ${T.border}`, background: '#fff', color: T.text, cursor: page === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
