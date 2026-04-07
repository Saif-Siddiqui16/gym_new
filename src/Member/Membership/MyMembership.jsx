import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Star,
    Calendar,
    CheckCircle2,
    Shield,
    Package,
    Clock,
    Crown,
    Info,
    ClipboardList,
    Loader,
    Users,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    X,
    CalendarDays,
    Droplets
} from 'lucide-react';
import { ROLES } from '../../config/roles';
import Card from '../../components/ui/Card';
import apiClient from '../../api/apiClient';
import amenityApi from '../../api/amenityApi';
import toast from 'react-hot-toast';

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
};

const MyMembership = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isRequestsPage = location.pathname.includes('requests');

    // Membership state
    const [membershipInfo, setMembershipInfo] = useState(null);
    const [loadingMembership, setLoadingMembership] = useState(true);

    // Slot booking state
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableData, setAvailableData] = useState(null);
    const [myBookings, setMyBookings] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    useEffect(() => { fetchMembershipInfo(); }, []);
    useEffect(() => { fetchAvailableSlots(); }, [selectedDate]);
    useEffect(() => { fetchMyBookings(); }, []);

    const fetchMembershipInfo = async () => {
        try {
            setLoadingMembership(true);
            const res = await apiClient.get('/member/membership-details');
            setMembershipInfo(res.data);
        } catch (err) {
            console.error("Failed to fetch membership info", err);
        } finally {
            setLoadingMembership(false);
        }
    };

    const fetchAvailableSlots = async () => {
        try {
            setLoadingSlots(true);
            const dateStr = selectedDate.toISOString().split('T')[0];
            const data = await amenityApi.getAvailableSlots(dateStr);
            setAvailableData(data);
        } catch (err) {
            console.error('Failed to fetch slots:', err);
        } finally {
            setLoadingSlots(false);
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

    // Parse benefits for display
    const parseBenefits = () => {
        if (!membershipInfo?.benefits) return [];
        try {
            const parsed = typeof membershipInfo.benefits === 'string' ? JSON.parse(membershipInfo.benefits) : membershipInfo.benefits;
            if (Array.isArray(parsed)) {
                return parsed.map(b => {
                    if (typeof b === 'object' && b.id) {
                        const amenity = amenities.find(a => a.id === parseInt(b.id));
                        return { name: amenity?.name || `Amenity #${b.id}`, limit: b.limit || '∞' };
                    }
                    if (typeof b === 'string') return { name: b, limit: null };
                    return { name: b.name || b.NAME || 'Benefit', limit: b.limit || b.LIMIT || null };
                });
            }
            return [];
        } catch (e) {
            if (typeof membershipInfo.benefits === 'string') {
                return membershipInfo.benefits.split(',').map(b => ({ name: b.trim(), limit: null }));
            }
            return [];
        }
    };

    if (isRequestsPage) {
        return (
            <div className="saas-container space-y-8 fade-in">
                <div className="flex items-center gap-5 pb-8 border-b-2 border-slate-100">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-violet-100">
                        <ClipboardList size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">My Requests</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Track and manage your service requests</p>
                    </div>
                </div>
            </div>
        );
    }

    const benefitList = parseBenefits();

    return (
        <div className="saas-container pb-32 space-y-6 animate-in fade-in duration-500">

            {/* ── Header ── */}
            <div className="pt-6 pb-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">My Benefits</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                    Track your membership benefits & book amenity slots
                </p>
            </div>

            {/* ── Plan Summary ── */}
            {loadingMembership ? (
                <div className="bg-white rounded-[20px] border border-slate-100 p-8 flex justify-center">
                    <Loader className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : membershipInfo && (
                <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 text-slate-50">
                        <Star size={80} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Crown size={14} className="text-amber-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Plan</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">{membershipInfo.currentPlan || 'N/A'}</h3>
                            <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-1">
                                <Calendar size={10} /> Valid until {membershipInfo.expiryDate || 'N/A'}
                            </p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            membershipInfo.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                            {membershipInfo.status || 'Active'}
                        </span>
                    </div>

                    {/* Benefits Tags */}
                    {benefitList.length > 0 && (
                        <div className="relative z-10 mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                            {benefitList.map((b, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle2 size={11} />
                                    {b.name} {b.limit && `(${b.limit})`}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Book Benefit Slots Section ── */}
            <div className="space-y-1 pt-2 px-1">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" /> Book Benefit Slots
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                    Select a date and book sauna, steam, spa slots
                </p>
            </div>

            {/* ── Date Picker ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="relative flex-1">
                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => {
                                if (e.target.value) setSelectedDate(new Date(e.target.value + 'T00:00:00'));
                            }}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                        />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                        {[0, 1, 2].map(i => {
                            const d = new Date();
                            d.setDate(d.getDate() + i);
                            const active = d.toDateString() === selectedDate.toDateString();
                            const labels = ['Today', 'Tomorrow', dayNames[d.getDay()]];
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(d)}
                                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                        active
                                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                                    }`}
                                >
                                    {labels[i]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Available Sessions ── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Sessions</h2>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        {loadingSlots ? '...' : `${totalSlots} Slots Found`}
                    </span>
                </div>

                {loadingSlots ? (
                    <div className="flex justify-center items-center py-16 bg-white rounded-[20px] border border-slate-100">
                        <Loader className="w-7 h-7 animate-spin text-primary" />
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


            {/* ── My Bookings ── */}
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
        </div>
    );
};

export default MyMembership;
