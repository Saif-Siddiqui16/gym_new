import React, { useState, useEffect } from 'react';
import { Search, Layers, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import CategoryDrawer from './CategoryDrawer';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/storeApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';

const ProductCategories = () => {
    const { selectedBranch, branches } = useBranchContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState('add');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const branchParam = selectedBranch === 'all' ? 'all' : selectedBranch;
            const data = await getCategories({ search: searchTerm, branchId: branchParam });
            setCategories(data);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchCategories();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, selectedBranch]);

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setDrawerMode('edit');
        setIsDrawerOpen(true);
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setDrawerMode('add');
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id);
                toast.success('Category deleted successfully');
                fetchCategories();
            } catch (error) {
                toast.error(error);
            }
        }
    };

    const handleDrawerSubmit = async (formData) => {
        try {
            const targetBranch = formData.branchId || selectedBranch;
            const branchLabel = targetBranch === 'all'
                ? 'all branches'
                : (branches.find(b => b.id.toString() === targetBranch.toString())?.name || 'branch');

            toast.dismiss();
            if (drawerMode === 'add') {
                await createCategory({ ...formData, branchId: targetBranch });
                toast.success(`Category added successfully for ${branchLabel}`);
            } else {
                await updateCategory(selectedCategory.id, formData);
                toast.success('Category updated successfully');
            }
            fetchCategories();
        } catch (error) {
            toast.error(error);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-orange-50/20 p-4 sm:p-6 pb-12 min-h-screen">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
                        <Layers className="text-slate-800" size={28} />
                        Product Categories
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Organize your products into categories</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl text-sm font-black shadow-md shadow-violet-200 hover:bg-violet-700 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={18} /> Add Category
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-5">
                <div className="relative group max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-all" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold animate-pulse">Loading categories...</p>
                </div>
            ) : categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map(cat => (
                        <div key={cat.id} className="group bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 hover:-translate-y-1">
                            <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <ImageIcon size={48} strokeWidth={1} />
                                        <span className="text-[10px] font-black uppercase tracking-widest mt-2">{cat.name.charAt(0)}</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${cat.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {cat.status}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-80">Order: {cat.sortOrder}</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-1.5 mb-1 text-[#7c3aed]">
                                    <div className="w-1 h-1 rounded-full bg-current"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">{cat.tenant?.name || 'Main Branch'}</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2 truncate group-hover:text-orange-600 transition-colors">{cat.name}</h3>
                                <p className="text-slate-500 text-xs font-medium line-clamp-2 h-8 mb-6">{cat.description || 'No description available.'}</p>

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 text-white rounded-xl text-xs font-black shadow-md shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 py-20 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <Layers size={40} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">No categories found</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1 mb-8">Get started by creating your first product category</p>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-2xl font-black text-sm shadow-md shadow-violet-200 hover:bg-violet-700 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} /> Create New Category
                    </button>
                </div>
            )}

            <CategoryDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                category={selectedCategory}
                mode={drawerMode}
                onSubmit={handleDrawerSubmit}
            />
        </div>
    );
};

export default ProductCategories;
