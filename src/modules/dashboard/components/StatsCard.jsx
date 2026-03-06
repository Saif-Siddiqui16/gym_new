import React from 'react';
import Card from '../../../components/ui/Card';

// Icon Map wrapper if needed, or just pass icon component directly
const StatsCard = ({ title, value, icon: Icon, trend, trendDirection, subtitle, color = 'primary' }) => {

    const colorClasses = {
        primary: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'group-hover:bg-blue-600 group-hover:text-white' },
        success: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'group-hover:bg-emerald-600 group-hover:text-white' },
        warning: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'group-hover:bg-amber-600 group-hover:text-white' },
        danger: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'group-hover:bg-red-600 group-hover:text-white' },
        info: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'group-hover:bg-indigo-600 group-hover:text-white' },
    };

    const trendColors = {
        up: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        down: { bg: 'bg-red-50', text: 'text-red-700' },
        stable: { bg: 'bg-slate-100', text: 'text-slate-600' },
    };

    const currentStyle = colorClasses[color] || colorClasses.primary;
    const trendStyle = trendColors[trendDirection] || trendColors.stable;

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-slate-200 cursor-pointer p-3 sm:p-6 h-full min-h-[120px] flex flex-col justify-center !rounded-2xl">
            <div className="flex justify-between items-start relative z-10 w-full gap-3">
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="text-slate-400 font-bold text-[10px] md:text-xs mb-1.5 uppercase tracking-widest truncate">
                        {title}
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate mb-1">
                        {value}
                    </div>
                    {subtitle && (
                        <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide truncate">
                            {subtitle}
                        </div>
                    )}
                </div>
                <div className={`shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-sm ${currentStyle.bg} ${currentStyle.text} ${currentStyle.iconBg}`}>
                    {Icon && <Icon size={20} className="md:w-6 md:h-6 transition-colors duration-300" strokeWidth={2.5} />}
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${trendStyle.bg} ${trendStyle.text}`}>
                        {trend}
                    </span>
                </div>
            )}

            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${currentStyle.bg}`}></div>
        </Card>
    );
};

export default StatsCard;
