import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Clock, AlertCircle } from 'lucide-react';

const LockerDetailsDrawer = ({ isOpen, onClose, locker, onAssign, onRelease }) => {
    const [selectedMember, setSelectedMember] = useState('');

    // Reset member selection when modal opens with a new locker
    useEffect(() => {
        if (isOpen) {
            setSelectedMember('');
        }
    }, [isOpen, locker]);

    if (!isOpen || !locker) return null;

    const handleAssign = () => {
        onAssign(selectedMember || 'New Assignment');
    };

    const getStatusConfig = (status) => {
        const config = {
            'Available': { gradient: 'from-emerald-500 to-emerald-600', icon: Unlock, shadow: 'shadow-emerald-500/50', border: 'border-emerald-200' },
            'Occupied': { gradient: 'from-blue-500 to-indigo-600', icon: Lock, shadow: 'shadow-blue-500/50', border: 'border-blue-200' },
            'Reserved': { gradient: 'from-amber-500 to-orange-600', icon: Clock, shadow: 'shadow-amber-500/50', border: 'border-amber-200' },
            'Maintenance': { gradient: 'from-red-500 to-red-600', icon: AlertCircle, shadow: 'shadow-red-500/50', border: 'border-red-200' },
        };
        return config[status] || config['Available'];
    };

    const config = getStatusConfig(locker.status);
    const Icon = config.icon;

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
                        <Icon size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Locker {locker.id}</h3>
                    <p className={`text-sm font-bold mt-1 ${locker.status === 'Available' ? 'text-emerald-600' :
                            locker.status === 'Occupied' ? 'text-blue-600' :
                                locker.status === 'Reserved' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                        {locker.status}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {locker.status === 'Available' ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Assign to Member</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                            >
                                <option value="">Select Member...</option>
                                <option value="John Doe (M101)">John Doe</option>
                                <option value="Jane Smith (M102)">Jane Smith</option>
                            </select>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                            <h4 className="text-yellow-800 font-bold text-sm mb-1">Note</h4>
                            <p className="text-yellow-700 text-xs">Assigning a locker will mark it as occupied immediately.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                            <div className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">Occupied By</div>
                            <div className="font-black text-slate-900 text-lg">{locker.member || 'Unknown User'}</div>
                        </div>

                        {locker.status === 'Occupied' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <h4 className="text-blue-800 font-bold text-sm mb-1">Usage Info</h4>
                                <p className="text-blue-700 text-xs">This locker is currently in use by a member.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                {locker.status === 'Available' ? (
                    <button
                        onClick={handleAssign}
                        disabled={!selectedMember}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-violet-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Assignment
                    </button>
                ) : (
                    <button
                        onClick={onRelease}
                        className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-red-500/50 transition-all duration-300"
                    >
                        Release Locker
                    </button>
                )}
            </div>
        </div>
    );
};

export default LockerDetailsDrawer;
