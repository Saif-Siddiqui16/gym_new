import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Filter, CheckSquare, Clock, AlertCircle, CheckCircle2, LayoutGrid, List, Box, MoreHorizontal, Loader2 } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import CreateTaskDrawer from './CreateTaskDrawer';
import { getAllTasks, getTaskStats, updateTaskStatus } from '../../api/staff/taskApi';

const MyTasks = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksData, statsData] = await Promise.all([
                getAllTasks({ status: statusFilter, search: searchTerm }),
                getTaskStats()
            ]);
            setTasks(tasksData);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [statusFilter, searchTerm]);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleCreateSuccess = () => {
        fetchData();
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);
            fetchData();
        } catch (error) {
            alert(error);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-amber-500';
            case 'In Progress': return 'text-indigo-500';
            case 'Completed': return 'text-emerald-500';
            case 'Overdue': return 'text-rose-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-0 sm:p-8 space-y-8 animate-fadeIn text-slate-900 font-sans">
            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 text-white cursor-pointer hover:scale-105 transition-transform">
                        <ClipboardList size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Task Management</h1>
                        <p className="text-slate-500 text-xs md:text-sm font-medium">Manage and track your operational responsibilities</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl md:rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                >
                    <Plus size={16} /> New Task
                </button>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                {[
                    { label: 'Total Tasks', value: stats.total, color: 'text-slate-900', bg: 'bg-slate-50' },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'In Progress', value: stats.inProgress, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Completed', value: stats.completed, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Overdue', value: stats.overdue, color: 'text-rose-500', bg: 'bg-rose-50' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-9 shadow-sm border border-slate-100 flex flex-col items-center justify-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-4">{item.label}</p>
                        <h2 className={`text-3xl md:text-5xl font-black ${item.color}`}>{item.value}</h2>
                    </div>
                ))}
            </div>

            {/* All Tasks Section */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Section Header */}
                <div className="p-4 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">All Tasks</h3>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:min-w-[200px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat shadow-inner"
                            >
                                <option>All</option>
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                                <option>Overdue</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Headers */}
                <div className="hidden md:grid px-8 py-6 border-b border-slate-50 grid grid-cols-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/30">
                    <span>Task</span>
                    <span>Priority</span>
                    <span>Assigned To</span>
                    <span>Due Date</span>
                    <span>Status</span>
                    <span className="text-right">Actions</span>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center h-full p-20 text-center">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center text-slate-200 mx-auto shadow-inner">
                                <CheckSquare size={36} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-slate-400 text-sm font-black uppercase tracking-widest mt-4">No tasks found</h4>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {tasks.map((task) => (
                                <div key={task.id} className="grid grid-cols-1 md:grid-cols-6 px-8 py-6 items-center hover:bg-slate-50 transition-colors gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-black text-slate-900 truncate">{task.title}</span>
                                        <span className="text-[11px] text-slate-400 truncate">{task.description}</span>
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-600 uppercase">{task.priority}</div>
                                    <div className="text-[11px] font-bold text-slate-600">{task.assignedTo || 'Unassigned'}</div>
                                    <div className="text-[11px] font-bold text-slate-600">{task.due ? new Date(task.due).toLocaleDateString() : 'N/A'}</div>
                                    <div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${task.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <div className="text-right flex justify-end gap-2 text-slate-300 relative">
                                        {task.status !== 'Completed' ? (
                                            <button onClick={() => handleStatusUpdate(task.id, 'Completed')} className="p-2 hover:bg-emerald-50 hover:text-emerald-500 rounded-xl transition-all" title="Mark as Completed">
                                                <CheckCircle2 size={18} />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleStatusUpdate(task.id, 'Pending')} className="p-2 hover:bg-amber-50 hover:text-amber-500 rounded-xl transition-all" title="Mark as Pending">
                                                <Clock size={18} />
                                            </button>
                                        )}
                                        <div className="relative group/menu">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === task.id ? null : task.id);
                                                }}
                                                className={`p-2 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all ${openMenuId === task.id ? 'bg-slate-100 text-slate-600' : ''}`}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {openMenuId === task.id && (
                                                <div className="absolute right-0 bottom-full mb-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in zoom-in-95 duration-200">
                                                    <div className="p-2">
                                                        <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Set Status</p>
                                                        {['Pending', 'In Progress', 'Completed'].map((status) => (
                                                            <button
                                                                key={status}
                                                                onClick={() => {
                                                                    handleStatusUpdate(task.id, status);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${task.status === status ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'Completed' ? 'bg-emerald-500' :
                                                                    status === 'In Progress' ? 'bg-indigo-500' : 'bg-amber-500'
                                                                    }`} />
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateTaskDrawer
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default MyTasks;
