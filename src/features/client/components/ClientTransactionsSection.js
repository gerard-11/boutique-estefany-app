import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { theme } from '../../../theme';
import { styles } from '../screens/ClientHomeScreen.styles';
import ClientTransactionCard from './ClientTransactionCard';
import EmptyState from './EmptyState';

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
  onRequestReturn,
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
            key={transaction.id || transaction.paymentId || index}
            transaction={transaction}
            mode={activeTab}
            onAccept={onAccept}
            onReject={onReject}
            onRequestReturn={onRequestReturn}
            isActionLoading={isActionLoading}
          />
        ))
      )}
    </View>
  );
}
