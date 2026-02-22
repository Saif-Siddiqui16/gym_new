export const TRAINERS = [
    { id: 'T-001', name: 'Mike Tyson', specialty: 'Boxing' },
    { id: 'T-002', name: 'Sarah Connor', specialty: 'CrossFit' },
    { id: 'T-003', name: 'Steve Rogers', specialty: 'Strength' },
    { id: 'T-004', name: 'Bruce Lee', specialty: 'Martial Arts' },
    { id: 'T-005', name: 'Natasha Romanoff', specialty: 'Agility' }
];

export const MEMBERS = [
    { id: 'M-101', name: 'John Doe', email: 'john@example.com' },
    { id: 'M-102', name: 'Jane Smith', email: 'jane@example.com' },
    { id: 'M-103', name: 'Bob Jones', email: 'bob@example.com' },
    { id: 'M-104', name: 'Alice Wonderland', email: 'alice@example.com' },
    { id: 'M-105', name: 'Tony Stark', email: 'tony@example.com' }
];

export const CLASSES = [
    {
        id: 'CLS-001',
        name: 'Morning Yoga',
        description: 'A relaxing start to your day with basic yoga poses.',
        trainerId: 'T-005',
        trainerName: 'Natasha Romanoff',
        schedule: 'Mon, Wed, Fri • 07:00 AM',
        duration: '60 mins',
        capacity: 20,
        enrolled: 15,
        status: 'Scheduled',
        location: 'Studio A',
        enrolledMembers: ['M-101', 'M-102']
    },
    {
        id: 'CLS-002',
        name: 'HIIT Blast',
        description: 'High intensity interval training for maximum burn.',
        trainerId: 'T-002',
        trainerName: 'Sarah Connor',
        schedule: 'Tue, Thu • 06:00 PM',
        duration: '45 mins',
        capacity: 15,
        enrolled: 15,
        status: 'Full',
        location: 'Studio B',
        enrolledMembers: ['M-103', 'M-104', 'M-105'] // Mocking full list logic elsewhere
    },
    {
        id: 'CLS-003',
        name: 'Power Lifting',
        description: 'Focus on bench, squat, and deadlift techniques.',
        trainerId: 'T-003',
        trainerName: 'Steve Rogers',
        schedule: 'Sat • 10:00 AM',
        duration: '90 mins',
        capacity: 10,
        enrolled: 8,
        status: 'Scheduled',
        location: 'Weight Room',
        enrolledMembers: ['M-101', 'M-105']
    },
    {
        id: 'CLS-004',
        name: 'Zumba Dance',
        description: 'Dance your way to fitness with Latin beats.',
        trainerId: null, // Unassigned
        trainerName: 'Unassigned',
        schedule: 'Wed • 05:00 PM',
        duration: '60 mins',
        capacity: 25,
        enrolled: 5,
        status: 'Pedning Trainer',
        location: 'Studio A',
        enrolledMembers: ['M-102']
    },
    {
        id: 'CLS-005',
        name: 'Boxing Basics',
        description: 'Learn the fundamentals of boxing stance and punch.',
        trainerId: 'T-001',
        trainerName: 'Mike Tyson',
        schedule: 'Mon, Fri • 04:00 PM',
        duration: '60 mins',
        capacity: 12,
        enrolled: 12,
        status: 'Completed',
        location: 'Boxing Ring',
        enrolledMembers: []
    }
];
