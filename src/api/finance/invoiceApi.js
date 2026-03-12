import apiClient from '../apiClient';

export const getInvoices = async () => {
    try {
        const response = await apiClient.get('/finance/invoices');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch invoices:', error);
        throw error;
    }
};

/**
 * Creates a new invoice in the system.
 * @param {Object} invoiceData { member, amount, dueDate, type }
 */
export const createInvoice = async (invoiceData) => {
    try {
        const response = await apiClient.post('/finance/invoices', invoiceData);
        return { success: true, message: 'Invoice generated successfully', data: response.data };
    } catch (error) {
        console.error('Failed to create invoice:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || 'Failed to generate invoice' 
        };
    }
};

export const getInvoiceById = async (id) => {
    try {
        const response = await apiClient.get(`/finance/invoices/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch invoice ${id}:`, error);
        throw error;
    }
};

export const deleteInvoice = async (id) => {
    try {
        const response = await apiClient.delete(`/finance/invoices/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete invoice ${id}:`, error);
        throw error;
    }
};

export const settleInvoice = async (id) => {
    try {
        const response = await apiClient.patch(`/finance/invoices/${id}/settle`);
        return response.data;
    } catch (error) {
        console.error(`Failed to settle invoice ${id}:`, error);
        throw error;
    }
};

