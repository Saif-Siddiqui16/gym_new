import React from 'react';

const StatusBadge = ({ status, color = 'emerald', icon: Icon }) => {
    const config = {
        emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/50',
        amber: 'from-amber-500 to-amber-600 shadow-amber-500/50',
        red: 'from-red-500 to-red-600 shadow-red-500/50',
        blue: 'from-blue-500 to-blue-600 shadow-blue-500/50',
        orange: 'from-orange-500 to-orange-600 shadow-orange-500/50',
        slate: 'from-slate-500 to-slate-600 shadow-slate-500/50',
        violet: 'from-violet-500 to-violet-600 shadow-violet-500/50',
        indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/50',
    };

    const gradientClass = config[color] || config.emerald;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${gradientClass} text-white text-[10px] font-black uppercase tracking-wider shadow-lg hover:scale-110 transition-all duration-300 cursor-default`}>
            {Icon && <Icon size={12} strokeWidth={3} />}
            {status}
        </span>
    );
};

export default StatusBadge;
