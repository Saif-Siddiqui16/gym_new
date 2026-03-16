import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, PauseCircle, PlayCircle, User, Mail, Phone, Calendar, Gift, Sparkles, CreditCard } from 'lucide-react';
import { membershipApi } from '../../../api/membershipApi';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import BenefitsList from '../components/BenefitsList';
import FreezeDrawer from '../components/FreezeDrawer';
import GiftDaysDrawer from '../components/GiftDaysDrawer';

const MembershipDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemberDetails = async () => {
            try {
                setLoading(true);
                const data = await membershipApi.getMemberById(id);
                // Transform API data to match UI expectations if necessary
                // Backend returns: { id, memberId, name, email, phone, status, joinDate, expiryDate, ... }
                // UI expects: { memberName, memberId, email, phone, gender, joinDate, planName, startDate, endDate, durationMonths, benefits, hasFaceId }
                // We might need a transformer here or update the UI to use the backend field names.
                // Let's map it here to be safe and minimize UI changes for now.
                const mappedData = {
                    ...data,
                    memberName: data.name,
                    planName: data.plan?.name || 'No Plan Active',
                    joinDate: data.joinDate ? new Date(data.joinDate).toLocaleDateString('en-GB') : 'N/A',
                    startDate: data.joinDate ? new Date(data.joinDate).toLocaleDateString('en-GB') : 'N/A',
                    endDate: data.expiryDate ? new Date(data.expiryDate).toLocaleDateString('en-GB') : 'N/A',
                    durationText: data.plan ? `${data.plan.duration} ${data.plan.durationType || 'Months'}` : 'N/A',
                    benefits: data.benefits || [],
                    hasFaceId: !!data.avatar
                };
                setMembership(mappedData);
            } catch (error) {
                console.error('Error fetching member details:', error);
                toast.error('Failed to load member details');
                navigate('/memberships');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMemberDetails();
        }
    }, [id, navigate]);

    // Modal States
    const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!membership) {
        return <div className="p-6 text-center text-muted">Membership not found.</div>;
    }

    const isFrozen = membership.status === 'Frozen';

    const handleFreeze = async ({ duration, reason, isChargeable }) => {
        try {
            await membershipApi.freezeMember(id, { duration, reason, isChargeable });
            toast.success('Membership frozen successfully');
            // Re-fetch data
            const updatedData = await membershipApi.getMemberById(id);
            setMembership(prev => ({
                ...prev,
                ...updatedData,
                status: 'Frozen',
                endDate: updatedData.expiryDate ? new Date(updatedData.expiryDate).toLocaleDateString() : prev.endDate
            }));
        } catch (error) {
            toast.error('Failed to freeze membership');
        }
    };

    const handleUnfreeze = async () => {
        try {
            await membershipApi.unfreezeMember(id);
            toast.success('Membership resumed successfully');
            setMembership(prev => ({ ...prev, status: 'Active' }));
        } catch (error) {
            toast.error('Failed to resume membership');
        }
    };

    const handleGift = async ({ days, note }) => {
        try {
            await membershipApi.giftDays(id, { days, note });
            toast.success(`Successfully added ${days} complimentary days`);
            // Re-fetch data or update local state
            const updatedData = await membershipApi.getMemberById(id);
            setMembership(prev => ({
                ...prev,
                ...updatedData,
                endDate: updatedData.expiryDate ? new Date(updatedData.expiryDate).toLocaleDateString() : prev.endDate,
                medicalHistory: updatedData.medicalHistory
            }));
        } catch (error) {
            toast.error('Failed to add gift days');
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('Selected file:', file.name);
            toast.success(`Face ID updated: ${file.name}`);
        }
    };

    return (
        <div className="min-h-screen ">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => navigate('/memberships')}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 hover:from-violet-100 hover:to-purple-100 flex items-center justify-center text-slate-600 hover:text-primary shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 flex-shrink-0"
                            >
                                <ArrowLeft size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                            </button>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent truncate">
                                    Membership Details
                                </h1>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">ID: {membership.id}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setIsGiftModalOpen(true)}
                                className="group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-pink-500/50 hover:shadow-xl hover:shadow-pink-500/60 hover:scale-105 transition-all w-full sm:w-auto"
                            >
                                <Gift size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                                Gift Days
                            </button>
                            <button
                                onClick={isFrozen ? handleUnfreeze : () => setIsFreezeModalOpen(true)}
                                className="group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-violet-300 hover:text-primary rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all w-full sm:w-auto"
                            >
                                {isFrozen ? (
                                    <PlayCircle size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px] transition-all duration-300 group-hover:scale-110" />
                                ) : (
                                    <PauseCircle size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px] transition-all duration-300 group-hover:scale-110" />
                                )}
                                {isFrozen ? 'Resume' : 'Freeze'}
                            </button>
                            <button
                                onClick={() => navigate(`/memberships/${membership.id}/edit`)}
                                className="group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-primary text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-xl shadow-primary/30/50 hover:shadow-2xl hover:shadow-primary/30/60 hover:scale-105 transition-all w-full sm:w-auto"
                            >
                                <Edit2 size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                                Edit Membership
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Member Info Card */}
                <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-light/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-primary shadow-md flex-shrink-0">
                                <User size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">Member Information</h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {/* Member Avatar & Name */}
                            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100">
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg">
                                        <User size={24} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white flex items-center justify-center">
                                        <Sparkles size={10} className="sm:w-3 sm:h-3 text-white" />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <div className="font-black text-slate-900 text-base sm:text-lg truncate">{membership.memberName}</div>
                                    <div className="text-xs sm:text-sm text-slate-500 font-semibold truncate">Member ID: {membership.memberId}</div>
                                </div>
                            </div>

                            {/* Info Rows */}
                            <div className="space-y-3">
                                <InfoRow icon={Mail} label="Email" value={membership.email} />
                                <InfoRow icon={Phone} label="Phone" value={membership.phone} />
                                <InfoRow icon={User} label="Gender" value={membership.gender} />
                                <InfoRow icon={Calendar} label="Join Date" value={membership.joinDate} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plan Details Card */}
                <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-light/50 to-primary-light/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-100 to-violet-100 flex items-center justify-center text-primary shadow-md flex-shrink-0">
                                <CreditCard size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">Plan Details</h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {/* Plan Name & Status */}
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                    <div className="text-xs sm:text-sm text-slate-500 font-semibold mb-1">Current Plan</div>
                                    <div className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent truncate">
                                        {membership.planName}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <StatusBadge status={membership.status} />
                                </div>
                            </div>

                            {/* Date Info */}
                            <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-100 space-y-2 sm:space-y-3">
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-xs sm:text-sm text-slate-600 font-bold">Start Date</span>
                                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-lg text-xs sm:text-sm font-black border border-emerald-200 whitespace-nowrap">
                                        {membership.startDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-xs sm:text-sm text-slate-600 font-bold">End Date</span>
                                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-lg text-xs sm:text-sm font-black border border-red-200 whitespace-nowrap">
                                        {membership.endDate}
                                    </span>
                                </div>
                            </div>

                            {/* Duration Badge */}
                            <div className="text-center">
                                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary to-primary text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-black shadow-lg">
                                    <Calendar size={14} className="sm:w-4 sm:h-4" />
                                    Duration: {membership.durationText}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Biometric Access */}
            <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden mb-4 sm:mb-6">
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-light/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-primary shadow-md flex-shrink-0">
                            <User size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">Biometric Access</h3>
                    </div>

                    <div
                        onClick={handleUploadClick}
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-50 to-white border-2 border-dashed border-slate-200 hover:border-violet-300 transition-all duration-300 cursor-pointer group/biometric"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-purple-500 flex items-center justify-center text-white shadow-xl group-hover/biometric:scale-110 transition-transform duration-300">
                                    <User size={28} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
                                </div>
                                {membership.hasFaceId && (
                                    <div className="absolute -top-1 -right-1">
                                        <span className="relative flex h-3.5 w-3.5 sm:h-4 sm:w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 border-2 border-white"></span>
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="font-black text-slate-900 text-sm sm:text-base group-hover/biometric:text-primary transition-colors">Face ID Avatar</div>
                                <div className={`text-xs sm:text-sm font-semibold ${membership.hasFaceId ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    {membership.hasFaceId ? 'Registered & Active' : 'Not setup yet'}
                                </div>
                            </div>
                        </div>
                        <button className="group/btn px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-primary text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover:scale-105 transition-all w-full sm:w-auto">
                            <span className="flex items-center justify-center gap-2">
                                {membership.hasFaceId ? 'Update Photo' : 'Upload Photo'}
                                <Sparkles size={14} className="sm:w-4 sm:h-4 transition-all duration-300 group-hover/btn:rotate-12" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Benefits Card */}
            <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-600 shadow-md flex-shrink-0">
                            <Sparkles size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">Included Benefits</h3>
                            <span className="px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-primary to-primary text-white text-[9px] sm:text-[10px] font-black rounded-md shadow-sm animate-pulse whitespace-nowrap flex-shrink-0">
                                PREMIUM ✨
                            </span>
                        </div>
                    </div>
                    <BenefitsList benefitIds={membership.benefits} layout="grid" />
                </div>
            </div>

            {/* Medical & Onboarding Card */}
            <div className={`group relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden mt-6 ${membership.medicalHistory || membership.fitnessGoal ? 'opacity-100' : 'opacity-80'}`}>
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-primary shadow-md flex-shrink-0">
                            <Sparkles size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">Medical & Onboarding</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Medical History</h4>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm min-h-[100px]">
                                    {membership.medicalHistory || 'No medical history reported.'}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Fitness Goal</h4>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-light to-purple-50 text-primary-hover rounded-lg border border-violet-100 font-bold text-sm">
                                    <Sparkles size={14} />
                                    {membership.fitnessGoal || 'Not specified'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Emergency Contact</h4>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 space-y-3">
                                <InfoRow icon={User} label="Name" value={membership.emergencyName || 'N/A'} />
                                <InfoRow icon={Phone} label="Phone" value={membership.emergencyPhone || 'N/A'} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase History Card */}
            <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden mt-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 shadow-md flex-shrink-0">
                                <ShoppingBag size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">Purchase History</h3>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                            {membership.storeOrders?.length || 0} Orders
                        </span>
                    </div>

                    {membership.storeOrders && membership.storeOrders.length > 0 ? (
                        <div className="space-y-4">
                            {membership.storeOrders.map((order) => (
                                <div key={order.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group/order">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/order:text-primary transition-colors">
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 uppercase tracking-tight">Order #{order.id}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4">
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Payment</div>
                                                <div className="text-xs font-black text-slate-700">{order.paymentMode}</div>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total</div>
                                                <div className="text-base font-black text-primary">₹{order.total}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                <span className="text-primary">{item.quantity}x</span>
                                                <span className="truncate max-w-[150px]">{item.product?.name || 'Product'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                <ShoppingBag size={32} />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No purchases recorded yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <FreezeDrawer
                isOpen={isFreezeModalOpen}
                onClose={() => setIsFreezeModalOpen(false)}
                onFreeze={handleFreeze}
                memberName={membership.memberName}
            />
            <GiftDaysDrawer
                isOpen={isGiftModalOpen}
                onClose={() => setIsGiftModalOpen(false)}
                memberName={membership.memberName}
                onGift={handleGift}
            />
        </div>
    );
};

// Enhanced Info Row Component
const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="group/row flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-all duration-200">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-primary transition-all duration-300 group-hover/row:scale-110">
                <Icon size={16} strokeWidth={2.5} />
            </div>
            <span className="text-sm text-slate-600 font-semibold">{label}</span>
        </div>
        <div className="font-bold text-sm text-slate-900">{value}</div>
    </div>
);

export default MembershipDetails;
