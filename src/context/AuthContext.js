import React, { createContext, useState, useEffect, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
  });

  useEffect(() => {
    console.log('AuthContext: Iniciando observador de Firebase...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Estado de Firebase cambiado. Usuario:', user ? 'Logueado' : 'No logueado');
      let userToken = null;
      try {
        if (user) {
          userToken = await user.getIdToken();
          await SecureStore.setItemAsync('userToken', userToken);
          console.log('AuthContext: Token guardado correctamente.');
        } else {
          await SecureStore.deleteItemAsync('userToken');
          console.log('AuthContext: Token eliminado (sin sesión).');
        }
      } catch (e) {
        console.error('AuthContext: Error en el proceso de token:', e);
      }
      setState(s => ({ ...s, user, userToken, isLoading: false }));
    });

    return unsubscribe;
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async (token) => {
        // El token viene de Google o Firebase Login
        await SecureStore.setItemAsync('userToken', token);
        setState(s => ({ ...s, userToken: token, isSignout: false }));
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
