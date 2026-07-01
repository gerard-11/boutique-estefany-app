import { theme } from '../../../theme';
import { formatCurrency, formatDate } from './clientPortalUtils';

const PAYMENT_STATUS_CONFIG = {
  VERDE: { label: 'Al dia', color: theme.colors.success },
  AMARILLO: { label: 'Pago pendiente', color: theme.colors.warning },
  ROJO: { label: 'Atrasado', color: theme.colors.danger },
  NORMAL: { label: 'Al dia', color: theme.colors.success },
  RETRASADO: { label: 'Pago pendiente', color: theme.colors.warning },
  ATRASADO: { label: 'Atrasado', color: theme.colors.danger },
};

const getPaymentStatusKey = (client = {}) => (
  client.trafficLight ||
  client.paymentTrafficLight ||
  client.paymentStatus ||
  client.financialSummary?.trafficLight ||
  client.financialSummary?.paymentTrafficLight ||
  'VERDE'
);

const getPaymentEvents = (paymentHistory) => {
  if (Array.isArray(paymentHistory)) return paymentHistory;

  return [
    paymentHistory?.paymentHistory,
    paymentHistory?.payments,
  ].flatMap((group) => (Array.isArray(group) ? group : []));
};

const getPaymentDate = (payment) => (
  payment?.paymentDate ||
  payment?.createdAt ||
  payment?.date ||
  null
);

const getPaymentAmount = (payment) => {
  const amount = payment?.amountProcessed ?? payment?.amount ?? payment?.totalPaid ?? null;
  const numericAmount = Number(amount);

  return Number.isFinite(numericAmount) ? numericAmount : null;
};

export const getClientPaymentStatus = (client = {}) => {
  const key = getPaymentStatusKey(client);
  const config = PAYMENT_STATUS_CONFIG[key] || PAYMENT_STATUS_CONFIG.VERDE;

  return {
    key,
    label: config.label,
    color: config.color,
  };
};

export const getLastPaymentSummary = (client = {}, paymentHistory) => {
  const latestPayment = getPaymentEvents(paymentHistory)
    .filter((payment) => getPaymentDate(payment))
    .sort((a, b) => new Date(getPaymentDate(b)) - new Date(getPaymentDate(a)))[0];

  const fallbackAmount = client.lastPaymentAmount ?? client.financialSummary?.lastPaymentAmount;
  const date = getPaymentDate(latestPayment) || client.lastPaymentDate || client.financialSummary?.lastPaymentDate;
  const amount = getPaymentAmount(latestPayment) ?? getPaymentAmount({ amount: fallbackAmount });

  return {
    hasPayment: Boolean(date || amount !== null),
    amountLabel: amount !== null ? formatCurrency(amount) : 'Sin monto',
    dateLabel: date ? formatDate(date) : 'Sin fecha',
  };
};
