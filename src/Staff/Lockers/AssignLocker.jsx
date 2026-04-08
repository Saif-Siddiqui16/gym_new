import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Calendar, FileText, CheckCircle, LogOut, ChevronRight, Hash } from 'lucide-react';
import { getLockers, assignLocker } from '../../api/staff/lockerApi';
import { getMembers } from '../../api/staff/memberApi';
import CustomDropdown from '../../components/common/CustomDropdown';
import { toast } from 'react-hot-toast';

const AssignLocker = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [formData, setFormData] = useState({
        memberName: state?.memberName || '',
        memberId: state?.memberId || '',
        lockerId: '',
        expiryDate: '',
        notes: ''
    });

    const [availableLockers, setAvailableLockers] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [isLockerIncluded, setIsLockerIncluded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lockers, membersList] = await Promise.all([
                    getLockers(),
                    getMembers()
                ]);
                
                const available = lockers.filter(l => l.status.toLowerCase() === 'available');
                setAvailableLockers(available);
                setAllMembers(membersList);

                // If member passed from state, check their plan
                if (state?.memberId) {
                    const member = membersList.find(m => m.id === state.memberId);
                    if (member?.plan?.includeLocker) {
                        setIsLockerIncluded(true);
                    }
                }
            } catch (err) {
                console.error('Fetch error:', err);
                toast.error('Failed to fetch data');
            }
        };
        fetchData();
    }, [state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'memberId') {
            const member = allMembers.find(m => String(m.id) === String(value));
            setFormData(prev => ({ ...prev, memberName: member?.name || '' }));
            setIsLockerIncluded(member?.plan?.includeLocker || false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.memberId || !formData.lockerId) {
            toast.error('Please select both a member and a locker');
            return;
        }

        const result = await assignLocker(formData.lockerId, formData.memberId, formData.memberName);

        if (result.success) {
            toast.success(result.message);
            setFormData({ memberName: '', memberId: '', lockerId: '', expiryDate: '', notes: '' });
            setIsLockerIncluded(false);
            const allLockers = await getLockers();
            setAvailableLockers(allLockers.filter(l => l.status.toLowerCase() === 'available'));
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen animate-fadeIn">
            {/* Premium Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Lock size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">
                                        Assign Locker
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-primary to-primary text-white text-[10px] font-black rounded-md shadow-sm animate-pulse">
                                        Action Mode
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mt-1">Allocate a locker to a member for a specific duration</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/staff/lockers/release')}
                            className="group flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:border-primary hover:text-primary hover:shadow-md transition-all duration-300"
                        >
                            <LogOut size={18} className="text-slate-400 group-hover:text-primary rotate-180 transition-colors" />
                            View Occupied Lockers
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="group relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-light/10 to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                        {/* Member Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                                <User size={16} className="text-primary" />
                                Member Name
                            </label>
                            <CustomDropdown
                                options={allMembers.map(m => ({ value: m.id, label: `${m.name} (${m.memberId})` }))}
                                value={formData.memberId}
                                onChange={(val) => handleChange({ target: { name: 'memberId', value: val } })}
                                placeholder="Select Member"
                                className="w-full"
                            />
                            {isLockerIncluded && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 animate-fadeIn">
                                    <CheckCircle size={16} />
                                    Locker already included in this member's plan
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Locker Number */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                                    <Hash size={16} className="text-primary" />
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
                                    <Calendar size={16} className="text-primary" />
                                    Expiry Date
                                </label>
                                <div className="relative group/input">
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
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
                                <FileText size={16} className="text-primary" />
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                placeholder="Add any specific instructions or items stored..."
                                rows="3"
                                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 resize-none"
                                value={formData.notes}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full h-14 bg-gradient-to-r from-primary to-primary text-white rounded-xl shadow-xl shadow-primary/30/40 text-lg font-bold transition-all flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30/50 hover:scale-[1.02] active:scale-[0.98]"
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
