import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ className = '', children, ...props }) => {
    return (
        <div className="relative">
            <select
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700 ${className}`}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={18} />
            </div>
        </div>
    );
};

export default Select;
