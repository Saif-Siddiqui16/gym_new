import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Filter, CheckSquare, Clock, AlertCircle, CheckCircle2, LayoutGrid, List, Box, MoreHorizontal, Loader2, Eye, Trash2, X, Activity, ChevronRight, User } from 'lucide-react';
import CreateTaskDrawer from './CreateTaskDrawer';
import { toast } from 'react-hot-toast';
import { getAllTasks, getTaskStats, updateTaskStatus, deleteTask } from '../../api/staff/taskApi';
import RightDrawer from '../../components/common/RightDrawer';
import ConfirmationModal from '../../components/common/ConfirmationModal';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF'
};

const INPUT_STYLE = {
    width: '100%', height: 48, padding: '0 20px', borderRadius: 16, border: `2px solid ${T.border}`,
    background: '#FFFFFF', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s'
};

const MetricCard = ({ title, value, icon: Icon, color, bg, index }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: T.surface, padding: 32, borderRadius: 32, border: `1px solid ${T.border}`,
                display: 'flex', flexDirection: 'column', gap: 16, cursor: 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hover ? '0 12px 30px rgba(124,92,252,0.12)' : '0 2px 14px rgba(0,0,0,0.02)',
                animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`
            }}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>
            </div>
            <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: T.text, letterSpacing: '-1px' }}>{value}</div>
            </div>
        </div>
    );
};

const MyTasks = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 });
    const [selectedTask, setSelectedTask] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksData, statsData] = await Promise.all([
                getAllTasks({ status: statusFilter === 'All Status' ? 'All' : statusFilter, search: searchTerm }),
                getTaskStats()
            ]);
            setTasks(tasksData);
            setStats(statsData);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
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
        } catch (error) { toast.error(error?.message || 'Failed to update task'); }
    };

    const processDeleteTask = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deleteTask(confirmModal.id);
            toast.success('Task deleted successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchData();
        } catch (error) { toast.error(error?.message || 'Failed to delete task'); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    const StatusBadge = ({ status }) => {
        let color = T.muted, bg = T.bg;
        if (status === 'Completed') { color = T.green; bg = T.greenLight; }
        else if (status === 'In Progress') { color = T.accent; bg = T.accentLight; }
        else if (status === 'Pending') { color = T.amber; bg = T.amberLight; }
        else if (status === 'Overdue') { color = T.rose; bg = T.roseLight; }
        
        return (
            <div style={{ padding: '4px 12px', borderRadius: 20, background: bg, color: color, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', border: `1px solid ${color}15`, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} /> {status}
            </div>
        );
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                .fu { animation: fadeUp 0.4s ease both; }
            `}</style>

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="fu">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, zIndex: 2 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ClipboardList size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>Task Management</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: '4px 0 0', fontWeight: 600 }}>Manage and track your operational responsibilities</p>
                    </div>
                </div>
            </div>

            {/* KPI STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, marginBottom: 40 }} className="fu">
                <MetricCard title="Total Tasks" value={stats.total} icon={List} color={T.accent} bg={T.accentLight} index={0} />
                <MetricCard title="Pending" value={stats.pending} icon={Clock} color={T.amber} bg={T.amberLight} index={1} />
                <MetricCard title="In Progress" value={stats.inProgress} icon={Activity} color={T.blue} bg={T.blueLight} index={2} />
                <MetricCard title="Completed" value={stats.completed} icon={CheckCircle2} color={T.green} bg={T.greenLight} index={3} />
                <MetricCard title="Overdue" value={stats.overdue} icon={AlertCircle} color={T.rose} bg={T.roseLight} index={4} />
            </div>

            {/* SEARCH & FILTERS */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 32, animationDelay: '0.2s', alignItems: 'center' }} className="fu">
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={22} color={T.subtle} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Search by task title or description..." 
                        style={{ ...INPUT_STYLE, paddingLeft: 52 }}
                    />
                </div>
                <div style={{ width: 220 }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ ...INPUT_STYLE, appearance: 'none', background: `url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23B0ADCC%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E") no-repeat right 16px center`, backgroundSize: '1.2rem', cursor: 'pointer' }}
                    >
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Overdue</option>
                    </select>
                </div>
            </div>

            {/* TASK LIST AREA */}
            <div style={{ background: T.surface, borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }} className="fu">
                <div style={{ padding: '24px 32px', background: '#F9F8FF', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 4, height: 24, borderRadius: 4, background: T.accent }} />
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>All Tasks</h3>
                </div>

                <div style={{ padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.surface, borderBottom: `1px solid ${T.bg}` }}>
                                {['Task Group', 'Priority', 'Assigned By', 'Due Date', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '16px 32px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length > 0 ? tasks.map((task, i) => {
                                let pColor = T.muted, pBg = T.bg;
                                if (task.priority === 'High') { pColor = T.rose; pBg = T.roseLight; }
                                else if (task.priority === 'Medium') { pColor = T.amber; pBg = T.amberLight; }
                                else if (task.priority === 'Low') { pColor = T.green; pBg = T.greenLight; }

                                return (
                                    <tr key={task.id} style={{ borderBottom: `1px solid ${T.bg}`, transition: '0.3s' }}>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{task.title}</div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginTop: 4 }}>{task.description || 'No description'}</div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ padding: '4px 12px', background: pBg, color: pColor, borderRadius: 8, fontSize: 10, fontWeight: 900, display: 'inline-flex' }}>{task.priority || 'Medium'}</div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 50, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}><User size={14} /></div>
                                                <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{task.assignedBy || 'Admin'}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Clock size={16} color={T.subtle} />
                                                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{task.due ? new Date(task.due).toLocaleDateString() : '—'}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}><StatusBadge status={task.status} /></td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => { setSelectedTask(task); setIsViewOpen(true); }} style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight, color: T.accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Eye size={18} /></button>
                                                <button onClick={() => setConfirmModal({ isOpen: true, id: task.id, loading: false })} style={{ width: 36, height: 36, borderRadius: 10, background: T.roseLight, color: T.rose, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: 100, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                            <CheckSquare size={64} color={T.bg} />
                                            <div style={{ fontSize: 16, fontWeight: 800, color: T.subtle }}>Looks like your agenda is clean!</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RightDrawer isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Task Detail">
                {selectedTask && (
                    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>TASK TITLE</div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: T.text }}>{selectedTask.title}</div>
                        </div>
                        <div style={{ padding: 24, background: '#F9F8FF', borderRadius: 20, border: `1px solid ${T.border}`, fontSize: 14, color: T.muted, lineHeight: '1.6', fontStyle: 'italic' }}>
                            "{selectedTask.description || 'No description provided.'}"
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ padding: 20, background: '#F9F8FF', borderRadius: 20, border: `1px solid ${T.border}` }}>
                                <div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginBottom: 4 }}>DUE DATE</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{selectedTask.due ? new Date(selectedTask.due).toLocaleDateString() : 'N/A'}</div>
                            </div>
                            <div style={{ padding: 20, background: '#F9F8FF', borderRadius: 20, border: `1px solid ${T.border}` }}>
                                <div style={{ fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginBottom: 4 }}>PRIORITY</div>
                                <div style={{ fontSize: 14, fontWeight: 900, color: T.accent }}>{selectedTask.priority}</div>
                            </div>
                        </div>
                        {selectedTask.status !== 'Completed' && (
                            <button onClick={() => { handleStatusUpdate(selectedTask.id, 'Completed'); setIsViewOpen(false); }} style={{ height: 56, borderRadius: 16, background: T.green, border: 'none', color: '#fff', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 25px rgba(34,201,122,0.2)' }}>
                                <CheckCircle2 size={24} /> MARK AS COMPLETED
                            </button>
                        )}
                    </div>
                )}
            </RightDrawer>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDeleteTask}
                title="Delete Task?"
                message="This task will be permanently removed from your agenda."
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default MyTasks;
