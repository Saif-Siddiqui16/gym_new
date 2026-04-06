import React, { useState } from 'react';
import { Package, Calendar, MapPin, Tag, Hash, AlertCircle, Box, Wrench, ShieldCheck, Info } from 'lucide-react';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES } from '../data/equipmentData';

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

const AddEquipmentModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Cardio',
        brand: '',
        model: '',
        serialNumber: '',
        location: '',
        purchaseDate: '',
        warrantyExpiry: '',
        status: 'Operational',
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                
                <div style={{ gridColumn: 'span 2' }}>
                    <InputLabel icon={Box}>Equipment Designation *</InputLabel>
                    <input
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="e.g. Matrix Treadmill T7xe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <InputLabel icon={Package}>Asset Category</InputLabel>
                    <div style={{ position: 'relative' }}>
                        <select
                            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {EQUIPMENT_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.subtle }}>
                           <Tag size={14} />
                        </div>
                    </div>
                </div>

                <div>
                    <InputLabel icon={Hash}>Serial Number</InputLabel>
                    <input
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="SN-XXXXXX"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                </div>

                <div>
                    <InputLabel icon={Wrench}>Manufacturer</InputLabel>
                    <input
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="e.g. Matrix"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                </div>

                <div>
                    <InputLabel icon={Tag}>Model ID</InputLabel>
                    <input
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="e.g. T7xe"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                    <InputLabel icon={MapPin}>Allocation Zone</InputLabel>
                    <input
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="e.g. Cardio Zone - Floor 1"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                </div>

                <div>
                    <InputLabel icon={Calendar}>Acquisition Date</InputLabel>
                    <input
                        type="date"
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                </div>

                <div>
                    <InputLabel icon={ShieldCheck}>Warranty Expiry</InputLabel>
                    <input
                        type="date"
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        value={formData.warrantyExpiry}
                        onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                    />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                    <InputLabel icon={Info}>Engineering Status</InputLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {EQUIPMENT_STATUSES.map(status => {
                            const isActive = formData.status === status.value;
                            const statusColor = status.color === 'green' ? T.green : status.color === 'amber' ? T.amber : status.color === 'red' ? T.rose : T.accent;
                            const statusBg = status.color === 'green' ? T.greenLight : status.color === 'amber' ? T.amberLight : status.color === 'red' ? T.roseLight : T.accentLight;
                            
                            return (
                                <label
                                    key={status.value}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14,
                                        border: `1.5px solid ${isActive ? statusColor : T.border}`,
                                        background: isActive ? statusBg : '#fff',
                                        cursor: 'pointer', transition: '0.3s'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={status.value}
                                        style={{ display: 'none' }}
                                        onChange={() => setFormData({ ...formData, status: status.value })}
                                    />
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, boxShadow: isActive ? `0 0 10px ${statusColor}80` : 'none' }} />
                                    <span style={{ fontSize: 11, fontWeight: 900, color: isActive ? statusColor : T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{status.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
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
                    onMouseEnter={e => e.currentTarget.style.background = T.bg}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                    Discard
                </button>
                <button
                    type="submit"
                    style={{
                        flex: 1.5, height: 50, borderRadius: 16, border: 'none',
                        background: T.accent, color: '#fff', fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.05em', cursor: 'pointer', transition: '0.3s', boxShadow: T.shadow
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                    Deploy Asset
                </button>
            </div>
        </form>
    );
};

export default AddEquipmentModal;
