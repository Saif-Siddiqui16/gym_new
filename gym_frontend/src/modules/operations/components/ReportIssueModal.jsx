import React, { useState } from 'react';
import { AlertCircle, Camera, X } from 'lucide-react';
import { ISSUE_TYPES, SEVERITIES } from '../data/maintenanceData';

const ReportIssueModal = ({ equipment, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        equipmentId: equipment?.id || '',
        issueType: '',
        severity: 'Medium',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="flex flex-col gap-6 p-6 pt-4">
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-1" size={20} />
                <div>
                    <h4 className="text-sm font-bold text-red-900">Reporting Issue for</h4>
                    <p className="text-xs text-red-700 font-medium">{equipment ? equipment.name : "Select Equipment"}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Equipment Dropdown (if not pre-filled) */}
                {!equipment && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Select Equipment</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-bold text-slate-700"
                            value={formData.equipmentId}
                            onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                            required
                        >
                            <option value="">Choose a machine...</option>
                            {/* In a real app, mapping over equipment inventory */}
                        </select>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Issue Type</label>
                    <select
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-bold text-slate-700"
                        value={formData.issueType}
                        onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                        required
                    >
                        <option value="">Select issue type...</option>
                        {ISSUE_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Severity Level</label>
                    <div className="grid grid-cols-2 gap-3">
                        {SEVERITIES.map(sev => (
                            <label
                                key={sev.value}
                                className={`
                                    relative flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all gap-2
                                    ${formData.severity === sev.value
                                        ? `border-${sev.color}-500 bg-${sev.color}-50 text-${sev.color}-700`
                                        : 'border-slate-100 hover:border-slate-200 text-slate-500'}
                                `}
                            >
                                <input
                                    type="radio"
                                    name="severity"
                                    value={sev.value}
                                    className="hidden"
                                    onChange={() => setFormData({ ...formData, severity: sev.value })}
                                />
                                <span className={`w-2 h-2 rounded-full bg-${sev.color}-500`} />
                                <span className="text-xs font-black uppercase tracking-tight">{sev.label}</span>
                                {formData.severity === sev.value && (
                                    <div className="absolute -top-1 -right-1">
                                        <div className={`w-4 h-4 rounded-full bg-${sev.color}-500 flex items-center justify-center text-white`}>
                                            <X size={10} strokeWidth={4} />
                                        </div>
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-bold text-slate-700 min-h-[100px] resize-none"
                        placeholder="Explain what's wrong with the machine..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Photo (Optional)</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Camera className="w-8 h-8 mb-3 text-slate-400" />
                                <p className="mb-2 text-xs text-slate-500 font-bold uppercase tracking-wider">Click to upload photo</p>
                                <p className="text-[10px] text-slate-400 font-medium">JPEG, PNG up to 5MB</p>
                            </div>
                            <input type="file" className="hidden" />
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 rounded-xl border-2 border-slate-100 text-slate-600 font-black uppercase tracking-wider text-xs hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition-all"
                    >
                        Submit Report
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReportIssueModal;
