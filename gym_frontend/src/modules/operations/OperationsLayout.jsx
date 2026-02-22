import React from 'react';
import { Outlet, NavLink as RouterNavLink } from 'react-router-dom';

const OperationsLayout = () => {
    return (
        <div className="fade-in">
            {/* Module Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-100">
                <TabLink to="/operations" end>Schedule</TabLink>
                <TabLink to="/operations/equipment">Equipment</TabLink>
                <TabLink to="/operations/lockers">Lockers</TabLink>
                <TabLink to="/operations/inventory">Inventory</TabLink>
                <TabLink to="/operations/announcements">Announcements</TabLink>
                <TabLink to="/operations/rewards">Rewards</TabLink>
                <TabLink to="/operations/feedback">Feedback</TabLink>
                <TabLink to="/operations/devices">Devices</TabLink>
            </div>
            <Outlet />
        </div>
    );
};

const TabLink = ({ to, children, end = false }) => (
    <RouterNavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`
        }
    >
        {children}
    </RouterNavLink>
);

export default OperationsLayout;
