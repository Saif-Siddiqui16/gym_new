import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '../../../components/ui/Card';
import {
    Calendar,
    User,
    CheckCircle,
    Clock,
    Users,
    TrendingUp,
    Dumbbell,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useBranchContext } from '../../../context/BranchContext';
import * as trainerApi from '../../../api/trainer/trainerApi';
import { toast } from 'react-hot-toast';
import QRScannerModal from '../../../components/common/QRScannerModal';
import { scanAttendance } from '../../../api/member/attendanceApi';
import { Activity } from 'lucide-react';

const TrainerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(true);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [data, setData] = useState({
        stats: {
            activeGeneralClients: 0,
            ptClientsCount: 0,
            todaySessionsCount: 0,
            completedToday: 0,
            pendingToday: 0,
            myClassesCount: 0,
            completionRate: 0
        },
        todaySessions: [],
        myClients: [],
        upcomingClass: null
    });

    useEffect(() => {
        loadDashboardData();
    }, [selectedBranch]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const response = await trainerApi.getTrainerDashboardStats(selectedBranch);
            setData(response);
        } catch (error) {
            console.error('Error loading trainer dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleScanSuccess = async (decodedText) => {
        setIsScannerOpen(false);
        const loadingToast = toast.loading('Marking attendance...');
        try {
            const result = await scanAttendance(decodedText);
            if (result.success) {
                toast.success(result.message, { id: loadingToast });
                loadDashboardData(); // Refresh stats
            } else {
                toast.error(result.message, { id: loadingToast });
            }
        } catch (error) {
            toast.error('An unexpected error occurred', { id: loadingToast });
        }
    };

    // Stat Card internal component
    const StatItem = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => {
        const colorClasses = {
            primary: { bg: 'bg-primary-light', text: 'text-primary' },
            success: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
            warning: { bg: 'bg-amber-50', text: 'text-amber-600' },
        };
        const currentStyle = colorClasses[color] || colorClasses.primary;

        return (
            <div className="saas-card group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-center min-h-[140px]">
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl ${currentStyle.bg} ${currentStyle.text} flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-sm`}>
                        {Icon && <Icon size={28} strokeWidth={2} />}
                    </div>
                    <div className="min-w-0">
                        <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate">{value}</div>
                        <div className="saas-label !mb-0 truncate">{title}</div>
                    </div>
                </div>
                {subtitle && (
                    <div className="mt-3 pt-3 border-t border-slate-50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subtitle}</span>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="saas-page space-y-8">
            {/* Header Section */}
            <div className="saas-card !p-8 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">Welcome, {user?.name || 'Trainer'}!</h1>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-primary-light text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                {selectedBranch === 'all' ? 'All Branches' : 'Assigned Branch'}
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Personal Training</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Alerts / Quick Stats Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatItem title="General Clients" value={data.stats.activeGeneralClients} subtitle="Active general training" icon={Users} color="primary" />
                <StatItem title="PT Clients" value={data.stats.ptClientsCount} subtitle="Personal training" icon={User} color="success" />
                <StatItem title="Today's Sessions" value={data.stats.todaySessionsCount} subtitle={`${data.stats.completedToday}/${data.stats.todaySessionsCount} completed`} icon={Calendar} color="warning" />
                <StatItem title="My Classes" value={data.stats.myClassesCount} subtitle="Upcoming classes" icon={Dumbbell} color="primary" />
            </div>

            {/* Financial & Attendance Stats Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatItem title="Commission" value={`₹${(data.stats.monthlyCommission || 0).toLocaleString()}`} subtitle="This Month (PT + General)" icon={TrendingUp} color="success" />
                <StatItem title="Attendance" value={`${data.stats.monthlyAttendance || 0} Days`} subtitle="Present this month" icon={Activity} color="primary" />
                <StatItem title="Total Salary" value={`₹${(data.stats.salary || 0).toLocaleString()}`} subtitle="Base + Commission (Est.)" icon={CheckCircle} color="success" />
            </div>


            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-4 px-1">
                <button
                    onClick={() => navigate('/trainer/members/assigned')}
                    className="h-12 px-8 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-100 hover:bg-primary-hover hover:-translate-y-0.5 transition-all flex items-center justify-center"
                >
                    View My Clients
                </button>
                <button
                    onClick={() => navigate('/trainer/sessions/calendar')}
                    className="h-12 px-8 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center"
                >
                    Manage Sessions
                </button>
                <button
                    onClick={() => navigate('/workout-plans')}
                    className="h-12 px-8 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center"
                >
                    Create Fitness Plan
                </button>
                <button
                    onClick={() => setIsScannerOpen(true)}
                    className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/10 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                    <Activity size={16} strokeWidth={3} />
                    Scan Attendance
                </button>
            </div>


            {/* Content Body Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                {/* Left Column (Span 2) */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Section: Today's Sessions */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                                <Clock size={16} />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Today's Sessions</h2>
                        </div>
                        {data.todaySessions.length > 0 ? (
                            data.todaySessions.map((session) => (
                                <Card key={session.id} className="p-0 border-2 border-violet-100 shadow-2xl shadow-violet-100/20 overflow-hidden bg-white group cursor-pointer hover:border-violet-300 transition-all mb-4">
                                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between border-l-8 border-primary gap-4">
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-900 font-black text-xl sm:text-2xl group-hover:scale-110 transition-transform shrink-0">
                                                {session.member?.name?.charAt(0) || 'M'}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight mb-1 group-hover:text-primary transition-colors truncate">{session.member?.name}</h4>
                                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-tight">
                                                        <Clock size={12} className="text-slate-300 md:w-[14px] md:h-[14px]" />
                                                        {session.time}
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-slate-300 hidden xs:block" />
                                                    <span className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-tight">{session.duration} min</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                                            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${session.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                                                }`}>
                                                {session.status.toLowerCase()}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                                    <Calendar size={28} />
                                </div>
                                <h3 className="text-slate-900 font-black text-lg mb-1">No sessions today</h3>
                                <p className="text-slate-500 text-sm font-medium">You don't have any sessions scheduled for today.</p>
                            </div>
                        )}
                    </div>

                    {/* Section: My Clients */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                                    <Users size={16} />
                                </div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">My Clients</h2>
                            </div>
                            <button
                                onClick={() => navigate('/trainer/members/assigned')}
                                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-4 py-1.5 bg-primary-light/50 rounded-full transition-all active:scale-95"
                            >
                                View All
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.myClients.length > 0 ? (
                                data.myClients.map((client, i) => (
                                    <Card key={client.id} className="p-5 border-2 border-slate-50 hover:border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer bg-white group">
                                        <div className="flex flex-col items-center text-center p-2">
                                            <div className="w-16 h-16 mb-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 font-black text-3xl group-hover:scale-110 transition-transform">
                                                {client.name.charAt(0)}
                                            </div>
                                            <h4 className="font-black text-slate-900 text-base tracking-tight mb-1 group-hover:text-primary">{client.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Member</p>
                                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {client.status}
                                            </span>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
                                    <p className="text-slate-500 text-sm font-medium">No clients assigned to you yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Span 1) */}
                <div className="space-y-8">

                    {/* Section: My Upcoming Classes */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Dumbbell size={16} />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upcoming Class</h2>
                        </div>
                        {data.upcomingClass ? (
                            <Card className="p-0 border-2 border-emerald-100 shadow-2xl shadow-emerald-100/20 overflow-hidden bg-white group cursor-pointer hover:border-emerald-300 transition-all">
                                <div className="p-5 md:p-6 border-t-8 border-emerald-600">
                                    <div className="flex justify-between items-start mb-4 md:mb-6">
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-900 text-xl md:text-2xl tracking-tight mb-1 group-hover:text-emerald-600 transition-colors truncate">{data.upcomingClass.name}</h4>
                                            <p className="text-emerald-600 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-2 md:mb-4">{data.upcomingClass.requiredBenefit || 'General'}</p>
                                        </div>
                                        <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse shrink-0 mt-2" />
                                    </div>
                                    <div className="space-y-4 px-2">
                                        <div className="flex items-center gap-4 text-slate-600 group-hover:translate-x-1 transition-transform">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                <Calendar size={16} />
                                            </div>
                                            <span className="text-sm font-black text-slate-700">{data.upcomingClass.schedule}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-600 group-hover:translate-x-1 transition-transform delay-75">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                <Users size={16} />
                                            </div>
                                            <span className="text-sm font-black text-slate-700">Capacity: {data.upcomingClass.maxCapacity}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/trainer/sessions/calendar')}
                                        className="w-full py-3 sm:py-3.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-100"
                                    >
                                        View Class Roster
                                    </button>
                                </div>
                            </Card>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
                                <p className="text-slate-500 text-sm font-medium">No upcoming classes.</p>
                            </div>
                        )}
                    </div>
                    {/*
                    
                    <div className="p-8 bg-gradient-to-br from-primary to-primary-hover rounded-[2rem] text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-400/20 rounded-full blur-2xl" />

                        <div className="relative z-10">
                            <h4 className="text-xl font-black tracking-tight mb-2">Trainer Pro Tips</h4>
                            <p className="text-xs text-white/70 font-bold mb-8 leading-relaxed">Personalized tracking leads to 40% higher member retention. Update your plans today!</p>
                            <button className="px-6 py-3 bg-white text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-light transition-colors shadow-lg">
                                Explore Insights
                            </button>
                        </div>

                    </div>
*/}
                </div>
            </div>
            <QRScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
                title="Trainer Attendance Scan"
            />
        </div>
    );
};

export default TrainerDashboard;
