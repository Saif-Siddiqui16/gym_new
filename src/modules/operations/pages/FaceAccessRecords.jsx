import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Users, Search, Calendar, Filter, Download, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchFaceAccessRecords, fetchGymDepartments } from '../../../api/gymDeviceApi';
import DashboardGrid from '../../dashboard/components/DashboardGrid';

const FaceAccessRecords = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [recordsData, deptsData] = await Promise.all([
                fetchFaceAccessRecords(),
                fetchGymDepartments().catch(() => [])
            ]);
            console.log('[FaceRecords] Records received:', recordsData?.length);
            if (recordsData?.length > 0) console.log('[FaceRecords] First record:', recordsData[0]);
            setRecords(recordsData);
            setDepartments(deptsData);
        } catch (error) {
            console.error("Failed to load access records", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter(r => {
        if (!r) return false;
        
        const name = (r.personName || '').toLowerCase();
        const sn = (r.personSn || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = !searchTerm || name.includes(search) || sn.includes(search);
        
        // dateFilter is usually YYYY-MM-DD from <input type="date" />
        // r.createTime is usually YYYY-MM-DD HH:mm:ss
        const matchesDate = !dateFilter || (r.createTime && r.createTime.startsWith(dateFilter));
        
        return matchesSearch && matchesDate;
    });

    return (
        <div className="min-h-screen saas-page">
            {/* Header */}
            <div className="saas-card !p-8 mb-8 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary/30 transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">Face Access Records</h1>
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest text-[10px]">Detailed Smart AIoT Entry Logs</p>
                        </div>
                    </div>
                    <button className="h-11 px-6 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or ID..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <select 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary appearance-none transition-all"
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                            type="date" 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary transition-all"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={loadData}
                        className="h-full bg-primary-light text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20"
                    >
                        Refresh Results
                    </button>
                </div>
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 backdrop-blur-sm">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Photo</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-primary">Member ID / SN</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Time</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-8 py-6">
                                            <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-primary-light/5 transition-all group/row">
                                    <td className="px-8 py-4">
                                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg group-hover/row:scale-110 transition-transform bg-slate-100 flex items-center justify-center">
                                            {record.imageUrl ? (
                                                <img src={record.imageUrl} alt={record.personName} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="text-slate-300" size={24} />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="font-black text-slate-900 text-sm group-hover/row:text-primary transition-colors">
                                            {record.personName || 'Unknown / Visitor'}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                            {record.personName ? 'Gym Member' : 'Unregistered'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="px-3 py-1.5 bg-primary-light/30 text-primary rounded-xl font-black text-xs border border-primary/10">
                                            {record.personSn || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-violet-500" />
                                            <span className="font-black text-slate-600 text-[10px] uppercase">{record.deviceName}</span>
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-medium tracking-tight mt-0.5">{record.deviceKey}</div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-2 text-slate-900 font-black text-xs mb-1">
                                            <Clock size={14} className="text-slate-400" />
                                            {new Date(record.createTime.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-bold ml-5">
                                            {new Date(record.createTime.replace(' ', 'T')).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-black rounded-lg uppercase tracking-widest">
                                            {record.passType.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                            Access Granted
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <Search size={40} />
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-black text-lg">No records found</p>
                                                <p className="text-slate-400 text-sm font-medium">Try adjusting your filters or search terms</p>
                                            </div>
                                            <button 
                                                onClick={() => {setSearchTerm(''); setDateFilter('');}}
                                                className="mt-2 text-primary text-xs font-black uppercase tracking-widest hover:underline"
                                            >
                                                Clear All Filters
                                            </button>
                                        </div>
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

export default FaceAccessRecords;
