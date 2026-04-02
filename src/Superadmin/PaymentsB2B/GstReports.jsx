import React, { useState, useEffect } from 'react';
import { FileText, Download, Clock, CheckCircle } from 'lucide-react';
import { fetchGSTReports, exportTable } from '../../api/superadmin/superAdminApi';

const GstReports = () => {
    const [gstData, setGstData] = useState([]);
    const [summaryData, setSummaryData] = useState({
        totalCollected: '₹0',
        pending: '₹0',
        paid: '₹0'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGstReports();
    }, []);

    const loadGstReports = async () => {
        setLoading(true);
        const data = await fetchGSTReports();
        setGstData(data);

        // Calculate summary
        const totalNum = data.reduce((acc, r) => acc + parseFloat(r.gstAmount.replace(/[^0-9.-]+/g, "")), 0);
        const pendingNum = totalNum * 0.4; // Mock
        const paidNum = totalNum * 0.6; // Mock

        setSummaryData({
            totalCollected: `₹${totalNum.toLocaleString('en-IN')}`,
            pending: `₹${pendingNum.toLocaleString('en-IN')}`,
            paid: `₹${paidNum.toLocaleString('en-IN')}`
        });
        setLoading(false);
    };

    const handleExport = () => {
        exportTable('GST Reports', gstData);
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
                    <h1 className="page-title">GST Reports</h1>
                    <p className="page-subtitle">View GST collection, breakdown, and filing status</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="btn btn-primary btn-sm flex items-center gap-2"
                    >
                        <FileText size={16} />
                        Export as PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total GST Collected */}
                <div className="summary-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total GST Collected</p>
                            <p className="summary-card-value">{summaryData.totalCollected}</p>
                            <p className="summary-card-label">All collected GST</p>
                        </div>
                        <div className="summary-card-icon bg-purple-50 text-purple-600">
                            <FileText size={22} />
                        </div>
                    </div>
                </div>

                {/* GST Pending */}
                <div className="summary-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">GST Pending</p>
                            <p className="summary-card-value">{summaryData.pending}</p>
                            <p className="summary-card-label">Awaiting collection</p>
                        </div>
                        <div className="summary-card-icon bg-yellow-50 text-yellow-600">
                            <Clock size={22} />
                        </div>
                    </div>
                </div>

                {/* GST Paid */}
                <div className="summary-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">GST Paid</p>
                            <p className="summary-card-value">{summaryData.paid}</p>
                            <p className="summary-card-label">Paid to government</p>
                        </div>
                        <div className="summary-card-icon bg-green-50 text-green-600">
                            <CheckCircle size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* GST Table */}
            <div className="saas-card !p-0 overflow-hidden">
                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Invoice No</th>
                                <th>Gym Name</th>
                                <th>Amount</th>
                                <th>GST %</th>
                                <th>GST Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gstData.length > 0 ? (
                                gstData.map((record) => (
                                    <tr key={record.invoiceNo}>
                                        <td data-label="Invoice No">
                                            <span className="text-sm font-semibold text-primary">
                                                {record.invoiceNo}
                                            </span>
                                        </td>
                                        <td data-label="Gym Name">
                                            <span className="text-sm text-title font-medium">
                                                {record.gymName}
                                            </span>
                                        </td>
                                        <td data-label="Amount">
                                            <span className="text-sm font-semibold text-title">
                                                {record.amount}
                                            </span>
                                        </td>
                                        <td data-label="GST %">
                                            <span className="text-sm text-body font-medium">
                                                {record.gstPercent}
                                            </span>
                                        </td>
                                        <td data-label="GST Amount">
                                            <span className="text-sm font-bold text-primary">
                                                {record.gstAmount}
                                            </span>
                                        </td>
                                        <td data-label="Date">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(record.date).toLocaleDateString('en-IN')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                <FileText size={24} />
                                            </div>
                                            <p className="empty-state-title">No GST records found</p>
                                            <p className="empty-state-description">GST data will appear here once available</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Summary */}
                <div className="border-t border-border px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Records</p>
                            <p className="text-lg font-bold text-title">{gstData.length}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Taxable Amount</p>
                            <p className="text-lg font-bold text-title">₹1,20,150</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Total GST Amount</p>
                            <p className="text-lg font-bold text-primary">₹21,627</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="saas-card">
                    <h3 className="section-title mb-4">GST Breakdown</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-body">CGST (9%)</span>
                            <span className="font-semibold text-title">₹10,813.50</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body">SGST (9%)</span>
                            <span className="font-semibold text-title">₹10,813.50</span>
                        </div>
                        <div className="pt-3 border-t border-border flex justify-between items-center">
                            <span className="text-title font-semibold">Total GST</span>
                            <span className="font-bold text-primary">₹21,627</span>
                        </div>
                    </div>
                </div>

                <div className="saas-card">
                    <h3 className="section-title mb-4">Filing Status</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-body">Current Month</span>
                            <span className="status-badge status-badge-yellow">Pending</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body">Last Month</span>
                            <span className="status-badge status-badge-green">Filed</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body">Next Due Date</span>
                            <span className="font-semibold text-title">20 Feb 2026</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GstReports;
