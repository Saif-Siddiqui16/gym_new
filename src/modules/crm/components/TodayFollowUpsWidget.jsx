import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, ChevronRight, Loader2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';

const TodayFollowUpsWidget = () => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFollowUps();
    }, [selectedBranch]);

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/crm/followups/today', {
                params: { branchId: selectedBranch }
            });
            setFollowUps(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Fetch today followups error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full animate-fadeIn group">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform duration-500">
                        <Calendar size={22} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">Today's Follow-ups</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {followUps.length} Pending for today
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/crm/pipeline')}
                    className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary-hover hover:shadow-lg hover:shadow-violet-100 transition-all duration-300"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto saas-scrollbar p-6">
                {followUps.length > 0 ? (
                    <div className="space-y-4">
                        {followUps.map((lead) => (
                            <div 
                                key={lead.id} 
                                onClick={() => navigate('/crm/pipeline')}
                                className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-primary-hover hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer group/item flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black group-hover/item:bg-primary-light group-hover/item:text-primary transition-colors">
                                        {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate max-w-[140px]">{lead.name}</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                <Phone size={10} />
                                                {lead.phone}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                                                <Clock size={10} />
                                                {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-50 text-slate-300 group-hover/item:bg-primary-light group-hover/item:text-primary transition-all">
                                    <Phone size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="w-16 h-16 rounded-[2rem] bg-white shadow-sm flex items-center justify-center text-slate-200 mx-auto">
                            <Users size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">No follow-ups today</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Great job! You're all caught up.</p>
                        </div>
                    </div>
                )}
            </div>

            {followUps.length > 0 && (
                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                    <button
                        onClick={() => navigate('/crm/pipeline')}
                        className="w-full py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        View Pipeline
                    </button>
                </div>
            )}
        </div>
    );
};

export default TodayFollowUpsWidget;
