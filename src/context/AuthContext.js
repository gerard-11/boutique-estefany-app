import React, { createContext, useState, useEffect, useMemo, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../services/api';

export const AuthContext = createContext();

const GOOGLE_CLIENT_IDS = {
  web: '849272336378-oj2d2pne63jc3tnlhplbbaftf2hutlqo.apps.googleusercontent.com',
  android: '849272336378-c7pb0j4o4ebj6bmknqee7tkgtkrcbvmg.apps.googleusercontent.com',
  ios: '849272336378-tuib75770io9ve58suvgp1uqnu4t178o.apps.googleusercontent.com',
};

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || GOOGLE_CLIENT_IDS.web;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || GOOGLE_CLIENT_IDS.android;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || GOOGLE_CLIENT_IDS.ios;

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: 'Bearer ' + token,
  },
});

const getProfileSyncErrorMessage = (error) => {
  if (error?.response?.status === 401) {
    return "Firebase inició sesión, pero el backend rechazó el token.";
  }

  if (error?.response?.status === 403) {
    return "Tu usuario existe, pero no tiene permisos para entrar.";
  }

  if (error?.response?.data?.message) {
    return Array.isArray(error.response.data.message)
      ? error.response.data.message.join("\n")
      : error.response.data.message;
  }

  if (error?.code === "ECONNABORTED") {
    return "El backend tardó demasiado en responder. Intenta de nuevo.";
  }

  if (error?.message === "Network Error") {
    return "No se pudo conectar con el backend. Revisa internet o la URL de API.";
  }

  return error?.message || "No se pudo validar tu perfil con el backend.";
};

export const AuthProvider = ({ children }) => {
  const profileSyncInFlightRef = useRef(false);
  const clearingPersistedSessionRef = useRef(false);

  const [state, setState] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null, 
    profile: null,
    authError: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (clearingPersistedSessionRef.current) {
        await SecureStore.deleteItemAsync('userToken');
        setState(s => ({
          ...s,
          user: null,
          userToken: null,
          profile: null,
          authError: s.authError,
          isLoading: false,
        }));
        return;
      }

      if (profileSyncInFlightRef.current) return;

      profileSyncInFlightRef.current = true;
      let userToken = null;
      let profile = null;
      let authError = null;
      let currentUser = user;

      try {
        if (user) {
          userToken = await user.getIdToken();
          await SecureStore.setItemAsync('userToken', userToken);

          const response = await api.get('/auth/me', getAuthHeaders(userToken));
          profile = response.data;
        } else {
          await SecureStore.deleteItemAsync('userToken');
        }
      } catch (e) {
        console.warn('Clearing persisted Firebase session; backend profile sync failed:', e?.response?.data || e.message);
        clearingPersistedSessionRef.current = true;
        currentUser = null;
        userToken = null;
        profile = null;
        authError = getProfileSyncErrorMessage(e);
        await SecureStore.deleteItemAsync('userToken');
        await auth.signOut().catch(() => {});
        clearingPersistedSessionRef.current = false;
      } finally {
        profileSyncInFlightRef.current = false;
      }
      
      setState(s => ({ 
        ...s, 
        user: currentUser, 
        userToken, 
        profile,
        authError,
        isLoading: false 
      }));
    });

    return unsubscribe;
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async (firebaseUser) => {
        profileSyncInFlightRef.current = true;
        try {
          const token = await firebaseUser.getIdToken(true);
          await SecureStore.setItemAsync('userToken', token);
          const response = await api.get('/auth/me', getAuthHeaders(token));

          setState(s => ({
            ...s,
            userToken: token,
            user: firebaseUser,
            profile: response.data,
            authError: null,
            isSignout: false,
            isLoading: false,
          }));
        } catch (e) {
          console.warn('Login profile sync failed:', e?.response?.data || e.message);
          const authError = getProfileSyncErrorMessage(e);
          await SecureStore.deleteItemAsync('userToken');
          await auth.signOut().catch(() => {});
          setState(s => ({
            ...s,
            userToken: null,
            user: null,
            profile: null,
            authError,
            isSignout: true,
            isLoading: false,
          }));
          throw new Error(authError);
        } finally {
          profileSyncInFlightRef.current = false;
        }
      },
      signOut: async () => {
        try {
          await auth.signOut();
          await SecureStore.deleteItemAsync('userToken');
          setState(s => ({ ...s, userToken: null, isSignout: true, user: null, profile: null, authError: null }));
        } catch (e) {
    
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

