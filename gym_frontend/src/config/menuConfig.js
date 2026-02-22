import { ROLES } from './roles';
import {
    LayoutDashboard,
    Terminal,
    Dumbbell,
    Settings,
    CreditCard,
    FileText,
    Shield,
    User,
    LogOut,
    Users,
    Wallet,
    Calendar,
    Lock,
    ClipboardList,
    BarChart3,
    CheckCircle,
    Clock,
    Home,
    Building,
    GitBranch,
    Wrench,
    Package,
    Megaphone,
    Utensils,
    TrendingUp,
    Layers,
    Bell,
    Activity,
    Banknote,
    ShoppingCart,
    Receipt,
    Percent,
    UserPlus,
    UserCheck,
    FilePlus,
    Box,
    Archive,
    IndianRupee,
    MessageSquare,
    Smartphone,
    Search,
    DollarSign,
    AlertCircle,
    History
} from 'lucide-react';

export const menuConfig = {
    [ROLES.SUPER_ADMIN]: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        // {
        //     label: 'Memberships',
        //     icon: CreditCard,
        //     children: [
        //         { label: 'Plans & Benefits', path: '/memberships', icon: CreditCard },
        //         { label: 'Renewal Alerts', path: '/members/renewal-alerts', icon: AlertCircle },
        //     ]
        // },
        // { label: 'Classes', path: '/classes', icon: Calendar },
        // {
        //     label: 'CRM & Sales',
        //     icon: Search,
        //     children: [
        //         { label: 'Walk-in Inquiry', path: '/crm/inquiry', icon: UserPlus },
        //         { label: 'Leads Pipeline', path: '/crm/pipeline', icon: GitBranch },
        //         { label: 'Today Follow-ups', path: '/crm/followups', icon: Clock },
        //     ]
        // },
        // {
        //     label: 'Operations',
        //     icon: Activity,
        //     children: [
        { label: 'Gym Management', path: '/superadmin/gyms/all', icon: Building },
        { label: 'SaaS Plans', path: '/superadmin/plans/list', icon: FileText },
        { label: 'Subscriptions', path: '/superadmin/subscriptions/active', icon: CreditCard },
        // { label: 'Audit Logs', path: '/superadmin/audit-logs/activity', icon: Shield },
        { label: 'Webhook Logs', path: '/superadmin/audit-logs/webhooks', icon: Terminal },
        { label: 'WhatsApp Chat', path: '/operations/whatsapp', icon: MessageSquare },
        { label: 'Device Dashboard', path: '/operations/devices', icon: Smartphone },
        //     ]
        // },
        // {
        //     label: 'Facility Management',
        //     icon: Wrench,
        //     children: [
        //         { label: 'Equipment List', path: '/facility/equipment', icon: Package },
        //         { label: 'Maintenance Requests', path: '/facility/maintenance', icon: ClipboardList },
        //         { label: 'Service History', path: '/facility/history', icon: History },
        //     ]
        // },
        // {
        //     label: 'HR & Staff',
        //     icon: Users,
        //     children: [
        //         { label: 'Staff List', path: '/hr/staff/management', icon: Users },
        //         { label: 'Add Staff', path: '/hr/staff/create', icon: UserPlus },
        //         { label: 'Trainer Requests', path: '/superadmin/trainer-requests', icon: UserCheck },
        //         { label: 'Trainer Change Requests', path: '/superadmin/trainer-change-requests', icon: Activity },
        //         { label: 'Create Payroll', path: '/superadmin/payroll/create', icon: FilePlus },
        //         { label: 'Payroll History', path: '/superadmin/payroll/history', icon: FileText },
        //         { label: 'Payroll Overview', path: '/hr/payroll', icon: Banknote },
        //     ]
        // },
        // {
        //     label: 'Financials',
        //     icon: Banknote,
        //     children: [
        //         { label: 'Dashboard', path: '/finance/dashboard', icon: LayoutDashboard },
        //         { label: 'Benefit Wallets', path: '/superadmin/wallet', icon: Wallet },
        //         { label: 'Store Dashboard', path: '/superadmin/store/dashboard', icon: LayoutDashboard },
        //         { label: 'Store Products', path: '/superadmin/store/products', icon: Box },
        //         { label: 'Store Orders', path: '/superadmin/store/orders', icon: ShoppingCart },
        //         { label: 'Store Inventory', path: '/superadmin/store/inventory', icon: Archive },
        //         { label: 'Invoices', path: '/finance/invoices', icon: FileText },
        //         { label: 'Expenses', path: '/finance/expenses', icon: Receipt },
        //         { label: 'Petty Cash / Expenses', path: '/finance/petty-cash', icon: Banknote },
        //         { label: 'Commissions', path: '/finance/commissions', icon: Percent },
        //     ]
        // },
        { label: 'General Settings', path: '/superadmin/general-settings/general', icon: Building },
        { label: 'Hardware Settings', path: '/superadmin/general-settings/hardware', icon: Lock },
        {
            label: 'Profile',
            icon: User,
            children: [
                { label: 'My Profile', path: '/superadmin/profile/me', icon: User },
                { label: 'Logout', path: '/login', icon: LogOut },
            ]
        }
    ],

    [ROLES.BRANCH_ADMIN]: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'Branch Management',
            icon: Building,
            children: [
                { label: 'Branch List', path: '/branchadmin/branch-management/branches', icon: ClipboardList },
            ]
        },
        {
            label: 'CRM & Sales',
            icon: Search,
            children: [
                { label: 'Walk-in Inquiry', path: '/crm/inquiry', icon: UserPlus },
                { label: 'Leads Pipeline', path: '/crm/pipeline', icon: GitBranch },
                { label: 'Today Follow-ups', path: '/crm/followups', icon: Clock },
            ]
        },
        {
            label: 'Memberships',
            icon: CreditCard,
            children: [
                { label: 'Plans & Benefits', path: '/memberships', icon: CreditCard },
                { label: 'Renewal Alerts', path: '/members/renewal-alerts', icon: AlertCircle },
            ]
        },
        { label: 'Classes', path: '/classes', icon: Calendar },
        {
            label: 'Operations',
            icon: Activity,
            children: [
                { label: 'Member List', path: '/branchadmin/members/list', icon: Users },
                { label: 'Bookings', path: '/branchadmin/bookings/calendar', icon: Calendar },
                { label: 'Tasks', path: '/branchadmin/tasks/list', icon: ClipboardList },
                { label: 'WhatsApp Chat', path: '/operations/whatsapp', icon: MessageSquare },
            ]
        },
        {
            label: 'Facility Management',
            icon: Wrench,
            children: [
                { label: 'Equipment List', path: '/facility/equipment', icon: Package },
                { label: 'Maintenance Requests', path: '/facility/maintenance', icon: ClipboardList },
                { label: 'Service History', path: '/facility/history', icon: History },
            ]
        },
        {
            label: 'Financials',
            icon: Banknote,
            children: [
                { label: 'POS Store', path: '/finance/pos', icon: ShoppingCart },
                { label: 'Benefit Wallets', path: '/superadmin/wallet', icon: Wallet },
                { label: 'Invoices', path: '/finance/invoices', icon: FileText },
                { label: 'Expenses', path: '/finance/expenses', icon: Receipt },
                { label: 'Cashier Mode', path: '/finance/cashier', icon: Receipt },
                { label: 'Branch Transactions', path: '/finance/transactions', icon: History },
                { label: 'Petty Cash / Expenses', path: '/finance/petty-cash', icon: Banknote },
            ]
        },
        {
            label: 'HR & Staff',
            icon: Users,
            children: [
                { label: 'Staff List', path: '/hr/staff/management', icon: Users },
                { label: 'Add Staff', path: '/hr/staff/create', icon: UserPlus },
                { label: 'Leave Requests', path: '/hr/leave-requests', icon: Calendar },
                { label: 'Trainer Requests', path: '/superadmin/trainer-requests', icon: UserCheck },
                { label: 'Payroll Creation', path: '/superadmin/payroll/create', icon: Banknote },
                { label: 'Payroll', path: '/hr/payroll', icon: Banknote },
            ]
        },
        {
            label: 'Reports',
            icon: BarChart3,
            children: [
                { label: 'Revenue Report', path: '/branchadmin/reports/revenue', icon: DollarSign },
                { label: 'Membership Report', path: '/branchadmin/reports/membership', icon: Users },
                { label: 'Lead Conversion Report', path: '/branchadmin/reports/lead-conversion', icon: TrendingUp },
                { label: 'Expense Report', path: '/branchadmin/reports/expenses', icon: Receipt },
                { label: 'Branch-wise Performance Report', path: '/branchadmin/reports/performance', icon: Activity },
                { label: 'Daily Attendance Report', path: '/branchadmin/reports/daily-attendance', icon: ClipboardList },
                { label: 'Booking Report', path: '/branchadmin/reports/booking', icon: Calendar },
            ]
        },

        {
            label: 'Settings',
            icon: Settings,
            children: [
                { label: 'General Settings', path: '/branchadmin/settings/general', icon: Building },
                { label: 'Hardware Settings', path: '/branchadmin/settings/hardware', icon: Lock },
                { label: 'Communication', path: '/branchadmin/settings/communication', icon: Megaphone },
                { label: 'Payments', path: '/branchadmin/settings/payments', icon: CreditCard },
                { label: 'Tax & Invoices', path: '/branchadmin/settings/invoice', icon: FileText },
            ]
        },
        {
            label: 'Profile',
            icon: User,
            children: [
                { label: 'My Profile', path: '/branchadmin/profile/me', icon: User },
                { label: 'Logout', path: '/login', icon: LogOut },
            ]
        }
    ],

    [ROLES.MANAGER]: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'Memberships',
            icon: CreditCard,
            children: [
                { label: 'Plans & Benefits', path: '/memberships', icon: CreditCard },
                { label: 'Renewal Alerts', path: '/members/renewal-alerts', icon: AlertCircle },
            ]
        },
        { label: 'Classes', path: '/classes', icon: Calendar },
        {
            label: 'CRM & Sales',
            icon: Search,
            children: [
                { label: 'Walk-in Inquiry', path: '/crm/inquiry', icon: UserPlus },
                { label: 'Leads Pipeline', path: '/crm/pipeline', icon: GitBranch },
                { label: 'Today Follow-ups', path: '/crm/followups', icon: Clock },
            ]
        },
        {
            label: 'Attendance',
            icon: Clock,
            children: [
                { label: 'Live Monitor', path: '/manager/attendance/live-checkin', icon: Activity },
                { label: 'Member Log', path: '/manager/attendance/today/member', icon: Users },
                { label: 'Staff Log', path: '/manager/attendance/today/staff', icon: Users },
            ]
        },
        {
            label: 'Operations',
            icon: Activity,
            children: [
                { label: 'Staff Schedule', path: '/operations', icon: Users },
                { label: 'WhatsApp Chat', path: '/operations/whatsapp', icon: MessageSquare },
                { label: 'Equipment', path: '/operations/equipment', icon: Wrench },
                { label: 'Lockers', path: '/operations/lockers', icon: Lock },
                { label: 'Inventory', path: '/operations/inventory', icon: Package },
                { label: 'Announcements', path: '/operations/announcements', icon: Megaphone },
                { label: 'Rewards Program', path: '/operations/rewards', icon: Activity },
                { label: 'Feedback', path: '/operations/feedback', icon: Bell },
                { label: 'Member List', path: '/manager/members/list', icon: Users },
                { label: 'Device Dashboard', path: '/operations/devices', icon: Smartphone },
            ]
        },
        {
            label: 'Facility Management',
            icon: Wrench,
            children: [
                { label: 'Equipment List', path: '/facility/equipment', icon: Package },
                { label: 'Maintenance Requests', path: '/facility/maintenance', icon: ClipboardList },
                { label: 'Service History', path: '/facility/history', icon: History },
            ]
        },
        {
            label: 'Financials',
            icon: Banknote,
            children: [
                { label: 'Benefit Wallets', path: '/manager/wallet', icon: Wallet },
                { label: 'Cashier Mode', path: '/finance/cashier', icon: Receipt },
                { label: 'Branch Transactions', path: '/finance/transactions', icon: History },
                { label: 'Petty Cash / Expenses', path: '/finance/petty-cash', icon: Banknote },
            ]
        },
        {
            label: 'HR & Staff',
            icon: Users,
            children: [
                { label: 'Staff List', path: '/hr/staff/management', icon: Users },
                { label: 'Add Staff', path: '/hr/staff/create', icon: UserPlus },
                { label: 'Leave Requests', path: '/hr/leave-requests', icon: Calendar },
                { label: 'Trainer Requests', path: '/manager/requests', icon: UserCheck },
                { label: 'Trainer Change Requests', path: '/manager/change-requests', icon: Activity },
                { label: 'Payroll Creation', path: '/manager/payroll/create', icon: Banknote },
                { label: 'Payroll', path: '/hr/payroll', icon: Banknote },
            ]
        },
        {
            label: 'Settings',
            icon: Settings,
            children: [
                { label: 'Organization', path: '/settings', icon: Building },
                // { label: 'Branches', path: '/settings/branches', icon: GitBranch },
                // { label: 'Roles & Permissions', path: '/settings/roles', icon: Shield },
                { label: 'Security', path: '/settings/security', icon: Lock },
            ]
        },
        {
            label: 'Reports',
            icon: BarChart3,
            children: [
                { label: 'Attendance Report', path: '/manager/reports/daily-attendance', icon: ClipboardList },
                { label: 'Booking Report', path: '/manager/reports/booking', icon: Calendar },
            ]
        },
        {
            label: 'Profile',
            icon: User,
            children: [
                { label: 'My Profile', path: '/manager/profile/me', icon: User },
                { label: 'Logout', path: '/login', icon: LogOut },
            ]
        },
    ],

    [ROLES.STAFF]: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'CRM & Sales',
            icon: Search,
            children: [
                { label: 'Walk-in Inquiry', path: '/crm/inquiry', icon: UserPlus },
                { label: 'Leads Pipeline', path: '/crm/pipeline', icon: GitBranch },
                { label: 'Today Follow-ups', path: '/crm/followups', icon: Clock },
            ]
        },
        {
            label: 'Memberships',
            icon: CreditCard,
            children: [
                { label: 'Plans & Benefits', path: '/memberships', icon: CreditCard },
                { label: 'Renewal Alerts', path: '/members/renewal-alerts', icon: AlertCircle },
            ]
        },
        {
            label: 'Check-In',
            icon: Clock,
            children: [
                { label: 'Member Check-In', path: '/staff/attendance/check-in', icon: Clock },
                { label: 'Check-Out', path: '/staff/attendance/check-out', icon: Clock },
                { label: 'Today Check-Ins', path: '/staff/attendance/today', icon: Users },
                { label: 'Member List', path: '/staff/members/list', icon: Users },
            ]
        },
        {
            label: 'Locker Assign',
            icon: Lock,
            children: [
                { label: 'Assign Locker', path: '/staff/lockers/assign', icon: Lock },
                { label: 'Release Locker', path: '/staff/lockers/release', icon: Lock },
            ]
        },
        {
            label: 'Tasks',
            icon: ClipboardList,
            children: [
                { label: 'My Tasks', path: '/staff/tasks/my-tasks', icon: ClipboardList },
                { label: 'Task Status', path: '/staff/tasks/status', icon: Clock },
            ]
        },
        {
            label: 'Payments',
            icon: CreditCard,
            children: [
                { label: 'New Receipt', path: '/finance/cashier', icon: Receipt },
                { label: 'My Transactions', path: '/finance/transactions', icon: History },
                { label: 'Log Expense', path: '/finance/petty-cash', icon: Banknote },
            ]
        },
        {
            label: 'Profile',
            icon: User,
            children: [
                { label: 'My Profile', path: '/staff/profile/me', icon: User },
                { label: 'Logout', path: '/login', icon: LogOut },
            ]
        },
    ],

    [ROLES.TRAINER]: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'My Leads', path: '/crm/my-leads', icon: Search },
        {
            label: 'Sessions',
            icon: Calendar,
            children: [
                { label: 'Session Calendar', path: '/trainer/sessions/calendar', icon: Calendar },
                { label: 'Upcoming Sessions', path: '/trainer/sessions/upcoming', icon: Clock },
            ]
        },
        { label: 'My Attendance', path: '/trainer/attendance', icon: Clock },
        { label: 'Availability', path: '/trainer/availability', icon: Calendar },
        { label: 'Classes', path: '/classes', icon: Calendar },
        { label: 'My Members', path: '/trainer/members/assigned', icon: Users },
        { label: 'Diet Plans', path: '/diet-plans', icon: Utensils },
        { label: 'Workout Plans', path: '/workout-plans', icon: Dumbbell },
        { label: 'My Earnings', path: '/trainer/earnings', icon: IndianRupee },
        { label: 'Announcements', path: '/trainer/announcements', icon: Megaphone },
        { label: 'Progress', path: '/progress', icon: TrendingUp },
        {
            label: 'Profile',
            icon: User,
            children: [
                { label: 'My Profile', path: '/trainer/profile/me', icon: User },
                { label: 'Logout', path: '/login', icon: LogOut },
            ]
        },
    ],

    [ROLES.MEMBER]: [
        { label: 'Home', path: '/dashboard', icon: Home },
        { label: 'My Membership', path: '/member/membership', icon: FileText },
        { label: 'Bookings', path: '/member/bookings', icon: Calendar },
        { label: 'Workout Plans', path: '/workout-plans', icon: Dumbbell },
        { label: 'Diet Plans', path: '/diet-plans', icon: Utensils },
        { label: 'Progress', path: '/progress', icon: TrendingUp },
        { label: 'My Wallet', path: '/member/wallet', icon: Wallet },
        { label: 'My Invoices', path: '/member/payments', icon: Receipt },
        { label: 'Feedback', path: '/member/feedback', icon: Megaphone },
        { label: 'Store', path: '/member/store', icon: ShoppingCart },
        { label: 'Profile', path: '/member/profile/me', icon: User },
        { label: 'Logout', path: '/login', icon: LogOut },
    ],
};
