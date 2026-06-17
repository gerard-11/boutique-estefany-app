import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { CircularActionMenu } from './CircularActionMenu';
import { styles } from '../ScannerScreen.styles';

const STATUS_MAP = {
  AVAILABLE: { label: 'Disponible', backgroundColor: '#ebfbee', color: '#40c057' },
  APARTADO: { label: 'Apartado', backgroundColor: '#fff9db', color: '#f08c00' },
  PRESTAMO: { label: 'Prestado', backgroundColor: '#e7f5ff', color: '#1c7ed6' },
  CREDITO_SEMANAL: { label: 'En crédito', backgroundColor: '#fff0f6', color: '#d6336c' },
  SOLD: { label: 'Vendido', backgroundColor: '#fff5f5', color: '#fa5252' },
};

export const ProductFound = ({ product, onReturn, onReset }) => {
  const status = (product?.inventoryStatus?.status || product?.status || 'AVAILABLE').toUpperCase();
  const statusConfig = STATUS_MAP[status] || {
    label: status,
    backgroundColor: '#f1f3f5',
    color: '#495057',
  };

  return (
    <ScrollView style={styles.resultsContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.resultTitle}>Producto Escaneado</Text>
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product?.name}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: statusConfig.backgroundColor }
          ]}>
            <Text style={[
              styles.statusBadgeText, 
              { color: statusConfig.color }
            ]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <Text style={styles.productPrice}>${product?.price?.toLocaleString()}</Text>
        <Text style={styles.productInfo}>{product?.category?.name} | {product?.department?.name}</Text>
      </View>
      
      <CircularActionMenu 
        product={product}
        onReturn={onReturn}
      />

      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>Escanear otro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
