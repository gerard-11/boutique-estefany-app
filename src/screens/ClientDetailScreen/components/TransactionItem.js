import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../ClientDetailScreen.styles';
import { theme } from '../../../theme';

const TRANSACTION_CONFIG = {
  CONTADO: { icon: 'cart', label: 'Venta de Contado', color: '#228be6' },
  CREDITO_SEMANAL: { icon: 'calendar-clock', label: 'Crédito Semanal', color: '#fa5252' },
  APARTADO: { icon: 'tag', label: 'Apartado', color: '#fd7e14' },
};

const TransactionItem = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const config = TRANSACTION_CONFIG[item.type] || { icon: 'help-circle', label: item.type, color: '#666' };
  
  // Lógica de cálculo de deuda pendiente
  const totalPaid = (item.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const pendingDebt = item.totalAmount - totalPaid;
  
  const isPendingApproval = item.status === 'PENDING_APPROVAL';

  return (
    <View style={[styles.transactionCard, isPendingApproval && { opacity: 0.7 }]}>
      <TouchableOpacity 
        style={styles.txHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={[styles.txIconContainer, { backgroundColor: config.color + '15' }]}>
          <MaterialCommunityIcons name={config.icon} size={24} color={config.color} />
        </View>

        <View style={styles.txMainInfo}>
          <View style={styles.txTitleRow}>
            <Text style={styles.txLabel}>{config.label}</Text>
            {isPendingApproval && (
              <View style={styles.waitingBadge}>
                <Text style={styles.waitingBadgeText}>Esperando Cliente</Text>
              </View>
            )}
          </View>
          <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          {item.type === 'APARTADO' && item.expiresAt && (
            <Text style={styles.expiresText}>Vence: {new Date(item.expiresAt).toLocaleDateString()}</Text>
          )}
        </View>

        <View style={styles.txAmountContainer}>
          <Text style={styles.pendingDebtText}>
            ${pendingDebt.toLocaleString()}
          </Text>
          {totalPaid > 0 && (
            <Text style={styles.originalAmountText}>de ${item.totalAmount.toLocaleString()}</Text>
          )}
          <MaterialCommunityIcons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#ccc" 
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.txDetails}>
          <View style={styles.divider} />
          <Text style={styles.detailsTitle}>Productos:</Text>
          {(item.items || []).map((subItem, idx) => (
            <View key={idx} style={styles.productRow}>
              <Text style={styles.productName}>{subItem.product?.name || 'Producto'}</Text>
              <Text style={styles.productQty}>x{subItem.quantity}</Text>
              <Text style={styles.productPrice}>${subItem.priceAtTime.toLocaleString()}</Text>
            </View>
          ))}
          
          {item.payments && item.payments.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.detailsTitle}>Abonos realizados:</Text>
              {item.payments.map((p, idx) => (
                <View key={idx} style={styles.paymentRow}>
                  <Text style={styles.paymentDate}>{new Date(p.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.paymentAmount}>+${p.amount.toLocaleString()}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default TransactionItem;
