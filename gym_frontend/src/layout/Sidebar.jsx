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
    const { logout } = useAuth();
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
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''} `}>
            {/* Logo Area */}
            <div style={{
                height: 'var(--topbar-height)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '1rem'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'var(--primary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginRight: collapsed ? 0 : '12px'
                }}>G</div>

                {!collapsed && (
                    <span className="text-title" style={{ fontSize: '1.125rem', whiteSpace: 'nowrap' }}>
                        Gym CRM
                    </span>
                )}
            </div>

            {/* Menu Items */}
            <nav style={{ flex: 1, overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {visibleItems.map((item) => (
                        <li key={item.label}>
                            {/* Menu item with children (submenu) */}
                            {item.children ? (
                                <>
                                    <button
                                        onClick={() => toggleSubmenu(item.label)}
                                        className={`sidebar-item ${isMenuActive(item) ? 'active' : ''} `}
                                        title={collapsed ? item.label : ''}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <item.icon size={20} />
                                            {!collapsed && <span>{item.label}</span>}
                                        </div>
                                        {!collapsed && (
                                            isExpanded(item) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                                        )}
                                    </button>

                                    {/* Submenu items */}
                                    {!collapsed && isExpanded(item) && (
                                        <ul style={{
                                            listStyle: 'none',
                                            padding: '4px 0 4px 20px',
                                            margin: 0,
                                            background: 'rgba(0,0,0,0.02)',
                                            borderLeft: '2px solid var(--border-color)',
                                            marginLeft: '24px'
                                        }}>
                                            {item.children.map((child) => (
                                                <li key={child.path}>
                                                    <NavLink
                                                        to={child.path}
                                                        end={child.path === '/settings' || child.path === '/operations'}
                                                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''} `}
                                                        style={({ isActive }) => ({
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            padding: '8px 12px',
                                                            fontSize: '0.85rem',
                                                            textDecoration: 'none',
                                                            color: isActive ? 'var(--primary)' : 'var(--text)',
                                                            fontWeight: isActive ? 600 : 400,
                                                            borderRadius: '6px',
                                                            transition: 'all 0.2s'
                                                        })}
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
                                    onClick={handleItemClick}
                                >
                                    <item.icon size={20} />
                                    {!collapsed && <span>{item.label}</span>}
                                </NavLink>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Role Debugger (Optional but helpful for verification) */}
            {!collapsed && (
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>
                        Current Role:
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {role}
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
