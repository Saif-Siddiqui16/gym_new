
// src/api/staff/reportApi.js
import apiClient from '../apiClient';

export const getDailyAttendanceReport = async (startDate, endDate) => {
    try {
        const response = await apiClient.get('/staff/reports/attendance', {
            params: { startDate, endDate }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch attendance report';
    }
};

export const getBookingReport = async () => {
    try {
        const response = await apiClient.get('/staff/reports/bookings');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch booking report';
    }
};

export const exportReportToCSV = (data, filename = 'report') => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const csv = [headers, ...data.map(d => Object.values(d).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
};

export const exportReportToPDF = (data) => {
    alert("PDF Export initiated (Mock)");
};
