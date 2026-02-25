import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import StatsCard from '../components/StatsCard';
import DashboardGrid from '../components/DashboardGrid';
import SectionHeader from '../components/SectionHeader';
import { Building, Users, Activity, IndianRupee, MapPin, ArrowRight, AlertTriangle, Server, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { getDashboardStats, getRecentGyms, getSystemAlerts } from '../../../api/superadmin/superAdminApi';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState([]);
    const [recentRegistrations, setRecentRegistrations] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const iconMap = {
        'Total Gyms': Building,
        'Total Members': Users,
        'Active Plans': Activity,
        'Monthly Revenue': IndianRupee,
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, gymsData, alertsData] = await Promise.all([
                getDashboardStats(),
                getRecentGyms(),
                getSystemAlerts()
            ]);

            // Map icons based on titles
            const statsWithIcons = statsData.map(stat => ({
                ...stat,
                icon: iconMap[stat.title] || Activity
            }));

            setStats(statsWithIcons);
            setRecentRegistrations(gymsData);
            setAlerts(alertsData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Authorizing System Access...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-900 mb-2">Oops!</h2>
                    <p className="text-red-700 mb-6">{error}</p>
                    <Button onClick={fetchDashboardData} className="bg-red-600 hover:bg-red-700 text-white border-none">
                        Retry Loading
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8 space-y-8 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Enhanced Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">System Overview</h1>
                    <p className="text-gray-600 text-sm">Monitor platform performance and recent activity</p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">All Systems Operational</span>
                </div>
            </div>

            {/* Stats Grid with Section Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={20} className="text-indigo-600" />
                        <h2 className="text-lg font-bold text-gray-800">Key Metrics</h2>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        Updated just now
                    </span>
                </div>
                <DashboardGrid>
                    {stats.map(stat => (
                        <StatsCard key={stat.id} {...stat} />
                    ))}
                </DashboardGrid>
            </div>

            {/* Main Content & Sidebar Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Registrations Table */}
                <div className="lg:col-span-2 space-y-4 min-w-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">Recent Gym Registrations</h2>
                        <Button
                            variant="outline"
                            size="small"
                            className="group hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-600 border-indigo-200 font-semibold transition-all duration-300"
                        >
                            View All
                            <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                    <Card className="overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Gym Name</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 hidden sm:table-cell">Location</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 hidden md:table-cell">Date</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentRegistrations.length > 0 ? (
                                        recentRegistrations.map(gym => (
                                            <tr key={gym.id} className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200 cursor-pointer">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                                                            {gym.gymName?.charAt(0) || 'G'}
                                                        </div>
                                                        <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                                                            {gym.gymName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-7 h-7 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                                            <MapPin size={13} className="text-indigo-500" />
                                                        </div>
                                                        <span className="font-medium truncate">{gym.location || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap hidden md:table-cell">
                                                    {gym.createdAt ? new Date(gym.createdAt).toISOString().split('T')[0] : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm transition-all duration-300 group-hover:scale-105 whitespace-nowrap ${gym.status === 'Active'
                                                        ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200'
                                                        : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200'
                                                        }`}>
                                                        {gym.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500 font-medium">
                                                No recent registrations found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* System Alerts / Sidebar */}
                <div className="lg:col-span-1 space-y-4 min-w-0">
                    <h2 className="text-lg font-bold text-gray-800">System Alerts</h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {alerts.length > 0 ? (
                            alerts.map(alert => (
                                <div key={alert.id} className={`bg-white rounded-xl border-l-4 ${alert.type === 'danger' ? 'border-red-500 bg-gradient-to-r from-red-50/80 to-white' : 'border-amber-500 bg-gradient-to-r from-amber-50/80 to-white'} shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}>
                                    <div className="flex items-start gap-3 p-4">
                                        <div className={`w-10 h-10 flex-shrink-0 bg-gradient-to-br ${alert.type === 'danger' ? 'from-red-500 to-red-600' : 'from-amber-500 to-amber-600'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                            {alert.type === 'danger' ? <Server size={20} className="text-white" strokeWidth={2.5} /> : <AlertTriangle size={20} className="text-white" strokeWidth={2.5} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className={`font-bold ${alert.type === 'danger' ? 'text-red-900' : 'text-amber-900'} text-sm`}>{alert.title}</h3>
                                                {alert.type === 'danger' ? (
                                                    <span className="w-2 h-2 flex-shrink-0 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50 mt-1"></span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 flex-shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-xs font-bold shadow-md">Action</span>
                                                )}
                                            </div>
                                            <p className={`text-xs ${alert.type === 'danger' ? 'text-red-700' : 'text-amber-700'} font-medium mb-2`}>{alert.message}</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`px-2 py-0.5 ${alert.type === 'danger' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} rounded-lg text-xs font-bold`}>
                                                    {alert.type === 'danger' ? 'Critical' : 'Pending'}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">{alert.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center shadow-inner">
                                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                                <h3 className="text-emerald-900 font-bold text-sm">All Systems Clear</h3>
                                <p className="text-emerald-700 text-xs">No active alerts at this time</p>
                            </div>
                        )}

                        {/* Static fallback for demo if no real alerts, but instructions were to remove hardcoded data. 
                            I've implemented a conditional "All Systems Clear" message instead. */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
