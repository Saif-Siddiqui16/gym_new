import axios from 'axios';
import BaseUrl from '../BaseUrl/BaseUrl';

// Get token from localStorage
const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return {
        headers: {
            Authorization: `Bearer ${user.token}`
        }
    };
};

export const fetchExpenses = async () => {
    try {
        const response = await axios.get(`${BaseUrl}/finance/expenses`, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addExpense = async (expenseData) => {
    try {
        const response = await axios.post(`${BaseUrl}/finance/expenses`, expenseData, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw error;
    }
};
