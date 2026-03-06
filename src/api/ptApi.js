import api from './apiClient';

export const ptApi = {
    getStats: (branchId) => api.get(`/pt/stats${branchId ? `?branchId=${branchId}` : ''}`),

    // Packages
    getPackages: (branchId) => api.get(`/pt/packages${branchId ? `?branchId=${branchId}` : ''}`),
    createPackage: (data) => api.post('/pt/packages', data),
    updatePackage: (id, data) => api.put(`/pt/packages/${id}`, data),
    deletePackage: (id) => api.delete(`/pt/packages/${id}`),

    // Accounts
    getAccounts: (branchId) => api.get(`/pt/accounts${branchId ? `?branchId=${branchId}` : ''}`),
    purchasePackage: (data) => api.post('/pt/purchase', data),

    // Sessions
    getSessions: (params) => api.get('/pt/sessions', { params }),
    logSession: (data) => api.post('/pt/sessions', data)
};
