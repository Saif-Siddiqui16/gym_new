import React, { useState, useEffect } from 'react';
import { lockerApi } from '../../../api/lockerApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import {
    Search,
    Lock,
    Unlock,
    Key,
    User,
    Settings,
    ChevronDown,
    LayoutGrid,
    List,
    AlertCircle,
    Package,
    Activity,
    Clock,
    Filter,
    X,
    Plus
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import RightDrawer from '../../../components/common/RightDrawer';
import AddLockerDrawer from './AddLockerDrawer';
import BulkCreateLockersDrawer from './BulkCreateLockersDrawer';
import LockerDetailsDrawer from './LockerDetailsDrawer';

const LockerManagement = () => {
    const { selectedBranch } = useBranchContext();
    const [lockers, setLockers] = useState([]);
    const [stats, setStats] = useState({ total: 0, available: 0, assigned: 0, maintenance: 0, occupancyRate: 0 });
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [activeTab, setActiveTab] = useState('Overview');
    const [viewMode, setViewMode] = useState('grid');

    // Drawers
    const [drawerType, setDrawerType] = useState(null); // 'add', 'bulk', 'details'
    const [selectedLocker, setSelectedLocker] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [lockerData, statsData] = await Promise.all([
                lockerApi.getAllLockers({
                    branchId: selectedBranch,
                    search: searchTerm,
                    status: statusFilter === 'All Status' ? null : statusFilter
                }),
                lockerApi.getStats({ branchId: selectedBranch })
            ]);
            setLockers(lockerData);
            setStats(statsData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load locker data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedBranch, searchTerm, statusFilter]);

    const openDrawer = (type, data = null) => {
        setDrawerType(type);
        setSelectedLocker(data);
    };

    const closeDrawer = () => {
        setDrawerType(null);
        setSelectedLocker(null);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 pb-24">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-100">
                            <Lock size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Locker Management</h1>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Manage assignments and availability</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => openDrawer('bulk')}
                            variant="outline"
                            className="h-11 px-6 rounded-xl"
                            icon={Settings}
                        >
                            Bulk Create
                        </Button>
                        <Button
                            onClick={() => openDrawer('add')}
                            variant="primary"
                            className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform active:scale-95"
                            icon={Plus}
                        >
                            Add Locker
                        </Button>
                    </div>
                </div>

                {/* KPI Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Lockers" value={stats.total} icon={Package} color="indigo" />
                    <StatCard title="Available" value={stats.available} icon={Unlock} color="emerald" />
                    <StatCard title="Assigned" value={stats.assigned} icon={User} color="blue" subtitle={`${stats.occupancyRate}% Occupancy`} />
                    <StatCard title="Maintenance" value={stats.maintenance} icon={AlertCircle} color="amber" />
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                    {/* Filters Toolbar */}
                    <div className="p-6 border-b-2 border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search locker number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 h-12 bg-slate-50 border-2 border-transparent focus:border-violet-600 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="relative w-48 hidden md:block">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 h-12 bg-slate-50 border-2 border-transparent focus:border-violet-600 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option>All Status</option>
                                    <option>Available</option>
                                    <option>Assigned</option>
                                    <option>Maintenance</option>
                                    <option>Reserved</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
                                <TabButton active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')}>Overview</TabButton>
                                <TabButton active={activeTab === 'Assigned'} onClick={() => setActiveTab('Assigned')}>Member List</TabButton>
                            </div>
                            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
                                <IconButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={LayoutGrid} />
                                <IconButton active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={List} />
                            </div>
                        </div>
                    </div>

                    {/* Table/Grid Content */}
                    <div className="p-8">
                        {loading ? (
                            <div className="h-96 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin"></div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Lockers...</p>
                            </div>
                        ) : lockers.length === 0 ? (
                            <div className="h-96 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
                                    <Lock size={40} />
                                </div>
                                <h3 className="text-xl font-black text-slate-400 uppercase">No Lockers Found</h3>
                                <p className="text-sm font-bold text-slate-300 mt-2 uppercase tracking-wide">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'Overview' ? (
                                    viewMode === 'grid' ? (
                                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                                            {lockers.map((locker) => (
                                                <LockerCard key={locker.id} locker={locker} onClick={() => openDrawer('details', locker)} />
                                            ))}
                                        </div>
                                    ) : (
                                        <LockerTable lockers={lockers} onRowClick={(l) => openDrawer('details', l)} />
                                    )
                                ) : (
                                    <AssignedMemberTable lockers={lockers.filter(l => l.status === 'Assigned')} onRowClick={(l) => openDrawer('details', l)} />
                                )}
                            </>
                        )}
                    </div>

                    {/* Legend */}
                    {!loading && lockers.length > 0 && activeTab === 'Overview' && (
                        <div className="p-6 bg-slate-50/50 border-t-2 border-slate-50 flex items-center gap-6 justify-center flex-wrap">
                            <LegendItem color="bg-emerald-500" label="Available" />
                            <LegendItem color="bg-violet-500" label="Assigned" />
                            <LegendItem color="bg-amber-500" label="Maintenance" />
                            <LegendItem color="bg-violet-500" label="Reserved" />
                            <LegendItem color="bg-rose-500" label="Expired" />
                        </div>
                    )}
                </div>
            </div>

            {/* Forms / Drawers */}
            <RightDrawer
                isOpen={drawerType === 'add'}
                onClose={closeDrawer}
                title="Add New Locker"
                subtitle="Create a single locker entry"
            >
                <AddLockerDrawer
                    onClose={closeDrawer}
                    onSuccess={loadData}
                />
            </RightDrawer>

            <RightDrawer
                isOpen={drawerType === 'bulk'}
                onClose={closeDrawer}
                title="Bulk Create Lockers"
                subtitle="Create multiple lockers at once"
            >
                <BulkCreateLockersDrawer
                    onClose={closeDrawer}
                    onSuccess={loadData}
                />
            </RightDrawer>

            {/* Details Drawer (Outside main flow) */}
            {drawerType === 'details' && (
                <RightDrawer
                    isOpen={drawerType === 'details'}
                    onClose={closeDrawer}
                    title="Locker details"
                    subtitle={`Manage Locker #${selectedLocker?.number}`}
                >
                    <LockerDetailsDrawer
                        locker={selectedLocker}
                        onClose={closeDrawer}
                        onSuccess={loadData}
                    />
                </RightDrawer>
            )}
        </div>
    );
};

