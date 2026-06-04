import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProductByBarcode, 
  getDepartments, 
  getCategories, 
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

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });
};

export const useCategories = (departmentId) => {
  return useQuery({
    queryKey: ['categories', departmentId],
    queryFn: () => getCategories(departmentId),
    enabled: !!departmentId && departmentId !== 'NEW',
  });
};

export const useCreateIntelligentProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
