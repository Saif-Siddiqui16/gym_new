import React, { useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import CustomDropdown from '../../components/common/CustomDropdown';

const AddBookingDrawer = ({ isOpen, onClose, onCreate, members, classes }) => {
    const [newBooking, setNewBooking] = useState({
        memberId: '',
        classId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Upcoming'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newBooking.memberId) {
            alert('Please select a member');
            return;
        }
        if (!newBooking.classId) {
            alert('Please select a class');
            return;
        }
        if (!newBooking.date) {
            alert('Please select a date');
            return;
        }
        onCreate(newBooking);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <CalendarIcon size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Create New Booking</h3>
                        <p className="text-slate-500 text-xs font-medium">Schedule a class or session</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select Member</label>
                    <CustomDropdown
                        options={members.map(m => ({ value: m.id, label: `${m.name} (${m.memberId})` }))}
                        value={newBooking.memberId}
                        onChange={(val) => setNewBooking({ ...newBooking, memberId: val })}
                        placeholder="Select Member"
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select Class</label>
                        <CustomDropdown
                            options={classes.map(c => ({ value: c.id, label: `${c.name} (${c.trainerName})` }))}
                            value={newBooking.classId}
                            onChange={(val) => setNewBooking({ ...newBooking, classId: val })}
                            placeholder="Select Class"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Date</label>
                        <input
                            required
                            type="date"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                            value={newBooking.date}
                            onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-white border-2 border-slate-200 hover:border-slate-300 transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300"
                    >
                        Create Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBookingDrawer;
