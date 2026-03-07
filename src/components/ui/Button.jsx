import React from 'react';

const Button = ({
    children,
    variant = 'primary', // primary, success, outline, secondary, danger
    className = '',
    icon: Icon,
    loading = false,
    ...props
}) => {
    const variantClasses = {
        primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm border border-transparent',
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-transparent',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm border border-transparent',
        outline: 'bg-white border text-slate-700 border-slate-200 hover:border-violet-500 hover:text-violet-700 hover:bg-violet-50'
    };

    const selectedVariant = variantClasses[variant] || variantClasses.primary;

    return (
        <button
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${selectedVariant} ${className}`}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <>
                    {Icon && <Icon size={18} />}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
