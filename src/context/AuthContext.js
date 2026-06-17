import React, { createContext, useState, useEffect, useMemo, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../services/api';

export const AuthContext = createContext();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

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
          authError: null,
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

          const response = await api.get('/auth/me');
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
        authError = null;
        await SecureStore.deleteItemAsync('userToken');
        await auth.signOut().catch(() => {});
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
        const token = await firebaseUser.getIdToken();
        await SecureStore.setItemAsync('userToken', token);
        setState(s => ({ ...s, userToken: token, user: firebaseUser, authError: null, isSignout: false }));
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

