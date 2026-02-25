import apiClient from '../apiClient';

export const fetchExpenses = async () => {
    try {
        const response = await apiClient.get('/finance/expenses');
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

export const fetchInvoices = async () => {
    try {
        const response = await apiClient.get('/finance/invoices');
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

export const fetchTransactions = async () => {
    try {
        const response = await apiClient.get('/finance/transactions');
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
