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
                <h1 className="text-sm sm:text-base md:text-xl font-bold text-title truncate max-w-[150px] sm:max-w-none m-0">
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
                        className={`p-2 rounded-xl transition-all relative ${notifOpen ? 'bg-primary-light text-primary shadow-sm' : 'text-slate-400 hover:text-primary hover:bg-slate-50'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white tabular-nums">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} onRefresh={fetchUnreadCount} />}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-full transition-all"
                    >
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                            {user?.avatar && user.avatar.length > 1 ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={18} className="text-muted" />
                            )}
                        </div>
                    </button>

                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="px-4 py-2 border-bottom mb-1">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</div>
                                <div className="text-sm font-semibold truncate">{user?.name || 'User'}</div>
                            </div>
                            <button
                                onClick={handleProfile}
                                className="dropdown-item"
                            >
                                <UserCircle size={18} />
                                <span>My Profile</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="dropdown-item danger text-red-500"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
