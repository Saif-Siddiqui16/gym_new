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

    const handleExportCSV = () => {
        exportTable('GST Reports CSV');
    };

    const handleExportPDF = () => {
        exportTable('GST Reports PDF');
    };

    if (loading) {
        return <div className="p-6 text-center">Loading GST reports...</div>;
    }

    return (
        <div className="superadmindashboard-gst-container p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">GST Reports</h1>

                {/* Export Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-md"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-md"
                    >
                        <FileText className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total GST Collected */}
                <div className="bg-purple-500 text-white shadow-lg rounded-lg p-6 transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Total GST Collected</h3>
                        <FileText className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{summaryData.totalCollected}</p>
                    <p className="text-sm opacity-75 mt-2">All collected GST</p>
                </div>

                {/* GST Pending */}
                <div className="bg-yellow-500 text-white shadow-lg rounded-lg p-6 transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">GST Pending</h3>
                        <Clock className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{summaryData.pending}</p>
                    <p className="text-sm opacity-75 mt-2">Awaiting collection</p>
                </div>

                {/* GST Paid */}
                <div className="bg-green-500 text-white shadow-lg rounded-lg p-6 transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">GST Paid</h3>
                        <CheckCircle className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{summaryData.paid}</p>
                    <p className="text-sm opacity-75 mt-2">Paid to government</p>
                </div>
            </div>

            {/* GST Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="superadmindashboard-gst-table w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Invoice No
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Gym Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    GST %
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    GST Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {gstData.map((record) => (
                                <tr key={record.invoiceNo} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-purple-600">
                                            {record.invoiceNo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-800 font-medium">
                                            {record.gymName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {record.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 font-medium">
                                            {record.gstPercent}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-purple-700">
                                            {record.gstAmount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">
                                            {new Date(record.date).toLocaleDateString('en-IN')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Summary */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Total Records</p>
                            <p className="text-lg font-bold text-gray-800">{gstData.length}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Total Taxable Amount</p>
                            <p className="text-lg font-bold text-gray-800">₹1,20,150</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Total GST Amount</p>
                            <p className="text-lg font-bold text-purple-700">₹21,627</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">GST Breakdown</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">CGST (9%)</span>
                            <span className="font-semibold text-gray-800">₹10,813.50</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">SGST (9%)</span>
                            <span className="font-semibold text-gray-800">₹10,813.50</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-800 font-semibold">Total GST</span>
                            <span className="font-bold text-purple-700">₹21,627</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Filing Status</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Current Month</span>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                Pending
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Last Month</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                Filed
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Next Due Date</span>
                            <span className="font-semibold text-gray-800">20 Feb 2026</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GstReports;
