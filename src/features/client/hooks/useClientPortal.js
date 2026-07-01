import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptTransaction,
  completeMyProfile,
  getMyPaymentHistory,
  getMyProfile,
  getMyTransactions,
  rejectTransaction,
  requestTransactionReturn,
} from '../services/clientPortalService';

export const CLIENT_TRANSACTION_STATUSES = {
  ACTIVE: 'ACTIVE',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  COMPLETED: 'COMPLETED',
};

const clientPortalKeys = {
  profile: ['clientPortal', 'profile'],
  paymentHistory: ['clientPortal', 'paymentHistory'],
  transactions: (status) => ['clientPortal', 'transactions', status || 'ALL'],
};

const invalidateClientPortal = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['clientPortal'] });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: clientPortalKeys.profile,
    queryFn: getMyProfile,
    staleTime: 30 * 1000,
  });
};

export const useMyPaymentHistory = () => {
  return useQuery({
    queryKey: clientPortalKeys.paymentHistory,
    queryFn: getMyPaymentHistory,
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useMyTransactions = (status) => {
  return useQuery({
    queryKey: clientPortalKeys.transactions(status),
    queryFn: () => getMyTransactions(status),
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useCompleteMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeMyProfile,
    onSuccess: () => {
      invalidateClientPortal(queryClient);
    },
  });
};

export const useAcceptTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptTransaction,
    onSuccess: () => {
      invalidateClientPortal(queryClient);
    },
  });
};

export const useRejectTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectTransaction,
    onSuccess: () => {
      invalidateClientPortal(queryClient);
    },
  });
};

export const useRequestTransactionReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestTransactionReturn,
    onSuccess: () => {
      invalidateClientPortal(queryClient);
    },
  });
};
