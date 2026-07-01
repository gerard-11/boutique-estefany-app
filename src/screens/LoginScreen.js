import React, { useContext, useState, useEffect } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../services/firebaseConfig';
import { styles } from './LoginScreen.styles';

WebBrowser.maybeCompleteAuthSession();

const getConfiguredClientId = (value) => {
  if (!value || value.startsWith('TU_')) return undefined;
  return value;
};

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
    GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID,
    authError,
  } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [emailAuthVisible, setEmailAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState(AUTH_MODES.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const googleWebClientId = getConfiguredClientId(GOOGLE_WEB_CLIENT_ID);
  const googleAndroidClientId = getConfiguredClientId(GOOGLE_ANDROID_CLIENT_ID);
  const googleIosClientId = getConfiguredClientId(GOOGLE_IOS_CLIENT_ID);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleWebClientId,
    androidClientId: googleAndroidClientId,
    iosClientId: googleIosClientId,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      if (!id_token) {
        console.error('Google Auth Error: No se recibió id_token', response);
        Alert.alert('Error', 'Google no devolvió un token válido. Revisa el Client ID de esta plataforma.');
        setLoading(false);
        return;
      }

      const credential = GoogleAuthProvider.credential(id_token);
      
      setLoading(true);
      signInWithCredential(auth, credential)
        .catch(error => {
          console.error('Firebase Auth Error:', error);
          Alert.alert('Error', 'No se pudo conectar con Firebase');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    if (!request) {
      Alert.alert('Cargando...', 'La configuración de Google aún no está lista. Reintenta en 1 segundo.');
      return;
    }

    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Prompt Error:', error);
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
            source={{ uri: 'https://picsum.photos/200' }}
            style={styles.logo}
          />
          <Text style={styles.title}>Boutique Estefany</Text>
          <Text style={styles.tagline}>Elegancia en cada detalle</Text>
        </View>

        <View style={styles.authContainer}>
          {!emailAuthVisible ? (
            <>
              <TouchableOpacity
                style={[styles.googleButton, (loading || !request) && styles.disabledButton]}
                onPress={handleGoogleLogin}
                disabled={loading || !request}
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





