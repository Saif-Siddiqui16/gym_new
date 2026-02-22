import apiClient from '../apiClient';

export const getLockers = async () => {
    try {
        const response = await apiClient.get('/staff/lockers');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch lockers';
    }
};

export const assignLocker = async (lockerId, memberId, memberName, isPaid = null) => {
    try {
        const response = await apiClient.post(`/staff/lockers/${lockerId}/assign`, {
            memberId,
            memberName,
            isPaid
        });
        return { success: true, message: 'Locker assigned successfully', data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to assign locker' };
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
