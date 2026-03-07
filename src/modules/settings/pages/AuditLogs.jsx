import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield,
    Activity,
    RefreshCw,
    Download,
    Search,
    Calendar,
    Filter,
    Clock,
    User,
    ChevronDown,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Loader,
    CheckCircle,
    XCircle,
    Edit,
    Plus,
    Trash2,
    Eye
} from 'lucide-react';
import { fetchAuditLogsAPI } from '../../../api/admin/adminApi';
import { useBranchContext } from '../../../context/BranchContext';
import { toast } from 'react-hot-toast';
import StatsCard from '../../dashboard/components/StatsCard';

const ACTION_ICONS = {
    CREATE: { icon: Plus, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    UPDATE: { icon: Edit, color: 'text-primary bg-primary-light border-violet-100' },
    DELETE: { icon: Trash2, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    LOGIN: { icon: CheckCircle, color: 'text-primary bg-primary-light border-violet-100' },
    LOGOUT: { icon: XCircle, color: 'text-slate-600 bg-slate-50 border-slate-100' },
    VIEW: { icon: Eye, color: 'text-amber-600 bg-amber-50 border-amber-100' },
};

const getActionStyle = (action) => {
    const normalized = (action || '').toUpperCase();
    for (const key of Object.keys(ACTION_ICONS)) {
        if (normalized.includes(key)) return ACTION_ICONS[key];
    }
    return { icon: Activity, color: 'text-primary bg-primary-light border-violet-100' };
};

const formatDate = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getDefaultDates = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0]
    };
};

const AuditLogs = () => {
    const { selectedBranch } = useBranchContext();
    const defaults = getDefaultDates();

    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ total: 0, today: 0, mostActive: 'N/A' });
    const [filterActions, setFilterActions] = useState([]);
    const [filterModules, setFilterModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        action: '',
        module: '',
        from: defaults.from,
        to: defaults.to
    });
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
            console.error('Failed to load audit logs', error);
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [selectedBranch, filters, page]);

    useEffect(() => {
        setPage(1);
        loadLogs(filters, 1);
    }, [selectedBranch]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        setPage(1);
        loadLogs(newFilters, 1);
    };

    const handleRefresh = () => {
        loadLogs(filters, page);
        toast.success('Refreshed');
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
                page: 1,
                limit: 10000
            };
            const data = await fetchAuditLogsAPI(params);
            const rows = data.logs || [];
            const headers = ['ID', 'Date', 'Actor', 'Branch', 'Role', 'Action', 'Module', 'Affected Entity', 'Details', 'IP'];
            const csvContent = [
                headers.join(','),
                ...rows.map(log => [
                    log.id,
                    `"${formatDate(log.createdAt)}"`,
                    `"${log.user?.name || 'Unknown'}"`,
                    `"${log.user?.branch || 'Main'}"`,
                    `"${log.user?.role || ''}"`,
                    `"${log.action || ''}"`,
                    `"${log.module || ''}"`,
                    `"${log.affectedEntity || ''}"`,
                    `"${(log.details || '').replace(/"/g, "'")}"`,
                    `"${log.ip || ''}"`
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Exported successfully');
        } catch (error) {
            toast.error('Failed to export');
        } finally {
            setExporting(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        loadLogs(filters, newPage);
    };

    return (
        <div className="p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-white to-primary-light/30 min-h-screen font-sans pb-24 text-slate-800 animate-fadeIn space-y-8">
            {/* Stats Cards */}
            <div className="max-w-full mx-auto mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatsCard
                        title="Total Logs"
                        value={loading ? '—' : stats.total.toString()}
                        icon={Shield}
                        color="primary"
                    />
                    <StatsCard
                        title="Today's Activity"
                        value={loading ? '—' : stats.today.toString()}
                        icon={Activity}
                        color="success"
                    />
                    <StatsCard
                        title="Most Active"
                        value={loading ? '—' : stats.mostActive}
                        icon={User}
                        color="info"
                    />
                </div>
            </div>

            {/* Header */}
            <div className="max-w-full mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Audit Logs</h1>
                        <p className="text-slate-400 text-sm font-semibold mt-1">{total.toLocaleString()} total records</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={exporting || logs.length === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/30/30 transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                            {exporting ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-full mx-auto mb-10">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter size={18} className="text-slate-800" />
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Search</label>
                            <div className="relative group">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Actor, entity, details..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Action */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Action</label>
                            <div className="relative">
                                <select
                                    value={filters.action}
                                    onChange={(e) => handleFilterChange('action', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 appearance-none focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-primary/5 outline-none transition-all cursor-pointer"
                                >
                                    <option value="">All Actions</option>
                                    {filterActions.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Module */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Module</label>
                            <div className="relative">
                                <select
                                    value={filters.module}
                                    onChange={(e) => handleFilterChange('module', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 appearance-none focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-primary/5 outline-none transition-all cursor-pointer"
                                >
                                    <option value="">All Modules</option>
                                    {filterModules.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>

                        {/* From */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">From</label>
                            <input
                                type="date"
                                value={filters.from}
                                onChange={(e) => handleFilterChange('from', e.target.value)}
                                className="w-full pl-4 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-pointer"
                            />
                        </div>

                        {/* To */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">To</label>
                            <input
                                type="date"
                                value={filters.to}
                                onChange={(e) => handleFilterChange('to', e.target.value)}
                                className="w-full pl-4 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="max-w-full mx-auto">
                <div className="flex flex-col mb-6">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        Activity Timeline {!loading && `(${total.toLocaleString()} records)`}
                    </h2>
                </div>

                {loading ? (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm py-32 flex flex-col items-center justify-center gap-4">
                        <Loader size={40} className="animate-spin text-primary" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading audit data...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="bg-white/40 backdrop-blur-md rounded-[32px] border border-white/50 overflow-hidden py-32 text-center">
                        <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <ClipboardList size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400 tracking-tight">No audit logs found</h3>
                        <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mt-2">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100">
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Module</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">IP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {logs.map((log) => {
                                            const { icon: ActionIcon, color } = getActionStyle(log.action);
                                            return (
                                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={12} className="text-slate-300" />
                                                            {formatDate(log.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900">{log.user?.name || `User #${log.userId}`}</p>
                                                            <p className="text-[10px] text-slate-400 font-semibold">{log.user?.email || ''}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-black text-primary bg-primary-light border border-violet-100 px-2.5 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap">
                                                            {log.user?.branch || 'Main'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${color}`}>
                                                            <ActionIcon size={11} />
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-bold text-slate-600">{log.module || '—'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-bold text-slate-700">{log.affectedEntity || '—'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-[200px]">
                                                        <p className="text-xs text-slate-500 truncate" title={log.details}>{log.details || '—'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-mono text-slate-400">{log.ip || '—'}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {logs.map((log) => {
                                    const { icon: ActionIcon, color } = getActionStyle(log.action);
                                    return (
                                        <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">{log.user?.name || `User #${log.userId}`}</p>
                                                    <p className="text-[10px] text-slate-400">{formatDate(log.createdAt)}</p>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${color}`}>
                                                    <ActionIcon size={10} />
                                                    {log.action}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 flex-wrap mt-2">
                                                <span className="text-[10px] font-black text-primary bg-primary-light px-2 py-0.5 rounded">{log.user?.branch || 'Main'}</span>
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{log.module}</span>
                                                {log.affectedEntity && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{log.affectedEntity}</span>}
                                            </div>
                                            {log.details && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{log.details}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-xs font-bold text-slate-400">
                                    Page {page} of {totalPages} · {total.toLocaleString()} records
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page <= 1}
                                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black">{page}</span>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= totalPages}
                                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
