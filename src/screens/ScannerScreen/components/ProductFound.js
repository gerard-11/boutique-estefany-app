import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { CircularActionMenu } from './CircularActionMenu';
import { styles } from '../ScannerScreen.styles';

export const ProductFound = ({ product, targets, onTransaction, onStockAdjustment, onReturn, onReset }) => {
  return (
    <ScrollView style={styles.resultsContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.resultTitle}>Producto Escaneado</Text>
      <View style={styles.productCard}>
        <Text style={styles.productName}>{product?.name}</Text>
        <Text style={styles.productPrice}>${product?.price?.toFixed(2)}</Text>
        <Text style={styles.productInfo}>Stock: {product?.stock} pz | {product?.category?.name}</Text>
      </View>
      
      <CircularActionMenu 
        product={product}
        onTransaction={onTransaction}
        onStockAdjustment={onStockAdjustment}
        onReturn={onReturn}
      />

      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>Escanear otro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
