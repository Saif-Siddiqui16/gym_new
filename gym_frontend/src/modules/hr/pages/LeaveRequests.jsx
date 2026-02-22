import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { fetchLeaveRequestsAPI, updateLeaveStatusAPI } from '../../../api/admin/adminApi';

const LeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await fetchLeaveRequestsAPI();
            setRequests(data);
        } catch (error) {
            console.error('Error loading leave requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setIsUpdating(true);
        try {
            await updateLeaveStatusAPI(id, status);
            alert(`Leave request ${status.toLowerCase()}!`);
            loadRequests();
        } catch (error) {
            console.error('Error updating leave request:', error);
            alert('Failed to update leave request.');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border border-red-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading leave requests...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Calendar className="text-violet-500" size={28} />
                        Leave Requests
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm">Review and manage staff leave applications</p>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No leave requests found.
                                    </td>
                                </tr>
                            ) : requests.map((leave) => (
                                <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">{leave.user?.name || 'Unknown'}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{leave.user?.role || 'Staff'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-bold text-slate-600">{leave.type}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-slate-900">
                                                {new Date(leave.startDate).toLocaleDateString()}
                                                {new Date(leave.startDate).getTime() !== new Date(leave.endDate).getTime() && ` – ${new Date(leave.endDate).toLocaleDateString()}`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs text-slate-500 font-medium truncate max-w-[200px] block" title={leave.reason}>
                                            {leave.reason}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${getStatusStyle(leave.status)}`}>
                                                {leave.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center gap-2">
                                            {leave.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(leave.id, 'Approved')}
                                                        disabled={isUpdating}
                                                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(leave.id, 'Rejected')}
                                                        disabled={isUpdating}
                                                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequests;
