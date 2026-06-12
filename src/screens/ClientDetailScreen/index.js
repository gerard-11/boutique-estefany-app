import React, { useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useClientEnrichedProfile } from '../../hooks/useClients';
import { useWishlist } from '../../hooks/useWishlist';
import { styles } from './ClientDetailScreen.styles';

// Subcomponentes
import ProfileHeader from './components/ProfileHeader';
import FinancialCards from './components/FinancialCards';
import TransactionItem from './components/TransactionItem';
import WishlistTab from './components/WishlistTab';

const TABS = [
  { id: 'ACTIVE_DEBTS', label: 'Deudas' },
  { id: 'HISTORY', label: 'Historial' },
  { id: 'WISHLIST', label: 'Intereses' },
];

export default function ClientDetailScreen({ route, navigation }) {
  const { clientId } = route.params || {};
  const [activeTab, setActiveTab] = useState('ACTIVE_DEBTS');


  const { 
    data: profile, 
    isLoading: isProfileLoading, 
    refetch: refetchProfile, 
    isRefetching: isRefetchingProfile 
  } = useClientEnrichedProfile(clientId);


  const { 
    data: wishlist, 
    isLoading: isWishlistLoading 
  } = useWishlist(clientId);

console.log('ClientDetailScreen - profile:', profile);
console.log('ClientDetailScreen - wishlist:', wishlist )

  const allMovements = useMemo(() => {
    if (!profile) return [];
    const txs = profile.transactions || [];
    const pays = profile.payments || [];
    return [...txs, ...pays].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [profile]);

  const activeDebts = useMemo(() => {
    return allMovements.filter(item => {
      const isTx = item.totalAmount !== undefined && item.type !== 'PAYMENT';
      const isNotDone = item.status !== 'COMPLETED';
      return isTx && isNotDone;
    });
  }, [allMovements]);

  if (isProfileLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#d63384" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error al cargar el perfil</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        stickyHeaderIndices={[2]} // Mantener las Tabs fijas al hacer scroll
        refreshControl={
          <RefreshControl 
            refreshing={isRefetchingProfile} 
            onRefresh={refetchProfile} 
          />
        }
      >
        <ProfileHeader 
          user={profile} 
          onRegisterPayment={() => {/* TODO: Navegar a registro de pago */}} 
        />

        <FinancialCards 
          balance={profile.balance}
          debt={profile.financialSummary?.currentDebt}
          availableCredit={profile.financialSummary?.availableCredit}
          creditLimit={profile.creditLimit}
        />

        {/* Tab Bar Selector */}
        <View style={{ backgroundColor: '#f8f9fa' }}>
          <View style={styles.tabsContainer}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contenido Dinámico según Tab */}
        <View style={{ paddingBottom: 40 }}>
          {activeTab === 'ACTIVE_DEBTS' && (
            <>
              <Text style={styles.sectionTitle}>Deudas Pendientes</Text>
              {activeDebts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay deudas activas.</Text>
                </View>
              ) : (
                activeDebts.map((item, idx) => (
                  <TransactionItem key={item.id || idx} item={item} />
                ))
              )}
            </>
          )}

          {activeTab === 'HISTORY' && (
            <>
              <Text style={styles.sectionTitle}>Todos los movimientos</Text>
              {allMovements.map((item, idx) => (
                <TransactionItem key={item.id || idx} item={item} />
              ))}
            </>
          )}

          {activeTab === 'WISHLIST' && (
            <>
              <Text style={styles.sectionTitle}>Intereses del Cliente</Text>
              <WishlistTab items={wishlist} isLoading={isWishlistLoading} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
