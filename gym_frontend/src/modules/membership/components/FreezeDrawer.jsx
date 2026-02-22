import React, { useState } from 'react';
import { X, PauseCircle, AlertTriangle } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import Button from '../../../components/ui/Button';

const FreezeDrawer = ({ isOpen, onClose, onFreeze, memberName }) => {
    const [duration, setDuration] = useState(1);
    const [reason, setReason] = useState('');
    const [isChargeable, setIsChargeable] = useState(true);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onFreeze({ duration, reason, isChargeable });
        onClose();
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Freeze Membership"
            subtitle={memberName}
            maxWidth="max-w-md"
            footer={
                <div className="flex gap-3 w-full">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-3 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 font-bold">Cancel</Button>
                    <Button type="submit" form="freeze-form" variant="primary" className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 border-transparent font-bold text-white">Confirm Freeze</Button>
                </div>
            }
        >
            <form id="freeze-form" onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 text-orange-800 text-sm font-bold">
                        <AlertTriangle className="shrink-0" size={20} />
                        <p>Freezing membership for {memberName} will pause their access and extend their expiry date.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Duration (Months)</label>
                        <select
                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border-transparent focus:bg-white ring-2 ring-transparent focus:ring-orange-100 outline-none font-bold text-sm"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                        >
                            {[1, 2, 3, 4, 5, 6].map(m => (
                                <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Reason</label>
                        <textarea
                            className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white ring-2 ring-transparent focus:ring-orange-100 outline-none font-medium text-sm transition-all resize-none h-24"
                            placeholder="Why is the member requesting a freeze?"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="chargeable"
                            className="w-5 h-5 rounded-md text-orange-500 focus:ring-orange-200 border-gray-300"
                            checked={isChargeable}
                            onChange={(e) => setIsChargeable(e.target.checked)}
                        />
                        <label htmlFor="chargeable" className="text-sm font-bold text-gray-700">Apply Freeze Fee (₹500/month)</label>
                    </div>
                </div>
            </form>
        </RightDrawer>
    );
};

export default FreezeDrawer;
