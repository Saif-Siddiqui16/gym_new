import React, { useState, useEffect } from 'react';
import { Download, Filter, Search, Calendar, CreditCard, DollarSign, Eye, FileText, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';
import CustomDropdown from '../../components/common/CustomDropdown';
import '../../styles/GlobalDesign.css';
import { getPaymentHistory } from '../../api/staff/paymentApi';

const PaymentHistory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterMethod, setFilterMethod] = useState('All');
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadPayments();
        setCurrentPage(1); // Reset to page 1 on filter change
    }, [filterType, filterStatus, filterMethod, searchTerm]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const filters = {
                type: filterType,
                status: filterStatus,
                method: filterMethod,
                search: searchTerm
            };
            const data = await getPaymentHistory(filters);
            setPayments(data);
        } catch (error) {
            console.error("Failed to load payments:", error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(payments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPayments = payments.slice(startIndex, startIndex + itemsPerPage);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleExportCSV = () => {
        if (payments.length === 0) {
            alert('No payments to export');
            return;
        }

        const headers = ['Trans ID', 'Member', 'Plan', 'Amount', 'Mode', 'Date', 'Status'];
        const rows = payments.map(p => [
            p.id,
            `"${p.member}"`,
            `"${p.plan}"`,
            p.amount,
            p.mode,
            p.date,
            p.status
        ].join(','));

        const csvString = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        alert('PDF Export: This feature requires a PDF library like jspdf. CSV export is fully functional!');
    };

    const handleViewDetails = (payment) => {
        alert(`Transaction Details:\nID: ${payment.id}\nMember: ${payment.member}\nAmount: ${payment.amount}\nMode: ${payment.mode}\nStatus: ${payment.status}\nDate: ${payment.date}`);
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans staffdashboard-paymenthistory">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Payment History</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage all recently collected membership payments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExportPDF} className="h-10 px-4 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                        <Download size={16} className="text-blue-500" />
                        Export PDF
                    </button>
                    <button onClick={handleExportCSV} className="h-10 px-4 bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-md">
                        <FileText size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filters Section */}
                <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Payment ID or Member Name..."
                            className="saas-input pl-10 h-11 w-full rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <CustomDropdown
                            options={['All', 'Monthly', 'Quarterly', 'Yearly', 'One-Time']}
                            value={filterType}
                            onChange={setFilterType}
                            placeholder="All Types"
                            icon={Filter}
                            className="w-40"
                        />
                        <CustomDropdown
                            options={['All', 'Paid', 'Pending', 'Failed']}
                            value={filterStatus}
                            onChange={setFilterStatus}
                            placeholder="All Status"
                            icon={Filter}
                            className="w-40"
                        />
                        <CustomDropdown
                            options={['All', 'UPI', 'Cash', 'Card', 'Net Banking']}
                            value={filterMethod}
                            onChange={setFilterMethod}
                            placeholder="All Methods"
                            icon={CreditCard}
                            className="w-40"
                        />
                    </div>
                </div>

                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Trans ID</th>
                                <th>Member</th>
                                <th className="text-center">Amount</th>
                                <th className="text-center">Mode</th>
                                <th>Date</th>
                                <th className="text-center">Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 text-blue-600">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Fetching history...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedPayments.length > 0 ? (
                                paginatedPayments.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-all duration-200 group">
                                        <td data-label="Trans ID" className="text-xs font-bold text-blue-600">{p.id}</td>
                                        <td data-label="Member">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800 tracking-tight">{p.member}</span>
                                                <span className="text-[10px] text-gray-400 font-medium uppercase">{p.plan}</span>
                                            </div>
                                        </td>
                                        <td data-label="Amount" className="text-center">
                                            <span className="text-sm font-black text-gray-900">₹{p.amount}</span>
                                        </td>
                                        <td data-label="Mode" className="text-center">
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                                                {p.mode}
                                            </span>
                                        </td>
                                        <td data-label="Date">
                                            <span className="text-xs font-semibold text-gray-500">{p.date}</span>
                                        </td>
                                        <td data-label="Status" className="text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td data-label="Actions" className="text-right">
                                            <button
                                                onClick={() => handleViewDetails(p)}
                                                className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <ArrowUpRight size={16} className="text-gray-400 group-hover:text-blue-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        No payments found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination UI */}
            <div className="mt-8 flex items-center justify-between text-xs text-gray-500 font-medium px-2">
                <p>
                    Showing {payments.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, payments.length)} of {payments.length} transactions
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 1 || loading}
                        className={`px-3 py-1 border border-gray-200 rounded hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 border rounded transition-all ${currentPage === page ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 hover:bg-white'}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages || totalPages === 0 || loading}
                        className={`px-3 py-1 border border-gray-200 rounded hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;
