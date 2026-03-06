import React from 'react';

const Card = ({ children, title, subtitle, className = '', ...props }) => {
    return (
        <div className={`saas-card bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 ${className}`} {...props}>
            {(title || subtitle) && (
                <div className="mb-6 border-b border-slate-100 pb-4">
                    {title && <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>}
                    {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
