import apiClient from '../apiClient';

export const getTodaysCheckIns = async () => {
    try {
        const response = await apiClient.get('/staff/attendance/today');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch check-ins';
    }
};

export const searchMember = async (query) => {
    try {
        if (!query) return null;
        // Use the unified search endpoint which includes Members + Trainers + Staff
        const response = await apiClient.get('/staff/attendance/search-all', { params: { search: query } });
        const results = response.data.data || [];
        
        // Find exact match or first result
        return results[0] || null;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to search member';
    }
};

export const getMemberSuggestions = async (query) => {
    try {
        if (!query || query.length < 2) return [];
        // Use the unified search endpoint
        const response = await apiClient.get('/staff/attendance/search-all', { params: { search: query } });
        return response.data.data || [];
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch suggestions';
    }
};

export const checkInMember = async (payload) => {
    try {
        // payload is { memberId: id, type: 'Member' } OR { userId: id, type: 'Trainer' }
        const response = await apiClient.post('/staff/attendance/check-in', payload);
        return { success: true, message: 'Check-in successful', data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Check-in failed' };
    }
};

export const checkOutMember = async (payload) => {
    try {
        const response = await apiClient.post('/staff/attendance/check-out', payload);
        return { success: true, message: 'Check-out successful', data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Check-out failed' };
    }
};
