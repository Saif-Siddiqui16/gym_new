import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, XCircle, Calendar, Download, Search, Filter, User, FileText } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import CustomDropdown from '../../components/common/CustomDropdown';
import { getBookingReport } from '../../api/staff/reportApi';

const BookingReport = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('Last 30 Days');

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const data = await getBookingReport();
                setBookings(data);
            } catch (error) {
                console.error("Failed to load booking report:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [dateFilter]); // You can pass dates to API if needed, handling client-side filtering below for now

    // Dynamic stats based on actual data
    const completedCount = bookings.filter(b => b.status === 'Completed').length;
    const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

    const bookingStats = [
        { label: 'Total Bookings', value: bookings.length.toString(), icon: ClipboardList, bg: 'bg-blue-50', color: 'text-blue-600' },
        { label: 'Completed', value: completedCount.toString(), icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
        { label: 'Cancelled', value: cancelledCount.toString(), icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
    ];

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans staffdashboard-reports">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Booking Report</h1>
                    <p className="text-sm text-gray-500 mt-1">Comprehensive overview of class and PT booking analytics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-10 px-4 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-all">
                        <Download size={16} className="text-blue-500" />
                        Export CSV
                    </button>
                    <button className="h-10 px-4 bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 shadow-md transition-all">
                        <FileText size={16} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {bookingStats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all duration-300">
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ overflow: 'visible', zIndex: 10, position: 'relative' }}>
                {/* Filters Section */}
                <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID or Member Name..."
                            className="saas-input pl-10 h-11 w-full rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative">
                            <CustomDropdown
                                options={['Last 30 Days', 'Today', 'This Week']}
                                value={dateFilter}
                                onChange={setDateFilter}
                                icon={Calendar}
                                className="w-full min-w-[160px]"
                            />
                        </div>
                        <CustomDropdown
                            options={[
                                { value: 'All', label: 'All Types' },
                                { value: 'Personal Training', label: 'Personal Training' },
                                { value: 'Yoga Class', label: 'Yoga Class' },
                                { value: 'Zumba Class', label: 'Zumba Class' }
                            ]}
                            value={typeFilter}
                            onChange={setTypeFilter}
                            className="w-full min-w-[160px]"
                        />
                        <CustomDropdown
                            options={[
                                { value: 'All', label: 'All Status' },
                                { value: 'Completed', label: 'Completed' },
                                { value: 'Upcoming', label: 'Upcoming' },
                                { value: 'Cancelled', label: 'Cancelled' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="w-full min-w-[160px]"
                        />
                    </div>
                </div>

                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Member</th>
                                <th>Type</th>
                                <th>Trainer</th>
                                <th>Time Slot</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading bookings...</td>
                                </tr>
                            ) : bookings
                                .filter(b => (typeFilter === 'All' || b.type === typeFilter) && (statusFilter === 'All' || b.status === statusFilter) && b.member.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 transition-all duration-200 group">
                                        <td data-label="Booking ID" className="text-xs font-bold text-blue-600">{b.id}</td>
                                        <td data-label="Member">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                    {(b.member || '?').charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-gray-800 tracking-tight">{b.member}</span>
                                            </div>
                                        </td>
                                        <td data-label="Type">
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                                                {b.type}
                                            </span>
                                        </td>
                                        <td data-label="Trainer">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                                <User size={14} className="text-gray-400" />
                                                {b.trainer}
                                            </div>
                                        </td>
                                        <td data-label="Time Slot">
                                            <span className="text-xs font-medium text-gray-500 italic">{b.time}</span>
                                        </td>
                                        <td data-label="Status" className="text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${b.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                b.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            }
                            {!loading && bookings.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No bookings found for the selected criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookingReport;
