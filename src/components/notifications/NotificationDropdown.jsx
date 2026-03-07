import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, CheckCircle, AlertTriangle, X, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';

const NotificationDropdown = ({ onClose }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/notifications');
            setNotifications(res.data.notifications || []);
            setUnreadChatCount(res.data.unreadChatCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleMarkAsRead = async (id) => {
        try {
            await apiClient.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await apiClient.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await apiClient.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-success" size={16} />;
            case 'warning': return <AlertTriangle className="text-warning" size={16} />;
            case 'danger': return <X className="text-danger" size={16} />;
            default: return <Bell className="text-primary" size={16} />;
        }
    };

    return (
        <div
            ref={dropdownRef}
            className="dropdown-menu !w-80 sm:!w-96 !p-0 !top-12 overflow-hidden animate-fade-in"
        >
            {/* Header */}
            <div className="p-4 border-b border-light flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-title uppercase tracking-widest m-0">Notifications</h3>
                    {notifications.filter(n => !n.read).length > 0 && (
                        <span className="badge badge-danger">
                            {notifications.filter(n => !n.read).length}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer"
                >
                    Mark all read
                </button>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] ">
                {loading ? (
                    <div className="p-8 text-center text-muted">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Loading...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => { if (!n.read) handleMarkAsRead(n.id); if (n.link) { navigate(n.link); onClose(); } }}
                                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!n.read ? 'bg-primary-light/40' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${!n.read ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-xs m-0 ${!n.read ? 'font-bold text-title' : 'font-medium text-body'}`}>{n.title}</h4>
                                        <p className="text-[10px] text-muted leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[9px] text-muted font-bold uppercase tracking-wider mt-1">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(n.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted hover:text-danger transition-all rounded-lg border-none bg-transparent"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-muted">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-light">
                            <Bell size={20} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">All caught up!</p>
                        <p className="text-[10px] mt-1 text-muted">No new notifications here.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50/30 text-center border-t border-light text-[10px] font-bold text-muted uppercase tracking-[0.2em] cursor-default">
                Recent Alerts
            </div>
        </div>
    );
};

export default NotificationDropdown;
