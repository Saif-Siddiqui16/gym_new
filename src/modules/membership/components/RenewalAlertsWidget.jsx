import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, ChevronRight, Phone, MessageCircle } from 'lucide-react';
import { fetchRenewalAlerts } from '../../../api/branchAdmin/branchAdminApi';

const RenewalAlertsWidget = ({ alertsData }) => {
    const navigate = useNavigate();
    const [data, setData] = useState({ expiringSoon: [], recentlyExpired: [] });
    const [loading, setLoading] = useState(!alertsData);
    const today = new Date();

    const getDaysDiff = (dateStr) => {
        const date = new Date(dateStr);
        const diffTime = date - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    useEffect(() => {
        if (alertsData) {
            setData({
                expiringSoon: alertsData.expiringSoon || [],
                recentlyExpired: alertsData.recentlyExpired || []
            });
            setLoading(false);
            return;
        }

        const loadAlerts = async () => {
            try {
                setLoading(true);
                const response = await fetchRenewalAlerts();
                setData({
                    expiringSoon: response.expiringSoon || [],
                    recentlyExpired: response.recentlyExpired || []
                });
            } catch (err) {
                console.error("Failed to load renewal alerts", err);
            } finally {
                setLoading(false);
            }
        };

        loadAlerts();
    }, [alertsData]);

    const { expiringSoon, recentlyExpired } = data;

    return (
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
            <div className="p-4 md:p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50/50 to-rose-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Renewal Alerts</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Retention Opportunity</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/members/renewal-alerts')}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
                >
                    View All <ChevronRight size={14} />
                </button>
            </div>

            <div className="p-4 md:p-6 space-y-8">
                {/* Expiring Soon Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Expiring in 7 Days
                        </h4>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            {expiringSoon.length} Members
                        </span>
                    </div>

                    <div className="space-y-3">
                        {expiringSoon.length > 0 ? expiringSoon.map(member => (
                            <div key={member.id} className="group relative p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                            {member.memberName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{member.memberName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{member.planName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-amber-600 uppercase">Ends In</p>
                                        <p className="text-sm font-black text-slate-700">{getDaysDiff(member.endDate)} Days</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-green-600 hover:border-green-200 transition-all">
                                        <Phone size={14} />
                                    </button>
                                    <button className="flex-1 py-2 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-200 transition-all">
                                        <MessageCircle size={14} />
                                    </button>
                                    <button className="flex-[2] py-2 rounded-lg bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all">
                                        Renew
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No immediate renewals</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recently Expired Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Recently Expired
                        </h4>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            {recentlyExpired.length} Members
                        </span>
                    </div>

                    <div className="space-y-3">
                        {recentlyExpired.length > 0 ? recentlyExpired.map(member => (
                            <div key={member.id} className="group p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-rose-200 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center font-black text-slate-300 group-hover:bg-rose-500 group-hover:text-white transition-all text-xs">
                                            {member.memberName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{member.memberName}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase italic">Expired {Math.abs(getDaysDiff(member.endDate))} days ago</p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all">
                                        <Phone size={14} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">No recent expirations</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RenewalAlertsWidget;
