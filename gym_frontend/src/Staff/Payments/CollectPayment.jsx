import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, User, Wallet, FileText, CheckCircle, AlertCircle, IndianRupee, Hash, ReceiptText } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { collectPayment } from '../../api/staff/paymentApi';
import CustomDropdown from '../../components/common/CustomDropdown';
import { INVOICES } from '../../modules/finance/data/mockFinance';

const CollectPayment = () => {
    const [formData, setFormData] = useState({
        invoiceId: '',
        invoiceNumber: '',
        memberName: '',
        totalAmount: 0,
        paidAmount: 0,
        remainingBalance: 0,
        paymentAmount: '',
        paymentMode: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    // Filter invoices that are not fully paid
    const pendingInvoices = INVOICES.filter(inv => inv.status !== 'Paid');
    const invoiceOptions = pendingInvoices.map(inv => `${inv.invoiceNumber} - ${inv.memberName}`);

    useEffect(() => {
        if (formData.invoiceId) {
            const selectedInv = INVOICES.find(inv => inv.invoiceNumber === formData.invoiceId.split(' - ')[0]);
            if (selectedInv) {
                setFormData(prev => ({
                    ...prev,
                    invoiceNumber: selectedInv.invoiceNumber,
                    memberName: selectedInv.memberName,
                    totalAmount: selectedInv.totalAmount,
                    paidAmount: selectedInv.paidAmount,
                    remainingBalance: selectedInv.balanceDue,
                    paymentAmount: '' // Reset payment amount when invoice changes
                }));
            }
        }
    }, [formData.invoiceId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'paymentAmount') {
            const numValue = parseFloat(value) || 0;
            const currentBalance = formData.totalAmount - formData.paidAmount;
            const newRemaining = Math.max(0, currentBalance - numValue);

            setFormData(prev => ({
                ...prev,
                [name]: value,
                remainingBalance: newRemaining
            }));

            // Dynamic validation
            if (value && isNaN(value)) {
                setErrors(prev => ({ ...prev, paymentAmount: 'Amount must be numeric' }));
            } else if (numValue > currentBalance) {
                setErrors(prev => ({ ...prev, paymentAmount: 'Amount cannot exceed balance due' }));
            } else {
                setErrors(prev => ({ ...prev, paymentAmount: '' }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.invoiceId) newErrors.invoiceId = 'Invoice selection is required';
        if (!formData.paymentAmount) newErrors.paymentAmount = 'Payment amount is required';
        if (formData.paymentAmount && isNaN(formData.paymentAmount)) newErrors.paymentAmount = 'Amount must be numeric';
        if (parseFloat(formData.paymentAmount) > (formData.totalAmount - formData.paidAmount)) {
            newErrors.paymentAmount = 'Amount cannot exceed balance due';
        }
        if (!formData.paymentMode) newErrors.paymentMode = 'Payment mode is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            // In a real scenario, this would call collectPayment(formData)
            // For now we simulate success and UI update
            const result = await collectPayment({
                ...formData,
                amount: formData.paymentAmount
            });

            if (result.success) {
                alert(`Payment of ₹${formData.paymentAmount} recorded successfully!`);
                navigate('/modules/finance/invoices'); // Navigate to invoices page to see update
            } else {
                alert("Payment failed");
            }
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-violet-50/30 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <IndianRupee size={32} className="text-violet-600" />
                        Collect Payment
                    </h1>
                    <p className="text-gray-500 font-medium mt-1.5 flex items-center gap-2 text-sm">
                        Record partial or full payments for member invoices.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Invoice Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                                        <ReceiptText size={16} className="text-violet-500" />
                                        Select Invoice
                                    </label>
                                    <CustomDropdown
                                        options={invoiceOptions}
                                        value={formData.invoiceId}
                                        onChange={(val) => handleChange({ target: { name: 'invoiceId', value: val } })}
                                        placeholder="Select Invoice to pay"
                                        className={`w-full ${errors.invoiceId ? 'border-red-500' : ''}`}
                                    />
                                    {errors.invoiceId && <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-bold"><AlertCircle size={12} /> {errors.invoiceId}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Invoice Number (Read-only) */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                                            <Hash size={16} className="text-violet-500" />
                                            Invoice Number
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-500 cursor-not-allowed"
                                            value={formData.invoiceNumber || '—'}
                                        />
                                    </div>

                                    {/* Member Name (Read-only) */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                                            <User size={16} className="text-violet-500" />
                                            Member Name
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-500 cursor-not-allowed"
                                            value={formData.memberName || '—'}
                                        />
                                    </div>
                                </div>

                                {/* Payment Details Section */}
                                <div className="p-6 bg-violet-50/50 rounded-2xl border border-violet-100 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Payment Amount */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-violet-700 flex items-center gap-2 uppercase tracking-wider">
                                                <IndianRupee size={16} />
                                                Payment Amount
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="paymentAmount"
                                                    placeholder="0.00"
                                                    className={`w-full h-12 pl-4 pr-12 rounded-xl border-2 transition-all text-sm font-black ${errors.paymentAmount ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20'
                                                        }`}
                                                    value={formData.paymentAmount}
                                                    onChange={handleChange}
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">INR</span>
                                            </div>
                                            {errors.paymentAmount && <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-bold"><AlertCircle size={12} /> {errors.paymentAmount}</p>}
                                        </div>

                                        {/* Payment Mode */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-violet-700 flex items-center gap-2 uppercase tracking-wider">
                                                <Wallet size={16} />
                                                Payment Method
                                            </label>
                                            <CustomDropdown
                                                options={['Cash', 'Card', 'UPI', 'Bank Transfer']}
                                                value={formData.paymentMode}
                                                onChange={(val) => handleChange({ target: { name: 'paymentMode', value: val } })}
                                                placeholder="Select Method"
                                                className={`w-full ${errors.paymentMode ? 'border-red-500' : ''}`}
                                            />
                                            {errors.paymentMode && <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-bold"><AlertCircle size={12} /> {errors.paymentMode}</p>}
                                        </div>
                                    </div>

                                    {/* Remaining Balance Auto-calculated */}
                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-violet-100">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Estimated Remaining Balance</p>
                                            <p className={`text-xl font-black ${formData.remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                ₹{formData.remainingBalance.toLocaleString()}
                                            </p>
                                        </div>
                                        {formData.remainingBalance > 0 && formData.invoiceId && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-[10px] font-black uppercase tracking-wider animate-pulse">
                                                <AlertCircle size={12} />
                                                Partial Payment
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                                        <FileText size={16} className="text-violet-500" />
                                        Transaction Notes (Optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        placeholder="Reference number, discount details, etc..."
                                        rows="3"
                                        className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all text-sm font-bold bg-slate-50/50 resize-none"
                                        value={formData.notes}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl shadow-xl shadow-violet-200 font-black text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest"
                                >
                                    <CheckCircle size={20} />
                                    Complete Payment
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <CreditCard size={20} className="text-violet-400" />
                                Invoice Summary
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Amount</span>
                                    <span className="text-lg font-black">₹{formData.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Already Paid</span>
                                    <span className="text-lg font-black text-emerald-400">₹{formData.paidAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Balance Due</span>
                                    <span className="text-xl font-black text-red-400">₹{(formData.totalAmount - formData.paidAmount).toLocaleString()}</span>
                                </div>
                            </div>

                            {formData.remainingBalance > 0 && formData.invoiceId && (
                                <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3">
                                    <AlertCircle size={24} className="text-red-400 shrink-0" />
                                    <div>
                                        <p className="text-xs text-red-200 font-black uppercase tracking-wider mb-1">Attention</p>
                                        <p className="text-xs text-red-100/70 leading-relaxed font-bold">
                                            Access may be blocked until full payment is completed.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-violet-50 border border-violet-100 rounded-3xl p-6">
                            <h4 className="text-sm font-black text-violet-900 uppercase tracking-widest mb-3">Quick Help</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-2 text-xs font-bold text-violet-700/70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1 shrink-0" />
                                    Partial payments will keep the invoice status as 'Partial'.
                                </li>
                                <li className="flex gap-2 text-xs font-bold text-violet-700/70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1 shrink-0" />
                                    Once full balance is cleared, status updates to 'Paid'.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectPayment;
