import React, { useState } from 'react';
import { Gift, Star, X } from 'lucide-react';

const AddRewardDrawer = ({ isOpen, onClose, onAdd }) => {
    const [newReward, setNewReward] = useState({ name: '', points: '', description: '' });

    const handleSubmit = () => {
        if (!newReward.name || !newReward.points) return;
        onAdd(newReward);
        setNewReward({ name: '', points: '', description: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <Gift size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Add New Reward</h3>
                        <p className="text-slate-500 text-xs font-medium">Create a new redeemable item</p>
                    </div>
                </div>
                {/* Close button is handled by RightDrawer usually, but we can keep a secondary one or rely on parent */}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Reward Name</label>
                    <input
                        type="text"
                        value={newReward.name}
                        onChange={e => setNewReward({ ...newReward, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                        placeholder="e.g. Gym Bag"
                    />
                </div>

                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Points Cost</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={newReward.points}
                            onChange={e => setNewReward({ ...newReward, points: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300 pl-10"
                            placeholder="1000"
                        />
                        <Star size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
                    <textarea
                        value={newReward.description}
                        onChange={e => setNewReward({ ...newReward, description: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300 min-h-[120px] resize-none"
                        placeholder="Brief details..."
                    />
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
                        onClick={handleSubmit}
                        disabled={!newReward.name || !newReward.points}
                        className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-violet-500/50 transition-all duration-300 disabled:opacity-50"
                    >
                        Create Reward
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRewardDrawer;
