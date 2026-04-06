import React, { useState, useEffect } from 'react';
import {
    Smartphone, ShieldCheck, Activity, RefreshCw, CheckCircle,
    Wifi, WifiOff, Users, Search, Plus, Trash2, Building2, AlertTriangle, X,
    Unlock, RotateCcw
} from 'lucide-react';
import { fetchDevicesFromDB, updateDeviceInDB, deleteDeviceFromDB, fetchGymDevices, openDeviceDoor, rebootDevice as rebootDeviceApi } from '../../../api/gymDeviceApi';
import { fetchAllGyms } from '../../../api/superadmin/superAdminApi';
import RightDrawer from '../../../components/common/RightDrawer';
import AddDeviceDrawer from './AddDeviceDrawer';
import { useBranchContext } from '../../../context/BranchContext';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

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
  cyan: '#06B6D4',
  cyanLight: '#ECFEFF'
};

// ─── Assign Branch Modal ──────────────────────────────────────────────────────
const AssignBranchModal = ({ device, branches, onConfirm, onClose }) => {
    const [selectedBranchId, setSelectedBranchId] = useState(device.branchId ? String(device.branchId) : '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!selectedBranchId) return toast.error('Please select a branch');
        try {
            setSaving(true);
            await onConfirm(device.id, parseInt(selectedBranchId));
        } finally {
            setSaving(false);
        }
    };

    const selectedBranch = branches.find(b => String(b.id) === selectedBranchId);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,21,51,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div style={{ 
                position: 'relative', width: '100%', maxWidth: 440, background: T.surface, 
                borderRadius: 24, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                animation: 'fadeUp 0.3s ease-out' 
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: T.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.amber }}>
                            <Building2 size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Assign Branch</h3>
                            <p style={{ fontSize: 11, fontWeight: 700, color: T.subtle, margin: '2px 0 0' }}>{device.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.subtle }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ marginBottom: 20, padding: '12px 16px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16 }}>
                    <p style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Device Key</p>
                    <p style={{ fontSize: 12, fontWeight: 800, color: T.muted, fontFamily: 'monospace', margin: 0 }}>{device.deviceKey || '—'}</p>
                </div>

                <div style={{ marginBottom: 32 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>Select Branch</label>
                    <select
                        value={selectedBranchId}
                        onChange={e => setSelectedBranchId(e.target.value)}
                        style={{ 
                            width: '100%', height: 48, px: 16, background: T.bg, border: `1px solid ${T.border}`, 
                            borderRadius: 14, fontSize: 13, fontWeight: 700, color: T.text, outline: 'none',
                            padding: '0 16px', cursor: 'pointer'
                        }}
                    >
                        <option value="">— Select a branch —</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.branchName || b.gymName}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={onClose}
                        style={{ 
                            flex: 1, height: 48, border: `1px solid ${T.border}`, background: 'none', 
                            borderRadius: 14, fontSize: 13, fontWeight: 800, color: T.muted, cursor: 'pointer' 
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedBranchId}
                        style={{ 
                            flex: 1, height: 48, background: T.accent, border: 'none', 
                            borderRadius: 14, fontSize: 13, fontWeight: 800, color: '#fff', 
                            cursor: 'pointer', opacity: saving || !selectedBranchId ? 0.6 : 1
                        }}
                    >
                        {saving ? 'Saving...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Devices = () => {
    const { user } = useAuth();
    const { selectedBranch } = useBranchContext();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const [devices, setDevices] = useState([]);
    const [branches, setBranches] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [assignModal, setAssignModal] = useState(null); 
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    useEffect(() => {
        loadDevices();
    }, [selectedBranch]);

    useEffect(() => {
        if (isSuperAdmin) {
            fetchAllGyms()
                .then(data => setBranches(data.gyms || data || []))
                .catch(() => {});
        }
    }, [isSuperAdmin]);

    const loadDevices = async () => {
        setIsRefreshing(true);
        try {
            const branchId = isSuperAdmin
                ? (selectedBranch && selectedBranch !== 'all' ? selectedBranch : null)
                : null;

            const [dbDevices, mipsDevices] = await Promise.all([
                fetchDevicesFromDB(branchId),
                fetchGymDevices(branchId).catch(() => [])
            ]);

            const mipsMap = {};
            (Array.isArray(mipsDevices) ? mipsDevices : []).forEach(d => {
                if (d.deviceKey) mipsMap[d.deviceKey] = d;
            });

            const merged = (Array.isArray(dbDevices) ? dbDevices : []).map(device => {
                const live = device.deviceKey ? mipsMap[device.deviceKey] : null;
                return {
                    ...device,
                    lastPersonName: live?.lastPersonName || null,
                    connectionType: live?.connectionType || null,
                };
            });

            setDevices(merged);
        } catch (error) {
            console.error('Failed to load devices', error);
            toast.error('Failed to load devices');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleOpenDoor = async (device) => {
        const tid = toast.loading(`Opening ${device.name}...`);
        try {
            const res = await openDeviceDoor(device.id);
            toast.success(res.message || 'Door opened', { id: tid });
        } catch (error) {
            toast.error(error.message || 'Failed to open door', { id: tid });
        }
    };

    const handleReboot = async (device) => {
        if (!window.confirm(`Reboot "${device.name}"? Device will be offline for ~30 seconds.`)) return;
        const tid = toast.loading(`Rebooting ${device.name}...`);
        try {
            const res = await rebootDeviceApi(device.id);
            toast.success(res.message || 'Reboot command sent', { id: tid });
        } catch (error) {
            toast.error(error.message || 'Reboot failed', { id: tid });
        }
    };

    const handleAssignBranch = async (deviceId, branchId) => {
        try {
            await updateDeviceInDB(deviceId, { branchId });
            toast.success('Branch assigned successfully');
            setAssignModal(null);
            loadDevices();
        } catch (error) {
            toast.error(error.message || 'Failed to assign branch');
            throw error; 
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            toast.loading('Decommissioning device...', { id: 'del' });
            await deleteDeviceFromDB(confirmModal.id);
            toast.success('Device removed', { id: 'del' });
            setConfirmModal({ isOpen: false, id: null, loading: false });
            loadDevices();
        } catch (error) {
            toast.error(error.message || 'Failed to delete device', { id: 'del' });
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const getBranchName = (branchId) => {
        if (!branchId) return null;
        const b = branches.find(b => b.id === branchId || String(b.id) === String(branchId));
        return b ? (b.branchName || b.gymName) : `Branch #${branchId}`;
    };

    const filteredDevices = devices.filter(d =>
        (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.deviceKey || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const unassignedCount = devices.filter(d => !d.branchId).length;
    const onlineCount = devices.filter(d => d.status === 'connected' || d.status === 'Online').length;

    const [focusInput, setFocusInput] = useState(false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .summary-card:hover { transform: translateY(-4px); }
                .device-card:hover { border-color: ${T.accentMid} !important; }
                @media (max-width: 768px) {
                    .header-act { flex-direction: column !important; width: 100%; }
                    .header-act button { width: 100%; }
                }
            `}</style>

            {/* Header Area */}
            <div style={{ 
                background: T.surface, borderRadius: 24, padding: 32, 
                border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(124,92,252,0.06)',
                display: 'flex', flexDirection: 'column', gap: 24
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ 
                            width: 56, height: 56, borderRadius: 18, 
                            background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                        }}>
                            <Smartphone size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>Devices</h1>
                            <p style={{ fontSize: 13, fontWeight: 700, color: T.subtle, margin: '4px 0 0' }}>Manage and monitor your gym's entry hardware</p>
                        </div>
                    </div>
                    <div className="header-act" style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={loadDevices}
                            disabled={isRefreshing}
                            style={{ 
                                height: 48, padding: '0 24px', background: T.surface, border: `2px solid ${T.border}`,
                                borderRadius: 14, fontSize: 13, fontWeight: 800, color: T.muted, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 10, transition: '0.2s'
                            }}
                        >
                            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                            Sync
                        </button>
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            style={{ 
                                height: 48, padding: '0 24px', background: T.accent, border: 'none',
                                borderRadius: 14, fontSize: 13, fontWeight: 800, color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 10, transition: '0.2s',
                                boxShadow: `0 8px 16px ${T.accent}30`
                            }}
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            Add Device
                        </button>
                    </div>
                </div>

                <div style={{ height: 1, background: T.bg }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
                        <Search size={18} color={focusInput ? T.accent : T.subtle} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', transition: '0.2s' }} />
                        <input 
                            type="text"
                            placeholder="Search devices..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onFocus={() => setFocusInput(true)}
                            onBlur={() => setFocusInput(false)}
                            style={{ 
                                width: '100%', height: 48, background: T.bg, border: `2px solid ${focusInput ? T.accent : 'transparent'}`,
                                borderRadius: 16, padding: '0 16px 0 48px', fontSize: 13, fontWeight: 600, color: T.text, outline: 'none',
                                transition: '0.2s'
                            }}
                        />
                    </div>
                    {isSuperAdmin && unassignedCount > 0 && (
                        <div style={{ padding: '10px 20px', borderRadius: 12, background: T.amberLight, border: `1px solid ${T.amber}25`, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <AlertTriangle size={16} color={T.amber} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: T.amber }}>{unassignedCount} devices unassigned</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Grid */}
            {/* Summary cards removed per user request for original layout */}

            {/* Device Grid */}
            {isRefreshing && devices.length === 0 ? (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RefreshCw size={32} color={T.accent} style={{ animation: 'spin 1s linear infinite', opacity: 0.5 }} />
                </div>
            ) : filteredDevices.length === 0 ? (
                <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: T.surface, borderRadius: 24, border: `1px solid ${T.border}` }}>
                    <Smartphone size={48} color={T.subtle} style={{ marginBottom: 16, opacity: 0.4 }} />
                    <h3 style={{ fontSize: 13, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No devices found</h3>
                    <p style={{ fontSize: 11, color: T.subtle, margin: '4px 0 0' }}>Add a device or broaden your search</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                    {filteredDevices.map(device => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            branchName={getBranchName(device.branchId)}
                            isSuperAdmin={isSuperAdmin}
                            onAssign={() => setAssignModal(device)}
                            onDelete={() => handleDelete(device.id)}
                            onOpenDoor={() => handleOpenDoor(device)}
                            onReboot={() => handleReboot(device)}
                        />
                    ))}
                </div>
            )}

            {/* Bottom Alert */}
            <div style={{ 
                background: T.blueLight, padding: 24, borderRadius: 24, border: `1px solid ${T.blue}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.blue }}>
                        <CheckCircle size={22} />
                    </div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 900, color: T.text, margin: 0 }}>Automatic Hardware Sync</p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, margin: '2px 0 0' }}>Member status and attendance records are synchronized automatically</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ padding: '6px 12px', background: '#fff', color: T.blue, fontSize: 10, fontWeight: 900, borderRadius: 8, textTransform: 'uppercase' }}>Active</span>
                    <span style={{ padding: '6px 12px', background: T.blue, color: '#fff', fontSize: 10, fontWeight: 900, borderRadius: 8, textTransform: 'uppercase' }}>Verified</span>
                </div>
            </div>

            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Add New Device"
                subtitle="Connect a new biometric or RFID sensor to your network"
            >
                <AddDeviceDrawer
                    onClose={() => setIsDrawerOpen(false)}
                    onSuccess={loadDevices}
                />
            </RightDrawer>

            {assignModal && (
                <AssignBranchModal
                    device={assignModal}
                    branches={branches}
                    onConfirm={handleAssignBranch}
                    onClose={() => setAssignModal(null)}
                />
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Delete Device?"
                message="Are you sure you want to remove this device? This action cannot be undone."
                confirmText="Delete Device"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

// ─── Device Card ──────────────────────────────────────────────────────────────
const DeviceCard = ({ device, branchName, isSuperAdmin, onAssign, onDelete, onOpenDoor, onReboot }) => {
    const [hover, setHover] = useState(false);
    const isOnline = device.status === 'connected' || device.status === 'Online';
    const isUnassigned = !device.branchId;

    return (
        <div 
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="device-card"
            style={{ 
                position: 'relative', background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`,
                padding: 24, display: 'flex', flexDirection: 'column', gap: 20, transition: '0.3s',
                boxShadow: hover ? '0 12px 30px rgba(124,92,252,0.1)' : '0 4px 12px rgba(0,0,0,0.02)',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: isOnline ? T.green : T.rose }} />
            {isUnassigned && <div style={{ position: 'absolute', top: 0, right: 0, height: 4, width: '50%', background: T.amber }} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                    width: 48, height: 48, borderRadius: 14, 
                    background: (device.type === 'Face ID' || device.type === 'face') ? T.accentLight : T.cyanLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: (device.type === 'Face ID' || device.type === 'face') ? T.accent : T.cyan
                }}>
                    {(device.type === 'Face ID' || device.type === 'face') ? <ShieldCheck size={24} /> : <Activity size={24} />}
                </div>
                <div style={{ 
                    padding: '4px 12px', borderRadius: 20, background: isOnline ? T.greenLight : T.roseLight,
                    border: `1px solid ${isOnline ? T.green : T.rose}30`,
                    display: 'flex', alignItems: 'center', gap: 6
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: isOnline ? T.green : T.rose }} />
                    <span style={{ fontSize: 10, fontWeight: 900, color: isOnline ? T.green : T.rose, textTransform: 'uppercase' }}>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
            </div>

            <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.3px truncate' }}>{device.name}</h3>
                <p style={{ fontSize: 11, fontWeight: 800, color: T.subtle, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{device.type}</p>
                {device.deviceKey && (
                    <p style={{ fontSize: 10, fontWeight: 700, color: T.subtle, background: T.bg, padding: '4px 8px', borderRadius: 6, display: 'inline-block', marginTop: 8, fontFamily: 'monospace' }}>
                        {device.deviceKey}
                    </p>
                )}
            </div>

            <div style={{ height: 1, background: T.bg }} />

            <div style={{ display: 'flex', gap: 8 }}>
                {isUnassigned ? (
                    <div style={{ flex: 1, padding: '8px 12px', borderRadius: 12, background: T.amberLight, border: `1px solid ${T.amber}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={14} color={T.amber} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: T.amber, textTransform: 'uppercase' }}>Unassigned</span>
                    </div>
                ) : (
                    <div style={{ flex: 1, padding: '8px 12px', borderRadius: 12, background: T.greenLight, border: `1px solid ${T.green}20`, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <Building2 size={14} color={T.green} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: T.green, truncate: true, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{branchName}</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: T.bg, padding: 12, borderRadius: 16 }}>
                    <p style={{ fontSize: 8, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', marginBottom: 2 }}>Today</p>
                    <p style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>{device.entriesToday || 0}</p>
                </div>
                <div style={{ background: T.bg, padding: 12, borderRadius: 16 }}>
                    <p style={{ fontSize: 8, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', marginBottom: 2 }}>Last Seen</p>
                    <p style={{ fontSize: 12, fontWeight: 800, color: T.muted, margin: 0 }}>
                        {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </p>
                </div>
            </div>

            {device.lastPersonName && (
                <div style={{ background: T.accentLight, padding: 12, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Users size={14} color={T.accent} />
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 8, fontWeight: 800, color: T.accent, textTransform: 'uppercase', marginBottom: 1 }}>Last Action</p>
                        <p style={{ fontSize: 11, fontWeight: 800, color: T.text, margin: 0, truncate: true, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{device.lastPersonName}</p>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {isSuperAdmin && (
                    <button 
                        onClick={onAssign}
                        style={{ 
                            flex: 1, minWidth: 80, height: 36, borderRadius: 10, 
                            background: isUnassigned ? T.amber : T.bg, 
                            border: 'none', color: isUnassigned ? '#fff' : T.muted,
                            fontSize: 11, fontWeight: 900, cursor: 'pointer', transition: '0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                    >
                        <Building2 size={12} /> {isUnassigned ? 'Assign' : 'Edit'}
                    </button>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                    {isOnline && (
                        <button 
                            onClick={onOpenDoor}
                            style={{ 
                                width: 36, height: 36, borderRadius: 10, background: T.greenLight, 
                                border: `1px solid ${T.green}20`, color: T.green, cursor: 'pointer',
                                display: 'grid', placeItems: 'center', padding: 0
                            }}
                        >
                            <Unlock size={14} style={{ display: 'block' }} />
                        </button>
                    )}
                    <button 
                        onClick={onReboot}
                        style={{ 
                            width: 36, height: 36, borderRadius: 10, background: T.blueLight, 
                            border: `1px solid ${T.blue}20`, color: T.blue, cursor: 'pointer',
                            display: 'grid', placeItems: 'center', padding: 0
                        }}
                    >
                        <RotateCcw size={14} style={{ display: 'block' }} />
                    </button>
                    <button 
                        onClick={onDelete}
                        style={{ 
                            width: 36, height: 36, borderRadius: 10, background: T.roseLight, 
                            border: `1px solid ${T.rose}20`, color: T.rose, cursor: 'pointer',
                            display: 'grid', placeItems: 'center', padding: 0
                        }}
                    >
                        <Trash2 size={14} style={{ display: 'block' }} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ icon, label, value, color, trend }) => {
    const cMap = {
        violet: { bg: T.accent, grad: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, shadow: `${T.accent}30` },
        emerald: { bg: T.green, grad: `linear-gradient(135deg, #22C97A, #10B981)`, shadow: `${T.green}30` },
        amber: { bg: T.amber, grad: `linear-gradient(135deg, #F59E0B, #D97706)`, shadow: `${T.amber}30` },
    };
    const s = cMap[color] || cMap.violet;

    return (
        <div className="summary-card" style={{ 
            background: T.surface, borderRadius: 24, padding: '24px 28px', 
            border: `1px solid ${T.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            display: 'flex', alignItems: 'center', gap: 20, transition: '0.3s'
        }}>
            <div style={{ 
                width: 52, height: 52, borderRadius: 16, background: s.grad,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                boxShadow: `0 8px 16px ${s.shadow}`
            }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>{label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-1px' }}>{value}</h2>
                    {trend && <span style={{ fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>{trend}</span>}
                </div>
            </div>
        </div>
    );
};

export default Devices;
