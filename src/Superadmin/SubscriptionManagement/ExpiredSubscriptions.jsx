import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, Trash2 } from 'lucide-react';
import '../SubscriptionManagement/SubscriptionManagement.css';
import { fetchSubscriptions, toggleSubscriptionStatus } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const ExpiredSubscriptions = () => {
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

    const handleRenew = async (subId) => {
        if (window.confirm('Are you sure you want to renew this subscription?')) {
            await toggleSubscriptionStatus(subId);
            loadSubscriptions();
        }
    };

    const handleDelete = async (subId) => {
        if (window.confirm('Are you sure you want to delete this subscription record?')) {
            // Mock delete: just log and alert
            console.log('Delete subscription:', subId);
            alert('Record ' + subId + ' deleted (mock)');
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading subscriptions...</div>;
    }

    return (
        <div className="expiredsub-container">
            {/* Page Header */}
            <div className="expiredsub-page-header">
                <h1 className="expiredsub-page-title">Expired / Due Subscriptions</h1>
            </div>

            {/* Filter Bar */}
            <div className="expiredsub-filter-bar">
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
                        className="group-focus-within:scale-110 group-focus-within:text-red-500"
                    />
                    <input
                        type="text"
                        placeholder="Search by plan, subscriber, gym, or subscription ID..."
                        className="expiredsub-search-input transition-all duration-300 focus:scale-[1.02] focus:shadow-lg hover:border-red-300"
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="group">
                    <CustomDropdown
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'expired', label: 'Expired' },
                            { value: 'due', label: 'Due for Renewal' }
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="w-[180px] transition-all duration-300 hover:scale-105"
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
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSubscriptions.map((subscription) => (
                                    <tr key={subscription.id} className="hover:bg-red-50/30 hover:shadow-md hover:scale-[1.005] transition-all duration-300 cursor-pointer group">
                                        <td data-label="Subscription ID" style={{ fontWeight: 500, color: '#ea5455' }} className="transition-all duration-300 group-hover:scale-105 group-hover:text-red-700">
                                            {subscription.id}
                                        </td>
                                        <td data-label="Plan Name" style={{ fontWeight: 500 }} className="transition-colors duration-300 group-hover:text-red-600">
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
                                        <td data-label="Status">
                                            <span
                                                className={`expiredsub-status-badge expiredsub-status-${subscription.status} transition-all duration-300 group-hover:scale-110`}
                                            >
                                                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ backgroundColor: subscription.status === 'expired' ? '#ef4444' : '#f59e0b' }}></span>
                                                {subscription.status.charAt(0).toUpperCase() +
                                                    subscription.status.slice(1)}
                                            </span>
                                        </td>
                                        <td data-label="Payment">
                                            <span
                                                className={`expiredsub-status-badge expiredsub-status-${subscription.paymentStatus} transition-all duration-300 group-hover:scale-110`}
                                            >
                                                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ backgroundColor: subscription.paymentStatus === 'paid' ? '#10b981' : subscription.paymentStatus === 'pending' ? '#f59e0b' : '#ef4444' }}></span>
                                                {subscription.paymentStatus.charAt(0).toUpperCase() +
                                                    subscription.paymentStatus.slice(1)}
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-md hover:-translate-y-0.5 group/btn"
                                                    onClick={() => handleRenew(subscription.id)}
                                                    title="Renew"
                                                >
                                                    <RefreshCw size={16} className="transition-transform duration-300 group-hover/btn:rotate-180" />
                                                </button>
                                                <button
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-md hover:-translate-y-0.5 group/btn"
                                                    onClick={() => handleView(subscription)}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} className="transition-transform duration-300 group-hover/btn:scale-110" />
                                                </button>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-md hover:-translate-y-0.5 group/btn"
                                                    onClick={() => handleDelete(subscription.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} className="transition-transform duration-300 group-hover/btn:rotate-12 group-hover/btn:scale-110" />
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
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 hover:scale-110 ${currentPage === index + 1 ? 'bg-indigo-600 text-white shadow-md hover:shadow-lg' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm'}`}
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
                <div className="expiredsub-empty-state">
                    <div className="expiredsub-empty-icon">
                        <Search size={64} />
                    </div>
                    <h3 className="expiredsub-empty-title">No Expired or Due Subscriptions Found</h3>
                    <p className="expiredsub-empty-description">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Great! All subscriptions are currently active'}
                    </p>
                </div>
            )}
            {/* Subscription Details Modal */}
            {isViewModalOpen && selectedSubscription && (
                <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-[1.02] sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slide-up">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start text-indigo-600">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10 transition-all duration-300 hover:scale-125 hover:rotate-12 hover:shadow-lg">
                                        <Eye size={20} />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-xl leading-6 font-bold text-gray-900">
                                            Subscription Details
                                        </h3>
                                        <div className="mt-6 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-3 rounded-lg hover:bg-red-50/50 transition-all duration-300">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscription ID</label>
                                                    <p className="text-sm font-medium text-gray-900">{selectedSubscription.id}</p>
                                                </div>
                                                <div className="p-3 rounded-lg hover:bg-red-50/50 transition-all duration-300">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan Name</label>
                                                    <p className="text-sm font-medium text-gray-900">{selectedSubscription.planName}</p>
                                                </div>
                                                <div className="p-3 rounded-lg hover:bg-red-50/50 transition-all duration-300">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscriber</label>
                                                    <p className="text-sm font-medium text-gray-900">{selectedSubscription.subscriberName}</p>
                                                </div>
                                                <div className="p-3 rounded-lg hover:bg-red-50/50 transition-all duration-300">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gym / Branch</label>
                                                    <p className="text-sm font-medium text-gray-900">{selectedSubscription.gymName}</p>
                                                </div>
                                                <div className="p-3 rounded-lg hover:bg-red-50/50 transition-all duration-300">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Date</label>
                                                    <p className="text-sm font-medium text-gray-900">{new Date(selectedSubscription.startDate).toLocaleDateString('en-IN')}</p>
                                                </div>
                                                <div className="p-3 rounded-lg hover:bg-red-50/50 transition-all duration-300">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">End Date</label>
                                                    <p className="text-sm font-medium text-gray-900">{new Date(selectedSubscription.endDate).toLocaleDateString('en-IN')}</p>
                                                </div>
                                                <div className="p-3 rounded-lg hover:bg-red-50/50 transition-all duration-300">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                                                    <div>
                                                        <span className={`expiredsub-status-badge expiredsub-status-${selectedSubscription.status} transition-all duration-300 hover:scale-110`}>
                                                            {selectedSubscription.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-lg hover:bg-red-50/50 transition-all duration-300">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment</label>
                                                    <div>
                                                        <span className={`expiredsub-status-badge expiredsub-status-${selectedSubscription.paymentStatus} transition-all duration-300 hover:scale-110`}>
                                                            {selectedSubscription.paymentStatus.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:-translate-y-0.5"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpiredSubscriptions;
