import React, { useState, useEffect } from 'react';
import { X, Layers, ImagePlus, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { useBranchContext } from '../../context/BranchContext';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 opacity-100"
                    onClick={onClose}
                ></div>
                <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
                    <div className="relative w-screen sm:max-w-[400px] transform transition-transform duration-300 ease-in-out shadow-2xl translate-x-0">
                        <div className="flex h-full flex-col bg-white overflow-y-auto shadow-2xl">
                            {/* Header */}
                            <div className={`px-6 py-8 relative ${mode === 'edit' ? 'bg-white border-b border-slate-100' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'}`}>
                                <button
                                    onClick={onClose}
                                    type="button"
                                    className={`absolute top-4 right-4 p-2 rounded-xl transition-all ${mode === 'edit' ? 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${mode === 'edit' ? 'bg-orange-500/10 border-orange-100 text-orange-600' : 'bg-orange-500/20 border-orange-500/30 text-orange-400'}`}>
                                        <Layers size={24} />
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-black tracking-tight ${mode === 'edit' ? 'text-slate-900' : ''}`}>
                                            {mode === 'edit' ? 'Edit Category' : 'Add Category'}
                                        </h2>
                                        <p className={`${mode === 'edit' ? 'text-slate-500' : 'text-slate-400'} text-xs font-bold uppercase tracking-widest mt-1`}>
                                            {mode === 'edit' ? 'Update Details' : 'Create a new product category'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
                                {/* Branch Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed] ml-1">Assign to Branch</label>
                                    <div className="relative group">
                                        <select
                                            disabled={mode === 'edit'}
                                            value={formData.branchId}
                                            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            <option value="all">All Managed Branches</option>
                                            {branches.map(branch => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-[#7c3aed] transition-colors">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                    {mode === 'edit' && <p className="text-[9px] text-slate-400 font-bold italic ml-1 select-none">Branch cannot be changed during edit</p>}
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-1.5 flex flex-col items-center">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 self-start ml-1">Category Image</label>
                                    <label className="w-full h-40 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 relative overflow-hidden group">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Category" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <ImagePlus className="text-slate-400 group-hover:text-orange-500 transition-colors mb-2" size={32} />
                                                <span className="text-xs font-bold text-slate-500 group-hover:text-orange-600 transition-colors">Click to upload</span>
                                            </>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change Image</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Supplements"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Category description..."
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5 group">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sort Order</label>
                                        <input
                                            type="number"
                                            value={formData.sortOrder}
                                            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300"
                                        />
                                        <p className="text-[9px] text-slate-400 font-bold italic ml-1 select-none uppercase tracking-wider">
                                            Lower numbers appear first
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
                                    <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'Active' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${formData.status === 'Active' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <CheckCircle size={14} /> ACTIVE
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${formData.status === 'Inactive' ? 'bg-white text-red-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <XCircle size={14} /> INACTIVE
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3 pb-8">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-4 bg-white text-slate-500 border-2 border-slate-100 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[1.5] py-4 bg-violet-600 text-white rounded-2xl font-black text-sm shadow-md shadow-violet-200 hover:bg-violet-700 transition-all"
                                    >
                                        {mode === 'edit' ? 'Update Category' : 'Add Category'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryDrawer;
