import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Calendar, LogOut, Search, Plus, Filter, AlertTriangle } from 'lucide-react';
import MobileCard from '../../components/common/MobileCard';
import '../../styles/GlobalDesign.css';
import { getLockers, releaseLocker } from '../../api/staff/lockerApi';

const ReleaseLocker = () => {
    const navigate = useNavigate();
    const [occupiedLockers, setOccupiedLockers] = useState([]);

    useEffect(() => {
        loadLockers();
    }, []);

    const loadLockers = async () => {
        const allLockers = await getLockers();
        const occupied = allLockers.filter(l => l.status === 'Occupied').map(l => ({
            id: l.id,
            name: l.assignee || 'Unknown Member',
            locker: l.number,
            assigned: '2023-01-01',
            expiry: '2023-12-31'
        }));
        setOccupiedLockers(occupied);
    };

    const handleRelease = async (id) => {
        if (window.confirm("Are you sure you want to release this locker?")) {
            const result = await releaseLocker(id);
            if (result.success) {
                alert(result.message);
                loadLockers();
            } else {
                alert(result.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 animate-fadeIn">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6 flex-shrink-0">
                                <LogOut size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Release Locker
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse whitespace-nowrap">
                                        Admin Mode
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">Manage and release occupied lockers for upcoming members</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/staff/lockers/assign')}
                            className="group flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            Assign New Locker
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search locker or member name..."
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="w-full hidden md:table">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                            <tr>
                                <th className="py-5 px-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Member</th>
                                <th className="py-5 px-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Locker #</th>
                                <th className="py-5 px-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Assigned</th>
                                <th className="py-5 px-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                                <th className="py-5 px-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {occupiedLockers.map((row) => (
                                <tr key={row.id} className="group hover:bg-violet-50/30 transition-colors duration-200">
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                {(row.name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{row.name}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Premium Member</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-black border border-violet-100">
                                            <Lock size={12} className="mr-1.5" />
                                            {row.locker}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="text-sm font-medium text-slate-500">{row.assigned}</div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <Calendar size={14} className="text-slate-400" />
                                            {row.expiry}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-right">
                                        <button
                                            onClick={() => handleRelease(row.id)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md"
                                        >
                                            <LogOut size={14} />
                                            Release
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="md:hidden p-4 space-y-4">
                        {occupiedLockers.map((row) => (
                            <MobileCard
                                key={row.id}
                                title={row.name}
                                subtitle="Premium Member"
                                badge={`#${row.locker}`}
                                badgeColor="violet"
                                fields={[
                                    { label: 'Assigned', value: row.assigned },
                                    { label: 'Expiry', value: row.expiry, icon: Calendar }
                                ]}
                                actions={[
                                    {
                                        label: 'Release Locker',
                                        icon: LogOut,
                                        onClick: () => handleRelease(row.id),
                                        variant: 'danger'
                                    }
                                ]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReleaseLocker;
