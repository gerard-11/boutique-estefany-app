import api from './api';

/**
 * Registra un pago de cliente.
 * @param {Object} data - Payload esperado por el backend para POST /payments.
 */
export const createPayment = async (data) => {
  const response = await api.post('/payments', data);
  return response.data;
};
