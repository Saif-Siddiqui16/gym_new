import React, { useState, useEffect } from 'react';
import { equipmentApi } from '../../../api/equipmentApi';
import toast from 'react-hot-toast';
import {
    History,
    Wrench,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Search,
    Calendar,
    Package,
    ArrowUpRight,
    Filter,
    ChevronRight,
    XCircle
} from 'lucide-react';

const ServiceHistoryPage = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    const tabs = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

    useEffect(() => {
        fetchHistory();
    }, [activeTab]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (activeTab !== 'All') {
                filters.status = activeTab;
            }
            const data = await equipmentApi.getMaintenanceRequests(filters);
            setRecords(data);
        } catch (error) {
            console.error("Failed to fetch service history:", error);
            toast.error("Failed to load service history");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await equipmentApi.updateMaintenanceStatus(id, newStatus);
            toast.success("Status updated successfully");
            fetchHistory();
            if (selectedRecord?.id === id) {
                setSelectedRecord(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredRecords = records.filter(r => {
        const equipName = r.equipment?.name?.toLowerCase() || '';
        const issue = r.issue?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return equipName.includes(term) || issue.includes(term) || `#T-${r.id}`.toLowerCase().includes(term);
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'In Progress': return <Clock size={14} className="text-amber-500" />;
            case 'Cancelled': return <XCircle size={14} className="text-red-500" />;
            default: return <Clock size={14} className="text-blue-500" />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
            case 'Pending': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    // Stats
    const totalRecords = records.length;
    const completed = records.filter(r => r.status === 'Completed').length;
    const inProgress = records.filter(r => r.status === 'In Progress').length;
    const pending = records.filter(r => r.status === 'Pending').length;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
                                    <History size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Service History</h1>
                                    <p className="text-slate-500 text-sm font-medium">Complete log of all equipment maintenance and service records</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Records</p>
                                <p className="text-2xl font-black text-slate-800 mt-1">{totalRecords}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Completed</p>
                                <p className="text-2xl font-black text-emerald-700 mt-1">{completed}</p>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">In Progress</p>
                                <p className="text-2xl font-black text-amber-700 mt-1">{inProgress}</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Pending</p>
                                <p className="text-2xl font-black text-blue-700 mt-1">{pending}</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap
                                        ${activeTab === tab
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by equipment name, issue, or ticket ID..."
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all font-medium text-slate-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : (
                    <>
                        {filteredRecords.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-20 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No service records found</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    {activeTab !== 'All'
                                        ? `No ${activeTab.toLowerCase()} records at this time.`
                                        : 'All equipment is running smoothly. No service history yet.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipment</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredRecords.map(record => (
                                                <tr
                                                    key={record.id}
                                                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                                    onClick={() => setSelectedRecord(record)}
                                                >
                                                    <td className="px-6 py-5">
                                                        <span className="text-xs font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase">
                                                            #T-{record.id}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                                                                <Package size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm">{record.equipment?.name || 'Unknown'}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold">{record.equipment?.category || ''}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-xs font-semibold text-slate-600 max-w-[200px] truncate">{record.issue}</p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getPriorityStyle(record.priority)}`}>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                                            {record.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                            <Calendar size={12} className="text-slate-400" />
                                                            {new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(record.status)}`}>
                                                            {getStatusIcon(record.status)}
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                                                        <select
                                                            className="text-[10px] font-black uppercase tracking-tight bg-slate-50 border-none rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                                            value={record.status}
                                                            onChange={(e) => handleStatusUpdate(record.id, e.target.value)}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Completed">Completed</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="lg:hidden space-y-4">
                                    {filteredRecords.map(record => (
                                        <div
                                            key={record.id}
                                            className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4 cursor-pointer active:scale-[0.98] transition-all ${record.priority === 'Critical' ? 'border-l-4 border-l-red-500' : ''}`}
                                            onClick={() => setSelectedRecord(record)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <Wrench size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{record.equipment?.name || 'Unknown'}</h4>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">#T-{record.id}</span>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(record.status)}`}>
                                                    {getStatusIcon(record.status)}
                                                    {record.status}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-600 font-medium line-clamp-2">{record.issue}</p>

                                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                                                    <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityStyle(record.priority)}`}>
                                                        {record.priority}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                                    <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1">
                                                        <Calendar size={12} className="text-slate-300" />
                                                        {new Date(record.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-1" onClick={e => e.stopPropagation()}>
                                                <select
                                                    className="text-[10px] font-black uppercase tracking-tight bg-slate-50 border-none rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                                    value={record.status}
                                                    onChange={(e) => handleStatusUpdate(record.id, e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); }}
                                                    className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                                                >
                                                    Details <ChevronRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Detail Drawer */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300"
                            onClick={() => setSelectedRecord(null)}
                        ></div>
                        <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
                            <div className="relative w-screen sm:max-w-[440px] transform transition-transform duration-300 ease-in-out shadow-2xl">
                                <div className="flex h-full flex-col bg-white overflow-y-auto shadow-2xl">
                                    {/* Drawer Header */}
                                    <div className="px-6 py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
                                        <button
                                            onClick={() => setSelectedRecord(null)}
                                            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </button>
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                                                <Wrench size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black tracking-tight">Service Record</h2>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ticket #T-{selectedRecord.id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Drawer Body */}
                                    <div className="flex-1 p-6 space-y-6">
                                        {/* Issue */}
                                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Reported</p>
                                                    <p className="text-base font-black text-slate-800 mt-1">{selectedRecord.issue}</p>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusStyle(selectedRecord.status)}`}>
                                                    {getStatusIcon(selectedRecord.status)}
                                                    {selectedRecord.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl border-2 border-slate-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipment</p>
                                                <p className="text-sm font-bold text-slate-800 mt-1">{selectedRecord.equipment?.name || 'Unknown'}</p>
                                            </div>
                                            <div className="p-4 rounded-xl border-2 border-slate-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                                                <p className="text-sm font-bold text-slate-800 mt-1">{selectedRecord.equipment?.category || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 rounded-xl border-2 border-slate-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                                                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityStyle(selectedRecord.priority)}`}>
                                                    {selectedRecord.priority}
                                                </span>
                                            </div>
                                            <div className="p-4 rounded-xl border-2 border-slate-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Reported</p>
                                                <p className="text-sm font-bold text-slate-800 mt-1">
                                                    {new Date(selectedRecord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Equipment Info */}
                                        {selectedRecord.equipment && (
                                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-3">
                                                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                                                    <Package size={14} /> Equipment Details
                                                </p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-emerald-500">Brand</p>
                                                        <p className="text-xs font-bold text-emerald-900">{selectedRecord.equipment.brand || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-emerald-500">Location</p>
                                                        <p className="text-xs font-bold text-emerald-900">{selectedRecord.equipment.location || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-emerald-500">Serial Number</p>
                                                        <p className="text-xs font-bold text-emerald-900">{selectedRecord.equipment.serialNumber || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-emerald-500">Equipment Status</p>
                                                        <p className="text-xs font-bold text-emerald-900">{selectedRecord.equipment.status || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Update Status */}
                                        <div className="space-y-3">
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Update Status</p>
                                            <select
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                                                value={selectedRecord.status}
                                                onChange={(e) => handleStatusUpdate(selectedRecord.id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 py-4 border-t border-slate-100">
                                        <button
                                            onClick={() => setSelectedRecord(null)}
                                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceHistoryPage;
