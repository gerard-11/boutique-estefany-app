import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { auth } from './firebaseConfig';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://boutique-estefany-backend.onrender.com';

console.log('API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      if (config.skipAuth) return config;
      
      let token = await SecureStore.getItemAsync('userToken');

      if (!token && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
        await SecureStore.setItemAsync('userToken', token);
      }

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
