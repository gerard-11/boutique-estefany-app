import api from './api';

export const transactionService = {
  /**
   * Crea una nueva transacción (Venta, Préstamo, Apartado)
   * @param {Object} data - { userId, type, productBarcodes: [] }
   */
  createTransaction: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  /**
   * Registra una devolución rápida por código de barras
   * @param {string} barcode 
   */
  returnProduct: async (barcode) => {
    const response = await api.post(`/transactions/barcode/${barcode}/return`);
    return response.data;
  }
};
