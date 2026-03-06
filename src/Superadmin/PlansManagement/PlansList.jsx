import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Settings, Sparkles, Infinity, Building2, Users } from 'lucide-react';
import CustomDropdown from '../../components/common/CustomDropdown';
import MobileCard from '../../components/common/MobileCard';
import RightDrawer from '../../components/common/RightDrawer';
import PlanFormDrawer from './PlanFormDrawer';
import { fetchPlans, deletePlan } from '../../api/superadmin/superAdminApi';

const PlansList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [plansData, setPlansData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Drawer states
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const data = await fetchPlans();
            const mappedData = data.map(p => ({
                id: p.id,
                planName: p.name,
                price: parseFloat(p.price),
                billingCycle: p.period,
                activeUsers: Math.floor(Math.random() * 100),
                status: (p.status || 'inactive').toLowerCase(),
                limits: p.limits || {
                    branches: { value: 1, isUnlimited: false },
                    members: { value: 100, isUnlimited: false }
                },
                benefitsCount: (p.benefits || []).length
            }));
            setPlansData(mappedData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPlans = plansData.filter(plan => {
        const matchesSearch = plan.planName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreate = () => {
        setEditId(null);
        setIsDrawerOpen(true);
    };

    const handleEdit = (planId) => {
        setEditId(planId);
        setIsDrawerOpen(true);
    };

    const handleDelete = async (planId) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            await deletePlan(planId);
            loadPlans();
        }
    };

    const handleSuccess = () => {
        loadPlans();
        setIsDrawerOpen(false);
    };

    const formatPrice = (price) => {
        return `₹${price.toLocaleString('en-IN')}`;
    };

    const LimitBadge = ({ limit, icon: Icon }) => (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
            <Icon size={12} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase">
                {limit?.isUnlimited ? <Infinity size={14} className="text-indigo-600" /> : (limit?.value || '0')}
            </span>
        </div>
    );

    if (loading) {
        return <div className="p-6 text-center text-gray-600">Loading plans...</div>;
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 h-full w-full">
            {/* Premium Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                                <Sparkles className="text-indigo-600" size={28} />
                                SaaS Membership Plans
                            </h1>
                            <p className="text-gray-600 text-sm">Configure resource quotas and subscription tiers</p>
                        </div>
                        <button
                            className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                            onClick={handleCreate}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Plus size={20} className="relative transition-transform duration-300 group-hover:rotate-90" />
                            <span className="relative">Create New Plan</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-5 relative overflow-visible">
                <div className="flex flex-col sm:flex-row gap-4 overflow-visible">
                    <div className="relative flex-1 group">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-all duration-300" />
                        <input
                            type="text"
                            placeholder="Search plans..."
                            className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-48 relative overflow-visible">
                        <CustomDropdown
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            {filteredPlans.length > 0 ? (
                <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <table className="w-full border-separate border-spacing-0">
                        <thead className="bg-slate-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-500 tracking-widest">Plan Name</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-500 tracking-widest">Pricing</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-500 tracking-widest">Resource limits</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-500 tracking-widest">Benefits</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-500 tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPlans.map((plan) => (
                                <tr key={plan.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shadow-inner">
                                                {plan.planName.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-800 tracking-tight">{plan.planName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 text-lg">{formatPrice(plan.price)}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.billingCycle}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <LimitBadge limit={plan.limits?.branches} icon={Building2} />
                                            <LimitBadge limit={plan.limits?.members} icon={Users} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-black text-rose-600">{plan.benefitsCount}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${plan.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                            {plan.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEdit(plan.id)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:scale-110 rounded-xl transition-all shadow-sm bg-white border border-slate-100">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(plan.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:scale-110 rounded-xl transition-all shadow-sm bg-white border border-slate-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center">
                    <p className="text-gray-500">No plans found matching your criteria.</p>
                </div>
            )}

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {filteredPlans.map(plan => (
                    <MobileCard
                        key={plan.id}
                        title={plan.planName}
                        subtitle={`${formatPrice(plan.price)} / ${plan.billingCycle}`}
                        badge={{
                            label: plan.status.toUpperCase(),
                            color: plan.status === 'active' ? 'green' : 'red'
                        }}
                        actions={[
                            { label: 'Edit', icon: Edit, onClick: () => handleEdit(plan.id) },
                            { label: 'Delete', icon: Trash2, onClick: () => handleDelete(plan.id), variant: 'danger' }
                        ]}
                    />
                ))}
            </div>

            {/* Right Side Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={editId ? 'Refine Subscription Tier' : 'Establish New SaaS Tier'}
            >
                <PlanFormDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    editId={editId}
                    onSuccess={handleSuccess}
                />
            </RightDrawer>
        </div>
    );
};

export default PlansList;
