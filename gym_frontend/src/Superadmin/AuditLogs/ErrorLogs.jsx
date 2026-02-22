import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, AlertCircle, FileText, Download } from 'lucide-react';
import { fetchErrorLogs, exportTable, generatePDF } from '../../api/superadmin/superAdminApi';
import './TailwindFallback.css';
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
        exportTable('Error Logs');
    };

    const handleGeneratePDF = () => {
        generatePDF('Error Logs');
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
                return <span className="saas-badge badge-red transition-all duration-300 hover:scale-110 hover:shadow-md"><span className="badge-dot animate-pulse"></span>High</span>;
            case 'medium':
                return <span className="saas-badge badge-yellow transition-all duration-300 hover:scale-110 hover:shadow-md"><span className="badge-dot animate-pulse"></span>Medium</span>;
            case 'low':
                return <span className="saas-badge badge-green transition-all duration-300 hover:scale-110 hover:shadow-md"><span className="badge-dot animate-pulse"></span>Low</span>;
            default:
                return <span className="saas-badge badge-gray transition-all duration-300 hover:scale-110">{severity}</span>;
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading error logs...</div>;
    }

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 animate-slide-up">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Error Logs</h1>
                    <p className="text-sm text-gray-500 mt-1">Track system errors and exceptions</p>
                </div>
                <div className="flex gap-3 flex-col sm:flex-row w-full md:w-auto">
                    <button
                        onClick={handleGeneratePDF}
                        className="saas-btn saas-btn-secondary shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group"
                    >
                        <FileText size={16} className="mr-2 transition-transform duration-300 group-hover:scale-110" />
                        <span>PDF Report</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="saas-btn saas-btn-primary shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group"
                    >
                        <Download size={16} className="mr-2 transition-transform duration-300 group-hover:translate-y-0.5" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="saas-card mb-6" style={{ overflow: 'visible', zIndex: 100, position: 'relative' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="relative group" style={{ zIndex: 30 }}>
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:text-indigo-600 group-focus-within:scale-110" />
                        <input
                            type="text"
                            name="search"
                            value={filter.search}
                            onChange={handleFilterChange}
                            placeholder="Search error message..."
                            className="saas-input pl-10 transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
                        />
                    </div>
                    <div style={{ zIndex: 20 }}>
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
                    <div className="relative group" style={{ zIndex: 10 }}>
                        <input
                            type="date"
                            name="date"
                            value={filter.date}
                            onChange={handleFilterChange}
                            className="saas-input transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
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
                                    <tr key={log.id} className="hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                                        <td data-label="Error Code">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle
                                                    size={16}
                                                    className={`transition-all duration-300 group-hover:scale-125 ${log.severity === 'high' ? 'text-red-500 group-hover:text-red-600' : 'text-yellow-500 group-hover:text-yellow-600'}`}
                                                />
                                                <span className="font-mono text-xs font-bold text-gray-700 transition-colors duration-200 group-hover:text-indigo-600">{log.code}</span>
                                            </div>
                                        </td>
                                        <td data-label="Error Message" className="font-medium text-gray-800 transition-colors duration-200 group-hover:text-gray-900">{log.message}</td>
                                        <td data-label="Module" className="text-sm text-gray-600 transition-colors duration-200 group-hover:text-indigo-600">{log.module}</td>
                                        <td data-label="Severity">{getSeverityBadge(log.severity)}</td>
                                        <td data-label="Date & Time" className="text-gray-500 text-sm font-mono transition-colors duration-200 group-hover:text-indigo-600">{log.date}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No error logs found matching your filters.
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

export default ErrorLogs;
