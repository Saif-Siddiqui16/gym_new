import React, { useState } from 'react';
import { Package, Calendar, MapPin, Tag, Hash, AlertCircle } from 'lucide-react';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES } from '../data/equipmentData';

const AddEquipmentModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Cardio',
        brand: '',
        model: '',
        serialNumber: '',
        location: '',
        purchaseDate: '',
        warrantyExpiry: '',
        status: 'Operational',
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
    };

    const inputClasses = "w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-bold text-slate-700 text-sm";
    const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className={labelClasses}><Tag size={12} /> Equipment Name</label>
                    <input
                        className={inputClasses}
                        placeholder="e.g. Matrix Treadmill T7xe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className={labelClasses}><Package size={12} /> Category</label>
                    <select
                        className={inputClasses}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {EQUIPMENT_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClasses}><Hash size={12} /> Serial Number</label>
                    <input
                        className={inputClasses}
                        placeholder="SN-XXXXXX"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                </div>

                <div>
                    <label className={labelClasses}><Tag size={12} /> Brand</label>
                    <input
                        className={inputClasses}
                        placeholder="e.g. Matrix"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                </div>

                <div>
                    <label className={labelClasses}><Tag size={12} /> Model</label>
                    <input
                        className={inputClasses}
                        placeholder="e.g. T7xe"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}><MapPin size={12} /> Location (Floor Area)</label>
                    <input
                        className={inputClasses}
                        placeholder="e.g. Cardio Zone - Floor 1"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                </div>

                <div>
                    <label className={labelClasses}><Calendar size={12} /> Purchase Date</label>
                    <input
                        type="date"
                        className={inputClasses}
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                </div>

                <div>
                    <label className={labelClasses}><Calendar size={12} /> Warranty Expiry</label>
                    <input
                        type="date"
                        className={inputClasses}
                        value={formData.warrantyExpiry}
                        onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                    />
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}><AlertCircle size={12} className="hidden" /> Status</label>
                    <div className="grid grid-cols-2 gap-2">
                        {EQUIPMENT_STATUSES.map(status => (
                            <label
                                key={status.value}
                                className={`
                                    flex items-center justify-center p-2.5 rounded-xl border-2 cursor-pointer transition-all gap-2
                                    ${formData.status === status.value
                                        ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                                        : 'border-slate-100 text-slate-500'}
                                `}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={status.value}
                                    className="hidden"
                                    onChange={() => setFormData({ ...formData, status: status.value })}
                                />
                                <span className={`w-2 h-2 rounded-full bg-${status.color}-500`} />
                                <span className="text-[10px] font-black uppercase tracking-tight">{status.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3.5 rounded-xl border-2 border-slate-100 text-slate-600 font-black uppercase tracking-wider text-xs hover:bg-slate-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-violet-200 hover:scale-105 active:scale-95 transition-all"
                >
                    Add Equipment
                </button>
            </div>
        </form>
    );
};

export default AddEquipmentModal;
