import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../../api/inventoryApi';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Package, Search, Filter, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import MobileCard from '../../../components/common/MobileCard';

const Inventory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await inventoryApi.getAllInventory();
            setInventory(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const getStockBadge = (status) => {
        const isLow = status === 'Low Stock';
        const isOut = status === 'Out of Stock';

        let gradient, icon, shadow, border;

        if (isOut) {
            gradient = 'from-red-500 to-red-600';
            icon = AlertTriangle;
            shadow = 'shadow-red-500/50';
            border = 'border-red-200';
        } else if (isLow) {
            gradient = 'from-amber-500 to-orange-600';
            icon = AlertTriangle;
            shadow = 'shadow-amber-500/50';
            border = 'border-amber-200';
        } else {
            gradient = 'from-emerald-500 to-emerald-600';
            icon = CheckCircle;
            shadow = 'shadow-emerald-500/50';
            border = 'border-emerald-200';
        }

        const Icon = icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${gradient} text-white text-xs font-black shadow-lg ${shadow} hover:scale-110 transition-all duration-300 cursor-pointer`}>
                <Icon size={14} strokeWidth={2.5} />
                {status}
            </span>
        );
    };

    const getStatusColor = (status) => {
        if (status === 'Out of Stock') return 'red';
        if (status === 'Low Stock') return 'amber';
        return 'emerald';
    };

    const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

    const filteredInventory = inventory.filter(item =>
        (filterCategory === 'All' || item.category === filterCategory) &&
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = ['All', ...new Set(inventory.map(item => item.category))];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6">
            {/* Premium Header */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6 flex-shrink-0">
                                <Package size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Inventory Management
                                    </h1>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse flex-shrink-0">
                                        PREMIUM ✨
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs sm:text-sm mt-1">Track gym supplies and equipment stock</p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                const name = prompt('Item Name:');
                                if (!name) return;
                                const cat = prompt('Category:', 'Supplies');
                                const qty = prompt('Quantity:', '10');
                                try {
                                    await inventoryApi.addInventoryItem({
                                        itemName: name,
                                        category: cat,
                                        quantity: qty,
                                        unit: 'pcs',
                                        minThreshold: 5
                                    });
                                    toast.success('Item added');
                                    fetchInventory();
                                } catch (e) {
                                    toast.error('Failed to add item');
                                }
                            }}
                            className="group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/60 hover:scale-105 transition-all w-full sm:w-auto"
                        >
                            <Plus size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px] transition-all duration-300 group-hover:scale-110 group-hover:rotate-90" />
                            Add Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Alert Card */}
            {lowStockCount > 0 && (
                <div className="mb-6 sm:mb-8 group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-red-100 p-1 overflow-hidden animate-fade-in">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-orange-50 opacity-50"></div>
                    <div className="relative p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30 animate-pulse flex-shrink-0">
                            <AlertTriangle size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-red-800 font-black text-xs sm:text-sm uppercase tracking-wider">Attention Needed</h3>
                            <p className="text-red-600 font-bold text-xs sm:text-sm">
                                {lowStockCount} items are running low or out of stock. Please restock soon.
                            </p>
                        </div>
                        <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-red-600 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg border border-red-100 shadow-sm hover:shadow-md hover:scale-105 transition-all w-full sm:w-auto">
                            View Items
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="sm:w-[18px] sm:h-[18px] text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg sm:rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-300 font-semibold text-slate-700 text-sm"
                    />
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter size={16} className="sm:w-[18px] sm:h-[18px] text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg sm:rounded-xl leading-5 bg-white focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-300 font-semibold text-slate-700 appearance-none cursor-pointer text-sm"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ArrowDownRight size={14} className="sm:w-4 sm:h-4 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 sm:space-y-4 mb-6">
                {filteredInventory.map((item) => (
                    <MobileCard
                        key={item.id}
                        title={item.itemName}
                        subtitle={item.category}
                        badge={item.status}
                        badgeColor={getStatusColor(item.status)}
                        fields={[
                            { label: 'Quantity', value: item.quantity },
                            { label: 'Min Stock', value: item.minThreshold },
                        ]}
                        actions={[
                            {
                                label: 'Restock', onClick: async () => {
                                    const qty = prompt('Amount received:');
                                    if (!qty) return;
                                    try {
                                        await inventoryApi.receiveStock({ itemId: item.id, quantity: qty });
                                        toast.success('Restocked');
                                        fetchInventory();
                                    } catch (e) { }
                                }
                            },
                            {
                                label: 'Use', onClick: async () => {
                                    const qty = prompt('Amount used:');
                                    if (!qty) return;
                                    try {
                                        await inventoryApi.recordUsage({ itemId: item.id, quantity: qty });
                                        toast.success('Recorded');
                                        fetchInventory();
                                    } catch (e) { }
                                }
                            }
                        ]}
                    />
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block group relative bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-500 transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 saas-table-wrapper border-0 rounded-none">
                    <table className="saas-table saas-table-responsive w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Item Name</th>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Category</th>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Quantity</th>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Min Stock</th>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs hover:text-violet-600 transition-colors duration-300 cursor-pointer">Status</th>
                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-xs text-right hover:text-violet-600 transition-colors duration-300 cursor-pointer">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredInventory.map((item) => (
                                <tr key={item.id} className="group/row hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 transition-all duration-300 cursor-pointer hover:shadow-md">
                                    <td className="px-6 py-4" data-label="Item Name">
                                        <div className="flex items-center gap-3 justify-end sm:justify-start">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 flex items-center justify-center shadow-md transition-all duration-500 group-hover/row:scale-125 group-hover/row:bg-gradient-to-br group-hover/row:from-violet-500 group-hover/row:to-purple-600 group-hover/row:text-white group-hover/row:shadow-xl group-hover/row:rotate-6 flex-shrink-0">
                                                <Package size={18} strokeWidth={2.5} />
                                            </div>
                                            <span className="font-bold text-slate-800 group-hover/row:text-violet-700 transition-all duration-300">
                                                {item.itemName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4" data-label="Category">
                                        <div className="text-right sm:text-left">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 group-hover/row:bg-white group-hover/row:shadow-sm transition-all duration-300">
                                                {item.category}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4" data-label="Quantity">
                                        <div className="text-right sm:text-left font-black text-slate-700">{item.quantity} {item.unit}</div>
                                    </td>
                                    <td className="px-6 py-4" data-label="Min Stock">
                                        <div className="text-right sm:text-left text-slate-500 font-semibold">{item.minThreshold}</div>
                                    </td>
                                    <td className="px-6 py-4" data-label="Status">
                                        <div className="flex justify-end sm:justify-start">
                                            {getStockBadge(item.status)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right" data-label="Actions">
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const qty = prompt('Add to stock:', '10');
                                                if (qty) {
                                                    await inventoryApi.receiveStock({ itemId: item.id, quantity: qty });
                                                    toast.success('Added');
                                                    fetchInventory();
                                                }
                                            }}
                                            className="text-emerald-500 hover:text-emerald-700 font-bold text-xs transition-colors mr-3">
                                            + Stock
                                        </button>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (confirm('Delete this item?')) {
                                                    await inventoryApi.deleteInventoryItem(item.id);
                                                    toast.success('Deleted');
                                                    fetchInventory();
                                                }
                                            }}
                                            className="text-red-400 hover:text-red-600 font-bold text-xs transition-colors">
                                            Del
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
