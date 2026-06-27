import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  BackHandler,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView } from 'expo-camera';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useScannerStore } from '../../hooks/useScannerStore';
import { useScannerHandlers } from '../../hooks/useScannerHandlers';
import {
  useProductByBarcode,
  useDepartmentsData
} from '../../hooks/useProductScanner';
import { useClients } from '../../hooks/useClients';
import { productSchema } from '../../services/productService';
import { TRANSACTION_TYPES } from '../../constants/transactionTypes';
import { styles } from './ScannerScreen.styles';
import { theme } from '../../theme';

// Componentes Modulares
import { ProductFound } from './components/ProductFound';
import { NewProductForm } from './components/NewProductForm';
import { CategoryPickerModal } from './components/CategoryPickerModal';
import { ClientPickerModal } from './components/ClientPickerModal';

const LAYAWAY_STATUSES = ['LAYAWAY', 'APARTADO', 'RESERVED', 'RESERVADO'];
const SELL_TYPES = [TRANSACTION_TYPES.CASH, TRANSACTION_TYPES.WEEKLY_CREDIT];

const getProductStatus = (product) => (
  product?.inventoryStatus?.status || product?.status || 'AVAILABLE'
).toUpperCase();

const getAssignedClient = (product) => {
  const assigned = product?.inventoryStatus?.assignedTo || product?.assignedTo || product?.reservedBy;
  const id = assigned?.id || assigned?.userId || assigned?.clientId;

  if (!id) return null;

  const fallbackName = [assigned?.firstName, assigned?.lastName].filter(Boolean).join(' ');
  return {
    ...assigned,
    id,
    name: assigned?.name || fallbackName || 'Cliente asignado',
  };
};

