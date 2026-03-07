import React, { useState } from 'react';
import { X, Save, Calendar, Info, Trash2, Edit3, Settings } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';

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

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Equipment"
            subtitle="Add equipment to track in your gym"
            footer={
                <div className="flex gap-3 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="add-equipment-form"
                        disabled={!newItem.name}
                        className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl text-[10px] font-black hover:bg-primary-hover transition-all uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-violet-100"
                    >
                        Add Equipment
                    </button>
                </div>
            }
        >
            <form id="add-equipment-form" onSubmit={handleSubmit} className="space-y-6 pb-4">
                {/* Equipment Name */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Equipment Name *</label>
                    <input
                        required
                        type="text"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="e.g., Treadmill, Bench Press"
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all placeholder:text-slate-300 shadow-sm"
                    />
                </div>

                {/* Brand & Model */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Brand</label>
                        <input
                            type="text"
                            value={newItem.brand}
                            onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                            placeholder="e.g. Life Fitness"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Model</label>
                        <input
                            type="text"
                            value={newItem.model}
                            onChange={e => setNewItem({ ...newItem, model: e.target.value })}
                            placeholder="e.g. T5-GO"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Category</label>
                        <div className="relative">
                            <select
                                value={newItem.category}
                                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Location</label>
                        <input
                            type="text"
                            value={newItem.location}
                            onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                            placeholder="e.g. Cardio Zone"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                </div>

                {/* Serial Number */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Serial Number</label>
                    <input
                        type="text"
                        value={newItem.serialNumber}
                        onChange={e => setNewItem({ ...newItem, serialNumber: e.target.value })}
                        placeholder="Equipment serial number"
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all placeholder:text-slate-300 shadow-sm"
                    />
                </div>

                {/* Purchase Date & Price */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Purchase Date</label>
                        <div className="relative group">
                            <input
                                type="date"
                                value={newItem.purchaseDate}
                                onChange={e => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                                className="w-full pl-5 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm"
                            />
                            <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Purchase Price (₹)</label>
                        <input
                            type="number"
                            value={newItem.purchasePrice}
                            onChange={e => setNewItem({ ...newItem, purchasePrice: e.target.value })}
                            placeholder="0"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                </div>

                {/* Warranty Expiry */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Warranty Expiry</label>
                    <div className="relative group">
                        <input
                            type="date"
                            value={newItem.warrantyExpiry}
                            onChange={e => setNewItem({ ...newItem, warrantyExpiry: e.target.value })}
                            className="w-full pl-5 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                        <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary" />
                    </div>
                </div>
            </form>
        </RightDrawer>
    );
};

export default AddEquipmentDrawer;
