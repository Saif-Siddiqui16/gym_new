import React, { useState } from 'react';
import { AlertCircle, Camera, X, ShieldAlert, Info, MapPin, Terminal, Zap } from 'lucide-react';
import { ISSUE_TYPES, SEVERITIES } from '../data/maintenanceData';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        
  accent2: '#9B7BFF',       
  accentLight: '#F0ECFF',   
  accentMid: '#E4DCFF',     
  border: '#EAE7FF',        
  bg: '#F6F5FF',            
  surface: '#FFFFFF',       
  text: '#1A1533',          
  muted: '#7B7A8E',         
  subtle: '#B0ADCC',        
  green: '#22C97A',         
  greenLight: '#E8FBF2',
  amber: '#F59E0B',         
  amberLight: '#FEF3C7',
  rose: '#F43F5E',          
  roseLight: '#FFF1F4',
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

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

    const InputLabel = ({ children, icon: Icon }) => (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginLeft: 4 }}>
            {Icon && <Icon size={12} strokeWidth={2.5} />}
            {children}
        </label>
    );

    const inputStyle = {
        width: '100%', height: 48, padding: '0 16px', borderRadius: 14, border: `2px solid ${T.border}`,
        background: T.bg + '50', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s'
    };

    const handleFocus = e => { e.target.style.borderColor = T.accent; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; };
    const handleBlur = e => { e.target.style.borderColor = T.border; e.target.style.background = T.bg + '50'; e.target.style.boxShadow = 'none'; };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px 32px' }}>
            
            {/* Status Context Header */}
            <div style={{ padding: '20px 24px', background: T.roseLight, borderRadius: 20, border: `1.5px solid ${T.rose}20`, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.rose, boxShadow: '0 4px 10px rgba(244, 63, 94, 0.1)' }}>
                    <ShieldAlert size={24} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 900, color: T.rose, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue Log: {equipment ? equipment.name : "Unclaimed Unit"}</h4>
                    <p style={{ fontSize: 12, fontWeight: 600, color: T.rose, margin: '4px 0 0', opacity: 0.8 }}>Initializing diagnostic report for maintenance queue.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Equipment Selection (Conditional) */}
                {!equipment && (
                    <div>
                        <InputLabel icon={MapPin}>Asset Identification</InputLabel>
                        <div style={{ position: 'relative' }}>
                            <select
                                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                value={formData.equipmentId}
                                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                                required
                            >
                                <option value="">Identify relevant machine...</option>
                                {/* Mapping logic handled externally */}
                            </select>
                            <Terminal size={14} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.subtle }} />
                        </div>
                    </div>
                )}

                <div>
                    <InputLabel icon={Zap}>Anomaly Classification</InputLabel>
                    <div style={{ position: 'relative' }}>
                        <select
                            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            value={formData.issueType}
                            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                            required
                        >
                            <option value="">Select failure mode...</option>
                            {ISSUE_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <Info size={14} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.subtle }} />
                    </div>
                </div>

                <div>
                    <InputLabel icon={AlertCircle}>Criticality Level</InputLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {SEVERITIES.map(sev => {
                            const isActive = formData.severity === sev.value;
                            const sevColor = sev.color === 'green' ? T.green : sev.color === 'amber' ? T.amber : sev.color === 'red' ? T.rose : T.accent;
                            const sevBg = sev.color === 'green' ? T.greenLight : sev.color === 'amber' ? T.amberLight : sev.color === 'red' ? T.roseLight : T.accentLight;
                            
                            return (
                                <label
                                    key={sev.value}
                                    style={{
                                        position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 16,
                                        border: `2.2px solid ${isActive ? sevColor : T.border}`,
                                        background: isActive ? sevBg : '#fff',
                                        cursor: 'pointer', transition: '0.3s'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="severity"
                                        value={sev.value}
                                        style={{ display: 'none' }}
                                        onChange={() => setFormData({ ...formData, severity: sev.value })}
                                    />
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sevColor, boxShadow: isActive ? `0 0 10px ${sevColor}80` : 'none' }} />
                                    <span style={{ fontSize: 11, fontWeight: 900, color: isActive ? sevColor : T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sev.label}</span>
                                    {isActive && (
                                        <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: sevColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: `2px solid ${sevBg}` }}>
                                            <X size={10} strokeWidth={4} />
                                        </div>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <InputLabel icon={Info}>Observation Details</InputLabel>
                    <textarea
                        style={{ ...inputStyle, height: 'auto', padding: '16px', borderRadius: 20, resize: 'none' }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        rows={4}
                        placeholder="Describe the anomaly detection..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <InputLabel icon={Camera}>Evidence Capture (Optional)</InputLabel>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: 110, border: `2px dashed ${T.border}`, borderRadius: 20, cursor: 'pointer', background: T.bg + '40', transition: '0.3s' }}>
                         <Camera size={28} style={{ color: T.subtle, marginBottom: 8 }} />
                         <span style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Visual Node Data</span>
                         <span style={{ fontSize: 9, fontWeight: 600, color: T.subtle, marginTop: 4 }}>JPEG / PNG • MAX 5MB</span>
                         <input type="file" style={{ display: 'none' }} />
                    </label>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            flex: 1, height: 50, borderRadius: 16, border: `2px solid ${T.border}`,
                            background: '#fff', color: T.text, fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
                            letterSpacing: '0.05em', cursor: 'pointer', transition: '0.2s'
                        }}
                    >
                        Abort
                    </button>
                    <button
                        type="submit"
                        style={{
                            flex: 1.5, height: 50, borderRadius: 16, border: 'none',
                            background: T.rose, color: '#fff', fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
                            letterSpacing: '0.05em', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 20px -5px rgba(244, 63, 94, 0.3)'
                        }}
                    >
                        Transmit Report
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReportIssueModal;
