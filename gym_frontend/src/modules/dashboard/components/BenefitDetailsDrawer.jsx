import React from 'react';
import RightDrawer from '../../../components/common/RightDrawer';
import { Calendar, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const BenefitDetailsDrawer = ({ isOpen, onClose, benefit }) => {
    if (!benefit) return null;

    const isUnlimited = benefit.total === 'Unlimited';
    const remaining = isUnlimited ? 'Unlimited' : benefit.total - benefit.used;
    const progress = isUnlimited ? 100 : (benefit.used / benefit.total) * 100;

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={benefit.name}
            subtitle="Benefit utilization & history"
        >
            <div className="flex flex-col h-full">
                <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">

                    {/* Summary Card */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Current Usage</h4>
                                <div className="text-3xl font-black text-slate-900">
                                    {benefit.used} <span className="text-sm text-slate-400 uppercase tracking-widest">/ {benefit.total}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Remaining</h4>
                                <div className="text-xl font-black text-violet-600">
                                    {remaining}
                                </div>
                            </div>
                        </div>

                        {!isUnlimited && (
                            <div className="space-y-2">
                                <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-100">
                                    <div
                                        className="h-full bg-violet-600 rounded-full shadow-sm shadow-violet-100 transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                    <span>Used</span>
                                    <span>{Math.round(progress)}% Complete</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Valid Until</div>
                                <div className="text-sm font-bold text-slate-900">{benefit.expiry || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</div>
                                <div className="text-sm font-bold text-slate-900">Active</div>
                            </div>
                        </div>
                    </div>

                    {/* Usage History */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Clock size={16} className="text-slate-400" />
                            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-900">Utilization History</h3>
                        </div>

                        <div className="space-y-3">
                            {benefit.history && benefit.history.length > 0 ? (
                                benefit.history.map((log, i) => (
                                    <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-violet-100 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-violet-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">
                                                    {log.trainer || log.class || log.service || log.guest || 'Activity Logged'}
                                                </div>
                                                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{log.date}</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">
                                            {log.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center space-y-2">
                                    <Info size={32} className="mx-auto text-slate-200" />
                                    <p className="text-sm font-bold text-slate-400">No history available yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle size={14} className="text-amber-600" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-700">Protocol Terms</h4>
                        </div>
                        <ul className="space-y-1.5 list-disc list-inside">
                            <li className="text-[11px] font-medium text-amber-900/70 leading-relaxed italic">Benefits are non-transferable and valid during membership tenure.</li>
                            <li className="text-[11px] font-medium text-amber-900/70 leading-relaxed italic">Unused benefits do not carry over to the next billing cycle.</li>
                            <li className="text-[11px] font-medium text-amber-900/70 leading-relaxed italic">Prior booking required for PT sessions and Spa access.</li>
                        </ul>
                    </div>
                </div>

                <div className="p-6 md:p-8 bg-white border-t border-slate-100 mt-auto">
                    <button
                        onClick={onClose}
                        className="w-full h-12 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-100 hover:bg-violet-600 transition-all flex items-center justify-center gap-2"
                    >
                        CLOSE DETAILS
                    </button>
                </div>
            </div>
        </RightDrawer>
    );
};

export default BenefitDetailsDrawer;
