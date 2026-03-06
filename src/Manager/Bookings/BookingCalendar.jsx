import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Plus, X, MapPin, Filter, Settings2 } from 'lucide-react';
import CustomDropdown from '../../components/common/CustomDropdown';
import { getBookingsByDateRange, createBooking, getMembers, getClasses } from '../../api/manager/managerApi';
import toast from 'react-hot-toast';
import RightDrawer from '../../components/common/RightDrawer';
import BookingSettingsDrawer from './BookingSettingsDrawer';
import AddBookingDrawer from './AddBookingDrawer';
import '../../styles/GlobalDesign.css';

const BookingCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterType, setFilterType] = useState('All');
    const [bookings, setBookings] = useState({});
    const [loading, setLoading] = useState(true);
    const [calendarView, setCalendarView] = useState('Month');
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        loadData();
    }, [currentDate, filterType, calendarView]);

    const loadData = async () => {
        try {
            await Promise.all([
                loadBookings(),
                loadMembers(),
                loadClasses()
            ]);
        } catch (error) {
            console.error("Error loading calendar data:", error);
        }
    };

    const loadBookings = async () => {
        setLoading(true);
        let firstDay, lastDay;

        if (calendarView === 'Month') {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            firstDay = new Date(year, month, 1).toISOString();
            lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
        } else if (calendarView === 'Week') {
            const start = new Date(currentDate);
            start.setDate(currentDate.getDate() - currentDate.getDay());
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            firstDay = start.toISOString();
            lastDay = end.toISOString();
        } else {
            const start = new Date(currentDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(currentDate);
            end.setHours(23, 59, 59, 999);
            firstDay = start.toISOString();
            lastDay = end.toISOString();
        }

        const data = await getBookingsByDateRange(firstDay, lastDay);

        // Group by day for the calendar
        const grouped = (data || []).reduce((acc, booking) => {
            const day = new Date(booking.date).getDate();
            if (!acc[day]) acc[day] = [];
            acc[day].push({
                ...booking,
                member: booking.member?.name || 'Unknown Member',
                type: booking.class ? 'Group Class' : 'Personal Training',
                slot: '10:00 AM', // Need to handle slot from class/booking
                color: booking.class ? 'blue' : 'green'
            });
            return acc;
        }, {});

        setBookings(grouped);
        setLoading(false);
    };

    const loadMembers = async () => {
        const result = await getMembers({ limit: 100 });
        setMembers(result?.data || []);
    };

    const loadClasses = async () => {
        const result = await getClasses();
        setClasses(result || []);
    };

    const handleCreateBooking = async (newBooking) => {
        try {
            await createBooking(newBooking);
            toast.success('Booking created successfully');
            setIsAddDrawerOpen(false);
            loadBookings();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to create booking');
        }
    };

    const handlePrev = () => {
        if (calendarView === 'Month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else if (calendarView === 'Week') {
            setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
        } else {
            setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
        }
    };

    const handleNext = () => {
        if (calendarView === 'Month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else if (calendarView === 'Week') {
            setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
        } else {
            setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Calendar Grid Logic
    const getCalendarDays = () => {
        if (calendarView === 'Month') {
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
            const days = Array.from({ length: daysInMonth }, (_, i) => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                return { day: i + 1, date };
            });
            const paddingDays = Array.from({ length: startDay }, () => null);
            return [...paddingDays, ...days];
        } else if (calendarView === 'Week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            return Array.from({ length: 7 }, (_, i) => {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                return { day: date.getDate(), date };
            });
        } else {
            return [{ day: currentDate.getDate(), date: new Date(currentDate) }];
        }
    };

    const calendarGrid = getCalendarDays();

    const getHeaderLabel = () => {
        if (calendarView === 'Month') {
            return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        } else if (calendarView === 'Week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                return `${startOfWeek.toLocaleString('default', { month: 'long' })} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
            }
            return `${startOfWeek.toLocaleString('default', { month: 'short' })} ${startOfWeek.getDate()} - ${endOfWeek.toLocaleString('default', { month: 'short' })} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
        } else {
            return currentDate.toLocaleString('default', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    };

    const getDayContent = (dayObj) => {
        if (!dayObj) return null;

        const year = dayObj.date.getFullYear();
        const month = String(dayObj.date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(dayObj.date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayNum}`;

        // Find bookings for this specific date
        const dayBookings = [];
        Object.values(bookings).forEach(dayList => {
            dayList.forEach(b => {
                // b.date is from backend e.g. "2026-02-25T00:00:00.000Z"
                // Extracting just the YYYY-MM-DD part matches correctly
                if (b.date.split('T')[0] === dateStr) {
                    dayBookings.push(b);
                }
            });
        });

        return (
            <div className="flex flex-col gap-1.5 mt-2 overflow-y-auto max-h-[105px] no-scrollbar pr-0.5">
                {dayBookings
                    .filter(b => filterType === 'All' || b.type === filterType)
                    .map((b) => (
                        <div
                            key={b.id}
                            className={`flex flex-col p-2 rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer group/booking ${b.color === 'blue'
                                ? 'bg-blue-50/60 text-blue-700 border-blue-100/50 hover:bg-blue-100/80 hover:border-blue-200'
                                : 'bg-green-50/60 text-green-700 border-green-100/50 hover:bg-green-100/80 hover:border-green-200'
                                }`}
                            title={`${b.slot} - ${b.type} (${b.member})`}
                        >
                            <div className="flex items-center gap-1.5 mb-1 pointer-events-none">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                <span className="font-bold tracking-tight uppercase text-[8px] opacity-70 truncate">{b.slot}</span>
                            </div>
                            <div className="font-bold text-[10px] leading-tight truncate px-0.5 pointer-events-none text-gray-800">
                                {b.member}
                                <span className="block font-normal text-[9px] text-gray-500">{b.type}</span>
                            </div>
                        </div>
                    ))}
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans managerdashboard-bookingcalendar">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Booking Calendar</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage class schedules and personal training appointments.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <CustomDropdown
                        options={['All', 'Group Class', 'Personal Training']}
                        value={filterType}
                        onChange={setFilterType}
                        placeholder="All Types"
                        icon={Filter}
                        className="w-48"
                    />
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm"
                        title="Booking Settings"
                    >
                        <Settings2 size={20} />
                    </button>
                    <button
                        onClick={() => {
                            setIsAddDrawerOpen(true);
                        }}
                        className="saas-btn saas-btn-primary shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                    >
                        <Plus size={18} className="mr-1" /> New Booking
                    </button>
                </div>
            </div>

            {/* Calendar Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100/80 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50 px-0">
                {/* Calendar Navigation */}
                <div className="p-6 border-b border-gray-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{getHeaderLabel()}</h2>
                        <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100">
                            <button
                                onClick={handlePrev}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200 text-gray-600 hover:text-indigo-600 group active:scale-95"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                            <button
                                onClick={handleNext}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200 text-gray-600 hover:text-indigo-600 group active:scale-95"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <button
                            onClick={handleToday}
                            className="hidden sm:block px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        >
                            Today
                        </button>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 self-start sm:self-center">
                        <button
                            onClick={() => setCalendarView('Month')}
                            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${calendarView === 'Month' ? 'bg-white shadow-sm text-indigo-700 border border-gray-100 ring-1 ring-gray-950/5' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setCalendarView('Week')}
                            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${calendarView === 'Week' ? 'bg-white shadow-sm text-indigo-700 border border-gray-100 ring-1 ring-gray-950/5' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setCalendarView('Day')}
                            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${calendarView === 'Day' ? 'bg-white shadow-sm text-indigo-700 border border-gray-100 ring-1 ring-950/5' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Day
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="overflow-x-auto">
                    <div className={`min-w-[760px] p-6 grid ${calendarView === 'Day' ? 'grid-cols-1' : 'grid-cols-7'} gap-px bg-gray-100/50`}>
                        {calendarView !== 'Day' && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-slate-50/80 p-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                {day}
                            </div>
                        ))}
                        {calendarGrid.map((dayObj, idx) => (
                            <div
                                key={idx}
                                className={`bg-white min-h-[140px] p-4 transition-all duration-200 hover:bg-indigo-50/30 flex flex-col group/cell relative ${dayObj && dayObj.date.toDateString() === new Date().toDateString() ? 'bg-indigo-50/20' : ''
                                    }`}
                            >
                                {dayObj && dayObj.date.toDateString() === new Date().toDateString() && (
                                    <div className="absolute inset-x-0 top-0 h-[2px] bg-indigo-500 animate-pulse"></div>
                                )}
                                <span className={`text-sm font-bold flex items-center justify-center w-8 h-8 rounded-full mb-1 transition-all duration-300 ${dayObj && dayObj.date.toDateString() === new Date().toDateString()
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-110'
                                    : 'text-gray-700 group-hover/cell:text-indigo-600 group-hover/cell:scale-110'
                                    } ${!dayObj ? 'invisible' : ''}`}>
                                    {dayObj && dayObj.day}
                                </span>
                                {loading ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                                    </div>
                                ) : getDayContent(dayObj)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-6 items-center px-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-600 font-medium">Group Class</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600 font-medium">Personal Training</span>
                </div>
            </div>

            {/* Add Booking Drawer */}
            <RightDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                title="Create New Booking"
            >
                <AddBookingDrawer
                    isOpen={isAddDrawerOpen}
                    onClose={() => setIsAddDrawerOpen(false)}
                    onCreate={handleCreateBooking}
                    members={members}
                    classes={classes}
                />
            </RightDrawer>

            {/* Booking Settings Drawer */}
            <RightDrawer
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Global Booking Settings"
            >
                <BookingSettingsDrawer
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                />
            </RightDrawer>
        </div>
    );
};

export default BookingCalendar;
