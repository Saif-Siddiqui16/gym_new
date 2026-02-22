import React, { useState } from 'react';
import { AlertTriangle, Clock, ShieldAlert, CheckSquare, XCircle, Info, ChevronRight } from 'lucide-react';
import '../../styles/GlobalDesign.css';

const BlockedEntryAlerts = () => {
    // Mock Data
    const [alerts, setAlerts] = useState([
        { id: 1, name: 'Amit Verma', reason: 'Expired', time: '10:15 AM', status: 'Blocked' },
        { id: 2, name: 'Rahul (Guest)', reason: 'Blocked', time: '09:45 AM', status: 'Blocked' },
        { id: 3, name: 'Sneha Gupta', reason: 'Unpaid', time: '08:20 AM', status: 'Blocked' },
    ]);

    const handleMarkAsSeen = (id) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
        // Could also call an API here to mark as seen in backend
    };

    const getReasonBadge = (reason) => {
        switch (reason) {
            case 'Expired': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm"><XCircle size={12} /> MEMBERSHIP EXPIRED</span>;
            case 'Blocked': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm"><ShieldAlert size={12} /> BLOCKED ID</span>;
            case 'Unpaid': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm"><AlertTriangle size={12} /> UNPAID DUES</span>;
            default: return null;
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans staffdashboard-blockedalerts">
            <div className="mb-8 animate-fade-in-down">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Blocked Entry Alerts</h1>
                <p className="text-sm text-gray-500 mt-1">Monitor recently rejected entries for manual intervention.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-red-100/50 border border-red-100 overflow-hidden animate-fade-in-up">
                <div className="p-6 bg-red-50/30 border-b border-red-100 flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-red-900 uppercase tracking-widest leading-none">Active Alerts</h3>
                        <p className="text-xs text-red-400 font-medium mt-1">Requires immediate attention</p>
                    </div>
                </div>

                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead className="bg-red-50/10">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Member Name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Attempt Time</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-red-50">
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <tr key={alert.id} className="hover:bg-red-50/40 transition-all duration-300 group">
                                        <td className="px-6 py-4" data-label="Member Name">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-red-50 text-red-500 rounded-full group-hover:bg-red-100 group-hover:text-red-600 transition-colors shadow-sm">
                                                    <AlertTriangle size={18} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-800 tracking-tight">{alert.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Reason">
                                            {getReasonBadge(alert.reason)}
                                        </td>
                                        <td className="px-6 py-4" data-label="Attempt Time">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                                                <Clock size={14} className="text-gray-400" />
                                                {alert.time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right" data-label="Actions">
                                            <button
                                                onClick={() => handleMarkAsSeen(alert.id)}
                                                className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ml-auto shadow-sm active:scale-95 group/btn"
                                            >
                                                <CheckSquare size={14} className="group-hover/btn:text-green-600 transition-colors" />
                                                Mark as Seen
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-green-50 text-green-500 rounded-full mb-2">
                                                <CheckSquare size={24} />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900">All Clear!</h4>
                                            <p className="text-xs text-gray-500">No blocked entry alerts at the moment.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Advice Box */}
            <div className="mt-8 p-1 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl flex gap-4 items-start md:items-center">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                        <Info size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            Front Desk Protocol
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            For any blocked entries, please cross-verify membership records in the global database or contact the manager for manual overrides if justified.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlockedEntryAlerts;
