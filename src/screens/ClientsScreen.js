import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useClients } from '../hooks/useClients';
import { useDebounce } from '../hooks/useDebounce';
import { styles } from './ClientsScreen.styles';
import { theme } from '../theme';

const LEVEL_COLORS = {
  ORO: '#fcc419',
  PLATA: '#adb5bd',
  BRONCE: '#d9480f',
};
const Level = ['ORO', 'PLATA', 'BRONCE'];
const TABS = [
  { id: 'ALL', label: 'Todos' },
  { id: 'WITH_DEBT', label: 'Con deuda' },
];

const getClientDebt = (client) => Number(
  client?.financialSummary?.currentDebt ?? client?.currentDebt ?? client?.debt ?? 0
);

const formatCurrency = (value = 0) => String.fromCharCode(36) + Number(value || 0).toLocaleString();

const getStatusColor = (lastPaymentDate) => {
  if (!lastPaymentDate) return '#fa5252'; // Rojo si nunca ha pagado

  const lastPayment = new Date(lastPaymentDate);
  const today = new Date();
  const diffTime = Math.abs(today - lastPayment);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return '#40c057';   // VERDE
  if (diffDays <= 30) return '#fab005';  // AMARILLO
  return '#fa5252';                      // ROJO
};

export default function ClientsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  const debouncedSearch = useDebounce(search, 500);

  const isDebtTab = activeTab === 'WITH_DEBT';
  const clientQueryOptions = isDebtTab ? { sortBy: 'currentDebt', order: 'desc' } : {};
  const { data: clients, isLoading, refetch, isRefetching } = useClients(
    debouncedSearch,
    isDebtTab ? '' : filterLevel || '',
    clientQueryOptions
  );

  const visibleClients = useMemo(() => {
    const list = Array.isArray(clients) ? clients : [];
    if (!isDebtTab) return list;
    return list.filter((client) => getClientDebt(client) > 0);
  }, [clients, isDebtTab]);


  const renderClientItem = ({ item }) => {
    const statusColor = getStatusColor(item.lastPaymentDate);
    const levelColor = LEVEL_COLORS[item.level] || theme.colors.textSecondary;
    const debt = getClientDebt(item);

    return (
      <TouchableOpacity 
        style={styles.clientCard}
        onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
      >
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account" size={30} color={theme.colors.textSecondary} />
        </View>

        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.firstName} {item.lastName}</Text>
          <View style={styles.clientBadgesRow}>
            <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
              <Text style={styles.levelText}>{item.level || 'BRONCE'}</Text>
            </View>
            {debt > 0 && (
              <View style={styles.debtBadge}>
                <Text style={styles.debtText}>{formatCurrency(debt)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

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

        {!isDebtTab && (
          <View style={styles.filterContainer}>
            {Level.map(level => (
            <TouchableOpacity 
              key={level}
              style={[styles.filterChip, filterLevel === level && styles.filterChipActive]}
              onPress={() => setFilterLevel(filterLevel === level ? null : level)}
            >
              <Text style={[styles.filterChipText, filterLevel === level && styles.filterChipTextActive]}>
                {level}
              </Text>
            </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={visibleClients}
        keyExtractor={item => item.id}
        renderItem={renderClientItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-search-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>{isDebtTab ? 'No hay clientes con deuda' : 'No se encontraron clientes'}</Text>
          </View>
        }
      />
    </View>
  );
}
