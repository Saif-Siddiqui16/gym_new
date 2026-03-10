import { exportPdf } from "../../utils/exportPdf";

/**
 * Enhanced PDF Export for Admin Dashboard
 * Replaces old CSV and simple PDF exports
 */
export const exportPDF = async (data, filename) => {
    // Map data to friendly names if needed or just pass through
    // For MemberList, we might want to clean up some fields
    const formattedData = data.map(m => ({
        "Member Name": m.name || 'N/A',
        "Member ID": m.memberId || 'N/A',
        "Phone": m.phone || 'N/A',
        "Email": m.email || 'N/A',
        "Status": m.status || 'N/A',
        "Plan": m.plan || 'No Plan',
        "Branch": m.branch || 'Main Branch',
        "Joined": m.joinDate ? new Date(m.joinDate).toLocaleDateString('en-IN') : 'N/A',
        "Expiry": m.expiryDate ? new Date(m.expiryDate).toLocaleDateString('en-IN') : 'N/A',
        "Days Left": m.daysLeft ?? '-',
        "Gender": m.gender || 'N/A',
        "DOB": m.dob || 'N/A'
    }));

    await exportPdf(filename, formattedData);
};

// Keep exportCSV for backward compatibility but route to PDF as requested
export const exportCSV = exportPDF;

