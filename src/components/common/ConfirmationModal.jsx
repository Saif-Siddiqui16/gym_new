import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import Modal from './Modal';
import Button from '../ui/Button';

/**
 * Premium Confirmation Modal
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Called when modal is dismissed
 * @param {function} onConfirm - Called when user confirms action
 * @param {string} title - Modal heading
 * @param {string} message - Description of the action
 * @param {string} confirmText - Label for confirm button
 * @param {string} cancelText - Label for cancel button
 * @param {string} type - Theme: 'success', 'danger', 'info'
 * @param {boolean} loading - Loading state for confirm button
 */
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info',
    loading = false
}) => {
    const getThemeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle2 size={48} className="text-emerald-500" />,
                    iconBg: 'bg-emerald-50',
                    border: 'border-emerald-100',
                    confirmBtn: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100',
                    gradient: 'from-emerald-500 to-teal-600'
                };
            case 'danger':
                return {
                    icon: <AlertCircle size={48} className="text-rose-500" />,
                    iconBg: 'bg-rose-50',
                    border: 'border-rose-100',
                    confirmBtn: 'bg-rose-500 hover:bg-rose-600 shadow-rose-100',
                    gradient: 'from-rose-500 to-orange-600'
                };
            default:
                return {
                    icon: <Info size={48} className="text-primary" />,
                    iconBg: 'bg-primary-light',
                    border: 'border-violet-100',
                    confirmBtn: 'bg-primary hover:bg-primary-hover shadow-violet-100',
                    gradient: 'from-primary to-violet-600'
                };
        }
    };

    const theme = getThemeConfig();

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showCloseButton={false}>
            <div className="relative">
                {/* Decorative Header Gradient */}
                <div className={`h-2 bg-gradient-to-r ${theme.gradient} w-full`} />
                
                <div className="p-8 sm:p-10">
                    {/* Icon Assembly */}
                    <div className="relative mx-auto w-24 h-24 mb-6">
                        <div className={`absolute inset-0 ${theme.iconBg} rounded-full animate-ping opacity-20`} />
                        <div className={`relative w-full h-full ${theme.iconBg} rounded-full border-2 ${theme.border} flex items-center justify-center shadow-sm`}>
                            {theme.icon}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight uppercase">
                            {title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-slate-100 hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-[0.98]"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-[1.5] py-4 ${theme.confirmBtn} text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{confirmText}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white group-hover:animate-ping" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Subtle Footer Accent */}
                <div className="bg-slate-50/50 py-3 flex items-center justify-center gap-2 border-t border-slate-100">
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Gym Academy Secure Verification
                    </span>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
