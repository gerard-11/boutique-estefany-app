import React, { useContext, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
// Importaremos la lógica de Google aquí más adelante cuando configuremos el ClientID
// import * as Google from 'expo-auth-session/providers/google';

export default function LoginScreen() {
  const { signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    console.log('LoginScreen: Click en botón Google');
    setLoading(true);
    try {
      setTimeout(() => {
        signIn('google-dummy-token');
        setLoading(false);
      }, 2000);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google');
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
          
          <Text style={styles.footerText}>
            Al continuar, aceptas nuestros Términos y Condiciones
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Fondo blanco explícito
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fce4ec', // Color de respaldo si la imagen falla
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d63384',
    marginTop: 20,
  },
  tagline: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 5,
  },
  authContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    height: 55,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
  },
});
