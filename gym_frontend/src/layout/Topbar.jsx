import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../config/roles';

const Topbar = ({ collapsed, setCollapsed, title = "Dashboard", role }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

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
        navigate('/login');
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <button
                    onClick={toggleSidebar}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
                >
                    <Menu size={22} />
                </button>
                <h1 className="text-title" style={{ fontSize: '1.25rem' }}>{title}</h1>
            </div>

            {/* Right Side: Search, Notifications, Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                {/* Icons removed */}
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
                            overflow: 'hidden'
                        }}>
                            <User size={20} color="var(--muted)" />
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
