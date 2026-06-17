import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Configuración real extraída del .env para asegurar estabilidad en Android
const firebaseConfig = {
  apiKey: "AIzaSyCfOUAe3V41Jc9NnqucgAF969HGT6ck0-E",
  authDomain: "boutique-estefany.firebaseapp.com",
  projectId: "boutique-estefany",
  storageBucket: "boutique-estefany.firebasestorage.app",
  messagingSenderId: "849272336378",
  appId: "1:849272336378:web:b480a2f8d6e7cb2e943e43"
};

let auth;
try {
  const app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  console.error('FirebaseConfig: Error crítico en inicialización:', error);
}

export { auth };
