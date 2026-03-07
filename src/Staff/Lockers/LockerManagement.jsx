import React, { useState, useEffect } from 'react';
import { Lock, Search, Filter, Plus, ShieldCheck, ShieldAlert, Wrench, MoreVertical, RefreshCw, UserPlus, LogOut, Info, Box, LayoutGrid, List, User, Key, Users } from 'lucide-react';
import { getLockers } from '../../api/staff/lockerApi';
import RightDrawer from '../../components/common/RightDrawer';
import LockerFormDrawer from './LockerFormDrawer';
import LockerDetailDrawer from './LockerDetailDrawer';
import CreateLockerDrawer from './CreateLockerDrawer';
import BulkCreateLockersDrawer from '../../modules/operations/pages/BulkCreateLockersDrawer';
import StatsCard from '../../modules/dashboard/components/StatsCard';

import { useBranchContext } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LockerManagement = () => {
    const { selectedBranch } = useBranchContext();
    const { user } = useAuth();
    const [lockers, setLockers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All Status');
    const [activeTab, setActiveTab] = useState('Overview');
    const [viewMode, setViewMode] = useState('grid');

    const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
    const [selectedLocker, setSelectedLocker] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getLockers();
            // Filter by branch if selectedBranch is not 'all'
            // Although backend already filters by user.tenantId for staff
            setLockers(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load lockers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedBranch]);

    // Initial mock stats to match screenshot
    const stats = {
        total: lockers.length,
        available: lockers.filter(l => l.status === 'Available').length,
        assigned: lockers.filter(l => l.status === 'Occupied' || l.status === 'Assigned').length,
        maintenance: lockers.filter(l => l.status === 'Maintenance').length,
        occupancy: lockers.length > 0 ? `${Math.round((lockers.filter(l => l.status !== 'Available').length / lockers.length) * 100)}%` : '0%'
    };

    const filteredLockers = lockers.filter(locker => {
        const matchesSearch = locker.number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All Status' || locker.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleAction = (locker) => {
        setSelectedLocker(locker);
        if (locker.status === 'Available') {
            setIsAssignDrawerOpen(true);
        } else {
            setIsDetailDrawerOpen(true);
        }
    };

    return (
        <div className="min-h-screen space-y-8 animate-fadeIn text-slate-900">
            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 text-white cursor-pointer hover:scale-105 transition-transform">
                        <Box size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Locker Management</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage locker assignments, rentals, and availability</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsBulkCreateOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Box size={16} /> Bulk Create
                    </button>
                    <button
                        onClick={() => setIsCreateDrawerOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-violet-200"
                    >
                        <Plus size={16} /> Add Locker
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Lockers"
                    value={stats.total.toString()}
                    icon={Box}
                    color="primary"
                    subtitle="Inventory capacity"
                />
                <StatsCard
                    title="Available"
                    value={stats.available.toString()}
                    icon={Users}
                    color="success"
                    subtitle="Ready for assignment"
                />
                <StatsCard
                    title="Assigned"
                    value={stats.assigned.toString()}
                    icon={User}
                    color="info"
                    subtitle={`${stats.occupancy} occupancy`}
                />
                <StatsCard
                    title="Maintenance"
                    value={stats.maintenance.toString()}
                    icon={Key}
                    color="warning"
                    subtitle="Locked for repair"
                />
            </div>

            {/* View Controls & Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            placeholder="Search lockers..."
                            className="w-full h-12 pl-11 pr-5 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="h-12 px-5 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:border-primary transition-all cursor-pointer shadow-sm min-w-[160px] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                    >
                        <option>All Status</option>
                        <option>Available</option>
                        <option>Assigned</option>
                        <option>Maintenance</option>
                        <option>Reserved</option>
                    </select>
                </div>
                <div className="flex items-center p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-violet-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-violet-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Tabs & Main Content */}
            <div className="space-y-6">
                <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm w-fit">
                    {['Overview', `Assigned (${stats.assigned})`].map((tab) => {
                        const label = tab.includes('Overview') ? 'Overview' : 'Assigned';
                        return (
                            <button
                                key={label}
                                onClick={() => setActiveTab(label)}
                                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === label ? 'bg-primary-light text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'Overview' ? (
                    /* Locker Map Card (Overview Content) */
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-5 sm:p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Locker Map</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredLockers.length} / {lockers.length} lockers</span>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading lockers...</p>
                                </div>
                            ) : filteredLockers.length === 0 ? (
                                <>
                                    <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                                        <Lock size={40} strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-slate-400 text-sm font-black uppercase tracking-widest">No lockers found</h4>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 w-full">
                                    {filteredLockers.map(locker => (
                                        <div
                                            key={locker.id}
                                            onClick={() => handleAction(locker)}
                                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer border-2 transition-all group scale-100 hover:scale-105 ${locker.status === 'Available' ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-300' :
                                                locker.status === 'Occupied' || locker.status === 'Assigned' ? 'bg-slate-50 border-slate-100 hover:border-slate-300' :
                                                    locker.status === 'Maintenance' ? 'bg-amber-50 border-amber-100 hover:border-amber-300' :
                                                        'bg-primary-light border-violet-100 hover:border-violet-300'
                                                }`}
                                        >
                                            <Lock size={20} className={`${locker.status === 'Available' ? 'text-emerald-500' :
                                                locker.status === 'Occupied' || locker.status === 'Assigned' ? 'text-slate-400' :
                                                    locker.status === 'Maintenance' ? 'text-amber-500' :
                                                        'text-primary'
                                                }`} />
                                            <span className="text-xs font-black text-slate-700">{locker.number}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="p-5 sm:p-8 bg-slate-50/50 flex flex-wrap gap-6 border-t border-slate-50">
                            {[
                                { label: 'Available', color: 'bg-green-400' },
                                { label: 'Assigned', color: 'bg-slate-400' },
                                { label: 'Maintenance', color: 'bg-orange-400' },
                                { label: 'Reserved', color: 'bg-violet-300' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm shadow-slate-200`} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Assigned Lockers Content */
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-5 sm:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Assigned Lockers</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stats.assigned} active assignments</span>
                        </div>

                        {stats.assigned > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-50 bg-white">
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Locker</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {lockers.filter(l => l.status === 'Occupied' || l.status === 'Assigned').map(locker => (
                                            <tr key={locker.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-10 py-5 text-sm font-bold text-slate-700">Locker #{locker.number}</td>
                                                <td className="px-10 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-primary flex items-center justify-center text-[10px] font-black">
                                                            {locker.assignedTo?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{locker.assignedTo?.name || 'N/A'}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{locker.assignedTo?.memberId || 'MEM-XXX'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-5">
                                                    <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        {locker.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-5 text-right">
                                                    <button
                                                        onClick={() => handleAction(locker)}
                                                        className="p-2.5 text-slate-400 hover:text-primary transition-colors"
                                                    >
                                                        <Info size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Table Body / Empty State */
                            <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-20 text-center animate-fadeIn">
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center text-slate-200 rotation-slow">
                                        <Key size={48} className="md:w-16 md:h-16 text-slate-300" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-50 flex items-center justify-center text-primary animate-bounce">
                                        <Lock size={20} />
                                    </div>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">No lockers currently assigned</h3>
                                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-4 max-w-xs leading-relaxed opacity-70">
                                    Assigned lockers will appear here in a detailed list once members rent them
                                </p>

                                <div className="mt-10">
                                    <button
                                        onClick={() => setActiveTab('Overview')}
                                        className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                                    >
                                        Go to Map to Assign
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Drawers */}
            <LockerFormDrawer
                isOpen={isAssignDrawerOpen}
                onClose={() => setIsAssignDrawerOpen(false)}
                selectedLocker={selectedLocker}
                onSuccess={loadData}
            />

            <LockerDetailDrawer
                isOpen={isDetailDrawerOpen}
                onClose={() => setIsDetailDrawerOpen(false)}
                selectedLocker={selectedLocker}
                onSuccess={loadData}
            />

            <CreateLockerDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
                onSuccess={loadData}
            />

            <RightDrawer
                isOpen={isBulkCreateOpen}
                onClose={() => setIsBulkCreateOpen(false)}
            >
                <BulkCreateLockersDrawer
                    onClose={() => setIsBulkCreateOpen(false)}
                    onSuccess={loadData}
                />
            </RightDrawer>
        </div>
    );
};

export default LockerManagement;
