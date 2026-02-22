import React, { useState, useEffect } from 'react';
import { Lock, Search, Filter, Plus, ShieldCheck, ShieldAlert, Wrench, MoreVertical, RefreshCw, UserPlus, LogOut, Info } from 'lucide-react';
import { getLockers } from '../../api/staff/lockerApi';
import RightDrawer from '../../components/common/RightDrawer';
import LockerFormDrawer from './LockerFormDrawer';
import LockerDetailDrawer from './LockerDetailDrawer';
import CreateLockerDrawer from './CreateLockerDrawer';

const LockerManagement = () => {
    const [lockers, setLockers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [selectedLocker, setSelectedLocker] = useState(null);

    useEffect(() => {
        loadLockers();
    }, []);

    const loadLockers = async () => {
        setLoading(true);
        try {
            const data = await getLockers();
            setLockers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (locker) => {
        setSelectedLocker(locker);
        if (locker.status === 'Available') {
            setIsAssignDrawerOpen(true);
        } else {
            setIsDetailDrawerOpen(true);
        }
    };

    const filteredLockers = lockers.filter(l => {
        const matchesSearch = l.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.assignee && l.assignee.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'All' || l.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: lockers.length,
        available: lockers.filter(l => l.status === 'Available').length,
        occupied: lockers.filter(l => l.status === 'Occupied').length,
        maintenance: lockers.filter(l => l.status === 'Maintenance').length
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/20 min-h-screen p-6 md:p-8 font-sans">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="relative">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
                        <h1 className="relative text-3xl md:text-4xl font-black text-slate-800 flex items-center gap-3">
                            <Lock className="text-violet-600" size={32} />
                            Locker Management
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Monitor and manage facility storage units</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex overflow-x-auto no-scrollbar max-w-[calc(100vw-6rem)] md:max-w-none bg-white/60 backdrop-blur-sm border-2 border-slate-100 rounded-2xl p-1 shadow-sm">
                            {['All', 'Available', 'Occupied', 'Maintenance'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterStatus === s
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                                        : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <button className="p-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:text-violet-600 hover:border-violet-100 transition-all shadow-sm">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-10">
                {[
                    { label: 'Total Units', value: stats.total, color: 'slate', icon: Lock },
                    { label: 'Available', value: stats.available, color: 'emerald', icon: ShieldCheck },
                    { label: 'Occupied', value: stats.occupied, color: 'amber', icon: ShieldAlert },
                    { label: 'Maintenance', value: stats.maintenance, color: 'rose', icon: Wrench },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white/60 backdrop-blur-md border border-white/50 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-150 transition-transform duration-700 text-${item.color}-900`}>
                            <item.icon size={120} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-800">{item.value}</span>
                            <span className={`text-${item.color}-500 text-[10px] font-bold`}>Units</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Actions */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-all" size={20} />
                    <input
                        type="text"
                        placeholder="Search by locker number or member..."
                        className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-violet-500 transition-all shadow-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsCreateDrawerOpen(true)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-violet-600 transition-all shadow-xl shadow-slate-200"
                >
                    <Plus size={20} /> Add New Units
                </button>
            </div>

            {/* Table View */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Lockers...</p>
                    </div>
                ) : (
                    <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[32px] shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Locker Number</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned To</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Billing</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLockers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-24 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-4">
                                                        <Lock size={32} />
                                                    </div>
                                                    <h3 className="text-lg font-black text-slate-800">No Lockers Found</h3>
                                                    <p className="text-slate-500 text-sm mt-1">Try adjusting your filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLockers.map(locker => (
                                            <tr key={locker.id} className="group hover:bg-violet-50/30 transition-colors border-b border-slate-50 last:border-0">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${locker.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : locker.status === 'Occupied' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                                                            <Lock size={18} />
                                                        </div>
                                                        <span className="font-black text-slate-800 tracking-tight text-lg">{locker.number}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {locker.assignee ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-[10px] font-black text-violet-600">
                                                                {locker.assignee.charAt(0)}
                                                            </div>
                                                            <span className="font-bold text-slate-700 text-sm">{locker.assignee}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 font-medium">—</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${locker.status === 'Available'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : locker.status === 'Occupied'
                                                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                                : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                            {locker.status === 'Available' ? 'Free' : locker.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center">
                                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${locker.isPaid ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                            {locker.isPaid ? 'Paid' : 'Free'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleAction(locker)}
                                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${locker.status === 'Available'
                                                            ? 'bg-slate-900 text-white hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-200'
                                                            : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`}>
                                                        {locker.status === 'Available' ? 'Assign' : 'Release'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Drawers */}
            <LockerFormDrawer
                isOpen={isAssignDrawerOpen}
                onClose={() => setIsAssignDrawerOpen(false)}
                selectedLocker={selectedLocker}
                onSuccess={loadLockers}
            />

            <LockerDetailDrawer
                isOpen={isDetailDrawerOpen}
                onClose={() => setIsDetailDrawerOpen(false)}
                selectedLocker={selectedLocker}
                onSuccess={loadLockers}
            />

            <CreateLockerDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
                onSuccess={() => {
                    loadLockers();
                    alert("Locker created successfully!");
                }}
            />
        </div>
    );
};

export default LockerManagement;
