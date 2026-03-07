import React, { useState, useEffect } from 'react';
import { Layers, ImagePlus, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { useBranchContext } from '../../context/BranchContext';
import RightDrawer from '../../components/common/RightDrawer';

const CategoryDrawer = ({ isOpen, onClose, category, mode = 'add', onSubmit }) => {
    const { branches, selectedBranch } = useBranchContext();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        sortOrder: 0,
        status: 'Active',
        branchId: selectedBranch || 'all'
    });

    useEffect(() => {
        if (category && mode === 'edit') {
            setFormData({
                ...category,
                sortOrder: category.sortOrder || 0,
                branchId: category.tenantId || category.branchId || 'all'
            });
        } else if (isOpen) {
            setFormData({
                name: '',
                description: '',
                image: '',
                sortOrder: 0,
                status: 'Active',
                branchId: selectedBranch || 'all'
            });
        }
    }, [category, mode, isOpen, selectedBranch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (onSubmit) {
            await onSubmit(formData);
        }
        onClose();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'edit' ? 'Edit Category' : 'Create Category'}
            subtitle={mode === 'edit' ? 'Update category details and settings' : 'Organize your inventory with new categories'}
            footer={
                <div className="flex gap-4 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-white text-slate-500 border-2 border-slate-100 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        form="category-form"
                        type="submit"
                        className="flex-[1.5] py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-violet-200 hover:bg-primary-hover active:scale-95 transition-all"
                    >
                        {mode === 'edit' ? 'Save Changes' : 'Create Category'}
                    </button>
                </div>
            }
        >
            <form id="category-form" onSubmit={handleSubmit} className="space-y-8 pb-4">
                {/* Branch Selection */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Assign to Branch</label>
                    <div className="relative group">
                        <select
                            disabled={mode === 'edit'}
                            value={formData.branchId}
                            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <option value="all">All Managed Branches</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                            <ChevronDown size={20} />
                        </div>
                    </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category Image</label>
                    <label className="w-full h-48 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-violet-50/30 transition-all duration-500 relative overflow-hidden group">
                        {formData.image ? (
                            <img src={formData.image} alt="Category" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors mb-3">
                                    <ImagePlus size={32} />
                                </div>
                                <span className="text-xs font-black text-slate-400 group-hover:text-primary uppercase tracking-widest transition-colors">Upload Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-white font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">Change Media</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category Name *</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Supplements"
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                    <textarea
                        rows={4}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter category description..."
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sort Order</label>
                        <input
                            type="number"
                            value={formData.sortOrder}
                            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Visibility Status</label>
                    <div className="flex gap-4 p-2 bg-slate-50 rounded-[1.5rem] border-2 border-slate-50">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, status: 'Active' })}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black transition-all ${formData.status === 'Active' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <CheckCircle size={14} strokeWidth={3} /> ACTIVE
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black transition-all ${formData.status === 'Inactive' ? 'bg-white text-rose-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <XCircle size={14} strokeWidth={3} /> INACTIVE
                        </button>
                    </div>
                </div>
            </form>
        </RightDrawer>
    );
};

export default CategoryDrawer;
