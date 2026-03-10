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

// PDF toast notification helper
const showPdfToast = (message, type = 'success') => {
    const toastId = `pdf-toast-${Date.now()}`;
    const colors = {
        success: { bg: '#f0fdf4', border: '#86efac', icon: '#16a34a', text: '#15803d' },
        error: { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', text: '#dc2626' },
        loading: { bg: '#f5f3ff', border: '#c4b5fd', icon: '#7c3aed', text: '#6d28d9' }
    };
    const c = colors[type];
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 99999;
        background: ${c.bg}; border: 1.5px solid ${c.border};
        border-radius: 16px; padding: 14px 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
        display: flex; align-items: center; gap: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px; font-weight: 600; color: ${c.text};
        min-width: 260px; max-width: 360px;
        animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform-origin: top right;
    `;
    const iconMap = {
        success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c.icon}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c.icon}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        loading: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c.icon}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>`
    };
    toast.innerHTML = `${iconMap[type]}<span>${message}</span>`;
    if (!document.getElementById('pdf-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'pdf-toast-styles';
        style.textContent = `@keyframes slideIn{from{opacity:0;transform:translateX(100%) scale(0.8)}to{opacity:1;transform:translateX(0) scale(1)}} @keyframes spin{to{transform:rotate(360deg)}}`;
        document.head.appendChild(style);
    }
    document.body.appendChild(toast);
    return toastId;
};

const removePdfToast = (toastId) => {
    const el = document.getElementById(toastId);
    if (el) {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateX(100%) scale(0.8)';
        el.style.transition = 'all 0.3s ease';
        setTimeout(() => el?.remove(), 300);
    }
};

const exportTable = async (tableName, data = null) => {
    const loadingToastId = showPdfToast('Generating PDF, please wait...', 'loading');
    try {
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
        const autoTableModule = await import('jspdf-autotable');
        const autoTable = autoTableModule.default || autoTableModule.autoTable;

        let exportData = data;

        if (!exportData) {
            let endpoint = '/superadmin/gyms';
            if (tableName.toLowerCase().includes('plan')) endpoint = '/superadmin/plans';
            if (tableName.toLowerCase().includes('subscription')) endpoint = '/superadmin/subscriptions';
            if (tableName.toLowerCase().includes('payment')) endpoint = '/superadmin/payments';
            if (tableName.toLowerCase().includes('gst')) endpoint = '/superadmin/reports/gst';
            if (tableName.toLowerCase().includes('activity')) endpoint = '/superadmin/logs/activity';
            if (tableName.toLowerCase().includes('error')) endpoint = '/superadmin/logs/error';
            if (tableName.toLowerCase().includes('webhook')) endpoint = '/superadmin/webhook-logs';

            try {
                const response = await api.get(endpoint);
                exportData = response.data.gyms || response.data;
            } catch (e) {
                exportData = [];
            }
        }

        if (!Array.isArray(exportData)) exportData = [];

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // --- HEADER BAR ---
        doc.setFillColor(88, 28, 235);
        doc.rect(0, 0, pageWidth, 22, 'F');

        // Logo circle
        doc.setFillColor(255, 255, 255);
        doc.circle(18, 11, 8, 'F');
        doc.setTextColor(88, 28, 235);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('GA', 18, 12.5, { align: 'center' });

        // Report Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(tableName + ' Report', 32, 10);

        // Date
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Generated: ' + new Date().toLocaleString(), 32, 16);

        // Company name right
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Gym Administration', pageWidth - 15, 10, { align: 'right' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Confidential', pageWidth - 15, 16, { align: 'right' });

        // --- TABLE ---
        if (exportData.length > 0) {
            const headers = Object.keys(exportData[0]).filter(k =>
                !['id', 'createdAt', 'updatedAt', 'password', '__v'].includes(k)
            );
            const columns = headers.map(h => ({
                header: h.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
                dataKey: h
            }));

            const rows = exportData.map(item =>
                headers.reduce((acc, key) => {
                    let val = item[key];
                    if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                    if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
                    acc[key] = val ?? '-';
                    return acc;
                }, {})
            );

            autoTable(doc, {
                startY: 28,
                columns,
                body: rows,
                styles: {
                    fontSize: 7,
                    cellPadding: 3,
                    font: 'helvetica',
                    lineWidth: 0.1,
                    lineColor: [230, 225, 255]
                },
                headStyles: {
                    fillColor: [88, 28, 235],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center',
                    fontSize: 7.5
                },
                alternateRowStyles: {
                    fillColor: [245, 243, 255]
                },
                theme: 'striped',
                margin: { left: 10, right: 10 }
            });
        } else {
            doc.setFillColor(245, 243, 255);
            doc.rect(10, 28, pageWidth - 20, 20, 'F');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.text('No data available to export.', pageWidth / 2, 40, { align: 'center' });
        }

        // --- FOOTER ---
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFillColor(245, 243, 255);
            doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
            doc.setFontSize(7);
            doc.setTextColor(88, 28, 235);
            doc.setFont('helvetica', 'normal');
            doc.text('© Gym Administration System', 10, pageHeight - 4);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - 10, pageHeight - 4, { align: 'right' });
        }

        // --- SAVE ---
        const safeName = tableName.replace(/[^a-zA-Z0-9_]/g, '_');
        doc.save(`${safeName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        removePdfToast(loadingToastId);
        const successToastId = showPdfToast('PDF downloaded successfully!', 'success');
        setTimeout(() => removePdfToast(successToastId), 3000);

    } catch (error) {
        console.error('PDF Export failed:', error);
        removePdfToast(loadingToastId);
        const errorToastId = showPdfToast('Failed to generate PDF. Please try again.', 'error');
        setTimeout(() => removePdfToast(errorToastId), 5000);
    }
};

const generatePDF = (reportName, data) => exportTable(reportName, data);



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


