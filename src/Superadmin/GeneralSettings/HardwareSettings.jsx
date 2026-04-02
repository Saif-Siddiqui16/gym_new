import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Server, Wifi, Shield, Key, Eye, EyeOff,
    CheckCircle, XCircle, Plus, Trash2, RefreshCw, Settings
} from 'lucide-react';
import {
    fetchMipsConnections,
    saveMipsConnection,
    removeMipsConnection
} from '../../api/gymDeviceApi';
import { fetchAllGyms } from '../../api/superadmin/superAdminApi';
import toast from 'react-hot-toast';

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
        if (!window.confirm(`Remove MIPS connection for ${getBranchName(branchId)}?`)) return;
        try {
            await removeMipsConnection(branchId);
            toast.success('Connection removed');
            loadConnections();
        } catch {
            toast.error('Failed to remove connection');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.branchId || !form.serverUrl || !form.username || !form.password) {
            return toast.error('Branch, Server URL, Username and Password are required');
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
            toast.success(editingBranchId ? 'Connection updated' : 'Connection saved & tested');
            setShowForm(false);
            setForm(emptyForm);
            setEditingBranchId(null);
            loadConnections();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to save';
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

    return (
        <div className="min-h-screen">
            {/* Back */}
            <button
                onClick={() => navigate('/superadmin/general-settings/general')}
                className="group flex items-center text-slate-500 hover:text-primary transition-all mb-6"
            >
                <div className="p-1 rounded-full group-hover:bg-primary-light mr-2">
                    <ArrowLeft size={20} />
                </div>
                <span className="font-semibold">Back to Settings</span>
            </button>

            {/* Header */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center text-white shadow-lg">
                                <Server size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-fuchsia-600 bg-clip-text text-transparent">
                                    SmartAIoT Settings
                                </h1>
                                <p className="text-slate-500 text-sm mt-0.5">Configure MIPS hardware connections per branch</p>
                            </div>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => { setForm(emptyForm); setEditingBranchId(null); setShowForm(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-fuchsia-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                <Plus size={18} />
                                Add Connection
                            </button>
                        )}
                    </div>
                </div>

                {/* Webhook Notice — Quick Reference for Hardware Setup */}
                <div className="mt-8 bg-slate-900 rounded-3xl p-8 border border-slate-800 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-700"></div>
                    <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-primary border border-slate-700 shadow-inner">
                                <Activity size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-[0.2em]">Global Webhook URL</h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">Configure this endpoint in your MIPS Cloud Portal for real-time face logs</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <div className="flex-1 lg:flex-none px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-sm text-emerald-400 select-all overflow-hidden truncate max-w-[500px]">
                                {window.location.protocol}//{window.location.host}/api/v1/gym-device/webhook
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/api/v1/gym-device/webhook`);
                                    toast.success('Webhook URL copied to clipboard!');
                                }}
                                className="h-14 w-14 bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-700 hover:border-slate-600 transition-all active:scale-90 flex items-center justify-center group/copy"
                                title="Copy Webhook Link"
                            >
                                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                        <p className="text-[11px] text-amber-200/80 font-medium leading-relaxed">
                            <span className="text-amber-400 font-black uppercase mr-2 tracking-tighter">Local Warning:</span>
                            Hardware cannot reach 'localhost'. Use a tool like <b>ngrok</b> or <b>Cloudflare Tunnel</b> to expose your port 8000 and use that public URL instead.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-8">
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Settings size={16} className="text-primary" />
                        {editingBranchId ? `Edit — ${getBranchName(editingBranchId)}` : 'New MIPS Connection'}
                    </h2>

                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Branch */}
                        {!editingBranchId && (
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Branch *</label>
                                <select
                                    value={form.branchId}
                                    onChange={e => setForm({ ...form, branchId: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                    required
                                >
                                    <option value="">Select Branch</option>
                                    {availableGyms.map(g => (
                                        <option key={g.id} value={g.id}>{g.branchName || g.gymName}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* MIPS Server */}
                        <div className="space-y-4">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Wifi size={12} className="text-primary" /> MIPS Server Credentials
                            </p>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Server URL *</label>
                                <input
                                    type="text"
                                    placeholder="http://212.38.94.228:9000"
                                    value={form.serverUrl}
                                    onChange={e => setForm({ ...form, serverUrl: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1 px-1">Connection will be tested before saving</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Username *</label>
                                    <input
                                        type="text"
                                        placeholder="admin"
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Tenant ID</label>
                                <input
                                    type="text"
                                    placeholder="1"
                                    value={form.tenantId}
                                    onChange={e => setForm({ ...form, tenantId: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* SDK Keys */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Key size={12} className="text-violet-500" /> SDK API Keys (SmartAIoT)
                            </p>
                            <p className="text-[11px] text-slate-400 -mt-2">
                                These keys are automatically applied to all devices added for this branch. No need to enter them when adding individual devices.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">API Key</label>
                                    <input
                                        type="text"
                                        placeholder="SDK API Key"
                                        value={form.sdkApiKey}
                                        onChange={e => setForm({ ...form, sdkApiKey: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">API Secret</label>
                                    <div className="relative">
                                        <input
                                            type={showApiSecret ? 'text' : 'password'}
                                            placeholder="SDK API Secret"
                                            value={form.sdkApiSecret}
                                            onChange={e => setForm({ ...form, sdkApiSecret: e.target.value })}
                                            className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                        <button type="button" onClick={() => setShowApiSecret(!showApiSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showApiSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-fuchsia-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-60"
                            >
                                <RefreshCw size={15} className={saving ? 'animate-spin' : ''} />
                                {saving ? 'Testing & Saving...' : 'Save Connection'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Connections List */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Configured Branches</h2>
                    <span className="text-xs font-bold text-slate-400">{connections.length} connection{connections.length !== 1 ? 's' : ''}</span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : connections.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center">
                            <Server size={32} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">No MIPS connections configured yet</p>
                        <p className="text-xs text-slate-400 mt-1">Click "Add Connection" to get started</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {connections.map(conn => (
                            <div key={conn.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${conn.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Shield size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-800 truncate">{getBranchName(conn.branchId)}</p>
                                        <p className="text-[11px] font-mono text-slate-400 truncate">{conn.serverUrl}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400">User: {conn.username}</span>
                                            {conn.sdkApiKey ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600">
                                                    <Key size={9} /> SDK Configured
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                                    <Key size={9} /> No SDK Keys
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {conn.isActive ? (
                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
                                            <CheckCircle size={10} /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black border border-slate-200">
                                            <XCircle size={10} /> Inactive
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleEdit(conn)}
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition-all"
                                        title="Edit"
                                    >
                                        <Settings size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(conn.branchId)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        title="Remove"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HardwareSettings;
