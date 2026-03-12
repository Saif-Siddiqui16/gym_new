import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { CreditCard, Download, Loader } from 'lucide-react';
import { fetchAllGyms } from '../../../api/superadmin/superAdminApi';
import { getInvoices } from '../../../api/finance/invoiceApi';

const BillingPlans = () => {
    const [loading, setLoading] = useState(true);
    const [planInfo, setPlanInfo] = useState({
        plan: 'Loading...',
        price: '...',
        nextBilling: '...',
        paymentMethod: '...'
    });
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // In a real scenario, we'd have a specific endpoint for the tenant's current plan.
                // For now, we'll use fetchAllGyms as it returns the plan for the tenant's gym.
                const gymsData = await fetchAllGyms();
                const currentGym = gymsData.gyms?.[0]; // Assuming the first one is the primary gym for the user

                if (currentGym) {
                    setPlanInfo({
                        plan: currentGym.planName || 'Standard Plan',
                        price: 'Custom', // Backend doesn't return price in getAllGyms
                        nextBilling: 'Coming Soon', // Need a specific subscription endpoint for this
                        paymentMethod: 'Bank Transfer'
                    });
                }

                // Fetch invoices (assuming these are SaaS invoices or system invoices)
                const invoicesData = await getInvoices();
                setInvoices(invoicesData || []);

            } catch (error) {
                console.error('Failed to load billing data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="fade-in p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Billing & Plans</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card title="Current Plan" className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{planInfo.plan}</h3>
                            <p className="text-sm sm:text-base text-gray-500">{planInfo.price} billed monthly</p>
                        </div>
                        <Button variant="primary" className="w-full sm:w-auto">Upgrade Plan</Button>
                    </div>
                    <div className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-500">
                        Next billing date: <span className="text-gray-900 font-semibold">{planInfo.nextBilling}</span>
                    </div>
                </Card>

                <Card title="Payment Method">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-gray-100 rounded-lg shrink-0">
                            <CreditCard size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <div className="font-semibold text-sm sm:text-base text-gray-900">{planInfo.paymentMethod}</div>
                            <div className="text-xs sm:text-sm text-gray-500">Active Service</div>
                        </div>
                    </div>
                    <Button variant="outline" size="small" className="mt-3 sm:mt-4 w-full">Update Information</Button>
                </Card>
            </div>

            <Card title="Invoice History">
                {invoices.length > 0 ? (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="text-left border-b border-gray-200">
                                        <th className="py-3 font-semibold text-gray-700">Invoice ID</th>
                                        <th className="py-3 font-semibold text-gray-700">Date</th>
                                        <th className="py-3 font-semibold text-gray-700">Amount</th>
                                        <th className="py-3 font-semibold text-gray-700">Status</th>
                                        <th className="py-3 font-semibold text-gray-700 text-right">Download</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 font-medium text-gray-900">{inv.invoiceNumber || inv.id}</td>
                                            <td className="py-3 text-gray-600">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3 text-gray-900">{inv.amount}</td>
                                            <td className="py-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden space-y-3">
                            {invoices.map((inv) => (
                                <div key={inv.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 mb-1">{inv.invoiceNumber || inv.id}</div>
                                            <div className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                        <div className="font-bold text-base text-gray-900">{inv.amount}</div>
                                        <button className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors text-gray-600 border border-gray-200">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="py-10 text-center text-gray-500">No invoice history found.</div>
                )}
            </Card>
        </div>
    );
};

export default BillingPlans;

