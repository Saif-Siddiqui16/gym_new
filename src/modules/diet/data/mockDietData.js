export const ASSIGNED_CLIENTS = [
    { id: 'C-001', name: 'Rahul Sharma' },
    { id: 'C-002', name: 'Priya Patel' },
    { id: 'C-003', name: 'Amit Singh' },
    { id: 'C-004', name: 'Sneha Reddy' }
];

export const DIET_PLANS = [
    {
        id: 'DP-001',
        clientId: 'C-001',
        name: 'Lean Bulk High Protein',
        description: 'Optimized for muscle growth with minimal fat gain.',
        target: 'Muscle Gain',
        duration: '12',
        difficulty: 'Intermediate',
        calories: 2800,
        macros: { protein: 150, carbs: 200, fats: 65 },
        status: 'Active',
        meals: [
            { id: 1, name: 'Breakfast', time: '08:00 AM', notes: '1 cup oats, 1 scoop protein, berries', cals: 450, protein: 30, carbs: 50, fats: 10 },
            { id: 2, name: 'Lunch', time: '01:00 PM', notes: '200g chicken, 1 cup brown rice, broccoli', cals: 600, protein: 50, carbs: 60, fats: 8 },
            { id: 3, name: 'Snacks', time: '04:00 PM', notes: '200g yogurt, handful of almonds', cals: 300, protein: 20, carbs: 10, fats: 15 },
            { id: 4, name: 'Dinner', time: '08:00 PM', notes: '200g salmon, bunch of asparagus', cals: 500, protein: 40, carbs: 5, fats: 35 }
        ],
        notes: "Drink 3L water daily. Avoid processed sugar."
    },
    {
        id: 'DP-002',
        clientId: 'C-002',
        name: 'Fat Loss Shred',
        description: 'High volume, low calorie meals for effective weight loss.',
        target: 'Fat Loss',
        duration: '8',
        difficulty: 'Advanced',
        calories: 1800,
        macros: { protein: 180, carbs: 120, fats: 50 },
        status: 'Active',
        meals: [
            { id: 1, name: 'Breakfast', time: '08:00 AM', notes: '5 egg whites, spinach, mushrooms', cals: 250, protein: 35, carbs: 5, fats: 10 },
            { id: 2, name: 'Lunch', time: '01:00 PM', notes: '150g turkey breast, mixed greens, vinaigrette', cals: 400, protein: 40, carbs: 10, fats: 20 },
            { id: 3, name: 'Snacks', time: '04:00 PM', notes: '1 scoop whey with water', cals: 120, protein: 25, carbs: 2, fats: 2 },
            { id: 4, name: 'Dinner', time: '08:00 PM', notes: '200g cod, steamed zucchini', cals: 300, protein: 45, carbs: 8, fats: 5 }
        ],
        notes: "No carbs after 7 PM."
    }
];

export const MEMBER_DIET_STATUS = {
    assignedPlan: 'DP-001',
    currentStreak: 5,
    todayCompletion: 75
};
