import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Standardized High-End Modal Component
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Function to call when closing
 * @param {string} title - Optional modal title
 * @param {React.ReactNode} children - Modal content
 * @param {string} maxWidth - Tailwind max-width class (default: max-w-lg)
 * @param {boolean} showCloseButton - Whether to show the top-right X button
 */
const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    maxWidth = 'max-w-lg',
    showCloseButton = true 
}) => {
    // Lock scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
            {/* Backdrop with extreme blur and dark overlay */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" 
                onClick={onClose}
            ></div>
            
            {/* Modal Container */}
            <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full ${maxWidth} overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/20`}>
                
                {/* Header (Optional) */}
                {(title || showCloseButton) && (
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                        {title && (
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                                {title}
                            </h3>
                        )}
                        {showCloseButton && (
                            <button 
                                onClick={onClose} 
                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border border-slate-100 shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="relative">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
