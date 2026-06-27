import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPayment } from '../services/paymentService';

/**
 * Hook para registrar pagos de clientes.
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: (data, variables) => {
      const appliedPayments = Array.isArray(data?.appliedPayments) ? data.appliedPayments : [];

      if (appliedPayments.length > 0) {
        queryClient.setQueryData(['clientPaymentHistory', variables.userId], (previous) => {
          const existingPayments = previous?.payments || [];
          const completedTransactions = data?.completedTransactions || [];
          const transactionById = new Map(
            completedTransactions.map(transaction => [transaction.id, transaction])
          );

          const nextPayments = appliedPayments.map(payment => ({
            ...payment,
            transaction: payment.transaction || transactionById.get(payment.transactionId),
          }));

          const paymentsById = new Map();
          [...nextPayments, ...existingPayments].forEach(payment => {
            if (payment?.id) paymentsById.set(payment.id, payment);
          });

          return {
            activeAccounts: previous?.activeAccounts || [],
            payments: Array.from(paymentsById.values()),
          };
        });
      }

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientProfile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['clientPaymentHistory', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
};
