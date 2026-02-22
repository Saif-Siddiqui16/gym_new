import React, { useState } from 'react';
import { Archive, Search, Filter, AlertTriangle, Box, RefreshCcw } from 'lucide-react';

const dummyInventory = [
    { id: 1, name: "Protein Powder", sku: "PR001", stock: 50, location: "Warehouse A", status: "In Stock" },
    { id: 2, name: "Yoga Mat", sku: "YM002", stock: 30, location: "Main Store", status: "In Stock" },
    { id: 3, name: "Dumbbells Set", sku: "DB003", stock: 10, location: "Warehouse B", status: "Low Stock" },
    { id: 4, name: "Resistance Bands", sku: "RB004", stock: 0, location: "Out of Stock", status: "Out of Stock" },
];

const StoreInventory = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInventory = dummyInventory.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm)
    );

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
                        <Archive className="text-slate-800" size={28} />
                        Store Inventory
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Monitor stock levels and warehouse locations</p>
                </div>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl text-sm font-black shadow-xl shadow-violet-200 hover:scale-105 transition-all">
                    <RefreshCcw size={18} /> Sync Inventory
                </button>
            </div>

            {/* Low Stock Banner */}
            <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-orange-950 uppercase tracking-tight">Low Stock Alert</h3>
                    <p className="text-xs text-orange-700 font-medium">You have 2 products with critical stock levels. We recommend restocking soon.</p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by Product Name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-900 transition-all shadow-lg shadow-slate-200/50"
                />
            </div>

            {/* Inventory List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInventory.map(item => (
                    <div key={item.id} className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
                                <Box size={28} />
                            </div>
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600' : item.status === 'Low Stock' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                {item.status}
                            </span>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-black text-slate-900 mb-1">{item.name}</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">SKU: {item.sku}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Stock</span>
                                <span className={`text-sm font-black ${item.stock <= 10 ? 'text-orange-600' : 'text-slate-900'}`}>{item.stock} Units</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Warehouse Location</span>
                                <span className="text-sm font-bold text-slate-700">{item.location}</span>
                            </div>
                        </div>

                        <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all">
                            Update Stock Count
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoreInventory;
