import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../ScannerScreen.styles';

export const ActionGrid = ({ product, targets, onTransaction, onStockAdjustment, onReturn }) => {
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
        <>
          {targets.map(item => (
            <TouchableOpacity 
              key={item.type} 
              style={styles.actionButton} 
              onPress={() => onTransaction(item.type)}
            >
              <MaterialCommunityIcons name={item.icon} color={item.color} size={32} />
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.actionButton} onPress={onStockAdjustment}>
            <MaterialCommunityIcons name="plus-box-multiple" color="#51cf66" size={32} />
            <Text style={styles.actionLabel}>STOCK (+)</Text>
          </TouchableOpacity>
        </>
      )}
      {isBusy && (
        <TouchableOpacity style={[styles.actionButton, styles.returnButton]} onPress={onReturn}>
          <MaterialCommunityIcons name="keyboard-return" color="#fa5252" size={32} />
          <Text style={[styles.actionLabel, styles.returnText]}>DEVOLUCIÓN</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
