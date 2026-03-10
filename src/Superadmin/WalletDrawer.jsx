import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { updateMemberWallet } from '../api/superadmin/superAdminApi';
import { toast } from 'react-hot-toast';
import RightDrawer from '../components/common/RightDrawer';

const WalletDrawer = ({ isOpen, onClose, memberData, walletData, setWalletData }) => {
    // Current Wallet Data from Props mapping
    const currentWallet = memberData && walletData ? walletData[memberData.id] : { balance: 0, transactions: [], lastTransaction: 'N/A' };

    // Form State
    const [transactionType, setTransactionType] = useState(null); // 'credit' | 'debit' | null
    const [amount, setAmount] = useState('');
    const [description] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (memberData) {
            setTransactionType(null); // Reset form when switching members
        }
    }, [memberData]);

    const handleTransactionSubmit = async (e) => {
        if (e) e.preventDefault();
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
            toast.error("Transaction failed: " + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={memberData?.name || 'Wallet Details'}
            subtitle={memberData?.id || 'Member Wallet'}
            footer={
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                    Done
                </button>
            }
        >
            <div className="space-y-6">
                {/* Action Buttons */}
                {!transactionType && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTransactionType('credit')}
                            className="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white flex items-center justify-center gap-2"
                        >
                            <ArrowUpRight size={14} />
                            Add Credit
                        </button>
                        <button
                            onClick={() => setTransactionType('debit')}
                            className="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white flex items-center justify-center gap-2"
                        >
                            <ArrowDownRight size={14} />
                            Deduct
                        </button>
                    </div>
                )}

                {/* Section 1: Wallet Summary Card */}
                <div className="bg-primary rounded-2xl p-6 text-white shadow-xl shadow-violet-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="relative z-10">
                        <p className="text-violet-100 text-[10px] font-black uppercase tracking-widest opacity-80">Current Balance</p>
                        <h3 className="text-4xl font-black mt-1">
                            ₹{Number(currentWallet.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
                            <div>
                                <p className="text-violet-100 text-[9px] font-black uppercase tracking-widest opacity-60">Total In</p>
                                <p className="text-lg font-black text-white">
                                    ₹{(currentWallet.transactions || []).filter(tx => tx.type === 'Credit').reduce((acc, tx) => acc + Number(tx.amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div>
                                <p className="text-violet-100 text-[9px] font-black uppercase tracking-widest opacity-60">Total Out</p>
                                <p className="text-lg font-black text-white">
                                    ₹{(currentWallet.transactions || []).filter(tx => tx.type === 'Debit').reduce((acc, tx) => acc + Number(tx.amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inner Form Section (Conditional) */}
                {transactionType && (
                    <div className="animate-slide-up">
                        <div className={`p-5 rounded-2xl border-2 bg-white shadow-sm ${transactionType === 'credit' ? 'border-emerald-100' : 'border-rose-100'}`}>
                            <h4 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${transactionType === 'credit' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {transactionType === 'credit' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {transactionType === 'credit' ? 'Add Credit Amount' : 'Deduct Amount'}
                            </h4>
                            <form onSubmit={handleTransactionSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all"
                                        placeholder="Reason for transaction..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setTransactionType(null)}
                                        className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-white rounded-xl transition-all shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                            } ${transactionType === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'}`}
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Section 2: Transaction History */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <History size={14} />
                        Recent Transactions
                    </h4>
                    <div className="space-y-3">
                        {currentWallet.transactions.length > 0 ? currentWallet.transactions.map((tx) => (
                            <div key={tx.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-violet-100 transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{tx.date}</span>
                                    <span className={`text-sm font-black ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.type === 'Credit' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${tx.type === 'Credit' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{tx.description}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No transaction history</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RightDrawer>
    );
};

export default WalletDrawer;
