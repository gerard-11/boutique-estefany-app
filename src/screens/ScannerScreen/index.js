import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  BackHandler,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useScannerStore } from '../../hooks/useScannerStore';
import { useScannerHandlers } from '../../hooks/useScannerHandlers';
import { useProductActionFlow } from '../../hooks/useProductActionFlow';
import {
  useProductByBarcode,
  useDepartmentsData
} from '../../hooks/useProductScanner';
import { productSchema } from '../../services/productService';
import { styles } from './ScannerScreen.styles';
import { theme } from '../../theme';

// Componentes Modulares
import { ProductFound } from './components/ProductFound';
import { NewProductForm } from './components/NewProductForm';
import { CategoryPickerModal } from './components/CategoryPickerModal';
import { ClientPickerModal } from './components/ClientPickerModal';
import { ProductCashSaleModal } from '../../components/ProductCashSaleModal';

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

export default function ScannerScreen({ navigation }) {
  // --- Zustand Store ---
  const {
    step, barcode, scanned, picker, handleBarcodeScanned, openManualProductForm, reset: resetStore,
    closePicker, openPicker
  } = useScannerStore();

  const [isTorchOn, setTorchOn] = useState(false);
  const [scanFeedback, setScanFeedback] = useState('Centra el código completo dentro de la guía.');
  const pendingScanRef = useRef({ code: null, count: 0, updatedAt: 0 });
  const acceptedScanRef = useRef({ code: null, updatedAt: 0 });

  // --- Data Hooks ---
  const { data: product, isLoading: isVerifying } = useProductByBarcode(barcode);
  const { data: departmentsData } = useDepartmentsData();
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
    handleSaveProduct,
    handleSelectPickerItem,
    handleCancel
  } = useScannerHandlers(navigation, resetForm, setValue);

  const productForActions = useMemo(() => {
    if (!product || product.barcode || !barcode) return product;
    return { ...product, barcode };
  }, [product, barcode]);

  const productActionFlow = useProductActionFlow({
    product: productForActions,
    transactionSuccessMessage: 'Transacción completada',
    onTransactionSuccess: () => navigation.goBack(),
    onReturnSuccess: () => resetStore(),
  });

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
                  onReset={() => { resetStore(); resetForm(); }}
                  onSelectAction={productActionFlow.handleProductAction}
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
    </FormProvider>
  );
}
