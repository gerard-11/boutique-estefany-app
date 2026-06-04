import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://192.168.1.75:3000', // IP local real del host
  timeout: 10000,
});

// Interceptor para inyectar el token de Firebase automáticamente
api.interceptors.request.use(
  async (config) => {
    try {
      if (config.skipAuth) return config;
      
      // Recuperamos el token de la persistencia física
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('API Interceptor Error:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
