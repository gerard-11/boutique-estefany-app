import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../ClientDetailScreen.styles';
import { theme } from '../../../theme';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS } from '../../../constants/transactionTypes';

const TRANSACTION_CONFIG = {
  [TRANSACTION_TYPES.CASH]: { icon: 'cart', color: '#228be6' },
  [TRANSACTION_TYPES.WEEKLY_CREDIT]: { icon: 'calendar-clock', color: '#fa5252' },
  [TRANSACTION_TYPES.LAYAWAY]: { icon: 'tag', color: '#fd7e14' },
  [TRANSACTION_TYPES.LOAN]: { icon: 'hand-heart', color: '#339af0' },
  PAYMENT: { icon: 'cash-check', color: '#40c057' },
};

const getLastSale = (product) => (
  product?.inventoryStatus?.history?.lastSale || product?.history?.lastSale || null
);

const getClientName = (client) => {
  if (!client) return null;
  if (typeof client === 'string') return client;

  const fullName = [client.firstName, client.lastName].filter(Boolean).join(' ');
  return client.name || fullName || client.email || null;
};

const getClientId = (client) => {
  if (!client || typeof client === 'string') return null;
  return client.id || client.userId || client.clientId || null;
};

const formatDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getPaymentDate = (payment) => payment?.paymentDate || payment?.createdAt;

const getLastSaleText = (product, viewedClientId) => {
  const lastSale = getLastSale(product);
  if (!lastSale) return null;

  const saleClient = lastSale.client || lastSale.user || lastSale.assignedTo || lastSale.buyer;
  const saleClientId = getClientId(saleClient) || lastSale.userId || lastSale.clientId;

  if (saleClientId && viewedClientId && String(saleClientId) !== String(viewedClientId)) {
    return null;
  }

  const clientName = getClientName(saleClient);
  const saleDate = formatDate(
    lastSale.completedAt || lastSale.soldAt || lastSale.createdAt || lastSale.date
  );

  if (clientName && saleDate) return 'Última venta: ' + clientName + ' - ' + saleDate;
  if (clientName) return 'Última venta: ' + clientName;
  if (saleDate) return 'Última venta: ' + saleDate;

  return 'Última venta registrada';
};

const TransactionItem = ({ item, clientId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isPayment = item.type === 'PAYMENT' || (item.amount !== undefined && item.totalAmount === undefined);
  const config = TRANSACTION_CONFIG[isPayment ? 'PAYMENT' : item.type] || { icon: 'help-circle', color: '#666' };
  const label = isPayment ? 'Pago' : TRANSACTION_TYPE_LABELS[item.type] || item.type;
  
  // Lógica de cálculo de deuda pendiente
  const totalPaid = (item.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const pendingDebt = isPayment
    ? Number(item.amountProcessed || item.amount || 0)
    : item.totalAmount - totalPaid;
  
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
            <Text style={styles.txLabel}>{label}</Text>
            {isPendingApproval && (
              <View style={styles.waitingBadge}>
                <Text style={styles.waitingBadgeText}>Esperando Cliente</Text>
              </View>
            )}
          </View>
          <Text style={styles.txDate}>{formatDateTime(getPaymentDate(item))}</Text>
          {item.type === TRANSACTION_TYPES.LAYAWAY && item.expiresAt && (
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
          {(item.items || []).map((subItem, idx) => {
            const lastSaleText = getLastSaleText(subItem.product, clientId);

            return (
              <View key={idx} style={styles.productHistoryItem}>
                <View style={styles.productRow}>
                  <Text style={styles.productName}>{subItem.product?.name || 'Producto'}</Text>
                  <Text style={styles.productQty}>x{subItem.quantity}</Text>
                  <Text style={styles.productPrice}>${subItem.priceAtTime.toLocaleString()}</Text>
                </View>
                {lastSaleText && (
                  <Text style={styles.productSaleHistory}>{lastSaleText}</Text>
                )}
              </View>
            );
          })}
          
          {item.payments && item.payments.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.detailsTitle}>Abonos realizados:</Text>
              {item.payments.map((p, idx) => (
                <View key={idx} style={styles.paymentRow}>
                  <Text style={styles.paymentDate}>{formatDateTime(getPaymentDate(p))}</Text>
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
