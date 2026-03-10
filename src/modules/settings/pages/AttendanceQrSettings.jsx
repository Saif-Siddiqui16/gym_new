import React from 'react';
import { QrCode, Download, Printer, ShieldCheck, Zap, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../../../api/apiClient';

const AttendanceQrSettings = () => {
    const handleDownloadPdf = async () => {
        const loadingToast = toast.loading('Preparing your printable QR PDF...');
        try {
            const response = await apiClient.get('/admin/attendance-qr/download-pdf', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Gym_Attendance_QR.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('QR PDF downloaded successfully!', { id: loadingToast });
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download QR PDF. Please try again.', { id: loadingToast });
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            {/* Header */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-3xl blur-3xl opacity-10 pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl border border-white/50 p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 hover:rotate-3">
                            <QrCode size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Attendance QR Code</h1>
                            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Printable high-quality entry system</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadPdf}
                        className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-2xl hover:bg-primary transition-all active:scale-95 uppercase tracking-widest"
                    >
                        <Download size={20} strokeWidth={3} className="group-hover:translate-y-0.5 transition-transform" />
                        Download QR PDF
                    </button>
                </div>
            </div>

            {/* Main Preview Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Preview Mode */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center space-y-6">
                    <div className="w-full text-center">
                        <span className="px-4 py-1.5 bg-violet-100 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">Live Preview</span>
                        <h3 className="text-xl font-black text-slate-800 mt-4">Printable Card Layout</h3>
                    </div>

                    <div className="w-full aspect-[1/1.414] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-between shadow-inner relative group bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                        <div className="text-center">
                            <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Gym Attendance</h2>
                            <div className="h-1 w-12 bg-primary mx-auto mt-1 rounded-full"></div>
                        </div>

                        <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                            <QrCode size={120} className="text-slate-800" strokeWidth={1.5} />
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-[10px] font-black text-slate-600 leading-tight">Scan this QR Code to mark your attendance via Gym Dashboard.</p>
                            <div className="flex items-center justify-center gap-1.5 opacity-50">
                                <Printer size={12} />
                                <span className="text-[9px] font-bold uppercase tracking-tighter">Optimized for A4 Printing</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions & Features */}
                <div className="space-y-6">
                    <div className="bg-primary-light/50 rounded-3xl border border-violet-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                                <Printer size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Printing Guidelines</h3>
                        </div>
                        <ul className="space-y-4">
                            {[
                                'Use standard A4 size white paper',
                                'Print in high-contrast (Black & White is fine)',
                                'Place at eye-level near the gym entrance',
                                'Ensure good lighting for easy phone scanning'
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="text-emerald-600" size={24} />
                            <h3 className="text-lg font-black text-emerald-900">Secure Entry System</h3>
                        </div>
                        <p className="text-sm text-emerald-800/80 font-medium leading-relaxed">
                            This QR code generates a secure branch-specific token. Only members registered at this branch can use it to Check-In or Check-Out via their personal dashboards.
                        </p>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                        <div className="relative z-10 flex items-start gap-4">
                            <Zap className="text-primary mt-1" fill="currentColor" size={24} />
                            <div>
                                <h4 className="font-black text-white uppercase tracking-widest text-xs">Fast Check-In</h4>
                                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                                    Members simply open their dashboard, click "Scan QR", and the system automatically logs their attendance in real-time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Alert */}
            <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <Info size={24} />
                </div>
                <div>
                    <p className="text-sm font-black text-slate-700">Need help with the entry system?</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Contact technical support if the QR code is not scanning properly on some devices.</p>
                </div>
            </div>
        </div>
    );
};

export default AttendanceQrSettings;
