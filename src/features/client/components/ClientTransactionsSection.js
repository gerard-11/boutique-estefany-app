import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { theme } from '../../../theme';
import { styles } from '../screens/ClientHomeScreen.styles';
import ClientTransactionCard from './ClientTransactionCard';
import EmptyState from './EmptyState';

const getTransactionCardKey = (transaction, activeTab, index) => [
  activeTab,
  transaction?.id,
  transaction?.paymentId,
  transaction?.transactionId,
  transaction?.transaction?.id,
  transaction?.paymentDate,
  transaction?.createdAt,
  transaction?.type,
  transaction?.amount,
  index,
].filter((value) => value !== undefined && value !== null && value !== '').join('-');

const SECTION_TITLES = {
  ACTIVE: 'Transacciones activas',
  PENDING: 'Por aprobar',
  HISTORY: 'Historial',
};

export default function ClientTransactionsSection({
  activeTab,
  transactions,
  isLoading,
  isActionLoading,
  onAccept,
  onReject,
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{SECTION_TITLES[activeTab]}</Text>

      {isLoading ? (
        <View style={styles.emptyBox}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : transactions.length === 0 ? (
        <EmptyState
          text={
            activeTab === 'PENDING'
              ? 'No tienes ventas pendientes por aceptar.'
              : 'No hay movimientos para mostrar.'
          }
        />
      ) : (
        transactions.map((transaction, index) => (
          <ClientTransactionCard
            key={getTransactionCardKey(transaction, activeTab, index)}
            transaction={transaction}
            mode={activeTab}
            onAccept={onAccept}
            onReject={onReject}
            isActionLoading={isActionLoading}
          />
        ))
      )}
    </View>
  );
}
