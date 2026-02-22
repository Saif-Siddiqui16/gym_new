import React, { useState } from 'react';
import { Wrench, Plus, Calendar } from 'lucide-react';

const AddEquipmentDrawer = ({ isOpen, onClose, onAdd }) => {
    const [newItem, setNewItem] = useState({ name: '', status: 'Working', lastMaintenance: '', nextMaintenance: '' });

    const handleAdd = () => {
        if (!newItem.name) return;
        onAdd(newItem);
        setNewItem({ name: '', status: 'Working', lastMaintenance: '', nextMaintenance: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <Wrench size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Add New Equipment</h3>
                        <p className="text-slate-500 text-xs font-medium">Register machinery for maintenance tracking</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Equipment Name</label>
                    <input
                        type="text"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                        placeholder="e.g. Treadmill X500"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Last Service Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={newItem.lastMaintenance}
                                onChange={e => setNewItem({ ...newItem, lastMaintenance: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                            />
                            {/* Browser native date picker usually has icon, but we can style if needed. Keeping simple for now */}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Next Service Due</label>
                        <input
                            type="date"
                            value={newItem.nextMaintenance}
                            onChange={e => setNewItem({ ...newItem, nextMaintenance: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <h4 className="text-slate-700 font-bold text-sm mb-1">Status</h4>
                    <p className="text-slate-500 text-xs">New equipment is set to <span className="text-emerald-600 font-bold">Working</span> by default.</p>
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-white border-2 border-slate-200 hover:border-slate-300 transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!newItem.name}
                        className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-violet-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Item
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEquipmentDrawer;
