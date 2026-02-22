export const STAFF_LIST = [
    { id: 'S-1001', name: 'Mike Tyson', role: 'Senior Trainer', department: 'Training', status: 'Active', salary: 45000, commission: 20, joinDate: '2024-01-15' },
    { id: 'S-1002', name: 'Sarah Connor', role: 'Sales Manager', department: 'Sales', status: 'Active', salary: 35000, commission: 10, joinDate: '2024-02-01' },
    { id: 'S-1003', name: 'John Wick', role: 'Cleaner', department: 'Housekeeping', status: 'Active', salary: 12000, commission: 0, joinDate: '2024-01-10' },
    { id: 'S-1004', name: 'Elena Fisher', role: 'Receptionist', department: 'Operations', status: 'On Leave', salary: 25000, commission: 5, joinDate: '2024-03-05' },
];

export const PAYROLL_DATA = [
    { id: 1, month: 'January 2025', staffId: 'S-1001', name: 'Mike Tyson', baseSalary: 45000, bonus: 5000, deductions: 2000, attendanceRate: 95, commission: 8500, netPay: 56500, status: 'Paid' },
    { id: 2, month: 'January 2025', staffId: 'S-1002', name: 'Sarah Connor', baseSalary: 35000, bonus: 8000, deductions: 1500, attendanceRate: 100, commission: 4200, netPay: 45700, status: 'Pending' },
    { id: 3, month: 'January 2025', staffId: 'S-1003', name: 'John Wick', baseSalary: 12000, bonus: 0, deductions: 500, attendanceRate: 80, commission: 0, netPay: 11500, status: 'Paid' },
];

export const TRAINER_ASSIGNMENTS = [
    { id: 'T-1', name: 'Mike Tyson', activeClients: 12, capacity: 20, specialty: 'Boxing' },
    { id: 'T-2', name: 'Rocky Balboa', activeClients: 18, capacity: 20, specialty: 'Strength' },
    { id: 'T-3', name: 'Bruce Lee', activeClients: 5, capacity: 15, specialty: 'Martial Arts' },
];
