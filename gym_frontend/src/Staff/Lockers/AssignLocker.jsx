import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Calendar, FileText, CheckCircle, LogOut, ChevronRight, Hash } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { getLockers, assignLocker } from '../../api/staff/lockerApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const AssignLocker = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [formData, setFormData] = useState({
        memberName: state?.memberName || '',
        lockerId: '',
        expiryDate: '',
        notes: ''
    });

    const [availableLockers, setAvailableLockers] = useState([]);
    const members = ['Rahul Sharma', 'Vikram Malhotra', 'Sneha Gupta', 'Amit Verma', 'Alice Johnson'];

    useEffect(() => {
        const fetchLockers = async () => {
            const allLockers = await getLockers();
            const available = allLockers.filter(l => l.status.toLowerCase() === 'available');
            setAvailableLockers(available);
        };
        fetchLockers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await assignLocker(formData.lockerId, "mock-mem-id", formData.memberName);

        if (result.success) {
            alert(result.message);
            setFormData({ memberName: '', lockerId: '', expiryDate: '', notes: '' });
            const allLockers = await getLockers();
            setAvailableLockers(allLockers.filter(l => l.status === 'Available'));
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 animate-fadeIn">
            {/* Premium Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Lock size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Assign Locker
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse">
                                        Action Mode
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mt-1">Allocate a locker to a member for a specific duration</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/staff/lockers/release')}
                            className="group flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:border-violet-500 hover:text-violet-600 hover:shadow-md transition-all duration-300"
                        >
                            <LogOut size={18} className="text-slate-400 group-hover:text-violet-500 rotate-180 transition-colors" />
                            View Occupied Lockers
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="group relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/10 to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="relative z-10 p-8 space-y-8">
                        {/* Member Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                                <User size={16} className="text-violet-500" />
                                Member Name
                            </label>
                            <CustomDropdown
                                options={members}
                                value={formData.memberName}
                                onChange={(val) => handleChange({ target: { name: 'memberName', value: val } })}
                                placeholder="Select Member"
                                className="w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Locker Number */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                                    <Hash size={16} className="text-violet-500" />
                                    Locker Number
                                </label>
                                <CustomDropdown
                                    options={availableLockers.map(l => ({ value: l.id, label: l.number }))}
                                    value={formData.lockerId}
                                    onChange={(val) => handleChange({ target: { name: 'lockerId', value: val } })}
                                    placeholder="Select Locker"
                                    className="w-full"
                                />
                            </div>

                            {/* Expiry Date */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                                    <Calendar size={16} className="text-violet-500" />
                                    Expiry Date
                                </label>
                                <div className="relative group/input">
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                                <FileText size={16} className="text-violet-500" />
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                placeholder="Add any specific instructions or items stored..."
                                rows="3"
                                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 resize-none"
                                value={formData.notes}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full h-14 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-xl shadow-violet-500/40 text-lg font-bold transition-all flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <CheckCircle size={22} strokeWidth={2.5} />
                                Confirm Assignment
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignLocker;
