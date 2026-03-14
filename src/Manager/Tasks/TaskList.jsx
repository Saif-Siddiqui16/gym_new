import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ListTodo, Clock, Loader2, AlertCircle, CheckCircle2, CheckCircle, Activity, Filter, Building2, FileText, UserPlus, Calendar, Eye, Trash2 } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import CustomDropdown from '../../components/common/CustomDropdown';
import { useBranchContext } from '../../context/BranchContext';
import { getAllStaff, createTask, getTasks, getTaskStats, deleteTask, updateTask, delegateTask } from '../../api/manager/managerApi';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

const TaskList = () => {
    const navigate = useNavigate();
    const { branches, loadingBranches, selectedBranch } = useBranchContext();
    console.log('TaskList branches from context:', branches);
    console.log('TaskList loading state:', loadingBranches);
    console.log('TaskList selected branch:', selectedBranch);
    const [activeTab, setActiveTab] = useState('All');
    const [isNewTaskDrawerOpen, setIsNewTaskDrawerOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
    });
    const [staffList, setStaffList] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    const [formData, setFormData] = useState({
        branch: '',
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        assignTo: ''
    });

    const [isDelegateDrawerOpen, setIsDelegateDrawerOpen] = useState(false);
    const [delegatingTask, setDelegatingTask] = useState(null);
    const [delegationData, setDelegationData] = useState({
        staffId: '',
        note: '',
        deadline: ''
    });

    useEffect(() => {
        fetchData();
    }, [selectedBranch]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tasksRes, statsRes] = await Promise.all([
                getTasks({ limit: 100 }),
                getTaskStats()
            ]);
            setTasks(tasksRes.data || []);
            if (statsRes) {
                setStats({
                    total: statsRes.total || 0,
                    pending: statsRes.pending || 0,
                    inProgress: statsRes.inProgress || 0,
                    completed: statsRes.completed || 0,
                    overdue: statsRes.overdue || 0
                });
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    // Fetch staff when branch changes
    useEffect(() => {
        if (formData.branch) {
            fetchStaff(formData.branch);
        } else {
            setStaffList([]);
        }
    }, [formData.branch]);

    const fetchStaff = async (branchId) => {
        setLoadingStaff(true);
        try {
            const data = await getAllStaff(branchId);
            const formatted = data.map(s => ({
                label: `${s.name} (${s.role})`,
                value: s.id.toString()
            }));
            setStaffList(formatted);
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error('Failed to load staff for this branch');
        } finally {
            setLoadingStaff(false);
        }
    };

    const branchOptions = branches.map(b => ({
        label: b.branchName || b.name,
        value: (b.id || b._id).toString()
    }));
    console.log('computed branchOptions:', branchOptions);

    const priorityOptions = ['Low', 'Medium', 'High'];

    const handleNewTask = () => {
        setEditingTaskId(null);
        setIsReadOnly(false);
        setFormData({
            branch: '',
            title: '',
            description: '',
            priority: 'Medium',
            dueDate: '',
            assignTo: ''
        });
        setIsNewTaskDrawerOpen(true);
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await updateTask(taskId, { status: newStatus });
            toast.success(`Task marked as ${newStatus}`);
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleEditTask = (task) => {
        setEditingTaskId(task.id);
        setIsReadOnly(false);
        const branchString = task.tenantId ? task.tenantId.toString() : '';
        setFormData({
            branch: branchString,
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            dueDate: task.dueDate !== 'N/A' ? task.dueDate : '',
            assignTo: task.assignedToId ? task.assignedToId.toString() : ''
        });
        setIsNewTaskDrawerOpen(true);
    };

    const handleViewTask = (task) => {
        setEditingTaskId(task.id);
        setIsReadOnly(true);
        const branchString = task.tenantId ? task.tenantId.toString() : '';
        setFormData({
            branch: branchString,
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            dueDate: task.dueDate !== 'N/A' ? task.dueDate : '',
            assignTo: task.assignedToId ? task.assignedToId.toString() : ''
        });
        setIsNewTaskDrawerOpen(true);
    };

    const handleDelegateClick = (task) => {
        setDelegatingTask(task);
        setDelegationData({
            staffId: '',
            note: '',
            deadline: task.dueDate
        });
        if (task.tenantId) {
            fetchStaff(task.tenantId);
        }
        setIsDelegateDrawerOpen(true);
    };

    const handleDelegateSubmit = async (e) => {
        e.preventDefault();
        try {
            await delegateTask(delegatingTask.id, {
                staffId: delegationData.staffId,
                delegationNote: delegationData.note,
                staffDeadline: delegationData.deadline
            });
            toast.success('Task delegated successfully');
            setIsDelegateDrawerOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error delegating task:', error);
            toast.error(error.response?.data?.message || 'Failed to delegate task');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const taskPayload = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                dueDate: formData.dueDate,
                assignedToId: formData.assignTo,
                tenantId: formData.branch
            };

            if (editingTaskId) {
                await updateTask(editingTaskId, taskPayload);
                toast.success('Task updated successfully');
            } else {
                await createTask(taskPayload);
                toast.success('Task created successfully');
            }

            setIsNewTaskDrawerOpen(false);
            setEditingTaskId(null);
            setFormData({
                branch: '',
                title: '',
                description: '',
                priority: 'Medium',
                dueDate: '',
                assignTo: ''
            });
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error(error.response?.data?.message || 'Failed to create task');
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-primary-light/30 min-h-screen font-sans pb-24 text-slate-800">
            {/* Header section matching exact text */}
            <div className="max-w-full mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">
                            Task Management
                        </h1>
                    </div>
                    <Button
                        onClick={handleNewTask}
                        variant="primary"
                        className="px-8 h-12 rounded-2xl shadow-xl shadow-violet-200 font-bold"
                        icon={Plus}
                    >
                        New Task
                    </Button>
                </div>
            </div>

            {/* Stats Cards Exact text */}
            <div className="max-w-full mx-auto mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                        { label: 'Total Tasks', value: stats.total.toString(), color: 'indigo', icon: ListTodo },
                        { label: 'Pending', value: stats.pending.toString(), color: 'amber', icon: Clock },
                        { label: 'In Progress', value: stats.inProgress.toString(), color: 'blue', icon: Loader2 },
                        { label: 'Completed', value: stats.completed.toString(), color: 'emerald', icon: CheckCircle2 },
                        { label: 'Overdue', value: stats.overdue.toString(), color: 'rose', icon: AlertCircle },
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 bg-${card.color}-50 text-${card.color}-600 rounded-xl flex items-center justify-center`}>
                                <card.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                                <h3 className="text-2xl font-black text-slate-800">{card.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section: All Tasks */}
            <div className="max-w-full mx-auto">
                <div className="flex flex-col mb-6">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">All Tasks</h2>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-slate-100">
                    {['All'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white/60 backdrop-blur-md rounded-[32px] shadow-sm border border-white/50 overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Task</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Priority</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Assigned To</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Due Date</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <Loader2 className="animate-spin mx-auto text-primary" size={40} />
                                        </td>
                                    </tr>
                                ) : tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <tr key={task.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5 font-bold text-slate-700">{task.title}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                                                    task.priority === 'Medium' ? 'bg-primary-light text-primary' :
                                                        'bg-slate-50 text-slate-600'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-slate-600 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-violet-100 text-primary flex items-center justify-center text-[10px] font-black uppercase">
                                                    {task.assignedTo?.substring(0, 2)}
                                                </div>
                                                {task.assignedTo}
                                            </td>
                                            <td className="px-8 py-5 text-slate-500 font-medium">
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                    task.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                                                    task.status === 'Approved' ? 'bg-violet-50 text-violet-600' :
                                                    'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right flex items-center justify-end gap-2 text-slate-300">
                                                {task.status === 'Completed' && (
                                                    <div className="flex gap-1 animate-fadeIn">
                                                        <button
                                                            onClick={() => handleUpdateStatus(task.id, 'Approved')}
                                                            className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                                                            title="Approve Task"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                                                            className="p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                                                            title="Send for Revision"
                                                        >
                                                            <Activity size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handleDelegateClick(task)}
                                                    className="p-2 hover:bg-violet-50 text-slate-400 hover:text-primary rounded-lg transition-colors"
                                                    title="Delegate to Staff"
                                                >
                                                    <UserPlus size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleViewTask(task)}
                                                    className="p-2 hover:bg-primary-light text-slate-400 hover:text-primary rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditTask(task)}
                                                    className="p-2 hover:bg-primary-light text-slate-400 hover:text-primary rounded-lg transition-colors"
                                                    title="Edit Task"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                                    title="Delete Task"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Filter size={32} />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-800">No tasks found</h3>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create New Task Drawer */}
            <RightDrawer
                isOpen={isNewTaskDrawerOpen}
                onClose={() => setIsNewTaskDrawerOpen(false)}
                title={isReadOnly ? "Task Details" : (editingTaskId ? "Edit Task" : "Create New Task")}
                subtitle={isReadOnly ? "Detailed overview of the selected task" : "Add a new task and assign it to team members"}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-4 w-full px-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsNewTaskDrawerOpen(false)}
                            className={`flex-1 h-12 rounded-2xl ${isReadOnly ? 'w-full' : ''}`}
                        >
                            {isReadOnly ? 'Close' : 'Cancel'}
                        </Button>
                        {!isReadOnly && (
                            <Button
                                type="submit"
                                form="create-task-form"
                                variant="primary"
                                className="flex-1 h-12 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform active:scale-95"
                            >
                                {editingTaskId ? "Save Changes" : "Create Task"}
                            </Button>
                        )}
                    </div>
                }
            >
                <form id="create-task-form" onSubmit={handleCreateTask} className="space-y-6 px-6 py-8">
                    {/* Branch */}
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Building2 size={14} className="text-primary" />
                            Branch *
                        </label>
                        <CustomDropdown
                            options={branchOptions}
                            value={formData.branch}
                            disabled={isReadOnly}
                            onChange={(val) => setFormData({ ...formData, branch: val })}
                            placeholder="Select branch"
                            className="w-full"
                        />
                    </div>

                    {/* Task Title */}
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <FileText size={14} className="text-primary" />
                            Title *
                        </label>
                        <input
                            required
                            type="text"
                            disabled={isReadOnly}
                            placeholder="Task title"
                            className={`saas-input w-full h-12 px-5 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm bg-slate-50/50 focus:bg-white transition-all duration-300 group-hover:border-slate-200 ${isReadOnly ? 'cursor-default' : ''}`}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <AlertCircle size={14} className="text-primary" />
                            Description
                        </label>
                        <textarea
                            disabled={isReadOnly}
                            placeholder="Task description..."
                            rows="4"
                            className={`saas-input w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm bg-slate-50/50 focus:bg-white transition-all duration-300 group-hover:border-slate-200 resize-none ${isReadOnly ? 'cursor-default' : ''}`}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Priority */}
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Filter size={14} className="text-primary" />
                                Priority
                            </label>
                            <CustomDropdown
                                options={priorityOptions}
                                value={formData.priority}
                                disabled={isReadOnly}
                                onChange={(val) => setFormData({ ...formData, priority: val })}
                                className="w-full"
                            />
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-primary" />
                                Due Date
                            </label>
                            <input
                                required
                                type="date"
                                disabled={isReadOnly}
                                className={`saas-input w-full h-[52px] px-5 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm bg-slate-50/50 focus:bg-white transition-all duration-300 group-hover:border-slate-200 ${isReadOnly ? 'cursor-default' : ''}`}
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Assign To */}
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <UserPlus size={14} className="text-primary" />
                            Assign To
                        </label>
                        <CustomDropdown
                            options={staffList}
                            value={formData.assignTo}
                            loading={loadingStaff}
                            disabled={isReadOnly}
                            onChange={(val) => setFormData({ ...formData, assignTo: val })}
                            placeholder="Select user (optional)"
                            className="w-full"
                        />
                    </div>
                </form>
            </RightDrawer>

            {/* Delegate Task Drawer */}
            <RightDrawer
                isOpen={isDelegateDrawerOpen}
                onClose={() => setIsDelegateDrawerOpen(false)}
                title="Delegate Task"
                subtitle="Assign this task to a staff member for execution"
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-4 w-full px-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDelegateDrawerOpen(false)}
                            className="flex-1 h-12 rounded-2xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="delegate-task-form"
                            variant="primary"
                            className="flex-1 h-12 rounded-2xl shadow-lg shadow-primary/20"
                        >
                            Assign to Staff
                        </Button>
                    </div>
                }
            >
                <form id="delegate-task-form" onSubmit={handleDelegateSubmit} className="space-y-6 px-6 py-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Task Details</p>
                        <h4 className="font-bold text-slate-800">{delegatingTask?.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{delegatingTask?.description}</p>
                    </div>

                    {/* Staff Selection */}
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <UserPlus size={14} className="text-primary" />
                            Select Staff *
                        </label>
                        <CustomDropdown
                            options={staffList}
                            value={delegationData.staffId}
                            loading={loadingStaff}
                            onChange={(val) => setDelegationData({ ...delegationData, staffId: val })}
                            placeholder="Select staff member"
                            className="w-full"
                        />
                    </div>

                    {/* Delegation Note */}
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <FileText size={14} className="text-primary" />
                            Delegation Note
                        </label>
                        <textarea
                            placeholder="Add specific instructions for the staff..."
                            rows="4"
                            className="saas-input w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm bg-slate-50/50 focus:bg-white transition-all duration-300 resize-none"
                            value={delegationData.note}
                            onChange={(e) => setDelegationData({ ...delegationData, note: e.target.value })}
                        ></textarea>
                    </div>

                    {/* Staff Deadline */}
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Calendar size={14} className="text-primary" />
                            Staff Deadline
                        </label>
                        <input
                            required
                            type="date"
                            className="saas-input w-full h-[52px] px-5 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm bg-slate-50/50 focus:bg-white transition-all duration-300"
                            value={delegationData.deadline}
                            onChange={(e) => setDelegationData({ ...delegationData, deadline: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-400 ml-1 italic">Task overall deadline: {delegatingTask?.dueDate}</p>
                    </div>
                </form>
            </RightDrawer>
        </div>
    );
};

export default TaskList;
