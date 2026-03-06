import apiClient from '../apiClient';

const api = apiClient;

export const fetchDashboardStats = async (branchId) => {
    try {
        const id = branchId === 'all' ? '' : branchId;
        const url = id ? `/branch-admin/dashboard/stats?branchId=${id}` : '/branch-admin/dashboard/stats';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch dashboard stats';
    }
};

export const fetchRecentActivities = async (branchId) => {
    try {
        const id = branchId === 'all' ? '' : branchId;
        const url = id ? `/branch-admin/dashboard/activities?branchId=${id}` : '/branch-admin/dashboard/activities';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch recent activities';
    }
};

export const fetchTrainerAvailability = async (branchId) => {
    try {
        const id = branchId === 'all' ? '' : branchId;
        const url = id ? `/branch-admin/dashboard/trainers?branchId=${id}` : '/branch-admin/dashboard/trainers';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch trainer availability';
    }
};

export const fetchFinancialStats = async (branchId) => {
    try {
        const id = branchId === 'all' ? '' : branchId;
        const url = id ? `/branch-admin/dashboard/financials?branchId=${id}` : '/branch-admin/dashboard/financials';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch financial stats';
    }
};

export const fetchLiveAccess = async (branchId) => {
    try {
        const id = branchId === 'all' ? '' : branchId;
        const url = id ? `/branch-admin/dashboard/live-access?branchId=${id}` : '/branch-admin/dashboard/live-access';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch live access data';
    }
};

export const fetchRenewalAlerts = async (branchId) => {
    try {
        const id = branchId === 'all' ? '' : branchId;
        const url = id ? `/branch-admin/dashboard/renewal-alerts?branchId=${id}` : '/branch-admin/dashboard/renewal-alerts';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch renewal alerts';
    }
};

