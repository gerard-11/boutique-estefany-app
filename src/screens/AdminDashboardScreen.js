import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboard } from '../hooks/useDashboard';
import ScannerFAB from '../components/ScannerFAB';
import MetricCard from '../components/MetricCard';
import { styles } from './AdminDashboardScreen.styles';

export default function AdminDashboardScreen({ navigation }) {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={styles.loadingText}>Cargando métricas de hoy...</Text>
      </View>
    );
  }

  const metrics = {
    capitalTotal: data?.totalCapital ?? 0,
    dineroVolando: data?.moneyInTheAir ?? 0,
    mermasMes: data?.mermasMes ?? 0,
    liquidezDia: data?.todayLiquidity ?? 0
  };

console.log('Metrics:', metrics);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#d63384']} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Panel de Control</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
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

      <ScannerFAB onPress={() => navigation.navigate('Scanner')} />
    </SafeAreaView>
  );
}


