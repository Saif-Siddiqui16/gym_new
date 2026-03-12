import React, { useState, useEffect } from 'react';
import { X, CheckCircle, CreditCard, User, Package } from 'lucide-react';
import Button from '../../../components/ui/Button';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';

const ConvertLeadModal = ({ isOpen, onClose, onConfirm, submitting, lead }) => {
    const { selectedBranch } = useBranchContext();
    const [plans, setPlans] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const [formData, setFormData] = useState({
        planId: '',
        trainerId: '',
        paymentMethod: 'Cash',
        referralCode: ''
    });
    const [referrerInfo, setReferrerInfo] = useState(null);
    const [verifyingCode, setVerifyingCode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.referralCode) {
                verifyReferral(formData.referralCode);
            } else {
                setReferrerInfo(null);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [formData.referralCode]);

    const verifyReferral = async (code) => {
        try {
            setVerifyingCode(true);
            const response = await apiClient.get(`/referrals/verify/${code}`);
            if (response.data.valid) {
                setReferrerInfo({ name: response.data.referrerName, valid: true });
            } else {
                setReferrerInfo({ name: 'Invalid code', valid: false });
            }
        } catch (error) {
            console.error('Verify code error:', error);
            setReferrerInfo({ name: 'Error verifying', valid: false });
        } finally {
            setVerifyingCode(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const headers = { 'x-tenant-id': selectedBranch };
            const [plansRes, trainersRes] = await Promise.all([
                apiClient.get('/admin/plans', { headers }),
                apiClient.get('/staff/team', { headers })
            ]);
            setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
            // Filter only trainers on frontend
            const allStaff = Array.isArray(trainersRes.data) ? trainersRes.data : [];
            setTrainers(allStaff.filter(s => s.role === 'TRAINER'));
        } catch (error) {
            console.error('Fetch conversion data error:', error);
        } finally {
            setLoadingData(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn text-sans">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Convert to Member</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Joining {lead?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto saas-scrollbar">
                    {/* Membership Plan */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Package size={16} className="text-primary" />
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Membership Plan *</label>
                        </div>
                        <select
                            value={formData.planId}
                            onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                        >
                            <option value="">Select a plan</option>
                            {plans.map(plan => (
                                <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price}</option>
                            ))}
                        </select>
                    </div>

                    {/* Personal Trainer */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <User size={16} className="text-primary" />
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Personal Trainer (Optional)</label>
                        </div>
                        <select
                            value={formData.trainerId}
                            onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                        >
                            <option value="">Assign a trainer (None)</option>
                            {trainers.map(trainer => (
                                <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <CreditCard size={16} className="text-primary" />
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Payment Method</label>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {['Cash', 'UPI', 'Card'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                    className={`py-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                                        formData.paymentMethod === method
                                        ? 'border-primary bg-primary-light text-primary shadow-lg shadow-violet-100 scale-105'
                                        : 'border-slate-100 text-slate-400 hover:border-violet-100 hover:bg-slate-50'
                                    }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Referral Code */}
                    <div className="space-y-4 pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2 px-1">
                            <User size={16} className="text-primary" />
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Referral Code (Optional)</label>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter member code"
                                value={formData.referralCode}
                                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                                className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-slate-700"
                            />
                            {verifyingCode && (
                                <div className="absolute right-4 top-4">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        {referrerInfo && (
                            <div className={`text-[10px] font-black uppercase tracking-widest px-1 flex items-center gap-2 ${referrerInfo.valid ? 'text-emerald-500' : 'text-rose-500'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${referrerInfo.valid ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                {referrerInfo.name}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        className="flex-1 rounded-2xl h-14 text-xs font-black uppercase tracking-widest border-2 border-slate-200"
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => onConfirm(formData)} 
                        disabled={!formData.planId || loadingData} 
                        loading={submitting}
                        className="flex-[2] bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-2xl h-14 shadow-xl shadow-emerald-200 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        Convert to Member
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConvertLeadModal;
