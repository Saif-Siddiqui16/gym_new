import React, { useState } from 'react';
import { X, Save, Calendar, Info, Trash2, Edit3, Settings } from 'lucide-react';

const AddEquipmentDrawer = ({ isOpen, onClose, onAdd }) => {
    const [newItem, setNewItem] = useState({
        name: '',
        brand: '',
        model: '',
        category: '',
        location: '',
        serialNumber: '',
        purchaseDate: '',
        purchasePrice: '',
        warrantyExpiry: '',
        status: 'Operational'
    });

    const categories = [
        'Cardio',
        'Strength',
        'Free Weights',
        'Functional',
        'Recovery',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newItem.name) return;
        onAdd(newItem);
        setNewItem({
            name: '',
            brand: '',
            model: '',
            category: '',
            location: '',
            serialNumber: '',
            purchaseDate: '',
            purchasePrice: '',
            warrantyExpiry: '',
            status: 'Operational'
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Add New Equipment</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Add equipment to track in your gym</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Equipment Name */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Equipment Name *</label>
                    <input
                        required
                        type="text"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="e.g., Treadmill, Bench Press"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b00]/20 transition-all placeholder:text-slate-300"
                    />
                </div>

                {/* Brand & Model */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Brand</label>
                        <input
                            type="text"
                            value={newItem.brand}
                            onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                            placeholder="e.g., Life Fitness"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b00]/20 transition-all placeholder:text-slate-300"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Model</label>
                        <input
                            type="text"
                            value={newItem.model}
                            onChange={e => setNewItem({ ...newItem, model: e.target.value })}
                            placeholder="e.g., T5-GO"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b00]/20 transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
                        <select
                            value={newItem.category}
                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b00]/20 transition-all appearance-none"
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Location</label>
                        <input
                            type="text"
                            value={newItem.location}
                            onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                            placeholder="e.g., Cardio Zone"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b00]/20 transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Serial Number */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Serial Number</label>
                    <input
                        type="text"
                        value={newItem.serialNumber}
                        onChange={e => setNewItem({ ...newItem, serialNumber: e.target.value })}
                        placeholder="Equipment serial number"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b00]/20 transition-all placeholder:text-slate-300"
                    />
                </div>

                {/* Purchase Date & Price */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Purchase Date</label>
                        <div className="relative group">
                            <input
                                type="date"
                                value={newItem.purchaseDate}
                                onChange={e => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b00]/20 transition-all"
                            />
                            <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#ff6b00]" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Purchase Price (₹)</label>
                        <input
                            type="number"
                            value={newItem.purchasePrice}
                            onChange={e => setNewItem({ ...newItem, purchasePrice: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b00]/20 transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Warranty Expiry */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Warranty Expiry</label>
                    <div className="relative group">
                        <input
                            type="date"
                            value={newItem.warrantyExpiry}
                            onChange={e => setNewItem({ ...newItem, warrantyExpiry: e.target.value })}
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff6b00]/20 transition-all"
                        />
                        <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#ff6b00]" />
                    </div>
                </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-white">
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-slate-100 rounded-[20px] text-xs font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!newItem.name}
                        onClick={handleSubmit}
                        className="flex-1 px-6 py-3 bg-[#0a1b2e] text-white rounded-[20px] text-xs font-black hover:bg-[#1a2b3e] transition-all uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-slate-200"
                    >
                        Add Equipment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEquipmentDrawer;
