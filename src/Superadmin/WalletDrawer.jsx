import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { updateMemberWallet } from '../api/superadmin/superAdminApi';

const WalletDrawer = ({ isOpen, onClose, memberData, walletData, setWalletData }) => {
    // Current Wallet Data from Props mapping
    const currentWallet = memberData && walletData ? walletData[memberData.id] : { balance: 0, transactions: [], lastTransaction: 'N/A' };

    // Form State
    const [transactionType, setTransactionType] = useState(null); // 'credit' | 'debit' | null
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (memberData) {
            setTransactionType(null); // Reset form when switching members
        }
    }, [memberData]);

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !description || isNaN(amount) || !memberData) return;

        const numAmount = parseFloat(amount);
        const type = transactionType === 'credit' ? 'Credit' : 'Debit';

        try {
            setIsSubmitting(true);

            // 1. Fire true backend update
            const response = await updateMemberWallet(memberData.id, {
                type,
                amount: numAmount,
                description
            });

            // 2. Safely read returned data
            const newBalance = response.balance;
            const newTx = response.transaction;

            // 3. Format date nicely for the UI
            const dateStr = new Date(newTx.createdAt || new Date()).toISOString().split('T')[0];
            const formattedTx = {
                id: newTx.id,
                date: dateStr,
                type: newTx.type,
                amount: parseFloat(newTx.amount),
                description: newTx.description
            };

            // 4. Update parent mapping table efficiently
            setWalletData(prev => ({
                ...prev,
                [memberData.id]: {
                    balance: newBalance,
                    transactions: [formattedTx, ...currentWallet.transactions],
                    lastTransaction: dateStr
                }
            }));

            // Reset Form on Success
            setTransactionType(null);
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error("Wallet transaction failed:", error);
            alert("Transaction failed: " + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />

            {/* Drawer Container */}
            <div className={`absolute inset-y-0 right-0 w-full max-w-[400px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} animate-in slide-in-from-right`}>
                {/* ... existing header ... */}
                {/* Drawer Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col gap-4 bg-white sticky top-0 z-10 font-sans">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{memberData?.name}</h2>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{memberData?.id}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTransactionType('credit')}
                            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm ${transactionType === 'credit' ? 'bg-green-600 text-white shadow-green-100' : 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white'}`}
                        >
                            Add Credit
                        </button>
                        <button
                            onClick={() => setTransactionType('debit')}
                            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm ${transactionType === 'debit' ? 'bg-red-600 text-white shadow-red-100' : 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white'}`}
                        >
                            Deduct
                        </button>
                    </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Section 1: Wallet Summary Card */}
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
                        <p className="text-indigo-100 text-sm font-medium">Current Balance</p>
                        <h3 className="text-3xl font-bold mt-1">
                            {Number(currentWallet.balance) < 0 ? `-$${Math.abs(Number(currentWallet.balance)).toFixed(2)}` : `$${Number(currentWallet.balance).toFixed(2)}`}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider">Total Credit</p>
                                <p className="text-base font-bold text-white">
                                    ${(currentWallet.transactions || []).filter(tx => tx.type === 'Credit').reduce((acc, tx) => acc + Number(tx.amount), 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider">Total Debit</p>
                                <p className="text-base font-bold text-white">
                                    ${(currentWallet.transactions || []).filter(tx => tx.type === 'Debit').reduce((acc, tx) => acc + Number(tx.amount), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Inner Form Section (Conditional) */}
                    {transactionType && (
                        <div className="animate-slide-up">
                            <div className={`saas-card border-2 ${transactionType === 'credit' ? 'border-green-100' : 'border-red-100'}`}>
                                <h4 className={`text-sm font-bold mb-4 ${transactionType === 'credit' ? 'text-green-700' : 'text-red-700'}`}>
                                    {transactionType === 'credit' ? 'Add Credit Amount' : 'Deduct Amount'}
                                </h4>
                                <form onSubmit={handleTransactionSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Amount</label>
                                        <input
                                            type="number"
                                            required
                                            className="saas-input"
                                            placeholder="Enter amount..."
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Description</label>
                                        <input
                                            type="text"
                                            required
                                            className="saas-input"
                                            placeholder="Reason for transaction..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setTransactionType(null)}
                                            className="flex-1 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                                } ${transactionType === 'credit' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
                                        >
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Section 2: Transaction Table */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                            Recent Transactions
                        </h4>
                        <div className="saas-card p-0 overflow-hidden border border-gray-100 shadow-none">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-500">Date/Type</th>
                                            <th className="px-4 py-3 text-right font-semibold text-gray-500">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {currentWallet.transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <div className="text-gray-900 font-medium">{tx.date}</div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${tx.type === 'Credit' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <span className={`text-[10px] font-bold uppercase ${tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {tx.type}
                                                        </span>
                                                        <span className="text-gray-400 font-medium text-[10px] truncate max-w-[150px] inline-block">• {tx.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                    {tx.type === 'Credit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletDrawer;
