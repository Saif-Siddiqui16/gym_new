import React, { useState, useEffect } from 'react';
import { Search, Monitor, Server, RefreshCw } from 'lucide-react';
import { fetchHardwareLogs } from '../../api/superadmin/superAdminApi';
import './TailwindFallback.css';
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
                return <span className="saas-badge badge-green"><span className="badge-dot"></span>Connected</span>;
            case 'disconnected':
                return <span className="saas-badge badge-yellow"><span className="badge-dot"></span>Disconnected</span>;
            case 'error':
                return <span className="saas-badge badge-red"><span className="badge-dot"></span>Error</span>;
            default:
                return <span className="saas-badge badge-gray">{status}</span>;
        }
    };

    if (initialLoading) {
        return <div className="p-12 text-center text-gray-500">Loading hardware logs...</div>;
    }

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 animate-slide-up">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Hardware Logs</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor device connectivity and events</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="saas-btn saas-btn-primary shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:hover:translate-y-0 group w-full md:w-auto"
                    disabled={loading}
                >
                    <RefreshCw size={16} className={`mr-2 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                    {loading ? 'Refreshing...' : 'Refresh Logs'}
                </button>
            </div>

            {/* Filters */}
            <div className="saas-card mb-6" style={{ overflow: 'visible', zIndex: 100, position: 'relative' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="relative group" style={{ zIndex: 300 }}>
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:text-indigo-600 group-focus-within:scale-110" />
                        <input
                            type="text"
                            name="search"
                            value={filter.search}
                            onChange={handleFilterChange}
                            placeholder="Search by device name..."
                            className="saas-input pl-10 transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
                        />
                    </div>
                    <div className="dropdown-column" style={{ zIndex: 200, position: 'relative' }}>
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
                    <div className="dropdown-column" style={{ zIndex: 100, position: 'relative' }}>
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
            <div className="saas-card p-0 overflow-hidden animate-slide-up delay-200">
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
                                    <tr key={log.id} className="hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                                        <td data-label="Device Name">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600 transition-all duration-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110">
                                                    <Server size={16} />
                                                </div>
                                                <span className="font-medium text-gray-800 transition-colors duration-200 group-hover:text-indigo-600">{log.name}</span>
                                            </div>
                                        </td>
                                        <td data-label="Device Type" className="text-sm text-gray-600">{log.type}</td>
                                        <td data-label="Status">{getStatusBadge(log.status)}</td>
                                        <td data-label="Log Message" className="text-sm text-gray-700">{log.message}</td>
                                        <td data-label="Date & Time" className="text-gray-500 text-sm font-mono">{log.date}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No hardware logs found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
                    <span className="text-sm text-gray-500 text-center md:text-left">
                        {filteredLogs.length > 0 ? (
                            `Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, filteredLogs.length)} of ${filteredLogs.length} logs`
                        ) : (
                            'No logs'
                        )}
                    </span>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <button
                            className="saas-btn saas-btn-secondary py-1 px-3 text-xs disabled:opacity-50 transition-all duration-200 hover:shadow-md disabled:hover:shadow-none"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                className={`saas-btn py-1 px-3 text-xs transition-all duration-200 hover:shadow-md ${currentPage === index + 1 ? 'saas-btn-primary shadow-sm' : 'saas-btn-secondary'}`}
                                onClick={() => handlePageClick(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            className="saas-btn saas-btn-secondary py-1 px-3 text-xs disabled:opacity-50 transition-all duration-200 hover:shadow-md disabled:hover:shadow-none"
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
