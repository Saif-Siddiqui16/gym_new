import React from 'react';
import { Package, CheckCircle2, Wrench, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FacilityStatusOverview = ({ equipment = [], equipmentStats }) => {
    const navigate = useNavigate();

    // Calculate real counts from equipment data or backend payload
    const totalAssets = equipmentStats ? equipmentStats.totalAssets : equipment.length;
    const operationalCount = equipmentStats ? equipmentStats.operational : equipment.filter(e => e.status === 'Operational').length;
    const maintenanceCount = equipmentStats ? equipmentStats.outOfOrder : equipment.filter(e => e.status === 'Under Maintenance').length;
    const outOfOrderCount = equipmentStats ? equipmentStats.outOfOrder : equipment.filter(e => e.status === 'Out of Order').length;

    const stats = [
        { label: 'Total Assets', count: totalAssets, icon: Package, color: 'slate', border: 'border-slate-200' },
        { label: 'Operational', count: operationalCount, icon: CheckCircle2, color: 'emerald', border: 'border-emerald-200' },
        { label: 'In Maintenance', count: maintenanceCount, icon: Wrench, color: 'amber', border: 'border-amber-200' },
        { label: 'Out of Order', count: outOfOrderCount, icon: AlertTriangle, color: 'red', border: 'border-red-200' },
    ];

    return (
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 h-full">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Facility Status</h3>
                    <p className="text-slate-400 text-xs font-medium">Equipment health overview</p>
                </div>
                <button
                    onClick={() => navigate('/facility/equipment')}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                >
                    <ArrowUpRight size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded-2xl border-2 ${stat.border} bg-white hover:scale-[1.02] transition-all cursor-default group`}
                    >
                        <div className={`w-8 h-8 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform`}>
                            <stat.icon size={18} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-slate-800 mt-1">{stat.count}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FacilityStatusOverview;