/* ── UI Components ── */

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colorMap = {
        indigo: 'bg-violet-50 text-violet-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-violet-50 text-violet-600',
        amber: 'bg-amber-50 text-amber-600'
    };
    return (
        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm flex items-center justify-between group hover:border-violet-100 transition-all">
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <div className="flex flex-col">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h2>
                    {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subtitle}</p>}
                </div>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${colorMap[color]} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
    >
        {children}
    </button>
);

const IconButton = ({ active, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-xl transition-all ${active ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
    >
        <Icon size={18} />
    </button>
);

const LockerCard = ({ locker, onClick }) => {
    const isAvailable = locker.status === 'Available';
    const isAssigned = locker.status === 'Assigned';
    const isMaintenance = locker.status === 'Maintenance';
    const isReserved = locker.status === 'Reserved';
    const isExpired = isAssigned && locker.assignedTo?.expiryDate && new Date(locker.assignedTo.expiryDate) < new Date();

    let style = "bg-white border-slate-200 text-slate-400";
    let iconColor = "text-slate-400";
    let dotColor = "bg-slate-300";

    if (isAvailable) { style = "bg-emerald-50 border-emerald-100 text-emerald-700"; iconColor = "text-emerald-500"; dotColor = "bg-emerald-500"; }
    else if (isAssigned) {
        if (isExpired) { style = "bg-rose-50 border-rose-200 text-rose-700"; iconColor = "text-rose-500"; dotColor = "bg-rose-500"; }
        else { style = "bg-violet-50 border-violet-100 text-violet-700"; iconColor = "text-violet-500"; dotColor = "bg-violet-500"; }
    }
    else if (isMaintenance) { style = "bg-amber-50 border-amber-200 text-amber-700"; iconColor = "text-amber-500"; dotColor = "bg-amber-500"; }
    else if (isReserved) { style = "bg-violet-50 border-violet-200 text-violet-700"; iconColor = "text-violet-500"; dotColor = "bg-violet-500"; }

    return (
        <div
            onClick={onClick}
            className={`relative flex flex-col items-center justify-center p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group shadow-sm ${style}`}
        >
            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${dotColor} ${isExpired ? 'animate-pulse' : ''}`} />
            <Lock size={22} className={`mb-2 ${iconColor} opacity-80 group-hover:rotate-12 transition-transform`} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-widest">{locker.number}</span>
        </div>
    );
};

const LockerTable = ({ lockers, onRowClick }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Number</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {lockers.map(locker => (
                    <tr key={locker.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => onRowClick(locker)}>
                        <td className="px-6 py-4 font-black text-slate-900">{locker.number}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{locker.size}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{locker.area || '--'}</td>
                        <td className="px-6 py-4">
                            <StatusBadge status={locker.status} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const AssignedMemberTable = ({ lockers, onRowClick }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Locker</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {lockers.map(locker => (
                    <tr key={locker.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onRowClick(locker)}>
                        <td className="px-6 py-4 font-black text-slate-900"># {locker.number}</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-800">{locker.assignedTo?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{locker.assignedTo?.memberId || '--'}</td>
                        <td className="px-6 py-4">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${new Date(locker.assignedTo?.expiryDate) < new Date() ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                {locker.assignedTo?.expiryDate ? new Date(locker.assignedTo.expiryDate).toLocaleDateString('en-GB') : '--'}
                            </span>
                        </td>
                    </tr>
                ))}
                {lockers.length === 0 && (
                    <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-xs">No active assignments</td></tr>
                )}
            </tbody>
        </table>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Available: 'bg-emerald-50 text-emerald-700',
        Assigned: 'bg-violet-50 text-violet-700',
        Maintenance: 'bg-amber-50 text-amber-700',
        Reserved: 'bg-violet-50 text-violet-700'
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
            {status}
        </span>
    );
};

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
);


export default LockerManagement;
