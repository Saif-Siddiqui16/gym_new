import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ROLES } from '../../config/roles';
import { Save, FileText, Loader2, Receipt, Hash, Percent, Eye, ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import { fetchAllGyms, fetchInvoiceSettings, updateInvoiceSettings } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';
import BranchScopeSelector from '../../components/common/BranchScopeSelector';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness)
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF',
  text: '#1A1533', muted: '#7B7A8E', subtle: '#B0ADCC',
  green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4',
  amber: '#F59E0B', amberLight: '#FEF3C7',
};

const InvoiceSettings = () => {
    const navigate = useNavigate();
    const context = useOutletContext();
    const role = context?.role;
    const isReadOnly = role === ROLES.MANAGER;
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({ prefix: 'INV-', startNumber: '1001', gstPercent: '18' });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const init = async () => { await Promise.all([loadSettings(), loadBranches()]); };
        init();
    }, []);

    const loadBranches = async () => {
        try {
            const data = await fetchAllGyms();
            const gymList = data.gyms || [];
            setBranches(gymList.map(gym => ({ id: gym.id, name: gym.gymName + (gym.branchName ? ` - ${gym.branchName}` : '') })));
        } catch (error) { console.error(error); }
    };

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await fetchInvoiceSettings();
            setFormData(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateInvoiceSettings(formData);
            toast.success('Monetary Logic Operational');
        } catch (error) { toast.error('Vault Sync Failed'); }
        finally { setIsSaving(false); }
    };

    const inputStyle = (focused) => ({
        width: '100%', height: '48px', padding: '0 16px 0 44px', background: T.bg, border: `1.5px solid ${focused ? T.accent : T.border}`,
        borderRadius: '14px', fontSize: '14px', fontWeight: 700, color: T.text, outline: 'none', transition: 'all 0.2s',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    });

    if (loading) {
        return (
            <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            </div>
        );
    }

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
            `}</style>

            <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/superadmin/general-settings/general')}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 10, color: T.muted, fontSize: 13, fontWeight: 800, cursor: 'pointer', marginBottom: 24, padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = T.accent}
                    onMouseLeave={e => e.currentTarget.style.color = T.muted}
                >
                    <ArrowLeft size={18} /> BACK TO SETTINGS CLUSTER
                </button>

                {/* Header Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #1A1533 0%, #2D274D 55%, #3F396D 100%)',
                    borderRadius: 24, padding: '24px 32px', boxShadow: '0 8px 32px rgba(13,10,31,0.28)',
                    display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32
                }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Receipt size={28} color={T.green} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Invoice Settings</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontWeight: 600 }}>Configure invoice numbering and tax details</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
                    
                    {/* Settings Hub */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <BranchScopeSelector value={selectedBranch} onChange={setSelectedBranch} branches={branches} />
                        
                        <div style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, padding: '32px', boxShadow: '0 4px 20px rgba(124,92,252,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingBottom: 16, borderBottom: `1.5px solid ${T.bg}` }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Invoice Configuration</h3>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, margin: '2px 0 0' }}>{isReadOnly ? 'View invoice settings' : 'Set up invoice numbering and tax'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Invoice Prefix</label>
                                    <div style={{ position: 'relative' }}>
                                        <Hash size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input name="prefix" value={formData.prefix} onChange={handleChange} disabled={isReadOnly} style={inputStyle()} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Starting Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Hash size={18} color={T.subtle} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input type="number" name="startNumber" value={formData.startNumber} onChange={handleChange} disabled={isReadOnly} style={inputStyle()} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Tax Settings (GST %)</label>
                                    <CustomDropdown
                                        options={[ { value: '0', label: '0% (Exempt)' }, { value: '5', label: '5%' }, { value: '12', label: '12%' }, { value: '18', label: '18% (Standard)' }, { value: '28', label: '28%' } ]}
                                        value={formData.gstPercent}
                                        onChange={(val) => handleChange({ target: { name: 'gstPercent', value: val } })}
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>

                            {!isReadOnly && (
                                <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1.5px solid ${T.bg}` }}>
                                    <button
                                        onClick={handleSave} disabled={isSaving}
                                        style={{
                                            width: '100%', padding: '14px', borderRadius: '14px', background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                                            color: '#fff', border: 'none', fontSize: '14px', fontWeight: 900, cursor: 'pointer', transition: '0.2s',
                                            boxShadow: `0 8px 24px rgba(124,92,252,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <Save size={20} strokeWidth={2.5} /> {isSaving ? 'Saving…' : 'SAVE SETTINGS'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, padding: '32px', boxShadow: '0 4px 20px rgba(124,92,252,0.04)', position: 'sticky', top: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Eye size={18} color={T.green} />
                                    <span style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Preview</span>
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 900, background: T.greenLight, color: T.green, padding: '4px 8px', borderRadius: 8, border: `1px solid ${T.green}20` }}>SYNCED</span>
                            </div>

                            <div style={{ background: T.bg, padding: 16, borderRadius: 20, border: `1.5px solid ${T.border}` }}>
                                <div style={{ background: T.surface, borderRadius: 16, padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: isReadOnly ? T.subtle : T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 900 }}>G</div>
                                        <div style={{ textAlign: 'right' }}>
                                            <h4 style={{ fontSize: 13, fontWeight: 900, color: T.subtle, margin: 0, letterSpacing: '0.1em' }}>INVOICE</h4>
                                            <p style={{ fontSize: 14, fontWeight: 900, color: T.accent, margin: '4px 0 0' }}>#{formData.prefix}{formData.startNumber}</p>
                                        </div>
                                    </div>
                                    <div style={{ height: '1.5px', background: T.bg, margin: '20px 0' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: T.muted }}>
                                            <span>Issued To</span>
                                            <span style={{ color: T.text }}>Strategic Member</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: T.muted }}>
                                            <span>Billing Point</span>
                                            <span style={{ color: T.text }}>Hub Alpha - Sector 1</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: T.muted }}>
                                            <span>Tax Index</span>
                                            <span style={{ color: T.green }}>{formData.gstPercent}% Applied</span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 24, padding: 12, background: T.bg, borderRadius: 12, textAlign: 'center' }}>
                                        <p style={{ fontSize: 9, fontWeight: 800, color: T.subtle, margin: 0, textTransform: 'uppercase' }}>Protocol integrity verified at source</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default InvoiceSettings;
