import { Users, Building, Activity, DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export const DASHBOARD_DATA = {
    SUPER_ADMIN: {
        stats: [
            { id: 1, title: 'Total Gyms', value: '12', icon: Building, trend: '+2 this month', color: 'primary' },
            { id: 2, title: 'Total Members', value: '1,245', icon: Users, trend: '+15% vs last month', color: 'success' },
            { id: 3, title: 'Active Plans', value: '980', icon: Activity, trend: '85% retention', color: 'warning' },
            { id: 4, title: 'Monthly Revenue', value: '$45,200', icon: DollarSign, trend: '+8% vs last month', color: 'success' },
        ],
        recentRegistrations: [
            { id: 1, gym: 'Iron Fitness', location: 'Downtown', date: '2025-02-01', status: 'Pending' },
            { id: 2, gym: 'FitZone Tech Park', location: 'Tech Park', date: '2025-01-28', status: 'Active' },
            { id: 3, gym: 'Urban Muscle', location: 'West End', date: '2025-01-25', status: 'Active' },
        ]
    },
    BRANCH_MANAGER: {
        stats: [
            { id: 1, title: 'Branch Members', value: '342', icon: Users, trend: '+5 new today', color: 'primary' },
            { id: 2, title: 'Active Trainers', value: '12', icon: Users, trend: 'All shifts covered', color: 'success' },
            { id: 3, title: 'Today Check-ins', value: '85', icon: CheckCircle, trend: 'Peak at 6 PM', color: 'primary' },
            { id: 4, title: 'Branch Revenue', value: '$12,500', icon: DollarSign, trend: 'On target', color: 'success' },
        ],
        memberActivity: [
            { id: 1, member: 'John Doe', action: 'Check-in', time: '08:00 AM' },
            { id: 2, member: 'Alice Smith', action: 'Plan Renewal', time: '09:15 AM' },
            { id: 3, member: 'Bob Jones', action: 'Class Booking', time: '10:30 AM' },
        ],
        trainerAvailability: [
            { id: 1, name: 'Mike Tyson', status: 'Available', specialty: 'Boxing' },
            { id: 2, name: 'Sarah Connor', status: 'In Session', specialty: 'CrossFit' },
        ]
    },
    MANAGER: {
        stats: [
            { id: 1, title: 'Active Members', value: '280', icon: Users, trend: 'Stable', color: 'primary' },
            { id: 2, title: 'Classes Today', value: '8', icon: Calendar, trend: '4 full', color: 'success' },
            { id: 3, title: 'Payments Due', value: '15', icon: AlertCircle, trend: 'Action needed', color: 'warning' },
        ],
        attendance: [
            { id: 1, name: 'Morning Yoga', time: '07:00 AM', attendees: 12, capacity: 15 },
            { id: 2, name: 'HIIT Blast', time: '06:00 PM', attendees: 18, capacity: 20 },
        ]
    },
    STAFF: {
        stats: [
            { id: 1, title: 'Check-ins Today', value: '120', icon: CheckCircle, color: 'primary' },
            { id: 2, title: 'Pending Payments', value: '5', icon: DollarSign, color: 'warning' },
            { id: 3, title: 'New Enquiries', value: '3', icon: Users, color: 'success' },
        ],
        checkins: [
            { id: 101, member: 'Tom Cruise', plan: 'Gold Annual', expiry: '2025-12-31', balance: 0, time: '06:30 PM', status: 'Allowed', photo: 'https://i.pravatar.cc/150?u=tom' },
            { id: 102, member: 'Brad Pitt', plan: 'Silver Monthly', expiry: '2025-02-14', balance: 0, time: '06:35 PM', status: 'Allowed', photo: 'https://i.pravatar.cc/150?u=brad' },
            { id: 103, member: 'Robert Downey', plan: 'Gold Annual', expiry: '2025-05-20', balance: 2500, time: '06:40 PM', status: 'Action Required', photo: 'https://i.pravatar.cc/150?u=rdj' },
            { id: 104, member: 'Scarlett J.', plan: 'Platinum Plus', expiry: '2025-02-10', balance: 0, time: '06:42 PM', status: 'Action Required', photo: 'https://i.pravatar.cc/150?u=scarlett' },
        ]
    },
    TRAINER: {
        role: 'TRAINER',
        isCommissionBased: true,
        stats: [
            { id: 1, title: 'Total Members', value: '25', icon: Users, color: 'primary' },
            { id: 2, title: 'Sessions Today', value: '4', icon: Calendar, color: 'success' },
            { id: 3, title: 'Pending Plans', value: '2', icon: Activity, color: 'warning' },
        ],
        todaySessions: {
            summary: {
                total: 6,
                upcoming: 2,
                completed: 4
            },
            list: [
                { id: 1, type: "PT", time: "09:00 AM", name: "John Doe", status: "Completed", location: "Main Floor" },
                { id: 2, type: "Class", time: "10:30 AM", name: "Strength Training", status: "Completed", location: "Studio A" },
                { id: 3, type: "PT", time: "12:00 PM", name: "Chris Evans", status: "Completed", location: "Main Floor" },
                { id: 4, type: "PT", time: "02:30 PM", name: "Scarlett Johansson", status: "Completed", location: "Private Zone" },
                { id: 5, type: "PT", time: "05:00 PM", name: "Robert Downey", status: "Upcoming", location: "Main Floor" },
                { id: 6, type: "Class", time: "06:30 PM", name: "HIIT Session", status: "Upcoming", location: "Studio B" },
            ]
        },
        myClients: [
            { id: 1, name: 'Chris Evans', membership: 'Platinum Annual', progress: 75, status: 'Active', phone: '+91 98765 43210', lastVisit: '2 days ago', daysSinceLastVisit: 2 },
            { id: 2, name: 'Scarlett Johansson', membership: 'Gold Monthly', progress: 40, status: 'Active', phone: '+91 98765 43211', lastVisit: '12 days ago', daysSinceLastVisit: 12 },
            { id: 3, name: 'Robert Downey', membership: 'Silver Quarterly', progress: 90, status: 'Active', phone: '+91 98765 43212', lastVisit: '15 days ago', daysSinceLastVisit: 15 },
            { id: 4, name: 'Tom Holland', membership: 'Gold Monthly', progress: 20, status: 'Active', phone: '+91 98765 43213', lastVisit: '1 day ago', daysSinceLastVisit: 1 },
            { id: 5, name: 'Mark Ruffalo', membership: 'Platinum Annual', progress: 55, status: 'Active', phone: '+91 98765 43214', lastVisit: '10 days ago', daysSinceLastVisit: 10 },
            { id: 6, name: 'Brie Larson', membership: 'Gold Monthly', progress: 30, status: 'Active', phone: '+91 98765 43215', lastVisit: '18 days ago', daysSinceLastVisit: 18 },
        ],
        pendingTasks: [
            { id: 1, title: 'Members need Diet Plans', count: 3, route: '/diet-plans', type: 'Diet' },
            { id: 2, title: 'Workout Plans Expiring', count: 2, route: '/workout-plans', type: 'Workout' },
            { id: 3, title: 'Progress Logs Pending', count: 5, route: '/progress', type: 'Progress' },
            { id: 4, title: 'Session Feedback Missing', count: 1, route: '/trainer/attendance', type: 'Feedback' },
        ],
        attendanceOverview: {
            sessionsThisWeek: 28,
            attendanceRate: 94,
            missedSessions: 2,
            chartData: [4, 6, 3, 5, 4, 3, 3] // Sessions per day
        },
        earnings: {
            totalEarnings: 45000,
            commission: 25000,
            salary: 20000,
            target: 60000,
            sessionsCount: 42,
            pendingPayouts: 12500
        },
        myAttendance: {
            presentDays: 12,
            lateDays: 1,
            absentDays: 2,
            attendanceRate: 85,
            weeklySummary: [
                { day: 'M', status: 'Present' },
                { day: 'T', status: 'Present' },
                { day: 'W', status: 'Present' },
                { day: 'T', status: 'Late' },
                { day: 'F', status: 'Present' },
                { day: 'S', status: 'Absent' },
                { day: 'S', status: 'Present' },
            ]
        }
    },
    MEMBER: {
        stats: [
            { id: 1, title: 'My Plan', value: 'Gold Annual', icon: CheckCircle, color: 'primary' },
            { id: 2, title: 'Next Class', value: 'Yoga @ 6PM', icon: Calendar, color: 'success' },
            { id: 3, title: 'Attendance', value: '85%', icon: TrendingUp, color: 'success' },
        ],
        planSummary: {
            workoutsCompleted: 14,
            totalWorkouts: 20,
            nextGoal: '5km Run',
            membershipStatus: 'Active',
            expiryDate: '2025-12-31',
            daysRemaining: 320
        },
        announcements: [
            { id: 1, title: 'New Yoga Batch', description: 'Starting from next Monday at 6:00 AM.', date: '2025-02-15', isActive: true },
            { id: 2, title: 'Maintenance Notice', description: 'Gym will be closed for maintenance on Sunday.', date: '2025-02-18', isActive: true },
        ],
        upcomingBookings: [
            { id: 101, title: 'Zumba Class', time: 'Today, 05:00 PM', trainer: 'Alice Johnson', status: 'Confirmed' },
            { id: 102, title: 'Personal Training', time: 'Tomorrow, 10:00 AM', trainer: 'Mike Tyson', status: 'Pending' },
        ],
        benefitWallet: {
            planName: "Gold Annual",
            benefits: [
                {
                    id: 1,
                    name: "Sauna",
                    total: 4,
                    used: 2,
                    label: "Sessions Left",
                    expiry: "2026-12-31"
                },
                {
                    id: 2,
                    name: "Ice Bath",
                    total: 2,
                    used: 1,
                    label: "Used",
                    expiry: "2026-12-31"
                },
                {
                    id: 3,
                    name: "PT Sessions",
                    total: 12,
                    used: 8,
                    label: "Remaining",
                    expiry: "2026-12-31"
                },
                {
                    id: 4,
                    name: "Guest Passes",
                    total: 5,
                    used: 4,
                    label: "Remaining",
                    expiry: "2026-03-31"
                }
            ]
        }
    }
};
