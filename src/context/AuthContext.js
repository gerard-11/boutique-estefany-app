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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let userToken = null;
      let profile = null;

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

