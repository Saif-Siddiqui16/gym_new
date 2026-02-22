import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

const CustomDropdown = ({ options, value, onChange, icon: Icon, placeholder, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Calculate dropdown position
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
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
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update position on scroll/resize
    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY + 8,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // Handle string options or object options {label, value}
    const getLabel = (opt) => {
        if (typeof opt === 'string') return opt;
        if (typeof opt === 'object' && opt !== null) return opt.label || opt.value || '';
        return String(opt || '');
    };

    const getValue = (opt) => {
        if (typeof opt === 'string') return opt;
        if (typeof opt === 'object' && opt !== null) {
            return opt.value !== undefined ? opt.value : opt.label;
        }
        return String(opt || '');
    };

    const currentOption = options.find(opt => getValue(opt) === value);
    const currentLabel = currentOption ? getLabel(currentOption) : (value || placeholder || 'Select');

    // Dropdown menu component
    const DropdownMenu = () => (
        <div
            ref={dropdownRef}
            style={{
                position: 'absolute',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                zIndex: 70000,
                maxHeight: '280px',
                overflowY: 'auto',
                padding: '6px',
                animation: 'dropdownSlideIn 0.2s ease-out',
            }}
        >
            {options && options.length > 0 ? options.map((option, idx) => {
                const optValue = getValue(option);
                const optLabel = getLabel(option);
                const isSelected = value === optValue;

                return (
                    <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(optValue);
                            setIsOpen(false);
                        }}
                        style={{
                            width: '100%',
                            padding: '12px 14px',
                            textAlign: 'left',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            background: isSelected ? '#f3f4f6' : 'transparent',
                            color: isSelected ? '#667eea' : '#4b5563',
                            fontWeight: isSelected ? '600' : '500',
                            marginBottom: idx < options.length - 1 ? '2px' : 0,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = isSelected ? '#e5e7eb' : '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = isSelected ? '#f3f4f6' : 'transparent';
                        }}
                    >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {optLabel}
                        </span>
                        {isSelected && <Check size={16} style={{ flexShrink: 0, color: '#667eea' }} />}
                    </button>
                );
            }) : (
                <div style={{ padding: '12px 14px', fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>
                    No options available
                </div>
            )}
        </div>
    );

    return (
        <>
            <div className={`relative min-w-[140px] ${className}`}>
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        fontSize: '15px',
                        border: isOpen ? '2px solid #667eea' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        background: isOpen ? '#ffffff' : '#f9fafb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isOpen ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                        if (!isOpen) e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                        if (!isOpen) e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937', fontWeight: '500' }}>
                        {Icon && <Icon size={18} style={{ color: '#9ca3af' }} />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {currentLabel}
                        </span>
                    </div>
                    <ChevronDown
                        size={18}
                        style={{
                            color: isOpen ? '#667eea' : '#9ca3af',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'all 0.3s',
                            flexShrink: 0,
                        }}
                    />
                </button>
            </div>

            {/* Render dropdown menu in portal */}
            {isOpen && ReactDOM.createPortal(
                <DropdownMenu />,
                document.body
            )}

            <style>{`
                @keyframes dropdownSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default CustomDropdown;
