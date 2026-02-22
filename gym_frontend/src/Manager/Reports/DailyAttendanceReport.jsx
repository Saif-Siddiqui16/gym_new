import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, UserCheck, Download, Filter, Search, MoreVertical, ChevronLeft, ChevronRight, Eye, Trash2, X, Clock, MapPin, Smartphone, ChevronDown, Check } from 'lucide-react';
import { getCheckIns, getAttendanceStats, deleteCheckIn } from '../../api/manager/managerApi';
import { exportCSV } from '../../api/manager/managerExport';
import RightDrawer from '../../components/common/RightDrawer';
import '../../styles/GlobalDesign.css';

// Reusable Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, icon: Icon, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative min-w-[160px]" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${isOpen ? 'border-violet-500 ring-2 ring-violet-100 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    {Icon && <Icon size={16} className="text-gray-400" />}
                    <span className="font-medium truncate">{value === 'All' ? placeholder : value}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-violet-500' : ''}`} />
            </button>

            <div className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="py-1">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => { onChange(option); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${value === option ? 'bg-violet-50 text-violet-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {option === 'All' ? placeholder : option}
                            {value === option && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DailyAttendanceReport = () => {
    const [selectedDate, setSelectedDate] = useState('2024-03-15');
    const [typeFilter, setTypeFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [attendance, setAttendance] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({ totalToday: 0, membersToday: 0, staffToday: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showFilters, setShowFilters] = useState(true); // Default open for better visibility
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const itemsPerPage = 5;

    useEffect(() => {
        loadData();
    }, [selectedDate, typeFilter, searchTerm, currentPage]);

    const loadData = async () => {
        setLoading(true);
        const filters = {
            search: searchTerm,
            type: typeFilter === 'All' ? '' : typeFilter,
            date: selectedDate
        };

        const [attendanceData, statsData] = await Promise.all([
            getCheckIns({ filters, page: currentPage, limit: itemsPerPage }),
            getAttendanceStats()
        ]);

        setAttendance(attendanceData?.data || []);
        setTotalItems(attendanceData?.total || 0);
        if (statsData) setAttendanceStats(statsData);
        setLoading(false);
    };

    const handleExport = () => {
        exportCSV(attendance, 'DailyAttendanceReport');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this attendance record?')) {
            await deleteCheckIn(id);
            loadData();
        }
    };

    const handleViewDetails = (entry) => {
        setSelectedEntry(entry);
        setIsViewModalOpen(true);
    };

    const stats = [
        { label: 'Total Attendance', value: attendanceStats.totalToday, icon: Users, bg: 'bg-indigo-50', color: 'text-indigo-600', border: 'border-indigo-100' },
        { label: 'Member Attendance', value: attendanceStats.membersToday, icon: UserCheck, bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-100' },
        { label: 'Staff Attendance', value: attendanceStats.staffToday, icon: UserCheck, bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-100' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            {/* Premium Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Calendar size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    Daily Attendance Report
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Detailed breakdown of today's attendance for members and staff</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2.5 border rounded-xl hover:bg-gray-50 transition-all ${showFilters ? 'bg-violet-50 border-violet-200 ring-2 ring-violet-100 text-violet-600' : 'bg-white border-gray-200 text-gray-500'}`}
                            >
                                <Filter size={18} />
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-xl hover:shadow-violet-500/50 text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Download size={18} />
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 hover:shadow-2xl hover:border-violet-200 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 group cursor-pointer`}>
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-md`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900 leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl hover:border-violet-200 transition-all duration-300" style={{ overflow: 'visible', zIndex: 10, position: 'relative' }}>
                {showFilters && (
                    <div className="p-6 border-b border-slate-100 hover:bg-violet-50/20 transition-colors duration-300">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-violet-500 group-hover:scale-110 transition-all duration-300" size={18} />
                                    <input
                                        type="date"
                                        className="pl-11 h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all bg-white hover:border-slate-300 hover:shadow-sm"
                                        value={selectedDate}
                                        onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                                <div className="w-full md:w-48">
                                    <CustomDropdown
                                        options={['All', 'Member', 'Staff', 'Trainer']}
                                        value={typeFilter}
                                        onChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
                                        placeholder="All Types"
                                        icon={Users}
                                    />
                                </div>
                            </div>
                            <div className="relative w-full md:w-72 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-violet-500 group-hover:scale-110 transition-all duration-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    className="pl-11 h-11 w-full rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 text-sm bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-b-2 border-violet-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Type</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Check-In</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Check-Out</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider text-right hover:text-purple-700 transition-colors duration-300 cursor-pointer">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center gap-2 text-violet-600">
                                            <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Loading report...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : attendance.length > 0 ? (
                                attendance.map((row) => (
                                    <tr key={row.id} className="hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/30 transition-colors duration-200 group">
                                        <td className="px-6 py-4" data-label="Name">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${row.type === 'Member' ? 'bg-green-100 text-green-700' :
                                                    row.type === 'Staff' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {(row.name || '?').charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Type">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${row.type === 'Member' ? 'bg-green-50 text-green-600 border-green-100' :
                                                row.type === 'Staff' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-purple-50 text-purple-600 border-purple-100'
                                                }`}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" data-label="Check-In">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Clock size={14} className="text-gray-400" />
                                                {row.time || row.checkIn}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Check-Out">
                                            <span className="text-sm text-gray-600">{row.checkOut || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4" data-label="Status">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                {row.status === 'checked-in' ? 'Present' : (row.status === 'checked-out' ? 'Present' : row.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" data-label="Actions">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleViewDetails(row)}
                                                    className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all hover:scale-110 duration-300"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-gray-50 rounded-full">
                                                <Search size={20} className="text-gray-300" />
                                            </div>
                                            <p>No attendance records found for this date.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalItems > 0 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">
                            Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-gray-900">{totalItems}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all hover:-translate-y-0.5"
                                aria-label="Previous Page"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all hover:-translate-y-0.5"
                                aria-label="Next Page"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Details Drawer */}
            <RightDrawer
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Attendance Details"
                subtitle="Detailed entry log"
                width="500px"
            >
                {selectedEntry && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className={`h-20 w-20 rounded-full flex items-center justify-center font-black text-2xl mb-3 shadow-lg ring-4 ring-offset-4 ${selectedEntry.type === 'Member' ? 'bg-green-100 text-green-600 ring-green-50' :
                                selectedEntry.type === 'Staff' ? 'bg-blue-100 text-blue-600 ring-blue-50' :
                                    'bg-purple-100 text-purple-600 ring-purple-50'
                                }`}>
                                {(selectedEntry.name || '?').charAt(0)}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">{selectedEntry.name}</h4>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full mt-2 uppercase tracking-widest border ${selectedEntry.type === 'Member' ? 'bg-green-50 text-green-600 border-green-100' :
                                selectedEntry.type === 'Staff' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-purple-50 text-purple-600 border-purple-100'
                                }`}>
                                {selectedEntry.type}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Clock size={12} /> Check-In
                                </p>
                                <p className="text-lg font-black text-slate-800">{selectedEntry.time || selectedEntry.checkIn || '-'}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Clock size={12} /> Check-Out
                                </p>
                                <p className="text-lg font-black text-slate-800">{selectedEntry.checkOut || '-'}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                                        <Smartphone size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Entrance Kiosk A</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Device Info</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Main Location</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Branch</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsViewModalOpen(false)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all mt-6 shadow-lg shadow-slate-200"
                        >
                            Close Details
                        </button>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default DailyAttendanceReport;
