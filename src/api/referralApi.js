import apiClient from './apiClient';

export const referralApi = {
    getAllReferrals: async (params) => {
        const response = await apiClient.get('/referrals', { params });
        return response.data;
    },
    createReferral: async (data) => {
        const response = await apiClient.post('/referrals', data);
        return response.data;
    },
    verifyCode: async (code, branchId = null) => {
        const params = {};
        if (branchId && branchId !== 'all') {
            params.branchId = branchId;
        }
        const response = await apiClient.get(`/referrals/verify/${code}`, { params });
        return response.data;
    }
};
