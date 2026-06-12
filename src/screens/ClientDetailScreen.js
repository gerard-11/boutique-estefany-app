import React from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useClientEnrichedProfile } from '../hooks/useClients';
import { styles } from './ClientDetailScreen.styles';
import { theme } from '../theme';

const LEVEL_COLORS = {
  ORO: '#fcc419',
  PLATA: '#adb5bd',
  BRONCE: '#d9480f',
};

export default function ClientDetailScreen({ route, navigation }) {
  const { clientId } = route.params || {};
  const { data: profile, isLoading, refetch, isRefetching } = useClientEnrichedProfile(clientId);
console.log('detalle', profile);
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text>No se pudo cargar el perfil del cliente</Text>
      </View>
    );
  }

  const { 
    firstName, 
    lastName, 
    email, 
    phoneNumber, 
    level, 
    creditLimit, 
    financialSummary 
  } = profile;

  const levelColor = LEVEL_COLORS[level] || theme.colors.textSecondary;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Header Perfil */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <MaterialCommunityIcons name="account" size={60} color={theme.colors.textSecondary} />
        </View>
        <Text style={styles.userName}>{firstName} {lastName}</Text>
        <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
          <Text style={styles.levelText}>{level || 'BRONCE'}</Text>
        </View>
      </View>

      {/* Info Financiera */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen Financiero</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Límite de Crédito</Text>
            <Text style={styles.statValue}>${creditLimit?.toLocaleString() || '0'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Deuda Actual</Text>
            <Text style={[styles.statValue, { color: (financialSummary?.currentDebt > 0) ? theme.colors.error : theme.colors.success }]}>
              ${financialSummary?.currentDebt?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { marginTop: 10 }]}>
          <Text style={styles.statLabel}>Crédito Disponible</Text>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            ${financialSummary?.availableCredit?.toLocaleString() || '0'}
          </Text>
        </View>
      </View>

      {/* Contacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Contacto</Text>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>{email}</Text>
        </View>
        {phoneNumber && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{phoneNumber}</Text>
          </View>
        )}
      </View>

      {/* Acciones */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Editar Límites / Nivel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
