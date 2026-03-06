import apiClient from '../apiClient';

const api = apiClient;

// --- DASHBOARD & GENERAL ---

const fetchDashboardCards = async () => {
    try {
        const response = await api.get('/superadmin/dashboard-cards');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch dashboard stats';
    }
};

const getDashboardStats = fetchDashboardCards;

const getRecentGyms = async () => {
    try {
        const response = await api.get('/superadmin/gyms');
        const data = response.data.gyms || response.data;
        return data.slice(0, 5);
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch recent gyms';
    }
};

const getSystemAlerts = async () => {
    try {
        const response = await api.get('/superadmin/gyms');
        const data = response.data.gyms || response.data;
        const pendingGyms = data.filter(g => g.status === 'Pending').length;

        const alerts = [];
        if (pendingGyms > 0) {
            alerts.push({
                id: 'pending-gyms',
                title: 'Pending Approvals',
                message: `${pendingGyms} New Gyms waiting for review`,
                type: 'warning',
                time: 'Recently'
            });
        }
        return alerts;
    } catch (error) {
        return [];
    }
};

// --- GYM MANAGEMENT ---

const fetchAllGyms = async (params = {}) => {
    try {
        const response = await api.get('/superadmin/gyms', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch gyms';
    }
};

const addGym = async (gymData) => {
    try {
        const response = await api.post('/superadmin/gyms', gymData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to add gym';
    }
};

const deleteGym = async (id) => {
    try {
        const response = await api.delete(`/superadmin/gyms/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to delete gym';
    }
};

const toggleGymStatus = async (id) => {
    try {
        const response = await api.patch(`/superadmin/gyms/${id}/toggle-status`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to toggle gym status';
    }
};

const exportTable = async (tableName) => {
    try {
        let endpoint = '/superadmin/gyms';
        if (tableName.toLowerCase().includes('plan')) endpoint = '/superadmin/plans';
        if (tableName.toLowerCase().includes('subscription')) endpoint = '/superadmin/subscriptions';
        if (tableName.toLowerCase().includes('payment')) endpoint = '/superadmin/payments';
        if (tableName.toLowerCase().includes('log')) {
            if (tableName.toLowerCase().includes('activity')) endpoint = '/superadmin/logs/activity';
            else if (tableName.toLowerCase().includes('error')) endpoint = '/superadmin/logs/error';
            else endpoint = '/superadmin/audit-logs';
        }

        const response = await api.get(endpoint);
        const data = response.data.gyms || response.data;

        if (!Array.isArray(data) || data.length === 0) {
            console.warn('No data available for export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                const val = row[h];
                return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${tableName}_Export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Export failed:', error);
    }
};

const generatePDF = async (reportName) => {
    try {
        console.log(`Generating PDF for ${reportName}...`);
    } catch (error) {
        console.error('PDF generation failed:', error);
    }
};

// --- PLAN MANAGEMENT ---

const fetchPlans = async () => {
    try {
        const response = await api.get('/superadmin/plans');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch plans';
    }
};

const addPlan = async (planData) => {
    try {
        const response = await api.post('/superadmin/plans', planData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to add plan';
    }
};

const editPlan = async (id, planData) => {
    try {
        const response = await api.patch(`/superadmin/plans/${id}`, planData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update plan';
    }
};

const deletePlan = async (id) => {
    try {
        const response = await api.delete(`/superadmin/plans/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to delete plan';
    }
};

const updatePlanFeatures = async (id, features) => {
    try {
        const response = await api.patch(`/superadmin/plans/${id}`, { features });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update plan features';
    }
};

const togglePlanFeature = async (id, featureId) => {
    try {
        const response = await api.patch(`/superadmin/plans/${id}/toggle-feature`, { featureId });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to toggle feature';
    }
};

// --- SUBSCRIPTION MANAGEMENT ---

const fetchSubscriptions = async () => {
    try {
        const response = await api.get('/superadmin/subscriptions');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch subscriptions';
    }
};

const toggleSubscriptionStatus = async (id) => {
    try {
        const response = await api.patch(`/superadmin/subscriptions/${id}/toggle-status`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to toggle subscription status';
    }
};

// --- PAYMENTS & REVENUE ---

const fetchPaymentsStats = async () => {
    try {
        const response = await api.get('/superadmin/payments/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch payment stats';
    }
};

const fetchRevenueData = async () => {
    try {
        const response = await api.get('/superadmin/payments/revenue-chart');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch revenue data';
    }
};

const fetchPayments = async () => {
    try {
        const response = await api.get('/superadmin/payments');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch payments';
    }
};

const updatePaymentStatus = async (id, status) => {
    try {
        const response = await api.patch(`/superadmin/payments/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update payment status';
    }
};

const fetchInvoices = async () => {
    try {
        const response = await api.get('/superadmin/invoices');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch invoices';
    }
};

const fetchGSTReports = async () => {
    try {
        const response = await api.get('/superadmin/reports/gst');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch GST reports';
    }
};

// --- LOGS & AUDIT ---

const fetchWebhookLogs = async () => {
    try {
        const response = await api.get('/superadmin/webhook-logs');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch webhook logs';
    }
};

const fetchAuditLogs = async () => {
    try {
        const response = await api.get('/superadmin/audit-logs');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch audit logs';
    }
};

const fetchActivityLogs = async () => {
    try {
        const response = await api.get('/superadmin/logs/activity');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch activity logs';
    }
};

const fetchErrorLogs = async () => {
    try {
        const response = await api.get('/superadmin/logs/error');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch error logs';
    }
};

const fetchHardwareLogs = async () => {
    try {
        const response = await api.get('/superadmin/logs/hardware');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch hardware logs';
    }
};

// --- SETTINGS MANAGEMENT ---

const fetchGlobalSettings = async () => {
    try {
        const response = await api.get('/superadmin/settings/global');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch global settings';
    }
};

const updateGlobalSettings = async (settings) => {
    try {
        const response = await api.patch('/superadmin/settings/global', settings);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update global settings';
    }
};

const fetchInvoiceSettings = async () => {
    try {
        const response = await api.get('/superadmin/settings/invoice');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch invoice settings';
    }
};

const updateInvoiceSettings = async (settings) => {
    try {
        const response = await api.patch('/superadmin/settings/invoice', settings);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update invoice settings';
    }
};

const fetchBookingSettings = async () => {
    try {
        const response = await api.get('/superadmin/settings/booking');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch booking settings';
    }
};

const updateBookingSettings = async (settings) => {
    try {
        const response = await api.patch('/superadmin/settings/booking', settings);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update booking settings';
    }
};

// --- STAFF & MANAGEMENT ---

const fetchStaffMembers = async () => {
    try {
        const response = await api.get('/superadmin/staff');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch staff members';
    }
};

const addStaff = async (staffData) => {
    try {
        const response = await api.post('/superadmin/staff', staffData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to add staff';
    }
};

const addStaffMember = addStaff;

const deleteStaffMember = async (id) => {
    try {
        const response = await api.delete(`/superadmin/staff/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to delete staff member';
    }
};

const editStaff = async (id, staffData) => {
    try {
        const response = await api.patch(`/superadmin/staff/${id}`, staffData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update staff member';
    }
};

// --- WALLET & REQUESTS ---

const fetchWalletStats = async () => {
    try {
        const response = await api.get('/superadmin/wallet/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch wallet stats';
    }
};

const fetchMemberWallets = async () => {
    try {
        const response = await api.get('/superadmin/wallet/members');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch member wallets';
    }
};

const updateMemberWallet = async (memberId, transactionData) => {
    try {
        const response = await api.post(`/superadmin/wallet/members/${memberId}/transaction`, transactionData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update wallet';
    }
};

const fetchTrainerRequests = async () => {
    try {
        const response = await api.get('/superadmin/requests/trainers');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch trainer requests';
    }
};

const fetchTrainerChangeRequests = async () => {
    try {
        const response = await api.get('/superadmin/requests/trainer-changes');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch trainer change requests';
    }
};

const updateTrainerRequest = async (id, status) => {
    try {
        const response = await api.patch(`/superadmin/requests/trainers/${id}`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update trainer request';
    }
};

// --- PROFILE MANAGEMENT ---

const fetchAdminProfile = async () => {
    try {
        const response = await api.get('/superadmin/profile');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch admin profile';
    }
};

const updateAdminProfile = async (profileData) => {
    try {
        const response = await api.patch('/superadmin/profile', profileData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update admin profile';
    }
};

const fetchDevices = async () => {
    try {
        const response = await api.get('/superadmin/devices');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch devices';
    }
};

const addDevice = async (deviceData) => {
    try {
        const response = await api.post('/superadmin/devices', deviceData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to add device';
    }
};

const updateDevice = async (id, deviceData) => {
    try {
        const response = await api.patch(`/superadmin/devices/${id}`, deviceData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update device';
    }
};

const deleteDevice = async (id) => {
    try {
        const response = await api.delete(`/superadmin/devices/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to delete device';
    }
};


// --- EXPORTS ---

export {
    fetchDashboardCards,
    getDashboardStats,
    getRecentGyms,
    getSystemAlerts,
    fetchAllGyms,
    addGym,
    deleteGym,
    toggleGymStatus,
    exportTable,
    generatePDF,
    fetchPlans,
    addPlan,
    editPlan,
    deletePlan,
    updatePlanFeatures,
    togglePlanFeature,
    fetchSubscriptions,
    toggleSubscriptionStatus,
    fetchPaymentsStats,
    fetchRevenueData,
    fetchPayments,
    updatePaymentStatus,
    fetchInvoices,
    fetchGSTReports,
    fetchWebhookLogs,
    fetchAuditLogs,
    fetchActivityLogs,
    fetchErrorLogs,
    fetchHardwareLogs,
    fetchGlobalSettings,
    updateGlobalSettings,
    fetchInvoiceSettings,
    updateInvoiceSettings,
    fetchBookingSettings,
    updateBookingSettings,
    fetchStaffMembers,
    fetchStaffMembers as fetchStaff,
    addStaff,
    addStaffMember,
    editStaff,
    editStaff as updateStaff,
    deleteStaffMember,
    deleteStaffMember as deleteStaff,
    fetchWalletStats,
    fetchMemberWallets,
    updateMemberWallet,
    fetchTrainerRequests,
    fetchTrainerChangeRequests,
    updateTrainerRequest,
    fetchAdminProfile,
    updateAdminProfile,
    fetchDevices,
    addDevice,
    updateDevice,
    deleteDevice
};


