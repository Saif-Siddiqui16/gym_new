import { exportPdf } from "../../utils/exportPdf";

export const exportPDF = async (data, filename) => {
    // Format data for PDF if necessary, or pass directly
    // This ensures consistency with the Admin/Superadmin PDF format
    await exportPdf(filename || "Trainer_Report", data);
};

// Map exportCSV to exportPDF for backward compatibility
export const exportCSV = exportPDF;
