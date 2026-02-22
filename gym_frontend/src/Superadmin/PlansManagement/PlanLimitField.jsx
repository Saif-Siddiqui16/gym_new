import React from 'react';
import { Infinity } from 'lucide-react';

const PlanLimitField = ({
    label,
    value,
    isUnlimited,
    onChange,
    onToggleUnlimited,
    type = 'number',
    placeholder = '0',
    unit = '',
    options = null, // for dropdowns like 'Per Month'
    unitValue = '',
    onUnitChange = null
}) => {
    return (
        <div className={`space-y-2 p-4 rounded-2xl border-2 transition-all duration-300 ${isUnlimited ? 'bg-slate-50 border-slate-100 opacity-80' : 'bg-white border-slate-100 hover:border-indigo-100'}`}>
            <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</label>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Unlimited</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isUnlimited}
                            onChange={(e) => onToggleUnlimited(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    {isUnlimited ? (
                        <div className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-black text-slate-400 flex items-center gap-2 italic">
                            <Infinity size={18} /> Unlimited
                        </div>
                    ) : (
                        <>
                            <input
                                type={type}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                disabled={isUnlimited}
                                min="1"
                                placeholder={placeholder}
                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                            />
                            {unit && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase tracking-tighter">
                                    {unit}
                                </span>
                            )}
                        </>
                    )}
                </div>

                {options && !isUnlimited && (
                    <div className="w-32">
                        <select
                            value={unitValue}
                            onChange={(e) => onUnitChange(e.target.value)}
                            className="w-full h-full px-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-tighter text-slate-600 focus:outline-none focus:border-indigo-500"
                        >
                            {options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanLimitField;
