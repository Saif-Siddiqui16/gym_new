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
    '/operations': 'Operations',
    '/profile/me': 'My Profile'
};

const MainLayout = ({ role }) => {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
    const location = useLocation();

    // Responsive Sidebar Logic
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const pageTitle = TITLE_MAP[location.pathname] || 'Dashboard';

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
