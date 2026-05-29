import React, { createContext, useState, useEffect, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../services/api';
import { getPublicUser } from '../services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null, 
    profile: null, 
    publicUser: null, // Guardaremos aquí al "Público General"
  });

  useEffect(() => {
    console.log('AuthContext: Iniciando observador de Firebase...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Estado de Firebase cambiado. Usuario:', user ? 'Logueado' : 'No logueado');
      let userToken = null;
      let profile = null;
      let publicUser = null;

      try {
        if (user) {
          userToken = await user.getIdToken();
          await SecureStore.setItemAsync('userToken', userToken);
          
          // HACK TEMPORAL PARA PREVISUALIZACIÓN:
          // Comentamos la llamada real y forzamos el perfil
          /*
          const response = await api.get('/auth/me');
          profile = response.data;
          */
          profile = {
            id: 'dev-admin-id',
            email: user.email,
            role: 'ADMIN',
            name: 'Administrador Dev'
          };

          // Simulamos también al público general para que no falle el estado
          publicUser = { id: 'public-gen-uuid', name: 'Público General' };
          
          console.log('AuthContext: MODO PREVISUALIZACIÓN ADMIN ACTIVADO');
        } else {
          await SecureStore.deleteItemAsync('userToken');
        }
      } catch (e) {
        console.error('AuthContext: Error en hidratación o búsqueda de Público:', e);
      }
      
      setState(s => ({ 
        ...s, 
        user, 
        userToken, 
        profile, 
        publicUser,
        isLoading: false 
      }));
    });

    return unsubscribe;
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async (token) => {
        // El token viene de Google o Firebase Login
        await SecureStore.setItemAsync('userToken', token);
        // HACK: También inyectamos el perfil de admin aquí para la previsualización
        const dummyProfile = {
          id: 'dev-admin-id',
          role: 'ADMIN',
          name: 'Administrador Dev'
        };
        setState(s => ({ ...s, userToken: token, profile: dummyProfile, isSignout: false }));
      },
      signOut: async () => {
        await auth.signOut();
        await SecureStore.deleteItemAsync('userToken');
        setState(s => ({ ...s, userToken: null, isSignout: true, user: null }));
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={{ ...authContext, ...state }}>
      {children}
    </AuthContext.Provider>
  );
};
