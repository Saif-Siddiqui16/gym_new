import React, { useState } from 'react';
import { X, CreditCard, Wallet, Smartphone, Landmark, CheckCircle2, ChevronRight } from 'lucide-react';

const StorePaymentModal = ({ isOpen, onClose, onConfirm, totalAmount }) => {
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [referenceNumber, setReferenceNumber] = useState('');

    if (!isOpen) return null;

    const paymentMethods = [
        { id: 'Cash', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'UPI', icon: Smartphone, color: 'text-violet-500', bg: 'bg-violet-50' },
        { id: 'QR', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'Card', icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-50' }
    ];

    const handleSubmit = () => {
        onConfirm({ paymentMethod, referenceNumber });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 right-0 p-6">
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 pb-0">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-violet-100">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Method</h2>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Select your preferred option</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            const isSelected = paymentMethod === method.id;
                            
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`relative p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${
                                        isSelected 
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-violet-500/10' 
                                        : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${method.bg} ${method.color} flex items-center justify-center transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                                        <Icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-slate-500'}`}>
                                        {method.id}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-primary">
                                            <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {paymentMethod !== 'Cash' && (
                        <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference Number / Txn ID</label>
                            <div className="relative">
                                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter reference number"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    className="w-full h-14 pl-12 pr-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 pt-10">
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative mb-8">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex justify-between items-center text-white">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Total Payable</p>
                                <p className="text-3xl font-black tracking-tight">₹{(totalAmount || 0).toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                <CheckCircle2 size={24} />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full h-16 bg-primary text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-violet-200 hover:bg-primary-hover transition-all active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        Confirm Transaction
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StorePaymentModal;
