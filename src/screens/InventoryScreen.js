import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { useProductActionFlow } from '../hooks/useProductActionFlow';
import { ClientPickerModal } from './ScannerScreen/components/ClientPickerModal';
import { CircularActionMenu } from './ScannerScreen/components/CircularActionMenu';
import { ProductCashSaleModal } from '../components/ProductCashSaleModal';
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

const ACTIONABLE_STATUSES = ['AVAILABLE', 'LAYAWAY', 'APARTADO', 'RESERVED', 'RESERVADO', 'LOAN', 'PRESTAMO'];

const canOpenActions = (product) => {
  const status = getProductStatus(product);
  if (status === 'AVAILABLE') return product?.inventoryStatus?.canSell !== false;
  return ACTIONABLE_STATUSES.includes(status);
};

export default function InventoryScreen() {
  const { data: products, isLoading, refetch, isRefetching } = useProducts();
  const [search, setSearch] = useState('');
  const [actionProduct, setActionProduct] = useState(null);
  const [transactionProduct, setTransactionProduct] = useState(null);

  const activeTransactionProduct = actionProduct || transactionProduct;
  const productActionFlow = useProductActionFlow({
    product: activeTransactionProduct,
    onTransactionSuccess: () => {
      setActionProduct(null);
      setTransactionProduct(null);
      refetch();
    },
    onReturnSuccess: () => {
      setActionProduct(null);
      setTransactionProduct(null);
      refetch();
    },
  });

  const closeActionMenu = () => {
    if (productActionFlow.isBusy) return;
    setActionProduct(null);
    setTransactionProduct(null);
  };

  const openActionMenu = (product) => {
    if (!canOpenActions(product)) return;
    setActionProduct(product);
    setTransactionProduct(product);
  };

  const handleSelectInventoryAction = (type) => {
    if (!actionProduct || productActionFlow.isBusy) return;
    setTransactionProduct(actionProduct);
    productActionFlow.handleProductAction(type);
    setActionProduct(null);
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
              onReturn={() => handleSelectInventoryAction('RETURN')}
              onSelectAction={handleSelectInventoryAction}
            />
          </View>
        </View>
      </Modal>

      <ClientPickerModal
        visible={productActionFlow.isClientPickerVisible}
        search={productActionFlow.clientSearch}
        clients={productActionFlow.clients}
        isSelecting={productActionFlow.isCreatingTransaction}
        onSearchChange={productActionFlow.setClientSearch}
        onSelectClient={productActionFlow.handleClientSelection}
        onClose={productActionFlow.closeClientPicker}
      />

      <ProductCashSaleModal
        visible={!!productActionFlow.cashSale}
        client={productActionFlow.cashSale?.client}
        price={productActionFlow.productPrice}
        total={productActionFlow.cashTotal}
        discountInput={productActionFlow.discountInput}
        isSubmitting={productActionFlow.isCreatingTransaction}
        onDiscountChange={productActionFlow.setDiscountInput}
        onSubmit={productActionFlow.submitCashSale}
        onClose={productActionFlow.closeCashSale}
        formatCurrency={productActionFlow.formatCurrency}
      />
    </SafeAreaView>
  );
}
