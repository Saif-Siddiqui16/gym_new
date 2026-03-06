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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-violet-600 animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 min-h-screen p-4 sm:p-6">
            {/* Premium Header with Gradient */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Shield className="text-violet-600 flex-shrink-0" size={24} />
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    System Activity Logs
                                </h1>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">Track user actions and system changes in real-time</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                            <button
                                onClick={handleExport}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-md hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 shadow-sm group w-full sm:w-auto"
                            >
                                <Download className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                                Export
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`group relative px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto text-xs sm:text-sm ${showFilters
                                    ? 'bg-white border border-slate-200 text-slate-700'
                                    : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-violet-500/50'
                                    }`}
                            >
                                {!showFilters && <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
                                <Filter className={`w-4 h-4 relative transition-transform duration-300 ${showFilters ? '' : 'group-hover:rotate-12'}`} />
                                <span className="relative">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glass Morphism Filter Bar */}
            {showFilters && (
                <div className="mb-6 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-5 hover:shadow-xl transition-all duration-300 animate-slide-down">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group">
                            <Search
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300"
                            />
                            <input
                                type="text"
                                name="search"
                                value={filter.search}
                                onChange={handleFilterChange}
                                placeholder="Search by user or action..."
                                className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300"
                            />
                        </div>

                        <div className="relative group">
                            <Filter
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300 pointer-events-none z-10"
                            />
                            <select
                                name="module"
                                value={filter.module}
                                onChange={handleFilterChange}
                                className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300 appearance-none cursor-pointer"
                            >
                                {moduleOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative group">
                            <Calendar
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300 pointer-events-none z-10"
                            />
                            <input
                                type="date"
                                name="date"
                                value={filter.date}
                                onChange={handleFilterChange}
                                className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300"
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
                                badgeColor="bg-violet-100 text-violet-700 border-violet-200"
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
                    <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-100 to-slate-200/50 border-b-2 border-slate-300">
                                        <th
                                            onClick={() => handleSort('date')}
                                            className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-700 cursor-pointer hover:text-violet-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Date
                                                {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('user')}
                                            className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-700 cursor-pointer hover:text-violet-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Staff Name
                                                {sortConfig.key === 'user' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-700">Action</th>
                                        <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-700">Affected Member</th>
                                        <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-widest text-slate-700">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="group hover:bg-slate-50/80 transition-all duration-300 border-b border-slate-100"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                    <Clock size={14} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
                                                    {log.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700 font-black text-xs shadow-sm border border-violet-200">
                                                        {(log.user || '?').charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{log.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-slate-800 tracking-tight">{log.action}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        {log.module}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                                                    <span className="text-sm font-bold text-slate-700">{log.affectedMember}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 max-w-xs">
                                                <p className="text-sm font-medium text-slate-500 leading-relaxed italic">{log.details}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <span className="text-sm text-slate-600">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-md disabled:hover:scale-100"
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
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-110 ${currentPage === pageNum
                                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                                }`}
                                            onClick={() => handlePageClick(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                className="px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-md disabled:hover:scale-100"
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                        <Activity size={40} className="text-violet-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No Activity Logs Found</h3>
                    <p className="text-slate-600">
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
