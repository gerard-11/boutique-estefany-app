import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './PaymentsScreen.styles';

export default function PaymentsScreen({ route, navigation }) {
  const { clientId } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pagos</Text>
        <Text style={styles.subtitle}>
          {clientId
            ? 'Registra un pago para el cliente seleccionado.'
            : 'Selecciona un cliente para registrar un pago.'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="cash-check" size={42} color="#d63384" />
        </View>

        <Text style={styles.emptyTitle}>
          {clientId ? 'Cliente preseleccionado' : 'Sin cliente seleccionado'}
        </Text>
        <Text style={styles.emptyText}>
          {clientId
            ? `Cliente ID: ${clientId}`
            : 'Desde el perfil de un cliente puedes abrir esta pantalla con el cliente ya cargado.'}
        </Text>

        {!clientId && (
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Clients')}
          >
            <MaterialCommunityIcons name="account-search-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Buscar cliente</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
