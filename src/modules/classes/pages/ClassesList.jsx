import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, Filter, Calendar, User, Users,
    Dumbbell, Clock, X, ChevronDown, CheckCircle2,
    MoreHorizontal, LayoutGrid, List as ListIcon,
    AlertCircle, Edit2, Trash2, IndianRupee
} from 'lucide-react';
import { getClasses, createClass, updateClass, deleteClass } from '../../../api/manager/classesApi';
import { getTrainerClasses } from '../../../api/trainer/trainerApi';
import { getAllStaff } from '../../../api/manager/managerApi';
import { useAuth } from '../../../context/AuthContext';
import { useBranchContext } from '../../../context/BranchContext';
import { toast } from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import RightDrawer from '../../../components/common/RightDrawer';

const ClassesList = () => {
    const { role, user } = useAuth();
    const { selectedBranch } = useBranchContext();
    const navigate = useNavigate();

    // State
    const [classes, setClasses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Upcoming'); // Upcoming, Past, All
    const [contentTab, setContentTab] = useState('Schedule'); // Schedule, Attendance
    const [typeFilter, setTypeFilter] = useState('All');
    const [trainerFilter, setTrainerFilter] = useState(role === 'TRAINER' ? user?.id?.toString() : 'All');
    const [activeActionId, setActiveActionId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [editingClassId, setEditingClassId] = useState(null);

    // Side Panel State
    const [showPanel, setShowPanel] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        capacity: 20,
        date: '',
        time: '',
        duration: 60,
        trainerId: role === 'TRAINER' ? user?.id?.toString() : '',
        description: '',
        price: 0
    });

    useEffect(() => {
        loadClasses();
        loadTrainers();
    }, [selectedBranch]);

    const loadClasses = async () => {
        try {
            setLoading(true);
            let data;
            if (role === 'TRAINER') {
                data = await getTrainerClasses({ branchId: selectedBranch });
            } else {
                data = await getClasses({ branchId: selectedBranch });
            }
            setClasses(data || []);
        } catch (error) {
            console.error('Error loading classes:', error);
            toast.error('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const loadTrainers = async () => {
        try {
            const data = await getAllStaff();
            setTrainers(data.filter(s => s.role === 'TRAINER') || []);
        } catch (error) {
            console.error('Error loading trainers:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                branchId: selectedBranch, // 'all' or specific ID
                maxCapacity: parseInt(formData.capacity)
            };

            if (editingClassId) {
                await updateClass(editingClassId, payload);
                toast.success('Class updated successfully!');
            } else {
                await createClass(payload);
                toast.success(selectedBranch === 'all' ? 'Class created for all branches!' : 'Class created successfully!');
            }
            setShowPanel(false);
            resetForm();
            loadClasses();
        } catch (error) {
            console.error('Error saving class:', error);
            toast.error('Failed to save class');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: '',
            capacity: 20,
            date: '',
            time: '',
            duration: 60,
            trainerId: role === 'TRAINER' ? user?.id?.toString() : '',
            description: '',
            price: 0
        });
        setEditingClassId(null);
    };

    const handleEditClick = (cls) => {
        // Use raw fields from backend if available
        let parsedDate = cls.rawDate || '';
        let parsedTime = cls.rawTime || '';

        // Function to ensure time is in HH:mm 24h format
        const formatTime = (timeStr) => {
            if (!timeStr) return '';
            // If already HH:mm, just return
            if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;

            // Try to extract time and am/pm
            const match = timeStr.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
            if (match) {
                let [_, hours, mins, ampm] = match;
                hours = parseInt(hours);
                if (ampm) {
                    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                }
                return `${String(hours).padStart(2, '0')}:${mins}`;
            }
            return timeStr;
        };

        // If raw fields are missing, try to parse from schedule string
        if (!parsedDate && cls.schedule && typeof cls.schedule === 'string') {
            // Regex for YYYY-MM-DD or DD-MM-YYYY
            const dateMatch = cls.schedule.match(/(\d{4}-\d{2}-\d{2})|(\d{2}-\d{2}-\d{4})/);
            if (dateMatch) {
                if (dateMatch[1]) parsedDate = dateMatch[1]; // YYYY-MM-DD
                else {
                    // Convert DD-MM-YYYY to YYYY-MM-DD
                    const [d, m, y] = dateMatch[2].split('-');
                    parsedDate = `${y}-${m}-${d}`;
                }
            }

            const timeMatch = cls.schedule.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
            if (timeMatch) {
                parsedTime = formatTime(timeMatch[1]);
            }
        } else if (parsedTime) {
            parsedTime = formatTime(parsedTime);
        }

        // Normalize Type (case-insensitive match)
        let typeValue = cls.rawType || cls.requiredBenefit || '';
        const normalizedType = classTypes.find(t => t.toLowerCase() === typeValue.toLowerCase()) || typeValue;

        let dur = 60;
        if (cls.duration) {
            dur = parseInt(String(cls.duration).replace(/\D/g, '')) || 60;
        }

        setFormData({
            name: cls.name || '',
            type: normalizedType,
            capacity: cls.capacity || 20,
            date: parsedDate,
            time: parsedTime,
            duration: dur,
            trainerId: cls.trainerId || '',
            description: cls.description || '',
            price: cls.price || 0
        });
        setEditingClassId(cls.id);
        setActiveActionId(null);
        setShowPanel(true);
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) return;
        try {
            setDeletingId(id);
            await deleteClass(id);
            toast.success('Class deleted successfully!');
            setActiveActionId(null);
            loadClasses();
        } catch (error) {
            console.error('Error deleting class:', error);
            toast.error('Failed to delete class');
        } finally {
            setDeletingId(null);
        }
    };

    // Filter Logic
    const filteredClasses = (classes || []).filter(cls => {
        const matchesSearch = (cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = typeFilter === 'All' || cls.requiredBenefit === typeFilter;
        const matchesTrainer = trainerFilter === 'All' || cls.trainerId?.toString() === trainerFilter;

        let classDate = null;
        if (cls.schedule) {
            let dateStr = cls.schedule;
            if (typeof dateStr === 'string' && dateStr.includes(' at ')) {
                const parts = dateStr.split(' at ');
                classDate = new Date(`${parts[0]}T${parts[1]}`);
            } else {
                classDate = new Date(cls.schedule);
            }
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Optionally reset to start of day, or keep exact time. Let's keep exact time to be strict: const now = new Date();

        let matchesTab = true;
        if (activeTab === 'Upcoming') {
            if (classDate && !isNaN(classDate.getTime())) {
                matchesTab = classDate >= new Date();
            } else {
                matchesTab = cls.status === 'Scheduled'; // fallback
            }
        } else if (activeTab === 'Past') {
            if (classDate && !isNaN(classDate.getTime())) {
                matchesTab = classDate < new Date();
            } else {
                matchesTab = cls.status === 'Completed'; // fallback
            }
        }

        return matchesSearch && matchesType && matchesTrainer && matchesTab;
    });

    const classTypes = ['General', 'Yoga', 'HIIT', 'Spin', 'Pilates', 'Zumba', 'Strength', 'Boxing', 'Sauna'];

    return (
        <div className="saas-page space-y-8">
            {/* Header Area */}
            <div className="relative overflow-hidden saas-card !p-8 mb-8 group">
                {/* Premium Glow Effect */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-4 ring-primary/10">
                            <Dumbbell size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Classes</h1>
                            <p className="text-slate-500 text-sm font-medium mt-2">Manage group classes and bookings</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => { resetForm(); setShowPanel(true); }}
                        variant="primary"
                        className="btn-primary shadow-xl shadow-primary/30"
                        icon={Plus}
                    >
                        Create Class
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    title="Upcoming Classes"
                    value={filteredClasses.filter(c => c.status === 'Scheduled').length}
                    icon={<Calendar size={22} />}
                    gradient="from-primary to-primary"
                />
                <KPICard
                    title="Today's Classes"
                    value={filteredClasses.filter(c => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        return c.schedule && c.schedule.startsWith(todayStr);
                    }).length}
                    icon={<Clock size={22} />}
                    gradient="from-primary to-primary"
                />
                <KPICard
                    title="Total Bookings"
                    value={filteredClasses.reduce((sum, c) => sum + (parseInt(c.enrolled) || 0), 0)}
                    icon={<Users size={22} />}
                    gradient="from-emerald-500 to-teal-600"
                />
                <KPICard
                    title="Active Trainers"
                    value={trainers.length}
                    icon={<User size={22} />}
                    gradient="from-orange-500 to-rose-600"
                />
            </div>

            {/* Filters Section */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-border flex flex-col md:flex-row items-center gap-6">
                    {/* Status Tabs */}
                    <div className="flex bg-muted p-1 rounded-xl">
                        {['Upcoming', 'Past', 'All'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 w-full md:w-auto">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search classes or trainers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-muted border-transparent rounded-xl text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent focus:border-primary/30"
                        />
                    </div>

                    {/* Dropdowns */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 bg-muted border-transparent rounded-xl text-xs font-semibold text-foreground outline-none appearance-none cursor-pointer hover:bg-muted/80 transition-colors"
                            >
                                <option value="All">All Types</option>
                                {classTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                        <div className="relative flex-1 md:flex-none">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <select
                                value={trainerFilter}
                                onChange={(e) => setTrainerFilter(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 bg-muted border-transparent rounded-xl text-xs font-semibold text-foreground outline-none appearance-none cursor-pointer hover:bg-muted/80 transition-colors"
                            >
                                <option value="All">All Trainers</option>
                                {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Sub-tabs */}
                <div className="px-5 py-3 flex items-center gap-8 border-b border-border bg-slate-50/30">
                    <button
                        onClick={() => setContentTab('Schedule')}
                        className={`text-sm font-semibold pb-2 transition-all relative ${contentTab === 'Schedule' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Schedule ({filteredClasses.length})
                        {contentTab === 'Schedule' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                    </button>
                    <button
                        onClick={() => setContentTab('Attendance')}
                        className={`text-sm font-semibold pb-2 transition-all relative ${contentTab === 'Attendance' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Attendance
                        {contentTab === 'Attendance' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                    </button>
                </div>


                {/* Main Content Area */}
                <div className="p-6">
                    {contentTab === 'Attendance' ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-primary/5">
                                <CheckCircle2 size={36} className="text-primary/40" />
                            </div>
                            <p className="text-base font-semibold text-foreground mb-2">Select a class to view attendance</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Switch to the Schedule tab and choose a class to manage its member attendance records.</p>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4" />
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Gathering classes...</p>
                        </div>
                    ) : filteredClasses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {filteredClasses.map((cls) => (
                                <div key={cls.id} className="group bg-card border border-border rounded-2xl p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 transform md:hover:-translate-y-1 flex flex-col h-full relative overflow-hidden">
                                    {/* Class Type Badge */}
                                    <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />

                                    {/* Header: Icon + Name */}
                                    <div className="flex items-start justify-between mb-5 relative">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary transform group-hover:scale-110 transition-transform duration-300">
                                                <Dumbbell size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{cls.name}</h3>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{cls.requiredBenefit || 'General'}</span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === cls.id ? null : cls.id); }}
                                                className={`p-2 rounded-lg transition-all ${activeActionId === cls.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {/* Action Dropdown */}
                                            {activeActionId === cls.id && (
                                                <>
                                                    <div className="fixed inset-0 z-[40]" onClick={() => setActiveActionId(null)} />
                                                    <div className="absolute right-0 top-11 w-40 bg-white rounded-xl shadow-2xl border border-border z-[50] py-1 flex flex-col overflow-hidden origin-top-right animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditClick(cls); }}
                                                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                                                        >
                                                            <Edit2 size={14} className="text-muted-foreground" /> Edit Class
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id); }}
                                                            disabled={deletingId === cls.id}
                                                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            {deletingId === cls.id ? (
                                                                <div className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                                                            ) : (
                                                                <Trash2 size={14} className="text-red-400" />
                                                            )}
                                                            Delete Class
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3 text-sm text-foreground/80">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground border border-border shadow-sm">
                                                {cls.trainerName?.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Trainer</span>
                                                <span className="font-semibold">{cls.trainerName}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar size={14} className="text-primary/60" />
                                                <span className="text-xs font-medium">{cls.schedule}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock size={14} className="text-primary/60" />
                                                <span className="text-xs font-medium">{cls.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                                <IndianRupee size={14} />
                                                <span className="text-xs">{cls.price && Number(cls.price) > 0 ? `₹${cls.price}` : 'Free'}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bookings</span>
                                                <span className="text-xs font-bold text-foreground">{cls.enrolled} / {cls.capacity}</span>
                                            </div>
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${cls.enrolled >= cls.capacity ? 'bg-rose-500' : 'bg-primary'}`}
                                                    style={{ width: `${Math.min(100, (cls.enrolled / cls.capacity) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer: Status + Action */}
                                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls.status === 'Scheduled' ? 'bg-primary/10 text-primary' :
                                            cls.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' :
                                                'bg-muted text-muted-foreground'
                                            }`}>
                                            {cls.status}
                                        </span>
                                        <Button
                                            variant="outline"
                                            className="h-8 px-4 text-[11px] rounded-lg border-primary/20 hover:border-primary text-primary hover:bg-primary/5 font-bold uppercase tracking-wider"
                                            onClick={() => navigate(`/classes/${cls.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-24 h-24 bg-muted rounded-[2rem] flex items-center justify-center mb-6 ring-8 ring-muted/50">
                                <Calendar size={40} className="text-muted-foreground/30" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">No upcoming classes scheduled</h3>
                            <p className="text-sm text-muted-foreground mb-8 max-w-sm">There are no classes matching your filters. <br />Start by scheduling your first group class.</p>
                            <Button
                                onClick={() => { setEditingClassId(null); resetForm(); setShowPanel(true); }}
                                variant="primary"
                                icon={Plus}
                                className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20"
                            >
                                Schedule a Class
                            </Button>
                        </div>
                    )}
                </div>
            </div >

            {/* Standardized Side Panel Overlay */}
            <RightDrawer
                isOpen={showPanel}
                onClose={() => !submitting && setShowPanel(false)}
                title={editingClassId ? 'Edit Class' : 'Class Scheduling'}
                subtitle={editingClassId ? 'Update existing class details' : 'Schedule a new group class'}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={submitting}
                            onClick={() => setShowPanel(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={submitting}
                            onClick={handleSubmit}
                        >
                            {editingClassId ? 'Update Class' : 'Create Class'}
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Class Name */}
                    <div className="saas-form-group">
                        <label className="saas-label">Class Name *</label>
                        <input
                            required
                            placeholder="Yoga, HIIT, Spin, etc."
                            className="saas-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Class Type & Capacity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="saas-form-group">
                            <label className="saas-label">Class Type</label>
                            <select
                                className="saas-input cursor-pointer"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">Select type</option>
                                {classTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label">Capacity *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="saas-input"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="saas-form-group">
                            <label className="saas-label">Schedule *</label>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="date"
                                    required
                                    className="saas-input !py-2"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                                <input
                                    type="time"
                                    required
                                    className="saas-input !py-2"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                                <p className="text-[9px] text-slate-400 italic flex items-center gap-1 font-bold uppercase tracking-widest mt-1">
                                    <AlertCircle size={10} /> format: day-month-year
                                </p>
                            </div>
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label">Duration (min)</label>
                            <input
                                type="number"
                                className="saas-input"
                                placeholder="60"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                            <p className="text-[9px] text-slate-400 italic mt-1 font-bold uppercase tracking-widest">Typically 30, 45, 60</p>
                        </div>
                    </div>

                    {/* Trainer */}
                    <div className="saas-form-group">
                        <label className="saas-label">Assign Trainer</label>
                        <select
                            className="saas-input cursor-pointer"
                            value={formData.trainerId}
                            onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                        >
                            <option value="">No trainer</option>
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="saas-form-group">
                        <label className="saas-label">Class Description</label>
                        <textarea
                            rows={3}
                            placeholder="What will members learn? (e.g. Focus on core strength and flexibility...)"
                            className="saas-input min-h-[100px] resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Price */}
                    <div className="saas-form-group">
                        <label className="saas-label">Price (INR)</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="saas-input"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            min="0"
                        />
                        <p className="text-[9px] text-slate-400 italic mt-1 font-bold uppercase tracking-widest">Set to 0 for free classes</p>
                    </div>
                </form>
            </RightDrawer>
        </div >
    );
};

const KPICard = ({ title, value, icon: Icon, gradient }) => {
    return (
        <div className="saas-card group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-center min-h-[120px]">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full blur-2xl group-hover:bg-primary/5 transition-all" />

            <div className="flex items-center gap-4 relative z-10 px-1">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-black/5 transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 shrink-0`}>
                    {React.cloneElement(Icon, { size: 28, strokeWidth: 2 })}
                </div>
                <div className="min-w-0">
                    <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none mb-1.5 truncate">{value}</div>
                    <div className="saas-label !mb-0 truncate">{title}</div>
                </div>
            </div>
        </div>
    );
};

export default ClassesList;

