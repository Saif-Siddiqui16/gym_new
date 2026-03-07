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
            case 'success': return <CheckCircle className="text-emerald-500" size={16} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
            case 'danger': return <X className="text-rose-500" size={16} />;
            default: return <Bell className="text-violet-500" size={16} />;
        }
    };

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Notifications</h3>
                    {notifications.filter(n => !n.read).length > 0 && (
                        <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">
                            {notifications.filter(n => !n.read).length}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-black text-violet-600 uppercase tracking-widest hover:underline"
                >
                    Mark all read
                </button>
            </div>

            {/* Chat Notification Shortcut */}
            {unreadChatCount > 0 && (
                <button
                    onClick={() => { navigate('/operations/messages'); onClose(); }}
                    className="w-full p-4 bg-violet-50/50 hover:bg-violet-50 border-b border-violet-100 transition-colors flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform">
                        <MessageSquare size={18} />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-xs font-black text-slate-800">New Messages</p>
                        <p className="text-[10px] font-bold text-slate-500">You have {unreadChatCount} unread chat messages</p>
                    </div>
                </button>
            )}

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Loading...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => { if (!n.read) handleMarkAsRead(n.id); if (n.link) { navigate(n.link); onClose(); } }}
                                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!n.read ? 'bg-violet-50/20' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${!n.read ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-xs ${!n.read ? 'font-black text-slate-800' : 'font-bold text-slate-600'}`}>{n.title}</h4>
                                        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(n.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all rounded-lg"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-100">
                            <Bell size={20} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">All caught up!</p>
                        <p className="text-[10px] font-bold text-slate-300 mt-1">No new notifications here.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50/30 text-center border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-default">
                Recent Alerts
            </div>
        </div>
    );
};

export default NotificationDropdown;
