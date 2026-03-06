import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, History, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Star, X, Loader, FileText, Download, AlertCircle, Calendar, Receipt, Trash2 } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { fetchWalletTransactions, addWalletCredit, getWalletBalance, getSavedCards, addSavedCard, deleteSavedCard, getRewardCatalog, redeemReward } from '../../api/member/memberApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import RightDrawer from '../../components/common/RightDrawer';
import MobileCard from '../../components/common/MobileCard';
import Button from '../../components/ui/Button';

const MemberWallet = () => {
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [showCardsModal, setShowCardsModal] = useState(false);
    const [showRewardsModal, setShowRewardsModal] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [addedThisMonth, setAddedThisMonth] = useState(0);
    const [loyaltyPts, setLoyaltyPts] = useState(0);
    const [classCredits, setClassCredits] = useState(0);
    const [activeTab, setActiveTab] = useState('transactions');

    const [invoices, setInvoices] = useState([]);

    // New Card State
    const [rewardCatalog, setRewardCatalog] = useState([]);
    const [savedCards, setSavedCards] = useState([]);
    const [showAddCardForm, setShowAddCardForm] = useState(false);
    const [newCard, setNewCard] = useState({ name: '', number: '', expiry: '' });

    const [showDetailedHistory, setShowDetailedHistory] = useState(false);
    const [historyFilter, setHistoryFilter] = useState('All');

    useEffect(() => {
        loadTransactions();
        loadWalletDetails();
    }, []);

    const loadTransactions = async () => {
        const data = await fetchWalletTransactions();
        setTransactions(data);
    };

    const loadWalletDetails = async () => {
        try {
            const balanceResponse = await getWalletBalance();
            setWalletBalance(balanceResponse?.balance || 0);
            setAddedThisMonth(balanceResponse?.addedThisMonth || 0);
            setLoyaltyPts(balanceResponse?.loyaltyPts || 0);
            setClassCredits(balanceResponse?.credits || 0);

            const cardsResponse = await getSavedCards();
            setSavedCards(cardsResponse || []);

            const catalogResponse = await getRewardCatalog();
            setRewardCatalog(catalogResponse || []);
        } catch (error) {
            console.error('Failed to load wallet details:', error);
        }
    };

    const handleAddCredit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const addedAmount = parseFloat(amount);
            await addWalletCredit(addedAmount);
            await loadWalletDetails();
            await loadTransactions();
            setIsAddOpen(false);
            setAmount('');
            alert('Credits added successfully!');
        } catch (error) {
            console.error('Error adding credits:', error);
            alert('Failed to add credits');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadStatement = async () => {
        setIsDownloading(true);
        try {
            const doc = new jsPDF();

            // Header Content
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text("Benefit Wallet Statement", 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Available Balance: INR ${walletBalance}`, 14, 35);

            const tableData = transactions.map(t => [
                t.date,
                t.title,
                t.type === 'income' ? 'Credit' : 'Debit',
                (t.type === 'income' ? '+' : '-') + ' INR ' + t.amount.toLocaleString()
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['Date', 'Description', 'Type', 'Amount']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [139, 92, 246] }, // Violet-600
                styles: { fontSize: 9, cellPadding: 3 }
            });

            doc.save(`Wallet_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate statement.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSaveCard = async (e) => {
        e.preventDefault();
        if (newCard.number.length < 4) {
            alert('Please enter a valid card number');
            return;
        }

        try {
            const cardData = {
                name: newCard.name || 'New Card',
                number: newCard.number.slice(-4),
                expiry: newCard.expiry || 'MM/YY',
                brand: 'Custom'
            };
            const added = await addSavedCard(cardData);
            setSavedCards([...savedCards, added.card]);
            setShowAddCardForm(false);
            setNewCard({ name: '', number: '', expiry: '' });
            alert('Card saved successfully!');
        } catch (error) {
            console.error('Failed to save card:', error);
            alert('Failed to save card');
        }
    };

    const handleDeleteCard = async (id) => {
        if (!window.confirm("Are you sure you want to delete this card?")) return;
        try {
            await deleteSavedCard(id);
            setSavedCards(savedCards.filter(c => c.id !== id));
        } catch (error) {
            console.error('Failed to delete card:', error);
            alert('Failed to delete card');
        }
    };

    const handleRedeem = async (catalogId, pointsCost, itemName) => {
        if (loyaltyPts < pointsCost) {
            alert('Insufficient loyalty points to redeem this item.');
            return;
        }
        if (!window.confirm(`Redeem ${itemName} for ${pointsCost} points?`)) return;

        setLoading(true);
        try {
            const data = await redeemReward(catalogId);
            setLoyaltyPts(data.remainingPoints);
            await loadTransactions();
            alert('Reward redeemed successfully!');
        } catch (error) {
            console.error('Failed to redeem reward:', error);
            alert(typeof error === 'string' ? error : 'Failed to redeem reward');
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'All') return true;
        return t.type === filter.toLowerCase();
    });

    const detailedFilteredTransactions = transactions.filter(t => {
        if (historyFilter === 'All') return true;
        return t.type === historyFilter.toLowerCase();
    });

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Benefit Wallet</h1>
                        <p className="text-gray-500 font-medium mt-1">Manage your credits, rewards, and transaction history.</p>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-black shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Credits
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Balance Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 rounded-[32px] md:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-between items-center">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                        <Wallet size={24} className="text-indigo-300" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Balance</span>
                                </div>
                                <div>
                                    <h2 className="text-5xl font-black tracking-tight flex items-baseline gap-1">
                                        <span className="text-2xl text-indigo-400 font-bold">₹</span> {walletBalance.toLocaleString()}
                                    </h2>
                                    <p className="text-slate-400 text-xs font-bold mt-2 flex items-center gap-1">
                                        <Plus size={14} className="text-green-400" /> ₹{addedThisMonth.toLocaleString()} added this month
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <div className="flex-1 p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Loyalty Pts</p>
                                        <p className="text-lg font-black text-indigo-300">{loyaltyPts}</p>
                                    </div>
                                    <div className="flex-1 p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Credits</p>
                                        <p className="text-lg font-black text-indigo-300">{classCredits}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Abstract background blobs */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl"></div>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-[28px] md:rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <ActionButton
                                    icon={CreditCard}
                                    label="Saved Cards"
                                    onClick={() => setShowCardsModal(true)}
                                />
                                <ActionButton
                                    icon={Star}
                                    label="Redeem Rewards"
                                    onClick={() => setShowRewardsModal(true)}
                                />
                                <ActionButton
                                    icon={History}
                                    label="Statement PDF"
                                    onClick={handleDownloadStatement}
                                    isLoading={isDownloading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transaction & Invoices Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 md:p-8 h-full flex flex-col">
                            {/* Tabs */}
                            <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-4">
                                <button
                                    onClick={() => setActiveTab('transactions')}
                                    className={`text-lg font-black transition-all relative ${activeTab === 'transactions' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Transactions
                                    {activeTab === 'transactions' && <div className="absolute -bottom-[17px] left-0 right-0 h-1 bg-violet-600 rounded-full"></div>}
                                </button>
                                <button
                                    onClick={() => setActiveTab('invoices')}
                                    className={`text-lg font-black transition-all relative ${activeTab === 'invoices' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    My Invoices
                                    {activeTab === 'invoices' && <div className="absolute -bottom-[17px] left-0 right-0 h-1 bg-violet-600 rounded-full"></div>}
                                </button>
                            </div>

                            {activeTab === 'transactions' ? (
                                <div className="flex-1 space-y-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Activity</h3>
                                        <div className="flex bg-gray-50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
                                            {['All', 'Income', 'Spent'].map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setFilter(f)}
                                                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                        {filteredTransactions.length > 0 ? (
                                            filteredTransactions.map(t => (
                                                <TransactionItem
                                                    key={t.id}
                                                    title={t.title}
                                                    date={t.date}
                                                    amount={`${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString()}`}
                                                    type={t.type}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-400 py-8 text-sm font-bold">No transactions found.</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setShowDetailedHistory(true)}
                                        className="w-full mt-6 py-4 text-violet-600 font-black text-sm hover:bg-violet-50 rounded-2xl transition-all"
                                    >
                                        View Detailed History
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 space-y-6">
                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 text-amber-800 text-sm">
                                        <AlertCircle className="shrink-0" size={20} />
                                        <p className="font-medium">You have 1 pending invoice. Please pay to avoid membership suspension.</p>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                            <Receipt size={40} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black text-slate-900">Manage Your Invoices</h4>
                                            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                                                We've moved our billing system to a dedicated page for better security and experience.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => navigate('/member/payments')}
                                            variant="primary"
                                            className="px-8 py-4 rounded-2xl shadow-xl shadow-violet-100"
                                        >
                                            Go to My Invoices <ArrowUpRight size={18} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed History Drawer */}
            <RightDrawer
                isOpen={showDetailedHistory}
                onClose={() => setShowDetailedHistory(false)}
                title="Transaction History"
                maxWidth="max-w-4xl"
            >
                <div className="p-8 h-full flex flex-col">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-64 space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Filter by Type</p>
                                <div className="space-y-1">
                                    {['All', 'Income', 'Spent'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setHistoryFilter(f)}
                                            className={`w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold transition-all ${historyFilter === f ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            {f}
                                            {historyFilter === f && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                                <p className="text-xs font-bold text-slate-400">Monthly Summary</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500 font-bold">Total Added</span>
                                        <span className="text-lg font-black text-green-400">+₹{addedThisMonth.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-xs text-slate-500 font-bold">Available</span>
                                        <span className="text-lg font-black text-indigo-400">₹{walletBalance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            {detailedFilteredTransactions.length > 0 ? (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden md:block bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {detailedFilteredTransactions.map(t => (
                                                    <tr key={t.id} className="hover:bg-white transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                    {t.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                                </div>
                                                                <span className="font-bold text-gray-900 text-sm">{t.title}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-bold text-gray-400">{t.date}</span>
                                                        </td>
                                                        <td className={`px-6 py-4 text-sm font-black text-right ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                                            {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden space-y-4">
                                        {detailedFilteredTransactions.map((t) => (
                                            <MobileCard
                                                key={t.id}
                                                title={t.title}
                                                subtitle={t.date}
                                                status={t.type === 'income' ? '+' + t.amount.toLocaleString() : '-' + t.amount.toLocaleString()}
                                                statusColor={t.type === 'income' ? 'text-green-600' : 'text-gray-900'}
                                                icon={t.type === 'income' ? ArrowDownLeft : ArrowUpRight}
                                                iconColor={t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                                                fields={[]} // Minimal fields for cleaner look
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="p-4 bg-gray-100 rounded-full text-gray-400">
                                        <History size={32} />
                                    </div>
                                    <p className="text-gray-400 font-bold text-sm">No transactions found for this filter.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </RightDrawer>

            {/* Add Credit Drawer */}
            <RightDrawer
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add Wallet Credits"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleAddCredit} className="p-8 space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Amount to add (₹)</label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₹</span>
                            <input
                                type="number"
                                autoFocus
                                required
                                min="1"
                                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-violet-500 rounded-[24px] py-5 pl-12 pr-6 text-2xl font-black text-gray-900 outline-none transition-all"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[500, 1000, 2000].map(amt => (
                            <button
                                key={amt}
                                type="button"
                                onClick={() => setAmount(amt)}
                                className="py-4 rounded-2xl bg-violet-50 text-violet-600 text-xs font-black shadow-sm hover:bg-violet-600 hover:text-white transition-all active:scale-95"
                            >
                                + ₹{amt}
                            </button>
                        ))}
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !amount}
                        className="w-full py-5 bg-violet-600 text-white rounded-[24px] font-black shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-[0.98]"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Proceed to Pay'}
                    </button>
                    <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Secure encrypted payment</p>
                </form>
            </RightDrawer>

            {/* Saved Cards Drawer */}
            <RightDrawer
                isOpen={showCardsModal}
                onClose={() => {
                    setShowCardsModal(false);
                    setShowAddCardForm(false);
                }}
                title={showAddCardForm ? 'Add New Card' : 'Payment Methods'}
                maxWidth="max-w-md"
            >
                <div className="p-8">
                    {!showAddCardForm ? (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                {savedCards.map((card, index) => (
                                    <div key={card.id} className={`p-6 rounded-[32px] border-2 transition-all ${index === 0 ? 'border-violet-200 bg-violet-50/20' : 'border-gray-50 bg-white hover:border-violet-100'} flex items-center justify-between group`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-8 ${card.brand === 'HDFC' ? 'bg-slate-900' : card.brand === 'ICICI' ? 'bg-blue-600' : 'bg-slate-500'} rounded-lg flex items-center justify-center text-[8px] text-white font-black shadow-lg`}>
                                                {card.brand}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{card.name}</p>
                                                <p className="text-[11px] font-bold text-gray-400">•••• •••• {card.number}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {index === 0 && (
                                                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                                                    <Star size={12} className="text-white fill-white" />
                                                </div>
                                            )}
                                            <button onClick={() => handleDeleteCard(card.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowAddCardForm(true)}
                                className="w-full py-5 border-2 border-dashed border-gray-200 rounded-[24px] text-gray-400 font-black text-sm hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} /> Add New Method
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveCard} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Card Holder Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-violet-500 rounded-2xl py-4 px-5 text-sm font-black outline-none transition-all"
                                    placeholder="Enter full name"
                                    value={newCard.name}
                                    onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Card Number</label>
                                <input
                                    required
                                    type="text"
                                    maxLength="16"
                                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-violet-500 rounded-2xl py-4 px-5 text-sm font-black outline-none transition-all tracking-[0.2em]"
                                    placeholder="0000 0000 0000 0000"
                                    value={newCard.number}
                                    onChange={e => setNewCard({ ...newCard, number: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Expiry Date</label>
                                    <input
                                        required
                                        type="text"
                                        maxLength="5"
                                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-violet-500 rounded-2xl py-4 px-5 text-sm font-black outline-none transition-all"
                                        placeholder="MM/YY"
                                        value={newCard.expiry}
                                        onChange={e => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
                                            setNewCard({ ...newCard, expiry: val });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">CVV</label>
                                    <input
                                        required
                                        type="password"
                                        maxLength="3"
                                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-violet-500 rounded-2xl py-4 px-5 text-sm font-black outline-none transition-all"
                                        placeholder="•••"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddCardForm(false)}
                                    className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-[24px] font-black text-sm hover:bg-gray-100 transition-all uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-5 bg-violet-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all uppercase tracking-widest"
                                >
                                    Save Method
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </RightDrawer>

            {/* Redeem Rewards Drawer */}
            <RightDrawer
                isOpen={showRewardsModal}
                onClose={() => setShowRewardsModal(false)}
                title="Rewards Store"
                maxWidth="max-w-md"
            >
                <div className="h-full flex flex-col">
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Total Available</p>
                        <h2 className="text-4xl font-black flex items-center gap-2">
                            {loyaltyPts} <Star className="fill-white" size={24} />
                        </h2>
                    </div>

                    <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                        {rewardCatalog.length === 0 ? (
                            <p className="text-center text-xs font-bold text-gray-400">Loading rewards store...</p>
                        ) : (
                            rewardCatalog.map((item) => (
                                <RewardCard
                                    key={item.id}
                                    points={item.points}
                                    title={item.name}
                                    description={item.description}
                                    disabled={loyaltyPts < item.points || loading}
                                    onRedeem={() => handleRedeem(item.id, item.points, item.name)}
                                />
                            ))
                        )}
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100 italic text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">
                        New rewards added every month
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

const ActionButton = ({ icon: Icon, label, onClick, isLoading }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className="w-full flex items-center justify-between p-3.5 md:p-4 bg-gray-50 hover:bg-violet-50 hover:text-violet-600 rounded-2xl transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
    >
        <div className="flex items-center gap-3">
            {isLoading ? <Loader size={18} className="animate-spin text-violet-500" /> : <Icon size={18} />}
            <span className="text-sm font-bold">{label}</span>
        </div>
        <ArrowUpRight size={16} className="text-gray-300 group-hover:text-violet-500" />
    </button>
);

const RewardCard = ({ points, title, description, onRedeem, disabled }) => (
    <div className={`p-4 rounded-2xl border border-gray-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${disabled ? 'opacity-50' : ''}`}>
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-600 text-[10px] font-black">{points} PTS</span>
                <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
            </div>
            <p className="text-xs text-gray-400 font-medium">{description}</p>
        </div>
        <button
            onClick={onRedeem}
            disabled={disabled}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-violet-600'}`}
        >
            Redeem
        </button>
    </div>
);

const TransactionItem = ({ title, date, amount, type }) => {
    const isIncome = type === 'income';
    return (
        <div className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-2xl transition-all">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">{date}</p>
                </div>
            </div>
            <span className={`text-sm font-black ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>{amount}</span>
        </div>
    );
};

export default MemberWallet;
