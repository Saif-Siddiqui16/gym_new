import React, { useState } from 'react';
import { Save, Info, Settings2, Clock, CalendarDays, Ticket } from 'lucide-react';

const BookingSettingsDrawer = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        creditsPerBooking: 1,
        maxBookingsPerDay: 2,
        maxBookingsPerWeek: 10,
        cancellationWindow: 2, // hours
        allowWaitlist: true,
        notifyOnCancellation: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            alert('Booking settings updated successfully!');
            onClose();
        }, 800);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Intro Section */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
                    <Info className="text-indigo-600 shrink-0" size={20} />
                    <p className="text-xs text-indigo-700 leading-relaxed">
                        Configure how members interact with the booking system. These limits apply globally unless overridden by specific membership plans.
                    </p>
                </div>

                {/* Credit System */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Ticket size={18} className="text-purple-600" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Consumption Rules</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <label className="block text-sm font-bold text-slate-700">Credits per Session</label>
                            <p className="text-[10px] text-slate-400 font-medium">How many credits are deducted from a member's wallet for a successfully attended booking.</p>
                        </div>
                        <div className="relative group">
                            <input
                                type="number"
                                name="creditsPerBooking"
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                value={formData.creditsPerBooking}
                                onChange={handleInputChange}
                                min="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 group-focus-within:text-indigo-500 uppercase tracking-tighter">Credits</span>
                        </div>
                    </div>
                </div>

                {/* Booking Limits */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={18} className="text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Booking Limits</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Max Bookings Per Day</label>
                                <p className="text-[9px] text-slate-400 font-medium">Limit the number of active sessions a member can book in a single 24-hour cycle.</p>
                            </div>
                            <input
                                type="number"
                                name="maxBookingsPerDay"
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                value={formData.maxBookingsPerDay}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Max Bookings Per Week</label>
                                <p className="text-[9px] text-slate-400 font-medium">Weekly cap on bookings to ensure fair access for all members.</p>
                            </div>
                            <input
                                type="number"
                                name="maxBookingsPerWeek"
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                value={formData.maxBookingsPerWeek}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Cancellation Policy */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-rose-600" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Cancellation Window</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <label className="block text-sm font-bold text-slate-700">Hours before start</label>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">The minimum time required to cancel a booking without losing the credit. After this window, cancellations are considered "No-Shows".</p>
                        </div>
                        <div className="relative group">
                            <input
                                type="number"
                                name="cancellationWindow"
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-all font-bold"
                                value={formData.cancellationWindow}
                                onChange={handleInputChange}
                                min="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 group-focus-within:text-rose-500 uppercase tracking-tighter transition-colors">Hours</span>
                        </div>
                    </div>
                </div>

                {/* Notifications & Advanced */}
                <div className="space-y-4 pt-4 border-t border-slate-100 pb-10">
                    <div className="flex items-center gap-2">
                        <Settings2 size={18} className="text-emerald-600" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Advanced Settings</h3>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-slate-700">Allow Waitlist</span>
                                <span className="text-[10px] text-slate-500">Enable queue if session is full</span>
                            </div>
                            <input
                                type="checkbox"
                                name="allowWaitlist"
                                checked={formData.allowWaitlist}
                                onChange={handleInputChange}
                                className="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-0 transition-all"
                            />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-slate-700">Notify Admin</span>
                                <span className="text-[10px] text-slate-500">Alert staff on every cancellation</span>
                            </div>
                            <input
                                type="checkbox"
                                name="notifyOnCancellation"
                                checked={formData.notifyOnCancellation}
                                onChange={handleInputChange}
                                className="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-0 transition-all"
                            />
                        </label>
                    </div>   
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 p-4 bg-white border-t border-slate-100 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                >
                    Discard
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Save size={18} />
                    {isSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </form>
    );
};

export default BookingSettingsDrawer;
