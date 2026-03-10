import React, { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

const NotificationsList = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const getRoleBasedLink = (link) => {
        if (!link) return '#';
        if (link.startsWith('/members')) {
            if (role === 'STAFF') return '/staff/members/list';
            return '/branchadmin/members/list';
        }
        if (link.startsWith('/crm/leads')) {
            return '/crm/pipeline';
        }
        return link;
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/notifications');
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markRead = async (id) => {
        try {
            await apiClient.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) { }
    };

    const deleteNotif = async (id) => {
        if (!window.confirm('Delete this notification?')) return;
        try {
            await apiClient.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) { }
    };

    if (loading) return (
        <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-500 font-medium tracking-widest uppercase text-[10px]">Syncing Notifications...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">System Alerts</h3>
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">{notifications.length} Total</span>
            </div>

            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            className={`group relative p-6 rounded-[32px] border transition-all duration-300 flex gap-5 ${!n.read ? 'bg-primary-light/40 border-violet-100 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${!n.read ? 'bg-white shadow-md text-primary' : 'bg-slate-50 text-slate-400'}`}>
                                <Bell size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-4">
                                    <h4 className={`text-base truncate ${!n.read ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>{n.title}</h4>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">{n.message}</p>

                                <div className="flex items-center gap-6 mt-4">
                                    {!n.read && (
                                        <button
                                            onClick={() => markRead(n.id)}
                                            className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-hover transition-colors"
                                        >
                                            <CheckCircle size={14} strokeWidth={2.5} /> Mark as read
                                        </button>
                                    )}
                                    {n.link && (
                                        <button
                                            onClick={() => navigate(getRoleBasedLink(n.link))}
                                            className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-hover transition-colors bg-transparent border-none cursor-pointer"
                                        >
                                            <ExternalLink size={14} strokeWidth={2.5} /> View Details
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotif(n.id)}
                                        className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 duration-300"
                                    >
                                        <Trash2 size={14} strokeWidth={2.5} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-violet-100 rounded-full animate-ping opacity-20"></div>
                        <div className="relative w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                            <Bell size={48} strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-xl font-black text-slate-800">No Notifications</p>
                    <p className="text-slate-400 text-sm mt-2 font-medium max-w-xs mx-auto">We'll let you know when there's an update regarding your account or gym activities.</p>
                </div>
            )}
        </div>
    );
};

export default NotificationsList;
