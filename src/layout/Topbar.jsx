import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, User, LogOut, UserCircle, Building, Bell, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../config/roles';
import { useBranchContext } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/notifications/NotificationDropdown';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

const Topbar = ({ collapsed, setCollapsed, title = "Dashboard", role }) => {
    const { branches, selectedBranch, setSelectedBranch } = useBranchContext();
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
    const branchDropdownRef = useRef(null);
    const [notifOpen, setNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(parseInt(localStorage.getItem('unreadNotifs') || '0'));
    const lastNotifId = useRef(parseInt(localStorage.getItem('lastNotifId') || '0'));
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Fetch unread count for badge
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await apiClient.get('/notifications');
            const notifications = res.data.notifications || [];
            const unreadNotifs = notifications.filter(n => !n.read);
            const count = unreadNotifs.length;
            
            // Show toast for new notification if count increased and we have a new ID
            if (count > unreadCount && unreadNotifs.length > 0) {
                const latest = unreadNotifs[0];
                if (latest.id > lastNotifId.current) {
                    toast.success(
                        <div>
                            <p className="font-bold text-xs">{latest.title}</p>
                            <p className="text-[10px] opacity-80">{latest.message}</p>
                        </div>,
                        { icon: '🔔', duration: 4000 }
                    );
                    lastNotifId.current = latest.id;
                    localStorage.setItem('lastNotifId', latest.id.toString());
                }
            }

            setUnreadCount(count);
            localStorage.setItem('unreadNotifs', count.toString());
        } catch (error) {
            console.error('Badge fetch error:', error);
        }
    }, [unreadCount]);

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

    useEffect(() => {
        const handleBranchClickOutside = (event) => {
            if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
                setBranchDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleBranchClickOutside);
        return () => document.removeEventListener('mousedown', handleBranchClickOutside);
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
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
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
                
                {/* 2. Branch Selector (Branch Admin only) */}
                {role === ROLES.BRANCH_ADMIN && (
                    <div className="relative" ref={branchDropdownRef}>
                        <button
                            onClick={() => setBranchDropdownOpen(p => !p)}
                            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
                        >
                            <Building size={15} className="text-slate-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-700">
                                {selectedBranch && selectedBranch !== 'all'
                                    ? (branches?.find(b => (b._id || b.id) == selectedBranch)?.name || 'Branch')
                                    : 'All Branches'}
                            </span>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${branchDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {branchDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                                {[{ value: 'all', label: 'All Branches' }, ...(branches || []).map(b => ({ value: b._id || b.id, label: b.name || 'Branch' }))].map(opt => {
                                    const isSelected = (selectedBranch || 'all') == opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSelectedBranch(opt.value); setBranchDropdownOpen(false); }}
                                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-left transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            {isSelected && <Check size={13} />}
                                            <span className={isSelected ? '' : 'ml-[17px]'}>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`p-2 rounded-xl transition-all relative ${notifOpen ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white tabular-nums shadow-sm">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} onRefresh={fetchUnreadCount} />}
                </div>

                {/* 4. Profile Dropdown (Icon Only) */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center justify-center bg-white w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-slate-900 transition-all shadow-sm hover:opacity-90 p-0.5"
                    >
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {user?.avatar && user.avatar.length > 1 ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : user?.logo ? (
                                <img src={user.logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <User size={16} className="text-slate-500" />
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
