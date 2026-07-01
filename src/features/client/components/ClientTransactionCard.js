import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TRANSACTION_TYPE_LABELS } from '../../../constants/transactionTypes';
import { styles } from '../screens/ClientHomeScreen.styles';
import {
  formatCurrency,
  formatDate,
  getProducts,
  getTransactionId,
  getTransactionProductTitle,
  getTransactionAmount,
  getTransactionDate,
  getTransactionStatusConfig,
  getTransactionType,
  TRANSACTION_ICON_CONFIG,
} from '../utils/clientPortalUtils';

export default function ClientTransactionCard({
  transaction,
  mode,
  onAccept,
  onReject,
  isActionLoading,
}) {
  const type = getTransactionType(transaction);
  const icon = TRANSACTION_ICON_CONFIG[type] || TRANSACTION_ICON_CONFIG.CASH;
  const products = getProducts(transaction);
  const amount = getTransactionAmount(transaction);
  const productTitle = getTransactionProductTitle(transaction);
  const typeLabel = TRANSACTION_TYPE_LABELS[type] || type;
  const statusConfig = mode === 'HISTORY' ? getTransactionStatusConfig(transaction) : null;
  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={[styles.transactionIcon, { backgroundColor: icon.color + '18' }]}>
          <MaterialCommunityIcons name={icon.name} size={22} color={icon.color} />
        </View>

        <View style={styles.transactionMain}>
          <Text style={styles.transactionTitle}>{productTitle}</Text>
          <Text style={styles.transactionTypeLabel}>{typeLabel}</Text>
          <View style={styles.transactionInfoRow}>
            <Text style={styles.transactionDate}>{formatDate(getTransactionDate(transaction))}</Text>
            {statusConfig && (
              <View style={[styles.transactionStatusBadge, { backgroundColor: statusConfig.color + '18' }]}>
                <Text style={[styles.transactionStatusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.transactionAmount}>{formatCurrency(amount)}</Text>
      </View>

      {products.length > 0 && (
        <View style={styles.transactionMeta}>
          {products.slice(0, 3).map((product, index) => (
            <Text key={product.id || index} style={styles.productText}>
              {product.name} x{product.quantity} - {formatCurrency(product.price)}
            </Text>
          ))}
          {products.length > 3 && (
            <Text style={styles.productText}>+{products.length - 3} producto(s) mas</Text>
          )}
        </View>
      )}

      {mode === 'PENDING' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => onAccept(getTransactionId(transaction))}
            disabled={isActionLoading}
          >
            <Text style={styles.primaryActionText}>Aceptar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryAction, styles.dangerAction]}
            onPress={() => onReject(getTransactionId(transaction))}
            disabled={isActionLoading}
          >
            <Text style={[styles.secondaryActionText, styles.dangerActionText]}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
