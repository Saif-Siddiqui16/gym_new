import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, MoreVertical, Search, Filter, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomDropdown from '../../components/common/CustomDropdown';
import MobileCard from '../../components/common/MobileCard';
import { getBookings, getBookingStats, updateBookingStatus } from '../../api/manager/managerApi';
import '../../styles/GlobalDesign.css';

const TodaysBookings = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 5;

    useEffect(() => {
        loadData();
    }, [searchTerm, filterStatus, currentPage]);

    const loadData = async () => {
        setLoading(true);
        const filters = {
            search: searchTerm,
            status: filterStatus === 'All' ? '' : filterStatus
        };
        const [bookingData, statData] = await Promise.all([
            getBookings({ filters, page: currentPage, limit: itemsPerPage }),
            getBookingStats()
        ]);

        setBookings(bookingData?.data || []);
        setTotalItems(bookingData?.total || 0);

        if (statData) {
            setStats([
                { title: "Today's Total", value: (statData.total || 0).toString(), icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
                { title: "Upcoming", value: (statData.upcoming || 0).toString(), icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
                { title: "Completed", value: (statData.completed || 0).toString(), icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
                { title: "Cancelled", value: (statData.cancelled || 0).toString(), icon: XCircle, color: "text-red-600", bg: "bg-red-50" }
            ]);
        }

        setLoading(false);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        await updateBookingStatus(id, newStatus);
        loadData();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Upcoming':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:scale-110 hover:shadow-lg hover:bg-blue-200 transition-all duration-300 cursor-pointer">Upcoming</span>;
            case 'Completed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 hover:scale-110 hover:shadow-lg hover:bg-green-200 transition-all duration-300 cursor-pointer">Completed</span>;
            case 'Cancelled':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 hover:scale-110 hover:shadow-lg hover:bg-red-200 transition-all duration-300 cursor-pointer">Cancelled</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer">Unknown</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            {/* Premium Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                Today's Bookings
                            </h1>
                            <p className="text-slate-600 text-sm mt-1">Real-time overview of today's classes and appointments</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 hover:shadow-2xl hover:border-violet-200 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 group cursor-pointer">
                        <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-md`}>
                            <stat.icon size={24} className={`${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors duration-300">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 group-hover:scale-110 inline-block transition-transform duration-300">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-300">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center hover:bg-violet-50/20 transition-colors duration-300">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-violet-500 group-hover:scale-110 transition-all duration-300" size={18} />
                        <input
                            type="text"
                            placeholder="Search members..."
                            className="pl-10 h-10 w-full rounded-lg border-2 border-slate-200 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 hover:shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="hover:scale-105 transition-transform duration-300 flex-1 md:flex-none">
                            <CustomDropdown
                                options={['All', 'Upcoming', 'Completed', 'Cancelled']}
                                value={filterStatus}
                                onChange={setFilterStatus}
                                placeholder="All Status"
                                icon={Filter}
                                className="w-full md:w-40"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`saas-btn p-2 border rounded-lg hover:bg-gray-50 transition-all hover:scale-110 hover:shadow-md ${showFilters ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'saas-btn-secondary'}`}
                        >
                            <Filter size={18} className={`${showFilters ? 'text-indigo-600 rotate-12' : 'text-gray-500'} transition-transform duration-300`} />
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap gap-4 animate-slide-down">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest w-full">Advanced Filters</p>
                        <div className="text-sm text-gray-500 italic">More filters coming soon...</div>
                    </div>
                )}
            </div>

            {/* Mobile Cards (md:hidden) */}
            <div className="grid grid-cols-1 gap-4 md:hidden mt-6">
                {loading ? (
                    <div className="py-12 text-center bg-white rounded-2xl border border-slate-100 shadow-xl">
                        <div className="flex flex-col items-center gap-3 text-violet-600">
                            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-black uppercase tracking-widest">Loading...</span>
                        </div>
                    </div>
                ) : bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <MobileCard
                            key={booking.id}
                            title={booking.member}
                            subtitle={booking.type}
                            badge={booking.status}
                            badgeColor={booking.status === 'Completed' ? 'emerald' : booking.status === 'Cancelled' ? 'rose' : 'blue'}
                            fields={[
                                { label: 'Trainer', value: booking.trainer },
                                { label: 'Time Slot', value: booking.slot, icon: Clock }
                            ]}
                            actions={booking.status === 'Upcoming' ? [
                                { label: 'Complete', icon: CheckCircle, variant: 'primary', onClick: () => handleUpdateStatus(booking.id, 'Completed') },
                                { label: 'Cancel', icon: XCircle, variant: 'secondary', onClick: () => handleUpdateStatus(booking.id, 'Cancelled') }
                            ] : booking.status !== 'Cancelled' ? [
                                { label: 'Cancel', icon: XCircle, variant: 'secondary', onClick: () => handleUpdateStatus(booking.id, 'Cancelled') }
                            ] : []}
                        />
                    ))
                ) : (
                    <div className="py-12 text-center bg-white rounded-2xl border border-slate-100 shadow-xl">
                        <p className="text-slate-500 font-bold">No bookings found for today</p>
                    </div>
                )}
            </div>

            <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-300 mt-8">
                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-b-2 border-violet-200">
                            <tr>
                                <th className="hover:text-purple-700 transition-colors duration-300 cursor-pointer">Member Name</th>
                                <th className="hover:text-purple-700 transition-colors duration-300 cursor-pointer">Booking Type</th>
                                <th className="hover:text-purple-700 transition-colors duration-300 cursor-pointer">Trainer</th>
                                <th className="hover:text-purple-700 transition-colors duration-300 cursor-pointer">Time Slot</th>
                                <th className="hover:text-purple-700 transition-colors duration-300 cursor-pointer">Status</th>
                                <th className="text-right hover:text-purple-700 transition-colors duration-300 cursor-pointer">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 text-violet-600">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600"></div>
                                            <span>Loading bookings...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/30 transition-all duration-300 group cursor-pointer hover:shadow-md hover:scale-[1.002] transform">
                                        <td data-label="Member Name">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 flex items-center justify-center font-bold text-xs group-hover:scale-125 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-500 border-2 border-violet-200">
                                                    {(booking.member || '?').charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 group-hover:text-violet-700 group-hover:translate-x-1 transition-all duration-300">{booking.member}</span>
                                            </div>
                                        </td>
                                        <td data-label="Booking Type">
                                            <span className="text-sm text-gray-700 font-medium group-hover:text-violet-700 group-hover:scale-105 inline-block transition-all duration-300">{booking.type}</span>
                                        </td>
                                        <td data-label="Trainer">
                                            <span className="text-sm text-gray-500 group-hover:text-violet-600 transition-colors duration-300">{booking.trainer}</span>
                                        </td>
                                        <td data-label="Time Slot">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-indigo-600 transition-colors duration-300">
                                                <Clock size={14} className="text-gray-400 group-hover:text-indigo-500 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                                                {booking.slot}
                                            </div>
                                        </td>
                                        <td data-label="Status">
                                            <div className="group-hover:scale-110 transition-transform duration-300 inline-block">
                                                {getStatusBadge(booking.status)}
                                            </div>
                                        </td>
                                        <td data-label="Actions" className="text-right">
                                            <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                {booking.status === 'Upcoming' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, 'Completed')}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all hover:scale-125 hover:rotate-12 duration-300"
                                                        title="Mark Completed"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                {booking.status !== 'Cancelled' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, 'Cancelled')}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all hover:scale-125 duration-300"
                                                        title="Cancel Booking"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        No bookings found for today.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalItems > 0 && (
                    <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-indigo-50/20 transition-colors duration-300">
                        <span className="text-sm text-gray-600 text-center sm:text-left">
                            Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-semibold text-gray-900">{totalItems}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95 hover:scale-110 hover:border-indigo-300 disabled:hover:scale-100 group"
                                aria-label="Previous Page"
                            >
                                <ChevronLeft size={20} className="stroke-[2.5] group-hover:-translate-x-0.5 transition-transform duration-300" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95 hover:scale-110 hover:border-indigo-300 disabled:hover:scale-100 group"
                                aria-label="Next Page"
                            >
                                <ChevronRight size={20} className="stroke-[2.5] group-hover:translate-x-0.5 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodaysBookings;
