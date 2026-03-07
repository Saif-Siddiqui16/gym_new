import React from 'react';
import Card from '../../../components/ui/Card';

// Icon Map wrapper if needed, or just pass icon component directly
const StatsCard = ({ title, value, icon: Icon, trend, trendDirection, subtitle, color = 'primary' }) => {

    const colorClasses = {
        primary: { bg: 'bg-primary-light', text: 'text-primary', iconBg: 'group-hover:bg-primary group-hover:text-white' },
        success: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'group-hover:bg-emerald-600 group-hover:text-white' },
        warning: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'group-hover:bg-amber-600 group-hover:text-white' },
        danger: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'group-hover:bg-red-600 group-hover:text-white' },
        info: { bg: 'bg-primary-light', text: 'text-primary', iconBg: 'group-hover:bg-primary group-hover:text-white' },
    };

    const trendColors = {
        up: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        down: { bg: 'bg-red-50', text: 'text-red-700' },
        stable: { bg: 'bg-slate-100', text: 'text-slate-600' },
    };

    const currentStyle = colorClasses[color] || colorClasses.primary;
    const trendStyle = trendColors[trendDirection] || trendColors.stable;

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 border border-slate-100 hover:border-primary/20 cursor-pointer p-8 h-full min-h-[140px] flex flex-col justify-center !rounded-[2.5rem] bg-white">
            <div className="flex items-center justify-between gap-4 relative z-10 w-full">
                <div className="flex flex-col flex-1 min-w-0">
                    <p className="saas-label !mb-2 truncate font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                        {title}
                    </p>
                    <div className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none truncate">
                        {value}
                    </div>
                </div>
                <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:rotate-6 group-hover:scale-110 shadow-lg shadow-black/5 ${currentStyle.bg} ${currentStyle.text} ${currentStyle.iconBg}`}>
                    {Icon && <Icon size={26} strokeWidth={2.5} className="transition-colors duration-300" />}
                </div>
            </div>

            {(subtitle || trend) && (
                <div className="flex items-center justify-between gap-2 mt-5 pt-5 border-t border-slate-50/50 relative z-10">
                    {subtitle && (
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                            {subtitle}
                        </div>
                    )}
                    {trend && (
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${trendStyle.bg} ${trendStyle.text}`}>
                            {trend}
                        </span>
                    )}
                </div>
            )}

            {/* Background Decoration - Subtle and Clean */}
            <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-15 blur-3xl transition-opacity duration-500 pointer-events-none ${currentStyle.bg}`}></div>
            {Icon && (
                <Icon size={90} className={`absolute -bottom-6 -right-6 opacity-0 group-hover:opacity-[0.03] transition-all duration-500 transform group-hover:-rotate-12 group-hover:scale-110 pointer-events-none ${currentStyle.text}`} />
            )}
        </Card>
    );
};

export default StatsCard;
