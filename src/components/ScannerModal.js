import React, { useState, useEffect } from 'react';
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
import { 
  useProductByBarcode, 
  useDepartments, 
  useCategories, 
  useCreateIntelligentProduct
} from '../hooks/useProductScanner';
import { productSchema } from '../services/productService';
import { styles } from './ScannerModal.styles';
import { theme } from '../theme';

export default function ScannerModal({ visible, onClose }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    cost: '',
    stock: '1',
    departmentName: '',
    categoryName: '',
    departmentId: null,
    categoryId: null,
  });

  // UI State for pickers
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState(null);

  // Hooks
  const { data: product, isLoading: isVerifying } = useProductByBarcode(scannedBarcode);
  const { data: departments } = useDepartments();
  const { data: categories } = useCategories(formData.departmentId);
  const { mutate: createProduct, isPending: isSaving } = useCreateIntelligentProduct();

  const checkPermission = async () => {
    try {
      const { status: existingStatus } = await Camera.getCameraPermissionsAsync();
      if (existingStatus === 'granted') {
        setHasPermission(true);
      } else {
        const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(newStatus === 'granted');
      }
    } catch (e) {
      setHasPermission(false);
    }
  };

  useEffect(() => {
    if (visible) {
      resetScanner();
      checkPermission();
    }
  }, [visible]);

  const resetScanner = () => {
    setScanned(false);
    setScannedBarcode(null);
    setErrors({});
    setFormData({
      name: '',
      price: '',
      cost: '',
      stock: '1',
      departmentName: '',
      categoryName: '',
      departmentId: null,
      categoryId: null,
    });
  };

  const handleClose = () => {
    const hasData = formData.name || formData.price || formData.cost || formData.departmentName || formData.categoryName;
    if (scannedBarcode && !product && hasData) {
      Alert.alert(
        'Confirmar salida',
        'Tienes cambios sin guardar. ¿Seguro que quieres salir?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: onClose }
        ]
      );
    } else {
      onClose();
    }
  };

  const handleBarCodeScanned = (result) => {
    if (scanned) return;
    setScanned(true);
    setScannedBarcode(result.data);
  };

  const handleSave = () => {
    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors = {};
      validation.error.issues.forEach(issue => {
        newErrors[issue.path[0]] = issue.message;
      });
      setErrors(newErrors);
      Alert.alert('Error de validación', 'Por favor revisa los campos marcados');
      return;
    }

    const payload = {
      barcode: scannedBarcode,
      name: formData.name,
      price: parseFloat(formData.price),
      cost: formData.cost ? parseFloat(formData.cost) : null,
      stock: parseInt(formData.stock) || 0,
    };

    if (formData.categoryId && formData.categoryId !== 'NEW') {
      payload.categoryId = formData.categoryId;
    } else {
      payload.categoryName = formData.categoryName;
      if (formData.departmentId && formData.departmentId !== 'NEW') {
        payload.departmentId = formData.departmentId;
      } else {
        payload.departmentName = formData.departmentName;
      }
    }

    createProduct(payload, {
      onSuccess: () => {
        Alert.alert('Éxito', 'Producto guardado correctamente');
        onClose();
      },
      onError: (err) => {
        Alert.alert('Error', err.response?.data?.message || 'No se pudo guardar el producto');
      }
    });
  };

  const openPicker = (type) => {
    setPickerType(type);
    setPickerVisible(true);
  };

  const selectItem = (item) => {
    if (pickerType === 'department') {
      if (item === 'NEW') {
        setFormData(prev => ({ ...prev, departmentId: 'NEW', departmentName: '', categoryId: 'NEW', categoryName: '' }));
      } else {
        setFormData(prev => ({ ...prev, departmentId: item.id, departmentName: item.name, categoryId: null, categoryName: '' }));
      }
    } else {
      if (item === 'NEW') {
        setFormData(prev => ({ ...prev, categoryId: 'NEW', categoryName: '' }));
      } else {
        setFormData(prev => ({ ...prev, categoryId: item.id, categoryName: item.name }));
      }
    }
    setPickerVisible(false);
    setErrors(prev => ({ ...prev, categoryId: null }));
  };

  const renderProductFound = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultTitle}>¡Producto Encontrado!</Text>
      <View style={styles.productCard}>
        <Text style={styles.productName}>{product?.name || 'Sin nombre'}</Text>
        <Text style={[styles.productPrice, { color: '#d63384', fontSize: 24 }]}>
          ${typeof product?.price === 'number' ? product.price.toFixed(2) : '0.00'}
        </Text>
        {!!product?.cost && (
          <Text style={[styles.productInfo, { color: theme.colors.textSecondary, fontSize: 12, opacity: 0.6 }]}>
            Precio Compra: ${typeof product.cost === 'number' ? product.cost.toFixed(2) : product.cost}
          </Text>
        )}
        <View style={{ marginTop: 10, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 }}>
          <Text style={styles.productInfo}>Código: {product?.barcode || 'N/A'}</Text>
          <Text style={styles.productInfo}>Stock: {product?.stock ?? 0} pz</Text>
          <Text style={styles.productInfo}>
            {product?.category?.department?.name || 'N/A'} › {product?.category?.name || 'N/A'}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={onClose}>
        <Text style={styles.saveButtonText}>Cerrar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
        <Text style={styles.resetButtonText}>Escanear otro</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNewProductForm = () => (
    <ScrollView style={styles.resultsContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.resultTitle}>Nuevo Producto</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Código de Barras</Text>
          <TextInput style={[styles.input, { backgroundColor: '#f0f0f0' }]} value={scannedBarcode} editable={false} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput 
            style={[styles.input, errors.name && { borderColor: '#ff4444' }]} 
            placeholder="Ej. Playera de Algodón" 
            value={formData.name}
            onChangeText={(val) => {
              setFormData(p => ({ ...p, name: val }));
              if (errors.name) setErrors(p => ({ ...p, name: null }));
            }}
          />
          {errors.name && <Text style={{ color: '#ff4444', fontSize: 11, marginTop: 2 }}>{errors.name}</Text>}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Precio Venta *</Text>
            <TextInput 
              style={[styles.input, errors.price && { borderColor: '#ff4444' }]} 
              placeholder="0.00" 
              keyboardType="decimal-pad"
              value={formData.price}
              onChangeText={(val) => {
                setFormData(p => ({ ...p, price: val }));
                if (errors.price) setErrors(p => ({ ...p, price: null }));
              }}
            />
            {errors.price && <Text style={{ color: '#ff4444', fontSize: 11, marginTop: 2 }}>{errors.price}</Text>}
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Precio Compra</Text>
            <TextInput 
              style={[styles.input, errors.cost && { borderColor: '#ff4444' }]} 
              placeholder="0.00" 
              keyboardType="decimal-pad"
              value={formData.cost}
              onChangeText={(val) => {
                setFormData(p => ({ ...p, cost: val }));
                if (errors.cost) setErrors(p => ({ ...p, cost: null }));
              }}
            />
            {errors.cost && <Text style={{ color: '#ff4444', fontSize: 11, marginTop: 2 }}>{errors.cost}</Text>}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stock Inicial</Text>
          <TextInput 
            style={[styles.input, errors.stock && { borderColor: '#ff4444' }]} 
            placeholder="1" 
            keyboardType="number-pad"
            value={formData.stock}
            onChangeText={(val) => {
              setFormData(p => ({ ...p, stock: val }));
              if (errors.stock) setErrors(p => ({ ...p, stock: null }));
            }}
          />
        </View>

        {/* Sección de Departamento */}
        <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
             <Text style={styles.label}>Departamento *</Text>
             {formData.departmentId === 'NEW' && (
               <TouchableOpacity onPress={() => setFormData(p => ({ ...p, departmentId: null, departmentName: '', categoryId: null, categoryName: '' }))}>
                 <Text style={{ color: '#ff4444', fontSize: 12 }}>Regresar a lista</Text>
               </TouchableOpacity>
             )}
          </View>
          
          {formData.departmentId === 'NEW' ? (
             <TextInput 
                style={[styles.input, { borderColor: theme.colors.primary }]} 
                placeholder="Nombre del nuevo departamento" 
                autoFocus
                value={formData.departmentName}
                onChangeText={(val) => setFormData(p => ({ ...p, departmentName: val }))}
             />
          ) : (
            <TouchableOpacity 
              style={[styles.selectButton, errors.categoryId && !formData.departmentId && { borderColor: '#ff4444' }]} 
              onPress={() => openPicker('department')}
            >
              <Text style={styles.selectButtonText}>
                {formData.departmentId ? formData.departmentName : 'Seleccionar departamento...'}
              </Text>
              <Text style={{ color: theme.colors.primary }}>▼</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sección de Categoría */}
        <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
             <Text style={styles.label}>Categoría *</Text>
             {formData.categoryId === 'NEW' && (
               <TouchableOpacity onPress={() => setFormData(p => ({ ...p, categoryId: null, categoryName: '' }))}>
                 <Text style={{ color: '#ff4444', fontSize: 12 }}>Regresar a lista</Text>
               </TouchableOpacity>
             )}
          </View>

          {formData.categoryId === 'NEW' ? (
             <TextInput 
                style={[styles.input, { borderColor: theme.colors.primary }]} 
                placeholder="Nombre de la nueva categoría" 
                autoFocus
                value={formData.categoryName}
                onChangeText={(val) => setFormData(p => ({ ...p, categoryName: val }))}
             />
          ) : (
            <TouchableOpacity 
              style={[styles.selectButton, errors.categoryId && { borderColor: '#ff4444' }]} 
              onPress={() => openPicker('category')}
            >
              <Text style={styles.selectButtonText}>
                {formData.categoryId ? formData.categoryName : 'Seleccionar categoría...'}
              </Text>
              <Text style={{ color: theme.colors.primary }}>▼</Text>
            </TouchableOpacity>
          )}
          {errors.categoryId && <Text style={{ color: '#ff4444', fontSize: 11, marginTop: 2 }}>{errors.categoryId}</Text>}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Producto</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
          <Text style={styles.resetButtonText}>Cancelar y volver a escanear</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPickerModal = () => {
    const data = pickerType === 'department' ? departments : categories;
    const items = [{ id: 'NEW', name: '+ Crear Nuevo' }, ...(data || [])];

    return (
      <Modal visible={pickerVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 15, maxHeight: '80%' }}>
            <View style={{ padding: 15, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Seleccionar {pickerType === 'department' ? 'Depto' : 'Cat'}</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id?.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={{ padding: 15, borderBottomWidth: 1, borderColor: '#f0f0f0' }}
                  onPress={() => selectItem(item)}
                >
                  <Text style={{ color: item.id === 'NEW' ? theme.colors.primary : '#333', fontWeight: item.id === 'NEW' ? 'bold' : 'normal' }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {scannedBarcode ? (
          <View style={{ flex: 1 }}>
            {isVerifying ? (
              <View style={[styles.loadingContainer, { flex: 1 }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 15, color: theme.colors.textSecondary }}>Verificando código...</Text>
              </View>
            ) : (
              <>
                {product ? renderProductFound() : renderNewProductForm()}
              </>
            )}
            {renderPickerModal()}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {hasPermission === false ? (
              <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>No tenemos acceso a la cámara.</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={checkPermission}>
                  <Text style={styles.permissionButtonText}>Intentar de nuevo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.closeButton, { marginTop: 20 }]} onPress={handleClose}>
                  <Text style={styles.closeButtonText}>Regresar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <CameraView
                  style={StyleSheet.absoluteFill}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean13", "ean8", "code128", "upc_a"],
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
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
