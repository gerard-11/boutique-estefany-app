import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDashboard } from '../hooks/useDashboard';
import ScannerFAB from '../components/ScannerFAB';
import ScannerModal from '../components/ScannerModal';
import { styles } from './AdminDashboardScreen.styles';

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
  const [scannerVisible, setScannerVisible] = useState(false);

  const handleScan = ({ type, data }) => {
    setScannerVisible(false);
    Alert.alert(
      'Producto Escaneado',
      `Tipo: ${type}\nCódigo: ${data}\n\nAquí abriremos el menú circular de acciones pronto.`,
      [{ text: 'OK' }]
    );
  };

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

      <ScannerFAB onPress={() => setScannerVisible(true)} />

      <ScannerModal
        visible={scannerVisible} 
        onClose={() => setScannerVisible(false)}
        onScan={handleScan}
      />
    </SafeAreaView>
  );
}


