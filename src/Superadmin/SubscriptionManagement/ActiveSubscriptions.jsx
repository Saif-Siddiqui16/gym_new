import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, XCircle } from 'lucide-react';
import '../SubscriptionManagement/SubscriptionManagement.css';
import { fetchSubscriptions, toggleSubscriptionStatus } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';
import RightDrawer from '../../components/common/RightDrawer';

const ActiveSubscriptions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [subscriptionsData, setSubscriptionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const itemsPerPage = 5;

    useEffect(() => {
        loadSubscriptions();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const loadSubscriptions = async () => {
        setLoading(true);
        const data = await fetchSubscriptions();
        // Map API data to component fields and filter for active ones
        const activeSubs = Array.isArray(data) ? data.filter(s => s.status?.toLowerCase() === 'active').map(s => ({
            id: s.id || '',
            planName: s.plan || 'N/A',
            subscriberName: s.subscriber || 'N/A',
            gymName: s.gym || 'N/A',
            startDate: s.startDate,
            endDate: s.endDate,
            status: s.status?.toLowerCase() || '',
            paymentStatus: s.paymentStatus?.toLowerCase() || ''
        })) : [];
        setSubscriptionsData(activeSubs);
        setLoading(false);
    };

    // Filter subscriptions based on search and payment status
    const filteredSubscriptions = subscriptionsData.filter(subscription => {
        const matchesSearch =
            (subscription.planName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (subscription.subscriberName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (subscription.gymName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (subscription.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'unpaid' ? (subscription.paymentStatus !== 'paid' && subscription.paymentStatus !== 'pending') : subscription.paymentStatus === statusFilter);
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

    const handleRenew = async (subId) => {
        if (window.confirm('Are you sure you want to renew this subscription?')) {
            // Mock renewal: toggle status twice or just log
            console.log('Renew subscription:', subId);
            alert('Renewal initiated for ' + subId);
        }
    };

    const handleCancel = async (subId) => {
        if (window.confirm('Are you sure you want to cancel this subscription?')) {
            await toggleSubscriptionStatus(subId);
            loadSubscriptions();
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading subscriptions...</div>;
    }

    return (
        <div className="activesub-container">
            {/* Page Header */}
            <div className="activesub-page-header">
                <h1 className="activesub-page-title">Active Subscriptions</h1>
            </div>

            {/* Filter Bar */}
            <div className="activesub-filter-bar">
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.3s'
                        }}
                        className="group-focus-within:scale-110 group-focus-within:text-indigo-500"
                    />
                    <input
                        type="text"
                        placeholder="Search by plan, subscriber, gym, or subscription ID..."
                        className="activesub-search-input transition-all duration-300 focus:scale-[1.02] focus:shadow-lg hover:border-indigo-300"
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="group">
                    <CustomDropdown
                        options={[
                            { value: 'all', label: 'All Payment Status' },
                            { value: 'paid', label: 'Paid' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'unpaid', label: 'Unpaid / Overdue' }
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="w-[200px] transition-all duration-300 hover:scale-105"
                    />
                </div>
            </div>

            {/* Table */}
            {filteredSubscriptions.length > 0 ? (
                <>
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
                                    <th>Payment Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSubscriptions.map((subscription) => (
                                    <tr key={subscription.id} className="hover:bg-indigo-50/30 hover:shadow-md hover:scale-[1.005] transition-all duration-300 cursor-pointer group">
                                        <td data-label="Subscription ID" style={{ fontWeight: 500, color: '#8e68e5' }} className="transition-all duration-300 group-hover:scale-105 group-hover:text-indigo-700">
                                            {subscription.id}
                                        </td>
                                        <td data-label="Plan Name" style={{ fontWeight: 500 }} className="transition-colors duration-300 group-hover:text-indigo-600">
                                            {subscription.planName}
                                        </td>
                                        <td data-label="Subscriber">{subscription.subscriberName}</td>
                                        <td data-label="Gym / Branch">{subscription.gymName}</td>
                                        <td data-label="Start Date">
                                            {new Date(subscription.startDate).toLocaleDateString('en-IN')}
                                        </td>
                                        <td data-label="End Date">
                                            {new Date(subscription.endDate).toLocaleDateString('en-IN')}
                                        </td>
                                        <td data-label="Payment Status">
                                            <span
                                                className={`activesub-status-badge activesub-status-${subscription.paymentStatus} transition-all duration-300 group-hover:scale-110`}
                                            >
                                                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ backgroundColor: subscription.paymentStatus === 'paid' ? '#10b981' : subscription.paymentStatus === 'pending' ? '#f59e0b' : '#ef4444' }}></span>
                                                {subscription.paymentStatus.charAt(0).toUpperCase() +
                                                    subscription.paymentStatus.slice(1)}
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-md hover:-translate-y-0.5 group/btn"
                                                    onClick={() => handleView(subscription)}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} className="transition-transform duration-300 group-hover/btn:scale-110" />
                                                </button>
                                                <button
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-md hover:-translate-y-0.5 group/btn"
                                                    onClick={() => handleRenew(subscription.id)}
                                                    title="Renew"
                                                >
                                                    <RefreshCw size={16} className="transition-transform duration-300 group-hover/btn:rotate-180" />
                                                </button>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-md hover:-translate-y-0.5 group/btn"
                                                    onClick={() => handleCancel(subscription.id)}
                                                    title="Cancel"
                                                >
                                                    <XCircle size={16} className="transition-transform duration-300 group-hover/btn:rotate-90 group-hover/btn:scale-110" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 pb-4">
                        <div className="text-sm text-gray-500 order-2 md:order-1">
                            Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{Math.min(startIndex + itemsPerPage, filteredSubscriptions.length)}</span> of <span className="font-medium text-gray-900">{filteredSubscriptions.length}</span> subscriptions
                        </div>
                        <div className="flex items-center gap-2 order-1 md:order-2 overflow-x-auto max-w-full pb-1">
                            <button
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-md hover:-translate-y-0.5 disabled:hover:scale-100 disabled:hover:translate-y-0"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 hover:scale-110 ${currentPage === index + 1
                                            ? 'bg-indigo-600 text-white shadow-md hover:shadow-lg'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                                            }`}
                                        onClick={() => handlePageClick(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-md hover:-translate-y-0.5 disabled:hover:scale-100 disabled:hover:translate-y-0"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="activesub-empty-state">
                    <div className="activesub-empty-icon">
                        <Search size={64} />
                    </div>
                    <h3 className="activesub-empty-title">No Active Subscriptions Found</h3>
                    <p className="activesub-empty-description">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'There are currently no active subscriptions'}
                    </p>
                </div>
            )}
            {/* Subscription Details Modal */}
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
                        <div className="flex flex-col items-center py-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                            <div className="h-20 w-20 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-md mb-3">
                                <Eye size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">{selectedSubscription.subscriberName}</h4>
                            <span className="text-sm text-gray-500 font-medium">{selectedSubscription.planName}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Gym / Branch</label>
                                <p className="text-sm font-bold text-gray-900">{selectedSubscription.gymName}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Payment Status</label>
                                <span className={`activesub-status-badge activesub-status-${selectedSubscription.paymentStatus}`}>
                                    {selectedSubscription.paymentStatus.toUpperCase()}
                                </span>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Start Date</label>
                                <p className="text-sm font-bold text-gray-900">{new Date(selectedSubscription.startDate).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">End Date</label>
                                <p className="text-sm font-bold text-gray-900">{new Date(selectedSubscription.endDate).toLocaleDateString('en-IN')}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Subscription ID</label>
                            <p className="text-sm font-mono text-gray-600">{selectedSubscription.id}</p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleRenew(selectedSubscription.id);
                                    setIsViewModalOpen(false);
                                }}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                            >
                                Renew Now
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default ActiveSubscriptions;
