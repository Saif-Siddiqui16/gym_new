import React, { useState, useEffect } from 'react';
import { Terminal, Search, Filter, RefreshCw, Zap, Clock, ShieldCheck, AlertCircle, Eye, MoreHorizontal, ChevronRight, Download } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import LogPayloadDrawer from './LogPayloadDrawer';
import { toast } from 'react-hot-toast';

import { fetchWebhookLogs } from '../../api/superadmin/superAdminApi';

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

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await fetchWebhookLogs();
            if (data && data.logs) {
                setWebhookLogs(data.logs);
                setStats(data.stats);
            } else {
                setWebhookLogs(data || []);
            }
        } catch (error) {
            console.error("Failed to load webhook logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        toast('Exporting Webhook Logs to CSV...', { icon: '📥' });
        // Implement actual export logic here
    };

    const filteredLogs = webhookLogs.filter(log => {
        const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.statusCode.toString().includes(searchTerm);
        const matchesStatus = filterStatus === 'All' || log.status === filterStatus.toLowerCase();
        const matchesMethod = filterMethod === 'All' || log.method === filterMethod;
        return matchesSearch && matchesStatus && matchesMethod;
    });

    const handleViewLog = (log) => {
        setSelectedLog(log);
        setIsDrawerOpen(true);
    };

    return (
        <div className="w-full animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Webhook Events</h1>
                    <p className="page-subtitle">Real-time API activity and event broadcasting logs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <Download size={16} /> Export
                    </button>
                    <button onClick={loadLogs} className="btn btn-primary flex items-center gap-2">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Events', val: stats.totalEvents, icon: Zap, bg: 'bg-primary-light', text: 'text-primary' },
                    { label: 'Avg Success', val: stats.successRate, icon: ShieldCheck, bg: 'bg-emerald-50', text: 'text-emerald-600' },
                    { label: 'Failed (24h)', val: stats.failedLast24h, icon: AlertCircle, bg: 'bg-rose-50', text: 'text-rose-600' },
                    { label: 'Active Webhooks', val: stats.activeWebhooks, icon: RefreshCw, bg: 'bg-amber-50', text: 'text-amber-600' },
                ].map((stat, i) => (
                    <div key={i} className="summary-card">
                        <div className={`p-2 w-fit rounded-lg ${stat.bg} ${stat.text} mb-3`}>
                            <stat.icon size={18} />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-title">{stat.val}</p>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="filter-bar mb-6">
                <div className="search-input-wrapper flex-1">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search by event, ID, or status code..."
                        className="saas-input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="saas-input"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">Status: All</option>
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                    </select>
                    <select
                        className="saas-input"
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                    >
                        <option value="All">Method: All</option>
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                        <option value="PUT">PUT</option>
                    </select>
                </div>
            </div>

            {/* Log Table/Cards */}
            <div className="saas-card !p-0 overflow-hidden">
                {/* Desktop View Table */}
                <div className="hidden lg:block saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Event ID</th>
                                <th>Event Type</th>
                                <th>Status</th>
                                <th>Endpoint</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="loading-state">
                                            <div className="loading-spinner"></div>
                                            <p className="loading-text">Loading...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                        No webhook events found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewLog(log)}>
                                        <td>
                                            <span className="text-primary font-medium text-sm">{log.id}</span>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-title font-semibold text-sm">{log.event}</span>
                                                <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                                    <Clock size={12} /> {log.time}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${log.status === 'success' ? 'status-badge-green' : 'status-badge-red'}`}>
                                                <span className="badge-dot"></span>
                                                {log.statusCode} {log.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-muted text-body text-xs font-medium rounded">{log.method}</span>
                                                <span className="text-sm text-muted-foreground">{log.endpoint}</span>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <button className="action-icon-btn">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Cards */}
                <div className="lg:hidden divide-y divide-border">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Loading...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">No webhook events found.</div>
                    ) : (
                        filteredLogs.map(log => (
                            <div key={log.id} className="p-4 space-y-3" onClick={() => handleViewLog(log)}>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-primary">{log.id}</span>
                                        <h3 className="text-sm font-semibold text-title">{log.event}</h3>
                                    </div>
                                    <span className={`status-badge ${log.status === 'success' ? 'status-badge-green' : 'status-badge-red'}`}>
                                        <span className="badge-dot"></span>
                                        {log.statusCode}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-muted text-body text-xs font-medium rounded">{log.method}</span>
                                        <span>{log.endpoint}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} /> {log.time}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination-wrapper">
                <div className="pagination-info">
                    Showing {filteredLogs.length} webhook events
                </div>
                <div className="pagination-controls">
                    <button className="pagination-btn">Previous</button>
                    <button className="pagination-btn">Next</button>
                </div>
            </div>

            {/* Payload Inspector Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Log Inspector"
                width="600px"
            >
                <LogPayloadDrawer
                    selectedLog={selectedLog}
                    onClose={() => setIsDrawerOpen(false)}
                />
            </RightDrawer>
        </div>
    );
};

export default WebhookLogs;
