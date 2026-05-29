import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDashboard } from '../hooks/useDashboard';
import ScannerFAB from '../components/ScannerFAB';

const MetricCard = ({ title, value, icon, color, subtitle }) => (
  <View style={styles.card}>
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={icon} size={30} color={color} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

export default function AdminDashboardScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={styles.loadingText}>Cargando métricas de hoy...</Text>
      </View>
    );
  }

  // Valores por defecto si la data aún no llega o está vacía
  const metrics = data || {
    capitalTotal: 0,
    dineroVolando: 0,
    mermasMes: 0,
    liquidezDia: 0
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#d63384']} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcome}>Panel de Control</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>

        <View style={styles.grid}>
          <MetricCard 
            title="Capital Total"
            value={`$${metrics.capitalTotal.toLocaleString()}`}
            icon="storefront-outline"
            color="#2ecc71"
            subtitle="Dinero en mercancía"
          />
          <MetricCard 
            title="Dinero Volando"
            value={`$${metrics.dineroVolando.toLocaleString()}`}
            icon="bank-transfer-out"
            color="#3498db"
            subtitle="Cuentas por cobrar"
          />
          <MetricCard 
            title="Liquidez del Día"
            value={`$${metrics.liquidezDia.toLocaleString()}`}
            icon="cash-register"
            color="#d63384"
            subtitle="Entradas de hoy"
          />
          <MetricCard 
            title="Mermas del Mes"
            value={`$${metrics.mermasMes.toLocaleString()}`}
            icon="alert-octagon-outline"
            color="#e74c3c"
            subtitle="Pérdidas registradas"
          />
        </View>
      </ScrollView>

      {/* Botón Flotante Global para el Admin */}
      <ScannerFAB onPress={() => console.log('Abrir Escáner...')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#adb5bd',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  }
});
