import apiClient from '../apiClient';

export const fetchFinanceStats = async (branchId) => {
    try {
        const id = branchId === 'all' ? '' : branchId;
        const response = await apiClient.get('/finance/stats', { params: { branchId: id } });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchExpenses = async (branchId) => {
    try {
        const id = branchId === 'all' ? '' : branchId;
        const response = await apiClient.get('/finance/expenses', { params: { branchId: id } });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addExpense = async (expenseData) => {
    try {
        const response = await apiClient.post('/finance/expenses', expenseData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchInvoices = async (params) => {
    try {
        const response = await apiClient.get('/finance/invoices', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addInvoice = async (invoiceData) => {
    try {
        const response = await apiClient.post('/finance/invoices', invoiceData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const fetchInvoiceById = async (id) => {
    try {
        const response = await apiClient.get(`/finance/invoices/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const deleteInvoice = async (id) => {
    try {
        const response = await apiClient.delete(`/finance/invoices/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const settleInvoice = async (id, settlementData) => {
    try {
        const response = await apiClient.patch(`/finance/invoices/${id}/settle`, settlementData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const submitCashierPayment = async (paymentData) => {
    try {
        const response = await apiClient.post('/finance/cashier', paymentData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchTransactions = async (params) => {
    try {
        const response = await apiClient.get('/finance/transactions', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const deleteExpense = async (id) => {
    try {
        const response = await apiClient.delete(`/finance/expenses/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchExpenseCategories = async (branchId) => {
    try {
        const id = branchId === 'all' ? '' : branchId;
        const response = await apiClient.get('/finance/expense-categories', { params: { branchId: id } });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addExpenseCategory = async (categoryData) => {
    try {
        const response = await apiClient.post('/finance/expense-categories', categoryData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteExpenseCategory = async (id) => {
    try {
        const response = await apiClient.delete(`/finance/expense-categories/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
