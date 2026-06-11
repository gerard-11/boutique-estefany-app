import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getClients, 
  getEnrichedProfile, 
  updateFinancial 
} from '../services/userService';

/**
 * Hook para listar clientes .
 */
export const useClients = (searchTerm='', level='') => {
  return useQuery({
    queryKey: ['clients', searchTerm, level],
    queryFn: () => getClients(searchTerm, level),
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
