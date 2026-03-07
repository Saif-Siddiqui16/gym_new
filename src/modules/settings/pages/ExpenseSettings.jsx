import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Tag, FileText, Trash2, Loader } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import { fetchExpenseCategories, addExpenseCategory, deleteExpenseCategory } from '../../../api/finance/financeApi';
import { useBranchContext } from '../../../context/BranchContext';
import { toast } from 'react-hot-toast';

const ExpenseSettings = () => {
    const { selectedBranch } = useBranchContext();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        loadCategories();
    }, [selectedBranch]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await fetchExpenseCategories(selectedBranch);
            setCategories(data || []);
        } catch (error) {
            console.error('Failed to parse categories:', error);
            toast.error('Failed to load expense categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await addExpenseCategory({ ...formData, branchId: selectedBranch });
            toast.success('Category created successfully');
            setIsDrawerOpen(false);
            setFormData({ name: '', description: '' });
            loadCategories();
        } catch (error) {
            console.error('Failed to stringify error:', error);
            toast.error(error.response?.data?.message || 'Failed to create category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await deleteExpenseCategory(id);
            toast.success('Category deleted successfully');
            loadCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto font-sans animate-in fade-in duration-500">
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm border border-violet-100">
                            <DollarSign size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-2">
                                Expense Categories
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">
                                Manage expense categories for financial tracking
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:from-violet-700 hover:to-violet-700 transition-all shadow-lg shadow-violet-100 self-start sm:self-center active:scale-95"
                    >
                        <Plus size={18} />
                        Add Category
                    </button>
                </div>

                {loading ? (
                    <div className="py-24 flex justify-center">
                        <Loader className="animate-spin text-violet-600" size={32} />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="p-4 rounded-full bg-slate-50 mb-4">
                            <DollarSign size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium italic">No expense categories found</p>
                        <p className="text-slate-300 text-[10px] uppercase tracking-widest mt-2 font-bold">Start by adding your first category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                            <div key={cat.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col text-left group">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800 text-sm">{cat.name}</h3>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all p-1.5"
                                        title="Delete Category"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                    {cat.description || 'No description provided.'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Add Category"
                subtitle="Create a new expense category"
            >
                <form onSubmit={handleCreate} className="p-8 space-y-6 text-left">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <Tag size={12} strokeWidth={3} /> Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Utilities"
                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-violet-500/30 focus:bg-white transition-all shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <FileText size={12} strokeWidth={3} /> Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Electricity, Water, Internet"
                                rows={4}
                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-violet-500/30 focus:bg-white transition-all shadow-sm resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(false)}
                            className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] flex justify-center items-center gap-2 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-100 hover:from-violet-700 hover:to-violet-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting && <Loader size={14} className="animate-spin" />}
                            {submitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </RightDrawer>
        </div>
    );
};

export default ExpenseSettings;
