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
                    <h1 className="page-title">Revenue</h1>
                    <p className="page-subtitle">Track revenue metrics and earnings overview</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Revenue Card */}
                <div className="summary-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                            <p className="summary-card-value">{revenueData.total}</p>
                            <p className="summary-card-label">All time earnings</p>
                        </div>
                        <div className="summary-card-icon bg-purple-50 text-purple-600">
                            <DollarSign size={22} />
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue Card */}
                <div className="summary-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                            <p className="summary-card-value">{revenueData.monthly}</p>
                            <p className="summary-card-label">Current month earnings</p>
                        </div>
                        <div className="summary-card-icon bg-green-50 text-green-600">
                            <TrendingUp size={22} />
                        </div>
                    </div>
                </div>

                {/* Pending Revenue Card */}
                <div className="summary-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pending Revenue</p>
                            <p className="summary-card-value">{revenueData.pending}</p>
                            <p className="summary-card-label">Awaiting collection</p>
                        </div>
                        <div className="summary-card-icon bg-yellow-50 text-yellow-600">
                            <Clock size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Placeholder */}
            <div className="saas-card mb-6">
                <h2 className="section-title mb-4">Revenue Trend</h2>
                <div className="h-64 bg-gradient-to-br from-primary-light to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    <div className="text-center">
                        <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                        <p className="text-body font-medium">Chart Placeholder</p>
                        <p className="text-sm text-muted-foreground mt-1">Revenue analytics chart will be displayed here</p>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="saas-card">
                    <h3 className="section-title mb-4">Revenue by Source</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-body">Subscriptions</span>
                            <span className="font-semibold text-title">₹28,50,000</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body">One-time Payments</span>
                            <span className="font-semibold text-title">₹12,45,890</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body">Additional Services</span>
                            <span className="font-semibold text-title">₹4,72,000</span>
                        </div>
                    </div>
                </div>

                <div className="saas-card">
                    <h3 className="section-title mb-4">Growth Metrics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-body">Month-over-Month</span>
                            <span className="font-semibold text-green-600">+15.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body">Year-over-Year</span>
                            <span className="font-semibold text-green-600">+42.7%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-body">Average per Gym</span>
                            <span className="font-semibold text-title">₹45,678</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revenue;
