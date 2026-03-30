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
import Button from '../../../components/ui/Button';
import { useBranchContext } from '../../../context/BranchContext';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                            <Building2 size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Assign Branch</h3>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[200px]">{device.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Device Key info */}
                <div className="mb-4 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Device Key</p>
                    <p className="text-xs font-mono font-bold text-slate-700">{device.deviceKey || '—'}</p>
                </div>

                {/* Branch Select */}
                <div className="mb-6">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Select Branch</label>
                    <select
                        value={selectedBranchId}
                        onChange={e => setSelectedBranchId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                    >
                        <option value="">— Select a branch —</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.branchName || b.gymName}
                            </option>
                        ))}
                    </select>
                    {selectedBranch && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-2 px-1">
                            ✓ Will assign to: {selectedBranch.branchName || selectedBranch.gymName}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedBranchId}
                        className="flex-1 py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Assign Branch'}
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
    const [assignModal, setAssignModal] = useState(null); // device object or null
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

            // Fetch DB devices + MIPS live data in parallel
            const [dbDevices, mipsDevices] = await Promise.all([
                fetchDevicesFromDB(branchId),
                fetchGymDevices(branchId).catch(() => [])
            ]);

            // Build a lookup map: deviceKey → MIPS live data
            const mipsMap = {};
            (Array.isArray(mipsDevices) ? mipsDevices : []).forEach(d => {
                if (d.deviceKey) mipsMap[d.deviceKey] = d;
            });

            // Merge: enrich each DB device with MIPS live fields
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
            throw error; // re-throw so modal can reset saving state
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

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse" />
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-violet-200">
                                <Smartphone size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    Device Dashboard
                                    <span className="px-2 py-0.5 bg-violet-100 text-primary text-[10px] font-black rounded-lg uppercase tracking-tighter">Live Monitor</span>
                                </h1>
                                <p className="text-slate-500 font-medium text-sm mt-1">Manage and assign entry hardware to branches</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadDevices}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-700 hover:border-violet-300 hover:text-primary transition-all disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                                Sync
                            </button>
                            <Button
                                onClick={() => setIsDrawerOpen(true)}
                                variant="primary"
                                className="px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2"
                                icon={Plus}
                            >
                                Add Device
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4 items-center flex-wrap">
                        <div className="relative flex-1 min-w-[200px] max-w-sm group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, type, device key..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* Unassigned warning banner */}
                        {isSuperAdmin && unassignedCount > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl">
                                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                                <span className="text-xs font-black text-amber-700">
                                    {unassignedCount} device{unassignedCount > 1 ? 's' : ''} unassigned — click Assign Branch
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard icon={<Smartphone size={22} />} label="Total Devices" value={devices.length} color="violet" />
                <SummaryCard icon={<Activity size={22} />} label="Online Devices" value={onlineCount} color="emerald" trend={`${onlineCount}/${devices.length} Active`} />
                <SummaryCard icon={<Building2 size={22} />} label="Unassigned" value={unassignedCount} color={unassignedCount > 0 ? 'amber' : 'emerald'} trend={unassignedCount > 0 ? 'Needs Branch' : 'All Assigned'} />
            </div>

            {/* Device Grid */}
            {isRefreshing && devices.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                    <RefreshCw size={28} className="animate-spin text-primary opacity-50" />
                </div>
            ) : filteredDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Smartphone size={40} className="mb-3 opacity-30" />
                    <p className="text-sm font-black uppercase tracking-widest">No devices found</p>
                    <p className="text-xs mt-1">Add a device or adjust your search</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

            {/* Footer Notice */}
            <div className="mt-12">
                <div className="bg-primary-light/50 rounded-2xl border border-violet-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-violet-900">Automatic Hardware Synchronization</p>
                            <p className="text-xs text-slate-500 font-medium">Device access syncs with Member Status and Attendance automatically.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-white border border-violet-200 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest">Active</span>
                        <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Verified</span>
                    </div>
                </div>
            </div>

            {/* Add Device Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Initialize Hardware"
                subtitle="Add a new entry monitoring device"
            >
                <AddDeviceDrawer
                    onClose={() => setIsDrawerOpen(false)}
                    onSuccess={loadDevices}
                />
            </RightDrawer>

            {/* Assign Branch Modal */}
            {assignModal && (
                <AssignBranchModal
                    device={assignModal}
                    branches={branches}
                    onConfirm={handleAssignBranch}
                    onClose={() => setAssignModal(null)}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Decommission Device?"
                message="This device will be removed from the system. All associated access logs will be preserved."
                confirmText="Delete Device"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

// ─── Device Card ──────────────────────────────────────────────────────────────
const DeviceCard = ({ device, branchName, isSuperAdmin, onAssign, onDelete, onOpenDoor, onReboot }) => {
    const isOnline = device.status === 'connected' || device.status === 'Online';
    const isUnassigned = !device.branchId;

    return (
        <div className="group relative bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-500 hover:-translate-y-1 flex flex-col">
            {/* Top status bar */}
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${isOnline ? 'from-emerald-400 to-teal-500' : 'from-red-400 to-rose-500'}`} />
            {/* Unassigned indicator */}
            {isUnassigned && (
                <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-amber-400 to-orange-400" />
            )}

            <div className="p-6 relative z-10 flex flex-col flex-1">
                {/* Top row */}
                <div className="flex justify-between items-start mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
                        ${device.type === 'Face ID' || device.type === 'face'
                            ? 'bg-violet-50 text-primary border border-violet-100'
                            : 'bg-cyan-50 text-cyan-600 border border-cyan-100'}`}>
                        {device.type === 'Face ID' || device.type === 'face'
                            ? <ShieldCheck size={24} />
                            : <Activity size={24} />}
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                        ${isOnline
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-red-50 text-red-500 border-red-200'}`}>
                        {isOnline ? <Wifi size={10} strokeWidth={3} /> : <WifiOff size={10} strokeWidth={3} />}
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>

                {/* Name & type */}
                <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight truncate" title={device.name}>
                    {device.name}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{device.type}</p>

                {/* Device Key */}
                {device.deviceKey && (
                    <p className="mt-2 text-[9px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 truncate">
                        {device.deviceKey}
                    </p>
                )}

                {/* Branch assignment status */}
                <div className="mt-4">
                    {isUnassigned ? (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">No Branch Assigned</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <Building2 size={12} className="text-emerald-500 flex-shrink-0" />
                            <span className="text-[10px] font-black text-emerald-700 truncate">{branchName}</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Entries Today</p>
                        <p className="text-xl font-black text-slate-900">{device.entriesToday || 0}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Seen</p>
                        <p className="text-[10px] font-black text-slate-600">
                            {device.lastSeen
                                ? new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Never'}
                        </p>
                    </div>
                </div>

                {/* Last person detected */}
                {device.lastPersonName && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-violet-50/60 border border-violet-100 rounded-xl">
                        <Users size={11} className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Last Entry</p>
                            <p className="text-[10px] font-black text-slate-700 truncate">{device.lastPersonName}</p>
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-4 flex-wrap">
                    {/* Assign Branch */}
                    {isSuperAdmin && (
                        <button
                            onClick={onAssign}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all min-w-0
                                ${isUnassigned
                                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-primary'}`}
                        >
                            <Building2 size={11} />
                            {isUnassigned ? 'Assign' : 'Reassign'}
                        </button>
                    )}
                    {/* Open Door */}
                    {isOnline && (
                        <button
                            onClick={onOpenDoor}
                            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black hover:bg-emerald-100 transition-all"
                            title="Remote Open Door"
                        >
                            <Unlock size={11} />
                            Open
                        </button>
                    )}
                    {/* Reboot */}
                    <button
                        onClick={onReboot}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-black hover:bg-blue-100 transition-all"
                        title="Reboot Device"
                    >
                        <RotateCcw size={11} />
                    </button>
                    {/* Delete */}
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
                        title="Decommission Device"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ icon, label, value, color, trend }) => {
    const colorMap = {
        violet: 'from-primary to-violet-600 shadow-violet-200',
        emerald: 'from-emerald-500 to-teal-600 shadow-emerald-200',
        amber: 'from-amber-500 to-orange-500 shadow-amber-200',
    };
    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex items-center gap-5 hover:scale-[1.02] transition-all duration-300">
            <div className={`w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white shadow-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
                    {trend && <span className="text-[10px] font-black text-slate-400 uppercase">{trend}</span>}
                </div>
            </div>
        </div>
    );
};

export default Devices;
