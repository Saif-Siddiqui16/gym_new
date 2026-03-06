import React, { useState } from 'react';
import {
    X,
    Plus,
    Scale,
    Percent,
    Activity,
    Save,
    Target,
} from 'lucide-react';

const MetricInput = ({ label, value, onChange, unit, icon: Icon }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors duration-300">
                <Icon size={18} />
            </div>
            <input
                type="number"
                step="0.1"
                className="w-full h-14 pl-12 pr-12 bg-white border-2 border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all shadow-sm group-hover:border-violet-200"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                {unit}
            </div>
        </div>
    </div>
);

import RightDrawer from '../../../components/common/RightDrawer';

const MeasurementDrawer = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        weight: '',
        bodyFat: '',
        chest: '',
        waist: '',
        arms: '',
        legs: ''
    });

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Log Transformation"
            subtitle={`Entry Date: ${new Date().toLocaleDateString()}`}
            maxWidth="max-w-2xl"
            footer={
                <div className="flex items-center justify-end gap-6 w-full">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        className="group relative px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-violet-200 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-3 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            INTEGRATE DATA <Save size={18} />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                </div>
            }
        >
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-10">
                    {/* Primary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MetricInput label="Current Weight" value={formData.weight} onChange={val => setFormData({ ...formData, weight: val })} unit="kg" icon={Scale} />
                        <MetricInput label="Body Fat %" value={formData.bodyFat} onChange={val => setFormData({ ...formData, bodyFat: val })} unit="%" icon={Percent} />
                    </div>

                    {/* Circumference Metrics */}
                    <div className="space-y-6 pt-2 border-t border-slate-100/50">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
                            Circumference Audit
                            <div className="flex-1 h-px bg-slate-200" />
                        </h3>
                        <div className="grid grid-cols-2 gap-8">
                            <MetricInput label="Chest" value={formData.chest} onChange={val => setFormData({ ...formData, chest: val })} unit="cm" icon={Activity} />
                            <MetricInput label="Waist" value={formData.waist} onChange={val => setFormData({ ...formData, waist: val })} unit="cm" icon={Activity} />
                            <MetricInput label="Upper Arms" value={formData.arms} onChange={val => setFormData({ ...formData, arms: val })} unit="cm" icon={Activity} />
                            <MetricInput label="Thighs" value={formData.legs} onChange={val => setFormData({ ...formData, legs: val })} unit="cm" icon={Activity} />
                        </div>
                    </div>

                    <div className="bg-violet-50 p-6 rounded-[32px] border border-violet-100 flex items-start gap-4 shadow-sm">
                        <div className="p-2 bg-white rounded-full text-violet-600 shadow-sm shrink-0">
                            <Target size={18} />
                        </div>
                        <p className="text-sm font-medium text-violet-900 leading-relaxed">
                            Accurate metrics fuel anatomical precision. Ensure you are using consistent measuring protocols (same time, same location) for data integrity.
                        </p>
                    </div>
                </div>
            </div>
        </RightDrawer>
    );
};

export default MeasurementDrawer;
