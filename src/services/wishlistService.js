import api from './api';

/**
 * Obtiene la lista de deseos de un cliente específico.
 * @param {string} clientId - ID del cliente.
 */
export const getClientWishlist = async (clientId) => {
  const response = await api.get(`/wishlist/client/${clientId}`);
  return response.data;
};

/**
 * Añade un producto a la lista de deseos (para uso futuro o por el admin).
 */
export const addToWishlist = async (clientId, productId) => {
  const response = await api.post(`/wishlist/client/${clientId}`, { productId });
  return response.data;
};
