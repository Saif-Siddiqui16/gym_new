import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Wrench,
    Monitor,
    AlertCircle,
    CheckCircle2,
    Info,
    Calendar,
    Archive,
    Trash2,
    Edit2,
    MoreVertical,
    History,
    FileText,
    TrendingUp,
    Settings,
    Banknote,
    Clock
} from 'lucide-react';
import { equipmentApi } from '../../../api/equipmentApi';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';
import RightDrawer from '../../../components/common/RightDrawer';
import AddEquipmentDrawer from './AddEquipmentDrawer';

const EquipmentListPage = () => {
    const { selectedBranch } = useBranchContext();
    const [equipment, setEquipment] = useState([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [stats, setStats] = useState({ total: 0, operational: 0, inMaintenance: 0, outOfOrder: 0, ytdCost: 0 });
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Equipment');
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const [equipmentData, statsData, logsData] = await Promise.all([
                equipmentApi.getAllEquipment({ branchId: selectedBranch, search: searchTerm }),
                equipmentApi.getStats({ branchId: selectedBranch }),
                equipmentApi.getMaintenanceRequests({ branchId: selectedBranch })
            ]);
            setEquipment(equipmentData);
            setStats(statsData);
            setMaintenanceLogs(logsData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load equipment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedBranch, searchTerm]);

    const handleAddEquipment = async (data) => {
        try {
            await equipmentApi.addEquipment({ ...data, tenantId: selectedBranch });
            toast.success('Equipment added successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to add equipment');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Operational':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'In Maintenance':
                return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Out of Order':
                return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Completed':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Pending':
                return 'bg-amber-50 text-amber-600 border-amber-100';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen p-4 sm:p-8 custom-scrollbar">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Equipment & Maintenance</h1>
                    <p className="text-slate-500 text-sm font-medium">Track assets, maintenance history, and service logs</p>
                </div>
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0a1b2e] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-[#1a2b3e] transition-all"
                >
                    <Plus size={16} strokeWidth={3} /> Add Equipment
                </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {/* Total Equipment */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-[#0a1b2e]/10 transition-all">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Total Equipment</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-3xl font-black text-slate-900 leading-none">{stats.total}</h2>
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Monitor size={20} />
                        </div>
                    </div>
                </div>

                {/* Operational */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-emerald-100 transition-all border-l-4 border-l-emerald-500">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Operational</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-3xl font-black text-emerald-600 leading-none">{stats.operational}</h2>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                </div>

                {/* In Maintenance */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-amber-100 transition-all border-l-4 border-l-amber-500">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">In Maintenance</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-3xl font-black text-amber-600 leading-none">{stats.inMaintenance}</h2>
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>

                {/* Out of Order */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-rose-100 transition-all border-l-4 border-l-rose-500">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Out of Order</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-3xl font-black text-rose-600 leading-none">{stats.outOfOrder}</h2>
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                </div>

                {/* YTD Maintenance Cost */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-blue-100 transition-all">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">YTD Maintenance Cost</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-black text-slate-900 leading-none tracking-tight">₹{stats.ytdCost.toLocaleString()}</h2>
                        <div className="w-10 h-10 bg-[#ff6b00]/5 rounded-xl flex items-center justify-center text-[#ff6b00] group-hover:scale-110 transition-transform">
                            <Banknote size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
                {/* Tabs & Search */}
                <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="flex p-1 bg-slate-50 rounded-2xl w-full lg:w-auto">
                        <button
                            onClick={() => setActiveTab('Equipment')}
                            className={`flex-1 lg:flex-none px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Equipment' ? 'bg-white shadow-sm text-slate-900 border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Equipment
                        </button>
                        <button
                            onClick={() => setActiveTab('MaintenanceLog')}
                            className={`flex-1 lg:flex-none px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'MaintenanceLog' ? 'bg-white shadow-sm text-slate-900 border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Maintenance Log
                        </button>
                    </div>

                    <div className="relative group w-full lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search equipment, serial number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-slate-200 transition-all"
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="p-8">
                    {activeTab === 'Equipment' ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 italic tracking-tight underline decoration-[#ff6b00]/20 decoration-4 underline-offset-8">All Equipment</h3>
                            </div>

                            <div className="saas-table-wrapper border-0 rounded-none">
                                <table className="saas-table saas-table-responsive w-full">
                                    <thead>
                                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                                            <th className="px-6 py-4">Equipment Info</th>
                                            <th className="px-6 py-4">Serial Number</th>
                                            <th className="px-6 py-4">Brand/Model</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Last Service</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {!loading && equipment.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-6" data-label="Equipment Info">
                                                    <div className="flex items-center gap-4 justify-end sm:justify-start">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all flex-shrink-0">
                                                            <Wrench size={18} />
                                                        </div>
                                                        <div className="flex flex-col text-right sm:text-left">
                                                            <span className="text-sm font-black text-slate-900">{item.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.location}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6" data-label="Serial Number">
                                                    <div className="text-right sm:text-left">
                                                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-widest">{item.serialNumber || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right sm:text-left font-bold text-xs text-slate-600" data-label="Brand/Model">
                                                    {item.brand} {item.model}
                                                </td>
                                                <td className="px-6 py-6" data-label="Category">
                                                    <div className="text-right sm:text-left">
                                                        <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6" data-label="Status">
                                                    <div className="flex justify-end sm:justify-start">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(item.status)}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Operational' ? 'bg-emerald-500' :
                                                                item.status === 'In Maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                                                                }`} />
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6" data-label="Last Service">
                                                    <div className="flex flex-col text-right sm:text-left">
                                                        <span className="text-xs font-bold text-slate-700">
                                                            {item.lastService ? new Date(item.lastService).toLocaleDateString() : 'No History'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Next: {item.nextService ? new Date(item.nextService).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right" data-label="Actions">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-100">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl shadow-sm transition-all border border-transparent hover:border-rose-100">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 italic tracking-tight underline decoration-[#ff6b00]/20 decoration-4 underline-offset-8">Maintenance History</h3>
                            </div>

                            <div className="saas-table-wrapper border-0 rounded-none">
                                <table className="saas-table saas-table-responsive w-full">
                                    <thead>
                                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                                            <th className="px-6 py-4">Equipment</th>
                                            <th className="px-6 py-4">Issue Reported</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Priority</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Cost</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {!loading && maintenanceLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-6" data-label="Equipment">
                                                    <div className="flex flex-col text-right sm:text-left">
                                                        <span className="text-sm font-black text-slate-900">{log.equipment?.name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.equipment?.serialNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6" data-label="Issue Reported">
                                                    <div className="flex flex-col text-right sm:text-left">
                                                        <span className="text-xs font-bold text-slate-700">{log.issue}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{log.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6" data-label="Date">
                                                    <div className="text-right sm:text-left">
                                                        <span className="text-xs font-bold text-slate-600">{new Date(log.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4" data-label="Priority">
                                                    <div className="flex justify-end sm:justify-start">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.priority === 'High' || log.priority === 'Critical' ? 'bg-rose-50 text-rose-600' :
                                                            log.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {log.priority}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6" data-label="Status">
                                                    <div className="flex justify-end sm:justify-start">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(log.status)}`}>
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right sm:text-left font-bold text-xs text-slate-900" data-label="Cost">
                                                    ₹{Number(log.cost).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-6 text-right" data-label="Action">
                                                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-100">
                                                        <FileText size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {loading && (
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0a1b2e] rounded-full animate-spin"></div>
                        </div>
                    )}

                    {!loading && (activeTab === 'Equipment' ? equipment.length === 0 : maintenanceLogs.length === 0) && (
                        <div className="h-[300px] flex flex-col items-center justify-center text-center px-8">
                            <Archive size={64} className="text-slate-100 mb-6" />
                            <h4 className="text-xl font-black text-slate-900 italic">No Data Found</h4>
                            <p className="text-slate-400 text-sm font-medium mt-2">No records found for the selected branch.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Add New Equipment"
            >
                <AddEquipmentDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onAdd={handleAddEquipment}
                />
            </RightDrawer>
        </div>
    );
};

export default EquipmentListPage;
