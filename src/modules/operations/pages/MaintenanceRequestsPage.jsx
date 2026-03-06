import React, { useState, useEffect } from 'react';
import { TICKET_STATUSES, SEVERITIES } from '../data/maintenanceData';
import { equipmentApi } from '../../../api/equipmentApi';
import toast from 'react-hot-toast';
import {
    Wrench,
    Clock,
    AlertCircle,
    CheckCircle2,
    User,
    Calendar,
    ChevronRight,
    Filter,
    ArrowUpRight,
    AlertTriangle,
    Search
} from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import RightDrawer from '../../../components/common/RightDrawer';

const MaintenanceRequestsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // UI States
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

    const tabs = ['All', 'Open', 'In Progress', 'Completed', 'Critical'];

    useEffect(() => {
        fetchTickets();
    }, [activeTab]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (activeTab !== 'All') {
                if (activeTab === 'Critical') filters.priority = 'Critical';
                else filters.status = activeTab;
            }

            const data = await equipmentApi.getMaintenanceRequests(filters);
            setTickets(data);
        } catch (error) {
            console.error("Failed to fetch maintenance requests:", error);
            toast.error("Failed to load maintenance tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await equipmentApi.updateMaintenanceStatus(id, newStatus);
            toast.success("Ticket status updated");
            fetchTickets();
        } catch (error) {
            toast.error("Failed to update ticket status");
        }
    };

    const getSeverityColor = (sev) => {
        return SEVERITIES.find(s => s.value === sev)?.color || 'slate';
    };

    const getStatusConfig = (status) => {
        return TICKET_STATUSES.find(s => s.label === status) || TICKET_STATUSES[0];
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-200 shrink-0">
                                    <Wrench size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Maintenance Requests</h1>
                                    <p className="text-slate-500 text-sm font-medium">Track and resolve equipment service tickets</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap
                                        ${activeTab === tab
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find by machine or ticket ID..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-medium text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Mobile Card View */}
                        <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                            {tickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    className={`bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden ${ticket.priority === 'Critical' ? 'border-l-4 border-l-red-500' : ''}`}
                                    onClick={() => {
                                        setSelectedTicket(ticket);
                                        setIsDetailDrawerOpen(true);
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ticket.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                <AlertTriangle size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{ticket.equipment?.name}</h4>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">#T-{ticket.id}</span>
                                            </div>
                                        </div>
                                        <StatusBadge
                                            status={ticket.status}
                                            color={getStatusConfig(ticket.status).color}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-2 text-xs mb-3">
                                        <div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Priority</p>
                                            <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-${getSeverityColor(ticket.priority)}-50 text-${getSeverityColor(ticket.priority)}-700 font-bold border border-${getSeverityColor(ticket.priority)}-100`}>
                                                <div className={`w-1.5 h-1.5 rounded-full bg-${getSeverityColor(ticket.priority)}-500`} />
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Date</p>
                                            <p className="font-bold text-slate-700 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                S
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">System</span>
                                        </div>
                                        <div onClick={e => e.stopPropagation()}>
                                            <select
                                                className="text-[10px] font-black uppercase tracking-tight bg-slate-50 border-none rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                                value={ticket.status}
                                                onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                                            >
                                                {TICKET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="saas-table-wrapper border-0 rounded-none hidden md:block">
                            <table className="saas-table saas-table-responsive w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipment</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Reported</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tickets.map(ticket => (
                                        <tr
                                            key={ticket.id}
                                            className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${ticket.priority === 'Critical' ? 'bg-red-50/30' : ''}`}
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setIsDetailDrawerOpen(true);
                                            }}
                                        >
                                            <td className="px-6 py-5" data-label="Ticket ID">
                                                <div className="flex justify-end sm:justify-start">
                                                    <span className="text-xs font-black text-slate-900 group-hover:text-amber-600 transition-colors uppercase">#T-{ticket.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5" data-label="Equipment">
                                                <div className="flex items-center gap-3 justify-end sm:justify-start">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ticket.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        <AlertTriangle size={16} />
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-sm">{ticket.equipment?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5" data-label="Priority">
                                                <div className="flex justify-end sm:justify-start">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-${getSeverityColor(ticket.priority)}-50 text-${getSeverityColor(ticket.priority)}-700 text-[10px] font-black uppercase tracking-wider border border-${getSeverityColor(ticket.priority)}-100`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full bg-${getSeverityColor(ticket.priority)}-500`} />
                                                        {ticket.priority}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5" data-label="Date Reported">
                                                <div className="flex flex-col text-right sm:text-left">
                                                    <p className="text-xs font-bold text-slate-700">Staff</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5" data-label="Status">
                                                <div className="flex justify-end sm:justify-start">
                                                    <StatusBadge
                                                        status={ticket.status}
                                                        color={getStatusConfig(ticket.status).color}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right" data-label="Actions" onClick={e => e.stopPropagation()}>
                                                <div className="flex justify-end">
                                                    <select
                                                        className="text-[10px] font-black uppercase tracking-tight bg-slate-50 border-none rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                                        value={ticket.status}
                                                        onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                                                    >
                                                        {TICKET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {tickets.length === 0 && (
                            <div className="p-20 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No requests found</h3>
                                <p className="text-slate-400 text-sm mt-1">Great job! All machines seem to be in good shape.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Detail Drawer */}
            <RightDrawer
                isOpen={isDetailDrawerOpen}
                onClose={() => setIsDetailDrawerOpen(false)}
                title={`Ticket #T-${selectedTicket?.id}`}
            >
                {selectedTicket && (
                    <div className="space-y-8">
                        <section className="space-y-4">
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Issue Reported</h4>
                                        <p className="text-lg font-black text-slate-800 mt-1">{selectedTicket.issue}</p>
                                    </div>
                                    <StatusBadge
                                        status={selectedTicket.status}
                                        color={getStatusConfig(selectedTicket.status).color}
                                    />
                                </div>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    {selectedTicket.issue}
                                </p>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border-2 border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipment</p>
                                <p className="text-sm font-bold text-slate-800 mt-1">{selectedTicket.equipment?.name}</p>
                            </div>
                            <div className="p-4 rounded-xl border-2 border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                                <p className={`text-sm font-bold text-${getSeverityColor(selectedTicket.priority)}-500 mt-1`}>
                                    {selectedTicket.priority}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl border-2 border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported By</p>
                                <p className="text-sm font-bold text-slate-800 mt-1">Staff</p>
                            </div>
                            <div className="p-4 rounded-xl border-2 border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Reported</p>
                                <p className="text-sm font-bold text-slate-800 mt-1">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} className="text-slate-400" /> Assignment & Progress
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-violet-50 border border-violet-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-violet-600 shadow-sm font-bold uppercase text-xs">
                                            {selectedTicket.assignedTo.split('')[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-wider">Assigned To</p>
                                            <p className="text-sm font-bold text-violet-900">{selectedTicket.assignedTo}</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-black uppercase text-violet-600 hover:underline">Reassign</button>
                                </div>
                            </div>
                        </section>

                        <div className="flex gap-3 pt-6 border-t border-slate-100">
                            <button className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200">
                                Update Status
                            </button>
                            <button className="px-6 py-4 rounded-xl border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default MaintenanceRequestsPage;
