import React, { useState } from 'react';
import { lockerApi } from '../../../api/lockerApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';
import { Box, MapPin, Hash, Sparkles, ChevronDown, Check, Coins } from 'lucide-react';

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
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

const AddLockerDrawer = ({ onClose, onSuccess }) => {
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        number: '',
        size: 'Medium',
        area: '',
        notes: '',
        isChargeable: false,
        price: '0',
        status: 'Available'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.number) return toast.error('Locker number is required');

        try {
            setLoading(true);
            const response = await lockerApi.addLocker({
                ...formData,
                tenantId: selectedBranch
            });
            toast.success(response.message || 'Locker created successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create locker');
        } finally {
            setLoading(false);
        }
    };

    const InputLabel = ({ children }) => (
        <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginLeft: 4 }}>
            {children}
        </label>
    );

    return (
        <div style={{ padding: '0 8px', animation: 'fadeIn 0.4s ease-out' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Locker Number */}
                <div style={{ background: T.bg, padding: 20, borderRadius: 24, border: `1.5px solid ${T.border}` }}>
                    <InputLabel>Node Designation (Number)</InputLabel>
                    <div style={{ position: 'relative' }}>
                        <Hash size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                        <input
                            type="text"
                            placeholder="e.g. A-102"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            style={{ width: '100%', height: 50, padding: '0 16px 0 48px', borderRadius: 14, border: `1.5px solid #fff`, background: '#fff', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.2s', boxShadow: T.cardShadow }}
                        />
                    </div>
                </div>

                {/* Size & Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <InputLabel>Dimensional Class</InputLabel>
                        <div style={{ position: 'relative' }}>
                            <Box size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                            <select
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                style={{ width: '100%', height: 50, padding: '0 40px 0 44px', borderRadius: 14, border: `1.5px solid ${T.border}`, background: '#fff', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', cursor: 'pointer', appearance: 'none' }}
                            >
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                        </div>
                    </div>
                    <div>
                        <InputLabel>Sector / Zone</InputLabel>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                            <input
                                type="text"
                                placeholder="e.g. Zone A"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                style={{ width: '100%', height: 50, padding: '0 16px 0 44px', borderRadius: 14, border: `1.5px solid ${T.border}`, background: '#fff', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Chargeable Toggle */}
                <div style={{ padding: 20, borderRadius: 24, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: formData.isChargeable ? T.accentLight : 'white', transition: '0.3s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: formData.isChargeable ? T.accent : T.bg, color: formData.isChargeable ? '#fff' : T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                            <Coins size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Monetized Node</div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, marginTop: 2 }}>Apply periodic rental fees</div>
                        </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative', width: 50, height: 26, background: formData.isChargeable ? T.accent : T.subtle, borderRadius: 13, transition: '0.3s' }}>
                        <input
                            type="checkbox"
                            checked={formData.isChargeable}
                            onChange={(e) => setFormData({ ...formData, isChargeable: e.target.checked })}
                            style={{ display: 'none' }}
                        />
                        <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', transition: '0.3s', position: 'absolute', left: formData.isChargeable ? 26 : 4, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
                    </label>
                </div>

                {formData.isChargeable && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <InputLabel>Monthly Revenue Rate (₹)</InputLabel>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            style={{ width: '100%', height: 50, padding: '0 20px', borderRadius: 14, border: `1.5px solid ${T.accent}`, background: '#fff', fontSize: 14, fontWeight: 800, color: T.text, outline: 'none' }}
                        />
                    </div>
                )}

                {/* Notes */}
                <div>
                    <InputLabel>Internal Directives (Notes)</InputLabel>
                    <textarea
                        placeholder="Log any technical specifics..."
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        style={{ width: '100%', padding: 16, borderRadius: 14, border: `1.5px solid ${T.border}`, background: '#fff', fontSize: 13, fontWeight: 600, color: T.text, outline: 'none', resize: 'none' }}
                    />
                </div>

                {/* Footer Actions */}
                <div style={{ marginTop: 24 }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', height: 54, borderRadius: 16, border: 'none', background: T.accent, color: '#fff', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: '0.3s', boxShadow: T.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                    >
                        {loading ? 'Initializing...' : <><Sparkles size={18} /> Catalog Node</>}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ width: '100%', height: 50, marginTop: 12, borderRadius: 16, border: 'none', background: 'transparent', color: T.muted, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
                    >
                        Abort Protocol
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddLockerDrawer;
