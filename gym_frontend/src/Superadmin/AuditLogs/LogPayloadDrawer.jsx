import React from 'react';
import { Copy, FileJson, Check, Terminal, ExternalLink, Zap } from 'lucide-react';

const LogPayloadDrawer = ({ isOpen, onClose, selectedLog }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(selectedLog?.payload || {}, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!selectedLog) return null;

    return (
        <div className="flex flex-col h-full bg-white text-slate-600 font-mono selection:bg-violet-500/30">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">{selectedLog.event || 'Log Details'}</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mt-1">Request ID: {selectedLog.id}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Status Code</p>
                        <span className={`text-sm font-bold ${selectedLog.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {selectedLog.statusCode || 200} OK
                        </span>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Response Time</p>
                        <span className="text-sm font-bold text-gray-900">124ms</span>
                    </div>
                </div>
            </div>

            {/* JSON View */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-violet-600">
                        <Terminal size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Raw JSON Payload</span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all border border-slate-200"
                    >
                        {copied ? <><Check size={12} className="text-emerald-500" /> Copied</> : <><Copy size={12} /> Copy JSON</>}
                    </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-sm leading-relaxed overflow-x-auto shadow-inner">
                    <pre className="text-indigo-300 font-mono">
                        {JSON.stringify(selectedLog.payload || {
                            "event": "membership.created",
                            "timestamp": "2024-03-20T10:30:15Z",
                            "data": {
                                "id": "MEM_29381",
                                "name": "Rahul Sharma",
                                "plan": "Elite Monthly",
                                "payment": {
                                    "status": "captured",
                                    "method": "upi",
                                    "amount": 2500
                                }
                            },
                            "metadata": {
                                "source": "ios_app",
                                "version": "4.2.0"
                            }
                        }, null, 4)}
                    </pre>
                </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                <button
                    onClick={onClose}
                    className="flex-1 py-4 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border border-slate-200 shadow-sm"
                >
                    Close Inspector
                </button>
                <button
                    className="flex-1 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <ExternalLink size={14} /> Open in Logs
                </button>
            </div>
        </div>
    );
};

export default LogPayloadDrawer;
