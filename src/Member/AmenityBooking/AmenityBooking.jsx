/* Book Benefit Slots - v2 */
import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Users,
    CheckCircle2,
    X,
    Info,
    Loader,
    CalendarDays,
    Droplets,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import amenityApi from '../../api/amenityApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
};

const AmenityBooking = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableData, setAvailableData] = useState(null);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(null);
    const [cancelling, setCancelling] = useState(null);
    const [error, setError] = useState(null);

    // 7 days from today
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    useEffect(() => { fetchAvailableSlots(); }, [selectedDate]);
    useEffect(() => { fetchMyBookings(); }, []);

    const fetchAvailableSlots = async () => {
        try {
            setLoading(true);
            setError(null);
            const dateStr = selectedDate.toISOString().split('T')[0];
            const data = await amenityApi.getAvailableSlots(dateStr);
            setAvailableData(data);
        } catch (err) {
            console.error('Failed to fetch slots:', err);
            setError(typeof err === 'string' ? err : 'Failed to fetch available slots');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        try {
            setBookingsLoading(true);
            const data = await amenityApi.getMyBookings();
            setMyBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleBookSlot = async (amenityId, slotId) => {
        try {
            setSubmitting(slotId);
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await amenityApi.bookSlot({ amenityId, slotId, date: dateStr });
            if (res.requiresPayment) {
                toast.success(`Limit exceeded! Extra charge of ₹${res.amount} applies.`);
            } else {
                toast.success('Slot booked successfully!');
            }
            fetchAvailableSlots();
            fetchMyBookings();
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to book slot');
        } finally {
            setSubmitting(null);
        }
    };

    const handleBookWalkIn = async (amenityId) => {
        try {
            setSubmitting(`walkin-${amenityId}`);
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await amenityApi.bookSlot({ amenityId, date: dateStr });
            if (res.requiresPayment) {
                toast.success(`Limit exceeded! Extra charge of ₹${res.amount} applies.`);
            } else {
                toast.success('Booked successfully!');
            }
            fetchAvailableSlots();
            fetchMyBookings();
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to book');
        } finally {
            setSubmitting(null);
        }
    };

    const handleCancel = async (bookingId) => {
        try {
            setCancelling(bookingId);
            await amenityApi.cancelBooking(bookingId);
            toast.success('Booking cancelled');
            fetchAvailableSlots();
            fetchMyBookings();
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to cancel');
        } finally {
            setCancelling(null);
        }
    };

    const isSelected = (date) => date.toDateString() === selectedDate.toDateString();
    const isToday = (date) => date.toDateString() === new Date().toDateString();
    const totalSlots = availableData?.totalSlots || 0;
    const amenities = availableData?.amenities || [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const upcomingBookings = myBookings.filter(b => b.status === 'Booked' && new Date(b.date) >= now);
    const pastBookings = myBookings.filter(b => b.status !== 'Booked' || new Date(b.date) < now);

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    return (
        <div className="max-w-2xl mx-auto px-4 pb-32 space-y-5 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center justify-between pt-6 pb-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">Book Benefit Slots</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                        Book sauna, steam, spa and other amenity slots
                    </p>
                </div>
                <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                    <X size={18} className="text-slate-400" />
                </button>
            </div>

            {/* ── Date Picker ── */}
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-4 sm:p-5">
                {/* Month & Year */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                const prev = dates.findIndex(d => d.toDateString() === selectedDate.toDateString());
                                if (prev > 0) setSelectedDate(dates[prev - 1]);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-300 hover:text-slate-500"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => {
                                const next = dates.findIndex(d => d.toDateString() === selectedDate.toDateString());
                                if (next < dates.length - 1) setSelectedDate(dates[next + 1]);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-300 hover:text-slate-500"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Days Row */}
                <div className="grid grid-cols-7 gap-2">
                    {dates.map((date, idx) => {
                        const active = isSelected(date);
                        const today = isToday(date);
                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedDate(date)}
                                className={`relative flex flex-col items-center py-2.5 rounded-2xl transition-all duration-200 ${
                                    active
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.04]'
                                        : 'hover:bg-slate-50 text-slate-600'
                                }`}
                            >
                                <span className={`text-[9px] font-black tracking-widest ${active ? 'text-white/70' : 'text-slate-400'}`}>
                                    {dayNames[date.getDay()]}
                                </span>
                                <span className={`text-lg font-black leading-none mt-1 ${active ? 'text-white' : 'text-slate-800'}`}>
                                    {date.getDate()}
                                </span>
                                {today && !active && (
                                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Available Sessions ── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Sessions</h2>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        {loading ? '...' : `${totalSlots} Slots Found`}
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20 bg-white rounded-[20px] border border-slate-100">
                        <Loader className="w-7 h-7 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-[20px] border border-rose-100 p-10 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-300 mb-4">
                            <X size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-black text-slate-800 mb-1">Something Went Wrong</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{error}</p>
                        <button onClick={fetchAvailableSlots} className="text-xs font-black text-primary uppercase tracking-widest hover:underline">
                            Try Again
                        </button>
                    </div>
                ) : amenities.length === 0 ? (
                    <div className="bg-white rounded-[20px] border border-slate-100 py-14 px-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-5 border border-dashed border-slate-200">
                            <CalendarDays size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-black text-slate-800 tracking-tight mb-1.5">No Slots Available</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-relaxed max-w-[220px]">
                            No recovery sessions are scheduled for {dayNames[selectedDate.getDay()]} {selectedDate.getDate()}.
                        </p>
                        <button
                            onClick={() => {
                                const idx = dates.findIndex(d => d.toDateString() === selectedDate.toDateString());
                                if (idx < dates.length - 1) setSelectedDate(dates[idx + 1]);
                            }}
                            className="mt-5 text-xs font-black text-primary uppercase tracking-widest hover:underline underline-offset-4"
                        >
                            View Other Dates
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {amenities.map((amenity) => (
                            <div key={amenity.id} className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-sm">
                                {/* Amenity Header */}
                                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-violet-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                                            <Sparkles size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-800 leading-none">{amenity.name}</h3>
                                            {amenity.description && (
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">{amenity.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {amenity.monthlyLimit > 0 && (
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                                                amenity.limitExceeded ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {amenity.monthlyUsed}/{amenity.monthlyLimit}
                                            </span>
                                        )}
                                        {amenity.isWalkIn && (
                                            <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">Walk‑in</span>
                                        )}
                                    </div>
                                </div>

                                {/* Slots */}
                                <div className="p-3">
                                    {amenity.isWalkIn ? (
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70">
                                            <div>
                                                <p className="text-xs font-bold text-slate-600">Available all day</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">No specific time slot required</p>
                                            </div>
                                            {amenity.isBookedToday ? (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600"><CheckCircle2 size={13} /> Booked</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleBookWalkIn(amenity.id)}
                                                    disabled={submitting === `walkin-${amenity.id}`}
                                                    className="px-5 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
                                                >
                                                    {submitting === `walkin-${amenity.id}` ? '...' : 'Book'}
                                                </button>
                                            )}
                                        </div>
                                    ) : amenity.slots && amenity.slots.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {amenity.slots.map((slot) => (
                                                <div
                                                    key={slot.id}
                                                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all ${
                                                        slot.isMyBooking
                                                            ? 'bg-emerald-50/70 border border-emerald-200'
                                                            : slot.isFull
                                                            ? 'bg-slate-50/50 opacity-50'
                                                            : 'bg-slate-50/70 hover:bg-slate-100/60'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                            slot.isMyBooking ? 'bg-emerald-100 text-emerald-600' :
                                                            slot.isFull ? 'bg-slate-100 text-slate-300' :
                                                            'bg-primary/10 text-primary'
                                                        }`}>
                                                            <Clock size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 leading-none">
                                                                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                                                                <Users size={10} /> {slot.available}/{slot.capacity} spots left
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {slot.isMyBooking ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                                                            <CheckCircle2 size={13} /> Booked
                                                        </span>
                                                    ) : slot.isFull ? (
                                                        <span className="text-[10px] font-black text-slate-400">Full</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleBookSlot(amenity.id, slot.id)}
                                                            disabled={submitting === slot.id}
                                                            className="px-5 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
                                                        >
                                                            {submitting === slot.id ? '...' : 'Book'}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {amenity.limitExceeded && (
                                                <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest px-2 pt-1">
                                                    Plan limit reached — extra charge ₹{amenity.extraPrice} per session
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center">
                                            <p className="text-[10px] font-bold text-slate-400">No time slots configured</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Important Note ── */}
            <div className="bg-slate-900 rounded-[18px] p-5 flex items-start gap-4">
                <div className="w-9 h-9 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info size={16} className="text-amber-400" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.15em] mb-1">Important Note</p>
                    <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                        Some premium services like massages or private sessions must be booked at the front desk. Recovery benefits are subject to branch availability.
                    </p>
                </div>
            </div>

            {/* ── My Bookings ── */}
            {(upcomingBookings.length > 0 || pastBookings.length > 0 || !bookingsLoading) && (
                <div className="space-y-3 pt-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">My Bookings</h2>

                    {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : upcomingBookings.length === 0 && pastBookings.length === 0 ? (
                        <div className="bg-white rounded-[20px] border border-slate-100 p-8 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                No bookings yet — book a slot above to get started
                            </p>
                        </div>
                    ) : (
                        <>
                            {upcomingBookings.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">
                                        Upcoming ({upcomingBookings.length})
                                    </p>
                                    {upcomingBookings.map((booking) => (
                                        <div key={booking.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-violet-600 text-white rounded-xl flex items-center justify-center">
                                                    <Sparkles size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800 leading-none">{booking.amenity?.name || 'Amenity'}</h4>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                                            <Calendar size={10} />
                                                            {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </span>
                                                        {booking.slot && (
                                                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {formatTime(booking.slot.startTime)}–{formatTime(booking.slot.endTime)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCancel(booking.id)}
                                                disabled={cancelling === booking.id}
                                                className="px-3.5 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all disabled:opacity-50"
                                            >
                                                {cancelling === booking.id ? '...' : 'Cancel'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {pastBookings.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                        History ({pastBookings.length})
                                    </p>
                                    {pastBookings.slice(0, 5).map((booking) => (
                                        <div key={booking.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between opacity-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 text-slate-300 rounded-xl flex items-center justify-center">
                                                    <Droplets size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-500 leading-none">{booking.amenity?.name || 'Amenity'}</h4>
                                                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-1">
                                                        <Calendar size={10} />
                                                        {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                                                booking.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                booking.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' :
                                                'bg-slate-50 text-slate-400'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AmenityBooking;
