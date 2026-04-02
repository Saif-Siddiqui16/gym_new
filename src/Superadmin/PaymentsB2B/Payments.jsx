import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, XCircle, Filter } from 'lucide-react';
import { fetchPayments, updatePaymentStatus } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const Payments = () => {
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentsData, setPaymentsData] = useState([]);
    const [summaryData, setSummaryData] = useState({
        total: '₹0',
        pending: '₹0',
        failed: '₹0'
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadPayments();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [paymentMethodFilter, statusFilter]);

    const loadPayments = async () => {
        setLoading(true);
        const data = await fetchPayments();
        setPaymentsData(data);

        // Calculate summary
        const sucessAmt = data.filter(p => p.status === 'Success').reduce((acc, p) => acc + parseFloat(p.amount.replace(/[^0-9.-]+/g, "")), 0);
        const pendingAmt = data.filter(p => p.status === 'Pending').reduce((acc, p) => acc + parseFloat(p.amount.replace(/[^0-9.-]+/g, "")), 0);
        const failedAmt = data.filter(p => p.status === 'Failed').reduce((acc, p) => acc + parseFloat(p.amount.replace(/[^0-9.-]+/g, "")), 0);

        setSummaryData({
            total: `₹${sucessAmt.toLocaleString('en-IN')}`,
            pending: `₹${pendingAmt.toLocaleString('en-IN')}`,
            failed: `₹${failedAmt.toLocaleString('en-IN')}`
        });
        setLoading(false);
    };

    // Filter payments
    const filteredPayments = paymentsData.filter(payment => {
        const matchesMethod = paymentMethodFilter === 'all' || payment.method === paymentMethodFilter;
        const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesMethod && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const handleUpdateStatus = async (paymentId, newStatus) => {
        await updatePaymentStatus(paymentId, newStatus);
        loadPayments();
    };

    const getStatusBadge = (status) => {
        const lowerStatus = status.toLowerCase();
        const badgeClass = {
            success: 'status-badge status-badge-green',
            pending: 'status-badge status-badge-yellow',
            failed: 'status-badge status-badge-red'
        };
        return (
            <span className={badgeClass[lowerStatus] || 'status-badge'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading...</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Payments</h1>
                    <p className="page-subtitle">Manage and track all payment transactions</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Payments */}
                <div className="summary-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                            <p className="summary-card-value">{summaryData.total}</p>
                            <p className="summary-card-label">Successfully processed</p>
                        </div>
                        <div className="summary-card-icon bg-green-50 text-green-600">
                            <CreditCard size={22} />
                        </div>
                    </div>
                </div>

                {/* Pending Payments */}
                <div className="summary-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                            <p className="summary-card-value">{summaryData.pending}</p>
                            <p className="summary-card-label">Awaiting confirmation</p>
                        </div>
                        <div className="summary-card-icon bg-yellow-50 text-yellow-600">
                            <AlertCircle size={22} />
                        </div>
                    </div>
                </div>

                {/* Failed Payments */}
                <div className="summary-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Failed Payments</p>
                            <p className="summary-card-value">{summaryData.failed}</p>
                            <p className="summary-card-label">Requires attention</p>
                        </div>
                        <div className="summary-card-icon bg-red-50 text-red-600">
                            <XCircle size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <Filter className="text-muted-foreground w-5 h-5" />

                    {/* Payment Method Filter */}
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Payment Method</label>
                        <CustomDropdown
                            options={[
                                { value: 'all', label: 'All Methods' },
                                { value: 'UPI', label: 'UPI' },
                                { value: 'Card', label: 'Card' },
                                { value: 'Bank Transfer', label: 'Bank Transfer' }
                            ]}
                            value={paymentMethodFilter}
                            onChange={setPaymentMethodFilter}
                            className="w-full"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
                        <CustomDropdown
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'success', label: 'Success' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'failed', label: 'Failed' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="saas-card !p-0 overflow-hidden">
                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>Gym Name</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPayments.length > 0 ? (
                                paginatedPayments.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td data-label="Payment ID">
                                            <span className="text-sm font-semibold text-primary">
                                                {payment.paymentId}
                                            </span>
                                        </td>
                                        <td data-label="Gym Name">
                                            <span className="text-sm text-title font-medium">
                                                {payment.gymName}
                                            </span>
                                        </td>
                                        <td data-label="Amount">
                                            <span className="text-sm font-semibold text-title">
                                                {payment.amount}
                                            </span>
                                        </td>
                                        <td data-label="Method">
                                            <span className="text-sm text-body">
                                                {payment.method}
                                            </span>
                                        </td>
                                        <td data-label="Status">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td data-label="Date">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(payment.date).toLocaleDateString('en-IN')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                <CreditCard size={24} />
                                            </div>
                                            <p className="empty-state-title">No payments found</p>
                                            <p className="empty-state-description">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {filteredPayments.length > 0 && (
                <div className="pagination-wrapper">
                    <div className="pagination-info">
                        Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredPayments.length)}</span> of{' '}
                        <span className="font-semibold">{filteredPayments.length}</span> payments
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
            )}
        </div>
    );
};

export default Payments;
