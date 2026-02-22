import apiClient from '../apiClient';

export const getMyTasks = async (filters = {}) => {
    try {
        const response = await apiClient.get('/staff/tasks', { params: { ...filters, myTasks: true } });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch my tasks';
    }
};

export const getAllTasks = async (filters = {}) => {
    try {
        const response = await apiClient.get('/staff/tasks', { params: filters });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch all tasks';
    }
};

export const updateTaskStatus = async (taskId, newStatus) => {
    try {
        const response = await apiClient.patch(`/staff/tasks/${taskId}/status`, { status: newStatus });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update task status';
    }
};
