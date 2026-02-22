import React, { useState, useEffect } from 'react';
import { LayoutGrid, ClipboardList, Activity, CheckCircle, Search, Filter, Clock, AlertCircle } from 'lucide-react';
import { getTasks, getTaskStats } from '../../api/manager/managerApi';
import '../../styles/GlobalDesign.css';

const TaskStatus = () => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadData();
    }, [statusFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const filters = {
                status: statusFilter === 'All' ? '' : statusFilter
            };
            const [taskData, statData] = await Promise.all([
                getTasks({ filters, limit: 10 }),
                getTaskStats()
            ]);

            setTasks(taskData?.data || []);

            if (statData) {
                setStats([
                    { label: 'Total Tasks', value: (statData.total || 0).toString(), icon: ClipboardList, bg: 'bg-indigo-50', color: 'text-indigo-600' },
                    { label: 'Pending', value: (statData.pending || 0).toString(), icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-600' },
                    { label: 'In Progress', value: (statData.inProgress || 0).toString(), icon: Activity, bg: 'bg-blue-50', color: 'text-blue-600' },
                    { label: 'Completed', value: (statData.completed || 0).toString(), icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
                ]);
            }
        } catch (error) {
            console.error("Failed to load task status data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-100 italic">Pending</span>;
            case 'In Progress': return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1 w-fit"><Activity size={10} /> In Progress</span>;
            case 'Completed': return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100 flex items-center gap-1 w-fit"><CheckCircle size={10} /> Completed</span>;
            default: return null;
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans managerdashboard-taskstatus">
            <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Task Status</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time monitoring of team productivity and task completion.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-indigo-100">
                        {/* Decorative Blob */}
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-8 -mt-8 opacity-20 group-hover:scale-150 transition-transform duration-500 blur-2xl`}></div>

                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                            <stat.icon size={24} strokeWidth={2.5} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900 leading-tight tracking-tight mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        <Activity size={16} className="text-indigo-500" />
                        Live Status
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`saas-btn p-2 border rounded-lg transition-all ${showFilters ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100 text-indigo-600' : 'saas-btn-secondary text-gray-500 border-gray-200'}`}
                        >
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-4 animate-slide-down">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter Status:</label>
                        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                            {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === status ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Task Title</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned To</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 text-indigo-600">
                                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Synchronizing...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-indigo-50/60 transition-colors duration-200 group cursor-pointer">
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-gray-800 tracking-tight group-hover:text-indigo-700 transition-colors">{task.title}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    {(task.assignedTo || '?').charAt(0)}
                                                </div>
                                                <p className="text-xs font-bold text-gray-600 group-hover:text-indigo-600 transition-colors">{task.assignedTo}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getStatusBadge(task.status)}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <p className="text-[11px] font-semibold text-gray-400 leading-tight italic bg-gray-50 px-2 py-1 rounded-lg inline-block group-hover:bg-white transition-colors">{task.dueDate || 'Recent'}</p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400 text-xs font-medium italic">
                                        No active tasks matching selected status.
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

export default TaskStatus;
