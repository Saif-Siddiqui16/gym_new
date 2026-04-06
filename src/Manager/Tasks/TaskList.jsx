import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ListTodo, Clock, Loader2, AlertCircle, CheckCircle2, CheckCircle, Activity, Filter, Building2, FileText, UserPlus, Calendar, Eye, Trash2, ArrowRight } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import CustomDropdown from '../../components/common/CustomDropdown';
import { useBranchContext } from '../../context/BranchContext';
import { getAllStaff, createTask, getTasks, getTaskStats, deleteTask, updateTask, delegateTask } from '../../api/manager/managerApi';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
};

const S = {
  ff: "'Plus Jakarta Sans', sans-serif",
  card: { background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: 22, transition: 'all 0.3s ease' },
  th: { fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: T.muted, padding: '16px 20px', textAlign: 'left', letterSpacing: '0.1em' },
  td: { padding: '18px 20px', fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}` },
  input: { width: '100%', height: 48, borderRadius: 14, border: `2px solid ${T.border}`, background: T.bg, padding: '0 16px', fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.3s' }
};

const TaskList = () => {
    const navigate = useNavigate();
    const { branches, loadingBranches, selectedBranch } = useBranchContext();
    const [activeTab, setActiveTab] = useState('All');
    const [isNewTaskDrawerOpen, setIsNewTaskDrawerOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 });
    const [staffList, setStaffList] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [formData, setFormData] = useState({ branch: '', title: '', description: '', priority: 'Medium', dueDate: '', assignTo: '' });
    const [isDelegateDrawerOpen, setIsDelegateDrawerOpen] = useState(false);
    const [delegatingTask, setDelegatingTask] = useState(null);
    const [delegationData, setDelegationData] = useState({ staffId: '', note: '', deadline: '' });

    useEffect(() => { fetchData(); }, [selectedBranch]);
    useEffect(() => { if (formData.branch) fetchStaff(formData.branch); else setStaffList([]); }, [formData.branch]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tasksRes, statsRes] = await Promise.all([getTasks({ limit: 100 }), getTaskStats()]);
            setTasks(tasksRes.data || []);
            if (statsRes) setStats({ total: statsRes.total || 0, pending: statsRes.pending || 0, inProgress: statsRes.inProgress || 0, completed: statsRes.completed || 0, overdue: statsRes.overdue || 0 });
        } catch (error) { toast.error('Failed to load tasks'); } finally { setLoading(false); }
    };

    const fetchStaff = async (branchId) => {
        setLoadingStaff(true);
        try {
            const data = await getAllStaff(branchId);
            setStaffList(data.map(s => ({ label: `${s.name} (${s.role})`, value: s.id.toString() })));
        } catch (error) { toast.error('Failed to load staff'); } finally { setLoadingStaff(false); }
    };

    const handleNewTask = () => {
        setEditingTaskId(null); setIsReadOnly(false);
        setFormData({ branch: '', title: '', description: '', priority: 'Medium', dueDate: '', assignTo: '' });
        setIsNewTaskDrawerOpen(true);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const payload = { title: formData.title, description: formData.description, priority: formData.priority, dueDate: formData.dueDate, assignedToId: formData.assignTo, tenantId: formData.branch };
            if (editingTaskId) await updateTask(editingTaskId, payload); else await createTask(payload);
            toast.success(editingTaskId ? 'Task updated' : 'Task created');
            setIsNewTaskDrawerOpen(false); fetchData();
        } catch (error) { toast.error('Operation failed'); }
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try { await updateTask(taskId, { status: newStatus }); toast.success(`Task marked as ${newStatus}`); fetchData(); } catch (error) { toast.error('Failed to update status'); }
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
                .fu { animation: fadeUp 0.35s ease both }
                .fu1 { animation-delay: .05s } .fu2 { animation-delay: .1s } .fu3 { animation-delay: .15s }
                .card-h:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,92,252,0.1) !important; }
            `}</style>

            {/* HEADER */}
            <div className="fu fu1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 100%)', padding: '24px 30px', borderRadius: 22, boxShadow: '0 8px 30px rgba(124,92,252,0.2)' }}>
                <div>
                   <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: 0 }}>Task Management</h1>
                   <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0, marginTop: 4 }}>Organize, assign and track gym operations</p>
                </div>
                <button onClick={handleNewTask} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', color: T.accent, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    <Plus size={18} /> New Task
                </button>
            </div>

            {/* STATS */}
            <div className="fu fu2" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18, marginBottom: 32 }}>
                {[
                    { label: 'Total Tasks', value: stats.total, color: T.accent, icon: ListTodo },
                    { label: 'Pending', value: stats.pending, color: T.amber, icon: Clock },
                    { label: 'In Progress', value: stats.inProgress, color: T.blue, icon: Loader2 },
                    { label: 'Completed', value: stats.completed, color: T.green, icon: CheckCircle2 },
                    { label: 'Overdue', value: stats.overdue, color: T.rose, icon: AlertCircle },
                ].map((s, i) => (
                    <div key={i} className="card-h" style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLE SECTION */}
            <div className="fu fu3" style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 4, height: 16, background: T.accent, borderRadius: 2 }}></div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Active Tasks</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: T.bg }}>
                            <tr>
                                <th style={S.th}>Task Description</th>
                                <th style={S.th}>Priority</th>
                                <th style={S.th}>Assigned To</th>
                                <th style={S.th}>Due Date</th>
                                <th style={S.th}>Status</th>
                                <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 60 }}><Loader2 className="animate-spin" color={T.accent} /></td></tr>
                            ) : tasks.length > 0 ? tasks.map((task, i) => (
                                <tr key={i} style={{ transition: 'all 0.2s' }}>
                                    <td style={S.td}><div style={{ fontWeight: 700 }}>{task.title}</div><div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{task.description?.substring(0, 50)}...</div></td>
                                    <td style={S.td}>
                                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20, background: task.priority === 'High' ? T.roseLight : task.priority === 'Medium' ? T.accentLight : T.bg, color: task.priority === 'High' ? T.rose : task.priority === 'Medium' ? T.accent : T.muted }}>{task.priority}</span>
                                    </td>
                                    <td style={S.td}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: '50%', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>{task.assignedTo?.substring(0, 2).toUpperCase()}</div>{task.assignedTo}</div></td>
                                    <td style={S.td}>{new Date(task.dueDate).toLocaleDateString()}</td>
                                    <td style={S.td}><span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: task.status === 'Completed' ? T.green : T.amber }}>{task.status}</span></td>
                                    <td style={{ ...S.td, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                            {task.status === 'Completed' && <button onClick={() => handleUpdateStatus(task.id, 'Approved')} style={{ p: 6, background: 'none', border: 'none', color: T.green, cursor: 'pointer' }}><CheckCircle size={18} /></button>}
                                            <button onClick={() => { setEditingTaskId(task.id); setIsReadOnly(false); setFormData({ branch: task.tenantId?.toString() || '', title: task.title, description: task.description || '', priority: task.priority, dueDate: task.dueDate || '', assignTo: task.assignedToId?.toString() || '' }); setIsNewTaskDrawerOpen(true); }} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer' }}><Eye size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="6" style={{ textAlign: 'center', padding: 60, color: T.muted }}>No tasks found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DRAWER RIGIDLY INLINED */}
            <RightDrawer isOpen={isNewTaskDrawerOpen} onClose={() => setIsNewTaskDrawerOpen(false)} title="Task Assignment" subtitle="Set goals and assign them to your staff" maxWidth="600px">
                <form onSubmit={handleCreateTask} style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Task Title</label>
                        <input required style={S.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Equipment Maintenance" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Description</label>
                        <textarea style={{ ...S.input, height: 100, padding: '12px 16px', resize: 'none' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Explain what needs to be done..." />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Priority</label>
                            <CustomDropdown options={['Low', 'Medium', 'High']} value={formData.priority} onChange={val => setFormData({...formData, priority: val})} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Due Date</label>
                            <input type="date" required style={S.input} value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                        </div>
                    </div>
                    <Button type="submit" variant="primary" style={{ height: 50, borderRadius: 14, fontWeight: 800, marginTop: 10 }}>{editingTaskId ? 'Save Task' : 'Create Task'}</Button>
                </form>
            </RightDrawer>
        </div>
    );
};

export default TaskList;
