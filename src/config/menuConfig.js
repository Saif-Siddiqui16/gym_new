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
    History,
    Key,
    Layout,
    Target,
    Cake,
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
        { label: 'Service Requests', path: '/memberships/service-requests', icon: Bell },
        // { label: 'Audit Logs', path: '/superadmin/audit-logs/activity', icon: Shield },
        // { label: 'Webhook Logs', path: '/superadmin/audit-logs/webhooks', icon: Terminal },
        { label: 'Member Messages', path: '/messages', icon: MessageSquare },
        { label: 'Birthdays', path: '/birthdays', icon: Cake },
        // { label: 'Device Dashboard', path: '/operations/devices', icon: Smartphone },
        // //     ]
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
        {
            label: 'E-Commerce & Store',
            icon: ShoppingCart,
            children: [
                { label: 'Store Dashboard', path: '/superadmin/store/dashboard', icon: LayoutDashboard },
                { label: 'Store Products', path: '/superadmin/store/products', icon: Box },
                { label: 'Store Orders', path: '/superadmin/store/orders', icon: ShoppingCart },
                { label: 'Store Inventory', path: '/superadmin/store/inventory', icon: Archive },
                { label: 'Discount Coupons', path: '/superadmin/store/coupons', icon: Percent },
            ]
        },
        {
            label: 'Smart AIoT',
            icon: Smartphone,
            children: [
                { label: 'Overview', path: '/operations/smart-aiot', icon: Activity },
                { label: 'Device Dashboard', path: '/operations/devices', icon: Smartphone },
                { label: 'Access Records', path: '/operations/face-records', icon: History },
                { label: 'Live Monitor', path: '/operations/live-monitor', icon: Activity },
            ]
        },
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
        {
            label: 'Main',
            icon: Home,
            children: [
                { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { label: 'Analytics', path: '/branchadmin/reports/performance', icon: BarChart3 },
            ]
        },
        {
            label: 'Smart AIoT',
            icon: Smartphone,
            children: [
                { label: 'Overview', path: '/operations/smart-aiot', icon: Activity },
                { label: 'Devices List', path: '/operations/devices', icon: Smartphone },
                { label: 'Face Records', path: '/operations/face-records', icon: History },
                { label: 'Live Monitor', path: '/operations/live-monitor', icon: Activity },
            ]
        },
        // {
        //     label: 'Sales & CRM',
        //     icon: Search,
        //     children: [
        //         { label: 'Walk-in Inquiry', path: '/crm/inquiry', icon: UserPlus },
        //         { label: 'Leads Pipeline', path: '/crm/pipeline', icon: GitBranch },
        //         { label: 'Today Follow-ups', path: '/crm/followups', icon: Clock },
        //     ]
        // },
        // {
        //     label: 'E-Commerce',
        //     icon: ShoppingCart,
        //     children: [
        //         { label: 'POS Store', path: '/finance/pos', icon: ShoppingCart },
        //         { label: 'Inventory', path: '/branchadmin/store/inventory', icon: Box },
        //     ]
        // },
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
        //     label: 'Operations',
        //     icon: Activity,
        //     children: [
        //         { label: 'Member List', path: '/branchadmin/members/list', icon: Users },
        //         { label: 'Bookings', path: '/branchadmin/bookings/calendar', icon: Calendar },
        //         { label: 'Tasks', path: '/branchadmin/tasks/list', icon: ClipboardList },
        //         { label: 'Assign Task', path: '/branchadmin/tasks/assign', icon: UserPlus },
        //         { label: 'WhatsApp Chat', path: '/operations/whatsapp', icon: MessageSquare },
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
        //     label: 'Finance',
        //     icon: Banknote,
        //     children: [
        //         { label: 'Invoices', path: '/finance/invoices', icon: FileText },
        //         { label: 'Expenses', path: '/finance/expenses', icon: Receipt },
        //         { label: 'Cashier Mode', path: '/finance/cashier', icon: Receipt },
        //         { label: 'Branch Transactions', path: '/finance/transactions', icon: History },
        //         { label: 'Petty Cash', path: '/finance/petty-cash', icon: Banknote },
        //         { label: 'Benefit Wallets', path: '/superadmin/wallet', icon: Wallet },
        //     ]
        // },
        // {
        //     label: 'Reports',
        //     icon: BarChart3,
        //     children: [
        //         { label: 'Revenue Report', path: '/branchadmin/reports/revenue', icon: DollarSign },
        //         { label: 'Membership Report', path: '/branchadmin/reports/membership', icon: Users },
        //         { label: 'Lead Conversion Report', path: '/branchadmin/reports/lead-conversion', icon: TrendingUp },
        //         { label: 'Expense Report', path: '/branchadmin/reports/expenses', icon: Receipt },
        //         { label: 'Branch-wise Performance Report', path: '/branchadmin/reports/performance', icon: Activity },
        //         { label: 'Daily Attendance Report', path: '/branchadmin/reports/daily-attendance', icon: ClipboardList },
        //         { label: 'Booking Report', path: '/branchadmin/reports/booking', icon: Calendar },
        //     ]
        // },
        // {
        //     label: 'Settings',
        //     icon: Settings,
        //     children: [
        //         { label: 'General Settings', path: '/branchadmin/settings/general', icon: Building },
        //         { label: 'Hardware Settings', path: '/branchadmin/settings/hardware', icon: Lock },
        //         { label: 'Communication', path: '/branchadmin/settings/communication', icon: Megaphone },
        //         { label: 'Payments', path: '/branchadmin/settings/payments', icon: CreditCard },
        //         { label: 'Tax & Invoices', path: '/branchadmin/settings/invoice', icon: FileText },
        //         { label: 'Webhooks', path: '/settings/webhooks', icon: Terminal },
        //         { label: 'API Keys', path: '/settings/api-keys', icon: Key },
        //         { label: 'Templates', path: '/settings/templates', icon: Layout },
        //         { label: 'Amenities', path: '/settings/amenities', icon: Layers },
        //     ]
        // },
        // {
        //     label: 'Profile',
        //     icon: User,
        //     children: [
        //         { label: 'My Profile', path: '/branchadmin/profile/me', icon: User },
        //         { label: 'Logout', path: '/login', icon: LogOut },
        //     ]
        // }

        // New Structured Menu (Branch Admin)
        {
            label: 'Members & Leads',
            icon: Users,
            children: [
                { label: 'Leads', path: '/crm/pipeline', icon: GitBranch },
                { label: 'Members', path: '/branchadmin/members/list', icon: Users },
                { label: 'Attendance', path: '/branchadmin/reports/daily-attendance', icon: ClipboardList },
                { label: 'Plans', path: '/memberships/plans', icon: CreditCard },
                { label: 'Referrals', path: '/referrals', icon: UserPlus },
                { label: 'Feedback', path: '/operations/feedback', icon: MessageSquare },
            ]
        },
        {
            label: 'Training & Bookings',
            icon: Calendar,
            children: [
                { label: 'Classes', path: '/classes', icon: Calendar },
                { label: 'PT Sessions', path: '/pt-sessions', icon: Clock },
                { label: 'Trainers', path: '/hr/trainers', icon: Users },
                { label: 'All Bookings', path: '/branchadmin/reports/booking', icon: ClipboardList },
                { label: 'AI Fitness', path: '/progress', icon: Activity },
                { label: 'Service Requests', path: '/memberships/service-requests', icon: Bell },
            ]
        },
        {
            label: 'E-Commerce & Sales',
            icon: ShoppingCart,
            children: [
                { label: 'POS', path: '/branchadmin/store/pos', icon: ShoppingCart },
                { label: 'Products', path: '/branchadmin/store/products', icon: Box },
                { label: 'Categories', path: '/branchadmin/store/categories', icon: Layers },
                { label: 'Store Orders', path: '/branchadmin/store/orders', icon: Receipt },
                { label: 'Discount Coupons', path: '/branchadmin/store/coupons', icon: Percent },
            ]
        },
        {
            label: 'Finance',
            icon: Banknote,
            children: [
                { label: 'Overview', path: '/finance/dashboard', icon: LayoutDashboard },
                { label: 'Invoices', path: '/finance/invoices', icon: FileText },
                { label: 'Payments', path: '/finance/payments', icon: History },
            ]
        },
        {
            label: 'Operations & Comm',
            icon: Activity,
            children: [
                { label: 'Member Messages', path: '/messages', icon: MessageSquare },
                { label: 'Announcements', path: '/operations/announcements', icon: Megaphone },
                { label: 'Birthdays', path: '/birthdays', icon: Cake },
                { label: 'Lockers', path: '/operations/lockers', icon: Lock },
            ]
        },
        {
            label: 'Admin & HR',
            icon: Shield,
            children: [
                // { label: 'Branch Management', path: '/branchadmin/branch-management/branches', icon: Building },
                { label: 'HRM', path: '/hr/payroll', icon: Users },
                { label: 'Staff Attendance', path: '/hr/staff/management', icon: ClipboardList },
                { label: 'Tasks', path: '/branchadmin/tasks/list', icon: ClipboardList },
                // { label: 'Approvals', path: '/branchadmin/trainer-requests', icon: CheckCircle }, // temporarily disabled
            ]
        },
        {
            label: 'System',
            icon: Settings,
            children: [
                { label: 'System Health', path: '/system/health', icon: Activity },
                { label: 'Audit Logs', path: '/system/audit-logs', icon: Shield },
                { label: 'Settings', path: '/branchadmin/settings/general', icon: Settings },
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
        {
            label: 'Performance Tracking',
            icon: BarChart3,
            children: [
                { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { label: 'Analytics', path: '/branchadmin/reports/performance', icon: Activity },
                { label: 'Attendance Report', path: '/branchadmin/reports/daily-attendance', icon: ClipboardList },
                { label: 'Booking Report', path: '/branchadmin/reports/booking', icon: Calendar },
                { label: 'Revenue Report', path: '/branchadmin/reports/revenue', icon: Banknote },
            ]
        },
        {
            label: 'Smart AIoT',
            icon: Smartphone,
            children: [
                { label: 'Overview', path: '/operations/smart-aiot', icon: Activity },
                { label: 'Devices List', path: '/operations/devices', icon: Smartphone },
                { label: 'Face Records', path: '/operations/face-records', icon: History },
                { label: 'Live Monitor', path: '/operations/live-monitor', icon: Activity },
            ]
        },
        {
            label: 'Sales Oversight',
            icon: ShoppingCart,
            children: [
                { label: 'Leads Pipeline', path: '/crm/pipeline', icon: GitBranch },
                { label: 'POS', path: '/branchadmin/store/pos', icon: ShoppingCart },
                { label: 'Store Orders', path: '/branchadmin/store/orders', icon: Receipt },
                { label: 'Coupons', path: '/branchadmin/store/coupons', icon: Percent },
            ]
        },
        {
            label: 'Member Service',
            icon: Users,
            children: [
                { label: 'Members', path: '/branchadmin/members/list', icon: Users },
                { label: 'Feedback', path: '/operations/feedback', icon: MessageSquare },
                { label: 'Member Messages', path: '/messages', icon: MessageSquare },
                { label: 'Birthdays', path: '/birthdays', icon: Cake },
                { label: 'Lockers', path: '/operations/lockers', icon: Lock },
            ]
        },
        {
            label: 'People Management',
            icon: Shield,
            children: [
                { label: 'HRM / Payroll', path: '/hr/payroll', icon: Users },
                { label: 'Staff Attendance', path: '/hr/staff/management', icon: ClipboardList },
                { label: 'Tasks', path: '/branchadmin/tasks/list', icon: ClipboardList },
                // { label: 'Approvals', path: '/branchadmin/trainer-requests', icon: CheckCircle }, // temporarily disabled
            ]
        },
        {
            label: 'System Oversight',
            icon: Shield,
            children: [
                { label: 'System Health', path: '/system/health', icon: Activity },
                { label: 'Audit Logs', path: '/system/audit-logs', icon: Shield },
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

    [ROLES.STAFF]: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'Member Management',
            icon: Users,
            children: [
                { label: 'Members', path: '/staff/members/list', icon: Users },
                { label: 'Attendance', path: '/staff/attendance/today', icon: UserCheck },
                { label: 'Leads', path: '/crm/pipeline', icon: GitBranch },
                { label: 'Feedback', path: '/operations/feedback', icon: MessageSquare },
            ]
        },
        {
            label: 'Operations',
            icon: Activity,
            children: [
                { label: 'POS', path: '/finance/pos', icon: ShoppingCart },
                { label: 'Invoices', path: '/finance/invoices', icon: FileText },
                { label: 'Lockers', path: '/staff/lockers', icon: Lock },
                { label: 'Tasks', path: '/staff/tasks/my-tasks', icon: ClipboardList },
            ]
        },
        {
            label: 'Communication',
            icon: MessageSquare,
            children: [
                { label: 'Member Messages', path: '/messages', icon: MessageSquare },
                { label: 'Birthdays', path: '/birthdays', icon: Cake },
                { label: 'Announcements', path: '/operations/announcements', icon: Megaphone },
            ]
        },
        {
            label: 'Work',
            icon: ClipboardList,
            children: [
                { label: 'My Attendance', path: '/staff/attendance/me', icon: Clock },
            ]
        },
        { label: 'Logout', path: '/login', icon: LogOut },
    ],

    [ROLES.TRAINER]: [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            children: [
                { label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
            ]
        },
        {
            label: 'Training',
            icon: Dumbbell,
            children: [
                { label: 'My Clients', path: '/trainer/members/assigned', icon: Users },
                { label: 'PT Sessions', path: '/pt-sessions', icon: Clock },
                { label: 'Schedule Session', path: '/trainer/sessions/calendar', icon: Calendar },
                { label: 'My Classes', path: '/classes', icon: Calendar },
                { label: 'Workout Plans', path: '/workout-plans', icon: Dumbbell },
                { label: 'Diet Plans', path: '/diet-plans', icon: Utensils },
                { label: 'Service Requests', path: '/trainer/service-requests', icon: Bell },
            ]
        },
        {
            label: 'Earnings',
            icon: IndianRupee,
            children: [
                { label: 'My Earnings', path: '/trainer/earnings', icon: IndianRupee },
            ]
        },
        {
            label: 'Work',
            icon: ClipboardList,
            children: [
                { label: 'My Attendance', path: '/staff/attendance/me', icon: Clock },
                { label: 'Announcements', path: '/trainer/announcements', icon: Megaphone },
            ]
        }
    ],

    [ROLES.MEMBER]: [
        {
            label: 'My Account',
            icon: Home,
            children: [
                { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { label: 'My Profile', path: '/member/profile/me', icon: User },
                { label: 'My Attendance', path: '/member/attendance', icon: Clock },
                { label: 'My Progress', path: '/progress', icon: Activity },
            ]
        },
        {
            label: 'Fitness',
            icon: Dumbbell,
            children: [
                { label: 'Book & Schedule', path: '/member/bookings', icon: Calendar },
                { label: 'Workout Plan', path: '/workout-plans', icon: Dumbbell },
                { label: 'Diet Plan', path: '/diet-plans', icon: Utensils },
            ]
        },
        {
            label: 'Services',
            icon: Target,
            children: [
                { label: 'My Benefits', path: '/member/benefits', icon: FileText },
                { label: 'Refer & Earn', path: '/referrals', icon: UserPlus },
                { label: 'Store', path: '/member/store', icon: ShoppingCart },
                { label: 'My Invoices', path: '/member/payments', icon: Receipt },
                { label: 'My Requests', path: '/member/requests', icon: ClipboardList },
            ]
        },
        {
            label: 'Communication',
            icon: MessageSquare,
            children: [
                { label: 'My Messages', path: '/messages', icon: MessageSquare },
                { label: 'Notifications', path: '/member/notifications', icon: Bell },
                { label: 'Announcements', path: '/member/announcements', icon: Megaphone },
                { label: 'Feedback', path: '/member/feedback', icon: MessageSquare },
            ]
        },
        {
            label: 'Profile',
            icon: User,
            children: [
                { label: 'Logout', path: '/login', icon: LogOut },
            ]
        },
    ],
};
