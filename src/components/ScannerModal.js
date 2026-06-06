import React, { useEffect, useMemo, useReducer } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  useProductByBarcode, 
  useDepartmentsData, 
  useCreateIntelligentProduct,
  useAdjustStock,
  useSearchUsers,
  useCreateTransaction,
  useReturnProduct
} from '../hooks/useProductScanner';
import { productSchema } from '../services/productService';
import { styles } from './ScannerModal.styles';
import { theme } from '../theme';
import { initialState, scannerReducer } from './ScannerModal.reducer';

export default function ScannerModal({ visible, onClose }) {
  const [state, dispatch] = useReducer(scannerReducer, initialState);
  const {step, barcode, scanned, picker, showClientPicker, transactionType, userSearch} = state;
  
  const { data: product, isLoading: isVerifying } = useProductByBarcode(barcode);
  const { data: departmentsData } = useDepartmentsData();
  const { mutate: createProduct, isPending: isSaving } = useCreateIntelligentProduct();
  const { mutate: adjustStock } = useAdjustStock();
  const { mutate: createTransaction } = useCreateTransaction();
  const { mutate: returnProduct } = useReturnProduct();
  const { data: clients, isLoading: isSearchingClients } = useSearchUsers(userSearch);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
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
const targets = [
              { type: 'SALE', icon: 'cart-arrow-down', label: 'VENDER', color: theme.colors.primary },
              { type: 'PRESTAMO', icon: 'hand-heart', label: 'PRESTAR', color: '#339af0' },
              { type: 'APARTADO', icon: 'bookmark-check', label: 'APARTAR', color: '#fcc419' }
            ]
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

  useEffect(() => {
    if (visible) {
      dispatch({ type: 'RESET' });
      reset();
      checkPermission();
    }
  }, [visible]);

  const checkPermission = async () => {
    const { status } = await Camera.getCameraPermissionsAsync();
    if (status !== 'granted') {
      await Camera.requestCameraPermissionsAsync();
    }
  };

  const handleBarCodeScanned = (result) => {
    if (scanned) return;
    dispatch({ type: 'BARCODE_SCANNED', payload: result.data });
  };

  const handleClose = () => {
    onClose();
  };

  const onSave = (data) => {
    const payload = {
      barcode,
      ...data,
      price: parseFloat(data.price),
      cost: parseFloat(data.cost),
      stock: parseInt(data.stock) || 0,
    };

    if (payload.departmentId === 'NEW' || !payload.departmentId) delete payload.departmentId;
    if (payload.categoryId === 'NEW' || !payload.categoryId) delete payload.categoryId;

    createProduct(payload, {
      onSuccess: () => {
        Alert.alert('Éxito', 'Producto guardado correctamente');
        onClose();
      },
      onError: (error) => {
        Alert.alert('Error', error?.response?.data?.message?.[0] || error.message);
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

  // --- Transaction Handlers (Sin cambios significativos) ---
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
        onClose();
      }
    });
  };

  // --- RENDERS ---

  const renderActionGrid = () => {
    const status = product?.inventoryStatus?.status || 'AVAILABLE';
    const isAvailable = status === 'AVAILABLE';
    const isBusy = status === 'PRESTAMO' || status === 'APARTADO';

    return (
      <View style={styles.actionsGrid}>
        {isBusy && (
          <View style={styles.statusBanner}>
            <MaterialCommunityIcons name="alert-circle" color="#fd7e14" size={20} />
            <Text style={styles.statusText}>Ocupado por: {product?.inventoryStatus?.assignedTo?.name} ({status})</Text>
          </View>
        )}
        {isAvailable && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {targets.map(item => (
              <TouchableOpacity key={item.type} style={styles.actionButton} onPress={() => dispatch({ type: 'SET_TRANSACTION', payload: item.type })}>
                <MaterialCommunityIcons name={item.icon} color={item.color} size={32} />
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.actionButton} onPress={handleStockAdjustment}>
              <MaterialCommunityIcons name="plus-box-multiple" color="#51cf66" size={32} />
              <Text style={styles.actionLabel}>STOCK (+)</Text>
            </TouchableOpacity>
          </View>
        )}
        {isBusy && (
          <TouchableOpacity style={[styles.actionButton, styles.returnButton]} onPress={handleReturn}>
            <MaterialCommunityIcons name="keyboard-return" color="#fa5252" size={32} />
            <Text style={[styles.actionLabel, styles.returnText]}>DEVOLUCIÓN</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderNewProductForm = () => (
    <ScrollView style={styles.resultsContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.resultTitle}>Nuevo Producto</Text>
      <View style={styles.form}>
        <TextInput style={[styles.input, { backgroundColor: '#f0f0f0' }]} value={barcode} editable={false} />
        
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput 
                style={[styles.input, errors.name && { borderColor: '#ff4444' }]} 
                placeholder="Nombre *" 
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
            </View>
          )}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="cost"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={[styles.input, errors.cost && { borderColor: '#ff4444' }]} 
                  placeholder="Costo *" 
                  keyboardType="decimal-pad"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={[styles.input, errors.price && { borderColor: '#ff4444' }]} 
                  placeholder="Precio *" 
                  keyboardType="decimal-pad"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Controller
            control={control}
            name="size"
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { flex: 1.5 }]} placeholder="Talla" onChangeText={onChange} value={value} />
            )}
          />
          <Controller
            control={control}
            name="sizeUnit"
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Unidad" onChangeText={onChange} value={value} />
            )}
          />
          <Controller
            control={control}
            name="color"
            render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { flex: 1.5 }]} placeholder="Color" onChangeText={onChange} value={value} />
            )}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stock Inicial</Text>
          <Controller
            control={control}
            name="stock"
            render={({ field: { onChange, value } }) => (
              <TextInput 
                style={[styles.input, errors.stock && { borderColor: '#ff4444' }]} 
                placeholder="1" 
                keyboardType="number-pad"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Departamento</Text>
          <TouchableOpacity 
            style={[styles.selectButton, watchDeptId === 'NEW' && { borderColor: theme.colors.primary, borderWidth: 1 }]} 
            onPress={() => dispatch({ type: 'OPEN_PICKER', payload: 'department' })}
          >
            <Text style={{ color: watchDeptId ? '#000' : '#999' }}>
              {watchDeptId === 'NEW' ? '+ Nuevo Departamento' : (watchDeptName || 'Seleccionar departamento...')}
            </Text>
          </TouchableOpacity>
          
          {watchDeptId === 'NEW' && (
            <Controller
              control={control}
              name="departmentName"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={[styles.input, { marginTop: 5, borderColor: theme.colors.primary }]} 
                  placeholder="Escribe el nombre del departamento *" 
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoría</Text>
          <TouchableOpacity 
            style={[styles.selectButton, watchCatId === 'NEW' && { borderColor: theme.colors.primary, borderWidth: 1 }]} 
            onPress={() => dispatch({ type: 'OPEN_PICKER', payload: 'category' })}
            disabled={!watchDeptId}
          >
            <Text style={{ color: watchCatId ? '#000' : (watchDeptId ? '#999' : '#ccc') }}>
              {watchCatId === 'NEW' ? '+ Nueva Categoría' : (watchCatName || 'Seleccionar categoría...')}
            </Text>
          </TouchableOpacity>

          {watchCatId === 'NEW' && (
            <Controller
              control={control}
              name="categoryName"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={[styles.input, { marginTop: 5, borderColor: theme.colors.primary }]} 
                  placeholder="Escribe el nombre de la categoría *" 
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          )}
          {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId.message}</Text>}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(onSave)}>
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Guardar Producto</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={() => { dispatch({ type: 'RESET' }); reset(); }}>
          <Text style={styles.resetButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProductFound = () => (
    <ScrollView style={styles.resultsContainer}>
      <Text style={styles.resultTitle}>Producto Escaneado</Text>
      <View style={styles.productCard}>
        <Text style={styles.productName}>{product?.name}</Text>
        <Text style={styles.productPrice}>${product?.price?.toFixed(2)}</Text>
        <Text style={styles.productInfo}>Stock: {product?.stock} pz | {product?.category?.name}</Text>
      </View>
      {renderActionGrid()}
      <TouchableOpacity style={styles.resetButton} onPress={() => dispatch({ type: 'RESET' })}>
        <Text style={styles.resetButtonText}>Escanear otro</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        {!barcode ? (
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
                  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Text style={styles.closeButtonText}>Cancelar</Text>
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
              product ? renderProductFound() : renderNewProductForm()
            )}
          </View>
        )}

        {/* Picker Modal */}
        <Modal visible={picker.visible} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <FlatList
                data={[{ id: 'NEW', name: '+ Crear Nuevo' }, ...(picker.type === 'department' ? departmentsData : availableCategories)]}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={{ padding: 15, borderBottomWidth: 1, borderColor: '#eee' }}
                    onPress={() => handleSelectPickerItem(item)}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id.toString()}
              />
              <TouchableOpacity onPress={() => dispatch({ type: 'CLOSE_PICKER' })}>
                <Text style={{ textAlign: 'center', marginTop: 10, color: theme.colors.primary }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Client Picker Modal */}
        <Modal visible={showClientPicker} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
             <View style={{ backgroundColor: '#fff', padding: 20, height: '70%', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
                <TextInput 
                  placeholder="Buscar cliente..." 
                  style={styles.input} 
                  value={userSearch}
                  onChangeText={(val) => dispatch({ type: 'UPDATE_USER_SEARCH', payload: val })}
                />
                <FlatList
                  data={clients}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.clientItem} onPress={() => onSelectClient(item)}>
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity onPress={() => dispatch({ type: 'CLOSE_CLIENT_PICKER' })}>
                   <Text style={{ textAlign: 'center', color: 'red' }}>Cancelar</Text>
                </TouchableOpacity>
             </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}
