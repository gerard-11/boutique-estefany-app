import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { CircularActionMenu } from './CircularActionMenu';
import { styles } from '../ScannerScreen.styles';

export const ProductFound = ({ product, onReturn, onReset }) => {
  const status = product?.inventoryStatus?.status || 'AVAILABLE';
  const isAvailable = status === 'AVAILABLE';

  return (
    <ScrollView style={styles.resultsContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.resultTitle}>Producto Escaneado</Text>
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product?.name}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: isAvailable ? '#ebfbee' : '#fff5f5' }
          ]}>
            <Text style={[
              styles.statusBadgeText, 
              { color: isAvailable ? '#40c057' : '#fa5252' }
            ]}>
              {isAvailable ? 'Disponible' : 'No Disponible'}
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
