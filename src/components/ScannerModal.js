import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  FlatList
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { 
  useProductByBarcode, 
  useDepartments, 
  useCategories, 
  useCreateIntelligentProduct 
} from '../hooks/useProductScanner';
import { styles } from './ScannerModal.styles';
import { theme } from '../theme';

export default function ScannerModal({ visible, onClose }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '1',
    departmentName: '',
    categoryName: '',
    departmentId: null,
    categoryId: null,
  });

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState(null);

  // Hooks
  const { data: product, isLoading: isVerifying, isError: verifyError, refetch: refetchProduct } = useProductByBarcode(scannedBarcode);
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: categories, isLoading: loadingCats } = useCategories(formData.departmentId);
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
    setFormData({
      name: '',
      price: '',
      stock: '1',
      departmentName: '',
      categoryName: '',
      departmentId: null,
      categoryId: null,
    });
  };

  const handleBarCodeScanned = (result) => {
    if (scanned) return;
    setScanned(true);
    setScannedBarcode(result.data);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || (!formData.categoryId && !formData.categoryName)) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios (Nombre, Precio y Categoría)');
      return;
    }
    const payload = {
      barcode: scannedBarcode,
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0,
    };
    if (formData.categoryId) {
      payload.categoryId = formData.categoryId;
    } else {
      payload.departmentName = formData.departmentName;
      payload.categoryName = formData.categoryName;
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
    if (type === 'category' && !formData.departmentId) {
      Alert.alert('Aviso', 'Selecciona primero un departamento');
      return;
    }
    setPickerType(type);
    setPickerVisible(true);
  };

  const selectItem = (item) => {
    if (pickerType === 'department') {
      if (item === 'NEW') {
        setFormData(prev => ({ ...prev, departmentId: null, departmentName: '', categoryId: null, categoryName: '' }));
      } else {
        setFormData(prev => ({ ...prev, departmentId: item.id, departmentName: item.name, categoryId: null, categoryName: '' }));
      }
    } else {
      if (item === 'NEW') {
        setFormData(prev => ({ ...prev, categoryId: null, categoryName: '' }));
      } else {
        setFormData(prev => ({ ...prev, categoryId: item.id, categoryName: item.name }));
      }
    }
    setPickerVisible(false);
  };

  const renderProductFound = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultTitle}>¡Producto Encontrado!</Text>
      <View style={styles.productCard}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
        <Text style={styles.productInfo}>Código: {product.barcode}</Text>
        <Text style={styles.productInfo}>Stock actual: {product.stock}</Text>
        <Text style={styles.productInfo}>
          Depto: {product.category?.department?.name || 'N/A'} - Cat: {product.category?.name || 'N/A'}
        </Text>
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
            style={styles.input} 
            placeholder="Ej. Playera de Algodón" 
            value={formData.name}
            onChangeText={(val) => setFormData(p => ({ ...p, name: val }))}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Precio *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0.00" 
              keyboardType="decimal-pad"
              value={formData.price}
              onChangeText={(val) => setFormData(p => ({ ...p, price: val }))}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Stock Inicial</Text>
            <TextInput 
              style={styles.input} 
              placeholder="1" 
              keyboardType="number-pad"
              value={formData.stock}
              onChangeText={(val) => setFormData(p => ({ ...p, stock: val }))}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Departamento *</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => openPicker('department')}>
            <Text style={styles.selectButtonText}>
              {formData.departmentId ? formData.departmentName : (formData.departmentName || 'Seleccionar...')}
            </Text>
            <Text style={{ color: theme.colors.primary }}>▼</Text>
          </TouchableOpacity>
          {!formData.departmentId && (
             <TextInput 
                style={[styles.input, { marginTop: 5 }]} 
                placeholder="Nombre del nuevo departamento" 
                value={formData.departmentName}
                onChangeText={(val) => setFormData(p => ({ ...p, departmentName: val }))}
             />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoría *</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => openPicker('category')}>
            <Text style={styles.selectButtonText}>
              {formData.categoryId ? formData.categoryName : (formData.categoryName || 'Seleccionar...')}
            </Text>
            <Text style={{ color: theme.colors.primary }}>▼</Text>
          </TouchableOpacity>
          {!formData.categoryId && (
             <TextInput 
                style={[styles.input, { marginTop: 5 }]} 
                placeholder="Nombre de la nueva categoría" 
                value={formData.categoryName}
                onChangeText={(val) => setFormData(p => ({ ...p, categoryName: val }))}
             />
          )}
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
              keyExtractor={(item) => item.id.toString()}
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
      onRequestClose={onClose}
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
          <>
            {hasPermission === false ? (
              <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>No tenemos acceso a la cámara.</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={checkPermission}>
                  <Text style={styles.permissionButtonText}>Intentar de nuevo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.closeButton, { marginTop: 20 }]} onPress={onClose}>
                  <Text style={styles.closeButtonText}>Regresar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "ean13", "ean8", "code128", "upc_a"],
                }}
              >
                <View style={styles.overlay}>
                  <View style={styles.unfocusedContainer} />
                  <View style={{ flexDirection: 'row' }}>
                    <View style={styles.unfocusedContainer} />
                    <View style={styles.focusedContainer} />
                    <View style={styles.unfocusedContainer} />
                  </View>
                  <View style={styles.unfocusedContainer}>
                    <View style={styles.bottomContainer}>
                      <Text style={styles.instructionText}>Enfoca el código de barras</Text>
                      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </CameraView>
            )}
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}
