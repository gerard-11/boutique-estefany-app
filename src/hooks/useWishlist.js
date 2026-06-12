import { useQuery } from '@tanstack/react-query';
import { getClientWishlist } from '../services/wishlistService';

/**
 * Hook para obtener la wishlist de un cliente.
 */

export const useWishlist = (clientId) => {

  return useQuery({
    queryKey: ['wishlist', clientId],
    queryFn: () =>  getClientWishlist(clientId),
    enabled: !!clientId,
  });
};