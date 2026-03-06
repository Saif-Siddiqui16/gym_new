import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Clock } from 'lucide-react';
import { fetchPayments } from '../../api/superadmin/superAdminApi';

const Revenue = () => {
    const [revenueData, setRevenueData] = useState({
        total: '₹0',
        monthly: '₹0',
        pending: '₹0'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRevenue();
    }, []);

    const loadRevenue = async () => {
        setLoading(true);
        const payments = await fetchPayments();

        // Simplified calculation for mock purposes
        const totalNum = payments.reduce((acc, p) => acc + parseFloat(p.amount.replace(/[^0-9.-]+/g, "")), 0);
        const pendingNum = payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + parseFloat(p.amount.replace(/[^0-9.-]+/g, "")), 0);
        const monthlyNum = totalNum * 0.3; // Just a mock percentage

        setRevenueData({
            total: `₹${totalNum.toLocaleString('en-IN')}`,
            monthly: `₹${monthlyNum.toLocaleString('en-IN')}`,
            pending: `₹${pendingNum.toLocaleString('en-IN')}`
        });
        setLoading(false);
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading revenue metrics...</div>;
    }

    return (
        <div className="superadmindashboard-revenue-container p-6">
            {/* Header */}
            <h1 className="text-xl font-bold text-gray-800 mb-6">Revenue</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Revenue Card */}
                <div className="bg-blue-500 text-white shadow-lg rounded-lg p-6 transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Total Revenue</h3>
                        <DollarSign className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{revenueData.total}</p>
                    <p className="text-sm opacity-75 mt-2">All time earnings</p>
                </div>

                {/* Monthly Revenue Card */}
                <div className="bg-green-500 text-white shadow-lg rounded-lg p-6 transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Monthly Revenue</h3>
                        <TrendingUp className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{revenueData.monthly}</p>
                    <p className="text-sm opacity-75 mt-2">Current month earnings</p>
                </div>

                {/* Pending Revenue Card */}
                <div className="bg-yellow-500 text-white shadow-lg rounded-lg p-6 transform transition hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Pending Revenue</h3>
                        <Clock className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{revenueData.pending}</p>
                    <p className="text-sm opacity-75 mt-2">Awaiting collection</p>
                </div>
            </div>

            {/* Chart Placeholder */}
            <div className="superadmindashboard-revenue-chart bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h2>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Chart Placeholder</p>
                        <p className="text-sm text-gray-400 mt-1">Revenue analytics chart will be displayed here</p>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Source</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Subscriptions</span>
                            <span className="font-semibold text-gray-800">₹28,50,000</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">One-time Payments</span>
                            <span className="font-semibold text-gray-800">₹12,45,890</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Additional Services</span>
                            <span className="font-semibold text-gray-800">₹4,72,000</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Growth Metrics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Month-over-Month</span>
                            <span className="font-semibold text-green-600">+15.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Year-over-Year</span>
                            <span className="font-semibold text-green-600">+42.7%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Average per Gym</span>
                            <span className="font-semibold text-gray-800">₹45,678</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revenue;
