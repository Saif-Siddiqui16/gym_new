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
        const response = await apiClient.get('/staff/members/search', { params: { search: query } });
        const members = response.data;
        // Search usually expects a single matching member or a precise list
        return members.find(m =>
            m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.memberId.toLowerCase().includes(query.toLowerCase()) ||
            (m.phone && m.phone.includes(query))
        ) || null;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to search member';
    }
};

export const getMemberSuggestions = async (query) => {
    try {
        if (!query || query.length < 2) return [];
        const response = await apiClient.get('/staff/members/search', { params: { search: query } });
        return response.data.slice(0, 5);
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch suggestions';
    }
};

export const checkInMember = async (id) => {
    try {
        // Backend mapping for check-in
        const response = await apiClient.post('/staff/attendance/check-in', { memberId: id });
        return { success: true, message: 'Check-in successful', data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Check-in failed' };
    }
};

export const checkOutMember = async (id) => {
    try {
        // Backend mapping for check-out
        const response = await apiClient.post('/staff/attendance/check-out', { memberId: id });
        return { success: true, message: 'Check-out successful', data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Check-out failed' };
    }
};
