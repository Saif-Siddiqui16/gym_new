import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Server, Wifi, Shield, Key, Eye, EyeOff, 
    CheckCircle, XCircle, Plus, Trash2, RefreshCw, Settings,
    Activity, AlertTriangle, Copy, ChevronDown, Check, Info
} from 'lucide-react';
import { 
    fetchMipsConnections, 
    saveMipsConnection, 
    removeMipsConnection 
} from '../../api/gymDeviceApi';
import { fetchAllGyms } from '../../api/superadmin/superAdminApi';
import toast from 'react-hot-toast';

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
  blue: '#3B82F6',          
  blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const SectionHead = ({ title, sub }) => (
    <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.3px', textTransform: 'uppercase' }}>{title}</h3>
        {sub && <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, margin: '2px 0 0' }}>{sub}</p>}
    </div>
);

const Field = ({ label, icon: Icon, children, error, required }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 2 }}>
            {label} {required && <span style={{ color: T.rose }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
            {Icon && (
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none', zIndex: 2 }}>
                    <Icon size={16} strokeWidth={2.2} />
                </div>
            )}
            {children}
        </div>
        {error && <p style={{ fontSize: 10, color: T.rose, fontWeight: 600, margin: '2px 0 0 2px' }}>{error}</p>}
    </div>
);

const FocusInput = (props) => {
    const [focused, setFocused] = useState(false);
    return (
        <input 
            {...props}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            style={{
                width: '100%', height: 44, padding: `0 14px 0 ${props.hasIcon ? '42px' : '14px'}`, background: T.surface,
                border: `1px solid ${focused ? T.accent : T.border}`, borderRadius: 12,
                fontSize: 13, fontWeight: 600, color: T.text, outline: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: focused ? `0 0 0 4px ${T.accentLight}` : 'none',
                fontFamily: props.mono ? "'JetBrains Mono', 'Fira Code', monospace" : "'Plus Jakarta Sans', sans-serif"
            }}
        />
    );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const HardwareSettings = () => {
    const navigate = useNavigate();
    const [connections, setConnections] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showApiSecret, setShowApiSecret] = useState(false);
    const [editingBranchId, setEditingBranchId] = useState(null);

    const emptyForm = {
        branchId: '',
        serverUrl: '',
        username: '',
        password: '',
        tenantId: '1',
        sdkApiKey: '',
        sdkApiSecret: '',
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        Promise.all([loadConnections(), loadGyms()]);
    }, []);

    const loadConnections = async () => {
        setLoading(true);
        try {
            const data = await fetchMipsConnections();
            setConnections(Array.isArray(data) ? data : data.connections || []);
        } catch {
            toast.error('Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const loadGyms = async () => {
        try {
            const data = await fetchAllGyms();
            setGyms(data.gyms || data || []);
        } catch { }
    };

    const getBranchName = (branchId) => {
        const gym = gyms.find(g => g.id === branchId);
        return gym ? (gym.branchName || gym.gymName) : `Branch #${branchId}`;
    };

    const handleEdit = (conn) => {
        setForm({
            branchId: conn.branchId,
            serverUrl: conn.serverUrl,
            username: conn.username,
            password: conn.password,
            tenantId: conn.tenantId || '1',
            sdkApiKey: conn.sdkApiKey || '',
            sdkApiSecret: conn.sdkApiSecret || '',
        });
        setEditingBranchId(conn.branchId);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (branchId) => {
        if (!window.confirm(`Permanently remove device connection for ${getBranchName(branchId)}?`)) return;
        try {
            await removeMipsConnection(branchId);
            toast.success('Connection removed successfully');
            loadConnections();
        } catch {
            toast.error('Failed to remove connection');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.branchId || !form.serverUrl || !form.username || !form.password) {
            return toast.error('Please fill all required fields');
        }
        setSaving(true);
        try {
            await saveMipsConnection({
                branchId: parseInt(form.branchId),
                serverUrl: form.serverUrl.trim(),
                username: form.username.trim(),
                password: form.password,
                tenantId: form.tenantId || '1',
                sdkApiKey: form.sdkApiKey || undefined,
                sdkApiSecret: form.sdkApiSecret || undefined,
            });
            toast.success(editingBranchId ? 'Connection updated' : 'Connection saved successfully');
            setShowForm(false);
            setForm(emptyForm);
            setEditingBranchId(null);
            loadConnections();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Sync failed';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setForm(emptyForm);
        setEditingBranchId(null);
    };

    const configuredBranchIds = new Set(connections.map(c => c.branchId));
    const availableGyms = gyms.filter(g => !configuredBranchIds.has(g.id) || g.id === editingBranchId);

    if (loading) {
        return (
            <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Loading hardware settings…</p>
            </div>
        );
    }

    return (
        <div style={{
            background: T.bg, minHeight: '100vh', padding: '28px 28px 48px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", animation: 'fadeUp 0.38s ease both'
        }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                
                .grid-table { display: grid; grid-template-columns: 2fr 1fr 1.5fr 120px 100px; align-items: center; }
                
                @media (max-width: 1024px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 800px; }
                }
                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 16px 18px !important; }
                    .grid-table { grid-template-columns: 1fr !important; gap: 12px; padding: 18px !important; border-bottom: 8px solid ${T.bg} !important; }
                    .table-header { display: none !important; }
                    .webhook-card { flex-direction: column !important; align-items: stretch !important; }
                }
            `}</style>

            {/* ──────── BACK BUTTON ──────── */}
            <button
                onClick={() => navigate('/superadmin/general-settings/general')}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                    padding: '8px 12px', cursor: 'pointer', borderRadius: 10, marginBottom: 20,
                    color: T.muted, fontSize: 13, fontWeight: 700, transition: '0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.background = T.accentLight; }}
                onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = 'none'; }}
            >
                <ArrowLeft size={18} /> Back to General Settings
            </button>

            {/* ──────── HEADER BANNER ──────── */}
            <div style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 55%, #A855F7 100%)',
                borderRadius: 20, padding: '20px 26px', boxShadow: '0 8px 32px rgba(79,70,229,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, position: 'relative'
            }} className="header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
                    }}>
                        <Server size={26} color="#fff" strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Hardware Settings</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500 }}>Configure and manage biometric device connections for all branches</p>
                    </div>
                </div>
                {!showForm && (
                    <button 
                         onClick={() => { setForm(emptyForm); setEditingBranchId(null); setShowForm(true); }}
                         style={{
                            background: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, color: '#4F46E5', fontSize: 13, fontWeight: 800,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                         }}
                    >
                        <Plus size={16} strokeWidth={3} /> Add Device
                    </button>
                )}
            </div>

            {/* ──────── WEBHOOK INFO ──────── */}
            <div style={{ background: '#1A1533', borderRadius: 24, padding: 32, marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,92,252,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, position: 'relative', zIndex: 2 }} className="webhook-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 18, background: '#2D274D', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #3B3463' }}>
                            <Activity size={26} color={T.accent} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 11, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Device Webhook URL</h3>
                            <p style={{ fontSize: 12, color: '#B0ADCC', fontWeight: 600, margin: '4px 0 0' }}>Copy this URL to your device portal for real-time events</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 4, flex: 1, maxWidth: 600 }}>
                        <div style={{ flex: 1, height: 48, background: '#0D0A1F', border: '1px solid #2D274D', borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                            <code style={{ fontSize: 12, color: T.green, fontWeight: 700, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                {window.location.protocol}//{window.location.host}/api/v1/gym-device/webhook
                            </code>
                        </div>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/api/v1/gym-device/webhook`);
                                toast.success('Webhook URL copied');
                            }}
                            style={{ width: 48, height: 48, borderRadius: 12, background: '#2D274D', border: '1px solid #3B3463', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: '0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#3B3463'}
                            onMouseLeave={e => e.currentTarget.style.background = '#2D274D'}
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: 24, padding: '12px 16px', borderRadius: 14, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <p style={{ fontSize: 11, color: '#FEF3C7', fontWeight: 600, margin: 0 }}>
                        <span style={{ fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', marginRight: 8 }}>Tip:</span>
                        Biometric devices usually require a publicly accessible URL to send data. Localhost will not work.
                    </p>
                </div>
            </div>

            {/* ──────── PROVISION FORM ──────── */}
            {showForm && (
                <div style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, padding: 32, marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    <SectionHead title={editingBranchId ? `Edit Connection — ${getBranchName(editingBranchId)}` : 'Add New Connection'} sub="Configure a new MIPS device connection for a branch" />
                    
                    <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        {!editingBranchId && (
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Target Branch" icon={Building2} required>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none', zIndex: 2 }}>
                                            <Building2 size={16} strokeWidth={2.2} />
                                        </div>
                                        <select
                                            value={form.branchId}
                                            onChange={e => setForm({ ...form, branchId: e.target.value })}
                                            style={{
                                                width: '100%', height: 44, padding: '0 14px 0 42px', background: T.surface,
                                                border: `1px solid ${T.border}`, borderRadius: 12,
                                                fontSize: 13, fontWeight: 600, color: T.text, outline: 'none',
                                                transition: 'all 0.2s', appearance: 'none', cursor: 'pointer',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                                            }}
                                            required
                                        >
                                            <option value="">Select Branch...</option>
                                            {availableGyms.map(g => (
                                                <option key={g.id} value={g.id}>{g.branchName || g.gymName}</option>
                                            ))}
                                        </select>
                                        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }}>
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </Field>
                            </div>
                        )}

                        <Field label="Server URL" icon={Wifi} required>
                            <FocusInput 
                                hasIcon mono 
                                placeholder="https://nexus.node.io:9000" 
                                value={form.serverUrl} 
                                onChange={e => setForm({ ...form, serverUrl: e.target.value })} 
                                required
                            />
                        </Field>

                        <Field label="Username" icon={User} required>
                            <FocusInput 
                                hasIcon 
                                placeholder="Protocol Identifier" 
                                value={form.username} 
                                onChange={e => setForm({ ...form, username: e.target.value })} 
                                required
                            />
                        </Field>

                        <Field label="Password" icon={Key} required>
                            <div style={{ position: 'relative' }}>
                                <FocusInput 
                                    hasIcon 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="••••••••" 
                                    value={form.password} 
                                    onChange={e => setForm({ ...form, password: e.target.value })} 
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 4, top: 4, bottom: 4, width: 36, background: 'none', border: 'none', cursor: 'pointer', color: T.subtle, borderRadius: 8 }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </Field>

                        <Field label="Tenant ID" icon={Info}>
                            <FocusInput 
                                hasIcon 
                                placeholder="1" 
                                value={form.tenantId} 
                                onChange={e => setForm({ ...form, tenantId: e.target.value })} 
                            />
                        </Field>

                        <div style={{ gridColumn: '1 / -1', paddingTop: 16, borderTop: `1px dashed ${T.border}` }}>
                             <SectionHead title="SDK Configuration" sub="Configure SDK credentials for biometric device integration" />
                             
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                                <Field label="SDK API Key" icon={Shield}>
                                    <FocusInput 
                                        hasIcon mono
                                        placeholder="SDK-KEY-XXXXX" 
                                        value={form.sdkApiKey} 
                                        onChange={e => setForm({ ...form, sdkApiKey: e.target.value })} 
                                    />
                                </Field>
                                <Field label="SDK API Secret" icon={Key}>
                                    <div style={{ position: 'relative' }}>
                                        <FocusInput 
                                            hasIcon mono
                                            type={showApiSecret ? 'text' : 'password'} 
                                            placeholder="SDK-SECRET-XXXXX" 
                                            value={form.sdkApiSecret} 
                                            onChange={e => setForm({ ...form, sdkApiSecret: e.target.value })} 
                                        />
                                        <button type="button" onClick={() => setShowApiSecret(!showApiSecret)} style={{ position: 'absolute', right: 4, top: 4, bottom: 4, width: 36, background: 'none', border: 'none', cursor: 'pointer', color: T.subtle, borderRadius: 8 }}>
                                            {showApiSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </Field>
                             </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, marginTop: 12 }}>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    height: 48, padding: '0 28px', background: T.accent, border: 'none', borderRadius: 14,
                                    color: '#fff', fontSize: 13, fontWeight: 900, cursor: saving ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 10, transition: '0.2s', opacity: saving ? 0.7 : 1,
                                    boxShadow: `0 8px 20px rgba(124,92,252,0.25)`
                                }}
                            >
                                {saving ? <RefreshCw size={18} className="spin" /> : <Shield size={18} />}
                                {saving ? 'Saving...' : 'Save Connection'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={{
                                    height: 48, padding: '0 28px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
                                    color: T.muted, fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: '0.2s'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ──────── ACTIVE NODES ──────── */}
            <div style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '24px 32px', borderBottom: `1px solid ${T.border}`, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Connected Devices</h3>
                    <div style={{ padding: '4px 10px', borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, fontSize: 10, fontWeight: 800, color: T.accent }}>{connections.length} Connected</div>
                </div>

                <div className="table-wrapper">
                    <div className="table-content">
                        {/* Header */}
                        <div style={{ padding: '14px 32px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                            {['Branch', 'Status', 'Server URL', 'SDK Status', 'Actions'].map((h, i) => (
                                <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                            ))}
                        </div>

                        {/* Body */}
                        {connections.length > 0 ? connections.map((conn, idx) => (
                            <div key={conn.id} style={{ padding: '20px 32px', borderBottom: idx < connections.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.1s' }} className="grid-table" onMouseEnter={e => { e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.accent}20` }}>
                                        <Server size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 900, color: T.text, marginBottom: 2 }}>{getBranchName(conn.branchId)}</div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>Node ID: {conn.id}</div>
                                    </div>
                                </div>
                                
                                <div>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: conn.isActive ? T.greenLight : T.roseLight, color: conn.isActive ? T.green : T.rose, fontSize: 10, fontWeight: 800, border: `1px solid ${conn.isActive ? T.green : T.rose}30` }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div>
                                        {conn.isActive ? 'ONLINE' : 'OFFLINE'}
                                    </span>
                                </div>

                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: 'monospace' }}>{conn.serverUrl}</div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: T.subtle, marginTop: 2 }}>Protocol: {conn.username}</div>
                                </div>

                                <div>
                                    {conn.sdkApiKey ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.accent }}>
                                            <Check size={14} strokeWidth={3} />
                                            <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>Configured</span>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.subtle }}>
                                            <XCircle size={14} strokeWidth={2.5} />
                                            <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>Not Set</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button 
                                        onClick={() => handleEdit(conn)}
                                        style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.accent; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
                                    >
                                        <Settings size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(conn.branchId)}
                                        style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = T.rose; e.currentTarget.style.borderColor = T.rose; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '100px 32px', textAlign: 'center' }}>
                                <div style={{ width: 64, height: 64, borderRadius: 20, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `1px solid ${T.border}` }}>
                                    <Wifi size={32} color={T.subtle} />
                                </div>
                                <h4 style={{ fontSize: 15, fontWeight: 900, color: T.muted, margin: '0 0 6px' }}>No devices connected</h4>
                                <p style={{ fontSize: 12, color: T.subtle, margin: 0 }}>Start by adding a new device connection above.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

/* ─────────────────────────────────────────────
   CUSTOM ICONS (Fallback if needed)
───────────────────────────────────────────── */
const User = ({ size, color, strokeWidth = 2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);

export default HardwareSettings;
