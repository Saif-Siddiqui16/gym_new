import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, User, LogOut, UserCircle, Building, Bell, ChevronDown, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../config/roles';
import { useBranchContext } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/notifications/NotificationDropdown';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────
   Design Tokens — matches sidebar + dashboard
───────────────────────────────────────────── */
const T = {
    accent: '#7C5CFC',
    accent2: '#9B7BFF',
    accentLight: '#F0ECFF',
    accentMid: '#E4DCFF',
    border: '#EAE7FF',
    bg: '#F6F5FF',
    surface: '#FFFFFF',
    text: '#1A1533',
    muted: '#7B7A8E',
    subtle: '#B0ADCC',
    rose: '#F43F5E',
    roseLight: '#FFF1F4',
    green: '#22C97A',
    greenLight: '#E8FBF2',
};

/* ─────────────────────────────────────────
   Inline style helpers
───────────────────────────────────────────── */
const styles = {
    topbar: {
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        padding: '0 20px',
        background: 'rgba(246,245,255,0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${T.border}`,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        gap: 12,
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 0,
        flex: 1,
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
    menuBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        border: `1px solid ${T.border}`,
        background: T.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: T.muted,
        flexShrink: 0,
        transition: 'all 0.15s',
        boxShadow: '0 1px 4px rgba(124,92,252,0.06)',
    },
    title: {
        fontSize: 16,
        fontWeight: 800,
        color: T.text,
        margin: 0,
        letterSpacing: '-0.3px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        border: `1px solid ${T.border}`,
        background: T.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: T.muted,
        position: 'relative',
        transition: 'all 0.15s',
        boxShadow: '0 1px 4px rgba(124,92,252,0.06)',
    },
    iconBtnActive: {
        background: T.accentLight,
        color: T.accent,
        borderColor: T.accentMid,
    },
    badge: {
        position: 'absolute',
        top: -3,
        right: -3,
        minWidth: 16,
        height: 16,
        background: T.rose,
        color: '#fff',
        fontSize: 9,
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        border: '2px solid #F6F5FF',
        padding: '0 3px',
        lineHeight: 1,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    branchBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: '0 12px',
        height: 36,
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: '0 1px 4px rgba(124,92,252,0.06)',
    },
    branchLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: T.text,
        maxWidth: 130,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        minWidth: 200,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(124,92,252,0.14)',
        zIndex: 1200,
        overflow: 'hidden',
        padding: '6px',
    },
    dropdownHeader: {
        padding: '10px 12px 8px',
        borderBottom: `1px solid ${T.border}`,
        marginBottom: 4,
    },
    dropdownLabel: {
        fontSize: 9,
        fontWeight: 800,
        color: T.subtle,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 3,
    },
    dropdownUser: {
        fontSize: 13,
        fontWeight: 700,
        color: T.text,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    dropdownItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 9,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        color: T.text,
        border: 'none',
        background: 'transparent',
        width: '100%',
        textAlign: 'left',
        transition: 'background 0.12s',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    branchOption: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 12px',
        borderRadius: 9,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        border: 'none',
        background: 'transparent',
        width: '100%',
        textAlign: 'left',
        transition: 'background 0.12s',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 10,
        border: `2px solid ${T.accentMid}`,
        background: T.accentLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        flexShrink: 0,
        transition: 'all 0.15s',
        boxShadow: `0 2px 8px rgba(124,92,252,0.18)`,
    },
};

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const Topbar = ({ collapsed, setCollapsed, title = 'Dashboard', role }) => {
    const { branches, selectedBranch, setSelectedBranch } = useBranchContext();
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(parseInt(localStorage.getItem('unreadNotifs') || '0'));
    const lastNotifId = useRef(parseInt(localStorage.getItem('lastNotifId') || '0'));
    const dropdownRef = useRef(null);
    const branchDropdownRef = useRef(null);
    const navigate = useNavigate();

    /* ── Notification polling ── */
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await apiClient.get('/notifications');
            const notifications = res.data.notifications || [];
            const unreadNotifs = notifications.filter(n => !n.read);
            const count = unreadNotifs.length;
            if (count > unreadCount && unreadNotifs.length > 0) {
                const latest = unreadNotifs[0];
                if (latest.id > lastNotifId.current) {
                    toast.success(
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 12 }}>{latest.title}</p>
                            <p style={{ fontSize: 10, opacity: 0.75 }}>{latest.message}</p>
                        </div>,
                        { icon: '🔔', duration: 4000 }
                    );
                    lastNotifId.current = latest.id;
                    localStorage.setItem('lastNotifId', latest.id.toString());
                }
            }
            setUnreadCount(count);
            localStorage.setItem('unreadNotifs', count.toString());
        } catch (err) {
            console.error('Badge fetch error:', err);
        }
    }, [unreadCount]);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    /* ── Click outside ── */
    useEffect(() => {
        const handler = e => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
            if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target)) setBranchDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Handlers ── */
    const handleLogout = () => { logout(); setDropdownOpen(false); };

    const handleProfile = () => {
        const paths = {
            [ROLES.SUPER_ADMIN]: '/superadmin/profile/me',
            [ROLES.BRANCH_ADMIN]: '/branchadmin/profile/me',
            [ROLES.MANAGER]: '/manager/profile/me',
            [ROLES.STAFF]: '/staff/profile/me',
            [ROLES.TRAINER]: '/trainer/profile/me',
            [ROLES.MEMBER]: '/member/profile/me',
        };
        navigate(paths[role] || '/profile/me');
        setDropdownOpen(false);
    };

    const toggleSidebar = () => {
        const willOpen = collapsed;
        setCollapsed(!collapsed);
        if (willOpen && dropdownOpen) setDropdownOpen(false);
    };

    /* ── Branch display ── */
    const currentBranchLabel = selectedBranch && selectedBranch !== 'all'
        ? (branches?.find(b => (b._id || b.id) == selectedBranch)?.name || 'Branch')
        : 'All Branches';

    /* ── User initials ── */
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : 'U';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                
                @media (min-width: 1024px) {
                    .topbar-menu-btn { display: none !important; }
                }

                @media (max-width: 768px) {
                    .topbar-title { font-size: 14px !important; }
                    .topbar-branch-label { display: none !important; }
                    .topbar-branch-btn { padding: 0 10px !important; }
                    .topbar-container { padding: 0 12px !important; }
                }

                @media (max-width: 480px) {
                    .topbar-title { max-width: 100px !important; }
                    .topbar-divider { display: none !important; }
                }
            `}</style>

            <header style={styles.topbar} className="topbar-container">

                {/* ── LEFT ── */}
                <div style={styles.left}>
                    {/* Mobile hamburger */}
                    <button
                        onClick={toggleSidebar}
                        className="topbar-menu-btn"
                        style={styles.menuBtn}
                        onMouseEnter={e => { e.currentTarget.style.background = T.accentLight; e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.accentMid; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
                    >
                        <Menu size={18} strokeWidth={2.2} />
                    </button>

                    {/* Title with accent bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 3, height: 18, borderRadius: 4, background: `linear-gradient(to bottom, ${T.accent}, ${T.accent2})`, flexShrink: 0 }} />
                        <h1 style={styles.title} className="topbar-title">{title}</h1>
                    </div>
                </div>

                {/* ── RIGHT ── */}
                <div style={styles.right}>

                    {/* Branch Selector — Branch Admin only */}
                    {role === ROLES.BRANCH_ADMIN && (
                        <div style={{ position: 'relative' }} ref={branchDropdownRef}>
                            <button
                                onClick={() => setBranchDropdownOpen(p => !p)}
                                className="topbar-branch-btn"
                                style={{
                                    ...styles.branchBtn,
                                    ...(branchDropdownOpen ? { borderColor: T.accentMid, background: T.accentLight } : {})
                                }}
                                onMouseEnter={e => { if (!branchDropdownOpen) { e.currentTarget.style.borderColor = T.accentMid; e.currentTarget.style.background = T.accentLight; } }}
                                onMouseLeave={e => { if (!branchDropdownOpen) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; } }}
                            >
                                <Building size={14} color={branchDropdownOpen ? T.accent : T.muted} strokeWidth={2} />
                                <span className="topbar-branch-label" style={{ ...styles.branchLabel, color: branchDropdownOpen ? T.accent : T.text }}>
                                    {currentBranchLabel}
                                </span>
                                <ChevronDown
                                    size={13}
                                    color={branchDropdownOpen ? T.accent : T.subtle}
                                    strokeWidth={2.5}
                                    style={{ transition: 'transform 0.2s', transform: branchDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                                />
                            </button>

                            {branchDropdownOpen && (
                                <div style={{ ...styles.dropdown, minWidth: 190 }}>
                                    {[
                                        { value: 'all', label: 'All Branches' },
                                        ...(branches || []).map(b => ({ value: b._id || b.id, label: b.name || 'Branch' }))
                                    ].map(opt => {
                                        const isSelected = (selectedBranch || 'all') == opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setSelectedBranch(opt.value); setBranchDropdownOpen(false); }}
                                                style={{
                                                    ...styles.branchOption,
                                                    background: isSelected ? T.accentLight : 'transparent',
                                                    color: isSelected ? T.accent : T.text,
                                                }}
                                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bg; }}
                                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <div style={{
                                                    width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                }}>
                                                    {isSelected && <Check size={12} color={T.accent} strokeWidth={3} />}
                                                </div>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notification Bell */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setNotifOpen(!notifOpen)}
                            style={{
                                ...styles.iconBtn,
                                ...(notifOpen ? styles.iconBtnActive : {})
                            }}
                            onMouseEnter={e => { if (!notifOpen) { e.currentTarget.style.background = T.accentLight; e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.accentMid; } }}
                            onMouseLeave={e => { if (!notifOpen) { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; } }}
                        >
                            <Bell size={17} strokeWidth={2.2} />
                            {unreadCount > 0 && (
                                <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>
                        {notifOpen && (
                            <NotificationDropdown
                                onClose={() => setNotifOpen(false)}
                                onRefresh={fetchUnreadCount}
                            />
                        )}
                    </div>

                    {/* Divider */}
                    <div className="topbar-divider" style={{ width: 1, height: 24, background: T.border, margin: '0 2px' }} />

                    {/* Profile Dropdown */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(p => !p)}
                            style={{
                                ...styles.avatar,
                                ...(dropdownOpen ? { borderColor: T.accent, boxShadow: `0 0 0 3px ${T.accentLight}` } : {})
                            }}
                        >
                            {user?.avatar && (user.avatar.includes('/') || user.avatar.includes('http')) ? (
                                <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : user?.logo ? (
                                <img src={user.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: 13, fontWeight: 800, color: T.accent }}>{initials}</span>
                            )}
                        </button>

                        {dropdownOpen && (
                            <div style={{ ...styles.dropdown, minWidth: 200, right: 0 }}>
                                {/* Header */}
                                <div style={styles.dropdownHeader}>
                                    <div style={styles.dropdownLabel}>Account</div>
                                    <div style={styles.dropdownUser}>{user?.name || 'User'}</div>
                                    {user?.email && (
                                        <div style={{ fontSize: 10, color: T.subtle, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {user.email}
                                        </div>
                                    )}
                                </div>

                                {/* Role badge */}
                                <div style={{ padding: '6px 12px 8px' }}>
                                    <span style={{
                                        fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                                        background: T.accentLight, color: T.accent, padding: '3px 8px', borderRadius: 20
                                    }}>
                                        {role?.replace('_', ' ') || 'Admin'}
                                    </span>
                                </div>

                                <div style={{ height: 1, background: T.border, margin: '0 6px 4px' }} />

                                {/* My Profile */}
                                <button
                                    onClick={handleProfile}
                                    style={styles.dropdownItem}
                                    onMouseEnter={e => { e.currentTarget.style.background = T.accentLight; e.currentTarget.style.color = T.accent; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text; }}
                                >
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                         {user?.avatar && (user.avatar.includes('/') || user.avatar.includes('http')) ? (
                                             <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                         ) : (
                                             <UserCircle size={15} color={T.accent} />
                                         )}
                                    </div>
                                    <span>My Profile</span>
                                </button>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    style={{ ...styles.dropdownItem, color: T.rose }}
                                    onMouseEnter={e => { e.currentTarget.style.background = T.roseLight; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: T.roseLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <LogOut size={15} color={T.rose} />
                                    </div>
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Topbar;