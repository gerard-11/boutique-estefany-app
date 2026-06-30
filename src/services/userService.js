import api from './api';

/**
 * findAllClients
 */
export const getClients = async (searchTerm='',level='') => {
  const response = await api.get('/users/clients',{
    params: {
      search: searchTerm,
      level: level
    }
  });
  return response.data;
};

  // Ver perfil financiero detallado (Admin y el propio Cliente) endpoint para que el cliente pueda ver sus datos
export const getEnrichedProfile = async (id) => {
  const response = await api.get(`/users/clients/${id}/profile`)
  return response.data;
};

export const getClientPaymentHistory = async (id) => {
  const response = await api.get(`/users/clients/${id}/payment-history`);
  return response.data;
};

//se envia en data level, creditLimit y reason los 3 son opcionales
export const updateFinancial = async (userId, data) => {
  const response = await api.patch(`users/clients/${userId}/financial`, data);
  return response.data;
};
