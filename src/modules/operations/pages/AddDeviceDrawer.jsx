import React, { useState } from 'react';
import { addDeviceToDB } from '../../../api/gymDeviceApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';
import Button from '../../../components/ui/Button';
import { Smartphone, ShieldCheck, Activity, Globe, Wifi, Settings2, ChevronDown, ChevronUp, Building2, AlertTriangle, X } from 'lucide-react';
import { fetchAllGyms } from '../../../api/superadmin/superAdminApi';
import { useAuth } from '../../../context/AuthContext';

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
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <Wifi size={14} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Status will be set to Connected after MIPS verification</span>
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

                    <div className="grid grid-cols-1 gap-4">
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
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                Device Key (MIPS Serial) <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. D1146D682A96B1C2"
                                value={formData.deviceKey}
                                onChange={(e) => { setFormData({ ...formData, deviceKey: e.target.value }); setSubmitError(null); }}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono uppercase"
                            />
                            <p className="text-[10px] text-slate-400 font-medium mt-1.5 italic px-1">
                                Device must already be connected in the MIPS portal. Find the key under Device Management → Serial No.
                            </p>
                        </div>
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

            {/* Footer */}
            <div className="border-t border-slate-100 bg-white sticky bottom-0 z-20">
                {/* Error Panel — shown when backend returns error */}
                {submitError && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <AlertTriangle size={16} className="text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-red-700 leading-snug">{submitError.message}</p>
                                    {submitError.hint && (
                                        <p className="text-[10px] text-red-500 font-medium mt-1.5 leading-relaxed">{submitError.hint}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSubmitError(null)}
                                className="flex-shrink-0 p-1 rounded-lg hover:bg-red-100 text-red-400 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="p-6">
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
            </div>
        </form>
    );
};

export default AddDeviceDrawer;
