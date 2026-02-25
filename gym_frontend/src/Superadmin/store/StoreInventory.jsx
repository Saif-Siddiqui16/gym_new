import React, { useState, useEffect } from 'react';
import { Archive, Search, Filter, AlertTriangle, Box, RefreshCcw, Plus, Edit2, Trash2 } from 'lucide-react';
import { getStoreProducts, updateStoreProductStock, addStoreProduct, updateStoreProduct, deleteStoreProduct } from '../../api/storeApi';
import toast from 'react-hot-toast';
import ProductDrawer from './ProductDrawer';

const StoreInventory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState('add');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await getStoreProducts({ allStatus: 'true' });
            setInventory(data);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleUpdateStock = async (id, currentStock) => {
        const newStockStr = prompt('Enter new stock count:', currentStock);
        if (newStockStr !== null) {
            const newStock = parseInt(newStockStr, 10);
            if (!isNaN(newStock) && newStock >= 0) {
                try {
                    await updateStoreProductStock(id, newStock);
                    toast.success('Stock updated successfully');
                    fetchInventory();
                } catch (error) {
                    toast.error(error);
                }
            } else {
                toast.error('Invalid stock count');
            }
        }
    };

    const handleDrawerSubmit = async (formData) => {
        try {
            if (drawerMode === 'add') {
                await addStoreProduct(formData);
                toast.success('Product added successfully!');
            } else {
                await updateStoreProduct(selectedProduct.id, formData);
                toast.success('Product updated successfully!');
            }
            fetchInventory();
            setIsAddDrawerOpen(false);
        } catch (error) {
            toast.error(error);
        }
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setDrawerMode('edit');
        setIsAddDrawerOpen(true);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteStoreProduct(id);
                toast.success('Product deleted successfully');
                fetchInventory();
            } catch (error) {
                toast.error(error);
            }
        }
    };

    const filteredInventory = inventory.filter(i => {
        const productSku = i.sku || `PRD-00${i.id}`;
        return i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            productSku.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const lowStockCount = inventory.filter(i => i.stock <= 10).length;

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
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button onClick={() => { setSelectedProduct(null); setDrawerMode('add'); setIsAddDrawerOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black shadow-xl shadow-slate-200 hover:scale-105 transition-all">
                        <Plus size={18} /> Add New Product
                    </button>
                    <button onClick={fetchInventory} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl text-sm font-black shadow-xl shadow-violet-200 hover:scale-105 transition-all">
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} /> Sync Inventory
                    </button>
                </div>
            </div>

            {/* Low Stock Banner */}
            {lowStockCount > 0 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-orange-950 uppercase tracking-tight">Low Stock Alert</h3>
                        <p className="text-xs text-orange-700 font-medium">You have {lowStockCount} products with critical stock levels. We recommend restocking soon.</p>
                    </div>
                </div>
            )}

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
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Box size={28} />
                                )}
                            </div>
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600' : item.status === 'Low Stock' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                {item.status}
                            </span>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-black text-slate-900 mb-1">{item.name}</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">SKU: {item.sku || `PRD-00${item.id}`}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Stock</span>
                                <span className={`text-sm font-black ${item.stock <= 10 ? 'text-orange-600' : 'text-slate-900'}`}>{item.stock} Units</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</span>
                                <span className="text-sm font-bold text-slate-700">{item.category}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button onClick={() => handleUpdateStock(item.id, item.stock)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all">
                                Update Stock
                            </button>
                            <button onClick={() => handleEditProduct(item)} className="p-3 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-all" title="Edit">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(item.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all" title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ProductDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                mode={drawerMode}
                product={selectedProduct}
                onSubmit={handleDrawerSubmit}
            />
        </div>
    );
};

export default StoreInventory;
