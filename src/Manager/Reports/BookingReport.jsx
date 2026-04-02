import { exportPDF } from '../../api/manager/managerExport';
import apiClient from '../../api/apiClient';
import RightDrawer from '../../components/common/RightDrawer';
import { useBranchContext } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
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
import ConfirmationModal from '../../components/common/ConfirmationModal';

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
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

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
            const formattedBookings = rawData.map(b => {
                const dateObj = b.date ? new Date(b.date) : null;
                return {
                    id: b.id,
                    memberId: b.member?.memberId || `MEM-${b.memberId}`,
                    memberName: b.member?.name || 'Unknown',
                    memberPhone: b.member?.phone || '',
                    planName: b.member?.plan?.name || 'No Plan',
                    classType: b.class?.name || (b.classId ? `Class #${b.classId}` : 'Session'),
                    classCategory: b.class?.type || 'Workout',
                    location: b.class?.location || '',
                    duration: b.class?.duration || '',
                    trainerName: b.class?.trainer?.name || b.member?.trainer?.name || 'Unassigned',
                    date: dateObj ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
                    time: dateObj ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
                    status: b.status || 'Upcoming'
                };
            });

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

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await apiClient.delete(`/admin/bookings/${confirmModal.id}`);
            setConfirmModal({ isOpen: false, id: null, loading: false });
            loadData();
        } catch (error) {
            console.error('Delete Error:', error);
            toast.error('Failed to delete booking. Please try again.');
            setConfirmModal(prev => ({ ...prev, loading: false }));
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900">All Bookings</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Class & PT session bookings for all members</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FileText size={14} /> Export PDF
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 border rounded-xl transition-all ${showFilters ? 'bg-primary-light border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Filter size={16} />
                    </button>
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
                        <thead className="hidden sm:table-header-group bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">Booking ID</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">Member</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">Class / Type</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">Trainer</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">Date / Time</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">Status</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
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
                                    <tr key={row.id} className="flex flex-col sm:table-row hover:bg-slate-50 transition-colors group p-4 sm:p-0 border-b sm:border-0 border-slate-100">
                                        <td className="px-6 py-4" data-label="Booking ID">
                                            <span className="text-xs font-mono font-bold text-primary bg-primary/8 px-2 py-1 rounded-lg">#{row.id}</span>
                                        </td>
                                        <td className="px-6 py-4" data-label="Member">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                                                    {(row.memberName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 leading-tight">{row.memberName}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{row.memberId} · {row.planName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Class / Type">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{row.classType}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{row.classCategory}</span>
                                                    {row.location && <span className="text-[10px] text-slate-400">{row.location}</span>}
                                                    {row.duration && <span className="text-[10px] text-slate-400">· {row.duration}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Trainer">
                                            <span className="text-sm font-medium text-slate-700">{row.trainerName}</span>
                                        </td>
                                        <td className="px-6 py-4" data-label="Date / Time">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{row.date}</p>
                                                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                                    <Clock size={10} />{row.time}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Status">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${getStatusStyle(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" data-label="Actions">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleViewDetails(row)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/8 rounded-lg transition-all" title="View">
                                                    <Eye size={15} />
                                                </button>
                                                <button onClick={() => handleDelete(row.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                    <Trash2 size={15} />
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
                    <div className="space-y-4 p-4">
                        {/* Member Info */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl shrink-0">
                                {(selectedBooking.memberName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-base font-black text-slate-900">{selectedBooking.memberName}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{selectedBooking.memberId}</p>
                                {selectedBooking.memberPhone && <p className="text-xs text-slate-400">{selectedBooking.memberPhone}</p>}
                                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">{selectedBooking.planName}</span>
                            </div>
                        </div>

                        {/* Booking Info */}
                        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Details</p>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {[
                                    { label: 'Booking ID', value: `#${selectedBooking.id}` },
                                    { label: 'Class / Session', value: selectedBooking.classType },
                                    { label: 'Type', value: selectedBooking.classCategory },
                                    { label: 'Location', value: selectedBooking.location || '—' },
                                    { label: 'Duration', value: selectedBooking.duration || '—' },
                                    { label: 'Trainer', value: selectedBooking.trainerName },
                                    { label: 'Date', value: selectedBooking.date },
                                    { label: 'Time', value: selectedBooking.time },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between items-center px-4 py-3">
                                        <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                                        <span className="text-xs font-bold text-slate-800">{item.value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center px-4 py-3">
                                    <span className="text-xs font-semibold text-slate-400">Status</span>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button onClick={() => setIsViewModalOpen(false)} variant="primary" className="w-full h-11 rounded-xl">
                            Close
                        </Button>
                    </div>
                )}
            </RightDrawer>
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Cancel Booking?"
                message="This booking will be permanently removed. The member will need to re-book."
                confirmText="Cancel Booking"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default BookingReport;
