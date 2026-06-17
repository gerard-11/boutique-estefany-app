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

export default function LoginScreen() {
  const {
    GOOGLE_WEB_CLIENT_ID,
    GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID,
    authError,
  } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('12345678');

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

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    try {
      // Primero intentamos sign in, si falla (usuario no existe) creamos la cuenta
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          // Crear usuario de prueba
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Admin Login Error:', error);
      Alert.alert('Error', 'No se pudo conectar. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

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
          {!adminMode ? (
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

              <TouchableOpacity onPress={() => setAdminMode(true)}>
                <Text style={styles.adminToggleText}>Modo Admin (Testing)</Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Al continuar, aceptas nuestros Términos y Condiciones
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.adminTitle}>Admin Testing</Text>

              {authError && (
                <Text style={styles.errorText}>{authError}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.adminLoginButton, loading && styles.disabledButton]}
                onPress={handleAdminLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.adminLoginButtonText}>Ingresar como Admin</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => !loading && setAdminMode(false)}>
                <Text style={styles.adminToggleText}>Volver a Google Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}





