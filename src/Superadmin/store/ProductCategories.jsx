import React, { useState, useEffect } from 'react';
import { Search, Layers, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import CategoryDrawer from './CategoryDrawer';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/storeApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ProductCategories = () => {
    const { selectedBranch, branches } = useBranchContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState('add');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

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

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deleteCategory(confirmModal.id);
            toast.success('Category deleted successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchCategories();
        } catch (error) {
            toast.error(error);
            setConfirmModal(prev => ({ ...prev, loading: false }));
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
        <div className="saas-page pb-page animate-fadeIn">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-violet-200 ring-4 ring-white">
                        <Layers size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Categories</h1>
                        <p className="text-slate-500 text-sm font-medium">Organize your products into categories</p>
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-violet-200 hover:bg-primary-hover hover:scale-[1.02] active:scale-98 transition-all"
                >
                    <Plus size={18} strokeWidth={3} /> Add Category
                </button>
            </div>

            {/* Filters */}
            <div className="mb-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-slate-100 p-6">
                <div className="relative group max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Scanning Categories...</p>
                </div>
            ) : categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {categories.map(cat => (
                        <div key={cat.id} className="group bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                            <div className="aspect-[16/10] relative overflow-hidden bg-slate-50">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                        <Layers size={48} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${cat.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                        {cat.status}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                    <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-80">Order: {cat.sortOrder}</p>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest uppercase truncate">{cat.tenant?.name || 'Main Branch'}</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 truncate group-hover:text-primary transition-colors">{cat.name}</h3>
                                <p className="text-slate-500 text-sm font-medium line-clamp-2 h-10 mb-8 leading-relaxed">{cat.description || 'No description available for this category.'}</p>

                                <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="px-6 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
                                    >
                                        <Edit2 size={14} strokeWidth={3} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm"
                                        title="Delete Category"
                                    >
                                        <Trash2 size={16} strokeWidth={2.5} />
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
                        className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-md shadow-violet-200 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all"
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
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Delete Category?"
                message="All products in this category may be affected. This cannot be undone."
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default ProductCategories;
