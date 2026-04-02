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
        'Operational Tasks': Activity,
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
            <div className="flex items-center justify-center ">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Authorizing System Access...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center ">
                <div className="bg-red-50 border border-red-200 rounded-xl text-center max-w-md">
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
        <div className="space-y-10 animate-fadeIn">
            {/* Standard Header Section */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">System Overview</h1>
                    <p className="page-subtitle">Real-time platform intelligence & operational status</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[12px] font-bold uppercase text-emerald-700 tracking-wider">All Systems Operational</span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border-light pb-4">
                    <h2 className="section-title">
                        <TrendingUp size={20} className="text-primary" />
                        Key Performance Metrics
                    </h2>
                    <div className="flex items-center gap-2 text-muted">
                        <Clock size={14} />
                        <span className="text-xs font-medium">Auto-synced: Just now</span>
                    </div>
                </div>
                
                <DashboardGrid>
                    {stats.map(stat => (
                        <StatsCard key={stat.id} {...stat} />
                    ))}
                </DashboardGrid>
            </div>

            {/* Dashboard Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Recent Registrations (Column 8) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="section-title">Recent Gym Registrations</h2>
                        <Button variant="outline" size="sm" icon={ArrowRight}>
                            View All
                        </Button>
                    </div>
                    
                    <Card className="!p-0 overflow-hidden">
                        <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4">Gym Name</th>
                                        <th className="px-6 py-4 hidden sm:table-cell">Location</th>
                                        <th className="px-6 py-4 hidden md:table-cell">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRegistrations.length > 0 ? (
                                        recentRegistrations.map(gym => (
                                            <tr key={gym.id} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold text-sm shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                            {gym.gymName?.charAt(0) || 'G'}
                                                        </div>
                                                        <span className="font-semibold text-title truncate max-w-[150px]">
                                                            {gym.gymName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell">
                                                    <div className="flex items-center gap-2 text-muted">
                                                        <MapPin size={14} />
                                                        <span className="truncate max-w-[120px]">{gym.location || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell text-muted font-medium">
                                                    {gym.createdAt ? new Date(gym.createdAt).toISOString().split('T')[0] : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                        gym.status === 'Active' 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                        {gym.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-muted italic">
                                                No registrations found this month
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* System Alerts (Column 4) */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="section-title">System Alerts</h2>
                    <div className="space-y-4">
                        {alerts.length > 0 ? (
                            alerts.map(alert => (
                                <div key={alert.id} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white hover:shadow-md transition-all group ${
                                    alert.type === 'danger' ? 'border-red-500' : 'border-amber-500'
                                }`}>
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                            alert.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {alert.type === 'danger' ? <Server size={20} /> : <AlertTriangle size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-sm font-bold text-title truncate">{alert.title}</h3>
                                                <span className="text-[10px] font-bold text-muted uppercase">{alert.time}</span>
                                            </div>
                                            <p className="text-xs text-muted leading-relaxed line-clamp-2">{alert.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                                <h3 className="text-sm font-bold text-emerald-900 mb-1">Infrastructure Stable</h3>
                                <p className="text-xs text-emerald-700">No active alerts detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
