import React, { useState, useEffect } from 'react';
import { Search, Monitor, Server, RefreshCw } from 'lucide-react';
import { fetchHardwareLogs } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const HardwareLogs = () => {
    const [hardwareLogs, setHardwareLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [filter, setFilter] = useState({
        search: '',
        type: '',
        status: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadLogs(true);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const loadLogs = async (isInitial = false) => {
        if (isInitial) setInitialLoading(true);
        else setLoading(true);

        // Simulate network delay for visible loading state
        await new Promise(resolve => setTimeout(resolve, 800));

        const data = await fetchHardwareLogs();
        setHardwareLogs(data);

        if (isInitial) setInitialLoading(false);
        else setLoading(false);
    };

    const handleRefresh = () => {
        loadLogs();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const filteredLogs = hardwareLogs.filter(log => {
        const matchesSearch = log.name.toLowerCase().includes(filter.search.toLowerCase()) ||
            log.message.toLowerCase().includes(filter.search.toLowerCase());
        const matchesType = filter.type === '' || log.type.toLowerCase() === filter.type.toLowerCase();
        const matchesStatus = filter.status === '' || log.status.toLowerCase() === filter.status.toLowerCase();

        return matchesSearch && matchesType && matchesStatus;
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

    const getStatusBadge = (status) => {
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case 'connected':
                return <span className="status-badge status-badge-green"><span className="badge-dot"></span>Connected</span>;
            case 'disconnected':
                return <span className="status-badge status-badge-yellow"><span className="badge-dot"></span>Disconnected</span>;
            case 'error':
                return <span className="status-badge status-badge-red"><span className="badge-dot"></span>Error</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    if (initialLoading) {
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
                    <h1 className="page-title">Hardware Logs</h1>
                    <p className="page-subtitle">Monitor device connectivity and events</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="btn btn-primary flex items-center gap-2"
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Refreshing...' : 'Refresh Logs'}
                </button>
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
                            placeholder="Search by device name..."
                            className="saas-input pl-10"
                        />
                    </div>
                    <div>
                        <CustomDropdown
                            options={[
                                { value: '', label: 'All Types' },
                                { value: 'biometric', label: 'Biometric' },
                                { value: 'card reader', label: 'Card Reader' },
                                { value: 'access controller', label: 'Access Controller' },
                                { value: 'turnstile', label: 'Turnstile' },
                                { value: 'controller', label: 'Controller' },
                                { value: 'rfid', label: 'RFID' }
                            ]}
                            value={filter.type}
                            onChange={(val) => handleFilterChange({ target: { name: 'type', value: val } })}
                            placeholder="All Types"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <CustomDropdown
                            options={[
                                { value: '', label: 'All Statuses' },
                                { value: 'connected', label: 'Connected' },
                                { value: 'disconnected', label: 'Disconnected' },
                                { value: 'error', label: 'Error' }
                            ]}
                            value={filter.status}
                            onChange={(val) => handleFilterChange({ target: { name: 'status', value: val } })}
                            placeholder="All Statuses"
                            className="w-full"
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
                                <th>Device Name</th>
                                <th>Device Type</th>
                                <th>Status</th>
                                <th>Log Message</th>
                                <th>Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.length > 0 ? (
                                paginatedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td data-label="Device Name">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center">
                                                    <Server size={16} />
                                                </div>
                                                <span className="font-medium text-title">{log.name}</span>
                                            </div>
                                        </td>
                                        <td data-label="Device Type" className="text-sm text-muted-foreground">{log.type}</td>
                                        <td data-label="Status">{getStatusBadge(log.status)}</td>
                                        <td data-label="Log Message" className="text-sm text-body">{log.message}</td>
                                        <td data-label="Date & Time" className="text-muted-foreground text-sm font-mono">{log.date}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                        No hardware logs found matching your filters.
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

export default HardwareLogs;
