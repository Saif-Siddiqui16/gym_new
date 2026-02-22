import React, { useState, useEffect } from 'react';
import { LayoutGrid, ClipboardList, Activity, CheckCircle, Search, Filter, Clock } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { getAllTasks } from '../../api/staff/taskApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const TaskStatus = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: 'Total Tasks', value: '0', icon: ClipboardList, bg: 'bg-indigo-50', color: 'text-indigo-600' },
        { label: 'Pending', value: '0', icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-600' },
        { label: 'In Progress', value: '0', icon: Activity, bg: 'bg-blue-50', color: 'text-blue-600' },
        { label: 'Completed', value: '0', icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
    ]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadTasks();
        setCurrentPage(1); // Reset to page 1 on filter
    }, [statusFilter, searchTerm]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            // First fetch all to update stats correctly
            const allData = await getAllTasks();
            updateStats(allData);

            // Then fetch filtered data for the table
            const data = await getAllTasks({
                status: statusFilter,
                search: searchTerm
            });
            setTasks(data);
        } catch (error) {
            console.error("Failed to load tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (allData) => {
        setStats([
            { label: 'Total Tasks', value: allData.length.toString(), icon: ClipboardList, bg: 'bg-indigo-50', color: 'text-indigo-600' },
            { label: 'Pending', value: allData.filter(t => t.status === 'Pending').length.toString(), icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-600' },
            { label: 'In Progress', value: allData.filter(t => t.status === 'In Progress').length.toString(), icon: Activity, bg: 'bg-blue-50', color: 'text-blue-600' },
            { label: 'Completed', value: allData.filter(t => t.status === 'Completed').length.toString(), icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
        ]);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-green-100 text-green-700 uppercase">Completed</span>;
            case 'In Progress': return <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-blue-100 text-blue-700 uppercase">In Progress</span>;
            case 'Pending': return <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-yellow-100 text-yellow-700 uppercase">Pending</span>;
            default: return null;
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(tasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTasks = tasks.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans staffdashboard-taskstatus">
            <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Task Status Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Track real-time progress of all operational duties.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 staffdashboard-taskstatus-card active:scale-[0.98] cursor-pointer group">
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight group-hover:scale-110 transition-transform">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Filter size={18} className="text-indigo-600" />
                        <CustomDropdown
                            options={[
                                { value: 'All', label: 'All Status' },
                                { value: 'Pending', label: 'Pending' },
                                { value: 'In Progress', label: 'In Progress' },
                                { value: 'Completed', label: 'Completed' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="w-[180px]"
                        />
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="saas-input pl-10 h-10 w-full rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:shadow-md transition-all duration-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Task Title</th>
                                <th>Assigned By</th>
                                <th className="text-center">Status</th>
                                <th className="text-right">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 text-indigo-600">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Crunching data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedTasks.length > 0 ? (
                                paginatedTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-indigo-50/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group hover:shadow-md">
                                        <td data-label="Task Title">
                                            <p className="text-sm font-bold text-gray-800 tracking-tight group-hover:text-indigo-600 transition-colors">{task.title}</p>
                                        </td>
                                        <td data-label="Assigned By">
                                            <p className="text-xs font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">{task.assignedBy}</p>
                                        </td>
                                        <td data-label="Status" className="text-center">
                                            {getStatusBadge(task.status)}
                                        </td>
                                        <td data-label="Last Updated" className="text-right">
                                            <span className="text-xs font-bold text-gray-400 italic font-mono uppercase group-hover:text-gray-600 transition-colors">{task.updated}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        No tasks found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2">
                <p>Showing {tasks.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, tasks.length)} of {tasks.length} tasks</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 border rounded transition-colors ${currentPage === page ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 hover:bg-white'}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskStatus;
