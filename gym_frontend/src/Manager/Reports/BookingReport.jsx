import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Tag, ClipboardList, Download, Filter, Search, Clock, ChevronLeft, ChevronRight, Eye, Trash2, User, MapPin, Activity, ChevronDown, Check, FileText } from 'lucide-react';
import apiClient from '../../api/apiClient';
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

const BookingReport = () => {
    const [dateRange, setDateRange] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookings, setBookings] = useState([]);
    const [bookingStats, setBookingStats] = useState({ total: 0, completed: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showFilters, setShowFilters] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const itemsPerPage = 5;

    useEffect(() => {
        loadData();
    }, [dateRange, statusFilter, searchTerm, currentPage]);

    const loadData = async () => {
        try {
            setLoading(true);
            const params = {
                search: searchTerm,
                status: statusFilter,
                dateRange: dateRange,
                page: currentPage,
                limit: itemsPerPage
            };
            const response = await apiClient.get('/branch-admin/reports/bookings', { params });
            setBookings(response.data.data || []);
            setTotalItems(response.data.total || 0);
            if (response.data.stats) {
                setBookingStats(response.data.stats);
            }
        } catch (error) {
            console.error('Booking Load Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (bookings.length === 0) { alert("No data to export"); return; }
        const headers = ["Booking ID", "Member", "Class/Type", "Trainer", "Date", "Time", "Status"];
        const csvContent = [
            headers.join(","),
            ...bookings.map(row => [
                `"${row.id}"`,
                `"${row.memberName}"`,
                `"${row.classType}"`,
                `"${row.trainerName}"`,
                `"${row.date}"`,
                `"${row.time}"`,
                `"${row.status}"`
            ].join(","))
        ].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `booking_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (bookings.length === 0) { alert("No data to export"); return; }
        const rows = bookings.map(b =>
            `<tr><td>${b.id}</td><td>${b.memberName}</td><td>${b.classType}</td><td>${b.trainerName}</td><td>${b.date} ${b.time}</td><td>${b.status}</td></tr>`
        ).join('');
        const html = `<html><head><title>Booking Report</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#6d28d9;color:white}tr:nth-child(even){background:#f9f5ff}</style></head><body><h2>Booking Report</h2><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr><th>ID</th><th>Member</th><th>Class</th><th>Trainer</th><th>Date/Time</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
        const w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
        w.print();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to cancel and remove this booking?')) {
            try {
                await apiClient.delete(`/admin/bookings/${id}`);
                loadData();
            } catch (error) {
                console.error('Delete Error:', error);
                alert('Failed to delete booking. Please try again.');
            }
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setIsViewModalOpen(true);
    };

    const getStatusStyle = (status) => {
        if (status === 'Completed') return 'bg-green-50 text-green-700 border-green-100';
        if (status === 'Cancelled') return 'bg-red-50 text-red-700 border-red-100';
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    };

    const stats = [
        { label: 'Total Bookings', value: bookingStats.total, icon: ClipboardList, bg: 'bg-indigo-50', color: 'text-indigo-600', border: 'border-indigo-100' },
        { label: 'Completed', value: bookingStats.completed, icon: ClipboardList, bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-100' },
        { label: 'Cancelled', value: bookingStats.cancelled, icon: ClipboardList, bg: 'bg-red-50', color: 'text-red-600', border: 'border-red-100' },
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
                                <ClipboardList size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    Booking Report
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Analyze class and personal training booking performance</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleExportCSV}
                                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all rounded-xl px-4 py-2.5 text-sm font-semibold"
                            >
                                <Download size={16} className="text-gray-500" /> Export CSV
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all rounded-xl px-4 py-2.5 text-sm font-semibold"
                            >
                                <FileText size={16} className="text-gray-500" /> Export PDF
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2.5 border rounded-xl hover:bg-gray-50 transition-all ${showFilters ? 'bg-violet-50 border-violet-200 ring-2 ring-violet-100 text-violet-600' : 'bg-white border-gray-200 text-gray-500'}`}
                            >
                                <Filter size={18} />
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
                            <p className="text-3xl font-black text-gray-900 leading-none">
                                {loading ? <span className="text-lg text-gray-300">...</span> : stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl hover:border-violet-200 transition-all duration-300" style={{ overflow: 'visible', zIndex: 10, position: 'relative' }}>

                {showFilters && (
                    <div className="p-6 border-b border-slate-100 hover:bg-violet-50/20 transition-colors duration-300">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="flex flex-wrap gap-4 w-full md:w-auto">
                                <div className="w-full md:w-48">
                                    <CustomDropdown
                                        options={['All', 'Today', 'This Week', 'This Month']}
                                        value={dateRange}
                                        onChange={(val) => { setDateRange(val); setCurrentPage(1); }}
                                        placeholder="All Time"
                                        icon={Calendar}
                                    />
                                </div>
                                <div className="w-full md:w-48">
                                    <CustomDropdown
                                        options={['All', 'Upcoming', 'Completed', 'Cancelled']}
                                        value={statusFilter}
                                        onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                                        placeholder="All Status"
                                        icon={Tag}
                                    />
                                </div>
                            </div>
                            <div className="relative w-full md:w-72 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-violet-500 group-hover:scale-110 transition-all duration-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by member or class..."
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
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider">Booking Type</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider">Trainer</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider">Date / Time</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center gap-2 text-violet-600">
                                            <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Generating report...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : bookings.length > 0 ? (
                                bookings.map((row) => (
                                    <tr key={row.id} className="hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/30 transition-colors duration-200 group">
                                        <td className="px-6 py-4" data-label="Booking ID">
                                            <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-md">#{row.id}</span>
                                        </td>
                                        <td className="px-6 py-4" data-label="Member">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                    {(row.memberName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-sm font-bold text-gray-800">{row.memberName || 'Unknown'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Booking Type">
                                            <span className="text-sm font-medium text-gray-700">{row.classType || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4" data-label="Trainer">
                                            <span className="text-sm text-gray-600 font-medium">{row.trainerName || 'Unassigned'}</span>
                                        </td>
                                        <td className="px-6 py-4" data-label="Date / Time">
                                            <div className="text-sm text-gray-700">
                                                <div className="font-semibold">{row.date || '-'}</div>
                                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                    <Clock size={11} />
                                                    {row.time || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Status">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transform transition-transform hover:scale-105 inline-block ${getStatusStyle(row.status)}`}>
                                                {row.status || 'Pending'}
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
                                                    title="Cancel Booking"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-gray-50 rounded-full">
                                                <Filter size={20} className="text-gray-300" />
                                            </div>
                                            <p>No bookings found for the selected filters.</p>
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

            {/* View Booking Drawer */}
            <RightDrawer
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Booking Details"
                subtitle="Class and session information"
                width="500px"
            >
                {selectedBooking && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="h-20 w-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl mb-3 shadow-lg ring-4 ring-indigo-50 ring-offset-4">
                                {(selectedBooking.memberName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">{selectedBooking.memberName || 'Unknown Member'}</h4>
                            <span className="text-[10px] font-black px-3 py-1 rounded-full mt-2 uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                                {selectedBooking.classType || 'Booking'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <User size={12} /> Trainer
                                </p>
                                <p className="text-sm font-bold text-gray-900 truncate">{selectedBooking.trainerName || 'Unassigned'}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Clock size={12} /> Time Slot
                                </p>
                                <p className="text-lg font-black text-slate-800">{selectedBooking.time || '-'}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Activity size={12} /> Status
                                </p>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusStyle(selectedBooking.status)}`}>
                                    {selectedBooking.status || 'Pending'}
                                </span>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <MapPin size={12} /> Booking ID
                                </p>
                                <p className="text-sm font-bold text-indigo-600">#{selectedBooking.id}</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex gap-3 text-sm text-indigo-900">
                            <div className="p-1 bg-white rounded-lg h-fit border border-indigo-200">
                                <Calendar size={14} className="text-indigo-600" />
                            </div>
                            <p>Scheduled for <span className="font-bold">{selectedBooking.date || 'N/A'}</span> at <span className="font-bold">{selectedBooking.time || 'N/A'}</span>.</p>
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

export default BookingReport;
