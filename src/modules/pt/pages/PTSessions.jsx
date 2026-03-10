import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Users,
    Clock,
    Activity,
    MoreVertical,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    Package as PackageIcon,
    ChevronRight,
    ArrowRight,
    TrendingUp,
    Dumbbell,
    UserCheck,
    AlertCircle,
    Coins,
    X,
    Trash
} from 'lucide-react';
import { ptApi } from '../../../api/ptApi';
import * as managerApi from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { useBranchContext } from '../../../context/BranchContext';
import Button from '../../../components/ui/Button';
import RightDrawer from '../../../components/common/RightDrawer';

const PTSessions = () => {
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('packages'); // packages, active, sessions
    const [packages, setPackages] = useState([]);
    const [activeAccounts, setActiveAccounts] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({
        totalPackages: 0,
        activeAccounts: 0,
        sessionsToday: 0,
        completionRate: 0
    });

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [isSubmitting, setSubmitting] = useState(false);

    // Form State for Package
    const [formData, setFormData] = useState({
        name: '',
        sessionType: 'Fixed Sessions',
        totalSessions: '',
        price: '',
        gstPercent: '18',
        gstInclusive: false,
        validityDays: '90',
        description: ''
    });

    // Form State for Session
    const [sessionData, setSessionData] = useState({
        memberId: '',
        trainerId: '',
        ptAccountId: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        duration: '60',
        notes: ''
    });

    // Form State for Assign Package
    const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
    const [assignData, setAssignData] = useState({
        memberId: '',
        packageId: ''
    });

    const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedBranch]);

    const loadData = async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch === 'all' ? '' : selectedBranch;
            const [statsRes, pkgsRes, accountsRes, sessionsRes, allStaff, membersData] = await Promise.all([
                ptApi.getStats(branchId),
                ptApi.getPackages(branchId),
                ptApi.getAccounts(branchId),
                ptApi.getSessions({ branchId }),
                managerApi.getAllStaff(),
                managerApi.getMembers({ branchId, limit: 1000 })
            ]);

            setStats(statsRes.data);
            setPackages(pkgsRes.data);
            setActiveAccounts(accountsRes.data);
            setSessions(sessionsRes.data);
            setTrainers(Array.isArray(allStaff) ? allStaff.filter(s => s.role === 'TRAINER') : []);
            setMembers(membersData.data || []);
        } catch (error) {
            console.error('Error loading PT data:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            console.error('PT Error Details:', errorMsg);
            toast.error(`Failed to load PT data: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogSession = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await ptApi.logSession(sessionData);
            toast.success('Session logged successfully');
            setIsSessionDrawerOpen(false);
            loadData();
        } catch (error) {
            toast.error('Failed to log session');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignPackage = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await ptApi.purchasePackage({
                memberId: assignData.memberId,
                packageId: assignData.packageId
            });
            toast.success('Package assigned successfully');
            setIsAssignDrawerOpen(false);
            setAssignData({ memberId: '', packageId: '' });
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign package');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreatePackage = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                branchId: selectedBranch // 'all' or specific ID
            };

            if (editingPackage) {
                await ptApi.updatePackage(editingPackage.id, payload);
                toast.success('Package updated successfully');
            } else {
                await ptApi.createPackage(payload);
                toast.success('Package added successfully');
            }

            setIsSidebarOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            sessionType: 'Fixed Sessions',
            totalSessions: '',
            price: '',
            gstPercent: '18',
            gstInclusive: false,
            validityDays: '90',
            description: ''
        });
        setEditingPackage(null);
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            sessionType: pkg.sessionType,
            totalSessions: pkg.totalSessions,
            price: pkg.price,
            gstPercent: pkg.gstPercent,
            gstInclusive: pkg.gstInclusive,
            validityDays: pkg.validityDays,
            description: pkg.description || ''
        });
        setIsSidebarOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                await ptApi.deletePackage(id);
                toast.success('Package deleted');
                loadData();
            } catch (error) {
                toast.error('Failed to delete package');
            }
        }
    };

    // Filter Logic
    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (showInactive ? true : pkg.status === 'Active')
    );

    const filteredAccounts = activeAccounts.filter(acc =>
        acc.member?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSessions = sessions.filter(sess =>
        sess.member?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sess.trainer?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Charts Data
    const statusDistribution = [
        { name: 'Completed', value: sessions.filter(s => s.status === 'Completed').length, color: '#10b981' },
        { name: 'Scheduled', value: sessions.filter(s => s.status === 'Scheduled').length, color: '#3b82f6' },
        { name: 'Cancelled', value: sessions.filter(s => s.status === 'Cancelled').length, color: '#ef4444' },
        { name: 'No-show', value: sessions.filter(s => s.status === 'No-show').length, color: '#f59e0b' }
    ].filter(d => d.value > 0);

    const trainerData = trainers.map(t => ({
        name: t.name,
        sessions: sessions.filter(s => s.trainerId === t.id).length
    })).filter(d => d.sessions > 0).slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="saas-container  space-y-6">
            {/* Header Area */}
            <div className="saas-card !p-8 mb-8 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-4 ring-primary/10">
                            <Dumbbell size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">PT Sessions</h1>
                            <p className="text-slate-500 text-sm font-medium mt-2">Manage personal training packages and sessions</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="primary"
                            onClick={() => {
                                resetForm();
                                setIsSidebarOpen(true);
                            }}
                            className="w-full md:w-auto flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Create Package
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <KPICard
                    title="Total Packages"
                    value={stats.totalPackages}
                    icon={PackageIcon}
                    color="blue"
                />
                <KPICard
                    title="Active"
                    value={stats.activeAccounts}
                    icon={UserCheck}
                    color="indigo"
                />
                <KPICard
                    title="Today"
                    value={stats.sessionsToday}
                    icon={Clock}
                    color="blue"
                />
                <KPICard
                    title="Rate"
                    value={`${stats.completionRate}%`}
                    icon={TrendingUp}
                    color="indigo"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Session Status Distribution</h3>
                    <div className="h-[250px]">
                        {statusDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistribution}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 italic">No session data available</div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Sessions by Trainer</h3>
                    <div className="h-[250px]">
                        {trainerData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trainerData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                                        {trainerData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#4f46e5'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 italic">No trainer data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {/* Tabs & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 border-b border-slate-100 bg-white gap-4">
                    <div className="flex items-center overflow-x-auto no-scrollbar scrollbar-hide -mb-px">
                        {[
                            { id: 'packages', label: 'Packages' },
                            { id: 'active', label: 'Active' },
                            { id: 'sessions', label: 'Sessions' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 md:px-6 py-4 md:py-5 text-xs md:text-sm font-bold transition-all relative whitespace-nowrap flex items-center justify-center ${activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'sessions' && (
                        <div className="py-2 sm:py-0 w-full sm:w-auto flex justify-center sm:justify-end">
                            <button
                                onClick={() => setIsSessionDrawerOpen(true)}
                                className="w-full sm:w-auto px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-primary to-primary text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                            >
                                <Calendar size={16} strokeWidth={2.5} />
                                Schedule Session
                            </button>
                        </div>
                    )}

                    {activeTab === 'active' && (
                        <div className="py-2 sm:py-0 w-full sm:w-auto flex justify-center sm:justify-end">
                            <button
                                onClick={() => setIsAssignDrawerOpen(true)}
                                className="w-full sm:w-auto px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-primary to-primary text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                            >
                                <UserCheck size={16} strokeWidth={2.5} />
                                Assign Package
                            </button>
                        </div>
                    )}

                    {activeTab === 'packages' && (
                        <div className="py-2 sm:py-0 w-full sm:w-auto flex justify-center sm:justify-end">
                            <button
                                onClick={() => {
                                    resetForm();
                                    setIsSidebarOpen(true);
                                }}
                                className="w-full sm:w-auto px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-primary to-primary text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                Create Package
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters Row */}
                <div className="px-4 md:px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 w-full md:max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-[11px] md:text-sm font-semibold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                        {activeTab === 'packages' && (
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${showInactive ? 'bg-primary' : 'bg-slate-200'}`}>
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={showInactive}
                                            onChange={() => setShowInactive(!showInactive)}
                                        />
                                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showInactive ? 'translate-x-4' : ''}`} />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Show Inactive</span>
                                </label>
                            </div>
                        )}
                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {/* List Area */}
                <div className="flex-1 overflow-x-auto">
                    {activeTab === 'packages' && (
                        <div className="saas-table-wrapper border-0 rounded-none">
                            <table className="saas-table saas-table-responsive w-full">
                                <thead>
                                    <tr className="text-left bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Package Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sessions</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Validity</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredPackages.length > 0 ? filteredPackages.map(pkg => (
                                        <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4" data-label="Package Name">
                                                <div className="text-right sm:text-left">
                                                    <div className="font-semibold text-slate-700">{pkg.name}</div>
                                                    <div className="text-xs text-slate-400">{pkg.sessionType}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-right sm:text-left" data-label="Sessions">{pkg.totalSessions} Sessions</td>
                                            <td className="px-6 py-4" data-label="Price">
                                                <div className="text-right sm:text-left">
                                                    <div className="font-semibold text-slate-800">₹{pkg.price}</div>
                                                    <div className="text-[10px] text-slate-400">{pkg.gstInclusive ? 'Inc. GST' : `+ ${pkg.gstPercent}% GST`}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-right sm:text-left" data-label="Validity">{pkg.validityDays} Days</td>
                                            <td className="px-6 py-4" data-label="Status">
                                                <div className="flex justify-end sm:justify-start">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${pkg.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {pkg.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right" data-label="Actions">
                                                <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(pkg)}
                                                        className="p-1.5 text-primary hover:bg-primary-light rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pkg.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center pointer-events-none">
                                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                                    <PackageIcon size={40} strokeWidth={1.5} />
                                                    <p>No packages found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'active' && (
                        <div className="saas-table-wrapper border-0 rounded-none">
                            <table className="saas-table saas-table-responsive w-full">
                                <thead>
                                    <tr className="text-left bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Package</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Balance</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expires</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAccounts.length > 0 ? filteredAccounts.map(acc => (
                                        <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4" data-label="Member">
                                                <div className="text-right sm:text-left">
                                                    <div className="font-semibold text-slate-700">{acc.member?.name}</div>
                                                    <div className="text-xs text-slate-400">{acc.member?.memberId}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-right sm:text-left" data-label="Package">{acc.package?.name}</td>
                                            <td className="px-6 py-4" data-label="Balance">
                                                <div className="flex items-center gap-2 font-semibold text-slate-800 justify-end sm:justify-start">
                                                    {acc.remainingSessions} / {acc.totalSessions}
                                                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${(acc.remainingSessions / acc.totalSessions) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-right sm:text-left" data-label="Expires">
                                                {new Date(acc.expiryDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4" data-label="Status">
                                                <div className="flex justify-end sm:justify-start">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600">
                                                        {acc.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic pointer-events-none">No active memberships found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="saas-table-wrapper border-0 rounded-none">
                            <table className="saas-table saas-table-responsive w-full">
                                <thead>
                                    <tr className="text-left bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date & Time</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trainer</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Package Used</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredSessions.length > 0 ? filteredSessions.map(sess => (
                                        <tr key={sess.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4" data-label="Date & Time">
                                                <div className="text-right sm:text-left">
                                                    <div className="font-semibold text-slate-700">{new Date(sess.date).toLocaleDateString()}</div>
                                                    <div className="text-xs text-slate-400">{sess.time || '--:--'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-right sm:text-left" data-label="Member">{sess.member?.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-right sm:text-left" data-label="Trainer">{sess.trainer?.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-400 italic text-right sm:text-left" data-label="Package Used">
                                                {sess.ptAccount?.package?.name || 'Walk-in'}
                                            </td>
                                            <td className="px-6 py-4" data-label="Status">
                                                <div className="flex justify-end sm:justify-start">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sess.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-light text-primary'
                                                        }`}>
                                                        {sess.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic pointer-events-none">No sessions logged</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* No FAB content - button moved to tabs area */}

            {/* Side Panel Drawer for Creating/Editing Package */}
            <RightDrawer
                isOpen={isSidebarOpen}
                onClose={() => !isSubmitting && setIsSidebarOpen(false)}
                title={editingPackage ? 'Edit PT Package' : 'New PT Package'}
                subtitle={editingPackage ? 'Update existing package details' : 'Define a new personal training offering'}
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <Button
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            loading={isSubmitting}
                            onClick={handleCreatePackage}
                        >
                            {editingPackage ? 'Update Package' : 'Create Package'}
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleCreatePackage} className="space-y-6">
                    <div className="saas-form-group">
                        <label className="saas-label">Package Name *</label>
                        <input
                            required
                            placeholder="e.g. 10 Sessions Platinum"
                            className="saas-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="saas-form-group">
                        <label className="saas-label">Type *</label>
                        <select
                            className="saas-input cursor-pointer"
                            value={formData.sessionType}
                            onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                        >
                            <option value="Fixed Sessions">Fixed Sessions</option>
                            <option value="Monthly">Monthly Unlimited</option>
                            <option value="Pay Per Session">Pay Per Session</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="saas-form-group">
                            <label className="saas-label">Sessions *</label>
                            <input
                                type="number"
                                required
                                className="saas-input"
                                value={formData.totalSessions}
                                onChange={(e) => setFormData({ ...formData, totalSessions: e.target.value })}
                            />
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label">Price (₹) *</label>
                            <input
                                type="number"
                                required
                                className="saas-input"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                        <div>
                            <label className="saas-label !mb-1">Tax Management</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none"
                                    value={formData.gstPercent}
                                    onChange={(e) => setFormData({ ...formData, gstPercent: e.target.value })}
                                />
                                <span className="text-[10px] font-bold text-slate-400">% GST</span>
                            </div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inclusive</span>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.gstInclusive ? 'bg-primary' : 'bg-slate-200'}`}>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={formData.gstInclusive}
                                    onChange={() => setFormData({ ...formData, gstInclusive: !formData.gstInclusive })}
                                />
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.gstInclusive ? 'translate-x-5' : ''}`} />
                            </div>
                        </label>
                    </div>

                    <div className="saas-form-group">
                        <label className="saas-label">Validity (Days)</label>
                        <input
                            type="number"
                            className="saas-input"
                            value={formData.validityDays}
                            onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                        />
                    </div>

                    <div className="saas-form-group">
                        <label className="saas-label">Description</label>
                        <textarea
                            rows={3}
                            className="saas-input resize-none"
                            placeholder="Package details and benefits..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </form>
            </RightDrawer>

            {/* Side Panel Drawer for Assigning Package */}
            <RightDrawer
                isOpen={isAssignDrawerOpen}
                onClose={() => !isSubmitting && setIsAssignDrawerOpen(false)}
                title="Assign PT Package"
                subtitle="Assign a personal training package to a member"
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <Button
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => setIsAssignDrawerOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            loading={isSubmitting}
                            onClick={handleAssignPackage}
                        >
                            Assign Package
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleAssignPackage} className="space-y-6">
                    <div className="saas-form-group">
                        <label className="saas-label">Select Member *</label>
                        <select
                            required
                            className="saas-input cursor-pointer"
                            value={assignData.memberId}
                            onChange={(e) => setAssignData({ ...assignData, memberId: e.target.value })}
                        >
                            <option value="">Choose a member</option>
                            {members.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.name} ({member.memberId})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="saas-form-group">
                        <label className="saas-label">Select Package *</label>
                        <select
                            required
                            className="saas-input cursor-pointer"
                            value={assignData.packageId}
                            onChange={(e) => setAssignData({ ...assignData, packageId: e.target.value })}
                        >
                            <option value="">Choose a package</option>
                            {packages.filter(p => p.status === 'Active').map(pkg => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name} - ₹{pkg.price} ({pkg.totalSessions} Sessions)
                                </option>
                            ))}
                        </select>
                    </div>
                </form>
            </RightDrawer>

            {/* Side Panel Drawer for Scheduling Session */}
            <RightDrawer
                isOpen={isSessionDrawerOpen}
                onClose={() => !isSubmitting && setIsSessionDrawerOpen(false)}
                title="Schedule PT Session"
                subtitle="Assign a session to a member's package"
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full justify-end">
                        <Button
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => setIsSessionDrawerOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            loading={isSubmitting}
                            onClick={handleLogSession}
                        >
                            Schedule Session
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleLogSession} className="space-y-6">
                    <div className="saas-form-group">
                        <label className="saas-label">Member Package *</label>
                        <select
                            required
                            className="saas-input cursor-pointer"
                            value={sessionData.ptAccountId}
                            onChange={(e) => {
                                const aid = e.target.value;
                                const account = activeAccounts.find(acc => acc.id === parseInt(aid));
                                setSessionData({
                                    ...sessionData,
                                    ptAccountId: aid,
                                    memberId: account ? account.memberId : '',
                                    trainerId: sessionData.trainerId || (account?.trainerId || trainers[0]?.id || '')
                                });
                            }}
                        >
                            <option value="">Select active package</option>
                            {activeAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.member?.name} - {acc.package?.name} ({acc.remainingSessions} Left)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="saas-form-group">
                            <label className="saas-label">Date *</label>
                            <input
                                type="date"
                                required
                                className="saas-input"
                                value={sessionData.date}
                                onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })}
                            />
                        </div>
                        <div className="saas-form-group">
                            <label className="saas-label">Time *</label>
                            <input
                                type="time"
                                required
                                className="saas-input"
                                value={sessionData.time}
                                onChange={(e) => setSessionData({ ...sessionData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="saas-form-group">
                        <label className="saas-label">Duration (min)</label>
                        <input
                            type="number"
                            className="saas-input"
                            value={sessionData.duration}
                            onChange={(e) => setSessionData({ ...sessionData, duration: e.target.value })}
                        />
                    </div>

                    <div className="saas-form-group">
                        <label className="saas-label">Trainer Notes</label>
                        <textarea
                            rows={3}
                            className="saas-input resize-none"
                            placeholder="Workout focus, observations..."
                            value={sessionData.notes}
                            onChange={(e) => setSessionData({ ...sessionData, notes: e.target.value })}
                        />
                    </div>
                </form>
            </RightDrawer>
        </div>
    );
};

const KPICard = ({ title, value, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-primary-light text-primary',
        indigo: 'bg-primary-light text-primary',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600'
    };

    return (
        <div className="saas-card !p-5 md:!p-8 hover:-translate-y-1 transition-all group overflow-hidden relative flex flex-col justify-center min-h-[110px] md:min-h-[140px]">
            <div className="flex items-center gap-4 md:gap-6 relative z-10">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-sm shadow-black/5`}>
                    <Icon size={24} className="md:w-8 md:h-8" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                    <h3 className="saas-label !mb-1 truncate">{title}</h3>
                    <p className="text-xl md:text-3xl font-black text-slate-900 group-hover:text-primary transition-colors truncate tracking-tight">{value}</p>
                </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-slate-50/50 rounded-full group-hover:scale-125 transition-all duration-700 ease-out" />
        </div>
    );
};

export default PTSessions;
