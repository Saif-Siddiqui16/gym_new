import React, { useState } from 'react';
import { Search, Filter, Box, Plus, Edit2, Trash2, ChevronRight, ShoppingCart, Archive } from 'lucide-react';
import ProductDrawer from './ProductDrawer';

const dummyProducts = [
    { id: 1, name: "Protein Powder", sku: "PR001", category: "Supplements", price: 2500, stock: 50, status: "Active" },
    { id: 2, name: "Yoga Mat", sku: "YM002", category: "Accessories", price: 1200, stock: 30, status: "Active" },
    { id: 3, name: "Dumbbells Set", sku: "DB003", category: "Equipment", price: 5000, stock: 10, status: "Inactive" },
];

const ProductList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState('add');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const filteredProducts = dummyProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === '' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setDrawerMode('edit');
        setIsDrawerOpen(true);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setDrawerMode('add');
        setIsDrawerOpen(true);
    };

    const handleDelete = (id) => {
        console.log("Delete Product", id);
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
                        <Box className="text-slate-800" size={28} />
                        Product Inventory
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Manage your store products and stock levels</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={18} /> Add New Product
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-all" />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            <option value="Supplements">Supplements</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Equipment">Equipment</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Product</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">SKU</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Category</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Price</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Stock</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredProducts.length > 0 ? filteredProducts.map(p => (
                            <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                                            {p.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{p.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">{p.sku}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-500">{p.category}</td>
                                <td className="px-6 py-4 text-sm font-black text-slate-900">₹{p.price.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-sm font-black ${p.stock <= 10 ? 'text-orange-600' : 'text-slate-900'}`}>{p.stock} Units</span>
                                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${p.stock <= 10 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                            {p.stock <= 10 ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(p)}
                                            className="p-2 bg-slate-50 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-bold italic">No products found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                    {p.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">{p.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.sku}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {p.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest mb-1 text-[8px]">Price</p>
                                <p className="font-black text-slate-900">₹{p.price.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest mb-1 text-[8px]">Stock</p>
                                <p className={`font-black ${p.stock <= 10 ? 'text-orange-500' : 'text-slate-900'}`}>{p.stock} Units</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex gap-2">
                            <button
                                onClick={() => handleEdit(p)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-50 text-violet-600 rounded-xl text-xs font-black"
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                            <button
                                onClick={() => handleDelete(p.id)}
                                className="p-3 bg-red-50 text-red-600 rounded-xl"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Drawer */}
            <ProductDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                product={selectedProduct}
                mode={drawerMode}
            />
        </div>
    );
};

export default ProductList;
