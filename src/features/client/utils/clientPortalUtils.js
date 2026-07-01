import { theme } from '../../../theme';

export const CLIENT_HOME_TABS = [
  { id: 'ACTIVE', label: 'Activas' },
  { id: 'PENDING', label: 'Pendientes' },
  { id: 'HISTORY', label: 'Historial' },
];

export const PAYMENT_STATUS_CONFIG = {
  VERDE: { label: 'Al dia', color: theme.colors.success },
  AMARILLO: { label: 'Pago pendiente', color: theme.colors.warning },
  ROJO: { label: 'Atrasado', color: theme.colors.danger },
  NORMAL: { label: 'Al dia', color: theme.colors.success },
  RETRASADO: { label: 'Pago pendiente', color: theme.colors.warning },
  ATRASADO: { label: 'Atrasado', color: theme.colors.danger },
};

export const TRANSACTION_ICON_CONFIG = {
  CASH: { name: 'cart-outline', color: theme.colors.info },
  WEEKLY_CREDIT: { name: 'calendar-clock', color: theme.colors.danger },
  LAYAWAY: { name: 'tag-outline', color: '#fd7e14' },
  LOAN: { name: 'hand-heart-outline', color: theme.colors.info },
  PAYMENT: { name: 'cash-check', color: theme.colors.success },
};

export const formatCurrency = (value = 0) => '$' + Number(value || 0).toLocaleString('es-MX');

export const formatDate = (value) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const getHistoryItems = (paymentHistory) => {
  if (Array.isArray(paymentHistory)) return paymentHistory;

  const groups = [
    paymentHistory?.paymentHistory,
    paymentHistory?.purchaseHistory,
    paymentHistory?.payments,
    paymentHistory?.transactions,
    paymentHistory?.activeAccounts,
    paymentHistory?.completedTransactions,
    paymentHistory?.purchases,
    paymentHistory?.layaways,
    paymentHistory?.credits,
  ];

  return groups
    .flatMap((group) => (Array.isArray(group) ? group : []))
    .sort((a, b) => new Date(b.paymentDate || b.createdAt || 0) - new Date(a.paymentDate || a.createdAt || 0));
};

export const getProfileTransactionsByStatus = (profile, status) => {
  if (!profile) return [];

  const explicitGroupsByStatus = {
    ACTIVE: [
      profile.activeAccounts,
      profile.activeTransactions,
    ],
    PENDING_APPROVAL: [
      profile.pendingTransactions,
      profile.pendingApprovalTransactions,
      profile.pendingAccounts,
    ],
  };

  const explicitGroup = (explicitGroupsByStatus[status] || []).find(Array.isArray);
  if (explicitGroup) return explicitGroup;

  return getArrayPayload(profile).filter((transaction) => transaction?.status === status);
};

export const getProducts = (transaction) => {
  if (Array.isArray(transaction?.items)) {
    return transaction.items.map((item) => ({
      id: item.product?.id || item.id,
      name: item.product?.name || item.name || 'Producto',
      quantity: item.quantity || 1,
      price: item.priceAtTime ?? item.price ?? item.product?.price,
    }));
  }

  return (transaction?.products || []).map((product) => ({
    id: product.id,
    name: product.name || 'Producto',
    quantity: product.quantity || 1,
    price: product.priceAtTime ?? product.price,
  }));
};

export const getTransactionId = (transaction) => (
  transaction?.id || transaction?.transactionId || transaction?.transaction?.id
);

export const getTransactionType = (transaction) => (
  transaction?.type || (transaction?.amount !== undefined ? 'PAYMENT' : 'CASH')
);

export const getTransactionDate = (transaction) => (
  transaction?.paymentDate || transaction?.createdAt || transaction?.transaction?.createdAt
);

export const getTransactionAmount = (transaction) => {
  if (transaction?.amount !== undefined && transaction?.totalAmount === undefined) {
    return Number(transaction.amountProcessed ?? transaction.amount ?? 0);
  }

  const totalPaid = Number(
    transaction?.totalPaid ?? (transaction?.payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  );

  return Number(transaction?.remainingBalance ?? (Number(transaction?.totalAmount || 0) - totalPaid));
};

export const getClientDisplayName = (client = {}) => (
  [client.firstName, client.lastName].filter(Boolean).join(' ') || client.name || 'Cliente'
);

export const getPaymentStatus = (client = {}) => {
  const statusKey = client.trafficLight || client.paymentTrafficLight || client.paymentStatus || 'VERDE';
  return {
    key: statusKey,
    config: PAYMENT_STATUS_CONFIG[statusKey] || PAYMENT_STATUS_CONFIG.VERDE,
  };
};

export const getServerMessage = (error, fallback) => {
  const serverError = error?.response?.data;
  if (Array.isArray(serverError?.message)) return serverError.message.join('\n');
  return serverError?.message || error?.message || fallback;
};
