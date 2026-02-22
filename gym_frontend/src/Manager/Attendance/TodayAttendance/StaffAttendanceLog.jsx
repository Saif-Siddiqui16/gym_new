import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Download, Clock, MapPin, User, FileText, ChevronLeft, ChevronRight, Briefcase, Sparkles } from 'lucide-react';
import CustomDropdown from '../../../components/common/CustomDropdown';
import MobileCard from '../../../components/common/MobileCard';
import { getCheckIns } from '../../../api/manager/managerApi';
import { exportCSV } from '../../../api/manager/managerExport';
import '../TailwindFallback.css';

const StaffAttendanceLog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedDate, setSelectedDate] = useState('2024-03-15');
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 5;

    useEffect(() => {
        loadData();
    }, [searchTerm, filterRole, filterStatus, selectedDate, currentPage]);

    const loadData = async () => {
        setLoading(true);
        const filters = {
            search: searchTerm,
            role: filterRole === 'All' ? '' : filterRole,
            status: filterStatus === 'All' ? '' : (filterStatus === 'Checked Out' ? 'checked-out' : (filterStatus === 'On Time' ? 'checked-in' : filterStatus)),
            date: selectedDate,
            type: 'Staff'
        };
        const result = await getCheckIns({ filters, page: currentPage, limit: itemsPerPage });
        setStaff(result?.data || []);
        setTotalItems(result?.total || 0);
        setLoading(false);
    };

    const handleExport = () => {
        exportCSV(staff, 'StaffAttendanceLog');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'On Time':
            case 'checked-in':
                return <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-500/50 hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">On Time</span>;
            case 'Late':
                return <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black shadow-lg shadow-amber-500/50 hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">Late</span>;
            case 'Absent':
                return <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black shadow-lg shadow-red-500/50 hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">Absent</span>;
            case 'checked-out':
            case 'Checked Out':
                return <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-black shadow-lg shadow-blue-500/50 hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer">Checked Out</span>;
            default:
                return <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-400 to-slate-500 text-white text-xs font-black shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer">{status}</span>;
        }
    };

    const getRoleBadge = (role) => {
        const roleColors = {
            'Trainer': 'from-purple-500 to-purple-600 shadow-purple-500/50',
            'Receptionist': 'from-blue-500 to-blue-600 shadow-blue-500/50',
            'Cleaning': 'from-teal-500 to-teal-600 shadow-teal-500/50',
            'Manager': 'from-violet-500 to-violet-600 shadow-violet-500/50'
        };
        const colorClass = roleColors[role] || 'from-slate-500 to-slate-600 shadow-slate-500/50';

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${colorClass} text-white shadow-md hover:scale-110 transition-all duration-300`}>
                {role}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6 flex-shrink-0">
                                <Briefcase size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Staff Attendance
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse whitespace-nowrap">
                                        PREMIUM ✨
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">Track staff shifts and punctuality</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button
                                onClick={handleExport}
                                className="group flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-105 transition-all"
                            >
                                <Download size={18} strokeWidth={2.5} className="transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                                Export Report
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`group flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all ${showFilters
                                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-500/50'
                                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-violet-300'
                                    }`}
                            >
                                <Filter size={18} strokeWidth={2.5} className={`transition-all duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                                Filter
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="group relative bg-white rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 mb-6 overflow-visible hover:shadow-2xl transition-all duration-300" style={{ zIndex: 50 }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="relative group/input">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover/input:text-violet-600 transition-colors duration-300" strokeWidth={2.5} />
                            <input
                                type="text"
                                placeholder="Search staff name..."
                                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 hover:border-violet-300 transition-all duration-300 font-semibold text-sm"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:col-span-2">
                            <div className="w-full sm:w-auto hover:scale-105 transition-transform duration-300">
                                <CustomDropdown
                                    options={['All', 'On Time', 'Checked Out', 'Absent', 'Late']}
                                    value={filterStatus}
                                    onChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}
                                    placeholder="All Status"
                                    icon={Filter}
                                    className="w-full sm:w-40"
                                />
                            </div>
                            <div className="w-full sm:w-auto hover:scale-105 transition-transform duration-300">
                                <CustomDropdown
                                    options={['All', 'Trainer', 'Receptionist', 'Cleaning', 'Manager']}
                                    value={filterRole}
                                    onChange={(value) => { setFilterRole(value); setCurrentPage(1); }}
                                    placeholder="All Roles"
                                    icon={User}
                                    className="w-full sm:w-40"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="group relative bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-500 transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Staff Name</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Role</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Shift Time</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Check-In</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Check-Out</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                                                <span className="font-semibold">Loading staff attendance...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : staff.length > 0 ? (
                                    staff.map((record) => (
                                        <tr key={record.id} className="group/row hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 transition-all duration-300 cursor-pointer hover:shadow-md">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600 flex items-center justify-center shadow-md transition-all duration-500 group-hover/row:scale-125 group-hover/row:bg-gradient-to-br group-hover/row:from-purple-500 group-hover/row:to-violet-600 group-hover/row:text-white group-hover/row:shadow-xl group-hover/row:rotate-6">
                                                        <Briefcase size={18} strokeWidth={2.5} />
                                                    </div>
                                                    <span className="font-bold text-slate-800 group-hover/row:text-violet-700 group-hover/row:translate-x-1 transition-all duration-300">
                                                        {record.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getRoleBadge(record.role)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm font-semibold group-hover/row:text-violet-600 transition-colors duration-300">
                                                {record.shift || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 text-sm font-semibold group-hover/row:text-violet-600 transition-colors duration-300">
                                                {record.time || record.checkIn}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 text-sm font-semibold group-hover/row:text-violet-600 transition-colors duration-300">
                                                {record.checkOut || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(record.status)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                                            No staff attendance logs found for this date.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View (md:hidden) */}
                    <div className="md:hidden p-4 space-y-4">
                        {loading ? (
                            <div className="py-12 text-center text-sm text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                                    <span className="font-semibold text-violet-600">Loading data...</span>
                                </div>
                            </div>
                        ) : staff.length > 0 ? (
                            staff.map((record) => (
                                <MobileCard
                                    key={record.id}
                                    title={record.name}
                                    subtitle={record.role}
                                    badge={record.status}
                                    badgeColor={record.status === 'On Time' || record.status === 'checked-in' ? 'emerald' : record.status === 'Late' ? 'amber' : record.status === 'Absent' ? 'rose' : 'blue'}
                                    fields={[
                                        { label: 'Shift', value: record.shift || '-' },
                                        { label: 'Check-In', value: record.time || record.checkIn, icon: Clock },
                                        { label: 'Check-Out', value: record.checkOut || '-', icon: Clock }
                                    ]}
                                />
                            ))
                        ) : (
                            <div className="py-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-100">
                                No records found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {!loading && totalItems > 0 && (
                    <div className="px-4 sm:px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <span className="text-xs sm:text-sm text-slate-600 font-semibold text-center sm:text-left">
                            Showing <span className="font-black text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-black text-slate-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-black text-slate-900">{totalItems}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="group p-3 border-2 border-slate-200 rounded-xl hover:bg-gradient-to-r hover:from-violet-500 hover:to-purple-600 hover:text-white hover:border-transparent hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all duration-300 shadow-sm hover:shadow-lg"
                            >
                                <ChevronLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                className="group p-3 border-2 border-slate-200 rounded-xl hover:bg-gradient-to-r hover:from-violet-500 hover:to-purple-600 hover:text-white hover:border-transparent hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all duration-300 shadow-sm hover:shadow-lg"
                            >
                                <ChevronRight size={18} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffAttendanceLog;
