import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, XCircle, Filter } from 'lucide-react';
import { fetchPayments, updatePaymentStatus } from '../../api/superadmin/superAdminApi';
import './TailwindFallback.css';
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
        const statusClasses = {
            success: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            failed: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[lowerStatus] || 'bg-gray-100 text-gray-700'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return <div className="p-6 text-center">Loading payments...</div>;
    }

    return (
        <div className="superadmindashboard-payments-container p-6">
            {/* Header */}
            <h1 className="text-xl font-bold text-gray-800 mb-6">Payments</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Payments */}
                <div className="bg-green-500 text-white shadow-lg rounded-lg p-6 transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Total Payments</h3>
                        <CreditCard className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{summaryData.total}</p>
                    <p className="text-sm opacity-75 mt-2">Successfully processed</p>
                </div>

                {/* Pending Payments */}
                <div className="bg-yellow-500 text-white shadow-lg rounded-lg p-6 transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Pending Payments</h3>
                        <AlertCircle className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{summaryData.pending}</p>
                    <p className="text-sm opacity-75 mt-2">Awaiting confirmation</p>
                </div>

                {/* Failed Payments */}
                <div className="bg-red-500 text-white shadow-lg rounded-lg p-6 transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Failed Payments</h3>
                        <XCircle className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{summaryData.failed}</p>
                    <p className="text-sm opacity-75 mt-2">Requires attention</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <Filter className="text-gray-400 w-5 h-5" />

                    {/* Payment Method Filter */}
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Method</label>
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
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
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
            <div className="saas-table-wrapper">
                <table className="saas-table saas-table-responsive w-full">
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
                                        <span className="text-sm font-semibold text-blue-600">
                                            {payment.paymentId}
                                        </span>
                                    </td>
                                    <td data-label="Gym Name">
                                        <span className="text-sm text-gray-800 font-medium">
                                            {payment.gymName}
                                        </span>
                                    </td>
                                    <td data-label="Amount">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {payment.amount}
                                        </span>
                                    </td>
                                    <td data-label="Method">
                                        <span className="text-sm text-gray-600">
                                            {payment.method}
                                        </span>
                                    </td>
                                    <td data-label="Status">
                                        {getStatusBadge(payment.status)}
                                    </td>
                                    <td data-label="Date">
                                        <span className="text-sm text-gray-600">
                                            {new Date(payment.date).toLocaleDateString('en-IN')}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="text-gray-400">
                                        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm font-medium">No payments found</p>
                                        <p className="text-xs mt-1">Try adjusting your filters</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredPayments.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between mt-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredPayments.length)}</span> of{' '}
                        <span className="font-semibold">{filteredPayments.length}</span> payments
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                onClick={() => handlePageClick(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
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
