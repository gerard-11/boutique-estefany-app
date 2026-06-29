import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
const BARCODE_TYPES = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'itf14',
  'codabar',
  'qr',
];
const NUMERIC_BARCODE_TYPES = new Set(['ean13', 'ean8', 'upc_a', 'upc_e', 'itf14']);
const STABLE_SCAN_WINDOW_MS = 1200;
const ACCEPTED_SCAN_COOLDOWN_MS = 1800;

const normalizeBarcodeData = (value) => String(value || '')
  .trim()
  .replace(/[\u200B-\u200D\uFEFF]/g, '');

const isReadableBarcode = (code, type) => {
  if (!code) return false;

  if (NUMERIC_BARCODE_TYPES.has(type)) {
    return /^[0-9]{6,14}$/.test(code);
  }

  return code.length >= 4;
};

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
    transactionType, userSearch, handleBarcodeScanned, openManualProductForm, reset: resetStore,
    closePicker, openPicker, closeClientPicker, updateUserSearch, setTransaction
  } = useScannerStore();

  const [cashSale, setCashSale] = useState(null);
  const [discountInput, setDiscountInput] = useState('');
  const [isTorchOn, setTorchOn] = useState(false);
  const [scanFeedback, setScanFeedback] = useState('Centra el código completo dentro de la guía.');
  const pendingScanRef = useRef({ code: null, count: 0, updatedAt: 0 });
  const acceptedScanRef = useRef({ code: null, updatedAt: 0 });

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

  const handleStableBarcodeScanned = useCallback((result) => {
    if (scanned || step !== 'SCANNING') return;

    const type = String(result?.type || '').toLowerCase();
    const code = normalizeBarcodeData(result?.data);
    if (!isReadableBarcode(code, type)) {
      setScanFeedback('Acerca el código y evita cortar los extremos.');
      return;
    }

    const now = Date.now();
    const accepted = acceptedScanRef.current;
    if (accepted.code === code && now - accepted.updatedAt < ACCEPTED_SCAN_COOLDOWN_MS) return;

    const pending = pendingScanRef.current;
    const isSamePending = pending.code === code && now - pending.updatedAt <= STABLE_SCAN_WINDOW_MS;
    const nextCount = isSamePending ? pending.count + 1 : 1;

    pendingScanRef.current = { code, count: nextCount, updatedAt: now };

    if (nextCount < 2) {
      setScanFeedback('Mantén el código estable un momento.');
      return;
    }

    acceptedScanRef.current = { code, updatedAt: now };
    setScanFeedback('Código confirmado.');
    handleBarcodeScanned(code);
  }, [handleBarcodeScanned, scanned, step]);

  // RESET TOTAL AL ENTRAR
  useFocusEffect(
    useCallback(() => {
      resetStore();
      resetForm();
      setCashSale(null);
      setDiscountInput('');
      setTorchOn(false);
      setScanFeedback('Centra el código completo dentro de la guía.');
      pendingScanRef.current = { code: null, count: 0, updatedAt: 0 };
      acceptedScanRef.current = { code: null, updatedAt: 0 };
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
          <View style={styles.scannerStage}>
            <CameraView
              style={StyleSheet.absoluteFill}
              active={step === 'SCANNING'}
              facing="back"
              autofocus="on"
              zoom={0.12}
              enableTorch={isTorchOn}
              onBarcodeScanned={handleStableBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: BARCODE_TYPES,
              }}
            />
            <View style={[styles.overlay, StyleSheet.absoluteFill]}>
              <View style={styles.unfocusedContainer} />
              <View style={styles.scanWindowRow}>
                <View style={styles.unfocusedContainer} />
                <View style={styles.focusedContainer}>
                  <View style={styles.scanLine} />
                </View>
                <View style={styles.unfocusedContainer} />
              </View>
              <View style={styles.unfocusedContainer}>
                <View style={styles.bottomContainer}>
                  <Text style={styles.instructionText}>{scanFeedback}</Text>
                  <Text style={styles.scanTipText}>Escanea con suficiente iluminación y evita sombras sobre la etiqueta.</Text>
                  <TouchableOpacity style={styles.manualProductButton} onPress={openManualProductForm}>
                    <MaterialCommunityIcons name="barcode-off" size={20} color={theme.colors.white} />
                    <Text style={styles.manualProductButtonText}>Crear producto sin escanear</Text>
                  </TouchableOpacity>
                  <View style={styles.scannerActions}>
                    <TouchableOpacity
                      style={[styles.iconActionButton, isTorchOn && styles.iconActionButtonActive]}
                      onPress={() => setTorchOn((current) => !current)}
                      accessibilityRole="button"
                      accessibilityLabel={isTorchOn ? 'Apagar linterna' : 'Encender linterna'}
                    >
                      <MaterialCommunityIcons
                        name={isTorchOn ? 'flashlight' : 'flashlight-off'}
                        size={22}
                        color={isTorchOn ? theme.colors.white : theme.colors.text}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                      <Text style={styles.closeButtonText}>Regresar</Text>
                    </TouchableOpacity>
                  </View>
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