const parsePercentage = (value) => {
  const normalized = String(value || '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value = 0) => `${String.fromCharCode(36)}${Number(value || 0).toLocaleString()}`;

export default function ScannerScreen({ navigation }) {
  // --- Zustand Store ---
  const {
    step, barcode, scanned, picker, showClientPicker,
    transactionType, userSearch, handleBarcodeScanned, reset: resetStore,
    closePicker, openPicker, closeClientPicker, updateUserSearch, setTransaction
  } = useScannerStore();

  const [cashSale, setCashSale] = useState(null);
  const [discountInput, setDiscountInput] = useState('');

  // --- Data Hooks ---
  const { data: product, isLoading: isVerifying } = useProductByBarcode(barcode);
  const { data: departmentsData } = useDepartmentsData();
  const { data: clients } = useClients(userSearch, '');
  // --- React Hook Form ---

  const methods = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', price: '', cost: '', stock: '1', size: '',
      sizeUnit: '', color: '', departmentName: '', categoryName: '',
      departmentId: null, categoryId: null,
    }
  });

  const { reset: resetForm, setValue, watch, formState: { isDirty } } = methods;

  // --- Logic Handlers Hook ---
  const {
    isSaving,
    isCreatingTransaction,
    handleSaveProduct,
    handleReturn,
    handleSelectClient,
    handleCreateTransactionForClient,
    handleSelectPickerItem,
    handleCancel
  } = useScannerHandlers(navigation, resetForm, setValue);

  const productPrice = Number(product?.price || 0);
  const discountPercentage = useMemo(() => parsePercentage(discountInput), [discountInput]);
  const cashTotal = Math.max(productPrice * (1 - discountPercentage / 100), 0);

  const closeCashSale = () => {
    if (isCreatingTransaction) return;
    setCashSale(null);
    setDiscountInput('');
  };

  const openCashSale = (client) => {
    setCashSale({ client });
    setDiscountInput('');
  };

  const submitCashSale = () => {
    if (!cashSale?.client) return;

    if (discountPercentage > 100) {
      Alert.alert('Descuento inválido', 'El descuento no puede ser mayor a 100%.');
      return;
    }

    handleCreateTransactionForClient(cashSale.client, TRANSACTION_TYPES.CASH, {
      discountPercentage,
    });
  };

  const continueProductAction = (type) => {
    const status = getProductStatus(product);
    const isLayaway = LAYAWAY_STATUSES.includes(status);
    const assignedClient = getAssignedClient(product);

    if (isLayaway && SELL_TYPES.includes(type)) {
      if (!assignedClient) {
        Alert.alert(
          'Cliente no disponible',
          'Esta prenda está apartada, pero la respuesta no incluye el cliente asignado.'
        );
        return;
      }

      if (type === TRANSACTION_TYPES.CASH) {
        openCashSale(assignedClient);
        return;
      }

      handleCreateTransactionForClient(assignedClient, type);
      return;
    }

    setTransaction(type);
  };

  const handleProductAction = (type) => {
    if (SELL_TYPES.includes(type) && product?.softReservationAlert) {
      const message = typeof product.softReservationAlert === 'string'
        ? product.softReservationAlert
        : product.softReservationAlert?.message || 'Este producto tiene una alerta de apartado. Revisa antes de vender.';

      Alert.alert('Alerta de apartado', message, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => continueProductAction(type) },
      ]);
      return;
    }

    continueProductAction(type);
  };

  const handleClientSelection = (client) => {
    if (transactionType === TRANSACTION_TYPES.CASH) {
      closeClientPicker();
      openCashSale(client);
      return;
    }

    handleSelectClient(client);
  };

  // RESET TOTAL AL ENTRAR
  useFocusEffect(
    useCallback(() => {
      resetStore();
      resetForm();
      setCashSale(null);
      setDiscountInput('');
    }, [resetForm, resetStore])
  );

  const watchDeptId = watch('departmentId');

  const availableCategories = useMemo(() => {
    if (!departmentsData) return [];
    if (watchDeptId && watchDeptId !== 'NEW') {
      const dept = departmentsData.find(d => d.id === watchDeptId);
      return dept ? dept.categories : [];
    }
    return departmentsData.flatMap(dept =>
      dept.categories.map(cat => ({ ...cat, parentDeptId: dept.id, parentDeptName: dept.name }))
    );
  }, [departmentsData, watchDeptId]);

  // --- Seguridad de Navegación ---
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
        e.preventDefault();
        return;
      }

      const hasBarcode = !!barcode;
      const hasFormContent = isDirty;

      if (hasBarcode || hasFormContent) {
        e.preventDefault();
        Alert.alert(
          'Descartar cambios',
          '¿Deseas salir del escáner? Se perderán los datos actuales.',
          [
            { text: 'Seguir aquí', style: 'cancel' },
            {
              text: 'Salir y perder datos',
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      }
    });
    return unsubscribe;
  }, [navigation, isDirty, barcode]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (Keyboard.isVisible()) {
          Keyboard.dismiss();
          return true;
        }

        const hasBarcode = !!barcode;
        const hasFormContent = isDirty;

        if (hasBarcode || hasFormContent) {
          navigation.goBack();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [navigation, isDirty, barcode])
  );

  return (
    <FormProvider {...methods}>
      <SafeAreaView style={styles.container}>
        {(step === 'SCANNING') ? (
          <View style={{ flex: 1 }}>
            <CameraView
              style={StyleSheet.absoluteFill}
              onBarcodeScanned={(result) => !scanned && handleBarcodeScanned(result.data)}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'upc_a']
              }}
            />
            <View style={[styles.overlay, StyleSheet.absoluteFill]}>
              <View style={styles.unfocusedContainer} />
              <View style={{ flexDirection: 'row' }}>
                <View style={styles.unfocusedContainer} />
                <View style={styles.focusedContainer} />
                <View style={styles.unfocusedContainer} />
              </View>
              <View style={styles.unfocusedContainer}>
                <View style={styles.bottomContainer}>
                  <Text style={styles.instructionText}>Enfoca el código de barras</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.closeButtonText}>Regresar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {isVerifying ? (
              <ActivityIndicator style={{ flex: 1 }} size="large" color={theme.colors.primary} />
            ) : (
              (product && step !== 'NEW_FORM') ? (
                <ProductFound
                  product={product}
                  onReturn={handleReturn}
                  onReset={() => { resetStore(); resetForm(); }}
                  onSelectAction={handleProductAction}
                />
              ) : (
                <NewProductForm
                  barcode={barcode}
                  isSaving={isSaving}
                  onSave={handleSaveProduct}
                  onCancel={() => handleCancel(isDirty)}
                  onOpenPicker={openPicker}
                  watchDeptId={watchDeptId}
                  watchCatId={watch('categoryId')}
                  watchDeptName={watch('departmentName')}
                  watchCatName={watch('categoryName')}
                />
              )
            )}
          </View>
        )}

        <CategoryPickerModal
          picker={picker}
          selectedId={picker.type === 'department' ? watchDeptId : watch('categoryId')}
          departmentsData={departmentsData}
          availableCategories={availableCategories}
          onClose={closePicker}
          onSelectItem={(item) => handleSelectPickerItem(item, picker.type)}
        />

        <ClientPickerModal
          visible={showClientPicker}
          search={userSearch}
          clients={clients}
          isSelecting={isCreatingTransaction}
          onSearchChange={updateUserSearch}
          onSelectClient={handleClientSelection}
          onClose={closeClientPicker}
        />

        <Modal
          visible={!!cashSale}
          animationType="slide"
          transparent
          onRequestClose={closeCashSale}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.cashSaleSheet}>
              <Text style={styles.cashSaleTitle}>Venta de contado</Text>
              <Text style={styles.cashSaleSubtitle}>{cashSale?.client?.name || `${cashSale?.client?.firstName || ''} ${cashSale?.client?.lastName || ''}`.trim()}</Text>

              <View style={styles.cashSaleRow}>
                <Text style={styles.cashSaleLabel}>Precio</Text>
                <Text style={styles.cashSaleValue}>{formatCurrency(productPrice)}</Text>
              </View>

              <Text style={styles.cashSaleInputLabel}>Descuento (%)</Text>
              <View style={styles.cashSaleInputWrapper}>
                <Text style={styles.cashSaleCurrency}>%</Text>
                <TextInput
                  style={styles.cashSaleInput}
                  value={discountInput}
                  onChangeText={setDiscountInput}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.cashSaleRow}>
                <Text style={styles.cashSaleLabel}>Total a cobrar</Text>
                <Text style={styles.cashSaleTotal}>{formatCurrency(cashTotal)}</Text>
              </View>

              <View style={styles.cashSaleActions}>
                <TouchableOpacity
                  style={styles.cashSaleCancelButton}
                  onPress={closeCashSale}
                  disabled={isCreatingTransaction}
                >
                  <Text style={styles.cashSaleCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cashSaleSubmitButton, isCreatingTransaction && styles.cashSaleSubmitButtonDisabled]}
                  onPress={submitCashSale}
                  disabled={isCreatingTransaction}
                >
                  <Text style={styles.cashSaleSubmitText}>{isCreatingTransaction ? 'Vendiendo...' : 'Confirmar venta'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </FormProvider>
  );
}
