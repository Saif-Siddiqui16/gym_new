import React, { useState, useEffect } from 'react';
import { Lock, User, Calendar, FileText, CheckCircle, Hash, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';


import CustomDropdown from '../../components/common/CustomDropdown';
import RightDrawer from '../../components/common/RightDrawer';
import { getLockers, assignLocker } from '../../api/staff/lockerApi';

const LockerFormDrawer = ({ isOpen, onClose, selectedLocker, onSuccess }) => {
    const [formData, setFormData] = useState({
        memberName: '',
        lockerId: '',
        expiryDate: '',
        notes: '',
        isPaid: false,
        price: '0'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            const { getMembers } = await import('../../api/staff/memberApi');
            const data = await getMembers();
            setMembers(data);
        };
        fetchMembers();
    }, []);

    useEffect(() => {
        if (isOpen && selectedLocker) {
            setFormData(prev => ({
                ...prev,
                lockerId: selectedLocker.id,
                isPaid: selectedLocker.isPaid || false,
                price: selectedLocker.price || '500'
            }));
        }
    }, [isOpen, selectedLocker]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedMember = members.find(m => m.name === formData.memberName);
        if (!selectedMember) {
            toast.error('Please select a valid member');
            return;
        }

        setIsSubmitting(true);
        console.log('[LockerFormDrawer] Submitting Assignment:', {
            lockerId: formData.lockerId,
            memberId: selectedMember.id,
            memberName: selectedMember.name,
            isPaid: formData.isPaid,
            price: formData.price
        });
        try {
            const result = await assignLocker(formData.lockerId, selectedMember.id, selectedMember.name, formData.isPaid, formData.notes, formData.price);
            if (result.success) {
                toast.success(result.message);
                onSuccess();
                onClose();
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Locker Assignment"
            subtitle={selectedLocker ? `Locker #${selectedLocker.number}` : 'Assign Locker'}
            maxWidth="max-w-md"
            footer={
                <div className="flex gap-3 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="locker-assign-form"
                        disabled={isSubmitting}
                        className="flex-[2] px-4 py-3 bg-gradient-to-r from-primary to-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={18} />
                        {isSubmitting ? 'Processing...' : 'Save Assignment'}
                    </button>
                </div>
            }
        >
            <form id="locker-assign-form" onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1  pr-2 space-y-8 custom-scrollbar">
                    {/* Locker Info Header */}
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                                <Lock size={24} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Assigning Locker</span>
                                <h3 className="text-xl font-bold text-slate-800">Locker #{selectedLocker?.number}</h3>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            Free
                        </span>
                    </div>

                    {/* Member Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} className="text-primary" />
                            Member Selection *
                        </label>
                        <CustomDropdown
                            options={members.map(m => m.name)}
                            value={formData.memberName}
                            onChange={(val) => {
                                const member = members.find(m => m.name === val);
                                const isIncluded = Boolean(member?.plan?.includeLocker);
                                setFormData({ 
                                    ...formData, 
                                    memberName: val,
                                    isPaid: isIncluded ? false : formData.isPaid
                                });
                                if (isIncluded) {
                                    toast.success('Locker is included in this member\'s plan!');
                                }
                            }}
                            placeholder="Choose a member"
                        />
                    </div>

                    {/* Toggle Section */}
                    {(() => {
                        const member = members.find(m => m.name === formData.memberName);
                        const isIncluded = Boolean(member?.plan?.includeLocker);
                        
                        return (
                            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Billing Mode</label>
                                        <p className="text-[10px] text-slate-500 font-medium italic">
                                            {isIncluded ? 'Charges covered by membership' : 'Should this locker be billed?'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isIncluded}
                                        onClick={() => setFormData({ ...formData, isPaid: !formData.isPaid })}
                                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${formData.isPaid ? 'bg-primary' : 'bg-slate-300'} ${isIncluded ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${formData.isPaid ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {isIncluded ? (
                                    <div className="pt-3 border-t border-slate-200 flex items-center gap-2 animate-in fade-in duration-300">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <CheckCircle size={12} className="text-white" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Already Included in Plan</span>
                                            <span className="text-[10px] text-emerald-500 font-bold italic">No extra charges applicable</span>
                                        </div>
                                    </div>
                                ) : formData.isPaid && (
                                    <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Monthly Rate</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-slate-400">₹</span>
                                                <input 
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    placeholder="Rate"
                                                    className="w-24 px-3 py-1.5 bg-white border-2 border-primary/20 rounded-lg text-sm font-black text-slate-800 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-medium italic">Enter the custom monthly rate for this locker assignment.</p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Expiry Date */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={14} className="text-primary" />
                            Assignment Expiry *
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-primary transition-all"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            required
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} className="text-primary" />
                            Internal Notes
                        </label>
                        <textarea
                            rows="3"
                            placeholder="Notes about locker usage, items stored, or special requests..."
                            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-primary transition-all resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>
            </form>
        </RightDrawer>
    );
};

export default LockerFormDrawer;
