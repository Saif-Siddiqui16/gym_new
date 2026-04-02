import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, UserCheck, UserMinus, Download, Search, ChevronDown, Check, Loader2, Activity, ScanLine, ShieldCheck, Smartphone, Clock, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';
import { exportReportToCSV } from '../../api/staff/reportApi';
import RightDrawer from '../../components/common/RightDrawer';

// Reusable Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, icon: Icon, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative min-w-[160px]" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${isOpen ? 'border-primary ring-2 ring-violet-100 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    {Icon && <Icon size={16} className="text-gray-400" />}
                    <span className="font-medium truncate">{value === 'All' ? placeholder : value}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <div className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="py-1">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => { onChange(option.value); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${value === option.value ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {option.label}
                            {value === option.value && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DailyAttendanceReport = () => {
    const getToday = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getToday());
    const [typeFilter, setTypeFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [attendance, setAttendance] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({ totalToday: 0, membersToday: 0, staffToday: 0 });
    const [loading, setLoading] = useState(true);
    const [smartRecords, setSmartRecords] = useState([]);
    const [smartStats, setSmartStats] = useState({ today: 0, total: 0 });
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedDate, typeFilter, searchTerm]);

    const loadData = async () => {
        try {
            setLoading(true);
            const params = {
                search: searchTerm.trim(),
                type: typeFilter === 'All' ? undefined : typeFilter,
                date: selectedDate
            };

            const [attendanceRes, statsRes, smartLogs, smartSummaryData] = await Promise.all([
                apiClient.get('/admin/attendance', { params }),
                apiClient.get('/admin/attendance/stats'),
                import('../../api/gymDeviceApi').then(api => api.fetchFaceAccessRecords(null, selectedDate)).catch(() => []),
                import('../../api/gymDeviceApi').then(api => api.fetchGymAttendanceSummary(1, 10, null).catch(() => ({ today: 0, total: 0 })))
            ]);

            const formatted = (attendanceRes.data.data || []).map(a => ({
                id: a.id,
                memberId: a.membershipId,
                name: a.name,
                type: a.type,
                checkIn: a.checkIn || a.time || '-',
                checkOut: a.checkOut || '-',
                status: a.status,
                checkInMethod: a.checkInMethod || 'manual'
            }));

            setAttendance(formatted);

            const hardwareScans = (smartLogs || []).filter(log => {
                const scanDateStr = new Date(log.createTime).toLocaleDateString('en-CA');
                return scanDateStr === selectedDate;
            });
            setSmartRecords(hardwareScans);

            if (statsRes.data) {
                setAttendanceStats({
                    totalToday: statsRes.data.totalToday || 0,
                    membersToday: statsRes.data.membersToday || 0,
                    staffToday: statsRes.data.staffToday || 0
                });
            }

            setSmartStats({
                today: (smartSummaryData?.today > 0) ? smartSummaryData.today : hardwareScans.length,
                total: (smartSummaryData?.total > 0) ? smartSummaryData.total : (Array.isArray(smartLogs) ? smartLogs.length : 0)
            });

        } catch (error) {
            console.error('Attendance Load Error:', error);
            toast.error("Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        exportReportToCSV(attendance, `Attendance_Report_${selectedDate}`);
    };

    const stats = [
        { label: 'Manual In', value: attendance.filter(a => a.status === 'checked-in' || a.status === 'Inside').length, icon: Activity, color: 'from-emerald-500 to-emerald-600' },
        { label: 'Today Total', value: attendanceStats.totalToday, icon: Users, color: 'from-primary to-primary' },
        { label: 'Smart Face (Today)', value: smartStats.today, icon: Smartphone, color: 'from-violet-500 to-purple-600' },
        { label: 'Smart Face (Total)', value: smartStats.total, icon: ShieldCheck, color: 'from-blue-500 to-indigo-600' },
    ];

    return (
        <div className="p-0 md:p-8 bg-gray-50 min-h-screen staffdashboard-reports">
            {/* Header Section */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-fuchsia-600 bg-clip-text text-transparent tracking-tight">Daily Attendance Report</h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Detailed log of today's check-ins and hardware activity.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-xl border border-violet-100">
                                <ScanLine size={16} className="text-primary animate-pulse" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-wider">AIoT Hardware Active</span>
                            </div>
                            <button onClick={handleExport} className="h-11 px-6 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg active:scale-95">
                                <Download size={16} />
                                Export Log
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between group transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
                        <div className="flex items-start justify-between w-full">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-3xl font-black text-slate-900 leading-none">{stat.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls Card */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="pl-10 pr-4 h-11 w-full rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all bg-white outline-none text-slate-800 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <CustomDropdown
                        options={[
                            { value: 'All', label: 'All Types' },
                            { value: 'Member', label: 'Members' },
                            { value: 'Staff', label: 'Staff' }
                        ]}
                        value={typeFilter}
                        onChange={setTypeFilter}
                        icon={Filter}
                        placeholder="Filter Type"
                    />
                    <div className="relative w-full md:w-auto">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="date"
                            className="w-full pl-9 h-11 px-6 rounded-xl border-2 border-slate-200 focus:border-primary text-xs font-black uppercase transition-all bg-white outline-none min-w-[170px]"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Manual Logs Table */}
            {/* Attendance Status Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-12">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Users size={14} className="text-primary" /> Today's Manual Attendance ({attendance.filter(a => a.checkInMethod !== 'biometric').length})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">In</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Out</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            <span>Loading data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : attendance.filter(a => a.checkInMethod !== 'biometric').length > 0 ? (
                                attendance.filter(a => a.checkInMethod !== 'biometric').map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs group-hover:bg-primary-light group-hover:text-primary transition-colors">
                                                    {(log.name || '?').charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">{log.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase w-fit ${log.type === 'Member' ? 'bg-primary-light text-primary hover' : 'bg-teal-50 text-teal-700'}`}>
                                                    {log.type}
                                                </span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    Method: {log.checkInMethod === 'biometric' ? 'Face Scan' : 'Manual'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-700">{log.checkIn}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-400">{log.checkOut}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${log.status === 'Currently Inside' || log.status === 'Inside' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                                                {log.status === 'Inside' ? 'Inside' : log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                        No manual recordings for this date
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Smart AIoT Section */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Smartphone size={14} className="text-primary" /> Smart AIoT Access (Hardware Sync)
                    </h2>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Live Feed</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">User / Member</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Device</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Method</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Photo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                                        </td>
                                    </tr>
                                ) : smartRecords.length > 0 ? (
                                    smartRecords.slice(0, 50).map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center font-black text-primary border border-violet-100">
                                                        {(record.personName || 'V').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 leading-none mb-1">
                                                            {record.personName || 'Unknown Visitor'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                            {record.personSn || 'Hardware ID: ' + record.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck size={14} className="text-primary" />
                                                    <span className="text-[10px] font-black text-slate-700 tracking-wider uppercase">{record.deviceName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                                    {['face_0', 'face_1', 'face_2'].includes(record.passType) ? 'Face Scan' : (record.passType || 'ID Card')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-black text-slate-900 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 inline-flex items-center gap-2">
                                                    <Clock size={12} className="text-slate-400" />
                                                    {(() => {
                                                        if (!record.createTime) return '-';
                                                        const date = new Date(record.createTime);
                                                        // Ensure display is in IST (UTC + 5:30)
                                                        return date.toLocaleTimeString('en-IN', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit', 
                                                            second: '2-digit', 
                                                            hour12: false, 
                                                            timeZone: 'Asia/Kolkata' 
                                                        });
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {record.imageUrl ? (
                                                    <img src={record.imageUrl} alt="Scan" className="w-10 h-10 rounded-lg object-cover ml-auto ring-2 ring-slate-100 border border-white" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center ml-auto border border-dashed border-slate-200 outline-none">
                                                        <Activity size={12} className="text-slate-300" />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            No hardware logs found for this date
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyAttendanceReport;
