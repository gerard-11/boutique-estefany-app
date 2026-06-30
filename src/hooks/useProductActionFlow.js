import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS } from '../constants/transactionTypes';
import { useClients } from './useClients';
import { useCreateTransaction, useReturnProduct } from './useProductScanner';

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

export const useProductActionFlow = ({
  product,
  onTransactionSuccess,
  onReturnSuccess,
  transactionSuccessMessage,
  returnSuccessMessage,
} = {}) => {
  const [isClientPickerVisible, setClientPickerVisible] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [cashSale, setCashSale] = useState(null);
  const [discountInput, setDiscountInput] = useState('');

  const { data: clients } = useClients(clientSearch, '');
  const { mutate: createTransaction, isPending: isCreatingTransaction } = useCreateTransaction();
  const { mutate: returnProduct, isPending: isReturningProduct } = useReturnProduct();

  const productPrice = Number(product?.price || 0);
  const discountPercentage = useMemo(() => parsePercentage(discountInput), [discountInput]);
  const cashTotal = Math.max(productPrice * (1 - discountPercentage / 100), 0);
  const isBusy = isCreatingTransaction || isReturningProduct;

  const resetClientPicker = () => {
    setClientPickerVisible(false);
    setSelectedTransactionType(null);
    setClientSearch('');
  };

  const closeClientPicker = () => {
    if (isBusy) return;
    resetClientPicker();
  };

  const closeCashSale = () => {
    if (isBusy) return;
    setCashSale(null);
    setDiscountInput('');
  };

  const openClientPicker = (type) => {
    setSelectedTransactionType(type);
    setClientSearch('');
    setClientPickerVisible(true);
  };

  const openCashSale = (client) => {
    setCashSale({ client });
    setDiscountInput('');
  };

  const buildTransactionPayload = (client, type, options = {}) => {
    const userId = client?.id || client?.userId || client?.clientId;
    if (!userId) {
      Alert.alert('Cliente no disponible', 'No se encontró el ID del cliente seleccionado.');
      return null;
    }

    if (!product?.barcode && !product?.id) {
      Alert.alert('Producto no disponible', 'No se encontró el identificador de la prenda.');
      return null;
    }

    const payload = {
      userId,
      type,
    };

    if (product?.barcode) {
      payload.productBarcodes = [String(product.barcode)];
    } else {
      payload.productIds = [String(product.id)];
    }

    const optionDiscount = Number(options.discountPercentage || 0);
    if (Number.isFinite(optionDiscount) && optionDiscount > 0) {
      payload.discountPercentage = optionDiscount;
    }

    return payload;
  };

  const createProductTransaction = (client, type, options = {}) => {
    if (isBusy) return;

    if (!type) {
      Alert.alert('Error', 'Selecciona un tipo de transacción antes de elegir cliente.');
      return;
    }

    const payload = buildTransactionPayload(client, type, options);
    if (!payload) return;

    createTransaction(payload, {
      onSuccess: () => {
        resetClientPicker();
        setCashSale(null);
        setDiscountInput('');
        const label = TRANSACTION_TYPE_LABELS[type] || 'Transacción';
        Alert.alert('Acción completada', transactionSuccessMessage || `${label} registrada correctamente.`);
        onTransactionSuccess?.({ type, client, payload });
      },
      onError: (error) => {
        const serverError = error?.response?.data;
        const errorMessage = Array.isArray(serverError?.message)
          ? serverError.message.join('\n')
          : serverError?.message || error.message || 'No se pudo completar la acción';
        Alert.alert('Error', String(errorMessage));
      },
    });
  };

  const handleReturn = (targetProduct = product) => {
    if (isBusy) return;

    const returnProductSnapshot = targetProduct;
    const returnBarcode = returnProductSnapshot?.barcode;

    if (!returnBarcode) {
      Alert.alert('Producto no disponible', 'No se encontró el código de barras para liberar esta prenda.');
      return;
    }

    Alert.alert('Devolución', '¿Liberar esta prenda?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        onPress: () => returnProduct(String(returnBarcode), {
          onSuccess: () => {
            Alert.alert('Acción completada', returnSuccessMessage || 'Prenda liberada correctamente.');
            onReturnSuccess?.({ product: returnProductSnapshot });
          },
          onError: (error) => {
            const serverError = error?.response?.data;
            const errorMessage = Array.isArray(serverError?.message)
              ? serverError.message.join('\n')
              : serverError?.message || error.message || 'No se pudo liberar la prenda';
            Alert.alert('Error', String(errorMessage));
          },
        }),
      },
    ]);
  };

  const continueProductAction = (type) => {
    if (!product) return;

    if (type === 'RETURN') {
      handleReturn();
      return;
    }

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

      createProductTransaction(assignedClient, type);
      return;
    }

    openClientPicker(type);
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
    if (selectedTransactionType === TRANSACTION_TYPES.CASH) {
      resetClientPicker();
      openCashSale(client);
      return;
    }

    createProductTransaction(client, selectedTransactionType);
  };

  const submitCashSale = () => {
    if (!cashSale?.client) return;

    if (discountPercentage > 100) {
      Alert.alert('Descuento inválido', 'El descuento no puede ser mayor a 100%.');
      return;
    }

    createProductTransaction(cashSale.client, TRANSACTION_TYPES.CASH, {
      discountPercentage,
    });
  };

  return {
    clients,
    clientSearch,
    setClientSearch,
    isClientPickerVisible,
    closeClientPicker,
    handleClientSelection,
    cashSale,
    discountInput,
    setDiscountInput,
    productPrice,
    discountPercentage,
    cashTotal,
    closeCashSale,
    submitCashSale,
    isCreatingTransaction,
    isReturningProduct,
    isBusy,
    handleReturn,
    handleProductAction,
    formatCurrency,
  };
};
