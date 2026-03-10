import React, { useState, useEffect } from 'react';
import { Search, Filter, Box, Plus, Edit2, Trash2, AlertTriangle, TrendingUp, Tag, LayoutGrid, Package, ImageIcon } from 'lucide-react';
import ProductDrawer from './ProductDrawer';
import { getStoreProducts, deleteStoreProduct, getCategories } from '../../api/storeApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';
import StatsCard from '../../modules/dashboard/components/StatsCard';

const ProductList = () => {
    const { selectedBranch } = useBranchContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState('add');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');

    const fetchData = async () => {
        try {
            setLoading(true);
            const branchParam = selectedBranch === 'all' ? 'all' : selectedBranch;
            const [prodData, catData] = await Promise.all([
                getStoreProducts({ search: searchTerm, category: filterCategory, branchId: branchParam, allStatus: 'true' }),
                getCategories({ branchId: branchParam })
            ]);
            setProducts(prodData);
            setCategories(catData);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, filterCategory, selectedBranch]);

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteStoreProduct(id);
                toast.success('Product deleted successfully');
                fetchData();
            } catch (error) {
                toast.error(error);
            }
        }
    };

    const handleDrawerSubmit = async () => {
        fetchData();
    };



    return (
        <div className="saas-page pb-page animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white shadow-lg">
                        <Box size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent">
                            Products & Inventory
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Manage your product catalog and stock levels</p>
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-violet-200 hover:bg-primary-hover hover:scale-[1.02] active:scale-98 transition-all duration-300"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Products"
                    value={products.length.toString()}
                    icon={Box}
                    color="primary"
                />
                <StatsCard
                    title="Low Stock"
                    value={products.filter(p => p.stock < 10).length.toString()}
                    icon={AlertTriangle}
                    color="warning"
                />
                <StatsCard
                    title="Stock Value"
                    value={`₹${products.reduce((acc, p) => acc + (parseFloat(p.price) * p.stock), 0).toLocaleString()}`}
                    icon={TrendingUp}
                    color="success"
                />
                <StatsCard
                    title="Categories"
                    value={categories.length.toString()}
                    icon={Tag}
                    color="primary"
                />
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid size={16} /> Products
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Package size={16} /> Inventory
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto flex-1">
                        <div className="relative flex-1 md:max-w-md w-full">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                            />
                        </div>
                        <div className="relative w-full md:w-48">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-900 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Catalog Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
                    <Box size={20} className="text-slate-400" />
                    <h2 className="text-base font-bold text-slate-900">Product Catalog</h2>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 font-bold animate-pulse">Loading products...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest text-left">
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">SKU</th>
                                    <th className="px-6 py-4">Branch</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Cost/Price</th>
                                    <th className="px-6 py-4">Margin</th>
                                    <th className="px-6 py-4">Tax</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map(p => (
                                    <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                                    {p.image ? (
                                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Box size={20} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{p.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Qty: {p.stock}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{p.sku || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]"></div>
                                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{p.tenant?.name || 'Main Branch'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-[9px] font-black uppercase border border-slate-100">{p.category || 'Uncategorised'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-900">
                                            <div className="flex flex-col">
                                                <span>₹{parseFloat(p.price).toLocaleString()}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">Cost: ₹{parseFloat(p.costPrice || 0).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[11px] font-black ${p.costPrice && p.price > p.costPrice ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {p.costPrice && p.price > 0
                                                    ? `${(((parseFloat(p.price) - parseFloat(p.costPrice)) / parseFloat(p.price)) * 100).toFixed(0)}%`
                                                    : '0%'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-black text-slate-500">{p.taxRate || 0}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                            <Box size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                        <p className="text-slate-400 text-sm mt-1 mb-8">Get started by adding your first product catalog</p>
                        <button
                            onClick={handleAdd}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-violet-200 hover:bg-primary-hover hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} /> Add Product
                        </button>
                    </div>
                )}
            </div>

            <ProductDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                product={selectedProduct}
                mode={drawerMode}
                onSubmit={handleDrawerSubmit}
            />
        </div>
    );
};

export default ProductList;
