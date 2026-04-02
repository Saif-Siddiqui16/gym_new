import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchInvoices } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';
import RightDrawer from '../../components/common/RightDrawer';

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
        toast.success(`Initiating download for Invoice: ${invoiceNo}`);
        // In real app: window.open(`/api/invoices/download/${invoiceNo}`);
    };

    const getStatusBadge = (status) => {
        const lowerStatus = status.toLowerCase();
        const badgeClass = {
            paid: 'status-badge status-badge-green',
            pending: 'status-badge status-badge-yellow',
            overdue: 'status-badge status-badge-red'
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
                    <h1 className="page-title">Invoices</h1>
                    <p className="page-subtitle">View and manage all invoice records</p>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="filter-bar">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 search-input-wrapper">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by invoice number or gym name..."
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="text-muted-foreground w-5 h-5" />
                        <CustomDropdown
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'paid', label: 'Paid' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'overdue', label: 'Overdue' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="w-48"
                        />
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="saas-card !p-0 overflow-hidden">
                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Invoice No</th>
                                <th>Gym Name</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedInvoices.length > 0 ? (
                                paginatedInvoices.map((invoice) => (
                                    <tr key={invoice.invoiceNo}>
                                        <td data-label="Invoice No">
                                            <span className="text-sm font-semibold text-primary">
                                                {invoice.invoiceNo}
                                            </span>
                                        </td>
                                        <td data-label="Gym Name">
                                            <span className="text-sm text-title font-medium">
                                                {invoice.gymName}
                                            </span>
                                        </td>
                                        <td data-label="Amount">
                                            <span className="text-sm font-semibold text-title">
                                                {invoice.amount}
                                            </span>
                                        </td>
                                        <td data-label="Status">
                                            {getStatusBadge(invoice.status)}
                                        </td>
                                        <td data-label="Date">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(invoice.date).toLocaleDateString('en-IN')}
                                            </span>
                                        </td>
                                        <td data-label="Actions" className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    className="action-icon-btn"
                                                    onClick={() => handleView(invoice)}
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="action-icon-btn"
                                                    onClick={() => handleDownload(invoice.invoiceNo)}
                                                    title="Download"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                <Search size={24} />
                                            </div>
                                            <p className="empty-state-title">No invoices found</p>
                                            <p className="empty-state-description">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {filteredInvoices.length > 0 && (
                <div className="pagination-wrapper">
                    <div className="pagination-info">
                        Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredInvoices.length)}</span> of{' '}
                        <span className="font-semibold">{filteredInvoices.length}</span> invoices
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

            {/* Invoice Details Drawer */}
            <RightDrawer
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Invoice Summary"
                subtitle={selectedInvoice ? `Details for Invoice ${selectedInvoice.invoiceNo}` : ''}
                footer={
                    selectedInvoice && (
                        <div className="flex gap-3 justify-end">
                            <button
                                className="btn btn-primary btn-sm flex items-center gap-2"
                                onClick={() => handleDownload(selectedInvoice.invoiceNo)}
                            >
                                <Download size={16} />
                                Download PDF
                            </button>
                        </div>
                    )
                }
            >
                {selectedInvoice && (
                    <div className="space-y-6">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                            <div className="p-3 rounded-lg bg-primary-light/30">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Gym Name</label>
                                <p className="text-sm font-bold text-title">{selectedInvoice.gymName}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-primary-light/30">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Status</label>
                                <div>{getStatusBadge(selectedInvoice.status)}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-primary-light/30">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Invoice Date</label>
                                <p className="text-sm font-medium text-title">{new Date(selectedInvoice.date).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-primary-light/30">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Amount Due</label>
                                <p className="text-sm font-bold text-primary">{selectedInvoice.amount}</p>
                            </div>
                        </div>

                        {/* Breakdown Box */}
                        <div className="bg-primary-light/20 rounded-xl p-4 border border-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-body">Base Amount</span>
                                <span className="text-sm font-medium text-title">
                                    ₹{(parseFloat(selectedInvoice.amount.replace(/[^0-9.-]+/g, "")) / 1.18).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-body">GST (18%)</span>
                                <span className="text-sm font-medium text-title">
                                    ₹{(parseFloat(selectedInvoice.amount.replace(/[^0-9.-]+/g, "")) * 0.18 / 1.18).toFixed(2)}
                                </span>
                            </div>
                            <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
                                <span className="text-sm font-bold text-title">Total</span>
                                <span className="text-sm font-bold text-primary">{selectedInvoice.amount}</span>
                            </div>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default Invoices;
