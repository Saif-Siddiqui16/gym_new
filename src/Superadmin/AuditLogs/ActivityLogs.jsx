import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, Download, Activity, Shield, Clock, User, Globe } from 'lucide-react';
import { fetchActivityLogs, exportTable } from '../../api/superadmin/superAdminApi';
import MobileCard from '../../components/common/MobileCard';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        search: '',
        module: '',
        date: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const itemsPerPage = 10;

    useEffect(() => {
        loadLogs();
    }, []);

    useEffect(() => {
        setStartIndex(0);
    }, [filter]);

    const loadLogs = async () => {
        setLoading(true);
        const data = await fetchActivityLogs();
        setLogs(data);
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExport = () => {
        exportTable('Activity Logs');
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedLogs = [...logs].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredLogs = sortedLogs.filter(log => {
        const matchesSearch =
            log.user.toLowerCase().includes(filter.search.toLowerCase()) ||
            log.action.toLowerCase().includes(filter.search.toLowerCase()) ||
            log.affectedMember.toLowerCase().includes(filter.search.toLowerCase());
        const matchesModule = filter.module === '' || log.module.toLowerCase() === filter.module.toLowerCase();
        const matchesDate = filter.date === '' || log.date.includes(filter.date);

        return matchesSearch && matchesModule && matchesDate;
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const currentPage = Math.floor(startIndex / itemsPerPage) + 1;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => {
        if (startIndex >= itemsPerPage) setStartIndex(startIndex - itemsPerPage);
    };

    const handleNextPage = () => {
        if (startIndex + itemsPerPage < filteredLogs.length) setStartIndex(startIndex + itemsPerPage);
    };

    const handlePageClick = (page) => {
        setStartIndex((page - 1) * itemsPerPage);
    };

    const moduleOptions = [
        { value: '', label: 'All Modules' },
        { value: 'General Settings', label: 'General Settings' },
        { value: 'Member Management', label: 'Member Management' },
        { value: 'Payments', label: 'Payments' },
        { value: 'Auth', label: 'Authentication' },
        { value: 'Plans', label: 'Plans' },
        { value: 'Reports', label: 'Reports' }
    ];

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading activity logs...</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">System Activity Logs</h1>
                    <p className="page-subtitle">Track user actions and system changes in real-time</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <button
                        onClick={handleExport}
                        className="btn btn-outline flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export as PDF
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn ${showFilters ? 'btn-outline' : 'btn-primary'} flex items-center justify-center gap-2`}
                    >
                        <Filter className="w-4 h-4" />
                        <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            {showFilters && (
                <div className="filter-bar mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="search-input-wrapper">
                            <Search
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                type="text"
                                name="search"
                                value={filter.search}
                                onChange={handleFilterChange}
                                placeholder="Search by user or action..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <Filter
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                            />
                            <select
                                name="module"
                                value={filter.module}
                                onChange={handleFilterChange}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors appearance-none cursor-pointer"
                            >
                                {moduleOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <Calendar
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                            />
                            <input
                                type="date"
                                name="date"
                                value={filter.date}
                                onChange={handleFilterChange}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Card View */}
            {paginatedLogs.length > 0 ? (
                <>
                    <div className="md:hidden space-y-4 mb-6">
                        {paginatedLogs.map((log) => (
                            <MobileCard
                                key={log.id}
                                title={log.action}
                                subtitle={log.user}
                                badge={log.module}
                                badgeColor="bg-primary-light text-primary border-border"
                                fields={[
                                    { label: 'Affected', value: log.affectedMember, icon: User },
                                    { label: 'Date', value: log.date.split(' ')[0], icon: Calendar },
                                    { label: 'Time', value: log.date.split(' ').slice(1).join(' '), icon: Clock },
                                    { label: 'Details', value: log.details, icon: Activity },
                                ]}
                            />
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block saas-card !p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th
                                            onClick={() => handleSort('date')}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                Date
                                                {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('user')}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                Staff Name
                                                {sortConfig.key === 'user' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th>Action</th>
                                        <th>Affected Member</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {paginatedLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="group cursor-pointer"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm font-bold text-body">
                                                    <Clock size={14} className="text-muted-foreground" />
                                                    {log.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-primary-light flex items-center justify-center text-primary font-black text-xs">
                                                        {(log.user || '?').charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-title">{log.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-title tracking-tight">{log.action}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                        {log.module}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                    <span className="text-sm font-bold text-body">{log.affectedMember}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 max-w-xs">
                                                <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">{log.details}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="pagination-wrapper">
                        <span className="pagination-info">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
                        </span>
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <div className="flex gap-2">
                                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                                    const pageNum = index + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`pagination-num ${currentPage === pageNum ? 'active' : ''}`}
                                            onClick={() => handlePageClick(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                className="pagination-btn"
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Activity size={40} />
                    </div>
                    <h3 className="empty-state-title">No Activity Logs Found</h3>
                    <p className="empty-state-description">
                        {filter.search || filter.module || filter.date
                            ? 'Try adjusting your search or filter criteria'
                            : 'Activity logs will appear here as users interact with the system'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ActivityLogs;
