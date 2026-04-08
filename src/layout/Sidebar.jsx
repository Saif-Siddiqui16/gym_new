import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { ROLES } from '../config/roles';
import { menuConfig } from '../config/menuConfig';

import { useAuth } from '../context/AuthContext';

const Sidebar = ({ role, collapsed, setCollapsed }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [expandedMenus, setExpandedMenus] = useState({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Toggle submenu expansion
    const toggleSubmenu = (label) => {
        setExpandedMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    // Get menu items strictly for this role from the config
    const visibleItems = menuConfig[role] || [];

    // Logout handler
    const handleLogout = (e) => {
        e.preventDefault();
        setShowLogoutModal(true);
    };

    // Check if a menu or its children are active
    // ... rest of logic
    const isMenuActive = (item) => {
        if (item.path) {
            return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        }
        if (item.children) {
            return item.children.some(child =>
                location.pathname === child.path || location.pathname.startsWith(child.path + '/')
            );
        }
        return false;
    };


    // Auto-expand if any child is active
    const isExpanded = (item) => {
        if (expandedMenus[item.label] !== undefined) {
            return expandedMenus[item.label];
        }
        return isMenuActive(item);
    };

    // Auto-close sidebar on mobile when item clicked
    const handleItemClick = () => {
        if (window.innerWidth < 1024 && setCollapsed) {
            setCollapsed(true);
        }
    };

    return (
        <>
        <aside className={`sidebar ${collapsed ? 'collapsed' : 'show'}`}>
            {/* Logo Area */}
            <div className="sidebar-header">
                <div className="sidebar-logo-wrapper">
                    {user?.logo ? (
                        <img src={user.logo} alt="Logo" className="w-8 h-8 object-contain" />
                    ) : (
                        <div className="sidebar-logo-icon">
                            {role === ROLES.SUPER_ADMIN ? 'G' : (user?.tenantName || user?.branchName || 'R').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                {!collapsed && (
                    <div className="sidebar-brand">
                        {role === ROLES.SUPER_ADMIN ? (
                            <>Gym<span>CRM</span></>
                        ) : (
                            <>
                                {user?.tenantName?.split(' ')[0] || user?.branchName?.split(' ')[0] || 'Roar'} 
                                <span> {user?.tenantName?.split(' ').slice(1).join(' ') || user?.branchName?.split(' ').slice(1).join(' ') || 'Fitness'}</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Label */}
            {!collapsed && <div className="sidebar-section-label">Navigation</div>}

            {/* Menu Items */}
            <nav className="sidebar-nav">
                <ul className="list-none overflow-x-hidden">
                    {visibleItems.map((item) => (
                        <li key={item.label} className="sidebar-item-wrapper">
                            {/* Menu item with children (submenu) */}
                            {item.children ? (
                                <>
                                    <button
                                        onClick={() => toggleSubmenu(item.label)}
                                        className={`sidebar-item ${isMenuActive(item) ? 'active' : ''}`}
                                        title={collapsed ? item.label : ''}
                                    >
                                        <div className="sidebar-icon-box">
                                            <item.icon size={18} />
                                        </div>
                                        {!collapsed && (
                                            <>
                                                <span className="sidebar-item-text">{item.label}</span>
                                                {/* Arrow ONLY if there are children */}
                                                {isExpanded(item) ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
                                            </>
                                        )}
                                    </button>

                                    {/* Submenu items */}
                                    {!collapsed && isExpanded(item) && (
                                        <ul className="sidebar-submenu">
                                            {item.children.map((child) => (
                                                <li key={child.path}>
                                                    <NavLink
                                                        to={child.path}
                                                        end={child.path === '/settings' || child.path === '/operations'}
                                                        className={({ isActive }) => `sidebar-submenu-item ${isActive ? 'active' : ''}`}
                                                        onClick={child.label === 'Logout' ? handleLogout : handleItemClick}
                                                    >
                                                        <span>{child.label}</span>
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                /* Regular menu item without children */
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                                    title={collapsed ? item.label : ''}
                                    onClick={item.label === 'Logout' ? handleLogout : handleItemClick}
                                >
                                    <div className="sidebar-icon-box">
                                        <item.icon size={18} />
                                    </div>
                                    {!collapsed && (
                                        <>
                                            <span className="sidebar-item-text">{item.label}</span>
                                            {/* Example badges consistent with image */}
                                            {item.label === 'Smart AIoT' && <span className="sidebar-item-badge new">New</span>}
                                            {item.label === 'Members & Leads' && <span className="sidebar-item-badge count">12</span>}
                                            {/* NO ARROW HERE for single items */}
                                        </>
                                    )}
                                </NavLink>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>


            {/* Role/User Section */}
            {!collapsed && (
                <div className="sidebar-footer">
                    <div className="role-card-premium">
                        <div className="role-avatar-gradient overflow-hidden">
                            {user?.avatar && user.avatar.length > 1 ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                role === ROLES.SUPER_ADMIN ? 'SU' : role === ROLES.BRANCH_ADMIN ? 'BA' : role.substring(0, 2).toUpperCase()
                            )}
                        </div>
                        <div className="role-info">
                            <span className="role-name">{role === ROLES.SUPER_ADMIN ? 'Super Admin' : role === ROLES.BRANCH_ADMIN ? 'Branch Admin' : role.charAt(0) + role.slice(1).toLowerCase()}</span>
                            <span className="role-title">Active Now</span>
                        </div>
                        <div className="status-indicator">
                            <div className="status-ping"></div>
                            <div className="status-core"></div>
                        </div>
                    </div>
                </div>
            )}
        </aside>

        <ConfirmationModal
            isOpen={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={() => { logout(); setShowLogoutModal(false); }}
            title="Logout?"
            message="You will be signed out of the current session."
            confirmText="Logout"
            type="warning"
        />
    </>
    );
};

export default Sidebar;
