import React, { useState, useEffect } from 'react';
import { X, Box, Tag, DollarSign, Package, CheckCircle, XCircle } from 'lucide-react';

const ProductDrawer = ({ isOpen, onClose, product, mode = 'add' }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'Supplements',
        price: '',
        stock: '',
        status: 'Active'
    });

    useEffect(() => {
        if (product && mode === 'edit') {
            setFormData(product);
        } else {
            setFormData({
                name: '',
                sku: '',
                category: 'Supplements',
                price: '',
                stock: '',
                status: 'Active'
            });
        }
    }, [product, mode, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Product ${mode === 'add' ? 'Added' : 'Updated'}`, formData);
        onClose();
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
                            <div className="px-6 py-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
                                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                                    <X className="h-6 w-6" />
                                </button>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30 text-violet-400">
                                        <Box size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight">{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</h2>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                            {mode === 'edit' ? 'Update Details' : 'Store Inventory'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Protein Powder"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">SKU Code</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                            placeholder="SKU001"
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 uppercase"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 cursor-pointer"
                                        >
                                            <option value="Supplements">Supplements</option>
                                            <option value="Accessories">Accessories</option>
                                            <option value="Equipment">Equipment</option>
                                            <option value="Apparel">Apparel</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                            <input
                                                required
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 group">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Stock Qty</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                                        />
                                        <p className="text-[9px] text-slate-400 font-bold italic ml-1 select-none">
                                            * Alert shown when stock is below 10 units.
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

                                <div className="pt-6 flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
                                    >
                                        {mode === 'edit' ? 'Update Product' : 'Add Product'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full py-4 bg-white text-slate-500 border-2 border-slate-100 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
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

export default ProductDrawer;
