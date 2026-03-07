import React from 'react';

const Button = ({
    children,
    variant = 'primary', // primary, success, danger, outline, ghost
    size = 'md', // sm, md, lg
    className = '',
    icon: Icon,
    loading = false,
    fullWidth = false,
    ...props
}) => {
    // Map variant to our new standardized global classes
    const variantClasses = {
        primary: 'btn-primary',
        success: 'btn-success',
        danger: 'btn-danger',
        outline: 'btn-outline',
        ghost: 'btn-ghost'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs min-h-[32px]',
        md: 'px-5 py-2.5 text-sm min-h-[40px]',
        lg: 'px-6 py-3 text-base min-h-[48px]'
    };

    const selectedVariant = variantClasses[variant] || variantClasses.primary;
    const selectedSize = sizeClasses[size] || sizeClasses.md;

    return (
        <button
            className={`btn ${selectedVariant} ${selectedSize} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
            ) : (
                <>
                    {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
