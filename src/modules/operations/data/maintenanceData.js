export const MAINTENANCE_TICKETS = [
    {
        id: "MT-1001",
        equipmentId: 3,
        equipment: "Hammer Strength Bench",
        issueType: "Physical Damage",
        severity: "Critical",
        reportedBy: "Staff Member",
        date: "2026-02-10",
        status: "Open",
        description: "Seat padding is torn and frame feels unstable.",
        assignedTo: "Unassigned"
    },
    {
        id: "MT-1002",
        equipmentId: 4,
        equipment: "Concept2 RowErg",
        issueType: "Noise/Vibration",
        severity: "Medium",
        reportedBy: "Trainer Mike",
        date: "2026-02-11",
        status: "In Progress",
        description: "Strange clicking noise coming from the fan wheel.",
        assignedTo: "John (In-house Maintenance)"
    },
    {
        id: "MT-1003",
        equipmentId: 1,
        equipment: "Matrix Treadmill T7xe",
        issueType: "Electrical Issue",
        severity: "High",
        reportedBy: "Admin",
        date: "2026-02-12",
        status: "Waiting for Parts",
        description: "Screen flicker and occasional power supply resets.",
        assignedTo: "Matrix Authorized Vendor"
    },
    {
        id: "MT-1004",
        equipmentId: 6,
        equipment: "Technogym Leg Press",
        issueType: "Scheduled Service",
        severity: "Low",
        reportedBy: "System",
        date: "2026-02-13",
        status: "Open",
        description: "Routine 6-month preventive maintenance.",
        assignedTo: "Unassigned"
    },
    {
        id: "MT-1005",
        equipmentId: 2,
        equipment: "LifeFitness Elliptical",
        issueType: "Minor Wear",
        severity: "Low",
        reportedBy: "Staff Member",
        date: "2026-01-20",
        status: "Completed",
        description: "Replace worn pedals.",
        assignedTo: "Alex Maintenance",
        completionDate: "2026-01-22",
        cost: 120
    }
];

export const ISSUE_TYPES = [
    "Not Working",
    "Electrical Issue",
    "Noise/Vibration",
    "Physical Damage",
    "Safety Risk",
    "Other"
];

export const SEVERITIES = [
    { label: "Low", value: "Low", color: "blue" },
    { label: "Medium", value: "Medium", color: "amber" },
    { label: "High", value: "High", color: "orange" },
    { label: "Critical", value: "Critical", color: "red" }
];

export const TICKET_STATUSES = [
    { label: "Open", value: "Open", color: "red" },
    { label: "In Progress", value: "In Progress", color: "amber" },
    { label: "Waiting for Parts", value: "Waiting for Parts", color: "blue" },
    { label: "Completed", value: "Completed", color: "emerald" },
    { label: "Closed", value: "Closed", color: "slate" }
];
