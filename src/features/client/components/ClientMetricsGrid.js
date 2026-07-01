import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { styles } from '../screens/ClientHomeScreen.styles';
import { formatCurrency } from '../utils/clientPortalUtils';

function MetricCard({ icon, color, value, label }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function ClientMetricsGrid({ client, financialSummary, onEditProfile }) {
  return (
    <View style={styles.section}>
      <View style={styles.cardsGrid}>
        <MetricCard
          icon="trending-down"
          color={theme.colors.danger}
          value={formatCurrency(financialSummary.currentDebt)}
          label="Deuda"
        />
        <MetricCard
          icon="credit-card-check-outline"
          color={theme.colors.success}
          value={formatCurrency(financialSummary.availableCredit)}
          label="Disponible"
        />
        <MetricCard
          icon="wallet-outline"
          color={theme.colors.info}
          value={formatCurrency(client.balance)}
          label="Monedero"
        />
        <TouchableOpacity style={styles.metricCard} onPress={onEditProfile}>
          <View style={[styles.metricIcon, { backgroundColor: theme.colors.primary + '18' }]}>
            <MaterialCommunityIcons name="account-edit-outline" size={22} color={theme.colors.primary} />
          </View>
          <Text style={styles.metricValue}>{client.level || 'BRONCE'}</Text>
          <Text style={styles.metricLabel}>Editar perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
