import apiClient from './apiClient';

export const fetchGymDeviceDashboard = async () => {
    try {
        const response = await apiClient.get('/gym-device/dashboard');
        return response.data;
    } catch (error) {
        console.error('Error fetching gym device dashboard:', error);
        throw error;
    }
};

export const fetchGymDevices = async () => {
    try {
        const response = await apiClient.get('/gym-device/devices');
        return response.data;
    } catch (error) {
        console.error('Error fetching gym devices:', error);
        throw error;
    }
};

export const fetchFaceAccessRecords = async () => {
    try {
        const response = await apiClient.get('/gym-device/records');
        return response.data;
    } catch (error) {
        console.error('Error fetching face access records:', error);
        throw error;
    }
};

export const fetchGymDepartments = async () => {
    try {
        const response = await apiClient.get('/gym-device/departments');
        return response.data;
    } catch (error) {
        console.error('Error fetching gym departments:', error);
        throw error;
    }
};

export const fetchGymAttendanceSummary = async (page = 1, limit = 10) => {
    try {
        const response = await apiClient.get(`/gym-device/attendance-summary?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching gym attendance summary:', error);
        throw error;
    }
};
