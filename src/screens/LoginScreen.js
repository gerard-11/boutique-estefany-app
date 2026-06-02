import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { 
  GoogleAuthProvider, 
  signInWithCredential 
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
  } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const googleWebClientId = getConfiguredClientId(GOOGLE_WEB_CLIENT_ID);
  const googleAndroidClientId = getConfiguredClientId(GOOGLE_ANDROID_CLIENT_ID);
  const googleIosClientId = getConfiguredClientId(GOOGLE_IOS_CLIENT_ID);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: googleWebClientId,
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

  return (
    <View style={styles.container}>
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
          
          <Text style={styles.footerText}>
            Al continuar, aceptas nuestros Términos y Condiciones
          </Text>
        </View>
      </View>
    </View>
  );
}





