import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserPlus, Calendar, Download, Search, Filter, FileText } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { getDailyAttendanceReport, exportReportToCSV } from '../../api/staff/reportApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const DailyAttendanceReport = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [attendanceLogs, setAttendanceLogs] = useState([]);

    // Mock stats (could be calculated from logs or fetched separately)
    const attendanceStats = [
        { label: 'Total Check-Ins', value: '142', icon: UserPlus, bg: 'bg-blue-50', color: 'text-blue-600' },
        { label: 'Members', value: '128', icon: Users, bg: 'bg-indigo-50', color: 'text-indigo-600' },
        { label: 'Staff members', value: '14', icon: UserCheck, bg: 'bg-teal-50', color: 'text-teal-600' },
    ];

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        const data = await getDailyAttendanceReport();
        // Transform API data to match UI structure if needed
        const logs = [
            { id: 1, name: 'Rahul Sharma', type: 'Member', in: '06:30 AM', out: '08:00 AM', status: 'Checked Out' },
            { id: 2, name: 'Vikram Malhotra', type: 'Member', in: '07:15 AM', out: '-', status: 'Currently Inside' },
            { id: 3, name: 'Sneha Gupta', type: 'Member', in: '08:00 AM', out: '09:30 AM', status: 'Checked Out' },
            { id: 4, name: 'Amit Verma (Trainer)', type: 'Staff', in: '05:45 AM', out: '-', status: 'Currently Inside' },
            { id: 5, name: 'Priya Singh', type: 'Member', in: '09:10 AM', out: '-', status: 'Currently Inside' },
            { id: 6, name: 'Sunil Kumar', type: 'Staff', in: '10:00 AM', out: '-', status: 'Currently Inside' },
        ];
        setAttendanceLogs(logs);
    };

    const handleExport = () => {
        exportReportToCSV(attendanceLogs, 'daily_attendance_report');
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans staffdashboard-reports">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Daily Attendance Report</h1>
                    <p className="text-sm text-gray-500 mt-1">Detailed log of today's check-ins and attendance activity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExport} className="h-10 px-4 bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-md">
                        <Download size={16} />
                        Export Log
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {attendanceStats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all duration-300">
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ overflow: 'visible', zIndex: 10, position: 'relative' }}>
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="date"
                                className="saas-input pl-10 h-10 px-4 rounded-lg border-gray-200 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500"
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <CustomDropdown
                            options={[
                                { value: 'All', label: 'All Types' },
                                { value: 'Member', label: 'Members Only' },
                                { value: 'Staff', label: 'Staff Only' }
                            ]}
                            value={typeFilter}
                            onChange={setTypeFilter}
                            className="w-[180px]"
                        />
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="saas-input pl-10 h-10 w-full rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Check-In</th>
                                <th>Check-Out</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attendanceLogs
                                .filter(log => (typeFilter === 'All' || log.type === typeFilter) && log.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-all duration-200">
                                        <td data-label="Name">
                                            <p className="text-sm font-bold text-gray-800 tracking-tight">{log.name}</p>
                                        </td>
                                        <td data-label="Type">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${log.type === 'Member' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'
                                                }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td data-label="Check-In">
                                            <span className="text-xs font-semibold text-gray-600">{log.in}</span>
                                        </td>
                                        <td data-label="Check-Out">
                                            <span className="text-xs font-semibold text-gray-600">{log.out}</span>
                                        </td>
                                        <td data-label="Status" className="text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${log.status === 'Currently Inside' ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DailyAttendanceReport;
