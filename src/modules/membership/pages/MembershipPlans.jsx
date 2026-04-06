import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle2, Crown, Sparkles, LayoutGrid, List as ListIcon, Users } from 'lucide-react';
import CreateMembershipPlanDrawer from '../components/CreateMembershipPlanDrawer';
import { membershipApi } from '../../../api/membershipApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import amenityApi from '../../../api/amenityApi';
import Loader from '../../../components/common/Loader';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: '#FFF', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    btn: { height: '48px', padding: '0 24px', borderRadius: '14px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

const MembershipPlans = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });
    const [amenities, setAmenities] = useState([]);

    const { selectedBranch } = useBranchContext();

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (selectedBranch && selectedBranch !== 'all') {
                params.branchId = selectedBranch;
            }
            const [plansData, amenitiesData] = await Promise.all([
                membershipApi.getPlans(params),
                amenityApi.getAll()
            ]);
            setPlans(plansData);
            setAmenities(amenitiesData);
        } catch (error) {
            toast.error('Failed to fetch plans data');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchPlans();
    }, [selectedBranch]);

    const handleSavePlan = async (planData) => {
        try {
            const payload = { ...planData };

            if (!selectedBranch || selectedBranch === 'all') {
                payload.branchId = 'all';
            } else {
                payload.branchId = selectedBranch;
            }

            if (editingPlan) {
                await membershipApi.updatePlan(editingPlan.id, payload);
                toast.success('Plan updated successfully');
            } else {
                await membershipApi.createPlan(payload);
                if (!selectedBranch || selectedBranch === 'all') {
                    toast.success('Plan created for all branches!');
                } else {
                    toast.success('Plan created successfully');
                }
            }
            fetchPlans();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setIsCreateDrawerOpen(true);
    };

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await membershipApi.deletePlan(confirmModal.id);
            toast.success('Plan deleted successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchPlans();
        } catch (error) {
            toast.error('Failed to delete plan');
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const openCreate = () => {
        setEditingPlan(null);
        setIsCreateDrawerOpen(true);
    };

    const filteredPlans = plans.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                     <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>Membership Plans</h1>
                     <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Design, manage, and optimize your membership tiers</p>
                </div>
                <button onClick={openCreate} style={{ ...S.btn, background: T.accent, color: '#FFF' }}><Plus size={18} /> Create Plan</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: T.accent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Crown size={24} /></div>
                    <div><p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0 }}>Active Plans</p><h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>{plans.length}</h2></div>
                </div>
                <div style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: T.success, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24} /></div>
                    <div><p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0 }}>Active Members</p><h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>{plans.reduce((acc, p) => acc + (p.memberCount || 0), 0)}</h2></div>
                </div>
                <div style={{ ...S.card, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#2563EB', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={24} /></div>
                    <div><p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', margin: 0 }}>Avg Plan Price</p><h2 style={{ fontSize: '24px', fontWeight: '900', color: T.text, margin: 0 }}>₹{plans.length > 0 ? Math.round(plans.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0) / plans.length).toLocaleString() : 0}</h2></div>
                </div>
            </div>

            {/* 📋 STEP 3: PLANS LIST */}
            {isLoading ? (
                <div style={{ padding: '100px 0' }}><Loader message="Loading Plans Architecture..." /></div>
            ) : filteredPlans.length === 0 ? (
                <div style={{ padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><LayoutGrid size={48} color={T.subtle} /><p style={{ fontSize: '14px', fontWeight: '800', color: T.subtle, marginTop: '12px', margin: 0 }}>No plans found in this logic</p></div>
            ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    {filteredPlans.map(plan => (
                        <div key={plan.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col overflow-hidden">

                            {/* Card Top */}
                            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 pr-2">
                                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">{plan.name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{plan.description || 'No description'}</p>
                                    </div>
                                    <button onClick={() => handleDelete(plan.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                {plan.branch && plan.branch !== '—' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/8 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                                        📍 {plan.branch}
                                    </span>
                                )}
                                {/* Price */}
                                <div className="flex items-end gap-2 mt-3">
                                    <span className="text-3xl font-black text-slate-900">₹{plan.price.toLocaleString()}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{plan.duration} {plan.durationType}</span>
                                    {plan.status === 'Inactive' && (
                                        <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-full">Inactive</span>
                                    )}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-5 pt-4 pb-5 flex flex-col flex-1">

                                {/* Badges */}
                                <div className="flex flex-wrap gap-1.5 mb-4 min-h-[22px]">
                                    {plan.allowTransfer && (
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-100">Transferable</span>
                                    )}
                                    {plan.includeLocker && (
                                        <span className="px-2 py-0.5 bg-cyan-50 text-cyan-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-cyan-100">Locker Included</span>
                                    )}
                                    {!plan.showInPurchase && (
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-wider rounded-md">Hidden App</span>
                                    )}
                                    {!plan.showOnDashboard && (
                                        <span className="px-2 py-0.5 bg-orange-50 text-orange-400 text-[9px] font-black uppercase tracking-wider rounded-md border border-orange-100">Hidden Dashboard</span>
                                    )}
                                </div>

                                {/* Benefits */}
                                {plan.benefits && plan.benefits.length > 0 && (
                                    <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Included Benefits</p>
                                        <ul className="space-y-1.5">
                                            {plan.benefits.map((benefit, idx) => {
                                                const flexAmenity = amenities.find(a => a.id === benefit.id);
                                                return (
                                                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                                                        <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                            <CheckCircle2 size={10} className="text-primary" />
                                                        </span>
                                                        {flexAmenity ? flexAmenity.name : 'Benefit'}
                                                        {benefit.limit && benefit.limit !== 'Unlimited' && (
                                                            <span className="ml-auto text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{benefit.limit}x</span>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-2 mb-5 mt-auto">
                                    <div className="flex flex-col items-center py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Usage</p>
                                        <p className="text-xs font-black text-slate-800">Unlimited</p>
                                    </div>
                                    <div className="flex flex-col items-center py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Members</p>
                                        <p className="text-xs font-black text-slate-800">{plan.memberCount || 0}</p>
                                    </div>
                                    <div className="flex flex-col items-center py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Freeze</p>
                                        <p className="text-xs font-black text-slate-800">{plan.cancellationWindow ? `${plan.cancellationWindow}d` : 'None'}</p>
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <button
                                    onClick={() => handleEdit(plan)}
                                    className="w-full h-10 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary-hover transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={13} />
                                    Edit Plan
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateMembershipPlanDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
                onSave={handleSavePlan}
                initialData={editingPlan}
            />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Delete Plan?"
                message="This membership plan will be permanently removed."
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default MembershipPlans;
