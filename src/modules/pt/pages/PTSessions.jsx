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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="saas-container p-4 md:p-6 space-y-6">
            {/* Header Area */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">PT Sessions</h1>
                    <p className="text-slate-500 text-[10px] md:text-sm font-medium uppercase tracking-widest mt-1">Manage personal training packages and sessions</p>
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
                <div className="flex flex-col xs:flex-row xs:items-center justify-between px-4 md:px-6 border-b border-slate-100 bg-white gap-4">
                    <div className="flex items-center overflow-x-auto no-scrollbar scrollbar-hide -mb-px">
                        {[
                            { id: 'packages', label: 'Packages' },
                            { id: 'active', label: 'Active' },
                            { id: 'sessions', label: 'Sessions' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 md:px-6 py-4 md:py-5 text-xs md:text-sm font-bold transition-all relative whitespace-nowrap flex items-center justify-center ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {activeTab !== 'packages' && (
                        <div className="py-2 xs:py-0 w-full xs:w-auto flex justify-center xs:justify-end">
                            <button
                                onClick={() => setIsSessionDrawerOpen(true)}
                                className="w-full xs:w-auto px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
                            >
                                <Calendar size={16} strokeWidth={2.5} />
                                Schedule Session
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
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-[11px] md:text-sm font-semibold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                        {activeTab === 'packages' && (
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${showInactive ? 'bg-indigo-600' : 'bg-slate-200'}`}>
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
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors">
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
                                                <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(pkg)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                                                            className="h-full bg-blue-500 rounded-full"
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
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sess.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
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
            {isSidebarOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{editingPackage ? 'Edit PT Package' : 'Add PT Package'}</h2>
                                <p className="text-xs text-slate-500">Define a new personal training package</p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Form */}
                        <form onSubmit={handleCreatePackage} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Package Name *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. 10 Sessions Package"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session Type *</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                                        value={formData.sessionType}
                                        onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                                    >
                                        <option value="Fixed Sessions">Per Session (Fixed sessions)</option>
                                        <option value="Monthly">Monthly Unlimited</option>
                                        <option value="Pay Per Session">Pay Per Session</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sessions *</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            value={formData.totalSessions}
                                            onChange={(e) => setFormData({ ...formData, totalSessions: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (₹) *</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">GST %</label>
                                        <input
                                            type="number"
                                            className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                                            value={formData.gstPercent}
                                            onChange={(e) => setFormData({ ...formData, gstPercent: e.target.value })}
                                        />
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">GST Inclusive</span>
                                        <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.gstInclusive ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.gstInclusive}
                                                onChange={() => setFormData({ ...formData, gstInclusive: !formData.gstInclusive })}
                                            />
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.gstInclusive ? 'translate-x-6' : ''}`} />
                                        </div>
                                    </label>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Validity (days)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 90"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={formData.validityDays}
                                        onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                                    <textarea
                                        placeholder="Package details..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePackage}
                                disabled={isSubmitting}
                                className="flex-[2] px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? 'Processing...' : (editingPackage ? 'Update Package' : 'Add Package')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Side Panel Drawer for Scheduling Session */}
            {isSessionDrawerOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSessionDrawerOpen(false)} />
                    <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Schedule PT Session</h2>
                                <p className="text-xs text-slate-500">Book a personal training session</p>
                            </div>
                            <button onClick={() => setIsSessionDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleLogSession} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member Package *</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
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
                                    <option value="">Select member package</option>
                                    {activeAccounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.member?.name} - {acc.package?.name} ({acc.remainingSessions} Left)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time *</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        value={sessionData.date}
                                        onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })}
                                    />
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        value={sessionData.time}
                                        onChange={(e) => setSessionData({ ...sessionData, time: e.target.value })}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 italic pl-1">dd-mm-yyyy --:--</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration (minutes)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                    value={sessionData.duration}
                                    onChange={(e) => setSessionData({ ...sessionData, duration: e.target.value })}
                                />
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/10 flex gap-4">
                            <button
                                onClick={() => setIsSessionDrawerOpen(false)}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogSession}
                                disabled={isSubmitting}
                                className="flex-[2] px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 transition-all text-sm shadow-md"
                            >
                                {isSubmitting ? 'Processing...' : 'Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KPICard = ({ title, value, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600'
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative flex flex-col justify-center min-h-[100px] md:min-h-[130px]">
            <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 relative z-10">
                <div className={`p-2.5 md:p-3 rounded-lg md:rounded-2xl ${colorClasses[color]} group-hover:scale-110 transition-transform shrink-0`}>
                    <Icon size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 text-center md:text-left">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{title}</h3>
                    <p className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{value}</p>
                </div>
            </div>

            {/* Background Accent */}
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-50 flex items-center justify-center opacity-50 group-hover:scale-125 transition-transform ${colorClasses[color].split(' ')[0]}`} />
        </div>
    );
};

export default PTSessions;
