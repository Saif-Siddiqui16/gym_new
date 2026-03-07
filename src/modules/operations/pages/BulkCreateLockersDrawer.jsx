import React, { useState } from 'react';
import { Box, Plus, X, Monitor, ChevronRight, Layers, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';

const BulkCreateLockersDrawer = ({ onClose, onSuccess }) => {
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        prefix: 'L',
        startNumber: '1',
        endNumber: '10',
        size: 'Medium',
        isChargeable: false,
        price: '0',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { bulkCreateLockers } = await import('../../../api/staff/lockerApi');
            const result = await bulkCreateLockers({
                ...formData,
                tenantId: selectedBranch
            });
            if (result.success) {
                toast.success(result.message || `${previewCount} lockers created successfully`);
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to create lockers');
        } finally {
            setLoading(false);
        }
    };

    const previewCount = Math.max(0, parseInt(formData.endNumber) - parseInt(formData.startNumber) + 1);

    const generatePreview = () => {
        const preview = [];
        const count = Math.min(previewCount, 10);
        const start = parseInt(formData.startNumber) || 1;

        for (let i = 0; i < count; i++) {
            const num = (start + i).toString().padStart(3, '0');
            preview.push(`${formData.prefix}-${num}`);
        }
        return preview;
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white font-sans animate-in slide-in-from-right-4">
            <div className="flex-1  space-y-10">
                {/* Prefix & Range */}
                <div className="space-y-6">
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prefix</label>
                        <input
                            type="text"
                            value={formData.prefix}
                            onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                            className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Number</label>
                            <input
                                type="number"
                                value={formData.startNumber}
                                onChange={(e) => setFormData({ ...formData, startNumber: e.target.value })}
                                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                                min="1"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Number</label>
                            <input
                                type="number"
                                value={formData.endNumber}
                                onChange={(e) => setFormData({ ...formData, endNumber: e.target.value })}
                                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                                min="1"
                            />
                        </div>
                    </div>
                </div>

                {/* Configuration */}
                <div className="space-y-6">
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Size (all)</label>
                        <div className="relative group">
                            <select
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat shadow-sm"
                            >
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary-light border border-violet-100 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Is Chargeable?</h4>
                                <p className="text-[9px] font-bold text-slate-400 mt-0.5">Enable to set a monthly rental fee</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.isChargeable}
                                onChange={(e) => setFormData({ ...formData, isChargeable: e.target.checked })}
                            />
                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                        </label>
                    </div>

                    {formData.isChargeable && (
                        <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                Monthly Rental Fee (per branch)
                            </label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors font-black text-sm">₹</div>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full h-14 pl-10 pr-5 bg-white border-2 border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview ({isNaN(previewCount) ? 0 : previewCount} lockers)</h4>
                        <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-[8px] font-black text-emerald-600 uppercase">Live Preview</span>
                        </div>
                    </div>
                    <div className="bg-slate-50/50 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[100px] shadow-inner">
                        {isNaN(previewCount) || previewCount <= 0 ? (
                            <div className="col-span-full py-8 text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Invalid range</p>
                            </div>
                        ) : (
                            <>
                                {generatePreview().map((lockerId, idx) => (
                                    <div key={idx} className="bg-white px-4 py-2.5 border border-slate-100 rounded-xl text-[11px] font-black text-slate-700 shadow-sm flex items-center justify-center gap-2 group hover:border-violet-200 hover:scale-105 transition-all">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-violet-400 transition-colors"></div>
                                        {lockerId}
                                    </div>
                                ))}
                                {previewCount > 10 && (
                                    <div className="col-span-full text-center pt-2">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic group cursor-default">
                                            ...and {previewCount - 10} more in sequence
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-8 border-t border-slate-50 flex gap-4 sticky bottom-0 bg-white/80 backdrop-blur-md">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-12 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || isNaN(previewCount) || previewCount <= 0}
                    className="flex-[1.5] h-12 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-200 hover:bg-primary-hover hover:scale-105 transition-all disabled:opacity-50"
                >
                    {loading ? 'Creating...' : `Create ${isNaN(previewCount) ? 0 : previewCount} Lockers`}
                </button>
            </div>
        </form>
    );
};

export default BulkCreateLockersDrawer;
