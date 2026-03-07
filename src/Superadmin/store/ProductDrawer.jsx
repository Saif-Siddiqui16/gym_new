import React, { useState, useEffect } from 'react';
import { X, Box, Tag, DollarSign, Package, CheckCircle, XCircle, ImagePlus, Upload, HelpCircle, ChevronDown, Plus } from 'lucide-react';
import { getCategories, addStoreProduct, updateStoreProduct } from '../../api/storeApi';
import { useBranchContext } from '../../context/BranchContext';
import RightDrawer from '../../components/common/RightDrawer';
import toast from 'react-hot-toast';

const ProductDrawer = ({ isOpen, onClose, product, mode = 'add', onSubmit }) => {
    const { branches, selectedBranch } = useBranchContext();
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        costPrice: '',
        taxRate: '0',
        stock: '',
        status: 'Active',
        image: '',
        description: '',
        branchId: selectedBranch || 'all'
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const branchParam = formData.branchId === 'all' ? 'all' : formData.branchId;
                const data = await getCategories({ branchId: branchParam });
                setCategories(data);

                // ONLY auto-select category in 'add' mode if nothing is selected
                if (mode === 'add' && data.length > 0 && !formData.category) {
                    setFormData(prev => ({ ...prev, category: data[0].name }));
                }
            } catch (error) {
                console.error("Failed to load categories");
                setCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        };
        if (isOpen) fetchCategories();
    }, [isOpen, formData.branchId]);

    useEffect(() => {
        if (product && mode === 'edit' && isOpen) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                category: product.category || '',
                price: product.price ? parseFloat(product.price.toString()) : '',
                costPrice: product.costPrice ? parseFloat(product.costPrice.toString()) : '',
                taxRate: product.taxRate ? parseFloat(product.taxRate.toString()) : '0',
                branchId: product.tenantId || product.branchId || 'all',
                description: product.description || '',
                stock: product.stock !== undefined ? product.stock.toString() : '',
                status: product.status || 'Active',
                image: product.image || ''
            });
        } else if (isOpen && mode === 'add') {
            setFormData({
                name: '',
                sku: `PRD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                category: '',
                price: '',
                costPrice: '',
                taxRate: '0',
                stock: '',
                status: 'Active',
                image: '',
                description: '',
                branchId: selectedBranch || 'all'
            });
        }
    }, [product, mode, isOpen, selectedBranch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                price: parseFloat(formData.price),
                costPrice: parseFloat(formData.costPrice || 0),
                taxRate: parseFloat(formData.taxRate),
                stock: parseInt(formData.stock)
            };

            const branchLabel = formData.branchId === 'all'
                ? 'all branches'
                : (branches.find(b => b.id.toString() === formData.branchId.toString())?.name || 'branch');

            toast.dismiss();
            if (mode === 'add') {
                await addStoreProduct(dataToSubmit);
                toast.success(`Product added successfully for ${branchLabel}`);
            } else {
                await updateStoreProduct(product.id, dataToSubmit);
                toast.success(`Product updated successfully`);
            }
            if (onSubmit) {
                await onSubmit();
            }
            onClose();
        } catch (error) {
            toast.error(error);
        }
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
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'edit' ? 'Edit Product' : 'Add New Product'}
            subtitle={mode === 'edit' ? 'Update product details in your inventory' : 'Create a new product entry'}
            maxWidth="max-w-xl"
            footer={
                <div className="flex gap-3 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-white text-slate-500 border-2 border-slate-100 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        form="product-form"
                        type="submit"
                        className="flex-[1.5] py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-md shadow-violet-200 hover:bg-primary-hover active:scale-95 transition-all"
                    >
                        {mode === 'edit' ? 'Update Product' : 'Add Product'}
                    </button>
                </div>
            }
        >
            <form id="product-form" onSubmit={handleSubmit} className="space-y-6 pb-4">
                {/* Branch Selection */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed] ml-1">Assign to Branch</label>
                    <div className="relative group">
                        <select
                            disabled={mode === 'edit'}
                            value={formData.branchId}
                            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                            <option value="all">All Managed Branches</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-[#7c3aed]">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>

                {/* Product Image */}
                <div className="space-y-1.5 flex flex-col items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 self-start ml-1">Product Image</label>
                    <label className="w-full h-44 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary-light transition-all duration-300 group relative overflow-hidden">
                        {formData.image ? (
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Upload className="text-slate-400 group-hover:text-primary transition-colors mb-2" size={32} />
                                <p className="text-xs font-bold text-slate-500 group-hover:text-primary transition-colors">Click to upload image</p>
                            </>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div>

                {/* Name & Description */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Whey Protein"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Product description..."
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-sm"
                        />
                    </div>
                </div>

                {/* SKU & Category */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">SKU</label>
                        <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="PRD-001"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                        <select
                            disabled={loadingCategories}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Selling Price (₹) *</label>
                        <input
                            required
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cost Price (₹)</label>
                        <input
                            type="number"
                            value={formData.costPrice}
                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Tax & Stock */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tax Rate (%)</label>
                        <input
                            type="number"
                            value={formData.taxRate}
                            onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Stock Quantity *</label>
                        <input
                            required
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                        <p className="text-sm font-black text-slate-900">Active Status</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product visibility on store</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active' })}
                        className={`w-14 h-7 rounded-full transition-all relative ${formData.status === 'Active' ? 'bg-primary shadow-md' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${formData.status === 'Active' ? 'left-8' : 'left-1'}`}></div>
                    </button>
                </div>

            </form>
        </RightDrawer>
    );
};

export default ProductDrawer;
