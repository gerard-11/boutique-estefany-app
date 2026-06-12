import { useQuery } from '@tanstack/react-query';
import { getClientWishlist } from '../services/wishlistService';

/**
 * Hook para obtener la wishlist de un cliente.
 */

export const useWishlist = (clientId) => {
  console.log('useWishlist', clientId);

  return useQuery({
    queryKey: ['wishlist', clientId],
    queryFn: () => {
      console.log('Ejecutando queryFn');
      console.log('Client ID en queryFn:', clientId);
      return getClientWishlist(clientId);
    },
    enabled: !!clientId,
  });
};