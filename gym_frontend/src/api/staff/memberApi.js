import apiClient from '../apiClient';

export const getMembers = async () => {
    try {
        const response = await apiClient.get('/staff/members');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch members';
    }
};

export const getMemberById = async (id) => {
    try {
        const response = await apiClient.get(`/staff/members/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch member details';
    }
};

export const getMemberStats = async () => {
    try {
        const response = await apiClient.get('/staff/members');
        const members = response.data;
        return {
            total: members.length,
            active: members.filter(m => m.status === 'Active').length,
            expired: members.filter(m => m.status === 'Expired').length,
            inactive: members.filter(m => m.status === 'Inactive').length,
        };
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch member stats';
    }
};
