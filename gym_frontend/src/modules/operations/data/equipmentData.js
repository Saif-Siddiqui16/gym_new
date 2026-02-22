export const EQUIPMENT_INVENTORY = [
    {
        id: 1,
        name: "Matrix Treadmill T7xe",
        category: "Cardio",
        brand: "Matrix",
        model: "T7xe",
        location: "Cardio Zone - Floor 1",
        purchaseDate: "2024-01-15",
        warrantyExpiry: "2026-01-15",
        status: "Operational",
        serialNumber: "MTX-TR-001"
    },
    {
        id: 2,
        name: "LifeFitness Elliptical",
        category: "Cardio",
        brand: "LifeFitness",
        model: "95X",
        location: "Cardio Zone - Floor 1",
        purchaseDate: "2023-11-20",
        warrantyExpiry: "2025-11-20",
        status: "Operational",
        serialNumber: "LF-EL-042"
    },
    {
        id: 3,
        name: "Hammer Strength Bench",
        category: "Strength",
        brand: "Hammer Strength",
        model: "Olympic Flat",
        location: "Free Weights - Floor 2",
        purchaseDate: "2024-02-10",
        warrantyExpiry: "2027-02-10",
        status: "Out of Order",
        serialNumber: "HS-BN-112"
    },
    {
        id: 4,
        name: "Concept2 RowErg",
        category: "Cardio",
        brand: "Concept2",
        model: "Model D",
        location: "Rowing Area - Floor 1",
        purchaseDate: "2024-03-05",
        warrantyExpiry: "2026-03-05",
        status: "Under Maintenance",
        serialNumber: "C2-RW-889"
    },
    {
        id: 5,
        name: "Rogue Kettlebell Set",
        category: "Free Weights",
        brand: "Rogue",
        model: "Standard",
        location: "Functional Area",
        purchaseDate: "2024-05-12",
        warrantyExpiry: "2030-05-12",
        status: "Scheduled Service",
        serialNumber: "RG-KB-SET"
    },
    {
        id: 6,
        name: "Technogym Leg Press",
        category: "Strength",
        brand: "Technogym",
        model: "Selection 900",
        location: "Strength Zone",
        purchaseDate: "2023-08-25",
        warrantyExpiry: "2025-08-25",
        status: "Operational",
        serialNumber: "TG-LP-202"
    }
];

export const EQUIPMENT_CATEGORIES = ["Cardio", "Strength", "Free Weights", "Other"];
export const EQUIPMENT_STATUSES = [
    { label: "Operational", color: "emerald", value: "Operational" },
    { label: "Under Maintenance", color: "amber", value: "Under Maintenance" },
    { label: "Out of Order", color: "red", value: "Out of Order" },
    { label: "Scheduled Service", color: "blue", value: "Scheduled Service" }
];
