import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, AlertCircle, FileText, Download } from 'lucide-react';
import { fetchErrorLogs, exportTable } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const ErrorLogs = () => {
    const [errorLogs, setErrorLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        search: '',
        severity: '',
        date: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadLogs();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const loadLogs = async () => {
        setLoading(true);
        const data = await fetchErrorLogs();
        setErrorLogs(data);
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const handleExport = () => {
        exportTable('Error Logs', errorLogs);
    };

    const filteredLogs = errorLogs.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(filter.search.toLowerCase()) ||
            log.code.toLowerCase().includes(filter.search.toLowerCase());
        const matchesSeverity = filter.severity === '' || log.severity.toLowerCase() === filter.severity.toLowerCase();
        const matchesDate = filter.date === '' || log.date.includes(filter.date);

        return matchesSearch && matchesSeverity && matchesDate;
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const getSeverityBadge = (severity) => {
        const lowerSeverity = severity.toLowerCase();
        switch (lowerSeverity) {
            case 'high':
                return <span className="status-badge status-badge-red"><span className="badge-dot"></span>High</span>;
            case 'medium':
                return <span className="status-badge status-badge-yellow"><span className="badge-dot"></span>Medium</span>;
            case 'low':
                return <span className="status-badge status-badge-green"><span className="badge-dot"></span>Low</span>;
            default:
                return <span className="status-badge">{severity}</span>;
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading...</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Error Logs</h1>
                    <p className="page-subtitle">Track system errors and exceptions</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FileText size={16} />
                        <span>Export as PDF</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
                    <div className="search-input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            name="search"
                            value={filter.search}
                            onChange={handleFilterChange}
                            placeholder="Search error message..."
                            className="saas-input pl-10"
                        />
                    </div>
                    <div>
                        <CustomDropdown
                            options={[
                                { value: '', label: 'All Severities' },
                                { value: 'high', label: 'High' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'low', label: 'Low' }
                            ]}
                            value={filter.severity}
                            onChange={(val) => handleFilterChange({ target: { name: 'severity', value: val } })}
                            placeholder="All Severities"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            name="date"
                            value={filter.date}
                            onChange={handleFilterChange}
                            className="saas-input"
                        />
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="saas-card !p-0 overflow-hidden">
                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Error Code</th>
                                <th>Error Message</th>
                                <th>Module</th>
                                <th>Severity</th>
                                <th>Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.length > 0 ? (
                                paginatedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td data-label="Error Code">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle
                                                    size={16}
                                                    className={log.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}
                                                />
                                                <span className="font-mono text-xs font-bold text-body">{log.code}</span>
                                            </div>
                                        </td>
                                        <td data-label="Error Message" className="font-medium text-title">{log.message}</td>
                                        <td data-label="Module" className="text-sm text-muted-foreground">{log.module}</td>
                                        <td data-label="Severity">{getSeverityBadge(log.severity)}</td>
                                        <td data-label="Date & Time" className="text-muted-foreground text-sm font-mono">{log.date}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                        No error logs found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination-wrapper">
                    <span className="pagination-info">
                        {filteredLogs.length > 0 ? (
                            `Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, filteredLogs.length)} of ${filteredLogs.length} logs`
                        ) : (
                            'No logs'
                        )}
                    </span>
                    <div className="pagination-controls">
                        <button
                            className="pagination-btn disabled:opacity-50"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                className={`pagination-num ${currentPage === index + 1 ? 'active' : ''}`}
                                onClick={() => handlePageClick(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            className="pagination-btn disabled:opacity-50"
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages || totalPages === 0}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorLogs;
