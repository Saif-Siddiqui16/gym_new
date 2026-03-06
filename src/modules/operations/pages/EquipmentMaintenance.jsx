import React, { useState, useEffect } from 'react';
import { equipmentApi } from '../../../api/equipmentApi';
import toast from 'react-hot-toast';
import { Wrench, CheckCircle, AlertTriangle, Plus, Sparkles, Calendar } from 'lucide-react';
import MobileCard from '../../../components/common/MobileCard';
import RightDrawer from '../../../components/common/RightDrawer';
import AddEquipmentDrawer from './AddEquipmentDrawer';

const EquipmentMaintenance = () => {
    const [equipment, setEquipment] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        try {
            setLoading(true);
            const data = await equipmentApi.getAllEquipment();
            // Transform for this component's specific layout if needed
            // The controller returns {id, name, status, lastMaintenance, nextMaintenance, etc}
            const formatted = data.map(item => ({
                id: item.id,
                name: item.name,
                status: item.status === 'Operational' ? 'Working' :
                    item.status === 'Under Maintenance' ? 'Under Maintenance' :
                        item.status === 'Out of Order' ? 'Out of Order' : 'Working',
                lastMaintenance: item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A',
                nextMaintenance: item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString() : 'N/A'
            }));
            setEquipment(formatted);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load equipment");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (newItem) => {
        try {
            await equipmentApi.addEquipment({
                name: newItem.name,
                status: newItem.status === 'Working' ? 'Operational' : newItem.status,
                purchaseDate: newItem.lastMaintenance,
                warrantyExpiry: newItem.nextMaintenance
            });
            toast.success("Equipment added successfully");
            loadEquipment();
            setIsDrawerOpen(false);
        } catch (error) {
            toast.error("Failed to add equipment");
        }
    };

    const handleInternalStatusUpdate = async (id, newStatus) => {
        try {
            const apiStatus = newStatus === 'Working' ? 'Operational' : newStatus;
            await equipmentApi.updateEquipment(id, { status: apiStatus });
            toast.success(`Status updated to ${newStatus}`);
            loadEquipment();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            'Working': { gradient: 'from-emerald-500 to-emerald-600', icon: CheckCircle, shadow: 'shadow-emerald-500/50' },
            'Under Maintenance': { gradient: 'from-amber-500 to-orange-600', icon: Wrench, shadow: 'shadow-amber-500/50' },
            'Out of Order': { gradient: 'from-red-500 to-red-600', icon: AlertTriangle, shadow: 'shadow-red-500/50' },
        };
        const { gradient, icon: Icon, shadow } = config[status] || config['Working'];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${gradient} text-white text-xs font-black shadow-lg ${shadow} hover:scale-110 transition-all duration-300 cursor-pointer`}>
                <Icon size={14} strokeWidth={2.5} />
                {status}
            </span>
        );
    };

    const getStatusColor = (status) => {
        const colors = {
            'Working': 'emerald',
            'Under Maintenance': 'amber',
            'Out of Order': 'red',
        };
        return colors[status] || 'emerald';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6 flex-shrink-0">
                                <Wrench size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Equipment Maintenance
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse flex-shrink-0">
                                        PREMIUM ✨
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">Track and manage gym equipment status</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-105 transition-all w-full sm:w-auto"
                        >
                            <Plus size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px] transition-all duration-300 group-hover:scale-110 group-hover:rotate-90" />
                            Add Equipment
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 sm:space-y-4 mb-6">
                {equipment.map((item) => (
                    <MobileCard
                        key={item.id}
                        title={item.name}
                        badge={item.status}
                        badgeColor={getStatusColor(item.status)}
                        fields={[
                            { label: 'Last Maintenance', value: item.lastMaintenance, icon: Calendar },
                            { label: 'Next Maintenance', value: item.nextMaintenance, icon: Calendar },
                        ]}
                        actions={[
                            {
                                label: 'Mark as Working',
                                onClick: () => handleInternalStatusUpdate(item.id, 'Working'),
                                show: item.status !== 'Working'
                            },
                            {
                                label: 'Mark as Maintenance',
                                onClick: () => handleInternalStatusUpdate(item.id, 'Under Maintenance'),
                                show: item.status !== 'Under Maintenance'
                            },
                            {
                                label: 'Mark as Broken',
                                onClick: () => handleInternalStatusUpdate(item.id, 'Out of Order'),
                                show: item.status !== 'Out of Order'
                            },
                        ].filter(action => action.show !== false)}
                    />
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block group relative bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-500 transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Equipment</th>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Status</th>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Last Maintenance</th>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Next Maintenance</th>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs text-right hover:text-violet-600 transition-colors duration-300 cursor-pointer">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {equipment.map((item) => (
                                <tr key={item.id} className="group/row hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 transition-all duration-300 cursor-pointer hover:shadow-md">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 flex items-center justify-center shadow-md transition-all duration-500 group-hover/row:scale-125 group-hover/row:bg-gradient-to-br group-hover/row:from-violet-500 group-hover/row:to-purple-600 group-hover/row:text-white group-hover/row:shadow-xl group-hover/row:rotate-6">
                                                <Wrench size={18} strokeWidth={2.5} />
                                            </div>
                                            <span className="font-bold text-slate-800 group-hover/row:text-violet-700 group-hover/row:translate-x-1 transition-all duration-300">
                                                {item.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 font-semibold">
                                            <Calendar size={14} className="text-slate-400" />
                                            {item.lastMaintenance}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                                            <Calendar size={14} className="text-violet-400" />
                                            {item.nextMaintenance}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            value={item.status}
                                            onChange={(e) => handleInternalStatusUpdate(item.id, e.target.value)}
                                            className="px-3 py-2 text-xs font-bold border-2 border-slate-200 rounded-lg bg-white hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300 cursor-pointer"
                                        >
                                            <option value="Working">Working</option>
                                            <option value="Under Maintenance">Maintenance</option>
                                            <option value="Out of Order">Broken</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Side Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Create Equipment"
            >
                <AddEquipmentDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onAdd={handleAdd}
                />
            </RightDrawer>
        </div>
    );
};

export default EquipmentMaintenance;
