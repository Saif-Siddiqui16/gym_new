import { exportPDF } from '../../api/manager/managerExport';
import apiClient from '../../api/apiClient';
import RightDrawer from '../../components/common/RightDrawer';
import { useBranchContext } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import {
    ClipboardList,
    ChevronDown,
    Check,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    Clock,
    Eye,
    Trash2,
    User,
    Calendar,
    Tag,
    FileText,
    Activity,
    MapPin
} from 'lucide-react';
import Button from '../../components/ui/Button';

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
                className={`w-full h-11 px-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${isOpen ? 'border-primary ring-2 ring-violet-100 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    {Icon && <Icon size={16} className="text-gray-400" />}
                    <span className="font-medium truncate">{value === 'All' ? placeholder : value}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <div className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="py-1">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => { onChange(option); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${value === option ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
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
    const { user } = useAuth();
    const { selectedBranch } = useBranchContext();
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
    const itemsPerPage = 10;

    const [allFilteredBookings, setAllFilteredBookings] = useState([]);

    useEffect(() => {
        loadData();
    }, [dateRange, statusFilter, searchTerm, selectedBranch]);

    const loadData = async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch === 'all' ? '' : selectedBranch;

            let startDate = '', endDate = '';
            const today = new Date();

            // Helper to get local YYYY-MM-DD
            const toLocalISO = (date) => {
                return date.toLocaleDateString('en-CA'); // en-CA returns YYYY-MM-DD
            };

            if (dateRange === 'Today') {
                startDate = toLocalISO(today);
                endDate = startDate;
            } else if (dateRange === 'This Week') {
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                const startOfWeek = new Date(new Date().setDate(diff));
                startDate = toLocalISO(startOfWeek);
                endDate = ''; // Include all upcoming
            } else if (dateRange === 'This Month') {
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate = toLocalISO(startOfMonth);
                endDate = ''; // Include all upcoming
            }

            const params = {
                search: searchTerm,
                status: statusFilter === 'All Status' || statusFilter === 'All' ? '' : statusFilter,
                branchId,
                startDate,
                endDate
            };

            console.log('[BookingReport] Fetching with params:', params);

            const [bookingsRes, statsRes] = await Promise.all([
                apiClient.get('/admin/bookings', { params }),
                apiClient.get('/admin/bookings/stats', { params })
            ]).catch(err => {
                console.error('[BookingReport] API Promise Error:', err);
                throw err;
            });

            const rawData = bookingsRes?.data?.data || [];

            // Format for table
            const formattedBookings = rawData.map(b => ({
                id: b.id,
                memberName: b.member?.name || 'Unknown',
                classType: b.class?.name || (b.classId ? `Class #${b.classId}` : 'Session'),
                trainerName: b.class?.trainer?.name || b.member?.trainer?.name || 'Unassigned',
                date: b.date ? new Date(b.date).toLocaleDateString() : 'N/A',
                time: b.time || 'N/A',
                status: b.status || 'Pending'
            }));

            setAllFilteredBookings(formattedBookings);
            setTotalItems(formattedBookings.length);
            setCurrentPage(1);

            // Set initially shown bookings
            setBookings(formattedBookings.slice(0, itemsPerPage));

            if (statsRes?.data) {
                setBookingStats({
                    total: statsRes.data.total || 0,
                    completed: statsRes.data.completed || 0,
                    cancelled: statsRes.data.cancelled || 0
                });
            }
        } catch (error) {
            console.error('Booking Load Error:', error);
            setAllFilteredBookings([]);
            setBookings([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    // Update 'bookings' whenever page changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        setBookings(allFilteredBookings.slice(startIndex, startIndex + itemsPerPage));
    }, [currentPage, allFilteredBookings]);

    // Calculate current page bookings

    const handleExport = () => {
        exportPDF(allFilteredBookings, 'Booking_Report');
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
        { label: 'Total Bookings', value: bookingStats.total, icon: ClipboardList, bg: 'bg-primary-light', color: 'text-primary', border: 'border-violet-100' },
        { label: 'Completed', value: bookingStats.completed, icon: ClipboardList, bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-100' },
        { label: 'Cancelled', value: bookingStats.cancelled, icon: ClipboardList, bg: 'bg-red-50', color: 'text-red-600', border: 'border-red-100' },
    ];

    return (
        <div className="min-h-screen ">
            {/* Premium Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex flex-shrink-0 items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <ClipboardList size={24} className="md:w-7 md:h-7" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">
                                    Booking Report
                                </h1>
                                <p className="text-slate-600 text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium">Analyze class and PT booking performance</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            <button
                                onClick={handleExport}
                                className="flex-1 md:flex-none bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all rounded-xl px-4 py-2 md:py-2.5 text-xs md:text-sm font-semibold"
                            >
                                <FileText size={14} className="text-gray-500 md:w-4 md:h-4" /> Export as PDF
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 md:p-2.5 border rounded-xl hover:bg-gray-50 transition-all ${showFilters ? 'bg-primary-light border-violet-200 ring-2 ring-violet-100 text-primary' : 'bg-white border-gray-200 text-gray-500'}`}
                            >
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`bg-white p-5 md:p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 hover:shadow-2xl hover:border-violet-200 transition-all duration-300 transform md:hover:-translate-y-1 md:hover:scale-105 group cursor-pointer`}>
                        <div className={`p-3 md:p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 md:group-hover:scale-125 md:group-hover:rotate-6 transition-all duration-500 shadow-md`}>
                            <stat.icon size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-2xl md:text-3xl font-black text-gray-900 leading-none">
                                {loading ? <span className="text-lg text-gray-300">...</span> : stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl hover:border-violet-200 transition-all duration-300" style={{ overflow: 'visible', zIndex: 10, position: 'relative' }}>

                {showFilters && (
                    <div className="p-6 border-b border-slate-100 hover:bg-primary-light/20 transition-colors duration-300">
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
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by member or class..."
                                    className="pl-11 h-11 w-full rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-primary/20 focus:border-primary text-sm bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive w-full">
                        <thead className="hidden sm:table-header-group bg-gradient-to-r from-primary-light via-purple-50 to-fuchsia-50 border-b-2 border-violet-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-wider">Booking Type</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-wider">Trainer</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-wider">Date / Time</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 flex flex-col sm:table-row-group">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center flex items-center justify-center w-full">
                                        <div className="flex items-center justify-center gap-2 text-primary">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Generating report...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : bookings.length > 0 ? (
                                bookings.map((row) => (
                                    <tr key={row.id} className="flex flex-col sm:table-row hover:bg-gradient-to-r hover:from-primary-light/50 hover:to-purple-50/30 transition-colors duration-200 group p-4 sm:p-0 border-b sm:border-0 border-slate-100">
                                        <td className="px-2 py-2 sm:px-6 sm:py-4 flex justify-between items-center sm:table-cell" data-label="Booking ID">
                                            <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID</span>
                                            <span className="text-xs font-mono text-primary font-bold bg-primary-light px-2 py-1 rounded-md">#{row.id}</span>
                                        </td>
                                        <td className="px-2 py-2 sm:px-6 sm:py-4 flex justify-between items-center sm:table-cell" data-label="Member">
                                            <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</span>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-violet-100 text-primary flex items-center justify-center font-bold text-xs">
                                                    {(row.memberName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-sm font-bold text-gray-800">{row.memberName || 'Unknown'}</p>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 sm:px-6 sm:py-4 flex justify-between items-center sm:table-cell" data-label="Booking Type">
                                            <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                                            <span className="text-sm font-medium text-gray-700">{row.classType || 'N/A'}</span>
                                        </td>
                                        <td className="px-2 py-2 sm:px-6 sm:py-4 flex justify-between items-center sm:table-cell" data-label="Trainer">
                                            <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Trainer</span>
                                            <span className="text-sm text-gray-600 font-medium">{row.trainerName || 'Unassigned'}</span>
                                        </td>
                                        <td className="px-2 py-2 sm:px-6 sm:py-4 flex justify-between items-center sm:table-cell" data-label="Date / Time">
                                            <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Time</span>
                                            <div className="text-right sm:text-left text-sm text-gray-700">
                                                <div className="font-semibold">{row.date || '-'}</div>
                                                <div className="flex items-center justify-end sm:justify-start gap-1 text-xs text-gray-400 mt-0.5">
                                                    <Clock size={11} />
                                                    {row.time || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 sm:px-6 sm:py-4 flex justify-between items-center sm:table-cell" data-label="Status">
                                            <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transform transition-transform md:hover:scale-105 inline-block ${getStatusStyle(row.status)}`}>
                                                {row.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2 sm:px-6 sm:py-4 flex justify-between items-center sm:table-cell sm:text-right" data-label="Actions">
                                            <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</span>
                                            <div className="flex items-center justify-end gap-1 transition-all duration-200">
                                                <button
                                                    onClick={() => handleViewDetails(row)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all md:hover:scale-110 duration-300"
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
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm w-full">
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
                    <div className="px-4 md:px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center">
                        <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                            Showing <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-gray-900">{totalItems}</span> entries
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all md:hover:-translate-y-0.5 active:scale-95"
                                aria-label="Previous Page"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all md:hover:-translate-y-0.5 active:scale-95"
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
                        <div className="flex flex-col items-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mx-2">
                            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-violet-100 text-primary-hover flex items-center justify-center font-black text-xl md:text-2xl mb-3 shadow-lg ring-4 ring-primary-light ring-offset-4">
                                {(selectedBooking.memberName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <h4 className="text-lg md:text-xl font-bold text-gray-900">{selectedBooking.memberName || 'Unknown Member'}</h4>
                            <span className="text-[10px] font-black px-3 py-1 rounded-full mt-2 uppercase tracking-widest bg-primary-light text-primary border border-violet-100">
                                {selectedBooking.classType || 'Booking'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
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
                                <p className="text-base md:text-lg font-black text-slate-800">{selectedBooking.time || '-'}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Activity size={12} /> Status
                                </p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${getStatusStyle(selectedBooking.status)}`}>
                                    {selectedBooking.status || 'Pending'}
                                </span>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <MapPin size={12} /> Booking ID
                                </p>
                                <p className="text-sm font-bold text-primary">#{selectedBooking.id}</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-primary-light/50 rounded-xl border border-violet-100 flex gap-3 text-sm text-violet-900 mx-2">
                            <div className="p-1.5 bg-white rounded-lg h-fit border border-violet-200">
                                <Calendar size={14} className="text-primary" />
                            </div>
                            <p className="text-xs md:text-sm">Scheduled for <span className="font-bold">{selectedBooking.date || 'N/A'}</span> at <span className="font-bold">{selectedBooking.time || 'N/A'}</span>.</p>
                        </div>

                        <div className="px-2 pb-6">
                            <Button
                                onClick={() => setIsViewModalOpen(false)}
                                variant="primary"
                                className="w-full h-12 rounded-xl shadow-xl shadow-violet-200"
                            >
                                Close Details
                            </Button>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default BookingReport;
