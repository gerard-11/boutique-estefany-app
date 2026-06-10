import React, { useEffect, useMemo, useReducer, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  StyleSheet,
  Keyboard,
  BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, Camera } from 'expo-camera';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  useProductByBarcode, 
  useDepartmentsData, 
  useCreateIntelligentProduct,
  useAdjustStock,
  useSearchUsers,
  useCreateTransaction,
  useReturnProduct
} from '../../hooks/useProductScanner';
import { productSchema } from '../../services/productService';
import { styles } from './ScannerScreen.styles';
import { theme } from '../../theme';
import { initialState, scannerReducer } from './ScannerScreen.reducer';

// Componentes Modulares
import { ProductFound } from './components/ProductFound';
import { NewProductForm } from './components/NewProductForm';
import { ScannerPickers } from './components/ScannerPickers';

export default function ScannerScreen({ navigation }) {
  const [state, dispatch] = useReducer(scannerReducer, initialState);
  const {step, barcode, scanned, picker, showClientPicker, transactionType, userSearch} = state;
  
  const { data: product, isLoading: isVerifying } = useProductByBarcode(barcode);
  const { data: departmentsData } = useDepartmentsData();
  const { mutate: createProduct, isPending: isSaving } = useCreateIntelligentProduct();
  const { mutate: adjustStock } = useAdjustStock();
  const { mutate: createTransaction } = useCreateTransaction();
  const { mutate: returnProduct } = useReturnProduct();
  const { data: clients, isLoading: isSearchingClients } = useSearchUsers(userSearch);

  const methods = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      cost: '',
      stock: '1',
      size: '',
      sizeUnit: '',
      color: '',
      departmentName: '',
      categoryName: '',
      departmentId: null,
      categoryId: null,
    }
  });

  const { reset, setValue, watch, formState: { isDirty } } = methods;

  // RESET TOTAL AL ENTRAR: Evita que se queden datos de escaneos anteriores
  useFocusEffect(
    useCallback(() => {
      dispatch({ type: 'RESET' });
      reset();
    }, [reset])
  );

  const targets = useMemo(() => [
    { type: 'SALE', icon: 'cart-arrow-down', label: 'VENDER', color: theme.colors.primary },
    { type: 'PRESTAMO', icon: 'hand-heart', label: 'PRESTAR', color: '#339af0' },
    { type: 'APARTADO', icon: 'bookmark-check', label: 'APARTAR', color: '#fcc419' }
  ], []);

  const watchDeptId = watch('departmentId');
  const watchCatId = watch('categoryId');
  const watchDeptName = watch('departmentName');
  const watchCatName = watch('categoryName');

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
      const isNewForm = step === 'NEW_FORM';
      const hasBarcode = !!barcode;

      // Si el teclado está abierto, primero lo bajamos (Experiencia de usuario solicitada)
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
        e.preventDefault();
        return;
      }

      // BLOQUEO AGRESIVO: Si hay cambios O estamos en un formulario de nuevo producto
      if (isDirty || isNewForm || hasBarcode) {
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
      // Si el teclado está abierto, lo bajamos y bloqueamos la salida
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
        return true;
      }

      // Si no estamos en el paso inicial de escaneo, dejamos que 'beforeRemove' maneje la alerta
      // pero devolvemos true para que el sistema no cierre la app/pantalla de golpe
      if (step !== 'SCANNING' || isDirty) {
        navigation.goBack(); // Esto disparará 'beforeRemove'
        return true;
      }

      return false; // Permite el comportamiento por defecto si estamos en la cámara sin datos
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation, isDirty, step]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Cambios sin guardar',
        '¿Deseas cancelar el registro actual?',
        [
          { text: 'No', style: 'cancel' },
          { 
            text: 'Sí', 
            onPress: () => {
              dispatch({ type: 'RESET' });
              reset();
            } 
          }
        ]
      );
    } else {
      dispatch({ type: 'RESET' });
      reset();
    }
  }, [isDirty, reset]);

  const handleBarCodeScanned = (result) => {
    if (scanned) return;
    dispatch({ type: 'BARCODE_SCANNED', payload: result.data });
  };

  const onSave = (data) => {
    const payload = {
      barcode,
      name: data.name?.trim(),
      price: parseFloat(data.price),
      cost: parseFloat(data.cost),
      stock: parseInt(data.stock) || 0,
    };

    if (data.size?.trim()) payload.size = data.size.trim();
    if (data.sizeUnit?.trim()) payload.sizeUnit = data.sizeUnit.trim();
    if (data.color?.trim()) payload.color = data.color.trim();

    if (data.categoryId && data.categoryId !== 'NEW') {
      payload.categoryId = data.categoryId;
    } else {
      if (data.categoryName?.trim()) payload.categoryName = data.categoryName.trim();
      if (data.departmentName?.trim()) payload.departmentName = data.departmentName.trim();
    }

    createProduct(payload, {
      onSuccess: () => {
        Alert.alert('Éxito', 'Producto guardado correctamente');
        navigation.goBack();
      },
      onError: (error) => {
        const serverError = error?.response?.data;
        const errorMessage = Array.isArray(serverError?.message) ? serverError.message.join('\n') : serverError?.message || error.message;
        Alert.alert('Error de Validación', errorMessage);
      }
    });
  };

  const handleSelectPickerItem = (item) => {
    const type = picker.type;
    if (type === 'department') {
      if (item.id === 'NEW') {
        setValue('departmentId', 'NEW');
        setValue('departmentName', '');
        setValue('categoryId', 'NEW');
        setValue('categoryName', '');
      } else {
        setValue('departmentId', item.id);
        setValue('departmentName', item.name);
        setValue('categoryId', null);
        setValue('categoryName', '');
      }
    } else {
      if (item.id === 'NEW') {
        setValue('categoryId', 'NEW');
        setValue('categoryName', '');
      } else {
        setValue('categoryId', item.id);
        setValue('categoryName', item.name);
        if (item.parentDeptId) {
          setValue('departmentId', item.parentDeptId);
          setValue('departmentName', item.parentDeptName);
        }
      }
    }
    dispatch({ type: 'CLOSE_PICKER' });
  };

  const handleReturn = () => {
    Alert.alert('Devolución', '¿Liberar esta prenda?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí', onPress: () => returnProduct(barcode, { onSuccess: () => dispatch({ type: 'RESET' }) }) }
    ]);
  };

  const handleStockAdjustment = () => {
    Alert.prompt('Stock (+)', '¿Cuántas piezas entran?', [
      { text: 'Cancelar' },
      { text: 'Guardar', onPress: (val) => adjustStock({ id: product.id, amount: parseInt(val) }) }
    ], 'plain-text', '1');
  };

  const onSelectClient = (client) => {
    createTransaction({
      userId: client.id,
      type: transactionType,
      productBarcodes: [barcode]
    }, {
      onSuccess: () => {
        Alert.alert('Éxito', 'Transacción completada');
        navigation.goBack();
      }
    });
  };

  return (
    <FormProvider {...methods}>
      <SafeAreaView style={styles.container}>
        {(!barcode || step === 'SCANNING') ? (
          <View style={{ flex: 1 }}>
            <CameraView 
              style={StyleSheet.absoluteFill} 
              onBarcodeScanned={handleBarCodeScanned} 
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
                  targets={targets}
                  onTransaction={(type) => dispatch({ type: 'SET_TRANSACTION', payload: type })}
                  onStockAdjustment={handleStockAdjustment}
                  onReturn={handleReturn}
                  onReset={() => { dispatch({ type: 'RESET' }); reset(); }}
                />
              ) : (
                <NewProductForm 
                  barcode={barcode}
                  isSaving={isSaving}
                  onSave={onSave}
                  onCancel={handleCancel}
                  onOpenPicker={(type) => dispatch({ type: 'OPEN_PICKER', payload: type })}
                  watchDeptId={watchDeptId}
                  watchCatId={watchCatId}
                  watchDeptName={watchDeptName}
                  watchCatName={watchCatName}
                />
              )
            )}
          </View>
        )}

        <ScannerPickers 
          picker={picker}
          departmentsData={departmentsData}
          availableCategories={availableCategories}
          showClientPicker={showClientPicker}
          userSearch={userSearch}
          clients={clients}
          onClosePicker={() => dispatch({ type: 'CLOSE_PICKER' })}
          onSelectItem={handleSelectPickerItem}
          onUpdateUserSearch={(val) => dispatch({ type: 'UPDATE_USER_SEARCH', payload: val })}
          onSelectClient={onSelectClient}
          onCloseClientPicker={() => dispatch({ type: 'CLOSE_CLIENT_PICKER' })}
        />
      </SafeAreaView>
    </FormProvider>
  );
}
