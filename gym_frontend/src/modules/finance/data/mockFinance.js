export const TRANSACTIONS = [
    { id: 'TXN-1001', member: 'John Doe', type: 'Membership', amount: 15000, date: '2025-02-13', status: 'Completed', method: 'UPI', branchId: 'B001', receivedBy: 'S-001', referenceNumber: 'UPI882299' },
    { id: 'TXN-1002', member: 'Jane Smith', type: 'POS - Whey Protein', amount: 4500, date: '2025-02-13', status: 'Completed', method: 'Card', branchId: 'B001', receivedBy: 'S-001', referenceNumber: 'CRD771100' },
    { id: 'TXN-1003', member: 'Mike Johnson', type: 'Membership', amount: 5000, date: '2025-02-12', status: 'Failed', method: 'UPI', branchId: 'B001', receivedBy: 'S-002', referenceNumber: 'UPI554433' },
    { id: 'TXN-1004', member: 'Sarah Williams', type: 'Personal Training', amount: 12000, date: '2025-02-11', status: 'Completed', method: 'Cash', branchId: 'B001', receivedBy: 'S-001' },
    { id: 'TXN-1005', member: 'David Brown', type: 'POS - Energy Drink', amount: 150, date: '2025-02-10', status: 'Completed', method: 'UPI', branchId: 'B001', receivedBy: 'S-001', referenceNumber: 'UPI112233' }
];

export const KPIS = {
    revenue: {
        monthly: 450000,
        ytd: 2800000,
        growth: '+12.5%'
    },
    expenses: {
        total: 120000,
        pending: 15000,
        today: 450,
        monthly: 28400,
        cash: 12400,
        card: 16000
    },
    dues: {
        total: 45000,
        count: 8
    },
    collection: {
        today: 19500,
        monthly: 450000,
        cash: 12000,
        card: 4500,
        upi: 3000
    }
};

