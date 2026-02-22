import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Calendar, Clock, CreditCard, ArrowLeft, AlertCircle, Shield, Ban } from 'lucide-react';
// import { updateDetail } from '../../api/superadmin/superAdminApi'; // Mock API

const BookingSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        globalBookingEnabled: true,
        creditsPerBooking: 1,
        maxBookingsPerDay: 2,
        maxBookingsPerWeek: 10,
        cancellationWindow: 4, // hours
        advanceBookingDays: 7,
        penaltyEnabled: true,
        penaltyCredits: 1
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert('Booking rules updated successfully!');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl mb-6">
                <button
                    onClick={() => navigate('/superadmin/general-settings/general')}
                    className="group flex items-center text-slate-500 hover:text-violet-600 transition-all duration-300 hover:scale-105"
                >
                    <div className="p-1 rounded-full group-hover:bg-violet-50 transition-all duration-300 mr-2 group-hover:scale-110">
                        <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
                    </div>
                    <span className="font-semibold">Back to Dashboard</span>
                </button>
            </div>

            <div className="w-full max-w-4xl mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                Booking Rules
                            </h1>
                            <p className="text-slate-600 text-sm mt-1">Configure global booking limits, cancellation policies, and consumption logic</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <div className="p-8 sm:p-10 space-y-10">

                    {/* Booking Limits */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Shield size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Consumption Limits</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Credits per Booking</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <CreditCard size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        name="creditsPerBooking"
                                        value={settings.creditsPerBooking}
                                        onChange={handleChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all font-semibold"
                                    />
                                    <p className="text-xs text-slate-400 mt-2">Deducted from member wallet per session.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Max Bookings / Daily</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        name="maxBookingsPerDay"
                                        value={settings.maxBookingsPerDay}
                                        onChange={handleChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Max Bookings / Weekly</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        name="maxBookingsPerWeek"
                                        value={settings.maxBookingsPerWeek}
                                        onChange={handleChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Advance Booking Window (Days)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Clock size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        name="advanceBookingDays"
                                        value={settings.advanceBookingDays}
                                        onChange={handleChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all font-semibold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-8"></div>

                    {/* Cancellation Policy */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                                <Ban size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Cancellation Policy</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Cancellation Window</label>
                                <div className="relative group mb-2">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-rose-400">
                                        <Clock size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        name="cancellationWindow"
                                        value={settings.cancellationWindow}
                                        onChange={handleChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-rose-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 hover:border-rose-300 transition-all font-semibold"
                                    />
                                    <span className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-rose-400 uppercase tracking-wider">Hours Before</span>
                                </div>
                                <p className="text-xs text-rose-600 font-medium">Members cannot cancel if session starts within this window.</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold text-slate-700">Late Cancellation Penalty</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="penaltyEnabled" checked={settings.penaltyEnabled} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                    </label>
                                </div>

                                {settings.penaltyEnabled && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Penalty Credits</label>
                                        <input
                                            type="number"
                                            name="penaltyCredits"
                                            value={settings.penaltyCredits}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Save Button */}
                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="group relative flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-violet-500/50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Save size={20} className="mr-2 relative transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                            <span className="relative">{loading ? 'Saving...' : 'Save Configuration'}</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookingSettings;
