import React, { useEffect, useMemo, useCallback } from 'react';
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
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useScannerStore } from '../../hooks/useScannerStore';
import { useScannerHandlers } from '../../hooks/useScannerHandlers';
import { 
  useProductByBarcode, 
  useDepartmentsData, 
  useSearchUsers 
} from '../../hooks/useProductScanner';
import { productSchema } from '../../services/productService';
import { styles } from './ScannerScreen.styles';
import { theme } from '../../theme';

// Componentes Modulares
import { ProductFound } from './components/ProductFound';
import { NewProductForm } from './components/NewProductForm';
import { ScannerPickers } from './components/ScannerPickers';
import { StockAdjustmentModal } from './components/StockAdjustmentModal';

export default function ScannerScreen({ navigation }) {
  // --- Zustand Store ---
  const {
    step, barcode, scanned, picker, showClientPicker, 
    userSearch, showStockModal, handleBarcodeScanned, reset: resetStore,
    closePicker, openPicker, closeClientPicker, updateUserSearch
  } = useScannerStore();

  // --- Data Hooks ---
  const { data: product, isLoading: isVerifying } = useProductByBarcode(barcode);
  const { data: departmentsData } = useDepartmentsData();
  const { data: clients } = useSearchUsers(userSearch);

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
    handleStockAdjustment,
    handleReturn,
    handleSelectClient,
    handleSelectPickerItem,
    handleCancel
  } = useScannerHandlers(navigation, resetForm, setValue);

  // RESET TOTAL AL ENTRAR
  useFocusEffect(
    useCallback(() => {
      resetStore();
      resetForm();
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

      if (isDirty || step === 'NEW_FORM' || barcode) {
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
  }, [navigation, isDirty, step, barcode]);

  useEffect(() => {
    const backAction = () => {
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
        return true;
      }
      if (step !== 'SCANNING' || isDirty) {
        navigation.goBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation, isDirty, step]);

  return (
    <FormProvider {...methods}>
      <SafeAreaView style={styles.container}>
        {(step === 'SCANNING') ? (
          <View style={{ flex: 1 }}>
            <CameraView 
              style={StyleSheet.absoluteFill} 
              onBarcodeScanned={(result) => !scanned && handleBarcodeScanned(result.data)} 
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "code128", "upc_a"]
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
                />
              ) : (
                <NewProductForm 
                  barcode={barcode}
                  isSaving={isSaving}
                  onSave={handleSaveProduct}
                  onCancel={() => handleCancel(isDirty)}
                  onOpenPicker={openPicker}
                />
              )
            )}
          </View>
        )}

        <StockAdjustmentModal 
          visible={showStockModal}
          product={product}
          onClose={() => useScannerStore.getState().closeStockModal()}
          onConfirm={(data) => handleStockAdjustment(product, data)}
        />

        <ScannerPickers 
          picker={picker}
          departmentsData={departmentsData}
          availableCategories={availableCategories}
          showClientPicker={showClientPicker}
          userSearch={userSearch}
          clients={clients}
          onClosePicker={closePicker}
          onSelectItem={(item) => handleSelectPickerItem(item, picker.type)}
          onUpdateUserSearch={updateUserSearch}
          onSelectClient={handleSelectClient}
          onCloseClientPicker={closeClientPicker}
        />
      </SafeAreaView>
    </FormProvider>
  );
}
