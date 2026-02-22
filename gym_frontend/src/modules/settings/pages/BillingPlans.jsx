import React from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { CreditCard, Download } from 'lucide-react';
import { BILLING_INFO } from '../data/mockSettingsData';

const BillingPlans = () => {
    return (
        <div className="fade-in p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Billing & Plans</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card title="Current Plan" className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{BILLING_INFO.plan}</h3>
                            <p className="text-sm sm:text-base text-gray-500">{BILLING_INFO.price} billed monthly</p>
                        </div>
                        <Button variant="primary" className="w-full sm:w-auto">Upgrade Plan</Button>
                    </div>
                    <div className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-500">
                        Next billing date: <span className="text-gray-900 font-semibold">{BILLING_INFO.nextBilling}</span>
                    </div>
                </Card>

                <Card title="Payment Method">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-gray-100 rounded-lg shrink-0">
                            <CreditCard size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <div className="font-semibold text-sm sm:text-base text-gray-900">{BILLING_INFO.paymentMethod}</div>
                            <div className="text-xs sm:text-sm text-gray-500">Expires 12/25</div>
                        </div>
                    </div>
                    <Button variant="outline" size="small" className="mt-3 sm:mt-4 w-full">Update Information</Button>
                </Card>
            </div>

            <Card title="Invoice History">
                {/* Desktop Table View */}
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
                            {BILLING_INFO.invoices.map((inv) => (
                                <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 font-medium text-gray-900">{inv.id}</td>
                                    <td className="py-3 text-gray-600">{inv.date}</td>
                                    <td className="py-3 text-gray-900">{inv.amount}</td>
                                    <td className="py-3">
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
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

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {BILLING_INFO.invoices.map((inv) => (
                        <div key={inv.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-sm text-gray-900 mb-1">{inv.id}</div>
                                    <div className="text-xs text-gray-500">{inv.date}</div>
                                </div>
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
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
            </Card>
        </div>
    );
};

export default BillingPlans;
