import apiClient from '../apiClient';

const api = apiClient;

export const fetchDashboardStats = async () => {
    try {
        const response = await api.get('/branch-admin/dashboard/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch dashboard stats';
    }
};

export const fetchRecentActivities = async () => {
    try {
        const response = await api.get('/branch-admin/dashboard/activities');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch recent activities';
    }
};

export const fetchTrainerAvailability = async () => {
    try {
        const response = await api.get('/branch-admin/dashboard/trainers');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch trainer availability';
    }
};

export const fetchFinancialStats = async () => {
    try {
        const response = await api.get('/branch-admin/dashboard/financials');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch financial stats';
    }
};

export const fetchLiveAccess = async () => {
    try {
        const response = await api.get('/branch-admin/dashboard/live-access');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch live access data';
    }
};

export const fetchRenewalAlerts = async () => {
    try {
        const response = await api.get('/branch-admin/dashboard/renewal-alerts');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch renewal alerts';
    }
};

