import { Alert } from 'react-native';
import { useScannerStore } from './useScannerStore';
import {
  useCreateIntelligentProduct,
  useCreateTransaction,
  useReturnProduct
} from './useProductScanner';

export const useScannerHandlers = (navigation, resetForm, setValue) => {
  const {
    barcode,
    transactionType,
    reset: resetStore,
    closeClientPicker
  } = useScannerStore();

  const { mutate: createProduct, isPending: isSaving } = useCreateIntelligentProduct();
  const { mutate: createTransaction, isPending: isCreatingTransaction } = useCreateTransaction();
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

  const handleCreateTransactionForClient = (client, type, options = {}) => {
    if (isCreatingTransaction) return;

    if (!type) {
      Alert.alert('Error', 'Selecciona un tipo de transacción antes de elegir cliente.');
      return;
    }

    if (!barcode) {
      Alert.alert('Error', 'No se encontró el código de barras del producto escaneado.');
      return;
    }

    const userId = client?.id || client?.userId || client?.clientId;
    if (!userId) {
      Alert.alert('Cliente no disponible', 'No se encontró el cliente asignado para esta transacción.');
      return;
    }

    const payload = {
      userId,
      type,
      productBarcodes: [String(barcode)],
    };

    const discountPercentage = Number(options.discountPercentage || 0);
    if (Number.isFinite(discountPercentage) && discountPercentage > 0) {
      payload.discountPercentage = discountPercentage;
    }

    createTransaction(payload, {
      onSuccess: () => {
        closeClientPicker();
        Alert.alert('Éxito', 'Transacción completada');
        navigation.goBack();
      },
      onError: (error) => {
        const serverError = error?.response?.data;
        const errorMessage = Array.isArray(serverError?.message)
          ? serverError.message.join('\n')
          : serverError?.message || error.message || 'No se pudo completar la transacción';
        Alert.alert('Error', String(errorMessage));
      }
    });
  };

  const handleSelectClient = (client) => {
    handleCreateTransactionForClient(client, transactionType);
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
    isCreatingTransaction,
    handleSaveProduct,
    handleReturn,
    handleSelectClient,
    handleCreateTransactionForClient,
    handleSelectPickerItem,
    handleCancel
  };
};
