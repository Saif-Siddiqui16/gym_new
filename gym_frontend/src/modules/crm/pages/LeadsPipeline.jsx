import React, { useState } from 'react';
import { Search, Filter, Calendar, Phone, ArrowRight, MoreVertical, Check, UserPlus, XCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { crmApi } from '../../../api/crm/crmApi';
import { useEffect } from 'react';

const LEAD_STATUSES = [
    { id: 'New', label: 'New Inquiries', color: 'blue' },
    { id: 'Contacted', label: 'Contacted', color: 'amber' },
    { id: 'Qualified', label: 'Qualified', color: 'purple' },
    { id: 'Converted', label: 'Converted', color: 'emerald' },
    { id: 'Lost', label: 'Lost', color: 'rose' }
];

const LeadsPipeline = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const { user } = useAuth();

    const loggedInUser = user || { role: '', id: '', branchId: '' };

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const data = await crmApi.getLeads();
            setLeads(data);
        } catch (error) {
            console.error('Error fetching leads:', error);
            setToast({ show: true, message: 'Failed to load leads', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleAction = async (leadId, type) => {
        let newStatus = '';
        let message = '';

        if (type === 'contact') {
            newStatus = 'Contacted';
            message = 'Lead marked as contacted.';
        } else if (type === 'qualify') {
            newStatus = 'Qualified';
            message = 'Lead marked as qualified.';
        } else if (type === 'convert') {
            newStatus = 'Converted';
            message = 'Lead converted to member successfully!';
        } else if (type === 'lost') {
            newStatus = 'Lost';
            message = 'Lead marked as not interested.';
        }

        if (newStatus) {
            try {
                await crmApi.updateLeadStatus(leadId, newStatus);
                setLeads(leads.map(lead =>
                    lead.id === leadId ? { ...lead, status: newStatus } : lead
                ));
                setToast({ show: true, message, type: 'success' });
                setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
            } catch (error) {
                console.error('Update failed:', error);
                setToast({ show: true, message: 'Failed to update status', type: 'error' });
            }
        }
    };

    const colorMap = {
        blue: 'bg-blue-500',
        amber: 'bg-amber-500',
        purple: 'bg-purple-500',
        emerald: 'bg-emerald-500',
        rose: 'bg-rose-500'
    };

    // Filter leads (Backend already filters by Tenant and Trainer, frontend just does Search)
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm);
        return matchesSearch;
    });

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-visible hover:shadow-2xl transition-all duration-300">
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                        <input
                            type="text"
                            className="pl-11 h-11 w-full rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm bg-white"
                            placeholder="Search leads by name or phone..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:border-violet-200 hover:text-violet-600 transition-all">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Kanban Pipeline */}
            <div className="flex flex-col lg:flex-row gap-6 lg:overflow-x-auto lg:pb-8 scrollbar-hide min-h-[600px]">
                {LEAD_STATUSES.map((status) => (
                    <div key={status.id} className="flex-shrink-0 w-full lg:w-[350px] flex flex-col gap-3 md:gap-4">
                        {/* Column Header */}
                        <div className="flex items-center justify-between px-1 md:px-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${colorMap[status.color] || 'bg-slate-400'}`} />
                                <h3 className="text-xs md:text-sm font-black text-slate-700 uppercase tracking-widest">{status.label}</h3>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] md:text-[10px] font-bold text-slate-500">
                                    {filteredLeads.filter(l => l.status === status.id).length}
                                </span>
                            </div>
                            <MoreVertical size={16} className="text-slate-400 cursor-pointer" />
                        </div>

                        {/* Column Content */}
                        <div className="flex flex-col gap-3 md:gap-4 p-1 md:p-2 rounded-2xl bg-slate-50/50 border border-slate-100/50 min-h-[150px]">
                            {filteredLeads.filter(l => l.status === status.id).map(lead => (
                                <div
                                    key={lead.id}
                                    className="saas-card !mb-0 group cursor-grab active:cursor-grabbing border-slate-100 hover:border-violet-200 hover:shadow-violet-500/10 transition-all duration-300"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-sm group-hover:from-violet-500 group-hover:to-purple-600 group-hover:text-white transition-all duration-500">
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors uppercase tracking-tight">{lead.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">
                                                    {Array.isArray(lead.interests) && lead.interests.length > 0 ? lead.interests[0] : 'Inquiry'}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="p-1 text-slate-300 hover:text-slate-600">
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-3 mb-5">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Phone size={12} className="text-violet-400" />
                                            <span className="text-[11px] font-medium tracking-tight">{lead.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar size={12} className="text-violet-400" />
                                            <span className="text-[11px] font-medium tracking-tight">
                                                Follow-up: {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'Not set'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full border-2 border-white bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">AV</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {lead.status !== 'Lost' && (
                                                <button
                                                    onClick={() => handleAction(lead.id, 'lost')}
                                                    className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                    title="Mark Lost"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            )}
                                            {lead.status === 'New' && (
                                                <button
                                                    onClick={() => handleAction(lead.id, 'contact')}
                                                    className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all"
                                                    title="Mark Contacted"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            {lead.status === 'Contacted' && (
                                                <button
                                                    onClick={() => handleAction(lead.id, 'qualify')}
                                                    className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-all"
                                                    title="Mark Qualified"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            {lead.status !== 'Converted' && lead.status !== 'Lost' && (
                                                <button
                                                    onClick={() => handleAction(lead.id, 'convert')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 shadow-sm shadow-violet-100 hover:shadow-violet-200 hover:-translate-y-0.5 transition-all"
                                                    title="Convert to Member"
                                                >
                                                    <ArrowRight size={12} />
                                                    Convert
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Toast Feedback */}
            {toast.show && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300">
                    <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 text-white border-slate-700'
                        }`}>
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center uppercase">
                            <Check size={14} className="text-white" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadsPipeline;
