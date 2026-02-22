import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, AlertCircle, CheckCircle2, User, Search, Filter } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { getMyTasks, updateTaskStatus } from '../../api/staff/taskApi';
import CustomDropdown from '../../components/common/CustomDropdown';

const MyTasks = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadTasks();
        setCurrentPage(1); // Reset to page 1 on filter change
    }, [statusFilter, searchTerm]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const data = await getMyTasks({
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

    const handleMarkComplete = async (taskId) => {
        await updateTaskStatus(taskId, 'Completed');
        loadTasks(); // Reload to reflect status change
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'High': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">HIGH</span>;
            case 'Medium': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-700 border border-yellow-200">MEDIUM</span>;
            case 'Low': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 border border-green-200">LOW</span>;
            default: return null;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 uppercase">Completed</span>;
            case 'In Progress': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 uppercase">In Progress</span>;
            case 'Pending': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-600 uppercase">Pending</span>;
            default: return null;
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(tasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTasks = tasks.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans staffdashboard-mytasks">
            <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Tasks</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and track your daily operational responsibilities.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header / Search */}
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find a task..."
                            className="saas-input pl-10 h-11 w-full rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter size={18} className="text-indigo-500" />
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
                </div>

                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead>
                            <tr>
                                <th>Task Details</th>
                                <th>Assigned By</th>
                                <th className="text-center">Priority</th>
                                <th>Due Date</th>
                                <th className="text-center">Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 text-indigo-600">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Loading tasks...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedTasks.length > 0 ? (
                                paginatedTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50 transition-all duration-200 group">
                                        <td data-label="Task Details">
                                            <p className="text-sm font-bold text-gray-800 tracking-tight group-hover:text-indigo-600 transition-colors">{task.title}</p>
                                        </td>
                                        <td data-label="Assigned By">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" />
                                                <span className="text-xs font-semibold text-gray-600">{task.assignedBy}</span>
                                            </div>
                                        </td>
                                        <td data-label="Priority" className="text-center">
                                            {getPriorityBadge(task.priority)}
                                        </td>
                                        <td data-label="Due Date">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                <Clock size={14} className="text-gray-400" />
                                                {task.due}
                                            </div>
                                        </td>
                                        <td data-label="Status" className="text-center">
                                            {getStatusBadge(task.status)}
                                        </td>
                                        <td data-label="Actions" className="text-right">
                                            {task.status !== 'Completed' && (
                                                <button
                                                    onClick={() => handleMarkComplete(task.id)}
                                                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg shadow-sm transition-all active:scale-95"
                                                    title="Mark Complete">
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        No tasks found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination UI */}
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

export default MyTasks;
