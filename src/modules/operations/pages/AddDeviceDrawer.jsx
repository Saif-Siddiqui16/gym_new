import React, { useState } from 'react';
import { addDevice } from '../../../api/superadmin/superAdminApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';
import Button from '../../../components/ui/Button';
import { Smartphone, ShieldCheck, Activity, Globe, Wifi, Settings2, Code, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { fetchAllGyms } from '../../../api/superadmin/superAdminApi';
import { useAuth } from '../../../context/AuthContext';

const AddDeviceDrawer = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const { selectedBranch } = useBranchContext();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const [loading, setLoading] = useState(false);
    const [gyms, setGyms] = useState([]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showSDK, setShowSDK] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'Turnstile',
        ip: '',
        status: 'Online',
        port: '80',
        protocol: 'HTTP',
        sdkType: 'SmartAIoT',
        apiKey: '',
        apiSecret: '',
        deviceToken: '',
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

        try {
            setLoading(true);
            const response = await addDevice({
                ...formData,
                branchId: formData.branchId || (selectedBranch === 'all' ? 'all' : parseInt(selectedBranch)),
                sdkApiKey: formData.apiKey,
                sdkApiSecret: formData.apiSecret
            });
            toast.success(response.message || 'Device added successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to add device');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Device Primary Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-violet-100 text-primary rounded-lg">
                            <Smartphone size={18} />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Device Identity</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Device Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Main Entrance Turnstile"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Hardware Type</label>
                            <div className="relative">
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                >
                                    <option value="Turnstile">Turnstile</option>
                                    <option value="Face ID">Face ID</option>
                                    <option value="RFID Reader">RFID Reader</option>
                                    <option value="Biometric">Biometric</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ShieldCheck size={16} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                            <div className="relative">
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                >
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                                    <Wifi size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Network Settings */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Globe size={18} />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Network Configuration</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">IP Address / Host</label>
                        <input
                            type="text"
                            placeholder="e.g. 192.168.1.100"
                            value={formData.ip}
                            onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                        />
                        <p className="text-[10px] text-slate-400 font-medium mt-1.5 italic px-1">Cloud synchronization will use this address</p>
                    </div>
                </div>

                {/* Multi-Company Mapping */}
                {isSuperAdmin && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                <Building2 size={18} />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Company & Branch Mapping</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Assign to Company</label>
                                <select
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value, branchId: '', companyId: '' })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                >
                                    <option value="">Select Company</option>
                                    {[...new Set(gyms.map(g => g.gymName))].map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Assign to Branch</label>
                                <select
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value, companyId: e.target.value })}
                                    disabled={!formData.companyName}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none disabled:opacity-50"
                                >
                                    <option value="">Select Branch</option>
                                    {gyms.filter(g => g.gymName === formData.companyName).map(gym => (
                                        <option key={gym.id} value={gym.id}>{gym.branchName || gym.gymName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Advanced Configuration (Collapsible) */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-between w-full group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Settings2 size={18} />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Advanced Configuration</h3>
                        </div>
                        {showAdvanced ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>

                    {showAdvanced && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Port</label>
                                <input
                                    type="number"
                                    placeholder="80 or 4370"
                                    value={formData.port}
                                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Protocol</label>
                                <select
                                    value={formData.protocol}
                                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                >
                                    <option value="HTTP">HTTP</option>
                                    <option value="HTTPS">HTTPS</option>
                                    <option value="TCP">TCP</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* SDK Configuration (Collapsible) */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setShowSDK(!showSDK)}
                        className="flex items-center justify-between w-full group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <Code size={18} />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">SDK Configuration</h3>
                        </div>
                        {showSDK ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>

                    {showSDK && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">SDK Type</label>
                                <select
                                    value={formData.sdkType}
                                    onChange={(e) => setFormData({ ...formData, sdkType: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                >
                                    <option value="SmartAIoT">SmartAIoT</option>
                                    <option value="Custom">Custom</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="API Key"
                                        value={formData.apiKey}
                                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">API Secret</label>
                                    <input
                                        type="password"
                                        placeholder="API Secret"
                                        value={formData.apiSecret}
                                        onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Device Token (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Device Token"
                                    value={formData.deviceToken}
                                    onChange={(e) => setFormData({ ...formData, deviceToken: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Scope Notice */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedBranch === 'all' && !formData.branchId ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                        <Activity size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Auto-Deployment Scope</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">
                            {formData.branchId ? `Branch ID: ${formData.branchId}` : (selectedBranch === 'all' ? 'Deploying to ALL Branches' : 'Deploying to Selected Branch Only')}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5 italic">Managed by top branch selector or mapping</p>
                    </div>
                </div>
            </div>

            {/* Premium Footer */}
            <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-20">
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform active:scale-95 group overflow-hidden relative"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Initialize Hardware
                        <ShieldCheck size={18} className="group-hover:rotate-12 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Button>
            </div>
        </form>
    );
};

export default AddDeviceDrawer;
