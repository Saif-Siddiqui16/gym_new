// Mock data for operations module

export const STAFF_SCHEDULE = [
    { id: 1, name: 'John Smith', role: 'Trainer', shift: 'Morning (6AM - 2PM)', status: 'On Duty' },
    { id: 2, name: 'Sarah Johnson', role: 'Staff', shift: 'Afternoon (2PM - 10PM)', status: 'On Duty' },
    { id: 3, name: 'Mike Wilson', role: 'Trainer', shift: 'Morning (6AM - 2PM)', status: 'On Leave' },
    { id: 4, name: 'Emily Brown', role: 'Manager', shift: 'Full Day (9AM - 6PM)', status: 'On Duty' },
    { id: 5, name: 'David Lee', role: 'Staff', shift: 'Night (6PM - 12AM)', status: 'On Duty' },
];

export const EQUIPMENT_LIST = [
    { id: 1, name: 'Treadmill - Zone A', status: 'Working', lastMaintenance: '2026-01-15', nextMaintenance: '2026-02-15' },
    { id: 2, name: 'Bench Press #1', status: 'Working', lastMaintenance: '2026-01-20', nextMaintenance: '2026-02-20' },
    { id: 3, name: 'Elliptical #3', status: 'Under Maintenance', lastMaintenance: '2026-02-01', nextMaintenance: '2026-02-08' },
    { id: 4, name: 'Smith Machine', status: 'Working', lastMaintenance: '2026-01-10', nextMaintenance: '2026-02-10' },
    { id: 5, name: 'Cable Crossover', status: 'Out of Order', lastMaintenance: '2025-12-15', nextMaintenance: 'Pending Repair' },
];

export const LOCKERS = [
    { id: 'L001', status: 'Occupied', member: 'John Doe', expiresAt: '2026-02-28' },
    { id: 'L002', status: 'Available', member: null, expiresAt: null },
    { id: 'L003', status: 'Available', member: null, expiresAt: null },
    { id: 'L004', status: 'Occupied', member: 'Jane Smith', expiresAt: '2026-03-15' },
    { id: 'L005', status: 'Reserved', member: 'Mike Brown', expiresAt: '2026-02-10' },
    { id: 'L006', status: 'Available', member: null, expiresAt: null },
    { id: 'L007', status: 'Occupied', member: 'Sarah Lee', expiresAt: '2026-04-01' },
    { id: 'L008', status: 'Maintenance', member: null, expiresAt: null },
];

export const INVENTORY = [
    { id: 1, item: 'Yoga Mats', category: 'Equipment', quantity: 45, minStock: 20, status: 'In Stock' },
    { id: 2, item: 'Dumbbells 5kg', category: 'Weights', quantity: 12, minStock: 10, status: 'In Stock' },
    { id: 3, item: 'Protein Bars', category: 'Supplements', quantity: 8, minStock: 25, status: 'Low Stock' },
    { id: 4, item: 'Towels', category: 'Amenities', quantity: 100, minStock: 50, status: 'In Stock' },
    { id: 5, item: 'Water Bottles', category: 'Amenities', quantity: 5, minStock: 30, status: 'Low Stock' },
    { id: 6, item: 'Resistance Bands', category: 'Equipment', quantity: 30, minStock: 15, status: 'In Stock' },
];

export const ANNOUNCEMENTS = [
    { id: 1, title: 'Gym Timing Change', message: 'Starting Feb 10, gym will open at 5 AM.', date: '2026-02-01', priority: 'high', targetRole: 'all' },
    { id: 2, title: 'New Equipment Arrival', message: 'New cardio machines arriving next week.', date: '2026-01-28', priority: 'medium', targetRole: 'member' },
    { id: 3, title: 'Holiday Closure', message: 'Gym will be closed on Feb 26 for maintenance.', date: '2026-01-25', priority: 'high', targetRole: 'all' },
    { id: 4, title: 'Trainer Workshop', message: 'Advanced hypertrophy workshop this Sunday at 2 PM.', date: '2026-02-05', priority: 'high', targetRole: 'trainer' },
];

export const DEVICES = [
    { id: 1, name: 'Main Entrance - Face ID', type: 'Face ID', status: 'Online', lastSync: '2 Minutes ago', entriesToday: 154 },
    { id: 2, name: 'Turnstile A (Entry)', type: 'Turnstile', status: 'Online', lastSync: '1 Minute ago', entriesToday: 89 },
    { id: 3, name: 'Turnstile B (Exit)', type: 'Turnstile', status: 'Online', lastSync: '5 Minutes ago', entriesToday: 76 },
    { id: 4, name: 'VIP Entrance', type: 'Face ID', status: 'Offline', lastSync: '1 Hour ago', entriesToday: 12 },
    { id: 5, name: 'Staff Gate', type: 'Face ID', status: 'Online', lastSync: 'Just now', entriesToday: 45 },
];
