import apiClient from '../apiClient';

export const getTenantSettings = async () => {
    try {
        const response = await apiClient.get('/admin/settings/tenant');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTenantSettings = async (settingsData) => {
    try {
        const isFormData = settingsData instanceof FormData;
        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await apiClient.patch('/admin/settings/tenant', settingsData, config);
        return response.data;
    } catch (error) {
        throw error;
    }
};
