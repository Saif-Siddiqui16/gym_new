import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
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
        <aside className={`sidebar ${collapsed ? 'collapsed' : 'show'} `}>
            {/* Logo Area */}
            <div className="sidebar-header">
                <div className="sidebar-logo">G</div>
                {!collapsed && (
                    <span className="sidebar-brand">
                        {user?.branchName || 'Gym CRM'}
                    </span>
                )}
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto scrollbar-hide">
                <ul className="list-none p-0 m-0">
                    {visibleItems.map((item) => (
                        <li key={item.label}>
                            {/* Menu item with children (submenu) */}
                            {item.children ? (
                                <>
                                    <button
                                        onClick={() => toggleSubmenu(item.label)}
                                        className={`sidebar-item ${isMenuActive(item) ? 'active' : ''}`}
                                        title={collapsed ? item.label : ''}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} />
                                            {!collapsed && <span>{item.label}</span>}
                                        </div>
                                        {!collapsed && (
                                            isExpanded(item) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
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
                                                        <child.icon size={16} />
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
                                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''} `}
                                    title={collapsed ? item.label : ''}
                                    onClick={item.label === 'Logout' ? handleLogout : handleItemClick}
                                >
                                    <item.icon size={20} />
                                    {!collapsed && <span>{item.label}</span>}
                                </NavLink>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Role Display */}
            {!collapsed && (
                <div className="p-4 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        System Role
                    </div>
                    <div className="text-xs font-bold text-primary">
                        {role}
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
