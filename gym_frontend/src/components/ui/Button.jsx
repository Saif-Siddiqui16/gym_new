import React from 'react';

const Button = ({
    children,
    variant = 'primary', // primary, success, outline
    className = '',
    icon: Icon,
    ...props
}) => {
    const variantClasses = {
        primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200',
        success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200',
        outline: 'bg-white border-2 border-slate-200 text-slate-600 hover:border-violet-500 hover:text-violet-600'
    };

    const selectedVariant = variantClasses[variant] || variantClasses.primary;

    return (
        <button
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${selectedVariant} ${className}`}
            {...props}
        >
            {Icon && <Icon size={16} />}
            {children}
        </button>
    );
};

export default Button;
