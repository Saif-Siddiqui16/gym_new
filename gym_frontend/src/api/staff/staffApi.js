import apiClient from '../apiClient';

// --- PROFILE API ---
export const fetchStaffProfile = async () => {
    try {
        const response = await apiClient.get('/auth/me');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch staff profile';
    }
};

export const updateStaffProfile = async (updated) => {
    try {
        const response = await apiClient.patch('/auth/profile', updated);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update staff profile';
    }
};

export const changeStaffPassword = async (passwords) => {
    try {
        const response = await apiClient.post('/auth/change-password', passwords);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to change password';
    }
};

export const fetchStaffEarnings = async () => {
    try {
        const response = await apiClient.get('/staff/earnings');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch staff earnings';
    }
};
