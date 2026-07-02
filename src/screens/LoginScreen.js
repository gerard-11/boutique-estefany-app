import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView
} from 'react-native';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../services/firebaseConfig';
import { styles } from './LoginScreen.styles';

const getConfiguredClientId = (value) => {
  if (!value || value.startsWith('TU_')) return undefined;
  return value;
};

const getGoogleSignInModule = () => {
  try {
    return require('@react-native-google-signin/google-signin');
  } catch (error) {
    return null;
  }
};

const googleSignInModule = getGoogleSignInModule();
const GoogleSignin = googleSignInModule?.GoogleSignin;
const googleStatusCodes = googleSignInModule?.statusCodes || {};

const AUTH_MODES = {
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
};

const getEmailAuthErrorMessage = (error, isRegisterMode) => {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'Este correo ya tiene una cuenta. Inicia sesión con tus credenciales.';
    case 'auth/invalid-email':
      return 'Ingresa un correo válido.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Correo o contraseña incorrectos.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'No se pudo conectar con Firebase. Revisa tu conexión.';
    default:
      return isRegisterMode
        ? 'No se pudo crear la cuenta. Intenta de nuevo.'
        : 'No se pudo iniciar sesión. Verifica tus credenciales.';
  }
};

export default function LoginScreen() {
  const {
    GOOGLE_WEB_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID,
    authError,
  } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [emailAuthVisible, setEmailAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState(AUTH_MODES.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const googleWebClientId = getConfiguredClientId(GOOGLE_WEB_CLIENT_ID);
  const googleIosClientId = getConfiguredClientId(GOOGLE_IOS_CLIENT_ID);

  useEffect(() => {
    if (!GoogleSignin || !googleWebClientId) return;

    GoogleSignin.configure({
      webClientId: googleWebClientId,
      iosClientId: googleIosClientId,
      offlineAccess: false,
    });
  }, [googleIosClientId, googleWebClientId]);

  const handleGoogleLogin = async () => {
    if (!GoogleSignin) {
      Alert.alert('Google no disponible', 'El login con Google requiere instalar el APK o usar una development build.');
      return;
    }

    if (!googleWebClientId) {
      Alert.alert('Error', 'Falta configurar el Google Web Client ID.');
      return;
    }

    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResponse = await GoogleSignin.signIn();

      if (signInResponse.type !== 'success') {
        setLoading(false);
        return;
      }

      const idToken = signInResponse.data?.idToken;

      if (!idToken) {
        Alert.alert('Error', 'Google no devolvió un token válido.');
        setLoading(false);
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error) {
      if (error?.code === googleStatusCodes.SIGN_IN_CANCELLED) {
        setLoading(false);
        return;
      }

      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const isRegisterMode = authMode === AUTH_MODES.REGISTER;

    if (!normalizedEmail || !password) {
      Alert.alert('Error', 'Ingresa correo y contraseña.');
      return;
    }

    if (isRegisterMode && password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
    } catch (error) {
      console.error('Email Auth Error:', error);
      Alert.alert('Error', getEmailAuthErrorMessage(error, isRegisterMode));
    } finally {
      setLoading(false);
    }
  };

  const showLoginForm = () => {
    setAuthMode(AUTH_MODES.LOGIN);
    setEmailAuthVisible(true);
  };

  const toggleEmailAuthMode = () => {
    setAuthMode((currentMode) => (
      currentMode === AUTH_MODES.LOGIN ? AUTH_MODES.REGISTER : AUTH_MODES.LOGIN
    ));
  };

  const hideEmailAuth = () => {
    setEmailAuthVisible(false);
    setAuthMode(AUTH_MODES.LOGIN);
  };

  const isRegisterMode = authMode === AUTH_MODES.REGISTER;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icono.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Boutique Estefany</Text>
          <Text style={styles.tagline}>Elegancia en cada detalle</Text>
        </View>

        <View style={styles.authContainer}>
          {!emailAuthVisible ? (
            <>
              <TouchableOpacity
                style={[styles.googleButton, loading && styles.disabledButton]}
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.googleButtonText}>Continuar con Google</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={showLoginForm} disabled={loading}>
                <Text style={styles.emailAuthToggleText}>Entrar con correo</Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Al continuar, aceptas nuestros Términos y Condiciones
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.emailAuthTitle}>
                {isRegisterMode ? 'Crear cuenta' : 'Entrar con correo'}
              </Text>

              {authError && (
                <Text style={styles.errorText}>{authError}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />

              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
                textContentType={isRegisterMode ? 'newPassword' : 'password'}
              />

              <TouchableOpacity
                style={[styles.emailAuthButton, loading && styles.disabledButton]}
                onPress={handleEmailAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.emailAuthButtonText}>
                    {isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleEmailAuthMode} disabled={loading}>
                <Text style={styles.emailAuthToggleText}>
                  {isRegisterMode ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={hideEmailAuth} disabled={loading}>
                <Text style={styles.emailAuthToggleText}>Volver a Google</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}





