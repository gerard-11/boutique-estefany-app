import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPayment } from '../services/paymentService';

/**
 * Hook para registrar pagos de clientes.
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientProfile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
};
