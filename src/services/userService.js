import api from './api';

export const getPublicUser = async () => {
  // Según las especificaciones: GET /users/clients?search=Publico
  const response = await api.get('/users/clients?search=Publico');
  // Asumimos que el backend devuelve un array y tomamos el primero
  return response.data.length > 0 ? response.data[0] : null;
};

export const searchClients = async (query) => {
  const response = await api.get(`/users/clients?search=${query}`);
  return response.data;
};
