import api from './api';

export const financeService = {
  // Wallet
  getWallet: async (userId = '') => {
    const url = userId ? `/finance/wallet/${userId}` : '/finance/wallet';
    const response = await api.get(url);
    return response.data;
  },

  creditUser: (data) => api.post('/finance/wallet/credit', data),
    
  // Transactions
  // Transactions
  getTransactions: async () => {
    const response = await api.get('/finance/transactions');
    return response.data;
  },

  // Vouchers
  getVouchers: async () => {
    const response = await api.get('/finance/vouchers');
    return response.data;
  },

  generateVouchers: async (data) => {
    // data: { amount, count, expirationDate }
    const response = await api.post('/finance/vouchers/generate', data);
    return response.data;
  },

  // Requests
  getRequests: async () => {
    const response = await api.get('/finance/requests');
    return response.data;
  },

  approveRequest: async (requestId) => {
    const response = await api.post(`/finance/requests/${requestId}/approve`);
    return response.data;
  },

  rejectRequest: async (requestId) => {
    const response = await api.post(`/finance/requests/${requestId}/reject`);
    return response.data;
  }
};
