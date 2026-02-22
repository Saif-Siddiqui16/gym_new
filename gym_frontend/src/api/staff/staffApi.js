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
