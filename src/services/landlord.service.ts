
import api from './api';

export const landlordService = {
  // Properties
  async getProperties() {
    const response = await api.get('/landlord/properties');
    return response.data;
  },

  async addProperty(propertyData: unknown) {
    const response = await api.post('/landlord/properties', propertyData);
    return response.data;
  },

  // Managers
  async getManagers() {
    const response = await api.get('/landlord/managers');
    return response.data;
  },

  async assignManager(propertyId: string, managerId: string) {
    const response = await api.post('/landlord/assign-manager', { propertyId, managerId });
    return response.data;
  },

  // Payments
  async getPayments() {
    const response = await api.get('/landlord/payments');
    return response.data;
  },

  // Expenses
  async getExpenses() {
    const response = await api.get('/landlord/expenses');
    return response.data;
  },

  async approveExpense(expenseId: string) {
    const response = await api.put(`/landlord/expenses/${expenseId}/approve`);
    return response.data;
  }
};