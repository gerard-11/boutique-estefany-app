import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { styles } from './InventoryScreen.styles';
import { theme } from '../theme';


const STATUS_MAP = {
  AVAILABLE: { color: '#40c057', label: 'Disponible', order: 1 },
  APARTADO: { color: '#fcc419', label: 'Apartado', order: 2 },
  PRESTAMO: { color: '#339af0', label: 'Prestado', order: 3 },
  CREDITO_SEMANAL: { color: '#e64980', label: 'En Crédito', order: 4 },
  SOLD: { color: '#fa5252', label: 'Vendido', order: 5 },
};

/**
 * Determina el estado real del producto basándose en inventoryStatus o stock.
 */
const getProductStatus = (item) => {
  const rawStatus = item?.inventoryStatus?.status || item.status;
  if (rawStatus) return rawStatus.toUpperCase();
  return (item.stock > 0) ? 'AVAILABLE' : 'SOLD';
};

export default function InventoryScreen() {
  const { data: products, isLoading, isError, refetch, isRefetching } = useProducts();
  const [search, setSearch] = useState('');

 console.log('Productos crudos:', products);
console.log('Productos en inventario:', products?.some(i=> {
i.name === 'Sudadera Nike Sport'
console.log('Producto encontrado:', i);
}));

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products
      .filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.barcode?.includes(search) ||
        p.category?.name?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const statusA = getProductStatus(a);
        const statusB = getProductStatus(b);
        
        const orderA = STATUS_MAP[statusA]?.order || 99;
        const orderB = STATUS_MAP[statusB]?.order || 99;
        
        return orderA - orderB;
      });
  }, [products, search]);

  const renderItem = ({ item }) => {
    const invStatus = getProductStatus(item);
    const statusConfig = STATUS_MAP[invStatus] || { color: theme.colors.textSecondary, label: invStatus };
    const assignedTo = item.inventoryStatus?.assignedTo?.name;

    return (
      <TouchableOpacity style={styles.productCard} activeOpacity={0.7}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productMeta}>
            {item.category?.department?.name} › {item.category?.name}
          </Text>
          <Text style={styles.productMeta}>
            Cod: {item.barcode || 'S/N'} {item.size ? `| Talla: ${item.size}` : ''}
          </Text>
          {assignedTo && (
            <Text style={[styles.assignedText, { color: statusConfig.color }]}>
              {invStatus === 'PRESTAMO' ? 'Prestado a: ' : (invStatus === 'SOLD' ? 'Vendido a: ' : 'Asignado a: ')}{assignedTo}
            </Text>
          )}
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.salePrice}>
            ${typeof item.price === 'number' ? item.price.toLocaleString() : '0'}
          </Text>
          <View style={[styles.stockBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.stockText}>{statusConfig.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando inventario...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventario Total</Text>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, código o categoría..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#d63384']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {search ? 'No se encontraron resultados' : 'No hay productos registrados'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
