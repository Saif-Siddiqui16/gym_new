import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreVertical, Clock, AlertCircle, CheckCircle2, Trash2, Edit, ChevronLeft, ChevronRight, X, User, ChevronDown, Check, Plus } from 'lucide-react';
import { getTasks, updateTaskStatus, deleteTask, updateTask, getAllStaff } from '../../api/manager/managerApi';
import '../../styles/GlobalDesign.css';
import CustomDropdown from '../../components/common/CustomDropdown';
import RightDrawer from '../../components/common/RightDrawer';
import MobileCard from '../../components/common/MobileCard';



const TaskList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editTaskData, setEditTaskData] = useState({
        title: '',
        assignedTo: '',
        priority: '',
        dueDate: '',
        status: ''
    });

    const [staffList, setStaffList] = useState([]);


    useEffect(() => {
        loadData();
        fetchStaff();
    }, [searchTerm, priorityFilter, statusFilter, currentPage]);

    const fetchStaff = async () => {
        try {
            const data = await getAllStaff();
            setStaffList(data.map(s => ({ label: s.name, value: s.id })));
        } catch (err) {
            console.error("Failed to load staff:", err);
        }
    };

    const loadData = async () => {
        setLoading(true);
        const filters = {
            search: searchTerm,
            priority: priorityFilter === 'All' ? '' : priorityFilter,
            status: statusFilter === 'All' ? '' : statusFilter
        };
        const result = await getTasks({ filters, page: currentPage, limit: itemsPerPage });
        setTasks(result.data);
        setTotalItems(result.total);
        setLoading(false);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
        await updateTaskStatus(id, nextStatus);
        loadData();
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await deleteTask(id);
            loadData();
        }
    };

    const handleEdit = (task) => {
        setSelectedTask(task);
        setEditTaskData({
            title: task.title,
            assignedToId: task.assignedToId,
            priority: task.priority,
            dueDate: task.dueDate,
            status: task.status
        });
        setIsEditDrawerOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        await updateTask(selectedTask.id, editTaskData);
        setIsEditDrawerOpen(false);
        loadData();
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'Low': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 shadow-sm">Low</span>;
            case 'Medium': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100 shadow-sm">Medium</span>;
            case 'High': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 shadow-sm">High</span>;
            default: return null;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full"><Clock size={14} /> Pending</span>;
            case 'In Progress': return <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100"><AlertCircle size={14} /> In Progress</span>;
            case 'Completed': return <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100"><CheckCircle2 size={14} /> Completed</span>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            {/* Premium Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <CheckCircle2 size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    Task List
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Manage and track staff tasks and responsibilities</p>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.href = window.location.pathname.includes('branchadmin') ? '/branchadmin/tasks/assign' : '/manager/tasks/assign'}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-violet-200 hover:shadow-violet-400/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Assign New Task
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-300">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white hover:bg-violet-50/20 transition-colors duration-300">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-violet-500 group-hover:scale-110 duration-300" size={18} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="pl-11 h-11 w-full rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm bg-white hover:border-slate-300 shadow-sm focus:shadow-lg"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <CustomDropdown
                            options={['All', 'Low', 'Medium', 'High']}
                            value={priorityFilter}
                            onChange={(val) => { setPriorityFilter(val); setCurrentPage(1); }}
                            placeholder="All Priorities"
                            icon={Filter}
                        />
                        <CustomDropdown
                            options={['All', 'Pending', 'In Progress', 'Completed']}
                            value={statusFilter}
                            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                            placeholder="All Status"
                            icon={Clock}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Cards (md:hidden) */}
            <div className="grid grid-cols-1 gap-4 md:hidden mt-6">
                {loading ? (
                    <div className="py-12 text-center bg-white rounded-2xl border border-slate-100 shadow-xl">
                        <div className="flex flex-col items-center gap-3 text-violet-600">
                            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-black uppercase tracking-widest">Loading...</span>
                        </div>
                    </div>
                ) : tasks.length > 0 ? (
                    tasks.map((task) => (
                        <MobileCard
                            key={task.id}
                            title={task.title}
                            subtitle={task.assignedTo}
                            badge={task.priority}
                            badgeColor={task.priority === 'High' ? 'rose' : task.priority === 'Medium' ? 'amber' : 'emerald'}
                            fields={[
                                { label: 'Due Date', value: task.dueDate, icon: Clock },
                                { label: 'Status', value: task.status }
                            ]}
                            actions={[
                                { label: 'Edit', icon: Edit, variant: 'primary', onClick: () => handleEdit(task) },
                                { label: 'Toggle Status', icon: CheckCircle2, variant: 'secondary', onClick: () => handleToggleStatus(task.id, task.status) }
                            ]}
                        />
                    ))
                ) : (
                    <div className="py-12 text-center bg-white rounded-2xl border border-slate-100 shadow-xl">
                        <p className="text-slate-500 font-bold">No tasks found</p>
                    </div>
                )}
            </div>

            <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-300 mt-8">
                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-b-2 border-violet-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Task Title</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Assigned To</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Priority</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Due Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider hover:text-purple-700 transition-colors duration-300 cursor-pointer">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-violet-600 uppercase tracking-wider text-right hover:text-purple-700 transition-colors duration-300 cursor-pointer">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center gap-3 text-violet-600">
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Loading tasks...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <tr key={task.id} className="group hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/30 transition-all duration-300">
                                        <td className="px-6 py-4" data-label="Task Title">
                                            <p className="text-sm font-bold text-gray-800 tracking-tight group-hover:text-violet-700 transition-colors duration-300">{task.title}</p>
                                        </td>
                                        <td className="px-6 py-4" data-label="Assigned To">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">{(task.assignedTo || '?').charAt(0)}</div>
                                                <p className="text-sm font-medium text-gray-600">{task.assignedTo}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Priority">
                                            {getPriorityBadge(task.priority)}
                                        </td>
                                        <td className="px-6 py-4" data-label="Due Date">
                                            <p className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md inline-block">{task.dueDate}</p>
                                        </td>
                                        <td className="px-6 py-4" data-label="Status">
                                            <button
                                                onClick={() => handleToggleStatus(task.id, task.status)}
                                                className="hover:scale-105 active:scale-95 transition-transform"
                                            >
                                                {getStatusBadge(task.status)}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right" data-label="Actions">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleEdit(task)}
                                                    className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all hover:scale-110 duration-300"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-gray-50 rounded-full">
                                                <Filter size={20} className="text-gray-300" />
                                            </div>
                                            <p>No tasks found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalItems > 0 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">
                            Showing <span className="text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-gray-900">{totalItems}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all hover:-translate-y-0.5"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all hover:-translate-y-0.5"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <RightDrawer
                isOpen={isEditDrawerOpen}
                onClose={() => setIsEditDrawerOpen(false)}
                title="Edit Task"
                subtitle={`Updating info for ${selectedTask?.title}`}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-4 w-full">
                        <button
                            type="button"
                            onClick={() => setIsEditDrawerOpen(false)}
                            className="flex-1 h-12 border-2 border-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 hover:border-slate-200 transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="edit-task-form"
                            className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-200 hover:shadow-violet-400/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Save Changes
                        </button>
                    </div>
                }
            >
                <form id="edit-task-form" onSubmit={handleEditSubmit} className="space-y-6 px-6 py-8">
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Task Title</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                className="saas-input w-full h-12 px-5 rounded-2xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm bg-slate-50/50 focus:bg-white transition-all duration-300 group-hover:border-slate-200"
                                value={editTaskData.title}
                                onChange={(e) => setEditTaskData({ ...editTaskData, title: e.target.value })}
                                placeholder="Enter task title..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned To</label>
                        <CustomDropdown
                            options={staffList}
                            value={editTaskData.assignedToId}
                            onChange={(val) => setEditTaskData({ ...editTaskData, assignedToId: val })}
                            className="w-full"
                            icon={User}
                            placeholder="Select Staff Member"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                            <CustomDropdown
                                options={['Low', 'Medium', 'High']}
                                value={editTaskData.priority}
                                onChange={(val) => setEditTaskData({ ...editTaskData, priority: val })}
                                className="w-full"
                                placeholder="Priority"
                            />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Due Date</label>
                            <input
                                required
                                type="date"
                                className="saas-input w-full h-[52px] px-5 rounded-2xl border-2 border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm bg-slate-50/50 focus:bg-white transition-all duration-300 group-hover:border-slate-200"
                                value={editTaskData.dueDate}
                                onChange={(e) => setEditTaskData({ ...editTaskData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
                        <CustomDropdown
                            options={['Pending', 'In Progress', 'Completed']}
                            value={editTaskData.status}
                            onChange={(val) => setEditTaskData({ ...editTaskData, status: val })}
                            className="w-full"
                            placeholder="Status"
                        />
                    </div>

                    <div className="bg-violet-50/50 rounded-2xl p-4 border border-violet-100/50 mt-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <AlertCircle size={16} className="text-violet-500" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold text-violet-700 uppercase tracking-wider">Quick Info</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Assigned staff will see this task instantly in their personal task dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </RightDrawer>
        </div>
    );
};

export default TaskList;
