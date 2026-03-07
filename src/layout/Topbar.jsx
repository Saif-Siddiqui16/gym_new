import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, User, LogOut, UserCircle, Building, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../config/roles';
import { useBranchContext } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/notifications/NotificationDropdown';
import apiClient from '../api/apiClient';

const Topbar = ({ collapsed, setCollapsed, title = "Dashboard", role }) => {
    const { branches, selectedBranch, setSelectedBranch } = useBranchContext();
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Fetch unread count for badge
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await apiClient.get('/notifications');
            const notifications = res.data.notifications || [];
            const chats = res.data.unreadChatCount || 0;
            const notifs = notifications.filter(n => !n.read).length;
            setUnreadCount(notifs + chats);
        } catch (error) {
            console.error('Badge fetch error:', error);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // 30s poll
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    useEffect(() => {
        console.log('[Topbar] Current state:', { role, branchesCount: branches?.length, selectedBranch });
    }, [role, branches, selectedBranch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
    };

    const handleProfile = () => {
        let profilePath = '/profile/me'; // Default fallback

        switch (role) {
            case ROLES.SUPER_ADMIN:
                profilePath = '/superadmin/profile/me';
                break;
            case ROLES.BRANCH_ADMIN:
                profilePath = '/branchadmin/profile/me';
                break;
            case ROLES.MANAGER:
                profilePath = '/manager/profile/me';
                break;
            case ROLES.STAFF:
                profilePath = '/staff/profile/me';
                break;
            case ROLES.TRAINER:
                profilePath = '/trainer/profile/me';
                break;
            case ROLES.MEMBER:
                profilePath = '/member/profile/me';
                break;
            default:
                console.warn('Unknown role for profile navigation:', role);
        }

        navigate(profilePath);
        setDropdownOpen(false);
    };

    const toggleSidebar = () => {
        const willOpen = collapsed; // if currently collapsed, it will open
        setCollapsed(!collapsed);
        if (willOpen && dropdownOpen) {
            setDropdownOpen(false);
        }
    };

    const toggleDropdown = () => {
        const willOpen = !dropdownOpen;
        setDropdownOpen(!dropdownOpen);
        if (willOpen && window.innerWidth < 1024) {
            setCollapsed(true);
        }
    };

    return (
        <header className="topbar">
            {/* Left Side: Mobile Menu Toggle & Page Title */}
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                <button
                    onClick={toggleSidebar}
                    className="flex lg:hidden items-center justify-center w-10 h-10 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <Menu size={22} />
                </button>
                <h1 className="text-sm sm:text-base md:text-xl font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none">
                    {title}
                </h1>
            </div>

            {/* Right Side: Search, Notifications, Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Branch Selector */}
                {role === ROLES.BRANCH_ADMIN && (
                    <div className="flex items-center gap-2 bg-slate-50 px-2 md:px-3 py-1.5 rounded-lg border border-slate-200 max-w-[120px] sm:max-w-none">
                        <Building size={16} className="text-slate-400 shrink-0" />
                        <select
                            value={selectedBranch || 'all'}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="border-none bg-transparent outline-none text-xs font-bold text-slate-700 cursor-pointer"
                        >
                            <option value="all">All Branches</option>
                            {branches?.map(b => (
                                <option key={b._id || b.id} value={b._id || b.id}>{b.name || 'Branch'}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Icons removed */}
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`p-2 rounded-xl transition-all relative ${notifOpen ? 'bg-violet-50 text-violet-600 shadow-sm' : 'text-slate-400 hover:text-violet-600 hover:bg-slate-50'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white tabular-nums">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
                </div>

                {/* Profile Dropdown */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            border: '2px solid var(--violet-600, #4f46e5)'
                        }}>
                            {user?.avatar && user.avatar.length > 1 ? (
                                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={20} color="var(--muted)" />
                            )}
                        </div>
                    </button>

                    {dropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '120%',
                            right: 0,
                            width: '180px',
                            backgroundColor: 'var(--card-bg)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: 'var(--space-1)',
                            zIndex: 1000,
                            border: '1px solid var(--border-color)'
                        }}>
                            <button
                                onClick={handleProfile}
                                className="sidebar-item"
                                style={{ width: '100%', margin: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
                            >
                                <User size={16} /> Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="sidebar-item"
                                style={{ width: '100%', margin: '4px 0 0 0', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#EF4444' }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
