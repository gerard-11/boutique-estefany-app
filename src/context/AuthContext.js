import React, { createContext, useState, useEffect, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../services/api';

export const AuthContext = createContext();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null, 
    profile: null, 
  });

  useEffect(() => {
    console.log('AuthContext: Iniciando observador de Firebase Real...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Estado de Firebase cambiado. Usuario:', user ? 'Logueado' : 'No logueado');
      let userToken = null;
      let profile = null;

      try {
        if (user) {
          userToken = await user.getIdToken();
          await SecureStore.setItemAsync('userToken', userToken);

          const response = await api.get('/auth/me');
          profile = response.data;
          
          console.log('AuthContext: Perfil cargado con éxito. Rol:', profile.role);
        } else {
          await SecureStore.deleteItemAsync('userToken');
        }
      } catch (e) {
        console.error('AuthContext: Error en hidratación real:', e?.response?.data || e.message);
      }
      
      setState(s => ({ 
        ...s, 
        user, 
        userToken, 
        profile, 
        isLoading: false 
      }));
    });

    return unsubscribe;
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async (firebaseUser) => {
        // Esta función se llamará después de que el hook de Google complete el login
        const token = await firebaseUser.getIdToken();
        await SecureStore.setItemAsync('userToken', token);
        setState(s => ({ ...s, userToken: token, user: firebaseUser, isSignout: false }));
      },
      signOut: async () => {
        try {
          await auth.signOut();
          await SecureStore.deleteItemAsync('userToken');
          setState(s => ({ ...s, userToken: null, isSignout: true, user: null, profile: null }));
        } catch (e) {
          console.error('Error al cerrar sesión:', e);
        }
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={{ 
      ...authContext, 
      ...state, 
      GOOGLE_WEB_CLIENT_ID,
      GOOGLE_ANDROID_CLIENT_ID,
      GOOGLE_IOS_CLIENT_ID,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

