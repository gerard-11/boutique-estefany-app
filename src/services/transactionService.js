import api from './api';

export const getProductByBarcode = async (barcode) => {
  const response = await api.get(`/products/barcode/${barcode}`);
  return response.data;
};

export const createTransaction = async (transactionData) => {
  // transactionData: { userId, type, productBarcodes, discountPercentage, forceApproval }
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

export const adjustInventory = async (productId, adjustmentData) => {
  // adjustmentData: { quantity, type, reason, newCost, newPrice }
  const response = await api.patch(`/products/${productId}/adjustment`, adjustmentData);
  return response.data;
};

export const searchClients = async (query) => {
  const response = await api.get(`/users/search?q=${query}&role=CLIENT`);
  return response.data;
};
