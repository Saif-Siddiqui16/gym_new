import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const RightDrawer = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    maxWidth = 'max-w-xl'
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const lockScroll = () => {
            // Add utility class for CSS-based locking
            document.body.classList.add('drawer-no-scroll');

            // Lock body & document
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            // Lock all potential scrollable containers in the layout
            const wrappers = document.querySelectorAll('.content-area, .content-wrapper, .saas-container, .main-container');
            wrappers.forEach(el => {
                const currentOverflow = window.getComputedStyle(el).overflowY;
                if (currentOverflow === 'auto' || currentOverflow === 'scroll') {
                    el.setAttribute('data-prev-overflow', el.style.overflow || 'auto');
                    el.style.overflow = 'hidden';
                    el.style.paddingRight = '6px'; // Prevent layout shift from scrollbar disappearing
                }
            });
        };

        const unlockScroll = () => {
            // Remove utility class
            document.body.classList.remove('drawer-no-scroll');

            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';

            const wrappers = document.querySelectorAll('.content-area, .content-wrapper, .saas-container, .main-container');
            wrappers.forEach(el => {
                const prev = el.getAttribute('data-prev-overflow');
                if (prev) {
                    el.style.overflow = prev === 'auto' ? '' : prev;
                    el.style.paddingRight = '';
                    el.removeAttribute('data-prev-overflow');
                }
            });
        };

        if (isOpen) {
            lockScroll();
            setIsAnimating(true);
        } else {
            const timer = setTimeout(() => {
                setIsAnimating(false);
                unlockScroll();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    // Use Portal to ensure the drawer is rendered at the top level of the DOM
    return createPortal(
        <div
            className={`fixed inset-0 overflow-hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ zIndex: 999999 }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full h-[100dvh]">
                <div
                    className={`relative w-screen ${maxWidth} h-full transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col bg-white border-l border-slate-100 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    {/* Header */}
                    <div className="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-white/80 backdrop-blur-xl shrink-0">
                        <div className="flex flex-col pr-4">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 shrink-0"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:px-8 sm:py-6 scrollbar-thin">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50/50 backdrop-blur-md shrink-0">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RightDrawer;
