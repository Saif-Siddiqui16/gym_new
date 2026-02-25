import React, { useState, useEffect } from 'react';
import {
    Search,
    User,
    CreditCard,
    Banknote,
    Smartphone,
    Building,
    Plus,
    ArrowRight,
    CheckCircle2,
    Users,
    ChevronDown,
    X,
    Receipt,
    History,
    Zap,
    Tag,
    Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { submitCashierPayment } from '../../../api/finance/financeApi';
import ReceiptModal from '../components/ReceiptModal';

const CashierMode = () => {
    const navigate = useNavigate();

    // Fetch User from local storage
    const userStr = localStorage.getItem('userData');
    const loggedInUser = userStr ? JSON.parse(userStr) : {
        name: 'Operator',
        role: 'STAFF',
        branchId: 'Unknown'
    };

    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberSearch, setMemberSearch] = useState('');
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await apiClient.get('/admin/members');
                setMembers(response.data);
            } catch (err) {
                console.error("Failed fetching members", err);
            }
        };
        fetchMembers();
    }, []);

    const [paymentDetails, setPaymentDetails] = useState({
        type: '',
        amount: '',
        discount: 0,
        method: 'Cash',
        referenceNumber: '',
        notes: ''
    });

    const [showReceipt, setShowReceipt] = useState(false);
    const [processedPayment, setProcessedPayment] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const paymentTypes = [
        { id: 'membership', label: 'New Membership', icon: Building, color: 'text-violet-500' },
        { id: 'renewal', label: 'Renewal', icon: History, color: 'text-amber-500' },
        { id: 'pt', label: 'Personal Training', icon: Zap, color: 'text-rose-500' },
        { id: 'diet', label: 'Diet Plan', icon: Tag, color: 'text-emerald-500' },
        { id: 'addon', label: 'Add-On', icon: Plus, color: 'text-blue-500' },
        { id: 'other', label: 'Other', icon: Calculator, color: 'text-slate-500' }
    ];

    const methods = [
        { id: 'Cash', label: 'Cash', icon: Banknote },
        { id: 'Card', label: 'Card', icon: CreditCard },
        { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
        { id: 'Bank Transfer', label: 'Bank Transfer', icon: Building }
    ];

    const filteredMembers = members.filter(m =>
        (m.name?.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone?.includes(memberSearch))
    );

    const calculateFinal = () => {
        const base = parseFloat(paymentDetails.amount) || 0;
        const disc = parseFloat(paymentDetails.discount) || 0;
        return Math.max(0, base - disc);
    };

    const handleReceivePayment = async () => {
        if (!selectedMember || !paymentDetails.type || !paymentDetails.amount) {
            alert('Please complete all required fields.');
            return;
        }

        if (paymentDetails.method !== 'Cash' && !paymentDetails.referenceNumber) {
            alert('Reference number is required for non-cash payments.');
            return;
        }

        const finalAmount = calculateFinal();

        try {
            // Log to Backend Endpoint
            const res = await submitCashierPayment({
                memberId: selectedMember.id,
                paymentType: paymentDetails.type,
                amount: paymentDetails.amount,
                discount: paymentDetails.discount,
                method: paymentDetails.method,
                referenceNumber: paymentDetails.referenceNumber,
                notes: paymentDetails.notes
            });

            const paymentRecord = {
                id: res.receipt.invoiceNumber,
                memberId: selectedMember.memberId || selectedMember.id,
                memberName: selectedMember.name,
                paymentType: paymentDetails.type,
                amount: paymentDetails.amount,
                discount: paymentDetails.discount,
                finalAmount: finalAmount,
                method: paymentDetails.method,
                referenceNumber: paymentDetails.referenceNumber,
                receivedBy: loggedInUser.name,
                date: new Date().toLocaleDateString('en-IN'),
                branchId: loggedInUser.branchName || 'GYM',
                status: 'completed'
            };

            setProcessedPayment(paymentRecord);
            setIsSuccess(true);

            // Finalize state
            setTimeout(() => {
                setShowReceipt(true);
                setIsSuccess(false);
                // Reset form for next customer
                setSelectedMember(null);
                setPaymentDetails({
                    type: '',
                    amount: '',
                    discount: 0,
                    method: 'Cash',
                    referenceNumber: '',
                    notes: ''
                });
            }, 1500);

        } catch (error) {
            alert('Payment failed to record. Check connection.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                            <Receipt size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Cashier Mode</h1>
                            <p className="text-slate-500 font-medium italic">Collect offline payments and generate instant receipts.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/finance/transactions')}
                        className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all shadow-sm flex items-center gap-2 group"
                    >
                        <History size={16} className="group-hover:rotate-[-45deg] transition-transform" />
                        Branch Transactions
                    </button>
                </div>

                {isSuccess ? (
                    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-12 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6 animate-bounce">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Payment Received!</h2>
                        <p className="text-slate-500 font-medium max-w-md mx-auto">The transaction has been recorded and the receipt is being generated.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Lef Column: Form */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Member Selection */}
                            <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Step 1: Select Member
                                </h3>

                                <div className="relative">
                                    <div
                                        className={`flex items-center justify-between px-6 py-4 bg-slate-50 border-2 rounded-2xl cursor-pointer transition-all ${selectedMember ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                        onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${selectedMember ? 'bg-white text-emerald-500' : 'bg-slate-200 text-slate-400'
                                                }`}>
                                                <Users size={24} />
                                            </div>
                                            {selectedMember ? (
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-slate-800">{selectedMember.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{selectedMember.phone} • {selectedMember.memberId}</p>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-black text-slate-300">Search member by name or phone...</span>
                                            )}
                                        </div>
                                        <ChevronDown size={20} className={`text-slate-300 transition-transform duration-300 ${showMemberDropdown ? 'rotate-180' : ''}`} />
                                    </div>

                                    {showMemberDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                            <div className="p-4 bg-slate-50 border-b border-slate-100">
                                                <div className="relative">
                                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                    <input
                                                        type="text"
                                                        value={memberSearch}
                                                        onChange={(e) => setMemberSearch(e.target.value)}
                                                        placeholder="Quick search..."
                                                        className="w-full pl-12 pr-4 h-12 rounded-xl bg-white border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-sm outline-none transition-all"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {filteredMembers.length > 0 ? filteredMembers.map(member => (
                                                    <button
                                                        key={member.id}
                                                        onClick={() => {
                                                            setSelectedMember(member);
                                                            setShowMemberDropdown(false);
                                                        }}
                                                        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-emerald-50 transition-colors border-b border-slate-50 last:border-none text-left"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs uppercase">
                                                            {member.name ? member.name.charAt(0) : 'A'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800 leading-none mb-1">{member.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{member.phone} • {member.memberId}</p>
                                                        </div>
                                                    </button>
                                                )) : (
                                                    <div className="p-8 text-center bg-slate-50/50">
                                                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No members found</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Configuration */}
                            <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Step 2: Payment Details
                                </h3>

                                <div className="space-y-8">
                                    {/* Action Type */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {paymentTypes.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setPaymentDetails({ ...paymentDetails, type: type.id })}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-3 group ${paymentDetails.type === type.id
                                                    ? 'border-emerald-500 bg-emerald-50/30'
                                                    : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className={`p-3 rounded-xl transition-all ${paymentDetails.type === type.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400'
                                                    }`}>
                                                    <type.icon size={20} />
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${paymentDetails.type === type.id ? 'text-emerald-700' : 'text-slate-500'
                                                    }`}>{type.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Financial Inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bill Amount (₹)</label>
                                            <div className="relative">
                                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="number"
                                                    value={paymentDetails.amount}
                                                    onChange={e => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
                                                    className="w-full pl-11 pr-4 h-14 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-black text-slate-800 bg-slate-50/50"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Discount (₹)</label>
                                            <div className="relative">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="number"
                                                    value={paymentDetails.discount}
                                                    onChange={e => setPaymentDetails({ ...paymentDetails, discount: e.target.value })}
                                                    className="w-full pl-11 pr-4 h-14 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-black text-slate-800 bg-slate-50/50"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {methods.map(method => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setPaymentDetails({ ...paymentDetails, method: method.id })}
                                                    className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest ${paymentDetails.method === method.id
                                                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                                                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    <method.icon size={16} />
                                                    {method.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Additional info strictly based on method */}
                                    {paymentDetails.method !== 'Cash' && (
                                        <div className="space-y-3 animate-in slide-in-from-left-4">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Reference / Transaction ID</label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                                <input
                                                    type="text"
                                                    value={paymentDetails.referenceNumber}
                                                    onChange={e => setPaymentDetails({ ...paymentDetails, referenceNumber: e.target.value })}
                                                    className="w-full pl-11 pr-4 h-14 rounded-2xl border-2 border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-black text-slate-800 bg-emerald-50/10"
                                                    placeholder="Enter TXN ID..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Calculations & Actions */}
                        <div className="lg:col-span-4 h-fit sticky top-8">
                            <div className="bg-slate-900 rounded-[40px] shadow-2xl p-8 text-white relative overflow-hidden group">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/2 -translate-y-1/4 group-hover:scale-125 transition-transform duration-1000">
                                    <Receipt size={240} strokeWidth={1} />
                                </div>

                                <div className="relative z-10 space-y-8">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Final Payable</p>
                                        <h2 className="text-6xl font-black italic tracking-tighter tabular-nums drop-shadow-2xl">
                                            ₹{calculateFinal().toLocaleString()}
                                        </h2>
                                    </div>

                                    <div className="space-y-4 pt-8 border-t border-white/10">
                                        <div className="flex justify-between items-center opacity-60">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Base Amount</span>
                                            <span className="font-bold tabular-nums">₹{parseFloat(paymentDetails.amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-rose-400">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Instant Discount</span>
                                            <span className="font-bold tabular-nums">-₹{parseFloat(paymentDetails.discount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-white/10 text-emerald-400">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Method</span>
                                            <span className="font-black uppercase tracking-widest">{paymentDetails.method}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleReceivePayment}
                                            className="w-full py-5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            Receive Payment <ArrowRight size={20} />
                                        </button>
                                        <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] text-center mt-6">
                                            Secure Branch Level Encryption
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Staff Status */}
                            <div className="mt-6 p-6 rounded-3xl bg-white border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Operator</p>
                                        <p className="text-xs font-bold text-slate-700">{loggedInUser.name}</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    {loggedInUser.role}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            <ReceiptModal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                payment={processedPayment}
            />
        </div>
    );
};

export default CashierMode;
