import React, { useState, useEffect } from 'react';
import { EQUIPMENT_STATUSES } from '../data/equipmentData';
import { equipmentApi } from '../../../api/equipmentApi';
import toast from 'react-hot-toast';
import {
    Wrench,
    Plus,
    Package,
    MapPin,
    Calendar,
    AlertTriangle,
    MoreVertical,
    Search,
    Filter,
    ArrowRight
} from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import RightDrawer from '../../../components/common/RightDrawer';
import ReportIssueModal from '../components/ReportIssueModal';
import AddEquipmentModal from '../components/AddEquipmentModal';

const EquipmentListPage = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // UI States
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    useEffect(() => {
        fetchEquipment();
    }, [searchTerm, filterCategory]);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (searchTerm) filters.search = searchTerm;
            if (filterCategory !== 'All') filters.category = filterCategory;

            const data = await equipmentApi.getAllEquipment(filters);
            setEquipment(data);
        } catch (error) {
            console.error("Failed to fetch equipment:", error);
            toast.error("Failed to load equipment inventory");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await equipmentApi.updateEquipment(id, { status: newStatus });
            toast.success("Status updated");
            fetchEquipment();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAddEquipment = async (newEquip) => {
        try {
            await equipmentApi.addEquipment(newEquip);
            toast.success("Equipment added successfully");
            setIsAddDrawerOpen(false);
            fetchEquipment();
        } catch (error) {
            toast.error("Failed to add equipment");
        }
    };

    const handleReportIssue = async (reportData) => {
        try {
            await equipmentApi.reportIssue(reportData);
            toast.success("Issue reported successfully");
            setIsReportDrawerOpen(false);
            fetchEquipment();
        } catch (error) {
            toast.error("Failed to submit report");
        }
    };

    const getStatusConfig = (status) => {
        return EQUIPMENT_STATUSES.find(s => s.label === status) || EQUIPMENT_STATUSES[0];
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                                <Package size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Equipment Inventory</h1>
                                <p className="text-slate-500 text-sm font-medium">Manage and track your gym facility assets</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddDrawerOpen(true)}
                                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus size={18} strokeWidth={3} />
                                Add Equipment
                            </button>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or serial number..."
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 outline-none transition-all font-medium text-slate-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="px-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 font-bold text-sm text-slate-600 focus:border-violet-500 outline-none transition-all"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                <option value="Cardio">Cardio</option>
                                <option value="Strength">Strength</option>
                                <option value="Free Weights">Free Weights</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Desktop View Table */}
                        <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipment / Brand</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category & Location</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Warranty</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {equipment.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-110 group-hover:bg-violet-100 group-hover:text-violet-600 transition-all">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold tracking-wider">{item.serialNumber || 'NO SERIAL'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">{item.category}</span>
                                                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                                        <MapPin size={10} /> {item.location}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <p className="text-xs font-bold text-slate-700">
                                                        {item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Warranty Info</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge
                                                    status={item.status}
                                                    color={getStatusConfig(item.status).color}
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <select
                                                        className="text-[10px] font-black uppercase tracking-tight bg-slate-50 border-none rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                                        value={item.status}
                                                        onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                                                    >
                                                        {EQUIPMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                    </select>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEquipment(item);
                                                            setIsReportDrawerOpen(true);
                                                        }}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Report Issue"
                                                    >
                                                        <AlertTriangle size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View Cards */}
                        <div className="lg:hidden space-y-4">
                            {equipment.map(item => (
                                <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{item.name}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.serialNumber || 'NO SERIAL'}</p>
                                            </div>
                                        </div>
                                        <StatusBadge
                                            status={item.status}
                                            color={getStatusConfig(item.status).color}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                            <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1">
                                                <MapPin size={12} className="text-slate-300" /> {item.location}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warranty</p>
                                            <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1">
                                                <Calendar size={12} className="text-slate-300" /> {item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => {
                                                setSelectedEquipment(item);
                                                setIsReportDrawerOpen(true);
                                            }}
                                            className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2"
                                        >
                                            <AlertTriangle size={14} /> Report Issue
                                        </button>
                                        <button className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Drawers */}
            <RightDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                title="Add New Equipment"
            >
                <AddEquipmentModal
                    onClose={() => setIsAddDrawerOpen(false)}
                    onAdd={handleAddEquipment}
                />
            </RightDrawer>

            <RightDrawer
                isOpen={isReportDrawerOpen}
                onClose={() => setIsReportDrawerOpen(false)}
                title="Report Machine Issue"
            >
                <ReportIssueModal
                    equipment={selectedEquipment}
                    onClose={() => setIsReportDrawerOpen(false)}
                    onSubmit={handleReportIssue}
                />
            </RightDrawer>
        </div>
    );
};

export default EquipmentListPage;
