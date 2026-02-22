export const BENEFITS = [
    { id: 'gym_access', name: 'Gym Access', icon: 'Dumbbell', description: 'Unlimited access to gym floor and equipment.', type: 'recurring', limit: 'Unlimited' },
    { id: 'personal_trainer', name: 'Personal Trainer', icon: 'User', description: 'One-on-one sessions with a certified trainer.', type: 'recurring', limit: 4 },
    { id: 'group_classes', name: 'Group Classes', icon: 'Users', description: 'Access to yoga, zumba, and spin classes.', type: 'recurring', limit: 8 },
    { id: 'diet_plan', name: 'Diet Consultation', icon: 'Utensils', description: 'Monthly diet plan review with nutritionist.', type: 'recurring', limit: 1 },
    { id: 'locker', name: 'Private Locker', icon: 'Lock', description: 'Dedicated locker for personal belongings.', type: 'global', limit: 1 },
    { id: 'sauna', name: 'Sauna Access', icon: 'Thermometer', description: 'Post-workout relaxation in sauna.', type: 'recurring', limit: 2 }
];

export const MEMBERSHIPS = [
    {
        id: 'MEM001',
        memberId: 'M-101',
        memberName: 'John Doe (Expiring Soon)',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        gender: 'Male',
        joinDate: '2024-01-15',
        planName: 'Gold Annual',
        status: 'Active',
        startDate: '2025-02-15',
        endDate: '2026-02-16',
        durationMonths: 12,
        branchId: 'B001',
        benefits: ['gym_access', 'personal_trainer', 'diet_plan']
    },
    {
        id: 'MEM002',
        memberId: 'M-102',
        memberName: 'Jane Smith (Recently Expired)',
        email: 'jane.smith@example.com',
        phone: '+1 987 654 3210',
        gender: 'Female',
        joinDate: '2024-03-10',
        planName: 'Silver Monthly',
        status: 'Expired',
        startDate: '2026-01-01',
        endDate: '2026-02-10',
        durationMonths: 1,
        branchId: 'B001',
        benefits: ['gym_access', 'group_classes']
    },
    {
        id: 'MEM003',
        memberId: 'M-103',
        memberName: 'Mike Johnson (Expiring in 2 Days)',
        email: 'mike.j@example.com',
        phone: '+1 555 123 4567',
        gender: 'Male',
        joinDate: '2023-11-20',
        planName: 'Bronze Quarterly',
        status: 'Active',
        startDate: '2025-11-15',
        endDate: '2026-02-15',
        durationMonths: 3,
        branchId: 'B001',
        benefits: ['gym_access']
    },
    {
        id: 'MEM004',
        memberId: 'M-104',
        memberName: 'Sarah Williams (Expired 5 Days Ago)',
        email: 'sarah.w@example.com',
        phone: '+1 444 987 6543',
        gender: 'Female',
        joinDate: '2024-06-05',
        planName: 'Platinum Annual',
        status: 'Expired',
        startDate: '2025-02-08',
        endDate: '2026-02-08',
        durationMonths: 12,
        branchId: 'B001',
        benefits: ['gym_access', 'personal_trainer', 'group_classes', 'diet_plan', 'sauna']
    },
    {
        id: 'MEM005',
        memberId: 'M-105',
        memberName: 'David Brown (Active)',
        email: 'david.b@example.com',
        phone: '+1 222 333 4444',
        gender: 'Male',
        joinDate: '2025-01-20',
        planName: 'Silver Monthly',
        status: 'Active',
        startDate: '2026-01-20',
        endDate: '2026-03-19',
        durationMonths: 1,
        branchId: 'B001',
        benefits: ['gym_access', 'group_classes']
    }
];

export const MEMBERSHIP_PLANS = [
    {
        id: 'PLAN_001',
        name: 'Gold Annual',
        price: 19999,
        duration: 12, // months
        durationType: 'Months',
        description: 'All access pass with personal training included.',
        creditsPerBooking: 1,
        maxBookingsPerDay: 2,
        maxBookingsPerWeek: 10,
        cancellationWindow: 4,
        benefits: [
            { id: 'gym_access', limit: 'Unlimited' },
            { id: 'personal_trainer', limit: 4 }, // 4 sessions per month
            { id: 'sauna', limit: 'Unlimited' }
        ]
    },
    {
        id: 'PLAN_002',
        name: 'Silver Monthly',
        price: 2499,
        duration: 1,
        durationType: 'Months',
        description: 'Standard gym access and group classes.',
        creditsPerBooking: 1,
        maxBookingsPerDay: 1,
        maxBookingsPerWeek: 5,
        cancellationWindow: 2,
        benefits: [
            { id: 'gym_access', limit: 'Unlimited' },
            { id: 'group_classes', limit: 8 }
        ]
    },
    {
        id: 'PLAN_003',
        name: 'Bronze Quarterly',
        price: 5999,
        duration: 3,
        durationType: 'Months',
        description: 'Basic gym access.',
        creditsPerBooking: 1,
        maxBookingsPerDay: 1,
        maxBookingsPerWeek: 3,
        cancellationWindow: 2,
        benefits: [
            { id: 'gym_access', limit: 'Unlimited' }
        ]
    },
    {
        id: 'PLAN_004',
        name: 'Platinum Annual',
        price: 29999,
        duration: 12,
        durationType: 'Months',
        description: 'Ultimate VIP experience.',
        creditsPerBooking: 1,
        maxBookingsPerDay: 3,
        maxBookingsPerWeek: 20,
        cancellationWindow: 8,
        benefits: [
            { id: 'gym_access', limit: 'Unlimited' },
            { id: 'personal_trainer', limit: 12 },
            { id: 'diet_plan', limit: 1 },
            { id: 'sauna', limit: 'Unlimited' },
            { id: 'locker', limit: 1 }
        ]
    }
];
