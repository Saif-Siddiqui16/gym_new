import apiClient from '../apiClient';

export const getLockers = async () => {
    try {
        const response = await apiClient.get('/staff/lockers');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch lockers';
    }
};

export const assignLocker = async (id, memberId, memberName, isPaid, notes, price) => {
    try {
        const response = await apiClient.post(`/staff/lockers/${id}/assign`, { memberId, memberName, isPaid, notes, price });
        return { success: true, message: 'Locker assigned successfully', data: response.data };
    } catch (error) {
        return { success: false, message: error || 'Failed to assign locker' };
    }
};

export const releaseLocker = async (lockerId) => {
    try {
        const response = await apiClient.post(`/staff/lockers/${lockerId}/release`);
        return { success: true, message: 'Locker released successfully', data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to release locker' };
    }
};

export const addLocker = async (lockerData) => {
    try {
        const response = await apiClient.post('/staff/lockers', lockerData);
        return { success: true, message: 'Locker created successfully', data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to create locker' };
    }
};

export const bulkCreateLockers = async (data) => {
    try {
        const response = await apiClient.post('/staff/lockers/bulk', data);
        return { success: true, message: 'Lockers created successfully', data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to bulk create lockers' };
    }
};
