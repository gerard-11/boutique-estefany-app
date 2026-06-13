import { Alert } from 'react-native';
import { useScannerStore } from './useScannerStore';
import { 
  useCreateIntelligentProduct,
  useAdjustStock,
  useCreateTransaction,
  useReturnProduct
} from './useProductScanner';

export const useScannerHandlers = (navigation, resetForm, setValue) => {
  const { 
    barcode, 
    transactionType, 
    reset: resetStore,
    closeStockModal,
    closeClientPicker
  } = useScannerStore();

  const { mutate: createProduct, isPending: isSaving } = useCreateIntelligentProduct();
  const { mutate: createTransaction } = useCreateTransaction();
  const { mutate: returnProduct } = useReturnProduct();

  const handleSaveProduct = (data) => {
    const payload = {
      barcode,
      name: data.name?.trim(),
      price: parseFloat(data.price),
      cost: parseFloat(data.cost),
      stock: 1, // Siempre 1 en el nuevo modelo
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
        const errorMessage = Array.isArray(serverError?.message) 
          ? serverError.message.join('\n') 
          : serverError?.message || error.message;
        Alert.alert('Error de Validación', String(errorMessage));
      }
    });
  };

  const handleReturn = () => {
    Alert.alert('Devolución', '¿Liberar esta prenda?', [
      { text: 'No', style: 'cancel' },
      { 
        text: 'Sí', 
        onPress: () => returnProduct(barcode, { 
          onSuccess: () => resetStore() 
        }) 
      }
    ]);
  };

  const handleSelectClient = (client) => {
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

  const handleSelectPickerItem = (item, pickerType) => {
    if (pickerType === 'department') {
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
  };

  const handleCancel = (isDirty) => {
    if (isDirty) {
      Alert.alert(
        'Cambios sin guardar',
        '¿Deseas cancelar el registro actual?',
        [
          { text: 'No', style: 'cancel' },
          { 
            text: 'Sí', 
            onPress: () => {
              resetStore();
              resetForm();
            } 
          }
        ]
      );
    } else {
      resetStore();
      resetForm();
    }
  };

  return {
    isSaving,
    handleSaveProduct,
    handleReturn,
    handleSelectClient,
    handleSelectPickerItem,
    handleCancel
  };
};
