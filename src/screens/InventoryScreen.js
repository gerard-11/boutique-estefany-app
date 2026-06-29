import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { useClients } from '../hooks/useClients';
import { useCreateTransaction } from '../hooks/useProductScanner';
import { ClientPickerModal } from './ScannerScreen/components/ClientPickerModal';
import { CircularActionMenu } from './ScannerScreen/components/CircularActionMenu';
import { TRANSACTION_TYPE_LABELS } from '../constants/transactionTypes';
import { styles } from './InventoryScreen.styles';
import { theme } from '../theme';

const STATUS_MAP = {
  AVAILABLE: { color: '#40c057', label: 'Disponible', order: 1 },
  LAYAWAY: { color: '#fcc419', label: 'Apartado', order: 2 },
  APARTADO: { color: '#fcc419', label: 'Apartado', order: 2 },
  RESERVED: { color: '#fcc419', label: 'Apartado', order: 2 },
  RESERVADO: { color: '#fcc419', label: 'Apartado', order: 2 },
  LOAN: { color: '#339af0', label: 'Prestado', order: 3 },
  PRESTAMO: { color: '#339af0', label: 'Prestado', order: 3 },
  WEEKLY_CREDIT: { color: '#e64980', label: 'En Crédito', order: 4 },
  CREDITO_SEMANAL: { color: '#e64980', label: 'En Crédito', order: 4 },
  SOLD: { color: '#fa5252', label: 'Vendido', order: 5 },
};

const getProductStatus = (item) => {
  const rawStatus = item?.inventoryStatus?.status || item.status;
  if (rawStatus) return rawStatus.toUpperCase();
  return item.stock > 0 ? 'AVAILABLE' : 'SOLD';
};

const canOpenActions = (product) => (
  getProductStatus(product) === 'AVAILABLE' && product?.inventoryStatus?.canSell !== false
);

export default function InventoryScreen() {
  const { data: products, isLoading, refetch, isRefetching } = useProducts();
  const [search, setSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [actionProduct, setActionProduct] = useState(null);
  const [assigningProduct, setAssigningProduct] = useState(null);
  const [selectedTransactionType, setSelectedTransactionType] = useState(null);
  const { data: clients } = useClients(clientSearch, '');
  const { mutate: createTransaction, isPending: isAssigningProduct } = useCreateTransaction();

  const closeActionMenu = () => setActionProduct(null);

  const openActionMenu = (product) => {
    if (!canOpenActions(product)) return;
    setActionProduct(product);
  };

  const closeAssignment = () => {
    if (isAssigningProduct) return;
    setAssigningProduct(null);
    setSelectedTransactionType(null);
    setClientSearch('');
  };

  const handleSelectInventoryAction = (type) => {
    if (!actionProduct || type === 'RETURN') return;
    setAssigningProduct(actionProduct);
    setSelectedTransactionType(type);
    setActionProduct(null);
    setClientSearch('');
  };

  const handleAssignProduct = (client) => {
    if (!assigningProduct || !selectedTransactionType || isAssigningProduct) return;

    const userId = client?.id || client?.userId || client?.clientId;
    if (!userId) {
      Alert.alert('Cliente no disponible', 'No se encontró el ID del cliente seleccionado.');
      return;
    }

    const payload = {
      userId,
      type: selectedTransactionType,
    };

    if (assigningProduct.barcode) {
      payload.productBarcodes = [String(assigningProduct.barcode)];
    } else {
      payload.productIds = [String(assigningProduct.id)];
    }

    createTransaction(payload, {
      onSuccess: () => {
        const label = TRANSACTION_TYPE_LABELS[selectedTransactionType] || 'Asignación';
        Alert.alert('Acción completada', label + ' registrada correctamente.');
        setAssigningProduct(null);
        setSelectedTransactionType(null);
        setClientSearch('');
        refetch();
      },
      onError: (error) => {
        const serverError = error?.response?.data;
        const errorMessage = Array.isArray(serverError?.message)
          ? serverError.message.join('\n')
          : serverError?.message || error.message || 'No se pudo completar la acción';
        Alert.alert('Error', String(errorMessage));
      },
    });
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products
      .filter((product) =>
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode?.includes(search) ||
        product.category?.name?.toLowerCase().includes(search.toLowerCase())
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
    const isActionable = canOpenActions(item);

    return (
      <TouchableOpacity
        style={[styles.productCard, isActionable && styles.actionableProductCard]}
        activeOpacity={isActionable ? 0.72 : 1}
        onPress={() => openActionMenu(item)}
        disabled={!isActionable}
      >
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productMeta}>
            {item.category?.department?.name} › {item.category?.name}
          </Text>
          <Text style={styles.productMeta}>
            Cod: {item.barcode || 'S/N'} {item.size ? `| Talla: ${item.size}` : ''}
          </Text>
          {isActionable && (
            <View style={styles.actionHintRow}>
              <MaterialCommunityIcons name="gesture-tap" size={14} color={theme.colors.primary} />
              <Text style={styles.actionHintText}>Toca para abrir acciones</Text>
            </View>
          )}
          {assignedTo && (
            <Text style={[styles.assignedText, { color: statusConfig.color }]}>
              {['PRESTAMO', 'LOAN'].includes(invStatus) ? 'Prestado a: ' : (invStatus === 'SOLD' ? 'Vendido a: ' : 'Asignado a: ')}{assignedTo}
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
        keyExtractor={(item) => item.id.toString()}
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

      <Modal visible={!!actionProduct} animationType="fade" transparent onRequestClose={closeActionMenu}>
        <View style={styles.actionMenuOverlay}>
          <View style={styles.actionMenuSheet}>
            <View style={styles.actionMenuHeader}>
              <View style={styles.actionMenuTitleGroup}>
                <Text style={styles.actionMenuTitle}>{actionProduct?.name}</Text>
                <Text style={styles.actionMenuSubtitle}>Selecciona qué quieres hacer con esta prenda</Text>
              </View>
              <TouchableOpacity style={styles.actionMenuCloseButton} onPress={closeActionMenu}>
                <MaterialCommunityIcons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <CircularActionMenu
              product={actionProduct}
              onReturn={closeActionMenu}
              onSelectAction={handleSelectInventoryAction}
            />
          </View>
        </View>
      </Modal>

      <ClientPickerModal
        visible={!!assigningProduct}
        search={clientSearch}
        clients={clients}
        isSelecting={isAssigningProduct}
        onSearchChange={setClientSearch}
        onSelectClient={handleAssignProduct}
        onClose={closeAssignment}
      />
    </SafeAreaView>
  );
}
