import React from 'react';

const Input = ({ label, icon: Icon, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`
                        w-full 
                        p-4 
                        ${Icon ? 'pl-12' : ''} 
                        bg-gray-50 
                        rounded-xl 
                        font-bold 
                        text-gray-900 
                        outline-none 
                        focus:ring-2 
                        focus:ring-indigo-500 
                        focus:bg-white 
                        transition-all
                        border border-transparent
                        placeholder:text-gray-400
                        ${className}
                    `}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;
