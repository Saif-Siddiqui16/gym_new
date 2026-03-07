import React from 'react';

const Input = ({ label, icon: Icon, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="form-label">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`
                        ${Icon ? 'pl-12' : ''} 
                        focus:border-primary
                        hover:border-slate-300
                        transition-all
                        ${className}
                    `}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;
