import apiClient from '../apiClient';

export const getClasses = async (params) => {
    const response = await apiClient.get('/admin/classes', { params });
    return response.data;
};

export const getClassById = async (id) => {
    const response = await apiClient.get(`/admin/classes/${id}`);
    return response.data;
};

export const createClass = async (classData) => {
    const response = await apiClient.post('/admin/classes', classData);
    return response.data;
};

export const updateClass = async (id, classData) => {
    const response = await apiClient.patch(`/admin/classes/${id}`, classData);
    return response.data;
};

export const deleteClass = async (id) => {
    const response = await apiClient.delete(`/admin/classes/${id}`);
    return response.data;
};
