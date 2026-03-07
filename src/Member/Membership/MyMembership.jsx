import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Star,
    Calendar,
    CheckCircle2,
    Shield,
    Package,
    ArrowRight,
    Clock,
    Search,
    Crown,
    Activity,
    Plus,
    Layout,
    CalendarDays,
    Info,
    ClipboardList,
    Loader2
} from 'lucide-react';
import { ROLES } from '../../config/roles';
import Card from '../../components/ui/Card';
import RightDrawer from '../../components/common/RightDrawer';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import '../../styles/GlobalDesign.css';

const MyMembership = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isRequestsPage = location.pathname.includes('requests');
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    // Dynamic Date Generation
    const [calendarDates, setCalendarDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [membershipInfo, setMembershipInfo] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Generate next 7 days
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            dates.push({
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: d.getDate().toString(),
                full: d.toISOString().split('T')[0],
                id: `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.getDate()}`
            });
        }
        setCalendarDates(dates);
        setSelectedDate(dates[0]);
        fetchMembershipInfo();
    }, []);

    const fetchMembershipInfo = async () => {
        try {
            const res = await apiClient.get('/member/membership-details');
            setMembershipInfo(res.data);
        } catch (err) {
            console.error("Failed to fetch membership info", err);
        }
    };

    const fetchSlots = async () => {
        if (!selectedDate || !isBookingOpen) return;
        setLoadingSlots(true);
        try {
            const res = await apiClient.get('/member/classes');
            // Filter for recovery slots based on common keywords
            const recoverySlots = (res.data || []).filter(cls => {
                const name = cls.name.toLowerCase();
                return name.includes('sauna') || name.includes('steam') || name.includes('spa') || name.includes('recovery') || name.includes('ice bath');
            });
            setAvailableSlots(recoverySlots);
        } catch (err) {
            toast.error("Failed to load slots");
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [selectedDate, isBookingOpen]);

    const handleBookSlot = async (slotId) => {
        setIsSubmitting(true);
        try {
            await apiClient.post('/member/bookings', {
                classId: slotId,
                date: selectedDate.full
            });
            toast.success("Benefit slot booked successfully!");
            setIsBookingOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Booking failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="saas-container h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8 space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b-2 border-slate-100">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-100 animate-in zoom-in duration-500">
                        {isRequestsPage ? <ClipboardList size={32} strokeWidth={2.5} /> : <Star size={32} strokeWidth={2.5} />}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
                            {isRequestsPage ? 'My Requests' : 'My Benefits'}
                        </h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                            {isRequestsPage ? 'Track and manage your service requests' : 'Track and manage your membership benefits'}
                        </p>
                    </div>
                </div>
                {!isRequestsPage && (
                    <button
                        onClick={() => setIsBookingOpen(true)}
                        className="px-8 h-12 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-100 hover:bg-violet-700 hover:-translate-y-1 transition-all flex items-center gap-2 group"
                    >
                        <Calendar size={16} strokeWidth={3} /> Book a Slot
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-4xl">
                {/* Plan Summary Section */}
                {!isRequestsPage && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                                <Crown size={16} />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Plan Summary</h2>
                        </div>
                        <Card className="p-10 border-2 border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden relative border-l-8 border-l-violet-600">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{membershipInfo?.currentPlan || 'Premium Gold Plan'}</h3>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                                            <Calendar size={12} /> Valid until {membershipInfo?.expiryDate || '30 Mar 2026'}
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 ${membershipInfo?.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} rounded-xl font-black text-[10px] uppercase tracking-widest border`}>
                                    {membershipInfo?.status || 'Active'}
                                </div>
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 p-8 text-black/[0.02]">
                                <Star size={120} strokeWidth={1} />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Benefits List Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                            <Shield size={16} />
                        </div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Benefits</h2>
                    </div>

                    {membershipInfo?.benefits ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                                let benefitList = [];
                                try {
                                    // Handle JSON list [{NAME, LIMIT}, ...] or JSON string
                                    const parsed = JSON.parse(membershipInfo.benefits);
                                    if (Array.isArray(parsed)) {
                                        benefitList = parsed.map(b => typeof b === 'object' ? `${b.NAME || b.name}${b.LIMIT ? ` (${b.LIMIT})` : ''}` : b);
                                    } else {
                                        benefitList = [parsed.NAME || parsed.name || membershipInfo.benefits];
                                    }
                                } catch (e) {
                                    // Fallback to split by comma/newline
                                    benefitList = membershipInfo.benefits.split(/[,\n]/).filter(b => b.trim() && !b.includes('{') && !b.includes('}'));

                                    // If split failed due to JSON brackets being part of a single string
                                    if (benefitList.length === 0 && membershipInfo.benefits) {
                                        benefitList = [membershipInfo.benefits];
                                    }
                                }

                                return benefitList.map((benefit, idx) => (
                                    <div key={idx} className="p-6 bg-white border-2 border-slate-100 rounded-3xl flex items-center gap-4 group hover:border-violet-100 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{benefit.trim()}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    ) : (
                        <Card className="p-10 border-2 border-slate-100 shadow-sm rounded-3xl bg-white">
                            <div className="flex flex-col items-center justify-center text-center space-y-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-100">
                                    <Shield size={40} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                        No Active Benefits
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-sm">
                                        Your current plan may not have any active self-service benefits. Check with the reception or browse our available add-ons!
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/store/dashboard')}
                                    className="px-10 h-14 border-2 border-violet-600 text-violet-600 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-100/20 hover:bg-violet-50 transition-all flex items-center gap-3"
                                >
                                    <Package size={16} /> Browse Add-on Packages
                                </button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Book Benefit Slots Drawer */}
            <RightDrawer
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                title="Book Benefit Slots"
                subtitle="Book sauna, steam, spa and other amenity slots"
                maxWidth="max-w-2xl"
            >
                <div className="p-8 space-y-8">
                    {/* Horizontal Date Picker */}
                    <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {calendarDates.map((item) => {
                            const isActive = selectedDate?.id === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedDate(item)}
                                    className={`flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-2xl border-2 transition-all duration-300 shrink-0 ${isActive
                                        ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-100 scale-105'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-violet-100'
                                        }`}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-violet-100' : 'text-slate-400'}`}>
                                        {item.day}
                                    </span>
                                    <span className="text-2xl font-black mt-1">
                                        {item.date}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Sessions</h3>
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold uppercase">{availableSlots.length} Slots Found</span>
                        </div>

                        {loadingSlots ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finding available slots...</p>
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {availableSlots.map((slot) => (
                                    <div key={slot.id} className="group relative bg-white p-6 rounded-3xl border-2 border-slate-100 hover:border-violet-200 transition-all hover:shadow-xl hover:shadow-violet-50">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                                                    <Activity size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 tracking-tight">{slot.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            <Clock size={12} /> {slot.startTime || '30 mins'}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                                            {slot.maxCapacity - (slot._count?.bookings || 0)} Spots Left
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                disabled={isSubmitting || (slot.maxCapacity - (slot._count?.bookings || 0)) <= 0}
                                                onClick={() => handleBookSlot(slot.id)}
                                                className="px-6 h-12 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 disabled:opacity-50 transition-all active:scale-95"
                                            >
                                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Secure Spot'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center text-center space-y-6 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-sm">
                                    <CalendarDays size={40} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                        No Slots Available
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[240px]">
                                        No recovery sessions are scheduled for {selectedDate?.id}.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedDate(calendarDates[0])}
                                    className="text-[9px] font-black text-violet-600 uppercase tracking-widest hover:underline"
                                >
                                    View Other Dates
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Helpful Tip */}
                    <div className="p-6 bg-slate-900 rounded-3xl flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                            <Info size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Important Note</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-normal">
                                Some premium services like massages or private sessions must be booked at the front desk. Recovery benefits are subject to branch availability.
                            </p>
                        </div>
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

export default MyMembership;
