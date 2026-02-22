import React, { useState, useEffect } from 'react';
import { lockerApi } from '../../../api/lockerApi';
import toast from 'react-hot-toast';
import { Lock, Unlock, Clock, AlertCircle, User, Sparkles } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import LockerDetailsDrawer from './LockerDetailsDrawer';

const LockerManagement = () => {
    const [lockers, setLockers] = useState([]);
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLockers();
    }, []);

    const fetchLockers = async () => {
        try {
            setLoading(true);
            const data = await lockerApi.getAllLockers();
            setLockers(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load lockers');
        } finally {
            setLoading(false);
        }
    };

    const handleLockerClick = (locker) => {
        setSelectedLocker(locker);
        setIsDrawerOpen(true);
    };

    const handleAssign = async (memberName) => {
        try {
            await lockerApi.assignLocker(selectedLocker.id, { memberName });
            toast.success("Locker assigned successfully");
            fetchLockers();
            setIsDrawerOpen(false);
        } catch (error) {
            toast.error("Failed to assign locker");
        }
    };

    const handleRelease = async () => {
        try {
            await lockerApi.releaseLocker(selectedLocker.id);
            toast.success("Locker released successfully");
            fetchLockers();
            setIsDrawerOpen(false);
        } catch (error) {
            toast.error("Failed to release locker");
        }
    };

    const getStatusConfig = (status) => {
        const config = {
            'Available': { gradient: 'from-emerald-500 to-emerald-600', icon: Unlock, shadow: 'shadow-emerald-500/50', border: 'border-emerald-200' },
            'Occupied': { gradient: 'from-blue-500 to-indigo-600', icon: Lock, shadow: 'shadow-blue-500/50', border: 'border-blue-200' },
            'Reserved': { gradient: 'from-amber-500 to-orange-600', icon: Clock, shadow: 'shadow-amber-500/50', border: 'border-amber-200' },
            'Maintenance': { gradient: 'from-red-500 to-red-600', icon: AlertCircle, shadow: 'shadow-red-500/50', border: 'border-red-200' },
        };
        return config[status] || config['Available'];
    };

    const stats = {
        available: lockers.filter(l => l.status === 'Available').length,
        occupied: lockers.filter(l => l.status === 'Occupied').length,
        reserved: lockers.filter(l => l.status === 'Reserved').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6 flex-shrink-0">
                            <Lock size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    Locker Management
                                </h1>
                                <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse flex-shrink-0">
                                    PREMIUM ✨
                                </span>
                            </div>
                            <p className="text-slate-600 text-xs sm:text-sm mt-1">Manage locker assignments and availability</p>
                        </div>
                        <button
                            onClick={async () => {
                                const newId = prompt('Enter new locker number (e.g. A-101):');
                                if (!newId) return;
                                try {
                                    await lockerApi.addLocker({ number: newId });
                                    toast.success('Locker added');
                                    fetchLockers();
                                } catch (e) {
                                    toast.error('Failed to add locker');
                                }
                            }}
                            className="ml-auto bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-violet-600 transition-colors"
                        >
                            + Add Locker
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-3 sm:p-6 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 text-center">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/50 group-hover:scale-110 transition-transform duration-300">
                            <Unlock size={16} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                        </div>
                        <div className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-1">{stats.available}</div>
                        <div className="text-[10px] sm:text-sm font-bold text-slate-600">Available</div>
                    </div>
                </div>

                <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-3 sm:p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 text-center">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                            <Lock size={16} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                        </div>
                        <div className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-1">{stats.occupied}</div>
                        <div className="text-[10px] sm:text-sm font-bold text-slate-600">Occupied</div>
                    </div>
                </div>

                <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-3 sm:p-6 hover:shadow-xl hover:border-amber-200 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 text-center">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/50 group-hover:scale-110 transition-transform duration-300">
                            <Clock size={16} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                        </div>
                        <div className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent mb-1">{stats.reserved}</div>
                        <div className="text-[10px] sm:text-sm font-bold text-slate-600">Reserved</div>
                    </div>
                </div>
            </div>

            {/* Premium Locker Grid */}
            <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 hover:shadow-2xl hover:border-violet-200 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl"></div>

                <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                            <Lock size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
                        </div>
                        All Lockers
                    </h3>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4">
                        {lockers.map((locker) => {
                            const config = getStatusConfig(locker.status);
                            const Icon = config.icon;
                            return (
                                <div
                                    key={locker.id}
                                    onClick={() => handleLockerClick(locker)}
                                    className={`group/locker relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${config.border} bg-gradient-to-br ${config.gradient} text-white text-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl ${config.shadow} hover:-translate-y-1`}
                                >
                                    <Icon size={20} className="sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 group-hover/locker:scale-125 transition-transform duration-300" strokeWidth={2.5} />
                                    <div className="font-black text-sm sm:text-lg">{locker.id}</div>
                                    <div className="text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-1 opacity-90">{locker.status}</div>
                                    {locker.member && (
                                        <div className="text-[8px] sm:text-[10px] mt-0.5 sm:mt-1 opacity-75 truncate">{locker.member}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Premium Locker Details Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Locker Details"
            >
                <LockerDetailsDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    locker={selectedLocker}
                    onAssign={handleAssign}
                    onRelease={handleRelease}
                />
            </RightDrawer>
        </div>
    );
};

export default LockerManagement;
