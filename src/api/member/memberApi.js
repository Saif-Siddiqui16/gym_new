import apiClient from '../apiClient';

export const fetchMemberProfile = async () => {
    try {
        const response = await apiClient.get('/auth/me');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch profile';
    }
};

export const updateMemberProfile = async (updated) => {
    try {
        const response = await apiClient.patch('/auth/profile', updated);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update profile';
    }
};

export const upgradePlan = async (newPlan) => {
    try {
        const response = await apiClient.post('/member/plan/upgrade', { newPlan });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to upgrade plan';
    }
};

export const cancelMembership = async () => {
    try {
        const response = await apiClient.post('/member/plan/cancel');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to cancel membership';
    }
};

export const fetchWalletTransactions = async () => {
    try {
        // Assume wallet endpoint or mock fallback internally handled by backend
        const response = await apiClient.get('/member/wallet/transactions');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch wallet transactions';
    }
};

export const addWalletCredit = async (amount) => {
    try {
        const response = await apiClient.post('/member/wallet/add', { amount });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to add credit';
    }
};

export const fetchMemberBookings = async () => {
    try {
        const response = await apiClient.get('/member/bookings');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch bookings';
    }
};

export const cancelBooking = async (id) => {
    try {
        const response = await apiClient.delete(`/member/bookings/${id}`);
        return { success: true, id };
    } catch (error) {
        throw error.response?.data?.message || 'Failed to cancel booking';
    }
};

export const rescheduleBooking = async (id) => {
    try {
        const response = await apiClient.patch(`/member/bookings/${id}/reschedule`);
        return { success: true };
    } catch (error) {
        throw error.response?.data?.message || 'Failed to reschedule booking';
    }
};

export const createBooking = async (details) => {
    try {
        const response = await apiClient.post('/member/bookings', details);
        return { success: true, data: response.data };
    } catch (error) {
        throw error.response?.data?.message || 'Failed to create booking';
    }
};

export const freezeMembership = async () => {
    try {
        const response = await apiClient.post('/member/membership/freeze');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to freeze membership';
    }
};

export const unfreezeMembership = async () => {
    try {
        const response = await apiClient.post('/member/membership/unfreeze');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to unfreeze membership';
    }
};

export const getInvoices = async () => {
    try {
        const response = await apiClient.get('/member/invoices');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch invoices';
    }
};

export const payInvoice = async (id) => {
    try {
        const response = await apiClient.post(`/member/invoices/${id}/pay`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to pay invoice';
    }
};

export const getWalletBalance = async () => {
    try {
        const response = await apiClient.get('/member/wallet/balance');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch wallet balance';
    }
};

export const getSavedCards = async () => {
    try {
        const response = await apiClient.get('/member/cards');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch saved cards';
    }
};

export const addSavedCard = async (cardData) => {
    try {
        const response = await apiClient.post('/member/cards', cardData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to add card';
    }
};

export const deleteSavedCard = async (id) => {
    try {
        const response = await apiClient.delete(`/member/cards/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to delete card';
    }
};

export const getMembershipDetails = async () => {
    try {
        const response = await apiClient.get('/member/membership-details');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch membership details';
    }
};

export const getServiceRequests = async () => {
    try {
        const response = await apiClient.get('/member/service-requests');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch service requests';
    }
};

export const addServiceRequest = async (requestData) => {
    try {
        const response = await apiClient.post('/member/service-requests', requestData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to create service request';
    }
};

export const fetchAvailableClasses = async () => {
    try {
        const response = await apiClient.get('/member/classes');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch classes';
    }
};

export const getMemberQrProfile = async () => {
    try {
        const response = await apiClient.get('/member/profile');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch member exact profile';
    }
};
export const fetchMemberWorkoutPlans = async () => {
    try {
        const response = await apiClient.get('/member/workout-plans');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch workout plans';
    }
};

export const fetchMemberDietPlans = async () => {
    try {
        const response = await apiClient.get('/member/diet-plans');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch diet plans';
    }
};

export const getRewardCatalog = async () => {
    try {
        const response = await apiClient.get('/member/rewards/catalog');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch reward catalog';
    }
};

export const redeemReward = async (catalogId) => {
    try {
        const response = await apiClient.post('/member/rewards/redeem', { catalogId });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to redeem reward';
    }
};
