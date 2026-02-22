import React from 'react';
import Card from '../../../components/ui/Card';

// Icon Map wrapper if needed, or just pass icon component directly
const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {

    const colorClasses = {
        primary: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'group-hover:bg-blue-600 group-hover:text-white' },
        success: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'group-hover:bg-emerald-600 group-hover:text-white' },
        warning: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'group-hover:bg-amber-600 group-hover:text-white' },
        danger: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'group-hover:bg-red-600 group-hover:text-white' },
    };

    const currentStyle = colorClasses[color] || colorClasses.primary;

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 border border-transparent hover:border-indigo-100 cursor-pointer p-4 sm:p-5">
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <div className="text-gray-500 font-medium text-xs sm:text-sm mb-1">{title}</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">{value}</div>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-sm ${currentStyle.bg} ${currentStyle.text} ${currentStyle.iconBg}`}>
                    {Icon && <Icon size={20} className="sm:w-[22px] sm:h-[22px] transition-colors duration-300" />}
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
                    <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${currentStyle.bg} ${currentStyle.text}`}>
                        {trend}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400">vs last period</span>
                </div>
            )}

            {/* Decorative background circle */}
            <div className={`absolute -bottom-4 -right-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${currentStyle.bg.replace('bg-', 'bg-')}`}></div>
        </Card>
    );
};

export default StatsCard;
