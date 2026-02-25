import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Star, ShieldCheck, Zap, ArrowRight, Loader, PauseCircle, Play, Clock, History, User, CalendarDays } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { upgradePlan, cancelMembership, getMembershipDetails, getServiceRequests, addServiceRequest } from '../../api/member/memberApi';
import RightDrawer from '../../components/common/RightDrawer';
import ServiceRequestDrawer from '../components/ServiceRequestDrawer';
import MemberFreezeDrawer from '../components/MemberFreezeDrawer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const MyMembership = () => {
    const [loading, setLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showFreezeDrawer, setShowFreezeDrawer] = useState(false);
    const [showServiceRequest, setShowServiceRequest] = useState(false);
    const [currentPlan, setCurrentPlan] = useState('');
    const [requests, setRequests] = useState([]);
    const [membershipDetails, setMembershipDetails] = useState({
        startDate: '',
        expiryDate: '',
        status: '',
        daysRemaining: 0,
        freezeStatus: 'No'
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [details, reqs] = await Promise.all([
                    getMembershipDetails(),
                    getServiceRequests()
                ]);
                setCurrentPlan(details.currentPlan || '');
                setMembershipDetails(details);
                setRequests(reqs || []);
            } catch (error) {
                console.error("Failed to fetch membership info:", error);
            }
        };
        loadInitialData();
    }, []);

    const handleUpgrade = () => {
        setShowUpgradeModal(true);
    };

    const handleConfirmUpgrade = async () => {
        setLoading(true);
        try {
            await upgradePlan('Gold Plan');
            setCurrentPlan('Gold Plan');
            setShowUpgradeModal(false);
        } catch (error) {
            console.error('Error upgrading plan:', error);
            alert('Failed to upgrade plan.');
        } finally {
            setLoading(false);
        }
    };

    const handleFreezeSubmit = async (data) => {
        const hasPendingFreezeResult = requests.some(r => r.rawType === 'Freeze' && (r.status === 'Pending' || r.status === 'Pending Approval'));
        if (hasPendingFreezeResult) return;

        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        try {
            const newReqData = {
                type: 'Freeze Request',
                details: `${formatDate(data.startDate)} – ${formatDate(data.endDate)}`,
                status: 'Pending Approval',
                date: new Date().toISOString().split('T')[0],
                rawType: 'Freeze'
            };
            const response = await addServiceRequest(newReqData);
            setRequests([response.request, ...requests]);
        } catch (error) {
            console.error('Failed to submit freeze request', error);
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel your membership? This action cannot be undone.')) {
            setLoading(true);
            try {
                await cancelMembership();
                setCurrentPlan('Cancelled');
                alert('Membership cancelled successfully.');
            } catch (error) {
                console.error('Error cancelling membership:', error);
                alert('Failed to cancel membership.');
            } finally {
                setLoading(false);
            }
        }
    };

    const hasPendingFreeze = requests.some(r => r.rawType === 'Freeze' && (r.status === 'Pending' || r.status === 'Pending Approval'));

    return (
        <div className="p-3 md:p-8 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Membership</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage your plan, billing, and membership benefits.</p>
                </div>

                {/* Active Plan Card */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[32px] shadow-2xl shadow-violet-200 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                    <div className="p-5 md:p-10 relative z-10 text-white">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="space-y-4">
                                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/10">
                                    Active Plan
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">{currentPlan}</h2>
                                <p className="text-violet-100 font-medium max-w-sm text-lg leading-relaxed">
                                    {currentPlan === 'Gold Plan'
                                        ? "Full access to all facilities, premium classes, and exclusive recovery lounge."
                                        : "Access to all gym facilities, group classes, and locker rooms during standard hours."
                                    }
                                </p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-bold text-violet-200 uppercase tracking-widest">Next Billing</p>
                                <p className="text-2xl font-black text-white">{membershipDetails.expiryDate || 'N/A'}</p>
                                <p className="text-white/80 font-bold text-sm">
                                    ₹{membershipDetails.price?.toLocaleString()} / month
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <BenefitItem icon={CheckCircle2} label="24/7 Gym Access" dark />
                            <BenefitItem icon={CheckCircle2} label="Locker Facility" dark />
                            <BenefitItem icon={CheckCircle2} label={currentPlan.includes('Gold') ? "Unlimited Classes" : "Standard Classes"} dark />
                        </div>

                        <div className="mt-12 flex flex-wrap gap-4">
                            {currentPlan !== 'Gold Plan' && (
                                <button
                                    onClick={handleUpgrade}
                                    disabled={loading}
                                    className="px-8 py-4 bg-white text-violet-600 rounded-2xl font-black shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                                >
                                    Upgrade Plan <ArrowRight size={16} />
                                </button>
                            )}
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black hover:bg-white/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-xs backdrop-blur-md"
                            >
                                {loading ? 'Processing...' : 'Cancel Membership'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Membership Details & Service Requests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-8 space-y-6 shadow-xl shadow-slate-200/50 border-none rounded-[32px]">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Star className="text-amber-500 fill-amber-500" size={20} />
                            </div>
                            Membership Details
                        </h3>
                        <div className="space-y-4 text-sm font-bold">
                            {[
                                { label: 'Plan Name', value: currentPlan },
                                { label: 'Start Date', value: membershipDetails.startDate },
                                { label: 'Expiry Date', value: membershipDetails.expiryDate },
                                { label: 'Remaining Days', value: `${membershipDetails.daysRemaining} Days`, highlight: true },
                                { label: 'Freeze Status', value: membershipDetails.freezeStatus }
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between py-3 border-b border-slate-50 text-slate-500">
                                    <span>{item.label}</span>
                                    <span className={item.highlight ? "text-violet-600 font-black" : "text-slate-900"}>{item.value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between py-3 text-slate-500">
                                <span>Status Badge</span>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${membershipDetails.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {membershipDetails.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                            <Button
                                variant="outline"
                                className="w-full py-4 text-[10px] tracking-[0.15em] font-black"
                                onClick={() => setShowFreezeDrawer(true)}
                                disabled={hasPendingFreeze}
                            >
                                <PauseCircle size={16} /> {(hasPendingFreeze && membershipDetails.freezeStatus === 'No') ? 'FREEZE PENDING' : 'FREEZE'}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full py-4 text-[10px] tracking-[0.15em] font-black"
                                onClick={() => setShowServiceRequest(true)}
                            >
                                <Play size={16} /> SERVICE
                            </Button>
                        </div>
                    </Card>

                    <div className="space-y-8">
                        {/* New Service Requests Button Card */}
                        <Card className="p-8 space-y-6 shadow-xl shadow-slate-200/50 border-none rounded-[32px] bg-gradient-to-br from-white to-slate-50/30">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Zap size={20} />
                                </div>
                                Service Requests
                            </h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                                Perform account actions directly. Approval times vary by branch.
                            </p>
                            <Button
                                onClick={() => setShowFreezeDrawer(true)}
                                disabled={hasPendingFreeze}
                                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-lg ${hasPendingFreeze
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                                    }`}
                            >
                                <PauseCircle size={18} />
                                {hasPendingFreeze ? 'Freeze Request Pending' : 'Request Membership Freeze'}
                            </Button>
                        </Card>

                        {/* Recent Requests Section */}
                        <Card className="p-8 space-y-6 flex flex-col shadow-xl shadow-slate-200/50 border-none rounded-[32px]">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                    <History size={20} />
                                </div>
                                Recent Requests
                            </h3>
                            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                {requests.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent activity</p>
                                    </div>
                                ) : (
                                    requests.map((req) => (
                                        <div key={req.id} className="p-5 rounded-[24px] bg-slate-50/50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all">
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-900 text-[13px] tracking-tight flex items-center gap-2 uppercase">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
                                                    {req.type}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-wide pl-3.5 uppercase">
                                                    {req.details}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border ${req.status.includes('Approved') || req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    req.status.includes('Rejected') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                    {req.status === 'Pending Approval' ? 'Pending' : req.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Safety & Rules */}
                <div className="bg-slate-900 p-8 rounded-[32px] text-white flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                    <div className="space-y-4 relative z-10">
                        <h3 className="text-xl font-black flex items-center gap-2 text-indigo-300">
                            <ShieldCheck size={20} /> Safety & Rules
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-400">
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> Always carry your workout towel</li>
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> Use proper gym attire at all times</li>
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> Respect others and put back weights</li>
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> Mobile usage is restricted in workout zones</li>
                        </ul>
                    </div>
                    <button className="whitespace-nowrap bg-white/10 border border-white/20 px-6 py-3 rounded-xl text-indigo-300 text-xs font-black hover:bg-white/20 transition-all uppercase tracking-widest relative z-10">
                        Full Terms
                    </button>
                </div>
            </div>

            {/* Service Request Drawer */}
            <ServiceRequestDrawer
                isOpen={showServiceRequest}
                onClose={() => setShowServiceRequest(false)}
                onSubmit={async (data) => {
                    try {
                        const newReqData = {
                            type: data.type,
                            details: data.reason,
                            status: 'Pending',
                            date: new Date().toISOString().split('T')[0],
                            rawType: 'General'
                        };
                        const response = await addServiceRequest(newReqData);
                        setRequests([response.request, ...requests]);
                    } catch (error) {
                        console.error('Failed to submit service request', error);
                    }
                }}
            />

            {/* Member Freeze Drawer */}
            <MemberFreezeDrawer
                isOpen={showFreezeDrawer}
                onClose={() => setShowFreezeDrawer(false)}
                onSubmit={handleFreezeSubmit}
            />

            {/* Upgrade Drawer */}
            <RightDrawer
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title="Upgrade Membership"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-8">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-violet-100 text-violet-600 shadow-lg shadow-violet-100/50">
                            <Zap size={36} fill="currentColor" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-8">Level Up to Gold</h3>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed px-4">
                            Elevate your fitness journey with premium perks and dedicated training resources.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-[28px] bg-violet-50 border-2 border-violet-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em] mb-1">New Pricing</p>
                                <p className="text-xl font-black text-gray-900">₹4,999<span className="text-sm font-bold opacity-40">/mo</span></p>
                            </div>
                            <div className="px-3 py-1 bg-violet-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                                Best Value
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">What's Included</p>
                            <div className="space-y-3">
                                <BenefitHighlight text="Unlimited Group Classes" />
                                <BenefitHighlight text="Free Personal Training Session" />
                                <BenefitHighlight text="Exclusive Spa & Sauna Access" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <button
                            onClick={handleConfirmUpgrade}
                            disabled={loading}
                            className="w-full py-5 bg-violet-600 text-white rounded-[24px] font-black shadow-xl shadow-violet-200 hover:bg-violet-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : "Confirm Upgrade"}
                        </button>
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            disabled={loading}
                            className="w-full py-4 text-gray-400 font-black text-xs hover:text-gray-900 transition-colors uppercase tracking-[0.2em]"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

const BenefitHighlight = ({ text }) => (
    <div className="flex items-center gap-3 py-1">
        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={14} className="text-emerald-500" />
        </div>
        <span className="text-sm font-bold text-gray-600">{text}</span>
    </div>
);

const BenefitItem = ({ icon: Icon, label, dark }) => (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${dark ? 'bg-white/10 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
        <div className={`p-2 rounded-xl ${dark ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600'}`}>
            <Icon size={16} />
        </div>
        <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-700'}`}>{label}</span>
    </div>
);

export default MyMembership;
