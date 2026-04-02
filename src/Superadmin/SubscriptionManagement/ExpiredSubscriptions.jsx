import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, Trash2 } from 'lucide-react';
import { fetchSubscriptions, toggleSubscriptionStatus } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';
import RightDrawer from '../../components/common/RightDrawer';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ExpiredSubscriptions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [subscriptionsData, setSubscriptionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const itemsPerPage = 5;
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, subId: null, loading: false });

    useEffect(() => {
        loadSubscriptions();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const loadSubscriptions = async () => {
        setLoading(true);
        const data = await fetchSubscriptions();
        // Map API data and filter for expired or due ones
        const nonActiveSubs = data.filter(s => s.status.toLowerCase() !== 'active').map(s => ({
            id: s.id,
            planName: s.plan,
            subscriberName: s.subscriber,
            gymName: s.gym,
            startDate: s.startDate,
            endDate: s.endDate,
            status: s.status.toLowerCase(),
            paymentStatus: s.paymentStatus.toLowerCase()
        }));
        setSubscriptionsData(nonActiveSubs);
        setLoading(false);
    };

    // Filter subscriptions based on search and status
    const filteredSubscriptions = subscriptionsData.filter(subscription => {
        const matchesSearch =
            subscription.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscription.subscriberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscription.gymName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscription.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const handleView = (subscription) => {
        setSelectedSubscription(subscription);
        setIsViewModalOpen(true);
    };

    const handleRenew = (subId) => {
        setConfirmModal({ isOpen: true, action: 'renew', subId, loading: false });
    };

    const handleDelete = (subId) => {
        setConfirmModal({ isOpen: true, action: 'delete', subId, loading: false });
    };

    const processConfirm = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            if (confirmModal.action === 'renew') {
                await toggleSubscriptionStatus(confirmModal.subId);
                toast.success('Subscription renewed');
                loadSubscriptions();
            } else if (confirmModal.action === 'delete') {
                toast.success('Record ' + confirmModal.subId + ' deleted (mock)');
            }
            setConfirmModal({ isOpen: false, action: null, subId: null, loading: false });
        } catch (err) {
            toast.error('Action failed');
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading subscriptions...</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Expired / Due Subscriptions</h1>
                <p className="page-subtitle">Review and manage expired or overdue subscription plans</p>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by plan, subscriber, gym, or subscription ID..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <CustomDropdown
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'expired', label: 'Expired' },
                            { value: 'due', label: 'Due for Renewal' }
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="w-[180px]"
                    />
                </div>
            </div>

            {/* Table */}
            {filteredSubscriptions.length > 0 ? (
                <>
                    <div className="saas-card !p-0 overflow-hidden">
                        <div className="saas-table-wrapper">
                            <table className="saas-table saas-table-responsive">
                                <thead>
                                    <tr>
                                        <th>Subscription ID</th>
                                        <th>Plan Name</th>
                                        <th>Subscriber</th>
                                        <th>Gym / Branch</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedSubscriptions.map((subscription) => (
                                        <tr key={subscription.id}>
                                            <td data-label="Subscription ID" className="text-primary font-medium">
                                                {subscription.id}
                                            </td>
                                            <td data-label="Plan Name" className="text-title font-medium">
                                                {subscription.planName}
                                            </td>
                                            <td data-label="Subscriber" className="text-body">{subscription.subscriberName}</td>
                                            <td data-label="Gym / Branch" className="text-body">{subscription.gymName}</td>
                                            <td data-label="Start Date" className="text-body">
                                                {new Date(subscription.startDate).toLocaleDateString('en-IN')}
                                            </td>
                                            <td data-label="End Date" className="text-body">
                                                {new Date(subscription.endDate).toLocaleDateString('en-IN')}
                                            </td>
                                            <td data-label="Status">
                                                <span
                                                    className={`status-badge ${subscription.status === 'expired' ? 'status-badge-red' : 'status-badge-yellow'}`}
                                                >
                                                    {subscription.status.charAt(0).toUpperCase() +
                                                        subscription.status.slice(1)}
                                                </span>
                                            </td>
                                            <td data-label="Payment">
                                                <span
                                                    className={`status-badge ${subscription.paymentStatus === 'paid' ? 'status-badge-green' : subscription.paymentStatus === 'pending' ? 'status-badge-yellow' : 'status-badge-red'}`}
                                                >
                                                    {subscription.paymentStatus.charAt(0).toUpperCase() +
                                                        subscription.paymentStatus.slice(1)}
                                                </span>
                                            </td>
                                            <td data-label="Actions">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="action-icon-btn success"
                                                        onClick={() => handleRenew(subscription.id)}
                                                        title="Renew"
                                                    >
                                                        <RefreshCw size={16} />
                                                    </button>
                                                    <button
                                                        className="action-icon-btn"
                                                        onClick={() => handleView(subscription)}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="action-icon-btn danger"
                                                        onClick={() => handleDelete(subscription.id)}
                                                        title="Delete"
                                                    >
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

                    {/* Pagination */}
                    <div className="pagination-wrapper">
                        <div className="pagination-info">
                            Showing <span className="font-medium text-title">{startIndex + 1}</span> to <span className="font-medium text-title">{Math.min(startIndex + itemsPerPage, filteredSubscriptions.length)}</span> of <span className="font-medium text-title">{filteredSubscriptions.length}</span> subscriptions
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    className={`pagination-num ${currentPage === index + 1 ? 'active' : ''}`}
                                    onClick={() => handlePageClick(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                className="pagination-btn"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Search size={64} />
                    </div>
                    <h3 className="empty-state-title">No Expired or Due Subscriptions Found</h3>
                    <p className="empty-state-description">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Great! All subscriptions are currently active'}
                    </p>
                </div>
            )}

            {/* Subscription Details Drawer */}
            <RightDrawer
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Subscription Details"
                subtitle={`Details for ${selectedSubscription?.id || ''}`}
                width="500px"
            >
                {selectedSubscription && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center py-6 bg-muted rounded-card border border-border">
                            <div className="h-20 w-20 rounded-full bg-primary-light text-primary flex items-center justify-center mb-3">
                                <Eye size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-title">{selectedSubscription.subscriberName}</h4>
                            <span className="text-sm text-muted-foreground font-medium">{selectedSubscription.planName}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-card border border-border">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Subscription ID</label>
                                <p className="text-sm font-medium text-title">{selectedSubscription.id}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-card border border-border">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Gym / Branch</label>
                                <p className="text-sm font-medium text-title">{selectedSubscription.gymName}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-card border border-border">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Start Date</label>
                                <p className="text-sm font-medium text-title">{new Date(selectedSubscription.startDate).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-card border border-border">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">End Date</label>
                                <p className="text-sm font-medium text-title">{new Date(selectedSubscription.endDate).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-card border border-border">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Status</label>
                                <span className={`status-badge ${selectedSubscription.status === 'expired' ? 'status-badge-red' : 'status-badge-yellow'}`}>
                                    {selectedSubscription.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="p-4 bg-muted rounded-card border border-border">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Payment</label>
                                <span className={`status-badge ${selectedSubscription.paymentStatus === 'paid' ? 'status-badge-green' : selectedSubscription.paymentStatus === 'pending' ? 'status-badge-yellow' : 'status-badge-red'}`}>
                                    {selectedSubscription.paymentStatus.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="btn btn-outline flex-1"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleRenew(selectedSubscription.id);
                                    setIsViewModalOpen(false);
                                }}
                                className="btn btn-primary flex-1"
                            >
                                Renew Now
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, action: null, subId: null, loading: false })}
                onConfirm={processConfirm}
                title={confirmModal.action === 'renew' ? 'Renew Subscription?' : 'Delete Subscription Record?'}
                message={confirmModal.action === 'renew' ? 'This will reactivate the selected subscription.' : 'This record will be permanently removed.'}
                confirmText={confirmModal.action === 'renew' ? 'Renew' : 'Delete'}
                type={confirmModal.action === 'renew' ? 'success' : 'danger'}
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default ExpiredSubscriptions;
