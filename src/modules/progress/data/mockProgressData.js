export const WEIGHT_HISTORY = [
    { date: '2024-01-01', weight: 85.5, bodyFat: 22.1 },
    { date: '2024-01-15', weight: 84.2, bodyFat: 21.8 },
    { date: '2024-02-01', weight: 83.1, bodyFat: 21.2 },
    { date: '2024-02-15', weight: 82.0, bodyFat: 20.5 },
    { date: '2024-03-01', weight: 81.3, bodyFat: 19.8 },
    { date: '2024-03-15', weight: 80.5, bodyFat: 19.2 },
    { date: '2024-04-01', weight: 79.8, bodyFat: 18.5 }
];

export const MEASUREMENTS = {
    chest: { current: 104, change: +2.5, unit: 'cm' },
    waist: { current: 82, change: -4, unit: 'cm' },
    arms: { current: 38.5, change: +1.2, unit: 'cm' },
    legs: { current: 58, change: +0.8, unit: 'cm' }
};

export const PROGRESS_PHOTOS = [
    { id: 'p1', date: '2024-01-01', label: 'Initial State', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80' },
    { id: 'p2', date: '2024-04-01', label: 'Current Progress', url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80' }
];

export const MILESTONES = [
    { id: 'm1', label: 'Weight Goal (78kg)', target: 78, current: 79.8, completed: false },
    { id: 'm2', label: 'Body Fat Goal (15%)', target: 15, current: 18.5, completed: false },
    { id: 'm3', label: '100 Workouts Completed', target: 100, current: 85, completed: false }
];
