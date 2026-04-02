import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Settings, Sparkles, Infinity, Building2, Users } from 'lucide-react';
import CustomDropdown from '../../components/common/CustomDropdown';
import MobileCard from '../../components/common/MobileCard';
import RightDrawer from '../../components/common/RightDrawer';
import PlanFormDrawer from './PlanFormDrawer';
import { fetchPlans, deletePlan } from '../../api/superadmin/superAdminApi';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const PlansList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [plansData, setPlansData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Drawer states
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

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

    const handleDelete = (planId) => {
        setConfirmModal({ isOpen: true, id: planId, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deletePlan(confirmModal.id);
            toast.success('Plan deleted successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            loadPlans();
        } catch (err) {
            toast.error('Failed to delete plan');
            setConfirmModal(prev => ({ ...prev, loading: false }));
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
        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted border border-border rounded-md text-body">
            <Icon size={12} className="text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase">
                {limit?.isUnlimited ? <Infinity size={14} className="text-primary" /> : (limit?.value || '0')}
            </span>
        </div>
    );

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading plans...</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">SaaS Membership Plans</h1>
                    <p className="page-subtitle">Configure resource quotas and subscription tiers</p>
                </div>
                <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={handleCreate}
                >
                    <Plus size={20} />
                    <span>Create New Plan</span>
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="flex flex-col sm:flex-row gap-4 overflow-visible">
                    <div className="search-input-wrapper flex-1">
                        <Search size={20} className="search-input-icon" />
                        <input
                            type="text"
                            placeholder="Search plans..."
                            className="search-input"
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
                <div className="hidden md:block saas-card !p-0 overflow-hidden">
                    <div className="saas-table-wrapper">
                        <table className="saas-table">
                            <thead>
                                <tr>
                                    <th className="saas-table-th">Plan Name</th>
                                    <th className="saas-table-th">Pricing</th>
                                    <th className="saas-table-th">Resource limits</th>
                                    <th className="saas-table-th">Benefits</th>
                                    <th className="saas-table-th">Status</th>
                                    <th className="saas-table-th text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredPlans.map((plan) => (
                                    <tr key={plan.id} className="saas-table-row">
                                        <td className="saas-table-td">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold text-lg">
                                                    {plan.planName.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-title">{plan.planName}</span>
                                            </div>
                                        </td>
                                        <td className="saas-table-td">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-title text-lg">{formatPrice(plan.price)}</span>
                                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{plan.billingCycle}</span>
                                            </div>
                                        </td>
                                        <td className="saas-table-td">
                                            <div className="flex items-center gap-2">
                                                <LimitBadge limit={plan.limits?.branches} icon={Building2} />
                                                <LimitBadge limit={plan.limits?.members} icon={Users} />
                                            </div>
                                        </td>
                                        <td className="saas-table-td">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-primary">{plan.benefitsCount}</span>
                                                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Active</span>
                                            </div>
                                        </td>
                                        <td className="saas-table-td">
                                            <span className={`status-badge ${plan.status === 'active' ? 'status-badge-green' : 'status-badge-red'}`}>
                                                {plan.status}
                                            </span>
                                        </td>
                                        <td className="saas-table-td">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(plan.id)} className="action-icon-btn">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(plan.id)} className="action-icon-btn text-red-500 hover:bg-red-50">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <p className="empty-state-title">No plans found</p>
                    <p className="empty-state-description">No plans found matching your criteria.</p>
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
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Delete Plan?"
                message="This subscription plan will be permanently removed. Existing subscribers won't be affected."
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default PlansList;
