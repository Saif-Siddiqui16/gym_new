import apiClient from '../apiClient';

export const fetchBranches = async (search = '', status = 'All') => {
    try {
        const response = await apiClient.get('/superadmin/gyms', {
            params: { search, status }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createBranch = async (branchData) => {
    try {
        const response = await apiClient.post('/superadmin/gyms', branchData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateBranch = async (id, branchData) => {
    try {
        const response = await apiClient.patch(`/superadmin/gyms/${id}`, branchData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteBranch = async (id) => {
    try {
        const response = await apiClient.delete(`/superadmin/gyms/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const toggleBranchStatus = async (id) => {
    try {
        const response = await apiClient.patch(`/superadmin/gyms/${id}/toggle-status`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
