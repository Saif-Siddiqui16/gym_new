import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ROLES } from '../../../config/roles';
import { Save, Lock, CreditCard } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import BranchScopeSelector from '../../../components/common/BranchScopeSelector';
import { BRANCHES } from '../data/mockSettingsData';

const PaymentGateway = () => {
    const context = useOutletContext();
    const role = context?.role;
    const isReadOnly = role === ROLES.MANAGER;
    const [provider, setProvider] = useState('razorpay');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const handleSave = (e) => {
        e.preventDefault();
        alert("Payment gateway configuration saved successfully!");
    };

    return (
        <div className="fade-in max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Payment Integration</h2>
                        {isReadOnly && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded border border-slate-200 uppercase tracking-wide">
                                Read-Only 🔒
                            </span>
                        )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-500 font-bold mt-1">
                        {isReadOnly ? 'Contact Admin to update payment configuration.' : 'Configure your online payment gateway settings.'}
                    </p>
                </div>
            </div>

            <BranchScopeSelector
                value={selectedBranch}
                onChange={setSelectedBranch}
                branches={BRANCHES}
            />

            <Card>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 border-b border-gray-100 pb-4 sm:pb-6 mb-4 sm:mb-6">
                    <button
                        onClick={() => !isReadOnly && setProvider('razorpay')}
                        disabled={isReadOnly}
                        className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 ${provider === 'razorpay'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-100 text-gray-400 hover:border-gray-200'
                            } ${isReadOnly ? 'cursor-not-allowed opacity-75' : ''}`}
                    >
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-900"></div>
                        Razorpay
                    </button>
                    <button
                        onClick={() => !isReadOnly && setProvider('stripe')}
                        disabled={isReadOnly}
                        className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 ${provider === 'stripe'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-100 text-gray-400 hover:border-gray-200'
                            } ${isReadOnly ? 'cursor-not-allowed opacity-75' : ''}`}
                    >
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600"></div>
                        Stripe
                    </button>
                </div>

                <form className="space-y-4 sm:space-y-6" onSubmit={handleSave}>
                    <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-yellow-100 flex gap-2 sm:gap-3 text-yellow-800 text-xs sm:text-sm font-bold">
                        <Lock className="shrink-0" size={18} />
                        <p>Credentials are encrypted and stored securely. Do not share your secret keys.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                {provider === 'razorpay' ? 'Key ID' : 'Publishable Key'}
                            </label>
                            <Input
                                type="text"
                                className={`w-full bg-gray-50 border-transparent focus:bg-white transition-all font-mono text-xs sm:text-sm ${isReadOnly ? 'cursor-not-allowed text-gray-400' : ''}`}
                                placeholder={isReadOnly ? '••••••••••••••••••••••••' : (provider === 'razorpay' ? 'rzp_test_...' : 'pk_test_...')}
                                disabled={isReadOnly}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                {provider === 'razorpay' ? 'Key Secret' : 'Secret Key'}
                            </label>
                            <Input
                                type="password"
                                className={`w-full bg-gray-50 border-transparent focus:bg-white transition-all font-mono text-xs sm:text-sm ${isReadOnly ? 'cursor-not-allowed text-gray-400' : ''}`}
                                placeholder="••••••••••••••••••••••••"
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <input
                            type="checkbox"
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded text-indigo-600 focus:ring-indigo-200 border-gray-300 disabled:opacity-50"
                            id="sandbox"
                            defaultChecked
                            disabled={isReadOnly}
                        />
                        <label htmlFor="sandbox" className={`text-gray-700 font-bold text-xs sm:text-sm ${isReadOnly ? 'text-gray-400' : ''}`}>Enable Sandbox / Test Mode</label>
                    </div>

                    {!isReadOnly && (
                        <div className="flex justify-end pt-2 sm:pt-4">
                            <Button variant="primary" className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-200">
                                <Save size={16} className="sm:w-[18px] sm:h-[18px] mr-2" />
                                Save Configuration
                            </Button>
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
};

export default PaymentGateway;
