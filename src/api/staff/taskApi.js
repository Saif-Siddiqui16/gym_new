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

export const createTask = async (taskData) => {
    try {
        const response = await apiClient.post('/staff/tasks', taskData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to create task';
    }
};

export const getBranchTeam = async () => {
    try {
        const response = await apiClient.get('/staff/team');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch team members';
    }
};

export const getTaskStats = async () => {
    try {
        const response = await apiClient.get('/staff/tasks/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch task stats';
    }
};

export const getMyBranch = async () => {
    try {
        const response = await apiClient.get('/staff/my-branch');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch branch info';
    }
};

// Update a task's status
export const updateTaskStatus = async (taskId, status) => {
    try {
        const response = await apiClient.patch(`/staff/tasks/${taskId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update task status';
    }
};
