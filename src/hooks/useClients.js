import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getClients, 
  getEnrichedProfile,
  getClientPaymentHistory,
  updateFinancial 
} from '../services/userService';

/**
 * Hook para listar clientes .
 */
export const useClients = (searchTerm='', level='', options = {}) => {
  return useQuery({
    queryKey: ['clients', searchTerm, level, options.sortBy || '', options.order || ''],
    queryFn: () => getClients(searchTerm, level, options),
    placeholderData: (previousData) => previousData //sirve para mantener datos anterioes mientras llegan los datos de la nueva peticion
  });
};

/**
 * Hook para obtener el perfil detallado de un cliente.
 */
export const useClientEnrichedProfile = (userId) => {
  return useQuery({
    queryKey: ['clientProfile', userId],
    queryFn: () =>getEnrichedProfile(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useClientPaymentHistory = (userId) => {
  return useQuery({
    queryKey: ['clientPaymentHistory', userId],
    queryFn: () => getClientPaymentHistory(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook para actualizar los datos financieros de un cliente.
 */
export const useUpdateFinancial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => updateFinancial(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientProfile', variables.userId] });
    },
  });
};
