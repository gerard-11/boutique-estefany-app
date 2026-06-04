import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProductByBarcode, 
  getDepartments, 
  createProduct 
} from '../services/productService';

export const useProductByBarcode = (barcode) => {
  return useQuery({
    queryKey: ['product', barcode],
    queryFn: () => getProductByBarcode(barcode),
    enabled: !!barcode,
    retry: false,
  });
};

export const useDepartmentsData = () => {
  return useQuery({
    queryKey: ['departments_full'],
    queryFn: getDepartments,
  });
};

export const useCreateIntelligentProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['departments_full'] });
    },
  });
};
