import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Shield, IndianRupee, Clock, ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';

const MemberNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissedIds, setDismissedIds] = useState(() => {
        try {
            const saved = localStorage.getItem('dismissed_notifications');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/member/dashboard');
            const { membership, stats } = res.data;

            const alerts = [];

            // Plan Expiry Alert
            if (membership.daysRemaining <= 10) {
                alerts.push({
                    id: `expiry_${membership.expiryDate}`,
                    title: 'Plan Expiring Soon!',
                    description: `Your ${membership.planName} expires in ${membership.daysRemaining} days.`,
                    type: 'danger',
                    icon: Clock,
                    date: membership.expiryDate,
                    path: '/member/benefits'
                });
            }

            // Payment Alert
            if (stats.pendingDues > 0) {
                alerts.push({
                    id: 'payment_dues',
                    title: 'Pending Dues',
                    description: `You have ₹${stats.pendingDues.toLocaleString()} in unpaid invoices.`,
                    type: 'warning',
                    icon: IndianRupee,
                    date: new Date(),
                    path: '/member/payments'
                });
            }

            // Mock Assignment Alert
            const joinDate = new Date(membership.startDate);
            const diffDays = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) {
                alerts.push({
                    id: `plan_assigned_${membership.startDate}`,
                    title: 'New Plan Assigned',
                    description: `Your ${membership.planName} was successfully assigned to your profile.`,
                    type: 'success',
                    icon: Shield,
                    date: membership.startDate,
                    path: '/member/profile/me'
                });
            }

            // Filter out dismissed notifications
            setNotifications(alerts.filter(a => !dismissedIds.includes(a.id)));
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [dismissedIds]);

    const handleMarkAsRead = (id) => {
        const newDismissed = [...dismissedIds, id];
        setDismissedIds(newDismissed);
        localStorage.setItem('dismissed_notifications', JSON.stringify(newDismissed));
        toast.success("Notification dismissed");
    };


    const getTypeStyles = (type) => {
        switch (type) {
            case 'danger': return 'bg-rose-50 border-rose-100 text-rose-600 icon-rose';
            case 'warning': return 'bg-amber-50 border-amber-100 text-amber-600 icon-amber';
            case 'success': return 'bg-emerald-50 border-emerald-100 text-emerald-600 icon-emerald';
            default: return 'bg-primary-light border-violet-100 text-primary icon-indigo';
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'danger': return 'bg-rose-600';
            case 'warning': return 'bg-amber-500';
            case 'success': return 'bg-emerald-600';
            default: return 'bg-primary';
        }
    };

    return (
        <div className="saas-container p-4 sm:p-8 space-y-8 animate-fadeIn">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-violet-100 text-white">
                    <Bell size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Notifications</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-tight">Personalized alerts and plan updates</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Checking for updates...</p>
                </div>
            ) : notifications.length > 0 ? (
                <div className="grid gap-4 max-w-full">
                    {notifications.map((notif) => (
                        <Card
                            key={notif.id}
                            className={`p-8 sm:p-10 border-2 transition-all hover:shadow-xl hover:-translate-y-1 group relative rounded-[2.5rem] ${getTypeStyles(notif.type)}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${getIconBg(notif.type)}`}>
                                    <notif.icon size={22} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-lg font-black tracking-tight">{notif.title}</h4>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                            {new Date(notif.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <p className="font-bold text-sm opacity-80 mb-4">{notif.description}</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline cursor-pointer"
                                        >
                                            Mark as read
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(notif.path)}
                                    className="p-2 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded-lg cursor-pointer"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm mx-auto max-w-full">
                    <div className="w-24 h-24 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center text-slate-200 relative group cursor-default">
                        <AlertCircle size={44} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -inset-4 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-slate-400 text-sm font-black uppercase tracking-[0.2em]">All Caught Up!</h4>
                        <p className="text-slate-300 text-xs font-bold uppercase">No new alerts or plan notifications at this time.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberNotifications;
