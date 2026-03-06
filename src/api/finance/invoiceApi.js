// src/api/finance/invoiceApi.js
import { INVOICES } from '../../modules/finance/data/mockFinance';

// Local mock storage for invoices
let localInvoices = [...INVOICES];

export const getInvoices = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...localInvoices];
};

/**
 * Creates a new invoice in the system.
 * @param {Object} invoiceData { member, amount, dueDate, type }
 */
export const createInvoice = async (invoiceData) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newInvoice = {
        id: `INV-${new Date().getFullYear()}-${String(localInvoices.length + 1).padStart(3, '0')}`,
        member: invoiceData.member,
        amount: invoiceData.amount,
        dueDate: invoiceData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Default 7 days from now
        status: 'Unpaid',
        type: invoiceData.type || 'Miscellaneous'
    };

    localInvoices.unshift(newInvoice);
    console.log('API: Invoice created:', newInvoice);
    return { success: true, message: 'Invoice generated successfully', data: newInvoice };
};
