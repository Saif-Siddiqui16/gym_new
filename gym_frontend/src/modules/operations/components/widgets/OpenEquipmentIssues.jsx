import React from 'react';
import { AlertTriangle, ArrowRight, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OpenEquipmentIssues = ({ tickets = [] }) => {
    const navigate = useNavigate();

    // Calculate real counts from tickets
    const openCount = tickets.filter(t => t.status !== 'Completed' && t.status !== 'Closed').length;
    const criticalTickets = tickets.filter(t => t.severity === 'Critical' && t.status !== 'Completed' && t.status !== 'Closed');
    const criticalCount = criticalTickets.length;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Equipment Alerts</h3>
                    <p className="text-slate-400 text-xs font-medium">Active maintenance tickets</p>
                </div>
            </div>

            {/* Counts Section */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Open</p>
                    <p className="text-2xl font-black text-slate-800 mt-2">{openCount}</p>
                </div>
                <div className="h-10 w-1 bg-slate-200 rounded-full" />
                <div className="text-right">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Critical</p>
                    <p className="text-2xl font-black text-red-600 mt-2">{criticalCount}</p>
                </div>
            </div>

            {/* List Section */}
            <div className="flex-1 space-y-3 mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Critical Issues</p>
                {criticalTickets.length > 0 ? (
                    criticalTickets.slice(0, 3).map(ticket => (
                        <div key={ticket.id} className="p-3 rounded-xl bg-red-50/50 border border-red-100/50 flex items-center justify-between group cursor-pointer hover:bg-red-50 transition-all" onClick={() => navigate('/facility/maintenance')}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">
                                    {ticket.id.split('-')[1]}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 leading-none">{ticket.equipment}</p>
                                    <p className="text-[10px] text-red-500 font-medium mt-1">{ticket.issueType}</p>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-red-300 group-hover:translate-x-1 transition-all" />
                        </div>
                    ))
                ) : (
                    <div className="p-4 rounded-xl border-2 border-dashed border-slate-100 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">No critical issues</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => navigate('/facility/maintenance')}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
                View Maintenance Board
                <ArrowRight size={16} />
            </button>
        </div>
    );
};

export default OpenEquipmentIssues;
