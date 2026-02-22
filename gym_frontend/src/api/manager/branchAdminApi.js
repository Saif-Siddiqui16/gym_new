/**
 * Branch Admin API Mock Implementation
 * This file contains mock functions that will be replaced with real backend calls later.
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchBranchDashboardCards = async () => {
    await delay(500);
    return [
        { title: 'Total Members', value: '1,280', change: '+12%', icon: 'users', color: 'blue' },
        { title: 'Active Plans', value: '850', change: '+5%', icon: 'file-text', color: 'green' },
        { title: 'Revenue (M)', value: '$12,450', change: '+8%', icon: 'dollar-sign', color: 'purple' },
        { title: 'Check-ins', value: '142', change: '-2%', icon: 'activity', color: 'orange' },
    ];
};

export const fetchProfile = async () => {
    await delay(500);
    return {
        name: 'Alex Johnson',
        email: 'alex.j@newgym.com',
        role: 'Branch Administrator',
        branch: 'Downtown Branch',
        avatar: null
    };
};

export const updateProfile = async (data) => {
    await delay(1000);
    console.log("API: Profile updated", data);
    return { success: true };
};

let members = [
    { id: 1, name: 'Alice Johnson', plan: 'Premium', status: 'Active', joinDate: '2023-01-15', expiryDate: '2024-01-15', balance: '$0.00' },
    { id: 2, name: 'Bob Smith', plan: 'Basic', status: 'Inactive', joinDate: '2023-03-10', expiryDate: '2023-09-10', balance: '$25.00' },
    { id: 3, name: 'Charlie Brown', plan: 'Standard', status: 'Active', joinDate: '2023-05-20', expiryDate: '2024-05-20', balance: '$0.00' },
    { id: 4, name: 'John Doe', plan: 'Basic', status: 'Expired', joinDate: '2022-01-01', expiryDate: '2023-01-01', balance: '$0.00' },
    { id: 5, name: 'Jane Roe', plan: 'Standard', status: 'Due', joinDate: '2023-11-20', expiryDate: '2024-11-20', balance: '$50.00' },
    { id: 6, name: 'Jack Black', plan: 'Premium', status: 'Blocked', joinDate: '2023-06-15', expiryDate: '2024-06-15', balance: '$100.00' },
];

export const fetchAllMembers = async (filters = {}) => {
    await delay(800);
    return members;
};

export const addMember = async (data) => {
    await delay(1000);
    const newMember = { id: Date.now(), ...data, status: 'Active', joinDate: new Date().toISOString().split('T')[0], balance: '$0.00' };
    members.push(newMember);
    console.log('API: Member added', newMember);
    return { success: true, member: newMember };
};

export const updateMember = async (id, data) => {
    await delay(1000);
    const index = members.findIndex(m => m.id === parseInt(id));
    if (index !== -1) {
        members[index] = { ...members[index], ...data };
    }
    console.log(`API: Member ${id} updated`, data);
    return { success: true };
};

export const deleteMember = async (id) => {
    await delay(1000);
    members = members.filter(m => m.id !== id);
    console.log(`API: Member ${id} deleted`);
    return { success: true };
};

let plans = [
    { id: 1, name: 'Basic', price: '$29.99', duration: '1 Month' },
    { id: 2, name: 'Standard', price: '$49.99', duration: '3 Months' },
    { id: 3, name: 'Premium', price: '$79.99', duration: '6 Months' },
];

export const fetchMembershipPlans = async () => {
    await delay(500);
    return plans;
};

export const deleteMembershipPlan = async (id) => {
    await delay(800);
    plans = plans.filter(p => p.id !== id);
    console.log(`API: Plan ${id} deleted`);
    return { success: true };
};

export const addMembershipPlan = async (data) => {
    await delay(1000);
    const newPlan = { id: Date.now(), ...data, status: 'Active' };
    plans.push(newPlan);
    console.log('API: Plan added', newPlan);
    return { success: true, plan: newPlan };
};

export const assignMembership = async (memberId, planId) => {
    await delay(1000);
    const index = members.findIndex(m => m.id === parseInt(memberId));
    if (index !== -1) {
        members[index].plan = planId; // Should ideally map ID to Name
        members[index].status = 'Active';
    }
    console.log(`API: Plan ${planId} assigned to member ${memberId}`);
    return { success: true };
};

export const upgradeMembership = async (memberId, newPlanId) => {
    await delay(1000);
    const index = members.findIndex(m => m.id === parseInt(memberId));
    if (index !== -1) {
        members[index].plan = typeof newPlanId === 'string' ? newPlanId : 'Premium'; // Fallback for mock
        members[index].status = 'Active';
        members[index].expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
    }
    console.log(`API: Member ${memberId} upgraded to plan ${newPlanId}`);
    return { success: true };
};

export const fetchBenefitWallet = async () => {
    await delay(500);
    return { balance: '$450.00', credits: 120, rules: [] };
};

export const updateCreditRules = async (rules) => {
    await delay(1000);
    return { success: true };
};

export const fetchWalletUsageHistory = async () => {
    await delay(800);
    return [
        { id: 1, date: '2024-01-20', description: 'Personal Training Session', amount: '-20 Credits' },
        { id: 2, date: '2024-01-18', description: 'Juice Bar Purchase', amount: '-5 Credits' },
    ];
};

export const fetchSaunaBookings = async () => {
    await delay(500);
    return [
        { id: 1, member: 'Alice Johnson', date: '2026-02-02', time: '10:00 AM', duration: '30 min', credits: 10, status: 'Booked' },
        { id: 2, member: 'Charlie Brown', date: '2026-02-02', time: '11:30 AM', duration: '45 min', credits: 15, status: 'Completed' },
        { id: 3, member: 'David Wilson', date: '2026-02-03', time: '09:00 AM', duration: '30 min', credits: 10, status: 'Cancelled' },
    ];
};

export const fetchIceBathBookings = async () => {
    await delay(500);
    return [
        { id: 1, member: 'Bob Smith', date: '2026-02-02', time: '02:00 PM', duration: '15 min', credits: 5, status: 'Booked' },
        { id: 2, member: 'Jane Roe', date: '2026-02-02', time: '03:45 PM', duration: '15 min', credits: 5, status: 'Booked' },
    ];
};

export const cancelBooking = async (id) => {
    await delay(800);
    console.log(`API: Booking ${id} cancelled`);
    return { success: true };
};

export const viewBookingDetails = async (id) => {
    await delay(500);
    return { success: true };
};

export const fetchBookingCalendar = async () => {
    await delay(500);
    return {
        slots: [
            { time: '06:00 AM' }, { time: '07:00 AM' }, { time: '08:00 AM' }, { time: '09:00 AM' },
            { time: '10:00 AM' }, { time: '11:00 AM' }, { time: '12:00 PM' }, { time: '01:00 PM' },
            { time: '02:00 PM' }, { time: '03:00 PM' }, { time: '04:00 PM' }, { time: '05:00 PM' },
            { time: '06:00 PM' }
        ],
        bookings: [
            { id: 1, member: 'Alice Johnson', facility: 'Sauna', time: '10:00 AM', dayIdx: 0 },
            { id: 2, member: 'Bob Smith', facility: 'Ice Bath', time: '02:00 PM', dayIdx: 0 },
            { id: 3, member: 'Charlie Brown', facility: 'Sauna', time: '11:00 AM', dayIdx: 1 },
            { id: 4, member: 'Jane Roe', facility: 'Ice Bath', time: '03:00 PM', dayIdx: 2 },
            { id: 5, member: 'Mike Tyson', facility: 'Sauna', time: '06:00 AM', dayIdx: 4 },
        ]
    };
};

export const fetchInvoices = async () => {
    await delay(500);
    return [
        { id: 'INV-001', member: 'Alice Johnson', date: '2026-01-15', amount: 1500, paid: 1500, status: 'Paid' },
        { id: 'INV-002', member: 'Bob Smith', date: '2026-02-01', amount: 800, paid: 200, status: 'Partially Paid' },
        { id: 'INV-003', member: 'Jane Roe', date: '2026-02-02', amount: 1200, paid: 0, status: 'Unpaid' },
    ];
};

export const fetchPayments = async () => {
    await delay(500);
    return [
        { id: 'TXN-101', member: 'Alice Johnson', date: '2026-01-15', amount: 1500, method: 'Credit Card', invoiceId: 'INV-001' },
        { id: 'TXN-102', member: 'Bob Smith', date: '2026-02-01', amount: 200, method: 'UPI', invoiceId: 'INV-002' },
    ];
};

export const updatePaymentStatus = async (id, status) => {
    await delay(500);
    return { success: true };
};

export const fetchBalanceDueMembers = async () => {
    await delay(500);
    const invoices = [
        { id: 'INV-002', member: 'Bob Smith', amount: 800, paid: 200, status: 'Partially Paid' },
        { id: 'INV-003', member: 'Jane Roe', amount: 1200, paid: 0, status: 'Unpaid' },
    ];
    return invoices;
};

export const fetchGSTReports = async () => {
    await delay(500);
    return [
        { date: '2026-01-15', id: 'INV-001', member: 'Alice Johnson', taxable: 1271.18, gst: 228.82, gstRate: '18%' },
        { date: '2026-02-01', id: 'INV-002', member: 'Bob Smith', taxable: 169.49, gst: 30.51, gstRate: '18%' },
    ];
};

export const fetchAccessLogs = async () => {
    await delay(500);
    return [
        { id: 1, member: 'Alice Johnson', memberId: 'M-101', time: '10:30 AM', status: 'Allowed', gate: 'Main Entrance', reason: 'Active Plan' },
        { id: 2, member: 'Unknown', memberId: 'N/A', time: '10:45 AM', status: 'Denied', gate: 'Staff Entry', reason: 'Unrecognized ID' },
        { id: 3, member: 'Charlie Brown', memberId: 'M-103', time: '11:15 AM', status: 'Allowed', gate: 'Main Entrance', reason: 'Active Plan' },
        { id: 4, member: 'John Doe', memberId: 'M-104', time: '11:30 AM', status: 'Denied', gate: 'Main Entrance', reason: 'Expired Plan' },
        { id: 5, member: 'Jane Roe', memberId: 'M-105', time: '12:00 PM', status: 'Allowed', gate: 'Side Gate', reason: 'Active Plan' },
    ];
};

export const fetchLiveEntryLogs = async () => {
    return await fetchAccessLogs();
};

export const fetchBlockedAttempts = async () => {
    const logs = await fetchAccessLogs();
    return logs.filter(l => l.status === 'Denied');
};

export const manualAccessOverride = async (doorId) => {
    await delay(1000);
    return { success: true };
};

export const fetchLockers = async () => {
    await delay(500);
    return [
        { id: 'L-101', status: 'Occupied', member: 'Alice Johnson', type: 'Paid', assignedDate: '2024-01-10' },
        { id: 'L-102', status: 'Available', member: '-', type: 'Free', assignedDate: '-' },
        { id: 'L-103', status: 'Occupied', member: 'Charlie Brown', type: 'Paid', assignedDate: '2024-02-01' },
        { id: 'L-104', status: 'Available', member: '-', type: 'Free', assignedDate: '-' },
        { id: 'L-105', status: 'Maintenance', member: '-', type: 'Paid', assignedDate: '-' },
    ];
};

export const assignLocker = async (memberId, lockerId) => {
    await delay(500);
    return { success: true };
};

export const releaseLocker = async (lockerId) => {
    await delay(500);
    return { success: true };
};

export const fetchPaidLockers = async () => {
    const data = await fetchLockers();
    return data.filter(l => l.type === 'Paid');
};

export const fetchFreeLockers = async () => {
    const data = await fetchLockers();
    return data.filter(l => l.type === 'Free');
};

export const fetchManagers = async () => {
    await delay(500);
    return [
        { id: 1, name: 'Robert Vance', role: 'Branch Manager', email: 'robert@gym.com', status: 'Active' },
        { id: 2, name: 'Sarah Connor', role: 'Operations Manager', email: 'sarah@gym.com', status: 'Active' },
    ];
};

export const fetchStaff = async () => {
    await delay(500)
    return [
        { id: 1, name: 'Mike Ross', role: 'Receptionist', branch: 'Main City', shift: 'Morning', status: 'Active' },
        { id: 2, name: 'Rachel Zane', role: 'Sales Executive', branch: 'Main City', shift: 'Evening', status: 'Active' },
    ];
};

export const fetchTrainers = async () => {
    await delay(500);
    return [
        { id: 1, name: 'John Matrix', specialization: 'Bodybuilding', branch: 'Main City', clients: 12, status: 'Active' },
        { id: 2, name: 'Arnold S.', specialization: 'Crossfit', branch: 'Main City', clients: 8, status: 'Active' },
    ];
};

export const assignTrainer = async (memberId, trainerId) => {
    await delay(500);
    return { success: true };
};

export const fetchTasks = async () => {
    await delay(500);
    return [
        { id: 1, title: 'Clean Ice Bath Area', assignedTo: 'John Doe', priority: 'High', status: 'Pending', dueDate: '2026-02-02' },
    ];
};

export const addTask = async (data) => {
    await delay(500);
    return { success: true };
};

export const updateTaskStatus = async (id, status) => {
    await delay(500);
    return { success: true };
};

export const fetchTrainerAssignments = async (trainerId) => {
    await delay(500);
    const mockAssignments = [
        { id: 101, trainerId: 1, member: 'Alice Johnson', plan: 'Premium', since: '2024-01-10', status: 'Active' },
        { id: 102, trainerId: 1, member: 'Charlie Brown', plan: 'Standard', since: '2024-02-01', status: 'Active' },
        { id: 103, trainerId: 2, member: 'Bob Smith', plan: 'Basic', since: '2024-01-15', status: 'Active' },
    ];
    return trainerId ? mockAssignments.filter(a => a.trainerId === parseInt(trainerId)) : mockAssignments;
};

export const fetchUsageReports = async () => {
    await delay(500);
    return {
        avgFootfall: 145,
        peakOccupancy: '85%',
        peakHours: ['06:00 AM', '11:00 AM', '06:00 PM'],
        facilityUsage: [
            { name: 'Main Gym Floor', users: 850 },
            { name: 'Sauna Room', users: 320 },
            { name: 'Ice Bath Station', users: 210 },
            { name: 'Cardio Zone', users: 540 },
        ]
    };
};

export const fetchBranchReports = async () => {
    await delay(500);
    return {};
};

export const fetchTaskReports = async () => {
    await delay(500);
    return {
        completed: 42,
        pending: 12,
        overdue: 3,
        performance: [
            { name: 'John Doe', tasks: 15, completed: 14 },
            { name: 'Jane Roe', tasks: 12, completed: 10 },
            { name: 'Mike Smith', tasks: 10, completed: 9 },
        ]
    };
};

export const fetchBranchSettings = async () => {
    await delay(500);
    return { name: 'Main City Branch', address: 'New York Central Park', phone: '+91 9876543210' };
};

export const updateBranchSettings = async (data) => {
    await delay(500);
    return { success: true };
};

export const exportTable = (tableName) => {
    console.log(`Exporting table: ${tableName}`);
    // Simulate export
    const blob = new Blob(['Mock data'], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${tableName}_export.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
export const fetchRoles = async () => {
    await delay(500);
    return [
        { id: 1, name: 'Branch Admin', members: 2, permissions: ['All Access'] },
        { id: 2, name: 'Manager', members: 3, permissions: ['Manage Members', 'View Reports', 'Locker Assignment'] },
        { id: 3, name: 'Staff', members: 8, permissions: ['Check-in Members', 'Locker Assignment'] },
        { id: 4, name: 'Trainer', members: 12, permissions: ['View Assigned Members', 'Mark Attendance'] },
    ];
};

export const updateRolePermissions = async (roleId, permissions) => {
    await delay(1000);
    console.log(`API: Role ${roleId} permissions updated:`, permissions);
    return { success: true };
};

export const recordPayment = async (invoiceId, amount) => {
    await delay(800);
    console.log(`API: Payment of ${amount} recorded for invoice ${invoiceId}`);
    return { success: true };
};

export const sendBulkReminders = async (invoiceIds) => {
    await delay(1500);
    console.log(`API: Reminders sent for ${invoiceIds.length} invoices`);
    return { success: true };
};

export const addManager = async (managerData) => {
    await delay(1000);
    console.log("API: Manager added:", managerData);
    return { success: true, manager: { id: `MGR-${Date.now()}`, ...managerData, joinedDate: new Date().toISOString().split('T')[0], status: 'Active' } };
};

export const addStaff = async (staffData) => {
    await delay(1000);
    console.log("API: Staff added:", staffData);
    return { success: true, staff: { id: `STF-${Date.now()}`, ...staffData, status: 'Active' } };
};

export const addTrainer = async (trainerData) => {
    await delay(1000);
    console.log("API: Trainer added:", trainerData);
    return { success: true, trainer: { id: `TRN-${Date.now()}`, ...trainerData, status: 'Active', clients: 0 } };
};

export const addGym = async (gymData) => {
    await delay(1500);
    console.log("API: Gym branch added:", gymData);
    return { success: true };
};

export const addProduct = async (productData) => {
    await delay(1000);
    console.log("API: Product added:", productData);
    return { success: true };
};
