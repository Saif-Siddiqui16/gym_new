import apiClient from '../apiClient';

/**
 * Marks attendance via QR scan (Self Check-in/Out)
 * Works for Members, Staff, Managers, and Trainers
 */
export const scanAttendance = async (qrData) => {
    try {
        // qrData usually contains the admin/branch unique identifier or token
        const response = await apiClient.post('/attendance/scan-checkin', { qrContent: qrData });
        return {
            success: true,
            message: response.data.message || 'Attendance marked successfully',
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to mark attendance'
        };
    }
};
