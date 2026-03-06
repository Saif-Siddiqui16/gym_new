import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, Activity, RefreshCw, AlertCircle, CheckCircle, Wifi, WifiOff, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchDevices } from '../../../api/superadmin/superAdminApi';

const Devices = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = async () => {
        setIsRefreshing(true);
        try {
            const data = await fetchDevices();
            const formatted = data.map(d => ({
                id: d.id,
                name: d.name,
                type: d.type || 'Turnstile',
                status: (d.status === 'connected' || d.status === 'Online' || d.status === 'active') ? 'Online' : 'Offline',
                entriesToday: d.entriesToday || 0,
                lastSync: d.lastSeen ? new Date(d.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'
            }));
            setDevices(formatted);
        } catch (error) {
            console.error("Failed to load devices", error);
        } finally {
            setIsRefreshing(false);
        }
    };


    const handleRefresh = () => {
        loadDevices();
    };

    const handleMonitor = (device) => {
        navigate('/operations/live-monitor');
    };

    const getStatusBadge = (status) => {
        const isOnline = status === 'Online';
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-300 ${isOnline
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                }`}>
                {isOnline ? <Wifi size={12} strokeWidth={3} /> : <WifiOff size={12} strokeWidth={3} />}
                {status}
            </span>
        );
    };

    const filteredDevices = devices.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onlineCount = devices.filter(d => d.status === 'Online').length;
    const totalEntries = devices.reduce((acc, d) => acc + (d.entriesToday || 0), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6">
            {/* Premium Header */}
            <div className="mb-8 relative max-w-7xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-violet-200 transition-all duration-500 hover:scale-110 hover:rotate-3">
                                <Smartphone size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    Device Dashboard
                                    <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-[10px] font-black rounded-lg uppercase tracking-tighter">Live Monitor</span>
                                </h1>
                                <p className="text-slate-500 font-medium text-sm mt-1">Monitor entry hardware and sync status</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`group flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-700 hover:bg-slate-50 hover:border-violet-300 hover:text-violet-600 transition-all duration-300 shadow-sm ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <RefreshCw size={18} strokeWidth={2.5} className={`${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            {isRefreshing ? 'Refreshing Hardware...' : 'Manual Refresh'}
                        </button>
                    </div>
                    {/* Add Search Bar per requirement */}
                    <div className="mt-6 flex flex-col md:flex-row gap-4 items-center w-full max-w-lg">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-all" size={18} />
                            <input
                                type="text"
                                placeholder="Search devices by name or type..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-7xl mx-auto">
                <SummaryCard
                    icon={<Smartphone size={24} />}
                    label="Total Devices"
                    value={devices.length}
                    color="violet"
                />
                <SummaryCard
                    icon={<Activity size={24} />}
                    label="Online Devices"
                    value={onlineCount}
                    color="emerald"
                    trend={`${onlineCount}/${devices.length} Active`}
                />
                <SummaryCard
                    icon={<Users size={24} />}
                    label="Total Entries Today"
                    value={totalEntries.toLocaleString()}
                    color="blue"
                    trend="Live Traffic"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto auto-rows-fr">
                {filteredDevices.map((device) => (
                    <div key={device.id} className="group relative bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
                        {/* Background Gradient Detail */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${device.status === 'Online' ? 'from-emerald-400 to-teal-500' : 'from-red-400 to-rose-500 animate-pulse'}`}></div>

                        <div className="p-6 sm:p-7 relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${device.type === 'Face ID'
                                    ? 'bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-600 border border-violet-100'
                                    : 'bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 border border-blue-100'
                                    }`}>
                                    {device.type === 'Face ID' ? <ShieldCheck size={28} /> : <Activity size={28} />}
                                </div>
                                {getStatusBadge(device.status)}
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-violet-600 transition-colors tracking-tight truncate w-full" title={device.name}>{device.name}</h3>
                                    <div className="flex items-center gap-2 mt-1 truncate">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">{device.type}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200 shrink-0"></div>
                                        <span className="text-[10px] font-bold text-slate-400 italic shrink-0">#{device.id}00-X</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-violet-100 transition-all duration-500">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Entries</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-black text-slate-900 leading-none">{device.entriesToday}</p>
                                            <span className="text-[10px] font-bold text-emerald-500">+12%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Sync</p>
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <RefreshCw size={12} className="text-violet-500" />
                                            <p className="text-xs font-black tracking-tight">{device.lastSync}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="flex-grow"></div>
                            <div className="flex items-center justify-between pt-2 mt-4">
                                <button
                                    onClick={() => handleMonitor(device)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-violet-600 transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-violet-200 active:scale-95 shrink-0"
                                >
                                    Monitor Activity
                                </button>
                                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0">
                                    <AlertCircle size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sync Notice */}
            <div className="mt-12 max-w-7xl mx-auto">
                <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-indigo-900 tracking-tight">Automatic Hardware Synchronization</p>
                            <p className="text-xs text-slate-500 font-medium">Device access syncs with Member Status and Attendance automatically.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-white border border-indigo-200 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Active</span>
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ icon, label, value, color, trend }) => {
    const colorClasses = {
        violet: 'from-violet-500 to-purple-600 shadow-violet-200 text-violet-600',
        emerald: 'from-emerald-500 to-teal-600 shadow-emerald-200 text-emerald-600',
        blue: 'from-blue-500 to-indigo-600 shadow-blue-200 text-blue-600'
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex items-center gap-5 hover:scale-[1.02] transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color].split(' shadow')[0]} flex items-center justify-center text-white shadow-lg ${colorClasses[color].split(' ')[2]}`}>
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
