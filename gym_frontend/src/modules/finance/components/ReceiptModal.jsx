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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
        // Extract gym name dynamically
        const userStr = localStorage.getItem('userData');
        let gymName = 'Gym CRM';
        if (userStr) {
            const userObj = JSON.parse(userStr);
            gymName = userObj?.branchName || userObj?.tenant?.name || 'GYM RECEIPT';
        }

        // Open a pure, untainted window for perfect printing
        const printWindow = window.open('', '_blank');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${payment.id || 'Print'}</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        color: #1e293b;
                        margin: 0;
                        padding: 40px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .receipt-box {
                        max-width: 600px;
                        margin: 0 auto;
                        border: 2px dashed #cbd5e1;
                        border-radius: 16px;
                        padding: 30px;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px dashed #cbd5e1;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .header h1 {
                        color: #10b981;
                        margin: 0 0 10px 0;
                        font-size: 28px;
                    }
                    .header p {
                        margin: 0;
                        color: #64748b;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 12px;
                        letter-spacing: 2px;
                    }
                    .row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 12px;
                        font-size: 14px;
                    }
                    .row .label {
                        color: #64748b;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 11px;
                        letter-spacing: 1px;
                    }
                    .row .value {
                        font-weight: bold;
                        color: #0f172a;
                    }
                    .divider {
                        border-top: 1px solid #e2e8f0;
                        margin: 20px 0;
                        width: 100%;
                    }
                    .total-box {
                        background: #f8fafc;
                        padding: 20px;
                        border-radius: 12px;
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border: 1px solid #e2e8f0;
                    }
                    .total-label {
                        color: #64748b;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 12px;
                        letter-spacing: 1px;
                    }
                    .total-value {
                        font-size: 32px;
                        font-weight: 900;
                        color: #10b981;
                    }
                    @media print {
                        @page { margin: 0.5cm; }
                        body { padding: 0; }
                        .receipt-box { border: none; padding: 20px; max-width: 100%; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-box">
                    <div class="header">
                        <h1>${gymName.toUpperCase()}</h1>
                        <p>CASHIER RECEIPT</p>
                    </div>
                    
                    <div class="row">
                        <span class="label">Receipt ID</span>
                        <span class="value">${payment.id || ''}</span>
                    </div>
                    <div class="row">
                        <span class="label">Date</span>
                        <span class="value">${payment.date || ''}</span>
                    </div>
                    <div class="row">
                        <span class="label">Received By</span>
                        <span class="value">${payment.receivedBy || ''}</span>
                    </div>

                    <div class="divider"></div>

                    <div class="row">
                        <span class="label">Member Name</span>
                        <span class="value">${payment.memberName || ''}</span>
                    </div>
                    <div class="row">
                        <span class="label">Payment Type</span>
                        <span class="value" style="text-transform: capitalize;">${payment.paymentType || ''}</span>
                    </div>
                    <div class="row">
                        <span class="label">Payment Method</span>
                        <span class="value">${payment.method || ''}</span>
                    </div>
                    ${payment.referenceNumber ? `
                    <div class="row">
                        <span class="label">Reference ID</span>
                        <span class="value">${payment.referenceNumber}</span>
                    </div>
                    ` : ''}

                    <div class="total-box">
                        <span class="total-label">Total Amount Paid</span>
                        <span class="total-value">Rs. ${parseFloat(payment.finalAmount || 0).toLocaleString()}</span>
                    </div>
                    
                    <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 11px;">
                        <p>Thank you for your payment!</p>
                        <p>Generated professionally by Gym CRM</p>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handleDownload = () => {
        try {
            const doc = new jsPDF();

            // Extract gym name from local storage
            const userStr = localStorage.getItem('userData');
            let gymName = 'Gym CRM';
            if (userStr) {
                const userObj = JSON.parse(userStr);
                gymName = userObj?.branchName || userObj?.tenant?.name || 'GYM RECEIPT';
            }

            // Define Standard Colors
            const primaryColor = [16, 185, 129]; // emerald-500
            const darkGray = [30, 41, 59]; // slate-800
            const lightGray = [100, 116, 139]; // slate-500

            // Header - Gym Name
            doc.setFontSize(28);
            doc.setTextColor(...primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text(gymName.toUpperCase(), 14, 25);

            // Header - Receipt Label
            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.setFont('helvetica', 'normal');
            doc.text('CASHIER RECEIPT', 196, 25, null, null, 'right');

            // Header Line
            doc.setDrawColor(226, 232, 240); // slate-200
            doc.setLineWidth(0.5);
            doc.line(14, 32, 196, 32);

            // Receipt Info Left
            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.text('Receipt ID:', 14, 42);
            doc.setFontSize(11);
            doc.setTextColor(...darkGray);
            doc.setFont('helvetica', 'bold');
            doc.text(payment.id || '', 14, 48);

            // Receipt Info Right
            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.setFont('helvetica', 'normal');
            doc.text('Date:', 196, 42, null, null, 'right');
            doc.setFontSize(11);
            doc.setTextColor(...darkGray);
            doc.setFont('helvetica', 'bold');
            doc.text(payment.date || '', 196, 48, null, null, 'right');

            // Received By
            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.setFont('helvetica', 'normal');
            doc.text('Received By:', 14, 58);
            doc.setFontSize(11);
            doc.setTextColor(...darkGray);
            doc.setFont('helvetica', 'bold');
            doc.text(payment.receivedBy || '', 14, 64);

            // Status marker
            doc.setFontSize(14);
            doc.setTextColor(...primaryColor);
            doc.text('SUCCESS', 196, 64, null, null, 'right');

            // Member Section
            doc.setFillColor(248, 250, 252); // slate-50
            doc.roundedRect(14, 72, 182, 30, 3, 3, 'F');

            doc.setFontSize(9);
            doc.setTextColor(...lightGray);
            doc.text('MEMBER', 22, 82);

            doc.setFontSize(14);
            doc.setTextColor(...darkGray);
            doc.text(payment.memberName || '', 22, 91);

            // Payment Table
            const tableBody = [
                [
                    (payment.paymentType || '').toUpperCase(),
                    payment.method || '',
                    payment.referenceNumber || 'N/A',
                    `Rs. ${parseFloat(payment.finalAmount || 0).toLocaleString()}`
                ]
            ];

            autoTable(doc, {
                startY: 110,
                head: [['PAYMENT TYPE', 'METHOD', 'REF ID', 'TOTAL PAID']],
                body: tableBody,
                theme: 'plain',
                headStyles: {
                    fillColor: [248, 250, 252],
                    textColor: [100, 116, 139],
                    fontStyle: 'bold',
                    fontSize: 9,
                    cellPadding: { top: 6, bottom: 6, left: 8, right: 8 }
                },
                bodyStyles: {
                    textColor: [30, 41, 59],
                    fontSize: 11,
                    fontStyle: 'bold',
                    cellPadding: { top: 8, bottom: 8, left: 8, right: 8 }
                },
                columnStyles: {
                    3: { halign: 'right', textColor: [16, 185, 129] }
                },
                margin: { left: 14, right: 14 }
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(148, 163, 184); // slate-400
                doc.text('Generated professionally by Gym CRM', 105, 285, null, null, 'center');
            }

            // Save PDF
            doc.save(`Receipt_${payment.id || 'download'}.pdf`);

        } catch (err) {
            console.error("Failed generating PDF: ", err);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 py-8 overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col my-auto">
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
                        <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            Success
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
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
