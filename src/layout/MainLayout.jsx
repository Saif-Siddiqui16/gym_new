import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';

const TITLE_MAP = {
    '/dashboard': 'Dashboard',
    '/memberships': 'Membership Management',
    '/classes': 'Class Scheduling',
    '/diet-plans': 'Diet Plans',
    '/workout-plans': 'Workout Plans',
    '/progress': 'Progress Tracking',
    '/settings': 'Settings',
    '/system/health': 'System Health',
    '/system/audit-logs': 'Audit Logs',
    '/operations': 'Operations',
    '/profile/me': 'My Profile'
};

const MainLayout = ({ role }) => {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
    const location = useLocation();

    // Responsive Sidebar Logic: Auto-collapse on mobile, expand on desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setCollapsed(true);
            } else {
                setCollapsed(false);
            }
        };
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    let pageTitle = TITLE_MAP[location.pathname];
    if (!pageTitle) {
        if (location.pathname === '/dashboard') {
            pageTitle = 'Dashboard';
        } else {
            const parts = location.pathname.split('/').filter(Boolean);
            const lastPart = parts[parts.length - 1];
            if (lastPart) {
                pageTitle = lastPart
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            } else {
                pageTitle = 'Dashboard';
            }
        }
    }
    return (
        <div className="app-shell">
            <Sidebar role={role} collapsed={collapsed} setCollapsed={setCollapsed} />

            <div className="main-container">
                <Topbar collapsed={collapsed} setCollapsed={setCollapsed} title={pageTitle} role={role} />

                <main className="content-area">
                    <div className="content-max-width">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