export const POS_PRODUCTS = [
    { id: 1, name: 'Whey Protein (Gold Standard)', price: 4500, stock: 12, category: 'Supplements', image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'BCAA Energy', price: 2200, stock: 8, category: 'Supplements', image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Mineral Water (500ml)', price: 20, stock: 150, category: 'Beverages', image: 'https://via.placeholder.com/150' },
    { id: 4, name: 'Protein Bar', price: 150, stock: 45, category: 'Snacks', image: 'https://via.placeholder.com/150' },
    { id: 5, name: 'Gym T-Shirt (L)', price: 800, stock: 20, category: 'Merchandise', image: 'https://via.placeholder.com/150' },
    { id: 6, name: 'Shaker Bottle', price: 350, stock: 30, category: 'Merchandise', image: 'https://via.placeholder.com/150' }
];

export const EXPENSES = [
    { id: 'EXP-101', title: 'Office Stationery', category: 'Supplies', amount: 450, date: '2025-02-13', paymentMethod: 'Cash', vendor: 'City Stationers', branchId: 'B001', createdBy: 'S-001', role: 'Staff', createdAt: '2025-02-13T09:00:00Z', notes: 'Pens and notebooks for desk' },
    { id: 'EXP-102', title: 'Water Cans (5 Nos)', category: 'Utilities', amount: 350, date: '2025-02-13', paymentMethod: 'Cash', vendor: 'ClearBlue Water', branchId: 'B001', createdBy: 'S-001', role: 'Staff', createdAt: '2025-02-13T10:30:00Z' },
    { id: 'EXP-103', title: 'AC Filter Cleaning', category: 'Maintenance', amount: 2200, date: '2025-02-12', paymentMethod: 'Card', vendor: 'CoolAir Services', invoiceNumber: 'INV-AC-992', branchId: 'B001', createdBy: 'M-001', role: 'Manager', createdAt: '2025-02-12T14:20:00Z' },
    { id: 'EXP-104', title: 'Cleaning Supplies (Monthly)', category: 'Cleaning', amount: 4500, date: '2025-02-10', paymentMethod: 'Bank Transfer', vendor: 'EcoShop Ltd', invoiceNumber: 'ECO-4411', branchId: 'B001', createdBy: 'A-001', role: 'Branch Admin', createdAt: '2025-02-10T11:00:00Z', notes: 'Stock for Feb month' },
    { id: 'EXP-105', title: 'Gym Rent - Feb', category: 'Rent', amount: 80000, date: '2025-02-01', paymentMethod: 'Bank Transfer', vendor: 'Nexus Realty', branchId: 'B001', createdBy: 'A-001', role: 'Branch Admin', createdAt: '2025-02-01T10:00:00Z', notes: 'Monthly rent' }
];

export const INVOICES = [
    {
        id: 'INV-2024-001',
        invoiceNumber: 'INV-2024-001',
        memberName: 'Mike Johnson',
        serviceType: 'Membership',
        totalAmount: 15000,
        paidAmount: 15000,
        balanceDue: 0,
        status: 'Paid',
        dueDate: '2025-02-10',
        issueDate: '2025-01-10',
        services: [
            { name: 'Gold Membership - 3 Months', quantity: 1, rate: 15000, amount: 15000 }
        ],
        paymentHistory: [
            { date: '2025-01-15', amount: 15000, method: 'UPI', transactionId: 'TXN-1001' }
        ]
    },
    {
        id: 'INV-2024-002',
        invoiceNumber: 'INV-2024-002',
        memberName: 'Emily Davis',
        serviceType: 'PT',
        totalAmount: 12000,
        paidAmount: 5000,
        balanceDue: 7000,
        status: 'Partial',
        dueDate: '2025-02-15',
        issueDate: '2025-01-15',
        services: [
            { name: 'Personal Training Package - 10 Sessions', quantity: 1, rate: 12000, amount: 12000 }
        ],
        paymentHistory: [
            { date: '2025-01-20', amount: 5000, method: 'Card', transactionId: 'TXN-1002' }
        ]
    },
    {
        id: 'INV-2024-003',
        invoiceNumber: 'INV-2024-003',
        memberName: 'Alex Wilson',
        serviceType: 'Product',
        totalAmount: 4500,
        paidAmount: 0,
        balanceDue: 4500,
        status: 'Overdue',
        dueDate: '2025-01-25',
        issueDate: '2025-01-10',
        services: [
            { name: 'Whey Protein (Gold Standard)', quantity: 1, rate: 4500, amount: 4500 }
        ],
        paymentHistory: []
    },
    {
        id: 'INV-2024-004',
        invoiceNumber: 'INV-2024-004',
        memberName: 'Sarah Williams',
        serviceType: 'Membership',
        totalAmount: 8000,
        paidAmount: 8000,
        balanceDue: 0,
        status: 'Paid',
        dueDate: '2025-02-20',
        issueDate: '2025-01-20',
        services: [
            { name: 'Silver Membership - 1 Month', quantity: 1, rate: 8000, amount: 8000 }
        ],
        paymentHistory: [
            { date: '2025-01-22', amount: 8000, method: 'Cash', transactionId: 'TXN-1003' }
        ]
    },
    {
        id: 'INV-2024-005',
        invoiceNumber: 'INV-2024-005',
        memberName: 'David Brown',
        serviceType: 'PT',
        totalAmount: 18000,
        paidAmount: 10000,
        balanceDue: 8000,
        status: 'Partial',
        dueDate: '2025-02-25',
        issueDate: '2025-01-25',
        services: [
            { name: 'Personal Training Package - 15 Sessions', quantity: 1, rate: 18000, amount: 18000 }
        ],
        paymentHistory: [
            { date: '2025-01-28', amount: 10000, method: 'UPI', transactionId: 'TXN-1004' }
        ]
    },
    {
        id: 'INV-2024-006',
        invoiceNumber: 'INV-2024-006',
        memberName: 'Lisa Anderson',
        serviceType: 'Product',
        totalAmount: 2500,
        paidAmount: 0,
        balanceDue: 2500,
        status: 'Overdue',
        dueDate: '2025-01-30',
        issueDate: '2025-01-15',
        services: [
            { name: 'BCAA Energy', quantity: 1, rate: 2200, amount: 2200 },
            { name: 'Shaker Bottle', quantity: 1, rate: 300, amount: 300 }
        ],
        paymentHistory: []
    },
    {
        id: 'INV-2024-007',
        invoiceNumber: 'INV-2024-007',
        memberName: 'Robert Taylor',
        serviceType: 'Membership',
        totalAmount: 25000,
        paidAmount: 25000,
        balanceDue: 0,
        status: 'Paid',
        dueDate: '2025-03-01',
        issueDate: '2025-02-01',
        services: [
            { name: 'Platinum Membership - 6 Months', quantity: 1, rate: 25000, amount: 25000 }
        ],
        paymentHistory: [
            { date: '2025-02-02', amount: 25000, method: 'NetBanking', transactionId: 'TXN-1005' }
        ]
    }
];

