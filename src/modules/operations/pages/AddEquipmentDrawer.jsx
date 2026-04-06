import React, { useState } from 'react';
import { X, Save, Calendar, Info, Trash2, Edit3, Settings, Box, Wrench, MapPin, Tag } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';

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
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

const AddEquipmentDrawer = ({ isOpen, onClose, onAdd }) => {
    const [newItem, setNewItem] = useState({
        name: '',
        brand: '',
        model: '',
        category: '',
        location: '',
        serialNumber: '',
        purchaseDate: '',
        purchasePrice: '',
        warrantyExpiry: '',
        status: 'Operational'
    });

    const categories = [
        'Cardio',
        'Strength',
        'Free Weights',
        'Functional',
        'Recovery',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newItem.name) return;
        onAdd(newItem);
        setNewItem({
            name: '',
            brand: '',
            model: '',
            category: '',
            location: '',
            serialNumber: '',
            purchaseDate: '',
            purchasePrice: '',
            warrantyExpiry: '',
            status: 'Operational'
        });
        onClose();
    };

    const InputLabel = ({ children, required }) => (
        <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginLeft: 4 }}>
            {children} {required && <span style={{ color: T.accent }}>*</span>}
        </label>
    );

    const TextInput = ({ icon: Icon, ...props }) => (
        <div style={{ position: 'relative' }}>
            {Icon && <Icon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />}
            <input
                {...props}
                style={{
                    width: '100%', height: 54, padding: Icon ? '0 16px 0 48px' : '0 16px', borderRadius: 16, border: `2px solid ${T.border}`,
                    background: '#fff', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s',
                    ...props.style
                }}
                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
            />
        </div>
    );

    const SelectInput = ({ icon: Icon, options, ...props }) => (
        <div style={{ position: 'relative' }}>
            {Icon && <Icon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />}
            <select
                {...props}
                style={{
                    width: '100%', height: 54, padding: Icon ? '0 40px 0 48px' : '0 40px 0 16px', borderRadius: 16, border: `2px solid ${T.border}`,
                    background: '#fff', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s',
                    appearance: 'none', cursor: 'pointer', ...props.style
                }}
                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 4px ${T.accentLight}`; }}
                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <Settings size={14} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
        </div>
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Register Asset"
            subtitle="Catalog a new machine into the inventory node"
        >
            <form id="add-equipment-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
                <div style={{ background: T.bg, padding: 24, borderRadius: 28, border: `1.5px solid ${T.border}`, marginBottom: 8 }}>
                    <InputLabel required>Asset Designation</InputLabel>
                    <TextInput 
                        icon={Box}
                        placeholder="e.g. Life-X Series 500 Treadmill"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <InputLabel>Manufacturer</InputLabel>
                        <TextInput 
                            placeholder="e.g. Life Fitness"
                            value={newItem.brand}
                            onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                        />
                    </div>
                    <div>
                        <InputLabel>Model ID</InputLabel>
                        <TextInput 
                            placeholder="e.g. T5-GO"
                            value={newItem.model}
                            onChange={e => setNewItem({ ...newItem, model: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <InputLabel>Engineering Class</InputLabel>
                        <SelectInput 
                            icon={Tag}
                            value={newItem.category}
                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                            options={[
                                { label: 'Select Class', value: '' },
                                ...categories.map(c => ({ label: c, value: c }))
                            ]}
                        />
                    </div>
                    <div>
                        <InputLabel>Placement Zone</InputLabel>
                        <TextInput 
                            icon={MapPin}
                            placeholder="e.g. Cardio Zone"
                            value={newItem.location}
                            onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <InputLabel>Engineering Serial (UID)</InputLabel>
                    <TextInput 
                        placeholder="Unique identifier found on chassis"
                        value={newItem.serialNumber}
                        onChange={e => setNewItem({ ...newItem, serialNumber: e.target.value })}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <InputLabel>Acquisition Date</InputLabel>
                        <TextInput 
                            type="date"
                            value={newItem.purchaseDate}
                            onChange={e => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <InputLabel>Acquisition Value (₹)</InputLabel>
                        <TextInput 
                            type="number"
                            placeholder="0"
                            value={newItem.purchasePrice}
                            onChange={e => setNewItem({ ...newItem, purchasePrice: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <InputLabel>Warranty Expiry Node</InputLabel>
                    <TextInput 
                        type="date"
                        value={newItem.warrantyExpiry}
                        onChange={e => setNewItem({ ...newItem, warrantyExpiry: e.target.value })}
                    />
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ flex: 1, height: 54, borderRadius: 16, border: `2px solid ${T.border}`, background: '#fff', color: T.text, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: '0.3s' }}
                    >
                        Abort
                    </button>
                    <button
                        type="submit"
                        disabled={!newItem.name}
                        style={{ flex: 2, height: 54, borderRadius: 16, border: 'none', background: T.accent, color: '#fff', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: '0.3s', boxShadow: T.shadow, opacity: !newItem.name ? 0.5 : 1 }}
                    >
                        Commit Asset
                    </button>
                </div>
            </form>
        </RightDrawer>
    );
};

export default AddEquipmentDrawer;
