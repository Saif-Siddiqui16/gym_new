import React, { useState, useEffect } from 'react';
import { getTrainerAvailability, updateTrainerAvailability, deleteTrainerTimeOff } from '../../api/trainer/trainerApi';
import Card from "../../components/ui/Card";
import RightDrawer from "../../components/common/RightDrawer";
import {
    Calendar,
    Plus,
    Edit2,
    Trash2,
    Clock,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Settings,
    Coffee
} from 'lucide-react';

const AvailabilitySettingsPage = () => {
    // --- STATE ---
    const [availability, setAvailability] = useState([]);
    const [timeOff, setTimeOff] = useState([]);
    const [preferences, setPreferences] = useState({});
    const [loading, setLoading] = useState(true);

    // Drawer States
    const [isSlotDrawerOpen, setIsSlotDrawerOpen] = useState(false);
    const [isTimeOffDrawerOpen, setIsTimeOffDrawerOpen] = useState(false);
    const [editingDay, setEditingDay] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getTrainerAvailability();
            setAvailability(data.weekly || []);
            setTimeOff(data.timeOff || []);
            setPreferences(data.preferences || { instantBooking: true, requireApproval: false, autoAcceptReturning: true });
        } catch (error) {
            console.error("Failed to load availability:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- HANDLERS ---
    const togglePreference = async (key) => {
        const updatedPrefs = { ...preferences, [key]: !preferences[key] };
        setPreferences(updatedPrefs);
        try {
            await updateTrainerAvailability({ preferences: updatedPrefs });
        } catch (error) {
            alert('Failed to save preference');
            setPreferences(preferences); // revert on fail
        }
    };

    const handleDeleteTimeOff = async (id) => {
        if (!window.confirm("Are you sure you want to remove this time off?")) return;
        try {
            await deleteTrainerTimeOff(id);
            setTimeOff(timeOff.filter(t => t.id !== id));
            alert('Time off removed successfully!');
        } catch (error) {
            alert('Failed to remove time off');
        }
    };

    const handleEditDay = (day) => {
        setEditingDay(availability.find(d => d.day === day));
        setIsSlotDrawerOpen(true);
    };

    // --- RENDER HELPERS ---
    const SlotDrawer = () => {
        const [localSlots, setLocalSlots] = useState([]);
        const [newStart, setNewStart] = useState('');
        const [newEnd, setNewEnd] = useState('');

        useEffect(() => {
            if (editingDay) {
                setLocalSlots(editingDay.slots ? [...editingDay.slots] : []);
            }
        }, [editingDay]);

        const handleSave = async () => {
            const updatedAvailability = availability.map(d =>
                d.day === editingDay.day ? { ...d, slots: localSlots } : d
            );

            try {
                await updateTrainerAvailability({ schedule: updatedAvailability });
                setAvailability(updatedAvailability);
                setIsSlotDrawerOpen(false);
                alert('Schedule updated successfully!');
            } catch (error) {
                alert('Failed to update schedule');
            }
        };

        const handleAddSlot = () => {
            if (!newStart || !newEnd) return alert('Please specify start and end times');

            // Format time properly (basic conversion to AM/PM)
            const formatTime = (timeStr) => {
                const [h, m] = timeStr.split(':');
                let hours = parseInt(h);
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
            };

            setLocalSlots([...localSlots, { start: formatTime(newStart), end: formatTime(newEnd) }]);
            setNewStart('');
            setNewEnd('');
        };

        const handleRemoveSlot = (index) => {
            setLocalSlots(localSlots.filter((_, idx) => idx !== index));
        };

        return (
            <RightDrawer
                isOpen={isSlotDrawerOpen}
                onClose={() => setIsSlotDrawerOpen(false)}
                title={`Availability: ${editingDay?.day}`}
                subtitle="Manage your time slots"
                footer={
                    <div className="flex gap-3">
                        <button onClick={handleSave} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                            Save Changes
                        </button>
                        <button
                            onClick={() => setIsSlotDrawerOpen(false)}
                            className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold"
                        >
                            Cancel
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {localSlots.map((slot, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-indigo-500" />
                                <span className="text-sm font-bold text-gray-800">{slot.start} – {slot.end}</span>
                            </div>
                            <button onClick={() => handleRemoveSlot(idx)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl space-y-4">
                        <p className="text-sm font-bold text-gray-700 text-center">Add New Slot</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Start Time</label>
                                <input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">End Time</label>
                                <input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                        <button onClick={handleAddSlot} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors">
                            + Add to Schedule
                        </button>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuration</p>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Slot Duration</label>
                            <select className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option>30 Minutes</option>
                                <option>60 Minutes</option>
                                <option>90 Minutes</option>
                            </select>
                        </div>
                    </div>
                </div>
            </RightDrawer>
        );
    };

    const TimeOffDrawer = () => {
        const [reason, setReason] = useState('');
        const [start, setStart] = useState('');
        const [end, setEnd] = useState('');

        const handleSave = async () => {
            if (!start || !end || !reason) return alert('Fill all fields');
            try {
                await updateTrainerAvailability({ newTimeOff: { start, end, reason } });
                alert('Dates blocked successfully!');
                setIsTimeOffDrawerOpen(false);
                loadData(); // refresh
            } catch (error) {
                alert('Error updating availability');
            }
        };

        return (
            <RightDrawer
                isOpen={isTimeOffDrawerOpen}
                onClose={() => setIsTimeOffDrawerOpen(false)}
                title="Add Time Off"
                subtitle="Block dates on your calendar"
                footer={
                    <button onClick={handleSave} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                        Block Dates
                    </button>
                }
            >
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Reason</label>
                        <input value={reason} onChange={e => setReason(e.target.value)} type="text" placeholder="e.g. Vacation, Sick Leave" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Start Date</label>
                            <input value={start} onChange={e => setStart(e.target.value)} type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">End Date</label>
                            <input value={end} onChange={e => setEnd(e.target.value)} type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-700 font-medium">Any existing appointments during these dates will need to be rescheduled manually.</p>
                    </div>
                </div>
            </RightDrawer>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium tracking-tight">Loading settings...</p>
        </div>
    );

    return (
        <div className="h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8 space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Availability Settings</h1>
                    <p className="text-gray-500 text-sm font-medium">Manage your personal booking schedule and preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Column 1 & 2: Main Settings */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Weekly Availability */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Clock size={18} className="text-indigo-600" />
                            <h2 className="text-lg font-bold text-gray-800">Weekly Availability</h2>
                        </div>
                        <Card className="p-0 overflow-hidden border border-gray-200 shadow-md">
                            <div className="divide-y divide-gray-50">
                                {availability.map((item) => (
                                    <div key={item.day} className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 hover:bg-gray-50 transition-colors gap-4">
                                        <div className="w-32">
                                            <p className="font-black text-gray-900 text-sm">{item.day}</p>
                                        </div>
                                        <div className="flex-1">
                                            {item.slots.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {item.slots.map((slot, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-black border border-indigo-100">
                                                            {slot.start} – {slot.end}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-bold italic">Not Available</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleEditDay(item.day)}
                                            className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 hover:shadow-sm transition-all shadow-sm"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>

                    {/* Time Off */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-amber-500" />
                                <h2 className="text-lg font-bold text-gray-800">Time Off / Blocked Dates</h2>
                            </div>
                            <button
                                onClick={() => setIsTimeOffDrawerOpen(true)}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black hover:bg-indigo-100 transition-all flex items-center gap-1.5"
                            >
                                <Plus size={14} />
                                Add Time Off
                            </button>
                        </div>
                        <Card className="p-5 border border-gray-200 shadow-md">
                            {timeOff.length > 0 ? (
                                <div className="space-y-3">
                                    {timeOff.map((off) => (
                                        <div key={off.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                                                    <Coffee size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-800">{off.reason}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{off.start === off.end ? off.start : `${off.start} to ${off.end}`}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteTimeOff(off.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm font-bold italic">No upcoming time off set.</p>
                                </div>
                            )}
                        </Card>
                    </section>
                </div>

                {/* Column 3: Preferences */}
                <div className="space-y-8">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Settings size={18} className="text-slate-600" />
                            <h2 className="text-lg font-bold text-gray-800">Booking Rules</h2>
                        </div>
                        <Card className="p-5 border border-gray-200 shadow-md space-y-6">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between group">
                                    <div className="max-w-[80%]">
                                        <p className="text-sm font-black text-gray-800">Instant Booking</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Clients can book available slots immediately.</p>
                                    </div>
                                    <button
                                        onClick={() => togglePreference('instantBooking')}
                                        className={`w-10 h-6 flex items-center rounded-full px-1 transition-all duration-300 ${preferences.instantBooking ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${preferences.instantBooking ? 'translate-x-4' : ''}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="max-w-[80%]">
                                        <p className="text-sm font-black text-gray-800">Manual Approval</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Require approval for every new booking request.</p>
                                    </div>
                                    <button
                                        onClick={() => togglePreference('requireApproval')}
                                        className={`w-10 h-6 flex items-center rounded-full px-1 transition-all duration-300 ${preferences.requireApproval ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${preferences.requireApproval ? 'translate-x-4' : ''}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="max-w-[80%]">
                                        <p className="text-sm font-black text-gray-800">Auto-Accept Returning</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Skip approval for existing active clients.</p>
                                    </div>
                                    <button
                                        onClick={() => togglePreference('autoAcceptReturning')}
                                        className={`w-10 h-6 flex items-center rounded-full px-1 transition-all duration-300 ${preferences.autoAcceptReturning ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${preferences.autoAcceptReturning ? 'translate-x-4' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-gray-100">
                                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3">
                                    <CheckCircle2 size={18} className="text-indigo-500 shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-black text-indigo-700 uppercase">Pro Tip</p>
                                        <p className="text-[10px] text-indigo-900 font-medium leading-relaxed">Regularly updating your availability increases booking conversion by 40%.</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </section>
                </div>
            </div>

            {/* Drawers */}
            <SlotDrawer />
            <TimeOffDrawer />
        </div>
    );
};

export default AvailabilitySettingsPage;
