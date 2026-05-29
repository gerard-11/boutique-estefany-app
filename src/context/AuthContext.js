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
    // Suscribirse a cambios de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let userToken = null;
      if (user) {
        userToken = await user.getIdToken();
        await SecureStore.setItemAsync('userToken', userToken);
      } else {
        await SecureStore.deleteItemAsync('userToken');
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
