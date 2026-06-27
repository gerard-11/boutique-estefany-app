import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../ClientDetailScreen.styles';
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

const formatCurrency = (value = 0) => '$' + Number(value || 0).toLocaleString();

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

const normalizeProductRows = (item) => {
  if (Array.isArray(item.items) && item.items.length > 0) {
    return item.items.map((entry) => ({
      product: entry.product,
      quantity: entry.quantity || 1,
      price: entry.priceAtTime ?? entry.price ?? entry.product?.price,
    }));
  }

  const products = item.transaction?.products || item.products || [];
  return products.map((product) => ({
    product,
    quantity: product.quantity || 1,
    price: product.priceAtTime ?? product.price,
  }));
};

const getMovementDate = (item) => {
  if (item.type === 'PAYMENT' || item.amount !== undefined) {
    return item.paymentDate || item.createdAt;
  }

  return item.createdAt;
};

const TransactionItem = ({ item, clientId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isPayment = item.type === 'PAYMENT' || (item.amount !== undefined && item.totalAmount === undefined);
  const transactionType = isPayment ? item.transaction?.type : item.type;
  const config = TRANSACTION_CONFIG[isPayment ? 'PAYMENT' : transactionType] || { icon: 'help-circle', color: '#666' };
  const label = isPayment ? 'Pago' : TRANSACTION_TYPE_LABELS[transactionType] || transactionType;
  const productRows = normalizeProductRows(item);

  const totalPaid = Number(item.totalPaid ?? (item.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0));
  const amount = isPayment
    ? Number(item.amountProcessed || item.amount || 0)
    : Number(item.remainingBalance ?? (Number(item.totalAmount || 0) - totalPaid));

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
          <Text style={styles.txDate}>{formatDateTime(getMovementDate(item))}</Text>
          {!isPayment && item.expiresAt && (
            <Text style={styles.expiresText}>Vence: {formatDate(item.expiresAt)}</Text>
          )}
        </View>

        <View style={styles.txAmountContainer}>
          <Text style={styles.pendingDebtText}>{formatCurrency(amount)}</Text>
          {!isPayment && totalPaid > 0 && (
            <Text style={styles.originalAmountText}>de {formatCurrency(item.totalAmount)}</Text>
          )}
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#ccc"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.txDetails}>
          {productRows.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.detailsTitle}>{isPayment ? 'Mercancía relacionada:' : 'Productos:'}</Text>
              {productRows.map((row, idx) => {
                const lastSaleText = getLastSaleText(row.product, clientId);

                return (
                  <View key={row.product?.id || idx} style={styles.productHistoryItem}>
                    <View style={styles.productRow}>
                      <Text style={styles.productName}>{row.product?.name || 'Producto'}</Text>
                      <Text style={styles.productQty}>x{row.quantity}</Text>
                      <Text style={styles.productPrice}>{formatCurrency(row.price)}</Text>
                    </View>
                    {lastSaleText && (
                      <Text style={styles.productSaleHistory}>{lastSaleText}</Text>
                    )}
                  </View>
                );
              })}
            </>
          )}

          {item.payments && item.payments.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.detailsTitle}>Abonos realizados:</Text>
              {item.payments.map((p, idx) => (
                <View key={p.id || idx} style={styles.paymentRow}>
                  <Text style={styles.paymentDate}>{formatDateTime(getPaymentDate(p))}</Text>
                  <Text style={styles.paymentAmount}>+{formatCurrency(p.amount)}</Text>
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
