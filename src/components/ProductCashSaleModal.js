import React from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './ProductCashSaleModal.styles';
import { useKeyboardAwareRequestClose } from '../hooks/useKeyboardAwareRequestClose';

const getClientName = (client) => (
  client?.name || `${client?.firstName || ''} ${client?.lastName || ''}`.trim()
);

export const ProductCashSaleModal = ({
  visible,
  client,
  price,
  total,
  discountInput,
  isSubmitting,
  onDiscountChange,
  onSubmit,
  onClose,
  formatCurrency,
}) => {
  const handleRequestClose = useKeyboardAwareRequestClose(onClose);

  return (
  <Modal
    visible={visible}
    animationType="slide"
    transparent
    onRequestClose={handleRequestClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.cashSaleSheet}>
        <Text style={styles.cashSaleTitle}>Venta de contado</Text>
        <Text style={styles.cashSaleSubtitle}>{getClientName(client)}</Text>

        <View style={styles.cashSaleRow}>
          <Text style={styles.cashSaleLabel}>Precio</Text>
          <Text style={styles.cashSaleValue}>{formatCurrency(price)}</Text>
        </View>

        <Text style={styles.cashSaleInputLabel}>Descuento (%)</Text>
        <View style={styles.cashSaleInputWrapper}>
          <Text style={styles.cashSaleCurrency}>%</Text>
          <TextInput
            style={styles.cashSaleInput}
            value={discountInput}
            onChangeText={onDiscountChange}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.cashSaleRow}>
          <Text style={styles.cashSaleLabel}>Total a cobrar</Text>
          <Text style={styles.cashSaleTotal}>{formatCurrency(total)}</Text>
        </View>

        <View style={styles.cashSaleActions}>
          <TouchableOpacity
            style={styles.cashSaleCancelButton}
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={styles.cashSaleCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cashSaleSubmitButton, isSubmitting && styles.cashSaleSubmitButtonDisabled]}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.cashSaleSubmitText}>{isSubmitting ? 'Vendiendo...' : 'Confirmar venta'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
  );
};
