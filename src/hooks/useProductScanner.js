import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProductByBarcode, 
  getDepartments, 
  createProduct,
  adjustStock
} from '../services/productService';
import { transactionService } from '../services/transactionService';

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
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adjustStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
       queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
};

export const useSearchUsers = (search) => {
  return useQuery({
    queryKey: ['users', search],
    queryFn: () => transactionService.searchUsers(search),
    enabled: search.length > 2,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
       queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
};

export const useReturnProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (barcode) => transactionService.returnProduct(barcode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
};
