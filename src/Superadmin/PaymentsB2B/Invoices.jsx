import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, Filter } from 'lucide-react';
import { fetchInvoices } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const Invoices = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [invoicesData, setInvoicesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const itemsPerPage = 5;

    useEffect(() => {
        loadInvoices();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const loadInvoices = async () => {
        setLoading(true);
        const data = await fetchInvoices();
        setInvoicesData(data);
        setLoading(false);
    };

    // Filter invoices
    const filteredInvoices = invoicesData.filter(invoice => {
        const matchesSearch =
            invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.gymName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const handleView = (invoice) => {
        setSelectedInvoice(invoice);
        setIsViewModalOpen(true);
    };

    const handleDownload = (invoiceNo) => {
        // Triggering mock download as per API exportTable
        console.log('Downloading invoice:', invoiceNo);
        alert(`Initiating download for Invoice: ${invoiceNo}`);
    };

    const getStatusBadge = (status) => {
        const lowerStatus = status.toLowerCase();
        const statusClasses = {
            paid: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            overdue: 'bg-red-100 text-red-700'
        };
        const dotColors = {
            paid: '#10b981',
            pending: '#f59e0b',
            overdue: '#ef4444'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[lowerStatus] || 'bg-gray-100 text-gray-700'} transition-all duration-300 hover:scale-110 inline-flex items-center gap-1.5`}>
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: dotColors[lowerStatus] || '#6b7280' }}></span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return <div className="p-6 text-center">Loading invoices...</div>;
    }

    return (
        <div className="superadmindashboard-invoices-container p-6">
            {/* Header */}
            <h1 className="text-xl font-bold text-gray-800 mb-6">Invoices</h1>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-blue-500" />
                        <input
                            type="text"
                            placeholder="Search by invoice number or gym name..."
                            className="superadmindashboard-invoices-search w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 focus:scale-[1.02] focus:shadow-lg hover:border-blue-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 group">
                        <Filter className="text-gray-400 w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        <CustomDropdown
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'paid', label: 'Paid' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'overdue', label: 'Overdue' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="w-48 transition-all duration-300 hover:scale-105"
                        />
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th>Invoice No</th>
                                <th>Gym Name</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedInvoices.length > 0 ? (
                                paginatedInvoices.map((invoice) => (
                                    <tr key={invoice.invoiceNo} className="hover:bg-blue-50/30 hover:shadow-md hover:scale-[1.005] transition-all duration-300 cursor-pointer group">
                                        <td data-label="Invoice No">
                                            <span className="text-sm font-semibold text-blue-600 transition-all duration-300 group-hover:scale-105 group-hover:text-blue-700">
                                                {invoice.invoiceNo}
                                            </span>
                                        </td>
                                        <td data-label="Gym Name">
                                            <span className="text-sm text-gray-800 font-medium transition-colors duration-300 group-hover:text-blue-600">
                                                {invoice.gymName}
                                            </span>
                                        </td>
                                        <td data-label="Amount">
                                            <span className="text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                                                {invoice.amount}
                                            </span>
                                        </td>
                                        <td data-label="Status">
                                            {getStatusBadge(invoice.status)}
                                        </td>
                                        <td data-label="Date">
                                            <span className="text-sm text-gray-600">
                                                {new Date(invoice.date).toLocaleDateString('en-IN')}
                                            </span>
                                        </td>
                                        <td data-label="Actions" className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 hover:scale-110 hover:shadow-lg hover:-translate-y-0.5 group/btn"
                                                    onClick={() => handleView(invoice)}
                                                >
                                                    <Eye className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:scale-110" />
                                                    View
                                                </button>
                                                <button
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 hover:scale-110 hover:shadow-lg hover:-translate-y-0.5 group/btn"
                                                    onClick={() => handleDownload(invoice.invoiceNo)}
                                                >
                                                    <Download className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-y-0.5" />
                                                    Download
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="text-gray-400">
                                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p className="text-sm font-medium">No invoices found</p>
                                            <p className="text-xs mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredInvoices.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600 order-2 md:order-1">
                            Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredInvoices.length)}</span> of{' '}
                            <span className="font-semibold text-gray-900">{filteredInvoices.length}</span> invoices
                        </div>
                        <div className="flex gap-2 order-1 md:order-2 overflow-x-auto max-w-full pb-1">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 hover:scale-105 hover:shadow-md hover:-translate-y-0.5 disabled:hover:scale-100 disabled:hover:translate-y-0"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-110 ${currentPage === index + 1 ? 'bg-blue-500 text-white shadow-md hover:shadow-lg' : 'border border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-sm'}`}
                                        onClick={() => handlePageClick(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 hover:scale-105 hover:shadow-md hover:-translate-y-0.5 disabled:hover:scale-100 disabled:hover:translate-y-0"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Invoice Details Modal */}
            {isViewModalOpen && selectedInvoice && (
                <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-[1.02] sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slide-up">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start text-indigo-600 border-b border-gray-100 pb-4 mb-4">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10 transition-all duration-300 hover:scale-125 hover:rotate-12 hover:shadow-lg">
                                        <Eye size={20} />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-xl leading-6 font-bold text-gray-900">
                                            Invoice Summary
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">Details for Invoice {selectedInvoice.invoiceNo}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                        <div className="p-3 rounded-lg hover:bg-blue-50/50 transition-all duration-300">
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Gym Name</label>
                                            <p className="text-sm font-bold text-gray-900">{selectedInvoice.gymName}</p>
                                        </div>
                                        <div className="p-3 rounded-lg hover:bg-blue-50/50 transition-all duration-300">
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Status</label>
                                            <div>{getStatusBadge(selectedInvoice.status)}</div>
                                        </div>
                                        <div className="p-3 rounded-lg hover:bg-blue-50/50 transition-all duration-300">
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Invoice Date</label>
                                            <p className="text-sm font-medium text-gray-900">{new Date(selectedInvoice.date).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <div className="p-3 rounded-lg hover:bg-blue-50/50 transition-all duration-300">
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Amount Due</label>
                                            <p className="text-sm font-bold text-indigo-600">{selectedInvoice.amount}</p>
                                        </div>
                                    </div>

                                    {/* Breakdown Box */}
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Base Amount</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                ₹{(parseFloat(selectedInvoice.amount.replace(/[^0-9.-]+/g, "")) / 1.18).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">GST (18%)</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                ₹{(parseFloat(selectedInvoice.amount.replace(/[^0-9.-]+/g, "")) * 0.18 / 1.18).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-900">Total</span>
                                            <span className="text-sm font-bold text-indigo-600">{selectedInvoice.amount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => handleDownload(selectedInvoice.invoiceNo)}
                                    className="w-full inline-flex justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-base font-medium shadow-sm px-4 py-2 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:-translate-y-0.5 group/btn"
                                >
                                    <Download size={16} className="transition-transform duration-300 group-hover/btn:translate-y-0.5" />
                                    Download PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:-translate-y-0.5"
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

export default Invoices;
