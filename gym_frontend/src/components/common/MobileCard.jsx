import React from 'react';

const MobileCard = ({
    title,
    subtitle,
    badge,
    badgeColor = 'violet',
    fields = [],
    actions = [],
    className = ''
}) => {
    // Premium badge color configurations
    const getBadgeStyle = (color) => {
        const styles = {
            violet: 'from-violet-500 to-purple-600 shadow-violet-500/50',
            emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/50',
            red: 'from-red-500 to-red-600 shadow-red-500/50',
            amber: 'from-amber-500 to-orange-600 shadow-amber-500/50',
            blue: 'from-blue-500 to-indigo-600 shadow-blue-500/50',
            slate: 'from-slate-500 to-slate-600 shadow-slate-500/50',
            purple: 'from-purple-500 to-fuchsia-600 shadow-purple-500/50',
        };
        return styles[color] || styles.violet;
    };

    return (
        <div className={`group relative bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-4 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden ${className}`}>
            {/* Premium gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header with gradient icon */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                            <div className="w-5 h-5 rounded-full bg-white/20"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors duration-300 truncate">
                                {title}
                            </h3>
                            {subtitle && (
                                <p className="text-xs font-semibold text-slate-600 mt-0.5 truncate">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {badge && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${getBadgeStyle(typeof badge === 'object' ? badge.color : badgeColor)} text-white text-xs font-black shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer flex-shrink-0 ml-2`}>
                            {typeof badge === 'object' ? badge.label : badge}
                        </span>
                    )}
                </div>

                {/* Fields with premium styling */}
                {fields.length > 0 && (
                    <div className="space-y-2.5 mb-4">
                        {fields.map((field, index) => {
                            const FieldIcon = field.icon;
                            return (
                                <div key={index} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50/50 hover:bg-violet-50/50 transition-colors duration-200">
                                    <div className="flex items-center gap-2">
                                        {FieldIcon && (
                                            <FieldIcon size={14} className="text-slate-400 group-hover:text-violet-500 transition-colors" strokeWidth={2.5} />
                                        )}
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{field.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{field.value}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Premium action buttons */}
                {actions.length > 0 && (
                    <div className="flex flex-col gap-2 pt-4 border-t-2 border-slate-100">
                        {actions.map((action, index) => {
                            const ActionIcon = action.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    className={`
                                        group/btn flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105
                                        ${action.variant === 'primary'
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-500/50 hover:shadow-violet-500/60'
                                            : action.variant === 'danger'
                                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/50 hover:shadow-red-500/60'
                                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-violet-300 hover:text-violet-700'
                                        }
                                    `}
                                >
                                    {ActionIcon && <ActionIcon size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover/btn:scale-110" />}
                                    <span>{action.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileCard;
