import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    ChevronRight,
    Users,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowUpRight,
    Download,
    Eye
} from 'lucide-react';
import { getSessionHistory } from '../../api/trainer/trainerApi';
import { exportCSV } from '../../api/trainer/trainerExport';
import CustomDropdown from '../../components/common/CustomDropdown';

const SessionHistory = () => {
    const [showDetails, setShowDetails] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [timeFilter, setTimeFilter] = useState('Current Month');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        loadHistory();
    }, [searchTerm, timeFilter, currentPage]);

    const loadHistory = async () => {
        setLoading(true);
        const filters = {
            search: searchTerm,
            timeRange: timeFilter === 'All Time' ? '' : timeFilter
        };
        const result = await getSessionHistory({ filters, page: currentPage, limit: 10 });
        setHistory(result?.data || []);
        setTotalItems(result?.total || 0);
        setLoading(false);
    };

    const handleExport = async () => {
        const result = await getSessionHistory({ limit: 1000 });
        exportCSV(result?.data || [], 'Session_History_Report');
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Session History</h1>
                    <p className="text-gray-500 text-sm mt-1">Review past workouts and attendance records</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Download size={18} />
                    Export Reports
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:shadow-md transition-all duration-300 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <CustomDropdown
                        options={['All Time', 'Current Month', 'Last Month', 'Custom Range']}
                        value={timeFilter}
                        onChange={setTimeFilter}
                        className="w-full md:w-48"
                    />
                    <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 hover:scale-105 hover:shadow-md transition-all duration-200">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Session List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading history...</p>
                    </div>
                ) : history.length > 0 ? (
                    <>
                        {/* Desktop view */}
                        <div className="hidden lg:block">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Session Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map((session) => (
                                        <tr key={session.id} className="hover:bg-blue-50/30 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer hover:shadow-md">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                                                        <Calendar size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase">{session.workout}</p>
                                                        <p className="text-xs text-gray-500">{session.date} • {session.time}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${session.type === 'Personal Training' || session.type === 'One-on-One' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {session.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={14} className="text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-700">{session.total} Total</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                        <span className="text-sm font-medium text-gray-700">{session.present} Present</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setShowDetails(session)}
                                                    className="inline-flex items-center gap-2 px-4 py-1.5 text-blue-600 hover:bg-blue-50 hover:scale-105 hover:shadow-md rounded-lg text-sm font-bold transition-all duration-200"
                                                >
                                                    <Eye size={16} />
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile view */}
                        <div className="lg:hidden divide-y divide-gray-100">
                            {history.map((session) => (
                                <div key={session.id} className="p-4 flex flex-col gap-4 active:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                                                <Calendar size={22} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{session.workout}</p>
                                                <p className="text-xs text-gray-500">{session.date} • {session.time}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight ${session.type === 'Personal Training' || session.type === 'One-on-One' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {session.type === 'Personal Training' || session.type === 'One-on-One' ? 'PT' : 'Group'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Total</p>
                                            <p className="text-sm font-bold text-gray-900">{session.total}</p>
                                        </div>
                                        <div className="text-center border-x border-gray-200">
                                            <p className="text-[10px] text-green-600 font-bold uppercase">Present</p>
                                            <p className="text-sm font-bold text-green-700">{session.present}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-red-500 font-bold uppercase">Absent</p>
                                            <p className="text-sm font-bold text-red-600">{session.total - session.present}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowDetails(session)}
                                        className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
                                    >
                                        <Eye size={16} />
                                        View Breakdown
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center p-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 animate-pulse">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No History Found</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs">There are no session records for the selected filters.</p>
                    </div>
                )}
            </div>

            {/* Details Overlay (Modal) */}
            {showDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowDetails(null)}></div>
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{showDetails.workout}</h3>
                                    <p className="text-gray-500 text-sm">{showDetails.date} • {showDetails.time}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetails(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <XCircle className="text-gray-400" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Member Attendance Breakdown</h4>
                            <div className="space-y-3">
                                {[
                                    { name: 'Alex Thompson', status: 'present' },
                                    { name: 'Sarah Jenkins', status: 'absent' },
                                    { name: 'Michael Chen', status: 'present' },
                                    { name: 'Emma Wilson', status: 'present' },
                                ].map((m, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                {(m.name || '?').charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{m.name}</span>
                                        </div>
                                        {m.status === 'present' ? (
                                            <div className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase">
                                                <CheckCircle2 size={14} /> Present
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-red-500 font-bold text-xs uppercase">
                                                <XCircle size={14} /> Absent
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl transition-colors" onClick={() => setShowDetails(null)}>
                                Close
                            </button>
                            <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all">
                                Edit Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionHistory;
