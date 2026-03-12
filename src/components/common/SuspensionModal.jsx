import React from 'react';
import { Ban, Phone, X, ShieldAlert, ExternalLink } from 'lucide-react';

const SuspensionModal = ({ isOpen, onClose, supportNumber }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop with ripple blur effect */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out border border-slate-200">
                {/* Visual Header / Brand Accents */}
                <div className="h-2 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />

                <div className="p-8 sm:p-10 text-center">
                    {/* Icon Assembly */}
                    <div className="relative mx-auto w-24 h-24 mb-6">
                        <div className="absolute inset-0 bg-rose-50 rounded-full animate-ping opacity-20" />
                        <div className="relative w-full h-full bg-gradient-to-br from-rose-50 to-white rounded-full border-2 border-rose-100 flex items-center justify-center shadow-sm">
                            <ShieldAlert size={48} className="text-rose-500" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center">
                            <Ban size={20} className="text-rose-600" />
                        </div>
                    </div>

                    {/* Content Section */}
                    <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                        Account <span className="text-rose-600">Suspended</span>
                    </h2>

                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 px-2">
                        Your gym branch access has been temporarily restricted by the system administrator. You cannot proceed further until the suspension is lifted.
                    </p>

                    {/* Action Cards */}
                    <div className="space-y-4">
                        <div className="group flex items-center gap-4 p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                <Phone size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Hotline</p>
                                <p className="text-sm font-bold text-slate-900">{supportNumber || "+91 99999-XXXXX"}</p>
                            </div>
                            <ExternalLink size={16} className="ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98] transition-all duration-300"
                        >
                            Understood
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-2 group text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-colors"
                        >
                            <X size={12} className="group-hover:rotate-90 transition-transform" />
                            Dismiss Notice
                        </button>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        System Security Internal Log: GS-403-RES
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SuspensionModal;
