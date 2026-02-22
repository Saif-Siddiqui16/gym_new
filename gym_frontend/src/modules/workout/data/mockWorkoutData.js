export const WORKOUT_PLANS = [
    {
        id: 'wp1',
        name: 'Hypertrophy Mastery',
        description: 'Advanced muscle-building protocol focusing on mechanical tension and metabolic stress.',
        target: 'Muscle Gain',
        duration: '12 Weeks',
        difficulty: 'Advanced',
        exercisesCount: 42,
        avgDuration: '75 min',
        intensity: 'High',
        days: {
            monday: [
                { id: 'ex1', name: 'Barbell Bench Press', sets: 4, reps: '8-10', rpe: 8, rest: '120s', notes: 'Keep elbows at 45 degrees.' },
                { id: 'ex2', name: 'Incline Dumbbell Flyes', sets: 3, reps: '12-15', rpe: 9, rest: '90s', notes: 'Focus on the stretch at the bottom.' },
                { id: 'ex3', name: 'Weighted Dips', sets: 3, reps: 'Failure', rpe: 10, rest: '90s', notes: 'Lean forward to target chest.' }
            ],
            tuesday: [
                { id: 'ex4', name: 'Deadlifts', sets: 5, reps: '5', rpe: 9, rest: '180s', notes: 'Maintain neutral spine throughout.' },
                { id: 'ex5', name: 'Weighted Pullups', sets: 4, reps: '8-10', rpe: 8, rest: '120s', notes: 'Full extension at bottom.' }
            ]
        }
    },
    {
        id: 'wp2',
        name: 'Fat Incinerator',
        description: 'High-intensity interval training combined with compound movements for maximum caloric burn.',
        target: 'Fat Loss',
        duration: '8 Weeks',
        difficulty: 'Intermediate',
        exercisesCount: 35,
        avgDuration: '45 min',
        intensity: 'Extreme',
        days: {
            monday: [
                { id: 'ex6', name: 'Kettlebell Swings', sets: 5, reps: '20', rpe: 9, rest: '60s', notes: 'Explosive hip hinge.' },
                { id: 'ex7', name: 'Burpees', sets: 4, reps: '15', rpe: 10, rest: '45s', notes: 'Chest to floor every rep.' }
            ]
        }
    }
];

export const MEMBER_WORKOUT_STATUS = {
    assignedPlan: 'wp1',
    currentWeek: 3,
    currentDay: 'Monday',
    status: 'In Progress',
    streak: 12
};
