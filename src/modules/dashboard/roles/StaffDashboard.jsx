import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    UserPlus,
    Calendar,
    CheckCircle,
    Clock,
    TrendingUp,
    Search,
    IndianRupee,
    ArrowUpRight,
    MessageCircle,
    Activity,
    LogOut,
    Plus,
    ShoppingCart,
    FileText,
    Receipt,
    GitBranch,
    LayoutDashboard,
    ChevronRight,
    Loader
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import QRScannerModal from '../../../components/common/QRScannerModal';
import { scanAttendance } from '../../../api/member/attendanceApi';
import Card from '../../../components/ui/Card';
import StatsCard from '../components/StatsCard';
import DashboardGrid from '../components/DashboardGrid';
import { useAuth } from '../../../context/AuthContext';
import { useBranchContext } from '../../../context/BranchContext';
import apiClient from '../../../api/apiClient';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { selectedBranch } = useBranchContext();

    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
    });

    const fetchAll = async () => {
        try {
            setLoading(true);
            const queryParams = selectedBranch !== 'all' ? { tenantId: selectedBranch } : {};

            const response = await apiClient.get('/dashboard/staff', { params: queryParams });
            const data = response.data;

            // Try to get branch name
            let branchName = 'All Branches';
            if (selectedBranch !== 'all') {
                try {
                    const branchesRes = await apiClient.get('/branches');
                    const myBranch = branchesRes.data?.find(b => b.id === parseInt(selectedBranch));
                    if (myBranch) branchName = myBranch.name || myBranch.branchName;
                } catch { /* Silent */ }
            }

            setDashData({
                branchName,
                todayCheckIns: data.checkinsToday || 0,
                checkIns: data.checkins || [],
                invoicesCount: data.pendingPayments || 0,
                leads: data.newEnquiries || 0,
                activeLeads: data.newEnquiries || 0,
                pendingActions: data.pendingActions || [],
                expiring: data.renewalAlerts?.expiringSoon || [],
                tasks: data.equipmentAlerts || [],
            });
        } catch (err) {
            console.error('StaffDashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [selectedBranch]);

    const handleScanSuccess = async (decodedText) => {
        setIsScannerOpen(false);
        const loadingToast = toast.loading('Marking attendance...');
        try {
            const result = await scanAttendance(decodedText);
            if (result.success) {
                toast.success(result.message, { id: loadingToast });
                fetchAll();
            } else {
                toast.error(result.message, { id: loadingToast });
            }
        } catch (error) {
            toast.error('An unexpected error occurred', { id: loadingToast });
        }
    };

    const quickActions = [
        { icon: UserPlus, label: 'Add Member', path: '/staff/members/add', color: 'bg-emerald-50 text-emerald-600' },
        { icon: CheckCircle, label: 'Check-in', path: '/staff/attendance/check-in', color: 'bg-blue-50 text-blue-600' },
        { icon: Activity, label: 'Scan Attendance', onClick: () => setIsScannerOpen(true), color: 'bg-violet-50 text-violet-600' },
        { icon: IndianRupee, label: 'Payments', path: '/finance/pos', color: 'bg-amber-50 text-amber-600' },
        { icon: FileText, label: 'View Invoices', path: '/finance/invoices', color: 'bg-rose-50 text-rose-600' },
    ];

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatTime = (dt) => {
        if (!dt) return '—';
        return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const daysUntilExpiry = (date) => {
        if (!date) return null;
        const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    if (loading && !dashData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen animate-fadeIn">
            {/* Header */}
            <div className="mb-6 sm:mb-10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-2xl sm:rounded-3xl blur-2xl opacity-10"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Hello, {user?.name?.split(' ')[0] || 'Staff'}!
                        </h1>
                        <p className="text-slate-500 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em]">
                            {dashData?.branchName || 'Main Branch'} • {today}
                        </p>
                    </div>
                    <div className="flex items-center">
                        <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-primary text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-200">
                            Staff Portal
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center shadow-sm">
                        <LayoutDashboard size={18} />
                    </div>
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-6 px-1 md:px-0">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick || (() => navigate(action.path))}
                            className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-primary/10 hover:border-violet-200 transition-all duration-300 group flex flex-col items-center text-center gap-2 sm:gap-4"
                        >
                            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${action.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm`}>
                                <action.icon size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-primary leading-tight">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <DashboardGrid>
                <StatsCard
                    title="Today's Check-ins"
                    value={dashData?.todayCheckIns ?? 0}
                    trend={`${dashData?.checkIns?.length ?? 0} recent`}
                    icon={CheckCircle}
                    color="primary"
                    isEarningsLayout={true}
                />
                <StatsCard
                    title="Pending Invoices"
                    value={dashData?.invoicesCount ?? 0}
                    icon={Receipt}
                    color="danger"
                    isEarningsLayout={true}
                />
                <StatsCard
                    title="Active Leads"
                    value={dashData?.activeLeads ?? 0}
                    icon={GitBranch}
                    color="success"
                    isEarningsLayout={true}
                />
                <StatsCard
                    title="Expiring Soon"
                    value={dashData?.expiring?.length ?? 0}
                    trend="next 30 days"
                    icon={Clock}
                    color="warning"
                    isEarningsLayout={true}
                />
            </DashboardGrid>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* Recent Check-ins */}
                    <Card className="border-none overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200/50 bg-white p-4 sm:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">Recent Check-ins</h3>
                            <button
                                onClick={() => navigate('/staff/attendance/today')}
                                className="px-5 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-violet-200 transition-all duration-300 border border-slate-100"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {dashData?.checkIns?.length > 0 ? (
                                dashData.checkIns.slice(0, 4).map((c, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] group hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-200 transition-all duration-500 cursor-pointer">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm shadow-inner">
                                                {getInitials(c.member?.name || c.user?.name || c.name || 'Member')}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.member?.name || c.user?.name || c.name || 'Member'}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{c.member?.memberId || c.memberId || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="text-base font-black text-slate-900 tracking-tight">{formatTime(c.checkIn || c.createdAt)}</div>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{c.status || 'Active'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-300 text-xs font-black uppercase tracking-widest">No check-ins today</div>
                            )}
                        </div>
                    </Card>

                    {/* Pending Actions */}
                    <Card className="border-none overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200/50 bg-white p-4 sm:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">Pending Actions</h3>
                            <button
                                onClick={() => navigate('/crm/pipeline')}
                                className="px-5 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-violet-200 transition-all duration-300 border border-slate-100"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {dashData?.pendingActions?.length > 0 ? (
                                dashData.pendingActions.slice(0, 4).map((action, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] group hover:bg-white hover:shadow-xl hover:shadow-primary/30/5 hover:border-violet-200 transition-all duration-500 cursor-pointer">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-light to-violet-100 text-primary flex items-center justify-center font-black text-sm shadow-inner">
                                                {getInitials(action.title)}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{action.title}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{action.subtitle}</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-1.5 text-white text-[9px] font-black rounded-xl uppercase tracking-widest shadow-lg ${action.type === 'Payment' ? 'bg-rose-600 shadow-rose-100' : 'bg-amber-500 shadow-amber-100'}`}>
                                            {action.type || 'Action'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-300 text-xs font-black uppercase tracking-widest">No pending actions</div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Expiring Soon */}
                    <Card className="border-none overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200/50 bg-white p-4 sm:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">Expiring Soon</h3>
                            <button
                                onClick={() => navigate('/members/renewal-alerts')}
                                className="px-5 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-violet-200 transition-all duration-300 border border-slate-100"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {dashData?.expiring?.length > 0 ? (
                                dashData.expiring.slice(0, 4).map((m, idx) => {
                                    const days = daysUntilExpiry(m.endDate);
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-5 bg-rose-50/50 border border-rose-100 rounded-[2rem] group hover:bg-white hover:shadow-xl hover:shadow-rose-500/5 hover:border-rose-300 transition-all duration-500 cursor-pointer">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white text-rose-500 flex items-center justify-center shadow-lg shadow-rose-100/50 border border-rose-100 group-hover:scale-110 transition-transform duration-500">
                                                    <Clock size={28} strokeWidth={2.5} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{m.memberName}</h4>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{m.planName || 'No plan'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`px-4 py-1.5 text-white text-[9px] font-black rounded-xl uppercase tracking-widest shadow-lg ${days === 0 ? 'bg-rose-600 shadow-rose-100' : 'bg-amber-500 shadow-amber-100'}`}>
                                                    {days === 0 ? 'Today' : days !== null ? `${days}d left` : 'Expired'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center text-slate-300 text-xs font-black uppercase tracking-widest">No expiring memberships</div>
                            )}
                        </div>
                    </Card>

                    {/* Equipment Alerts */}
                    <Card className="border-none overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200/50 bg-white p-4 sm:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">Equipment Alerts</h3>
                            <button
                                onClick={() => navigate('/operations/equipment')}
                                className="px-5 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-violet-200 transition-all duration-300 border border-slate-100"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-5">
                            {dashData?.tasks?.length > 0 ? (
                                dashData.tasks.slice(0, 5).map((task, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] group hover:bg-white hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-200 transition-all duration-500 cursor-pointer">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-xl bg-white text-slate-400 flex items-center justify-center border border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-500 group-hover:border-amber-200 transition-all duration-300 shadow-sm">
                                                <div className="w-4 h-4 border-2 border-current rounded-md" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-slate-900 tracking-tight">{task.equipmentName || task.issue || 'Equipment Issue'}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    Status: <span className="text-amber-600">{task.status || 'Pending'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-300 text-xs font-black uppercase tracking-widest">No equipment alerts</div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
            <QRScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
                title="Staff Attendance Scan"
            />
        </div>
    );
};

export default StaffDashboard;
