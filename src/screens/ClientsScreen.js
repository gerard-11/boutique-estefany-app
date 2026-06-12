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

  const debouncedSearch = useDebounce(search, 500);

  const { data: clients, isLoading, refetch, isRefetching } = useClients(debouncedSearch, filterLevel || '');


  const renderClientItem = ({ item }) => {
    const statusColor = getStatusColor(item.lastPaymentDate);
    const levelColor = LEVEL_COLORS[item.level] || theme.colors.textSecondary;

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
          <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
            <Text style={styles.levelText}>{item.level || 'BRONCE'}</Text>
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
      </View>

      <FlatList
        data={clients}
        keyExtractor={item => item.id}
        renderItem={renderClientItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-search-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No se encontraron clientes</Text>
          </View>
        }
      />
    </View>
  );
}
