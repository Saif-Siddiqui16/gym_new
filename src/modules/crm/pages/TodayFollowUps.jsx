import React, { useState, useEffect } from 'react';
import { Phone, Clock, User, CheckCircle, Search, ExternalLink, Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { crmApi } from '../../../api/crm/crmApi';

const TodayFollowUps = ({ isWidget = false }) => {
    const [leads, setLeads] = useState([]);
    const [actionDone, setActionDone] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const loggedInUser = user || { role: '', id: '' };

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            const data = await crmApi.getTodayFollowUps();
            setLeads(data);
        } catch (error) {
            console.error('Error fetching follow-ups:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowUps();
    }, []);

    const today = new Date().toISOString().split('T')[0];
    const todayLeads = leads; // Backend already filters for today

    const handleAction = async (leadId) => {
        // Logic to mark as done (maybe update lead status or follow-up status?)
        // For now, let's just visually remove it and optionally call an API update if needed
        // Assuming "Mark Contacted" updates lead status to 'Contacted'

        try {
            await crmApi.updateLeadStatus(leadId, 'Contacted');
            setActionDone(leadId);
            setTimeout(() => {
                setLeads(leads.filter(l => l.id !== leadId));
                setActionDone(null);
            }, 1000);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <div className={`saas-card !p-0 overflow-hidden ${isWidget ? '' : 'max-w-4xl mx-auto'}`}>
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase tracking-widest text-xs">Today's Follow-ups</h3>
                        <p className="text-[10px] font-bold text-slate-400">Scheduled for {today}</p>
                    </div>
                </div>
                <span className="px-3 py-1 rounded-lg bg-violet-600 text-white text-[10px] font-black">
                    {todayLeads.length} PENDING
                </span>
            </div>

            <div className="divide-y divide-slate-50">
                {todayLeads.length > 0 ? (
                    todayLeads.map((lead) => (
                        <div key={lead.id} className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-violet-100 bg-white flex items-center justify-center text-violet-600 font-black relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    {lead.name.charAt(0)}
                                    <div className="absolute inset-0 bg-violet-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 tracking-tight group-hover:text-violet-700 transition-colors uppercase text-sm">{lead.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                                            <Phone size={10} className="text-violet-400" />
                                            {lead.phone}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                                            <Clock size={10} className="text-violet-400" />
                                            {lead.followUpTime || 'Not set'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                <a
                                    href={`tel:${lead.phone}`}
                                    className="flex-1 sm:flex-none p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition-all flex items-center justify-center"
                                    title="Call Now"
                                >
                                    <Phone size={18} />
                                </a>
                                <button
                                    onClick={() => handleAction(lead.id)}
                                    className={`flex-[2] sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${actionDone === lead.id
                                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700'
                                        }`}
                                >
                                    {actionDone === lead.id ? (
                                        <>
                                            <Check size={14} strokeWidth={3} />
                                            Done
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={14} />
                                            Mark Contacted
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                            <Clock size={32} />
                        </div>
                        <p className="text-slate-400 font-bold text-sm tracking-tight uppercase">No follow-ups scheduled for today</p>
                    </div>
                )}
            </div>

            {!isWidget && todayLeads.length > 0 && (
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
                    <button className="text-violet-600 font-black uppercase tracking-widest text-[10px] hover:underline flex items-center gap-2">
                        View All History
                        <ExternalLink size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default TodayFollowUps;
