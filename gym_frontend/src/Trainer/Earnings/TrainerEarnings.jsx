import React, { useState, useEffect } from 'react';
import { getTrainerEarnings } from '../../api/trainer/trainerApi';
import {
    Banknote,
    TrendingUp,
    DollarSign,
    Download,
    ChevronDown,
    ChevronUp,
    Calendar,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    Dumbbell
} from 'lucide-react';
import StatsCard from '../../modules/dashboard/components/StatsCard';
import DashboardGrid from '../../modules/dashboard/components/DashboardGrid';
import MobileCard from '../../components/common/MobileCard';

// Simulated Logged-In User ID (In a real app, this comes from context/auth)
const CURRENT_TRAINER_ID = 'T-101';

const TrainerEarnings = () => {
    const [expandedMonth, setExpandedMonth] = useState(null);
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

    const [earningsData, setEarningsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const data = await getTrainerEarnings();
                setEarningsData(data);
            } catch (error) {
                console.error("Failed to load earnings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium tracking-tight">Loading your earnings...</p>
        </div>
    );
    if (!earningsData) return <div className="p-8 text-center text-gray-500 min-h-screen bg-slate-50">Access Denied or Failed to Load</div>;

    const toggleDetails = (id) => {
        setExpandedMonth(expandedMonth === id ? null : id);
    };

    const handleDownloadReport = () => {
        alert("Downloading your earnings report... Your statement will be ready shortly.");
        // Logic for generating PDF/CSV would go here
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border border-amber-200';
            case 'Processing': return 'bg-blue-100 text-blue-700 border border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 animate-fadeIn font-sans">

            {/* Header - Matching TrainerDashboard Style */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl blur-2xl opacity-15 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 p-6 sm:p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-violet-200 transform hover:scale-105 transition-transform duration-300 group flex-shrink-0">
                                <Banknote size={28} className="sm:w-9 sm:h-9 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                                        My Earnings
                                    </h1>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full border border-emerald-200">
                                        Secure View
                                    </span>
                                </div>
                                <p className="text-slate-500 font-medium text-sm sm:text-lg">Track your salary, commissions, and bonuses.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleDownloadReport}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-xl font-bold hover:border-violet-200 hover:text-violet-600 hover:shadow-lg transition-all w-full sm:w-auto"
                        >
                            <Download size={18} />
                            Download Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Stat Cards - Reusing Dashboard Components */}
            <DashboardGrid>
                <StatsCard
                    title="Monthly Base Pay"
                    value={`${earningsData.summary.currency}${earningsData.summary.baseSalary.toLocaleString()}`}
                    icon={Banknote}
                    color="primary" // Blue
                />
                <StatsCard
                    title="Commission Rate"
                    value={`${earningsData.summary.commissionRate}%`}
                    icon={TrendingUp}
                    color="success" // Emerald
                    trend="+2%"
                />
                <StatsCard
                    title={`Commission (${earningsData.summary.currentMonthName})`}
                    value={`${earningsData.summary.currency}${earningsData.summary.currentMonthCommission.toLocaleString()}`}
                    icon={Users}
                    color="warning" // Amber
                />
                <StatsCard
                    title={`Total Earnings (${earningsData.summary.currentMonthName})`}
                    value={`${earningsData.summary.currency}${earningsData.summary.currentMonthTotal.toLocaleString()}`}
                    icon={DollarSign}
                    color="primary" // Blue
                />
            </DashboardGrid>

            {/* Earnings Breakdown */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Calendar size={24} className="text-violet-600" /> Earnings History
                    </h3>
                    <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto">
                        {[...new Set(earningsData.history.map(item => item.year))].sort((a, b) => b - a).map(year => (
                            <button
                                key={year}
                                onClick={() => setYearFilter(year)}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${yearFilter === year ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Desktop Table (Hidden on Mobile) */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Salary</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bonus</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {earningsData.history.filter(record => record.year === yearFilter).map((record) => (
                                <React.Fragment key={record.id}>
                                    <tr className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 text-sm font-bold text-slate-900">{record.month}</td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-500">₹{record.baseSalary.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-sm font-bold text-emerald-600">+₹{record.commission.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-500">{record.bonus > 0 ? `+₹${record.bonus.toLocaleString()}` : '-'}</td>
                                        <td className="px-6 py-5 text-sm font-black text-slate-900">₹{record.total.toLocaleString()}</td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${getStatusStyle(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => toggleDetails(record.id)}
                                                className="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                                            >
                                                {expandedMonth === record.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Expandable Commission Details */}
                                    {expandedMonth === record.id && (
                                        <tr className="bg-slate-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <td colSpan="7" className="px-6 py-6">
                                                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Commission Breakdown • {record.month}</h4>
                                                    {record.details.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {record.details.map((detail) => (
                                                                <div key={detail.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-violet-200 transition-colors">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">
                                                                            {detail.member.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-bold text-slate-900">{detail.member}</p>
                                                                            <p className="text-[10px] text-slate-500">{detail.type}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-xs font-black text-emerald-600">+₹{detail.amount.toLocaleString()}</span>
                                                                        <p className="text-[9px] text-slate-400">{detail.date}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic">No detailed commission data available.</p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {earningsData.history.filter(record => record.year === yearFilter).map((record) => (
                        <div key={record.id}>
                            <MobileCard
                                title={record.month}
                                subtitle={`Base: ₹${record.baseSalary.toLocaleString()}`}
                                status={record.status}
                                statusColor={record.status === 'Paid' ? 'emerald' : 'amber'}
                                badge={`₹${record.total.toLocaleString()}`}
                                badgeColor="violet"
                                icon={Banknote}
                                actions={[
                                    {
                                        label: expandedMonth === record.id ? 'Hide Details' : 'View Breakdown',
                                        onClick: () => toggleDetails(record.id),
                                        variant: 'secondary'
                                    }
                                ]}
                            />
                            {expandedMonth === record.id && (
                                <div className="mt-2 ml-4 pl-4 border-l-2 border-slate-100 space-y-2 pb-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Commission Details</h4>
                                    {record.details.length > 0 ? (
                                        record.details.map((detail) => (
                                            <div key={detail.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">{detail.member}</p>
                                                    <p className="text-[10px] text-slate-500">{detail.type}</p>
                                                </div>
                                                <span className="text-xs font-black text-emerald-600">+₹{detail.amount.toLocaleString()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No details available.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainerEarnings;
