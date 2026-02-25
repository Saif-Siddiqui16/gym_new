import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight, Plus, Filter, Zap, Loader, X, AlertCircle } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { fetchMemberBookings, cancelBooking, fetchMemberProfile, fetchAvailableClasses, createBooking } from '../../api/member/memberApi';
import RightDrawer from '../../components/common/RightDrawer';

const MemberBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showQuickBookModal, setShowQuickBookModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedDate, setSelectedDate] = useState('Today');
    const [selectedTime, setSelectedTime] = useState('');

    // Wizard States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [bookingStep, setBookingStep] = useState(1);
    const [newBookingData, setNewBookingData] = useState({
        type: '',
        name: '',
        date: 'Today',
        time: '',
        location: '',
        trainer: ''
    });

    // New UI states for Final Polish
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);
    const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [showFullScheduleModal, setShowFullScheduleModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [memberProfile, setMemberProfile] = useState(null);
    const [creditsError, setCreditsError] = useState('');
    const [availableClasses, setAvailableClasses] = useState([]);

    useEffect(() => {
        loadBookings();
        loadMemberProfile();
        loadAvailableClasses();
    }, []);

    const loadAvailableClasses = async () => {
        try {
            const data = await fetchAvailableClasses();
            setAvailableClasses(data);
        } catch (error) {
            console.error("Failed to load classes:", error);
        }
    };

    const loadBookings = async () => {
        setLoading(true);
        try {
            const data = await fetchMemberBookings();
            const mappedBookings = data.map(b => ({
                id: b.id,
                name: b.class?.name || 'Session',
                type: b.class?.requiredBenefit ? 'Facility' : 'Group Class',
                date: new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: b.class?.schedule?.time || 'TBA',
                location: b.class?.location || 'Main Floor',
                trainer: b.class?.trainer?.name || 'Staff',
                status: b.status
            }));
            setBookings(mappedBookings);
        } catch (error) {
            console.error("Failed to load bookings:", error);
        }
        setLoading(false);
    };

    const loadMemberProfile = async () => {
        const profile = await fetchMemberProfile();
        setMemberProfile(profile);
    };

    const showToastMsg = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const handleNewBooking = () => {
        setBookingStep(1);
        setNewBookingData({
            type: '',
            name: '',
            date: 'Today',
            time: '',
            location: '',
            trainer: ''
        });
        setShowCreateModal(true);
    };

    const handleCancelTrigger = (id) => {
        setBookingToCancel(id);
        setShowConfirmCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        await cancelBooking(bookingToCancel);
        setBookings(bookings.map(b => b.id === bookingToCancel ? { ...b, status: 'Cancelled' } : b));
        setShowConfirmCancelModal(false);
        showToastMsg("Booking cancelled successfully.", "info");
    };

    const handleRescheduleTrigger = (booking) => {
        setSelectedBooking(booking);
        setSelectedDate(booking.date);
        setSelectedTime(booking.time.split(' - ')[0]); // Pre-select current start time
        setShowRescheduleModal(true);
    };

    const handleConfirmReschedule = async () => {
        if (!selectedTime) {
            showToastMsg("Please select a time slot.", "error");
            return;
        }
        // Simulate API call
        setBookings(bookings.map(b =>
            b.id === selectedBooking.id
                ? { ...b, date: selectedDate, time: `${selectedTime} - ${calculateEndTime(selectedTime)}` }
                : b
        ));
        setShowRescheduleModal(false);
        showToastMsg("Session rescheduled successfully!");
    };

    const handleQuickBookTrigger = (cls) => {
        if (cls.sessions === 'Full') {
            showToastMsg("This class is full. You've been added to the waitlist.", "info");
            return;
        }
        setSelectedClass(cls);
        setShowQuickBookModal(true);
    };

    const handleConfirmBooking = async () => {
        if (!selectedTime) {
            showToastMsg("Please select a time slot.", "error");
            return;
        }

        // Credit validation for class bookings
        if (memberProfile?.benefitWallet && memberProfile.benefitWallet.classCredits <= 0) {
            setCreditsError('Insufficient credits.');
            showToastMsg("Insufficient credits.", "error");
            return;
        }

        try {
            const response = await createBooking({
                classId: selectedClass.id,
                date: new Date() // Or selected date if we allow in UI
            });

            if (response.success) {
                // Update local credits and availability
                loadBookings();
                loadAvailableClasses();
                loadMemberProfile();

                setShowQuickBookModal(false);
                setCreditsError('');
                showToastMsg("Class booked successfully!");
            }
        } catch (error) {
            showToastMsg(error || "Failed to book class", "error");
        }
    };

    const handleRecoveryZoneTrigger = () => {
        setCreditsError('');
        setBookingStep(2);
        setNewBookingData({
            type: 'Facility',
            name: '',
            date: 'Next Session',
            time: '',
            location: 'Wellness Wing',
            trainer: 'Staff'
        });
        setShowCreateModal(true);
    };

    const finalizeBooking = async () => {
        if (!newBookingData.time) {
            showToastMsg("Please select a time slot.", "error");
            return;
        }

        // Credit validation for facility bookings
        if (newBookingData.type === 'Facility' && memberProfile?.benefitWallet) {
            const facilityName = newBookingData.name.toLowerCase();
            if (facilityName.includes('sauna')) {
                if (memberProfile.benefitWallet.saunaSessions <= 0) {
                    setCreditsError('No sauna credits available. Please upgrade or renew.');
                    showToastMsg("No sauna credits available. Please upgrade or renew.", "error");
                    return;
                }
            } else if (facilityName.includes('ice bath')) {
                if (memberProfile.benefitWallet.iceBathCredits <= 0) {
                    setCreditsError('No ice bath credits available. Please upgrade or renew.');
                    showToastMsg("No ice bath credits available. Please upgrade or renew.", "error");
                    return;
                }
            }
        }

        try {
            // Find class ID from availableClasses based on name if Facility or other wizard path
            const targetClass = availableClasses.find(c => c.name === newBookingData.name);
            if (!targetClass) {
                showToastMsg("Selected class not available.", "error");
                return;
            }

            const response = await createBooking({
                classId: targetClass.id,
                date: new Date() // Simplification for now, using selectDate from data if implemented
            });

            if (response.success) {
                // Update everything from backend
                loadBookings();
                loadAvailableClasses();
                loadMemberProfile();

                setShowCreateModal(false);
                setCreditsError('');
                showToastMsg("Booking created successfully!");
            }
        } catch (error) {
            showToastMsg(error || "Failed to create booking", "error");
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBookingForDetails(booking);
        setShowDetailsModal(true);
    };

    const calculateEndTime = (startTime) => {
        // Just a mock helper to add 1 hour
        const [time, period] = startTime.split(' ');
        const [hour, min] = time.split(':');
        let h = parseInt(hour);
        if (h === 12) h = 1; else h += 1;
        return `${h.toString().padStart(2, '0')}:${min} ${period}`;
    };

    const upcomingBookings = bookings.filter(b => ['Upcoming', 'Confirmed', 'Pending'].includes(b.status));
    const completedBookings = bookings.filter(b => b.status === 'Completed');
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');

    let displayedBookings = [];
    if (activeTab === 'Upcoming') displayedBookings = upcomingBookings;
    if (activeTab === 'Completed') displayedBookings = completedBookings;
    if (activeTab === 'Cancelled') displayedBookings = cancelledBookings;

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Manage Bookings</h1>
                        <p className="text-gray-500 font-medium mt-1.5 flex items-center gap-2 text-sm italic">
                            <Zap size={14} className="text-violet-500 fill-violet-500" />
                            Book and manage your personalized gym experience.
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {memberProfile?.benefitWallet && (
                            <div className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="p-2 bg-violet-50 rounded-xl text-violet-600">
                                    <Zap size={20} className="fill-violet-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Class Credits</p>
                                    <p className="text-xl font-black text-gray-900">{memberProfile.benefitWallet.classCredits}</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleNewBooking}
                            className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-black shadow-xl shadow-violet-100 hover:bg-violet-700 hover:-translate-y-0.5 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <Plus size={20} strokeWidth={3} /> Create Booking
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                    <TabButton
                        label="Upcoming"
                        count={upcomingBookings.length}
                        active={activeTab === 'Upcoming'}
                        onClick={() => setActiveTab('Upcoming')}
                    />
                    <TabButton
                        label="Completed"
                        count={completedBookings.length}
                        active={activeTab === 'Completed'}
                        onClick={() => setActiveTab('Completed')}
                    />
                    <TabButton
                        label="Cancelled"
                        count={cancelledBookings.length}
                        active={activeTab === 'Cancelled'}
                        onClick={() => setActiveTab('Cancelled')}
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Booking List */}
                    <div className="xl:col-span-2 space-y-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                                <Loader className="animate-spin text-violet-600 mb-4" size={32} />
                                <p className="text-gray-400 font-bold text-sm">Loading your schedule...</p>
                            </div>
                        ) : displayedBookings.length > 0 ? (
                            displayedBookings.map(booking => (
                                <BookingCard
                                    key={booking.id}
                                    {...booking}
                                    onCancel={() => handleCancelTrigger(booking.id)}
                                    onReschedule={() => handleRescheduleTrigger(booking)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm text-center px-6">
                                <div className="p-4 bg-gray-50 rounded-full mb-4">
                                    <Calendar size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900">No {activeTab.toLowerCase()} bookings</h3>
                                <p className="text-gray-400 text-sm font-medium mt-1">Looks like your schedule is clear. Ready to sweat?</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Booking Sidebar */}
                    <div className="xl:col-span-1 space-y-10">
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <h3 className="text-xl font-black text-gray-900 mb-6 relative z-10">Explore Classes</h3>
                            <div className="space-y-4 relative z-10">
                                {availableClasses.filter(c => !c.requiredBenefit).map(cls => (
                                    <QuickClassItem
                                        key={cls.id}
                                        name={cls.name}
                                        sessions={`${cls.maxCapacity - (cls._count?.bookings || 0)} spots left`}
                                        icon={cls.name[0]}
                                        onClick={() => handleQuickBookTrigger(cls)}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => setShowFullScheduleModal(true)}
                                className="w-full mt-8 py-4 border-2 border-dashed border-gray-100 text-gray-400 rounded-2xl text-sm font-bold hover:border-violet-200 hover:text-violet-600 hover:bg-violet-50/30 transition-all"
                            >
                                View Full Class Schedule
                            </button>
                        </div>

                        <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                                    <Zap className="text-indigo-400" size={24} />
                                </div>
                                <h3 className="text-2xl font-black mb-3">Recovery Zone</h3>
                                <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">Boost your recovery with a professional Sauna or Ice Bath session.</p>

                                {/* Credits Display */}
                                {memberProfile?.benefitWallet && (
                                    <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Available Credits</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-orange-500/20 rounded-lg">
                                                    <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 2a6 6 0 00-6 6c0 4.314 6 10 6 10s6-5.686 6-10a6 6 0 00-6-6z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium">Sauna</p>
                                                    <p className="text-lg font-black text-white">{memberProfile.benefitWallet.saunaSessions}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                                                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 2L8 6H4l4 4-2 6 4-3 4 3-2-6 4-4h-4l-2-4z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium">Ice Bath</p>
                                                    <p className="text-lg font-black text-white">{memberProfile.benefitWallet.iceBathCredits}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleRecoveryZoneTrigger}
                                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black shadow-lg hover:bg-indigo-50 hover:-translate-y-1 transition-all active:translate-y-0"
                                >
                                    Book Session Now
                                </button>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Drawer Components */}
            <RightDrawer
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title="Booking Details"
                maxWidth="max-w-md"
            >
                <BookingDetailsContent
                    booking={selectedBookingForDetails}
                    onReschedule={() => {
                        setShowDetailsModal(false);
                        handleRescheduleTrigger(selectedBookingForDetails);
                    }}
                    onCancel={() => {
                        setShowDetailsModal(false);
                        handleCancelTrigger(selectedBookingForDetails.id);
                    }}
                />
            </RightDrawer>

            <RightDrawer
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="New Reservation"
                maxWidth="max-w-xl"
            >
                <CreateBookingWizard
                    step={bookingStep}
                    setStep={setBookingStep}
                    data={newBookingData}
                    setData={setNewBookingData}
                    onClose={() => setShowCreateModal(false)}
                    onConfirm={finalizeBooking}
                    availableClasses={availableClasses}
                />
            </RightDrawer>

            <RightDrawer
                isOpen={showRescheduleModal}
                onClose={() => setShowRescheduleModal(false)}
                title="Reschedule Session"
                maxWidth="max-w-md"
            >
                <BookingModalContent
                    title="Reschedule Session"
                    subtitle={`Adjust your ${selectedBooking?.name} slot`}
                    onClose={() => setShowRescheduleModal(false)}
                    onConfirm={handleConfirmReschedule}
                    confirmLabel="Confirm Reschedule"
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                    memberProfile={memberProfile}
                />
            </RightDrawer>

            <RightDrawer
                isOpen={showQuickBookModal}
                onClose={() => setShowQuickBookModal(false)}
                title="Book Class"
                maxWidth="max-w-md"
            >
                <BookingModalContent
                    title="Book Class"
                    subtitle={`Confirm your spot for ${selectedClass?.name}`}
                    onClose={() => setShowQuickBookModal(false)}
                    onConfirm={handleConfirmBooking}
                    confirmLabel="Confirm Booking"
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                    memberProfile={memberProfile}
                />
            </RightDrawer>

            <RightDrawer
                isOpen={showConfirmCancelModal}
                onClose={() => setShowConfirmCancelModal(false)}
                title="Cancel Reservation?"
                maxWidth="max-w-md"
            >
                <ConfirmCancelContent
                    onClose={() => setShowConfirmCancelModal(false)}
                    onConfirm={handleConfirmCancel}
                />
            </RightDrawer>

            <RightDrawer
                isOpen={showFullScheduleModal}
                onClose={() => setShowFullScheduleModal(false)}
                title="Full Schedule"
                maxWidth="max-w-4xl"
            >
                <FullScheduleContent
                    onClose={() => setShowFullScheduleModal(false)}
                    onBook={(cls) => {
                        setShowFullScheduleModal(false);
                        handleQuickBookTrigger(cls);
                    }}
                    classes={availableClasses}
                />
            </RightDrawer>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-8 right-8 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
                    <div className={`p-1.5 rounded-lg ${toast.type === 'error' ? 'bg-white/20' : 'bg-violet-500/20'}`}>
                        {toast.type === 'error' ? <X size={16} /> : <Zap size={16} className="text-violet-400 fill-violet-400" />}
                    </div>
                    <span className="text-sm font-black tracking-tight">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

const CreateBookingWizard = ({ step, setStep, data, setData, onClose, onConfirm, availableClasses }) => {
    const categories = [
        { id: 'Group Class', label: 'Group Class', icon: User, color: 'text-violet-600', bg: 'bg-violet-50' },
        { id: 'Personal Training', label: 'Personal Training', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'Facility', label: 'Gym Facility', icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    const services = {
        'Group Class': availableClasses.filter(c => !c.requiredBenefit).map(c => c.name),
        'Personal Training': ['Strength & Conditioning', 'Fat Loss Blast', 'Muscle Building', 'Posture Correction'], // Mock PT for now
        'Facility': availableClasses.filter(c => c.requiredBenefit).map(c => c.name)
    };

    const datesArr = ['Today, May 15', 'Tomorrow, May 16', 'Fri, May 17', 'Sat, May 18', 'Sun, May 19'];
    const timeSlotsArr = ['08:00 AM', '09:00 AM', '10:00 AM', '05:00 PM', '06:00 PM', '07:00 PM'];

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? 'bg-violet-600' : 'bg-gray-200'}`}></div>
                ))}
            </div>

            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-right-4 duration-300">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setData({ ...data, type: cat.id });
                                setStep(2);
                            }}
                            className={`p-6 rounded-[32px] border-2 flex flex-col items-center text-center gap-4 transition-all hover:scale-105 ${data.type === cat.id ? 'border-violet-600 bg-violet-50/30' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-violet-100'}`}
                        >
                            <div className={`p-4 rounded-2xl ${cat.bg} ${cat.color}`}>
                                <cat.icon size={32} strokeWidth={2.5} />
                            </div>
                            <span className="font-black text-gray-900 text-sm">{cat.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Available {data.type}s</label>
                    <div className="grid grid-cols-2 gap-3">
                        {services[data.type].map(svc => (
                            <button
                                key={svc}
                                onClick={() => {
                                    setData({ ...data, name: svc });
                                    setStep(3);
                                }}
                                className={`p-4 rounded-2xl text-left font-bold text-sm transition-all border-2 ${data.name === svc ? 'bg-violet-600 border-violet-600 text-white' : 'bg-gray-50 border-transparent text-gray-700 hover:bg-white hover:border-violet-100'}`}
                            >
                                {svc}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Select Date</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {datesArr.map(date => (
                                <button
                                    key={date}
                                    onClick={() => setData({ ...data, date })}
                                    className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 ${data.date === date ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-violet-100'}`}
                                >
                                    {date}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Available Slots</label>
                        <div className="grid grid-cols-3 gap-3">
                            {timeSlotsArr.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setData({ ...data, time })}
                                    className={`p-4 rounded-3xl text-xs font-black transition-all border-2 flex flex-col items-center gap-1 ${data.time === time ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-violet-100'}`}
                                >
                                    <Clock size={14} className={data.time === time ? 'text-white' : 'text-violet-500'} />
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-8 flex gap-4">
                {step > 1 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="flex-1 px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all uppercase tracking-widest"
                    >
                        Back
                    </button>
                )}
                <button
                    onClick={step === 3 ? onConfirm : () => { }}
                    disabled={step < 3 && !((step === 1 && data.type) || (step === 2 && data.name))}
                    className={`flex-[2] py-4 rounded-2xl font-black text-sm transition-all uppercase tracking-widest ${step === 3 ? 'bg-violet-600 text-white shadow-xl shadow-violet-100 hover:bg-violet-700 hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-default'}`}
                >
                    {step === 3 ? 'Confirm Booking' : 'Next Step'}
                </button>
            </div>
        </div>
    );
};

const BookingModalContent = ({ title, subtitle, onClose, onConfirm, confirmLabel, selectedDate, setSelectedDate, selectedTime, setSelectedTime, memberProfile }) => {
    const dates = ['Today, May 15', 'Tomorrow, May 16', 'Fri, May 17', 'Sat, May 18', 'Sun, May 19'];
    const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '05:00 PM', '06:00 PM', '07:00 PM'];

    return (
        <div className="p-8 space-y-8">
            <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{title}</h3>
                <p className="text-gray-500 font-medium text-sm">{subtitle}</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Select Date</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {dates.map(date => (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 ${selectedDate === date ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-violet-100'}`}
                            >
                                {date}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Available Slots</label>
                    <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map(time => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`p-4 rounded-3xl text-xs font-black transition-all border-2 flex flex-col items-center gap-1 ${selectedTime === time ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-violet-100'}`}
                            >
                                <Clock size={14} className={selectedTime === time ? 'text-white' : 'text-violet-500'} />
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-4 flex flex-col gap-4">
                {memberProfile?.benefitWallet && memberProfile.benefitWallet.classCredits <= 0 && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                        <AlertCircle size={16} />
                        <span className="text-xs font-black uppercase tracking-wider">Insufficient credits.</span>
                    </div>
                )}
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-5 bg-gray-50 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={memberProfile?.benefitWallet && memberProfile.benefitWallet.classCredits <= 0}
                        className={`flex-[2] py-5 rounded-2xl font-black text-sm shadow-xl transition-all uppercase tracking-widest ${memberProfile?.benefitWallet && memberProfile.benefitWallet.classCredits <= 0 ? 'bg-gray-100 text-gray-400 shadow-none' : 'bg-violet-600 text-white shadow-violet-100 hover:bg-violet-700'}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BookingDetailsContent = ({ booking, onReschedule, onCancel }) => {
    if (!booking) return null;
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[32px] bg-violet-100 flex items-center justify-center text-violet-600 shadow-lg shadow-violet-100/50">
                    <Calendar size={36} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-7">{booking.name}</h3>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">{booking.type}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-[24px] bg-gray-50 border-2 border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-black text-gray-900">{booking.date}</p>
                </div>
                <div className="p-5 rounded-[24px] bg-gray-50 border-2 border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time</p>
                    <p className="text-sm font-black text-gray-900">{booking.time}</p>
                </div>
            </div>

            <div className="p-6 rounded-[24px] bg-violet-50 border-2 border-violet-100 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-xs">
                        {booking.instructor?.[0] || booking.trainer?.[0] || 'S'}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-0.5">Instructor/Staff</p>
                        <p className="text-sm font-black text-gray-900">{booking.instructor || booking.trainer || 'Staff'}</p>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-violet-100">
                    <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Status</span>
                    <span className="px-3 py-1 bg-green-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest">{booking.status}</span>
                </div>
            </div>

            {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                <div className="flex flex-col gap-4 pt-4">
                    <button
                        onClick={onReschedule}
                        className="w-full py-5 bg-violet-600 text-white rounded-[24px] font-black shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all uppercase tracking-widest"
                    >
                        Reschedule
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-4 text-red-500 font-black text-xs hover:bg-red-50 rounded-[20px] transition-all uppercase tracking-[0.2em]"
                    >
                        Cancel Booking
                    </button>
                </div>
            )}
        </div>
    );
};

const ConfirmCancelContent = ({ onClose, onConfirm }) => (
    <div className="p-8 space-y-8 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[40px] bg-red-100 text-red-600 shadow-lg shadow-red-100/50 mb-2">
            <AlertCircle size={48} />
        </div>

        <div className="space-y-3">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Wait, really?</h3>
            <p className="text-gray-500 font-medium text-sm leading-relaxed px-6">
                Are you sure you want to cancel this booking? You might lose your spot in this popular session.
            </p>
        </div>

        <div className="flex flex-col gap-4 pt-4">
            <button
                onClick={onConfirm}
                className="w-full py-5 bg-red-600 text-white rounded-[24px] font-black shadow-xl shadow-red-200 hover:bg-red-700 transition-all uppercase tracking-widest"
            >
                Yes, Cancel Booking
            </button>
            <button
                onClick={onClose}
                className="w-full py-4 text-gray-400 font-black text-xs hover:text-gray-900 transition-colors uppercase tracking-[0.2em]"
            >
                Nevermind, keep it
            </button>
        </div>
    </div>
);

const FullScheduleContent = ({ onClose, onBook, classes }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const [activeDay, setActiveDay] = useState('Mon');

    const mappedClasses = (classes || []).filter(c => !c.requiredBenefit).map(c => ({
        id: c.id,
        name: c.name,
        time: c.schedule?.time || 'TBA',
        trainer: c.trainer?.name || 'TBA',
        spots: `${c.maxCapacity - (c._count?.bookings || 0)} spots left`,
        days: c.schedule?.days || []
    }));

    const filteredClasses = mappedClasses.filter(c => c.days.includes(activeDay));

    return (
        <div className="p-8 space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {days.map(day => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 ${activeDay === day ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-violet-100'}`}
                    >
                        {day}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClasses.map((cls, idx) => (
                    <div key={idx} className="p-6 bg-gray-50 rounded-[32px] border-2 border-transparent hover:border-violet-100 hover:bg-white transition-all flex justify-between items-center group">
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                {/* Assuming tags are part of the mapped class or derived */}
                                {/* {cls.tags.map(tag => <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-violet-500 bg-violet-100/50 px-2 py-0.5 rounded-full">{tag}</span>)} */}
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-black text-gray-900 text-lg leading-tight">{cls.name}</p>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${cls.spots.startsWith('0') || cls.spots === 'Full' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {cls.spots.startsWith('0') ? 'FULL' : cls.spots.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 font-bold mt-1.5 flex items-center gap-2">
                                    <Clock size={12} strokeWidth={3} /> {cls.time} • {cls.trainer}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onBook(cls)}
                            className="p-3 bg-white rounded-2xl shadow-sm text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TabButton = ({ label, count, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-8 py-3.5 rounded-2xl text-sm font-black whitespace-nowrap transition-all flex items-center gap-3 border-2 ${active ? 'bg-violet-600 border-violet-600 text-white shadow-xl shadow-violet-100' : 'bg-white border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-100'}`}
    >
        {label}
        {count !== undefined && (
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {count}
            </span>
        )}
    </button>
);

const BookingCard = ({ id, type, name, date, time, location, trainer, status, onCancel, onReschedule, onClick }) => {
    const isPending = status === 'Pending';
    const isCancelled = status === 'Cancelled';
    const isCompleted = status === 'Completed';

    const getStatusColor = () => {
        if (isPending) return 'text-amber-600 bg-amber-50/50 border-amber-100';
        if (isCompleted) return 'text-indigo-600 bg-indigo-50/50 border-indigo-100';
        if (isCancelled) return 'text-red-500 bg-red-50/50 border-red-100';
        return 'text-emerald-600 bg-emerald-50/50 border-emerald-100';
    };

    const getSidebarColor = () => {
        if (isPending) return 'bg-amber-400';
        if (isCancelled) return 'bg-red-400';
        if (isCompleted) return 'bg-indigo-400';
        return 'bg-emerald-500';
    };

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
        >
            <div className={`absolute top-0 left-0 w-1.5 h-full ${getSidebarColor()} transition-all duration-300`}></div>

            <div className="p-6 md:p-8 space-y-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pl-3">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-violet-50 text-[10px] font-black uppercase tracking-wider text-violet-600 border border-violet-100">
                                {type}
                            </span>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor()} transition-colors`}>
                                {status}
                            </div>
                        </div>
                        <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-violet-900 transition-colors">{name}</h4>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8 pl-3">
                    <DetailItem icon={Calendar} label={date} />
                    <DetailItem icon={Clock} label={time} />
                    <DetailItem icon={MapPin} label={location} />
                    {trainer && <DetailItem icon={User} label={trainer} />}
                </div>

                {(!isCancelled && !isCompleted) && (
                    <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row gap-3 pl-3" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3.5 px-6 rounded-2xl text-xs font-black text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest border-2 border-transparent"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onReschedule}
                            className="flex-1 py-3.5 px-6 rounded-2xl text-xs font-black text-violet-600 bg-violet-50 border-2 border-violet-100 hover:bg-violet-600 hover:text-white hover:border-violet-600 hover:shadow-lg hover:shadow-violet-200 transition-all uppercase tracking-widest"
                        >
                            Reschedule
                        </button>
                    </div>
                )}
            </div>

            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-50/50 to-transparent rounded-bl-[100px] -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-6 right-6 text-gray-200 group-hover:text-violet-200 group-hover:translate-x-1 transition-all duration-300">
                <ChevronRight size={24} />
            </div>
        </div>
    );
};

const DetailItem = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 bg-violet-50 rounded-xl">
            <Icon size={16} className="text-violet-500" />
        </div>
        <span className="text-sm font-bold text-gray-600">{label}</span>
    </div>
);

const QuickClassItem = ({ name, sessions, icon, onClick }) => (
    <div
        onClick={onClick}
        className="flex items-center justify-between p-5 bg-gray-50 rounded-[28px] border-2 border-transparent hover:border-violet-100 hover:bg-white transition-all cursor-pointer group/item"
    >
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center font-black text-lg group-hover/item:rotate-12 transition-transform">
                {icon}
            </div>
            <div>
                <p className="text-sm font-black text-gray-900">{name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{sessions}</p>
            </div>
        </div>
        <div className="p-2 bg-white rounded-xl shadow-sm text-gray-300 group-hover/item:text-violet-500 group-hover/item:scale-110 transition-all">
            <Plus size={16} strokeWidth={3} />
        </div>
    </div>
);

export default MemberBookings;
