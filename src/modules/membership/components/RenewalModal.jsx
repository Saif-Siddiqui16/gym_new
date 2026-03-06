import React, { useState, useEffect } from 'react';
import {
    Calendar,
    CreditCard,
    User,
    ShieldCheck,
    ChevronRight,
    Zap,
    Clock,
    CheckCircle2
} from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import { getAllPlans, renewMembership } from '../../../api/manager/managerApi';
import toast from 'react-hot-toast';

const RenewalModal = ({ isOpen, onClose, member }) => {
    const [plans, setPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [duration, setDuration] = useState(1);
    const [newExpiryDate, setNewExpiryDate] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getAllPlans();
                setPlans(data);
                if (data.length > 0 && member) {
                    const currentPlan = data.find(p => p.name === member.planName);
                    setSelectedPlanId(currentPlan?.id || data[0].id);
                }
            } catch (err) {
                console.error("Failed to load plans:", err);
            }
        };
        if (isOpen) {
            fetchPlans();
            calculateNewExpiry(duration);
        }
    }, [isOpen, member]);

    const calculateNewExpiry = (mths) => {
        const today = new Date();
        const futureDate = new Date(today.setMonth(today.getMonth() + parseInt(mths)));
        setNewExpiryDate(futureDate.toISOString().split('T')[0]);
    };

    const handleDurationChange = (e) => {
        const val = e.target.value;
        setDuration(val);
        calculateNewExpiry(val);
    };

    const handleRenewSubmit = async () => {
        if (!selectedPlanId) return toast.error("Please select a plan");
        setIsProcessing(true);
        try {
            await renewMembership({
                memberId: member.id,
                planId: selectedPlanId,
                duration: duration
            });
            setIsSuccess(true);
            toast.success("Membership renewed successfully!");
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Renewal failed:", err);
            toast.error(err.response?.data?.message || "Renewal failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    const footer = (
        <div className="flex gap-3">
            <button
                onClick={onClose}
                className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
            >
                Cancel
            </button>
            <button
                onClick={handleRenewSubmit}
                disabled={isProcessing}
                className="flex-[2] py-4 bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-amber-200 hover:shadow-amber-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>Confirm Renewal <ChevronRight size={18} /></>
                )}
            </button>
        </div>
    );

    if (isSuccess) {
        return (
            <RightDrawer isOpen={isOpen} onClose={onClose} title="Success">
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 animate-bounce">
                        <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Membership Renewed!</h3>
                    <p className="text-slate-500 font-medium">Member has been updated and moved to active status.</p>
                </div>
            </RightDrawer>
        );
    }

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Renew Membership"
            subtitle="Subscription Extension"
            footer={footer}
        >
            <div className="space-y-8">
                {/* Member Summary */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-violet-500">
                        <User size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Renewing For</p>
                        <h4 className="text-xl font-black text-slate-800 leading-none">{member?.memberName}</h4>
                    </div>
                </div>

                {/* Plan Selection */}
                <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select New Plan</label>
                    <div className="grid grid-cols-1 gap-3">
                        {plans.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedPlanId === plan.id
                                    ? 'border-violet-500 bg-violet-50/50 shadow-lg shadow-violet-100'
                                    : 'border-slate-100 bg-white hover:border-violet-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-colors ${selectedPlanId === plan.id ? 'bg-violet-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-500'
                                        }`}>
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-sm font-black ${selectedPlanId === plan.id ? 'text-violet-700' : 'text-slate-700'}`}>{plan.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Rate: ${plan.price}</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlanId === plan.id ? 'border-violet-500 bg-violet-500' : 'border-slate-200'
                                    }`}>
                                    {selectedPlanId === plan.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-scale-in" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration & Expiry */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Months)</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                className="w-full pl-11 pr-4 h-14 rounded-2xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-bold text-slate-700 bg-slate-50/50 transition-all appearance-none"
                                value={duration}
                                onChange={handleDurationChange}
                            >
                                {[1, 3, 6, 12].map(m => (
                                    <option key={m} value={m}>{m} {m === 1 ? 'Month' : 'Months'}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Expiry Date</label>
                        <div className="h-14 flex items-center gap-3 px-4 rounded-2xl bg-amber-50 border-2 border-amber-100 text-amber-700 font-black text-sm">
                            <Calendar size={18} />
                            {newExpiryDate}
                        </div>
                    </div>
                </div>

                {/* Pricing Summary */}
                {selectedPlan && (
                    <div className="p-6 rounded-3xl bg-violet-900 text-white shadow-xl shadow-violet-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <Zap size={120} strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-60">Revenue Summary</h5>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-3xl font-black italic tracking-tighter">${selectedPlan.price * duration}</p>
                                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Total Renewal Payable</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md">
                                    <CreditCard size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Prepaid</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RightDrawer>
    );
};

export default RenewalModal;
