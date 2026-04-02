import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Building, Type, AlignLeft, Flag, Calendar, UserPlus, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RightDrawer from '../../components/common/RightDrawer';
import { getBranchTeam, getMyBranch, createTask } from '../../api/staff/taskApi';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

// Hierarchy: who can assign to whom
const ASSIGNABLE_ROLES = {
    SUPER_ADMIN:  ['MANAGER'],
    BRANCH_ADMIN: ['MANAGER'],
    MANAGER:      ['STAFF'],
    STAFF:        ['TRAINER'],
    TRAINER:      [],
};

const CreateTaskDrawer = ({ isOpen, onClose, onSuccess }) => {
    const { role: currentRole } = useAuth();
    const [formData, setFormData] = useState({
        branch: '',
        title: '',
        description: '',
        priority: 'Medium',
        due_date: '',
        assignedToId: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [branchInfo, setBranchInfo] = useState(null);
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(false);

    const allowedRoles = ASSIGNABLE_ROLES[currentRole] || [];
    const filteredTeam = useMemo(
        () => team.filter(m => allowedRoles.includes(m.role)),
        [team, currentRole]
    );

    const assignLabel = allowedRoles.length
        ? `Assign To (${allowedRoles.join(' / ')})`
        : 'Assign To';

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [branch, members] = await Promise.all([
                getMyBranch(),
                getBranchTeam()
            ]);
            setBranchInfo(branch);
            setTeam(members);
            if (branch) {
                setFormData(prev => ({ ...prev, branch: branch.name }));
            }
        } catch (error) {
            console.error('Error loading task data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createTask(formData);
            if (onSuccess) onSuccess();
            onClose();
            setFormData({
                branch: branchInfo ? branchInfo.name : '',
                title: '',
                description: '',
                priority: 'Medium',
                due_date: '',
                assignedToId: ''
            });
        } catch (error) {
            toast.error(error?.message || 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Task"
            subtitle="Add a new task and assign it to team members"
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white font-sans">
                <div className="flex-1  space-y-8">

                    {/* Branch */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Branch *</label>
                        <div className="relative group">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                            <select
                                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat shadow-sm"
                                value={formData.branch}
                                disabled
                                required
                            >
                                <option value={formData.branch}>{formData.branch || 'Loading...'}</option>
                            </select>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title *</label>
                        <div className="relative group">
                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Task title"
                                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                        <div className="relative group">
                            <AlignLeft className="absolute left-4 top-6 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                            <textarea
                                placeholder="Task description..."
                                rows={3}
                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Priority */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</label>
                            <div className="relative group">
                                <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                <select
                                    className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat shadow-sm"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Due Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="date"
                                    className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assign To */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{assignLabel}</label>
                        <div className="relative group">
                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                            <select
                                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat shadow-sm"
                                value={formData.assignedToId}
                                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                            >
                                <option value="">Select user (optional)</option>
                                {filteredTeam.length === 0 ? (
                                    <option disabled>No {allowedRoles.join('/')} found</option>
                                ) : (
                                    filteredTeam.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.role})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-50 flex gap-4 bg-white/80 backdrop-blur-md sticky bottom-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-2xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={isSubmitting}
                        className="flex-[1.5] h-12 rounded-2xl shadow-xl shadow-violet-200"
                    >
                        Create Task
                    </Button>
                </div>
            </form>
        </RightDrawer>
    );
};

export default CreateTaskDrawer;
