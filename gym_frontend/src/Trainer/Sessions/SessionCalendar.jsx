import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Users,
    LayoutGrid,
    List,
    MoreHorizontal
} from 'lucide-react';
import { getSessionsByDateRange } from '../../api/trainer/trainerApi';

const SessionCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month');
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSessions();
    }, [currentDate, viewMode]);

    const loadSessions = async () => {
        setLoading(true);
        let start, end;

        if (viewMode === 'month') {
            start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        } else if (viewMode === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1)); // ISO Week starts on Monday
            startOfWeek.setHours(0, 0, 0, 0);
            start = startOfWeek;
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        } else {
            start = new Date(currentDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(currentDate);
            end.setHours(23, 59, 59, 999);
        }

        const data = await getSessionsByDateRange(start, end);
        setSessions(data);
        setLoading(false);
    };

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(currentDate.getMonth() - 1);
        } else if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() - 7);
        } else {
            newDate.setDate(currentDate.getDate() - 1);
        }
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(currentDate.getMonth() + 1);
        } else if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() + 7);
        } else {
            newDate.setDate(currentDate.getDate() + 1);
        }
        setCurrentDate(newDate);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const getHeaderLabel = () => {
        if (viewMode === 'month') {
            return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        } else if (viewMode === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1));
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

    const getCalendarDays = () => {
        if (viewMode === 'month') {
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            // Adjust start to be the Monday of the week containing first of month
            const startDay = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;
            const days = [];

            // Padding
            for (let i = startDay; i > 0; i--) {
                const date = new Date(startOfMonth);
                date.setDate(startOfMonth.getDate() - i);
                days.push({ day: date.getDate(), date, isOtherMonth: true });
            }

            // Current Month
            for (let i = 1; i <= endOfMonth.getDate(); i++) {
                days.push({ day: i, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), isOtherMonth: false });
            }

            // Fill up to 42 days (6 weeks)
            const remaining = 42 - days.length;
            for (let i = 1; i <= remaining; i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
                days.push({ day: i, date, isOtherMonth: true });
            }

            return days;
        } else if (viewMode === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1));
            return Array.from({ length: 7 }, (_, i) => {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                return { day: date.getDate(), date, isOtherMonth: false };
            });
        } else {
            return [{ day: currentDate.getDate(), date: new Date(currentDate), isOtherMonth: false }];
        }
    };

    const days = getCalendarDays();

    const filteredSessions = sessions.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSessionsForDay = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return filteredSessions.filter(s => {
            // Check if s.date exists and matches, otherwise fallback to s.day if it's the same month/year
            if (s.date) return s.date.split('T')[0] === dateStr;
            return s.day === date.getDate() && date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
        });
    };

    const getChipStyles = (color) => {
        switch (color) {
            case 'blue': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'purple': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'orange': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'red': return 'bg-red-50 text-red-700 border-red-100';
            case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Calendar Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Session Calendar</h1>
                        <p className="text-gray-500 text-sm mt-0.5">{getHeaderLabel()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 border border-gray-200 rounded-2xl shadow-sm">
                    <button
                        onClick={() => setViewMode('month')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Month
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setViewMode('day')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'day' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Day
                    </button>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePrev}
                            className="p-2 hover:bg-gray-50 rounded-xl border border-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-2 hover:bg-gray-50 rounded-xl border border-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <button
                        onClick={handleToday}
                        className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                        Today
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find session..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
                {viewMode !== 'day' && (
                    <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>
                )}

                <div className={`grid ${viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'} auto-rows-fr`}>
                    {days.map((dayObj, i) => {
                        const isToday = dayObj.date.toDateString() === new Date().toDateString();
                        const isOtherMonth = dayObj.isOtherMonth;
                        const daySessions = getSessionsForDay(dayObj.date);

                        return (
                            <div
                                key={i}
                                className={`min-h-[120px] md:min-h-[160px] p-2 border-r border-b border-gray-100 transition-all hover:bg-gray-50/50 group relative ${isOtherMonth ? 'bg-gray-50/20' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isToday
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : isOtherMonth ? 'text-gray-300' : 'text-gray-500'
                                        }`}>
                                        {dayObj.day}
                                    </span>
                                    {!isOtherMonth && (
                                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded-lg border border-gray-100 text-gray-400 transition-all">
                                            <Plus size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5 overflow-hidden">
                                    {daySessions.map(session => (
                                        <div
                                            key={session.id}
                                            className={`p-1.5 md:p-2 rounded-xl border text-[10px] md:text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-sm ${getChipStyles(session.color)}`}
                                        >
                                            <div className="flex items-center gap-1 opacity-70 mb-0.5">
                                                <Clock size={10} />
                                                {session.time}
                                            </div>
                                            <div className="truncate">{session.title}</div>
                                        </div>
                                    ))}
                                    {daySessions.length > 2 && (
                                        <div className="text-[10px] font-bold text-gray-400 px-1">
                                            + {daySessions.length - 2} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="lg:hidden flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <LayoutGrid size={16} className="text-blue-500" />
                <span className="text-xs font-bold text-blue-700">Tip: Tap a day to see full session details</span>
            </div>
        </div>
    );
};

export default SessionCalendar;
