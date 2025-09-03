
import api from './api';

export const managerService = {
  // Properties
  async getManagedProperties() {
    const response = await api.get('/manager/properties');
    return response.data;
  },

  // Payments
  async getPayments() {
    const response = await api.get('/manager/payments');
    return response.data;
  },
// change the any
  async uploadPayment(paymentData: unknown) {
    const response = await api.post('/manager/payments', paymentData);
    return response.data;
  },

  // Expenses
  async getExpenses() {
    const response = await api.get('/manager/expenses');
    return response.data;
  },

  async addExpense(expenseData: unknown) {
    const response = await api.post('/manager/expenses', expenseData);
    return response.data;
  },

  // Units
  async updatePropertyUnit(propertyId: string, unitNumber: string, updates: unknown) {
    const response = await api.put('/manager/units', { propertyId, unitNumber, updates });
    return response.data;
  }
};
