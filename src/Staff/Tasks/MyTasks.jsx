import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Filter, CheckSquare, Clock, AlertCircle, CheckCircle2, LayoutGrid, List, Box, MoreHorizontal, Loader2, Eye, Trash2, X, Activity } from 'lucide-react';
import CreateTaskDrawer from './CreateTaskDrawer';
import { toast } from 'react-hot-toast';
import { getAllTasks, getTaskStats, updateTaskStatus, deleteTask } from '../../api/staff/taskApi';
import RightDrawer from '../../components/common/RightDrawer';

const MyTasks = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
    });
    const [selectedTask, setSelectedTask] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

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

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);
            fetchData();
        } catch (error) {
            toast.error(error?.message || 'Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await deleteTask(taskId);
            toast.success('Task deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error?.message || 'Failed to delete task');
        }
    };

    const handleViewTask = (task) => {
        setSelectedTask(task);
        setIsViewOpen(true);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-rose-600 bg-rose-50 border-rose-100 shadow-sm';
            case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100 shadow-sm';
            case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-sm';
            default: return 'text-slate-600 bg-slate-50 border-slate-100 shadow-sm';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'text-violet-600 bg-violet-50 border-violet-100';
            case 'Completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'In Progress': return 'text-primary bg-primary-light border-primary/10';
            case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Overdue': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="min-h-screen space-y-8 animate-fadeIn text-slate-900 font-sans">
            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 text-white cursor-pointer hover:scale-105 transition-transform">
                        <ClipboardList size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Task Management</h1>
                        <p className="text-slate-500 text-xs md:text-sm font-medium">Manage and track your operational responsibilities</p>
                    </div>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: 'Total Tasks', value: stats.total, color: 'text-slate-900', bg: 'bg-slate-50', icon: List },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock },
                    { label: 'In Progress', value: stats.inProgress, color: 'text-primary', bg: 'bg-primary-light', icon: Activity },
                    { label: 'Completed', value: stats.completed, color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 },
                    { label: 'Overdue', value: stats.overdue, color: 'text-rose-500', bg: 'bg-rose-50', icon: AlertCircle }
                ].map((item, idx) => (
                    <div key={idx} className="relative bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        {/* Decorative Background Element */}
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 duration-500 ${item.bg}`} />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100/50 ${item.bg} ${item.color}`}>
                                <item.icon size={22} className={item.label === 'In Progress' ? 'animate-pulse' : ''} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5">{item.label}</p>
                            <h2 className={`text-4xl font-black ${item.color}`}>{item.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* All Tasks Section */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Section Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-primary rounded-full" />
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">All Tasks</h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full sm:min-w-[300px] group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search by task title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-11 pr-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all shadow-sm group-hover:border-slate-300"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative w-full sm:min-w-[160px]">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-2x border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all flex items-center appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat shadow-sm"
                            >
                                <option>All Status</option>
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
                    <span>Assigned By</span>
                    <span>Due Date</span>
                    <span>Status</span>
                    <span className="text-right">Actions</span>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center h-full p-20 text-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
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
                                <div key={task.id} className="grid grid-cols-1 md:grid-cols-6 px-8 py-6 items-center hover:bg-slate-50/80 transition-all gap-4 group/row">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[13px] font-black text-slate-900 group-hover/row:text-primary transition-colors truncate">{task.title}</span>
                                        <span className="text-[11px] text-slate-400 line-clamp-1 group-hover/row:text-slate-500 transition-colors uppercase tracking-tight">{task.description || 'No description'}</span>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                                            {task.priority || 'Medium'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-violet-50 rounded-full flex items-center justify-center text-[10px] font-black text-violet-600 border border-violet-100">
                                            {(task.assignedBy || 'A').charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned By</span>
                                            <span className="text-[11px] font-bold text-slate-600">{task.assignedBy || 'Admin'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock size={12} className="text-slate-300" />
                                        <span className="text-[11px] font-bold">{task.due ? new Date(task.due).toLocaleDateString() : 'No date'}</span>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${getStatusColor(task.status)}`}>
                                            <div className="w-1 h-1 rounded-full bg-current" />
                                            {task.status}
                                        </span>
                                        {task.delegationNote && (
                                            <div className="mt-1 flex items-center gap-1 text-[8px] text-primary font-bold uppercase tracking-tighter">
                                                <AlertCircle size={8} /> Delegated Task
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right flex justify-end gap-2 text-slate-300 relative">
                                        {task.status !== 'Completed' ? (
                                            <button onClick={() => handleStatusUpdate(task.id, 'Completed')} className="p-2 hover:bg-emerald-50 hover:text-emerald-500 rounded-xl transition-all" title="Mark as Completed">
                                                <CheckCircle2 size={18} />
                                            </button>
                                        ) : (
                                            <div className="flex gap-1">
                                                <button onClick={() => handleStatusUpdate(task.id, 'Pending')} className="p-2 hover:bg-amber-50 hover:text-amber-500 rounded-xl transition-all" title="Mark as Pending">
                                                    <Clock size={18} />
                                                </button>
                                                <button onClick={() => handleViewTask(task)} className="p-2 hover:bg-primary-light hover:text-primary rounded-xl transition-all" title="View Details">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteTask(task.id)} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all" title="Delete Task">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
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
                                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${task.status === status ? 'bg-primary-light text-primary' : 'text-slate-600 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'Completed' ? 'bg-emerald-500' :
                                                                    status === 'In Progress' ? 'bg-primary' : 'bg-amber-500'
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

            {/* View Task Details Drawer */}
            <RightDrawer
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Task Details"
            >
                {selectedTask && (
                    <div className="p-8 space-y-10">
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black text-slate-900">{selectedTask.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                        Status: <span className={`px-2 py-0.5 rounded-full ${getStatusColor(selectedTask.status).replace('text-', 'bg-').replace('500', '50')}`}>
                                            {selectedTask.status}
                                        </span>
                                    </p>
                                </div>
                                <div className={`px-4 py-1.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest ${getPriorityColor(selectedTask.priority)}`}>
                                    {selectedTask.priority} Priority
                                </div>
                            </div>

                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                                "{selectedTask.description || 'No description provided.'}"
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                    <p className="text-xs font-bold text-slate-700">{selectedTask.due ? new Date(selectedTask.due).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned By</p>
                                    <p className="text-xs font-bold text-slate-700">{selectedTask.assignedBy || 'Admin'}</p>
                                </div>
                            </div>

                            {selectedTask.delegationNote && (
                                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <AlertCircle size={10} /> Delegation Note
                                    </p>
                                    <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                                        "{selectedTask.delegationNote}"
                                    </p>
                                    {selectedTask.overallDueDate && (
                                        <div className="mt-4 pt-4 border-t border-primary/10 text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                            Parent Task Deadline: {new Date(selectedTask.overallDueDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-100">
                                <button
                                    onClick={() => {
                                        let nextStatus = 'Pending';
                                        if (selectedTask.status === 'Completed') nextStatus = 'Pending';
                                        else nextStatus = 'Completed';
                                        handleStatusUpdate(selectedTask.id, nextStatus);
                                        setIsViewOpen(false);
                                    }}
                                    className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedTask.status === 'Completed' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        }`}
                                >
                                    {selectedTask.status === 'Completed' ? 'Move to Pending' : 'Mark as Completed'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default MyTasks;
