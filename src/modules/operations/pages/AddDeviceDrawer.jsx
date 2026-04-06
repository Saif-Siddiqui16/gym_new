import React, { useState } from 'react';
import { addDeviceToDB } from '../../../api/gymDeviceApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';
import { Smartphone, ShieldCheck, Activity, Globe, Wifi, Settings2, ChevronDown, ChevronUp, Building2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { fetchAllGyms } from '../../../api/superadmin/superAdminApi';
import { useAuth } from '../../../context/AuthContext';

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
  indigo: '#6366F1',
  indigoLight: '#EEF2FF'
};

const AddDeviceDrawer = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const { selectedBranch } = useBranchContext();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [gyms, setGyms] = useState([]);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'Turnstile',
        ip: '',
        deviceKey: '',
        port: '80',
        protocol: 'HTTP',
        companyName: '',
        companyId: '',
        branchId: ''
    });

    React.useEffect(() => {
        if (isSuperAdmin) {
            fetchAllGyms().then(data => {
                setGyms(data.gyms || data);
            }).catch(console.error);
        }
    }, [isSuperAdmin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return toast.error('Device name is required');
        if (!formData.ip) return toast.error('IP address is required');
        if (!formData.deviceKey) return toast.error('Device Key is required — find it in the MIPS portal');

        setSubmitError(null);
        try {
            setLoading(true);
            const branchId = formData.branchId
                ? parseInt(formData.branchId)
                : (selectedBranch && selectedBranch !== 'all' ? parseInt(selectedBranch) : null);

            const response = await addDeviceToDB({
                name: formData.name,
                ip: formData.ip,
                deviceKey: formData.deviceKey.trim().toUpperCase(),
                type: formData.type,
                branch_id: branchId,
                company_id: formData.companyId || undefined,
                sdk_type: 'SmartAIoT',
                port: formData.port ? parseInt(formData.port) : undefined,
                protocol: formData.protocol,
            });
            toast.success(response.message || 'Device added successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            const errData = error.response?.data;
            const message = errData?.message || error.message || 'Failed to add device';
            const hint = errData?.hint || null;
            setSubmitError({ message, hint });
        } finally {
            setLoading(false);
        }
    };

    const Label = ({ children }) => (
        <label style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>
            {children}
        </label>
    );

    const Input = (props) => (
        <input 
            {...props}
            style={{ 
                width: '100%', height: 48, background: T.bg, border: `2px solid transparent`,
                borderRadius: 14, padding: '0 16px', fontSize: 13, fontWeight: 600, color: T.text,
                outline: 'none', transition: '0.2s', ...props.style
            }}
            onFocus={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = '#fff'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = T.bg; }}
        />
    );

    const Select = (props) => (
        <select 
            {...props}
            style={{ 
                width: '100%', height: 48, background: T.bg, border: `2px solid transparent`,
                borderRadius: 14, padding: '0 16px', fontSize: 13, fontWeight: 600, color: T.text,
                outline: 'none', transition: '0.2s', cursor: 'pointer', ...props.style
            }}
            onFocus={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = '#fff'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = T.bg; }}
        />
    );

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.surface, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div style={{ flex: 1, padding: 32, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Device Primary Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                            <Smartphone size={18} strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Device Identity</h3>
                    </div>

                    <div>
                        <Label>Device Name</Label>
                        <Input
                            placeholder="e.g. Main Entrance Turnstile"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label>Hardware Type</Label>
                        <Select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Turnstile">Turnstile</option>
                            <option value="Face ID">Face ID</option>
                            <option value="RFID Reader">RFID Reader</option>
                            <option value="Biometric">Biometric</option>
                        </Select>
                    </div>

                    <div style={{ padding: '12px 16px', background: T.greenLight, border: `1px solid ${T.green}25`, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Wifi size={14} color={T.green} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification pending via MIPS</span>
                    </div>
                </div>

                {/* Network Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 24, borderTop: `1px solid ${T.bg}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.blue }}>
                            <Globe size={18} strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Network Config</h3>
                    </div>

                    <div>
                        <Label>IP Address / Host</Label>
                        <Input
                            placeholder="e.g. 192.168.1.100"
                            value={formData.ip}
                            onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                            style={{ fontFamily: 'monospace' }}
                        />
                        <p style={{ fontSize: 10, fontWeight: 700, color: T.subtle, marginTop: 6, fontStyle: 'italic' }}>Cloud sync uses this local identifier</p>
                    </div>

                    <div>
                        <Label>Device Key (MIPS Serial) *</Label>
                        <Input
                            placeholder="e.g. D1146D682A96B1C2"
                            value={formData.deviceKey}
                            onChange={(e) => { setFormData({ ...formData, deviceKey: e.target.value }); setSubmitError(null); }}
                            style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                        />
                        <p style={{ fontSize: 10, fontWeight: 700, color: T.subtle, marginTop: 6, fontStyle: 'italic', lineHeight: 1.4 }}>
                            Key found in MIPS portal under Device Management → Serial No.
                        </p>
                    </div>
                </div>

                {/* Multi-Company Mapping */}
                {isSuperAdmin && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 24, borderTop: `1px solid ${T.bg}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.amber }}>
                                <Building2 size={18} strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Mapping</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <Label>Company</Label>
                                <Select
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value, branchId: '', companyId: '' })}
                                >
                                    <option value="">Select Company</option>
                                    {[...new Set(gyms.map(g => g.gymName))].map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label>Branch</Label>
                                <Select
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value, companyId: e.target.value })}
                                    disabled={!formData.companyName}
                                    style={{ opacity: formData.companyName ? 1 : 0.5 }}
                                >
                                    <option value="">Select Branch</option>
                                    {gyms.filter(g => g.gymName === formData.companyName).map(gym => (
                                        <option key={gym.id} value={gym.id}>{gym.branchName || gym.gymName}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Advanced Configuration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 24, borderTop: `1px solid ${T.bg}` }}>
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{ background: 'none', border: 'none', padding: 0, width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.indigo }}>
                                <Settings2 size={18} strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Advanced</h3>
                        </div>
                        {showAdvanced ? <ChevronUp size={18} color={T.subtle} /> : <ChevronDown size={18} color={T.subtle} />}
                    </button>

                    {showAdvanced && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, animation: 'slideIn 0.3s ease-out' }}>
                            <div>
                                <Label>Port</Label>
                                <Input
                                    type="number"
                                    placeholder="80 or 4370"
                                    value={formData.port}
                                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Protocol</Label>
                                <Select
                                    value={formData.protocol}
                                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                                >
                                    <option value="HTTP">HTTP</option>
                                    <option value="HTTPS">HTTPS</option>
                                    <option value="TCP">TCP</option>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Scope Notice */}
                <div style={{ padding: 16, background: T.bg, borderRadius: 20, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ 
                        width: 40, height: 40, borderRadius: 10, 
                        background: (selectedBranch === 'all' && !formData.branchId) ? T.accent : T.surface, 
                        color: (selectedBranch === 'all' && !formData.branchId) ? '#fff' : T.subtle,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <Activity size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Deploy Scope</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: '2px 0 0' }}>
                            {formData.branchId ? `Target: Branch #${formData.branchId}` : (selectedBranch === 'all' ? 'All Active Branches' : 'Current Active Branch')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: 24, paddingBottom: 32, borderTop: `1px solid ${T.bg}`, background: '#fff', position: 'sticky', bottom: 0 }}>
                {submitError && (
                    <div style={{ marginBottom: 20, padding: 16, background: T.roseLight, border: `1px solid ${T.rose}20`, borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <AlertTriangle size={18} color={T.rose} style={{ marginTop: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 800, color: T.rose, margin: 0 }}>{submitError.message}</p>
                            {submitError.hint && <p style={{ fontSize: 11, fontWeight: 600, color: T.rose, opacity: 0.8, marginTop: 4 }}>{submitError.hint}</p>}
                        </div>
                        <button onClick={() => setSubmitError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.rose }}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    onMouseEnter={e => { if(!loading) { e.currentTarget.style.background = T.accent2; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                    onMouseLeave={e => { if(!loading) { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = 'none'; } }}
                    style={{ 
                        width: '100%', height: 56, background: T.accent, color: '#fff', border: 'none',
                        borderRadius: 18, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
                        cursor: loading ? 'not-allowed' : 'pointer', transition: '0.3s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        boxShadow: `0 12px 24px ${T.accent}40`
                    }}
                >
                    {loading ? (
                        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <>
                            Initialize Sensor
                            <ShieldCheck size={20} strokeWidth={2.5} />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default AddDeviceDrawer;
