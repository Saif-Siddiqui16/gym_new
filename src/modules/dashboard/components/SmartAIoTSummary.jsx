import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Smartphone,
    ShieldCheck,
    Users as UsersIcon,
    XCircle,
    LayoutGrid,
    Clock as ClockIcon,
    ArrowRight
} from 'lucide-react';
import { fetchGymDeviceDashboard } from '../../../api/gymDeviceApi';
import { useBranchContext } from '../../../context/BranchContext';

const DeviceStatCard = ({ label, value, color, icon: Icon }) => {
    const activeColors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        violet: 'bg-violet-50 text-violet-600 border-violet-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
        teal: 'bg-teal-50 text-teal-600 border-teal-100'
    };

    return (
        <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${activeColors[color]} hover:scale-105 transition-transform cursor-default group/card`}>
            <Icon size={16} className="mb-2 opacity-50 group-hover/card:opacity-100 transition-opacity" />
            <div className="text-base font-black leading-tight">{value}</div>
            <div className="text-[8px] font-black uppercase tracking-tighter opacity-70">{label}</div>
        </div>
    );
};

const SmartAIoTSummary = () => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch && selectedBranch !== 'all' ? selectedBranch : null;
            const data = await fetchGymDeviceDashboard(branchId);
            setSummary(data);
        } catch (error) {
            console.error('Failed to fetch smart device data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [selectedBranch]);

    if (!summary && !loading) return null;

    return (
        <div className="mb-8 p-6 bg-violet-50/30 rounded-3xl border-2 border-dashed border-violet-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Smartphone size={120} className="rotate-12" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-200 shrink-0">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Smart AIoT Access Control
                            {loading && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Real-time Face Recognition Hardware Sync</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/operations/devices')}
                    className="text-[10px] font-black text-primary hover:text-primary-hover flex items-center gap-1.5 uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:border-primary/30 transition-all w-fit"
                >
                    Hardware Settings <ArrowRight size={12} />
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
                <DeviceStatCard label="Online" value={summary?.onlineCount || 0} color="emerald" icon={ShieldCheck} />
                <DeviceStatCard label="Offline" value={summary?.offlineCount || 0} color="red" icon={XCircle} />
                <DeviceStatCard label="Face Today" value={summary?.totalCountToday || 0} color="violet" icon={UsersIcon} />
                <DeviceStatCard label="Face Total" value={summary?.totalCountAll || 0} color="blue" icon={LayoutGrid} />
                <DeviceStatCard label="Staff Today" value={summary?.employeeCountToday || 0} color="amber" icon={UsersIcon} />
                <DeviceStatCard label="Staff Total" value={summary?.employeeCountAll || 0} color="orange" icon={LayoutGrid} />
                <DeviceStatCard label="Visitors Today" value={summary?.visitorCountToday || 0} color="cyan" icon={UsersIcon} />
                <DeviceStatCard label="Visitors Total" value={summary?.visitorCountAll || 0} color="teal" icon={LayoutGrid} />
            </div>

            {/* Recent Face Records */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <ClockIcon size={14} className="text-primary" />
                        Recent Face Access Logs
                    </h4>
                    <button 
                        onClick={() => navigate('/operations/face-records')}
                        className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter"
                    >
                        View Detailed Logs
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Person</th>
                                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">ID / SN</th>
                                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Device</th>
                                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {summary?.records?.slice(0, 5).map((record) => (
                                <tr key={record.id} className="hover:bg-primary-light/10 transition-colors group/row">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 flex-shrink-0 group-hover/row:scale-110 transition-transform">
                                                {record.imageUrl ? (
                                                    <img src={record.imageUrl} alt={record.personName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <UsersIcon size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="font-black text-slate-900 text-xs">{record.personName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg group-hover/row:bg-primary-light group-hover/row:text-primary transition-colors">
                                            {record.personSn}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{record.passType.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">{record.deviceName}</td>
                                    <td className="px-6 py-3">
                                        <div className="text-[10px] font-bold text-slate-600">
                                            {new Date(record.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-[8px] text-slate-400 font-medium tracking-tight">
                                            {new Date(record.createTime).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md uppercase tracking-widest">
                                            Verified
                                        </span>
                                    </td>
                                </tr>
                            )) || (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400 text-xs font-bold font-italic">
                                        No recent face access records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SmartAIoTSummary;
