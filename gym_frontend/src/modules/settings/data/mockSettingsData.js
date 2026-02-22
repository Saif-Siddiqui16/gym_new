export const ORGANIZATION = {
    name: 'Kiaan Fitness Premium',
    email: 'contact@kiaanfitness.com',
    phone: '+1 (555) 123-4567',
    address: '123 Fitness Blvd, Silicon Valley, CA',
    timezone: 'PST (UTC-8)',
    currency: 'USD ($)',
    logoUrl: 'https://via.placeholder.com/150'
};

export const BRANCHES = [
    { id: 1, name: 'Downtown HQ', location: 'San Francisco, CA', manager: 'Sarah Connor', status: 'Active', members: 1250 },
    { id: 2, name: 'Westside Studio', location: 'Los Angeles, CA', manager: 'Mike Ross', status: 'Active', members: 850 },
    { id: 3, name: 'North Hills', location: 'Seattle, WA', manager: 'Nancy Drew', status: 'Inactive', members: 0 }
];

export const ROLES_MATRIX = [
    { role: 'Super Admin', permissions: { members: true, finance: true, settings: true, reports: true } },
    { role: 'Branch Manager', permissions: { members: true, finance: false, settings: false, reports: true } },
    { role: 'Trainer', permissions: { members: true, finance: false, settings: false, reports: false } }
];

export const BILLING_INFO = {
    plan: 'Enterprise Tier',
    price: '$299/mo',
    nextBilling: 'Nov 1, 2023',
    paymentMethod: 'Visa ending in 4242',
    invoices: [
        { id: 'INV-001', date: 'Oct 1, 2023', amount: '$299.00', status: 'Paid' },
        { id: 'INV-002', date: 'Sep 1, 2023', amount: '$299.00', status: 'Paid' },
        { id: 'INV-003', date: 'Aug 1, 2023', amount: '$299.00', status: 'Paid' }
    ]
};

export const INTEGRATIONS = [
    { id: 1, name: 'Stripe', description: 'Payment Gateway', status: 'Connected', icon: 'CreditCard' },
    { id: 2, name: 'Mailchimp', description: 'Email Marketing', status: 'Disconnected', icon: 'Mail' },
    { id: 3, name: 'Google Calendar', description: 'Schedule Sync', status: 'Connected', icon: 'Calendar' },
    { id: 4, name: 'WhatsApp Business', description: 'Member Chat', status: 'Disconnected', icon: 'MessageCircle' }
];

export const AUDIT_LOGS = [
    { id: 1, user: 'Admin User', action: 'Updated Organization Settings', ip: '192.168.1.1', date: '2023-10-25 14:30' },
    { id: 2, user: 'Sarah Connor', action: 'Created New Member (M-105)', ip: '192.168.1.4', date: '2023-10-25 10:15' },
    { id: 3, user: 'System', action: 'Automatic Backup', ip: 'localhost', date: '2023-10-25 00:00' },
    { id: 4, user: 'Admin User', action: 'Changed Password', ip: '192.168.1.1', date: '2023-10-24 16:45' }
];
