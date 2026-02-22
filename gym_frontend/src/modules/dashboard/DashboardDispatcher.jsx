import React from 'react';
import SuperAdminDashboard from './roles/SuperAdminDashboard';
import BranchManagerDashboard from './roles/BranchManagerDashboard';
import ManagerDashboard from './roles/ManagerDashboard';
import StaffDashboard from './roles/StaffDashboard';
import TrainerDashboard from './roles/TrainerDashboard';
import MemberDashboard from './roles/MemberDashboard';

// Mock Roles Map matching config/roles.js
const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    BRANCH_ADMIN: 'BRANCH_ADMIN', // We map Branch Manager to BRANCH_ADMIN
    MANAGER: 'MANAGER',
    STAFF: 'STAFF',
    TRAINER: 'TRAINER',
    MEMBER: 'MEMBER'
};

const DashboardDispatcher = ({ role }) => {
    // Default fallback to Member or generic "Welcome" if role not found
    // Using simple switch logic

    switch (role) {
        case ROLES.SUPER_ADMIN:
            return <SuperAdminDashboard />;
        case ROLES.BRANCH_ADMIN:
            return <BranchManagerDashboard />;
        case ROLES.MANAGER:
            return <ManagerDashboard />;
        case ROLES.STAFF:
            return <StaffDashboard />;
        case ROLES.TRAINER:
            return <TrainerDashboard />;
        case ROLES.MEMBER:
            return <MemberDashboard />;
        default:
            return (
                <div className="text-center p-8">
                    <h2 className="text-title">Welcome to Gym CRM</h2>
                    <p className="text-muted">Please select a role from the sidebar debugger to view specific dashboards.</p>
                </div>
            );
    }
};

export default DashboardDispatcher;
