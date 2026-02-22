import React, { useState } from 'react';
import { LogOut, Calendar, User, Clock, ShieldAlert, Trash2, Lock } from 'lucide-react';
import { releaseLocker } from '../../api/staff/lockerApi';
import RightDrawer from '../../components/common/RightDrawer';

const LockerDetailDrawer = ({ isOpen, onClose, selectedLocker, onSuccess }) => {
    const [isReleasing, setIsReleasing] = useState(false);

    const handleRelease = async () => {
        if (!selectedLocker) return;

        setIsReleasing(true);
        try {
            const result = await releaseLocker(selectedLocker.id);
            if (result.success) {
                alert(result.message);
                onSuccess();
                onClose();
            } else {
                alert(result.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsReleasing(false);
        }
    };

    const locker = selectedLocker || {};

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Locker Status"
            subtitle={selectedLocker ? `Locker #${selectedLocker.number}` : 'Locker Details'}
            maxWidth="max-w-md"
            footer={
                <div className="flex flex-col gap-4 w-full">
                    {selectedLocker && (
                        <button
                            onClick={handleRelease}
                            disabled={isReleasing}
                            className="w-full py-5 bg-rose-600 text-white rounded-[24px] font-black shadow-xl shadow-rose-500/30 hover:bg-rose-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
                        >
                            <LogOut size={22} />
                            {isReleasing ? 'Releasing...' : 'Confirm Release & Clear'}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all"
                    >
                        Dismiss View
                    </button>
                </div>
            }
        >
            {selectedLocker && (
                <div className="flex flex-col h-full bg-slate-50">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                        {/* Status Banner */}
                        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-xl mb-4 relative">
                                <Lock size={40} />
                                <div className="absolute top-0 right-0 w-6 h-6 bg-rose-500 rounded-full border-4 border-white animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Occupied Locker</h3>
                            <p className="text-sm font-bold text-rose-600 uppercase tracking-widest mt-1">Locker #{selectedLocker.number}</p>
                        </div>

                        {/* Assignment Details */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Occupant Information</h4>
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 flex items-center justify-center font-black">
                                        {selectedLocker.assignee?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-800">{selectedLocker.assignee || 'Anonymous Member'}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Member ID: MEM-2931-X</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                                    <div>
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Assigned On</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">Oct 12, 2023</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                            <Clock size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Expires On</span>
                                        </div>
                                        <p className="text-sm font-bold text-rose-600">Dec 31, 2023</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Internal Notes</h4>
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 italic text-sm text-slate-500 font-medium">
                                "Member requested locker near the showers. Storing gym bag and personal training equipment."
                            </div>
                        </div>

                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-rose-700">
                            <User className="shrink-0" size={18} />
                            <p className="text-[10px] font-bold leading-relaxed uppercase">
                                Releasing this locker will make it immediately available for other members. Current items should be cleared.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </RightDrawer>
    );
};

export default LockerDetailDrawer;
