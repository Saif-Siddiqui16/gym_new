import React, { useState } from 'react';
import { X, Gift, Calendar } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const GiftDaysDrawer = ({ isOpen, onClose, onGift, memberName }) => {
    const [days, setDays] = useState(7);
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onGift({ days, note });
        onClose();
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Gift Free Days"
            subtitle={memberName}
            maxWidth="max-w-md"
            footer={
                <div className="flex gap-3 w-full">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-3 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 font-bold">Cancel</Button>
                    <Button type="submit" form="gift-days-form" variant="primary" className="flex-1 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-200 border-transparent font-bold text-white">Add Gift Days</Button>
                </div>
            }
        >
            <form id="gift-days-form" onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 flex gap-3 text-pink-800 text-sm font-bold">
                        <Calendar className="shrink-0" size={20} />
                        <p>Adding complimentary days to {memberName}'s plan. This will extend their expiry date.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Number of Days</label>
                        <Input
                            type="number"
                            className="w-full bg-gray-50 border-transparent focus:bg-white transition-all font-bold"
                            placeholder="e.g. 7"
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            min="1"
                            max="365"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Internal Note</label>
                        <textarea
                            className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white ring-2 ring-transparent focus:ring-pink-100 outline-none font-medium text-sm transition-all resize-none h-24"
                            placeholder="Reason for gift (e.g. Referral Bonus, Birthday)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </form>
        </RightDrawer>
    );
};

export default GiftDaysDrawer;
