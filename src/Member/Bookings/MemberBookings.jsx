import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Zap,
    Search,
    Filter,
    Activity,
    Plus,
    Target,
    MapPin,
    Users,
    Loader,
    X
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import { fetchPTAccounts, bookPTSession } from '../../api/member/memberApi';

const MemberBookings = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    
    // Core booking state
    const [bookingType, setBookingType] = useState('Class'); // 'Class' or 'PT'
    const [selectedClassId, setSelectedClassId] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // PT booking state
    const [ptAccounts, setPtAccounts] = useState([]);
    const [selectedPtAccountId, setSelectedPtAccountId] = useState('');
    const [ptTime, setPtTime] = useState('');

    const tabs = ['All', 'Recovery', 'Classes', 'PT'];

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/member/bookings');
                setBookings(response.data || []);
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(b => {
        const type = (b.class?.type || b.class?.name || '').toLowerCase();
        if (activeTab === 'All') return true;
        if (activeTab === 'Recovery') return type.includes('sauna') || type.includes('ice bath') || type.includes('recovery');
        if (activeTab === 'Classes') return !type.includes('sauna') && !type.includes('ice bath') && !type.includes('pt');
        if (activeTab === 'PT') return type.includes('pt') || type.includes('personal') || type.includes('training');
        return true;
    });

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        // If it already has AM/PM, return as is (maybe trim seconds if present)
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
            return timeStr;
        }
        // Handles "09:00:00" mapping -> "09:00"
        return timeStr.substring(0, 5);
    };

    const handleOpenBookingModal = async () => {
        setIsBookingModalOpen(true);
        setLoadingClasses(true);
        setSelectedClassId('');
        setBookingDate('');
        setPtTime('');
        setSelectedPtAccountId('');
        try {
            const [classRes, ptRes] = await Promise.all([
                apiClient.get('/member/classes'),
                fetchPTAccounts()
            ]);
            setAvailableClasses(classRes.data || []);
            // Only show active accounts with remaining sessions
            setPtAccounts(ptRes.filter(acc => acc.status === 'Active' && (!acc.package?.totalSessions || acc.remainingSessions > 0)));
        } catch (err) {
            console.error("Failed to fetch booking options:", err);
            toast.error("Failed to load booking options.");
        } finally {
            setLoadingClasses(false);
        }
    };

    const handleBookClass = async () => {
        if (bookingType === 'Class' && (!selectedClassId || !bookingDate)) {
            toast.error("Please select a session and date.");
            return;
        }
        if (bookingType === 'PT' && (!selectedPtAccountId || !bookingDate || !ptTime)) {
             toast.error("Please select a PT Package, date, and time.");
             return;
        }

        setIsSubmitting(true);
        try {
            if (bookingType === 'Class') {
                await apiClient.post('/member/bookings', {
                    classId: selectedClassId,
                    date: bookingDate
                });
            } else {
                await bookPTSession({
                    ptAccountId: selectedPtAccountId,
                    date: bookingDate,
                    time: ptTime,
                    duration: 60
                });
            }
            
            toast.success("Successfully booked your session!");
            setIsBookingModalOpen(false);

            // Refresh bookings
            setLoading(true);
            const bRes = await apiClient.get('/member/bookings');
            setBookings(bRes.data || []);
            setLoading(false);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to book session.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="saas-container   space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b-2 border-slate-100">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-violet-100 animate-in zoom-in duration-500">
                        <Calendar size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1 animate-in slide-in-from-left duration-500">
                            Book & Schedule
                        </h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-in slide-in-from-left duration-700">
                            Upcoming sessions for the next 7 days
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Action Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                                ? 'bg-white text-primary shadow-md ring-1 ring-slate-200'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="hidden sm:block h-6 w-px bg-slate-200 mx-2" />
                </div>

                <button
                    onClick={handleOpenBookingModal}
                    className="px-8 h-12 bg-primary text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-100 hover:bg-primary-hover hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                    <Plus size={16} strokeWidth={3} /> My Booking
                </button>
            </div>

            {/* My Bookings Section */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 px-1">
                    <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary shadow-sm border border-violet-100">
                        <Zap size={16} />
                    </div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">My Bookings</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBookings.map((booking) => (
                            <Card key={booking.id} className="p-8 sm:p-10 border-slate-100 hover:border-violet-100 transition-all duration-300 rounded-[2.5rem] group relative overflow-hidden bg-white shadow-sm">
                                {/* Decorator */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110" />

                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
                                        <Activity size={24} />
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${booking.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                        booking.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">{booking.class?.name || 'Session'}</h3>
                                        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">{booking.class?.type || 'General'}</p>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Calendar size={16} className="text-violet-400" />
                                            <span className="text-sm font-bold">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Clock size={16} className="text-violet-400" />
                                            <span className="text-sm font-bold">{formatTime(booking.class?.startTime)} - {formatTime(booking.class?.endTime)}</span>
                                        </div>
                                        {booking.class?.trainer && (
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <Users size={16} className="text-violet-400" />
                                                <span className="text-sm font-bold">{booking.class.trainer.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-24 sm:p-32 border-2 border-slate-100 shadow-2xl shadow-slate-100/20 rounded-[4rem] bg-white flex flex-col items-center justify-center text-center group hover:border-violet-100 transition-all duration-500">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border-2 border-dashed border-slate-100 group-hover:scale-110 transition-transform duration-500">
                            <Calendar size={48} strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-4 leading-none">
                            No upcoming bookings
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-sm">
                            Book a class or recovery slot to see it here.
                        </p>
                    </Card>
                )}
            </div>

            {/* Booking Modal */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">New Booking</h3>
                            <button onClick={() => setIsBookingModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {loadingClasses ? (
                                <div className="flex justify-center py-10">
                                    <Loader className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <>
                                    {/* Type Toggle */}
                                    <div className="flex p-1 bg-slate-100 rounded-xl">
                                        <button 
                                            onClick={() => setBookingType('Class')}
                                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${bookingType === 'Class' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Classes & Recovery
                                        </button>
                                        <button 
                                            onClick={() => setBookingType('PT')}
                                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${bookingType === 'PT' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Personal Training
                                        </button>
                                    </div>

                                    {bookingType === 'Class' ? (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Class/Session</label>
                                                <select
                                                    value={selectedClassId}
                                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                >
                                                    <option value="">-- Choose an option --</option>
                                                    {availableClasses.map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name} {c.startTime ? `(${formatTime(c.startTime)})` : ''} - {c.trainer?.name ? `Trainer: ${c.trainer.name}` : 'General'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
                                                <input
                                                    type="date"
                                                    value={bookingDate}
                                                    onChange={(e) => setBookingDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            {ptAccounts.length === 0 ? (
                                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-bold text-center">
                                                    You don't have any active PT packages. Please purchase or activate a package first.
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select PT Package</label>
                                                        <select
                                                            value={selectedPtAccountId}
                                                            onChange={(e) => setSelectedPtAccountId(e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                        >
                                                            <option value="">-- Choose your PT package --</option>
                                                            {ptAccounts.map(acc => (
                                                                <option key={acc.id} value={acc.id}>
                                                                    {acc.package?.name} {acc.package?.totalSessions > 0 ? `(${acc.remainingSessions} sessions left)` : '(Unlimited)'} - Trainer: {acc.trainer?.name || 'Assigned'}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
                                                            <input
                                                                type="date"
                                                                value={bookingDate}
                                                                onChange={(e) => setBookingDate(e.target.value)}
                                                                min={new Date().toISOString().split('T')[0]}
                                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Time</label>
                                                            <input
                                                                type="time"
                                                                value={ptTime}
                                                                onChange={(e) => setPtTime(e.target.value)}
                                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleBookClass}
                                        disabled={isSubmitting || 
                                            (bookingType === 'Class' && (!selectedClassId || !bookingDate)) ||
                                            (bookingType === 'PT' && (!selectedPtAccountId || !bookingDate || !ptTime))
                                        }
                                        className="w-full py-4 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberBookings;
