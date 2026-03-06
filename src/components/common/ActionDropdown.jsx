import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const ActionDropdown = ({ trigger, children, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Calculate dropdown position
    const updatePosition = () => {
        if (buttonRef.current && isOpen) {
            const rect = buttonRef.current.getBoundingClientRect();
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;

            setDropdownPosition({
                top: rect.bottom + scrollY + 8,
                left: rect.right + scrollX, // Align with right edge
            });
        }
    };

    useEffect(() => {
        updatePosition();
    }, [isOpen]);

    // Update position on scroll/resize
    useEffect(() => {
        if (!isOpen) return;

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Dropdown Portal Content
    const DropdownPortal = () => {
        if (!isOpen) return null;

        return ReactDOM.createPortal(
            <div
                ref={dropdownRef}
                style={{
                    position: 'absolute',
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    transform: 'translateX(-100%)', // Shift left to align right edge
                    zIndex: 9999, // High z-index to ensure visibility
                    animation: 'dropdownFadeIn 0.2s ease-out',
                }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-48"
                onClick={() => setIsOpen(false)} // Close on item click by default
            >
                {children}
            </div>,
            document.body
        );
    };

    return (
        <>
            <div className={`relative ${className}`} ref={buttonRef} onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
            }}>
                {trigger}
            </div>
            <DropdownPortal />
            <style>{`
                @keyframes dropdownFadeIn {
                    from { opacity: 0; transform: translateX(-100%) scale(0.95); }
                    to { opacity: 1; transform: translateX(-100%) scale(1); }
                }
            `}</style>
        </>
    );
};

export default ActionDropdown;
