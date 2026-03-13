import React from 'react';
import { X, Printer, CheckCircle2, ShoppingBag, CreditCard, User } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 print:shadow-none print:rounded-none">
                {/* Header with status */}
                <div className="bg-gradient-to-br from-primary to-primary-hover p-8 text-white relative overflow-hidden print:bg-none print:text-black">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                    <div className="relative flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <CheckCircle2 size={40} className="text-white" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Payment Successful</h2>
                            <p className="text-white/80 font-bold text-xs uppercase tracking-widest mt-1">Transaction Completed</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors print:hidden">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 print:p-0">
                    {/* Invoice ID and Date */}
                    <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-dashed border-slate-100">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Invoice Number</p>
                            <p className="text-sm font-black text-slate-900">{order.invoice?.invoiceNumber || `#${order.id}`}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                            <p className="text-sm font-black text-slate-900">
                                {new Date(order.createdAt || order.date).toLocaleString('en-IN', { 
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-slate-50/50 rounded-2xl p-4 mb-8 flex items-center gap-4 border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Customer Details</p>
                            <p className="text-sm font-black text-slate-900">
                                {order.member?.name || order.guestName || 'Walk-in Guest'}
                            </p>
                            {(order.member?.memberId || order.guestPhone) && (
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {order.member?.memberId || order.guestPhone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4 mb-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Summary</p>
                        <div className="space-y-3">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                            <ShoppingBag size={14} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{item.product?.name || 'Store Product'}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                Qty: {item.quantity} × ₹{item.priceAtBuy}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-black text-slate-900">₹{item.quantity * item.priceAtBuy}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Section */}
                    <div className="bg-slate-900 rounded-3xl p-6 text-white mb-8">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <CreditCard size={18} className="text-white/40" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Payment Method</span>
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">{order.paymentMode || 'Cash'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black uppercase tracking-widest">Total Amount Paid</span>
                            <span className="text-2xl font-black tracking-tighter">₹{order.total}</span>
                        </div>
                    </div>

                    {/* Reference Number if any */}
                    {order.referenceNumber && (
                        <div className="text-center mb-8">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Reference Code</p>
                            <p className="text-xs font-black text-slate-900 tracking-widest bg-slate-50 inline-block px-4 py-1.5 rounded-full border border-slate-100">
                                {order.referenceNumber}
                            </p>
                        </div>
                    )}

                    {/* Receipt Footer */}
                    <div className="text-center space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thank you for your purchase!</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic">Keep Grinding</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-10 flex gap-4 print:hidden">
                        <button
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl border-2 border-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Close
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95"
                        >
                            <Printer size={18} />
                            Print Receipt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
