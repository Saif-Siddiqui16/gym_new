import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Shield, Save, Loader, ShieldCheck, Lock, Terminal, Radio } from 'lucide-react';
import { ROLES } from '../../../config/roles';
import { useBranchContext } from '../../../context/BranchContext';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4',
  shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s ease' },
    toggleWrap: { width: 44, height: 24, borderRadius: 12, border: 'none', position: 'relative', cursor: 'pointer', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
    toggleDot: { width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
};

const SecuritySettings = () => {
    const context = useOutletContext();
    const role = context?.role;
    const isReadOnly = role === ROLES.MANAGER;
    const { selectedBranch } = useBranchContext();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [securityConfig, setSecurityConfig] = useState({
        twoFactorAuth: false,
        sessionTimeout: true,
        sessionDuration: '8',
        loginAlerts: true
    });

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};

            const res = await apiClient.get('/admin/settings/security', { headers });
            if (res.data) {
                setSecurityConfig({
                    twoFactorAuth: res.data.twoFactorAuth ?? false,
                    sessionTimeout: res.data.sessionTimeout ?? true,
                    sessionDuration: res.data.sessionDuration || '8',
                    loginAlerts: res.data.loginAlerts ?? true
                });
            }
        } catch (error) {
            setSecurityConfig({ twoFactorAuth: false, sessionTimeout: true, sessionDuration: '8', loginAlerts: true });
        } finally {
            setLoading(false);
        }
    }, [selectedBranch]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const toggleSetting = (key) => {
        if (isReadOnly) return;
        setSecurityConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (key, value) => {
        if (isReadOnly) return;
        setSecurityConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (isReadOnly) return;
        try {
            setSaving(true);
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};
            await apiClient.patch('/admin/settings/security', securityConfig, { headers });
            toast.success('Security settings synchronized!');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to sync policy');
        } finally {
            setSaving(false);
        }
    };

    const CustomToggle = ({ active, onToggle }) => (
        <div 
            onClick={onToggle}
            style={{ 
                ...S.toggleWrap, 
                background: active ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : '#E2E8F0' 
            }}
        >
            <div style={{ ...S.toggleDot, left: active ? 23 : 3 }} />
        </div>
    );

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
            <Loader className="animate-spin" style={{ color: T.accent }} size={32} />
        </div>
    );

    return (
        <div style={{ fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.15s }
            `}</style>

            {/* Premium Header Banner (Compact Version) */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: T.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 10px 25px -8px ${T.accent}80`
                    }}>
                        <ShieldCheck size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>Security Shield</h1>
                        <p style={{ margin: '4px 0 0', color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Configure authorization and access protocols</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving || isReadOnly}
                    style={{ 
                        height: 52, padding: '0 32px', borderRadius: 16, 
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accent3})`, 
                        color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, 
                        textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, 
                        boxShadow: `0 10px 25px -8px ${T.accent}80`, transition: '0.3s', opacity: saving ? 0.6 : 1
                    }}
                >
                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} strokeWidth={2.5} />} {saving ? 'Verifying...' : 'Save Security Policy'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 28 }} className="fu1">
                {/* Main Access Policy Card */}
                <div style={{ ...S.card, padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={20} /></div>
                        <div>
                             <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>Core Access Protocols</h2>
                             <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Managed global security rules</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {[
                            { key: 'sessionTimeout', title: 'Inactivity Protection', desc: 'Automatically terminate sessions after idle detect', type: 'toggle' },
                            { key: 'sessionDuration', title: 'Absolute Session Life', desc: 'Maximum time in hours before forced re-auth', type: 'input' },
                            { key: 'loginAlerts', title: 'Manifestation Signals', desc: 'Send push alerts on new device authorization', type: 'toggle' },
                        ].map((item) => (
                            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, paddingBottom: 24, borderBottom: `1px solid ${T.bg}` }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 900, color: T.text }}>{item.title}</h4>
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.muted }}>{item.desc}</p>
                                </div>
                                {item.type === 'toggle' ? (
                                    <CustomToggle active={securityConfig[item.key]} onToggle={() => toggleSetting(item.key)} />
                                ) : (
                                    <div style={{ position: 'relative', width: 120 }}>
                                         <input 
                                            type="number" 
                                            value={securityConfig[item.key]} 
                                            onChange={(e) => handleInputChange(item.key, e.target.value)}
                                            style={{ width: '100%', height: 44, borderRadius: 12, border: `2px solid ${T.bg}`, background: T.bg, textAlign: 'center', fontSize: 14, fontWeight: 900, color: T.text }}
                                         />
                                         <span style={{ position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 900, color: T.subtle }}>HRS</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technical Meta Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <div style={{ ...S.card, padding: 32, background: '#1A1533', color: '#fff', border: 'none' }}>
                         <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Terminal size={22} color="#fff" /></div>
                         <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 900 }}>Technical Hardening</h3>
                         <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>All authorization attempts are logged and synchronized with the ROAR Global Security Cluster.</p>
                    </div>

                    <div style={{ ...S.card, padding: 32, border: `2px dashed ${T.border}`, background: 'transparent', boxShadow: 'none' }}>
                         <div style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Radio size={22} /></div>
                         <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 900, color: T.text }}>Live Signals</h3>
                         <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.subtle, lineHeight: 1.5 }}>Active monitoring for unusual manifestation in auth patterns.</p>
                    </div>
                </div>
            </div>
            
            <div style={{ height: 60 }} />
        </div>
    );
};

export default SecuritySettings;
