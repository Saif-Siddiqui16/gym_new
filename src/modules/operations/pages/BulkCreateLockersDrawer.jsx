import React, { useState } from 'react';
import { Box, Plus, X, Monitor, ChevronRight, Layers, CreditCard, Sparkles, Hash, ArrowRight, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';

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

const BulkCreateLockersDrawer = ({ onClose, onSuccess }) => {
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        prefix: 'L',
        startNumber: '1',
        endNumber: '10',
        size: 'Medium',
        isChargeable: false,
        price: '0',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { bulkCreateLockers } = await import('../../../api/staff/lockerApi');
            const result = await bulkCreateLockers({
                ...formData,
                tenantId: selectedBranch
            });
            if (result.success) {
                toast.success(result.message || `${previewCount} lockers created successfully`);
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to create lockers');
        } finally {
            setLoading(false);
        }
    };

    const previewCount = Math.max(0, parseInt(formData.endNumber) - parseInt(formData.startNumber) + 1);

    const generatePreview = () => {
        const preview = [];
        const count = Math.min(previewCount, 10);
        const start = parseInt(formData.startNumber) || 1;

        for (let i = 0; i < count; i++) {
            const num = (start + i).toString().padStart(3, '0');
            preview.push(`${formData.prefix}-${num}`);
        }
        return preview;
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
                {/* Prefix & Range */}
                <div style={{ background: T.bg, padding: 24, borderRadius: 28, border: `1.5px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <InputLabel>Naming Foundation (Prefix)</InputLabel>
                        <div style={{ position: 'relative' }}>
                            <Hash size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                            <input
                                type="text"
                                value={formData.prefix}
                                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                style={{ width: '100%', height: 50, padding: '0 16px 0 48px', borderRadius: 14, border: `1.5px solid #fff`, background: '#fff', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.2s', boxShadow: T.cardShadow }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
                        <div>
                            <InputLabel>Initial Index</InputLabel>
                            <input
                                type="number"
                                value={formData.startNumber}
                                onChange={(e) => setFormData({ ...formData, startNumber: e.target.value })}
                                style={{ width: '100%', height: 50, padding: '0 16px', borderRadius: 14, border: `1.5px solid #fff`, background: '#fff', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', boxShadow: T.cardShadow }}
                                min="1"
                            />
                        </div>
                        <div style={{ marginTop: 20, color: T.subtle }}><ArrowRight size={20} /></div>
                        <div>
                            <InputLabel>Terminal Index</InputLabel>
                            <input
                                type="number"
                                value={formData.endNumber}
                                onChange={(e) => setFormData({ ...formData, endNumber: e.target.value })}
                                style={{ width: '100%', height: 50, padding: '0 16px', borderRadius: 14, border: `1.5px solid #fff`, background: '#fff', fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', boxShadow: T.cardShadow }}
                                min="1"
                            />
                        </div>
                    </div>
                </div>

                {/* Configuration */}
                <div>
                    <InputLabel>Dimensional Standard</InputLabel>
                    <select
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        style={{ width: '100%', height: 50, padding: '0 20px', borderRadius: 14, border: `1.5px solid ${T.border}`, background: '#fff', fontSize: 13, fontWeight: 800, color: T.text, outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </select>
                </div>

                {/* Chargeable Toggle */}
                <div style={{ padding: 20, borderRadius: 24, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: formData.isChargeable ? T.accentLight : 'white', transition: '0.3s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: formData.isChargeable ? T.accent : T.bg, color: formData.isChargeable ? '#fff' : T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                            <Coins size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Collective Monetization</div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, marginTop: 2 }}>Apply rental rates to all units</div>
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
                        <InputLabel>Standard Rate (₹)</InputLabel>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            style={{ width: '100%', height: 50, padding: '0 20px', borderRadius: 14, border: `1.5px solid ${T.accent}`, background: '#fff', fontSize: 14, fontWeight: 800, color: T.text, outline: 'none' }}
                        />
                    </div>
                )}

                {/* Preview Matrix */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <InputLabel>Registry Preview ({isNaN(previewCount) ? 0 : previewCount} units)</InputLabel>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.greenLight, padding: '4px 10px', borderRadius: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
                            <span style={{ fontSize: 9, fontWeight: 900, color: T.green, textTransform: 'uppercase' }}>Live Link</span>
                        </div>
                    </div>
                    <div style={{ background: T.bg + '80', borderRadius: 24, padding: 20, border: `1.5px solid ${T.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10, minHeight: 120 }}>
                        {isNaN(previewCount) || previewCount <= 0 ? (
                            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Awaiting valid range...</p>
                            </div>
                        ) : (
                            <>
                                {generatePreview().map((id, i) => (
                                    <div key={i} style={{ padding: '8px 12px', background: '#fff', borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 11, fontWeight: 800, color: T.text, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        {id}
                                    </div>
                                ))}
                                {previewCount > 10 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '8px 0', opacity: 0.5 }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, fontStyle: 'italic' }}>+ {previewCount - 10} additional units in sequence</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ marginTop: 12 }}>
                    <button
                        type="submit"
                        disabled={loading || isNaN(previewCount) || previewCount <= 0}
                        style={{ width: '100%', height: 54, borderRadius: 16, border: 'none', background: T.accent, color: '#fff', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: '0.3s', boxShadow: T.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                    >
                        {loading ? 'Initializing...' : <><Layers size={18} /> Deploy Collective</>}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ width: '100%', height: 50, marginTop: 12, borderRadius: 16, border: 'none', background: 'transparent', color: T.muted, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
                    >
                        Decommission Action
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BulkCreateLockersDrawer;
