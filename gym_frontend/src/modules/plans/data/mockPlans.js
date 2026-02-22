export const PLANS = [
    {
        id: 'P-001',
        name: 'Weight Loss Beginner',
        type: 'Diet',
        duration: '4 Weeks',
        target: 'Fat Loss',
        difficulty: 'Beginner',
        author: 'Sarah Connor',
        structure: {
            breakfast: ['Oatmeal with Berries', 'Green Tea', '2 Boiled Eggs'],
            lunch: ['Grilled Chicken Salad', 'Quinoa', 'Water'],
            snacks: ['Apple', 'Almonds (10g)'],
            dinner: ['Steamed Vegetables', 'Grilled Fish', 'Lemon Water']
        }
    },
    {
        id: 'P-002',
        name: 'Muscle Gain Hypertrophy',
        type: 'Workout',
        duration: '12 Weeks',
        target: 'Muscle Gain',
        difficulty: 'Advanced',
        author: 'Steve Rogers',
        structure: [
            {
                day: 'Monday', focus: 'Chest & Triceps', exercises: [
                    { name: 'Bench Press', sets: '4', reps: '8-12' },
                    { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12' },
                    { name: 'Tricep Dips', sets: '3', reps: 'Failure' }
                ]
            },
            {
                day: 'Wednesday', focus: 'Back & Biceps', exercises: [
                    { name: 'Deadlift', sets: '4', reps: '6-8' },
                    { name: 'Pull Ups', sets: '3', reps: '8-10' },
                    { name: 'Barbell Curls', sets: '3', reps: '12' }
                ]
            },
            {
                day: 'Friday', focus: 'Legs & Shoulders', exercises: [
                    { name: 'Squats', sets: '4', reps: '8' },
                    { name: 'Leg Press', sets: '3', reps: '12' },
                    { name: 'Military Press', sets: '4', reps: '10' }
                ]
            }
        ]
    },
    {
        id: 'P-003',
        name: 'Keto Kickstart',
        type: 'Diet',
        duration: '6 Weeks',
        target: 'Fat Loss',
        difficulty: 'Intermediate',
        author: 'Mike Tyson',
        structure: {
            breakfast: ['Bacon & Eggs', 'Black Coffee'],
            lunch: ['Caesar Salad (No Croutons)', 'Grilled Steak'],
            snacks: ['Cheese Cubes', 'Macadamia Nuts'],
            dinner: ['Salmon with Asparagus', 'Avocado']
        }
    },
    {
        id: 'P-004',
        name: 'Athletic Performance',
        type: 'Workout',
        duration: '8 Weeks',
        target: 'Fitness',
        difficulty: 'Intermediate',
        author: 'Natasha Romanoff',
        structure: [
            {
                day: 'Tuesday', focus: 'HIIT & Core', exercises: [
                    { name: 'Burpees', sets: '5', reps: '20' },
                    { name: 'Box Jumps', sets: '4', reps: '15' },
                    { name: 'Plank', sets: '3', reps: '60s' }
                ]
            },
            {
                day: 'Thursday', focus: 'Agility & Lower Body', exercises: [
                    { name: 'Ladder Drills', sets: '5', reps: '2 mins' },
                    { name: 'Jump Lunges', sets: '3', reps: '20' }
                ]
            }
        ]
    }
];
