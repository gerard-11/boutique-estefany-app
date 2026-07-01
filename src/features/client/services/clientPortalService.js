import api from '../../../services/api';

export const getMyProfile = async () => {
  const response = await api.get('/users/me/profile');
  return response.data;
};

export const getMyPaymentHistory = async () => {
  const response = await api.get('/users/me/payment-history');
  return response.data;
};

export const completeMyProfile = async (data) => {
  const response = await api.patch('/auth/complete-profile', data);
  return response.data;
};

export const acceptTransaction = async (transactionId) => {
  const response = await api.patch(`/transactions/${transactionId}/accept`);
  return response.data;
};

export const rejectTransaction = async (transactionId) => {
  const response = await api.patch(`/transactions/${transactionId}/reject`);
  return response.data;
};

export const requestTransactionReturn = async (transactionId) => {
  const response = await api.patch(`/transactions/${transactionId}/request-return`);
  return response.data;
};
