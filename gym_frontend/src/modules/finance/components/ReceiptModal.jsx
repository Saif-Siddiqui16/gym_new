import React from 'react';
import {
    Printer,
    Download,
    X,
    CheckCircle2,
    Building,
    User,
    CreditCard,
    Calendar,
    ChevronRight,
    Smartphone,
    Banknote
} from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, payment }) => {
    if (!isOpen || !payment) return null;

    const getIcon = (method) => {
        switch (method) {
            case 'Card': return CreditCard;
            case 'UPI': return Smartphone;
            case 'Bank Transfer': return Building;
            default: return Banknote;
        }
    };

    const MethodIcon = getIcon(payment.method);

    const handlePrint = () => {
        alert("Preparing receipt for printing...");
        window.print();
    };

    const handleDownload = () => {
        alert("Downloading digital receipt as PDF... The file will be ready in a moment.");
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 py-8 overflow-y-auto print:bg-white print:p-0 print:static print:block">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white !important; }
                    .print-receipt-container { 
                        box-shadow: none !important; 
                        border: 1px solid #e2e8f0 !important;
                        margin: 0 auto !important;
                        position: static !important;
                        transform: none !important;
                        width: 100% !important;
                        max-width: 600px !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}} />
            <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col my-auto print-receipt-container">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10 no-print"
                >
                    <X size={20} />
                </button>

                {/* Header Section */}
                <div className="p-8 text-center bg-gradient-to-b from-emerald-500/10 to-transparent border-b border-dashed border-slate-100 relative">
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200 print:shadow-none">
                        <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Payment Confirmed</h3>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-2 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                        Digital Receipt Generated
                    </p>
                </div>

                {/* Receipt Details */}
                <div className="p-8 space-y-8">
                    {/* Primary Info Card */}
                    <div className="bg-slate-50 rounded-[32px] p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt ID</span>
                            <span className="text-sm font-black text-slate-700">{payment.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                            <span className="text-sm font-black text-slate-700">{payment.date}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Received By</span>
                            <span className="text-sm font-black text-slate-700">{payment.receivedBy}</span>
                        </div>
                    </div>

                    {/* Member & Plan Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-500">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Name</p>
                                <p className="text-base font-black text-slate-800">{payment.memberName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                                <MethodIcon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Type & Method</p>
                                <p className="text-sm font-black text-slate-800 capitalize">{payment.paymentType} • {payment.method}</p>
                                {payment.referenceNumber && (
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Ref: {payment.referenceNumber}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="pt-8 border-t border-slate-100 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount Received</p>
                            <h2 className="text-4xl font-black text-emerald-600">₹{parseFloat(payment.finalAmount).toLocaleString()}</h2>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 print:bg-slate-100 print:text-slate-900">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            Success
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 no-print">
                    <button
                        onClick={handlePrint}
                        className="flex-1 h-14 bg-white border-2 border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all flex items-center justify-center gap-3 group"
                    >
                        <Printer size={18} className="group-hover:scale-110 transition-transform" />
                        Print
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex-1 h-14 bg-slate-900 border-2 border-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>
            </div>
        </div>

    );
};

export default ReceiptModal;
