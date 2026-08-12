import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../../api/financeApi';

export const useWallets = () => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const res = await financeApi.getWallets();
      return res?.data || [];
    }
  });
};

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await financeApi.getTransactions();
      return res?.data || [];
    }
  });
};

export const useDebts = () => {
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const res = await financeApi.getDebts();
      return res?.data || [];
    }
  });
};

// MUTATIONS

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ walletId, txData }) => {
      const res = await financeApi.createTransaction(walletId, txData);
      return res?.data;
    },
    onSuccess: () => {
      // Invalidate both wallets (for updated balances) and transactions (for the new log)
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
};

export const useCreateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walletData) => {
      const res = await financeApi.createWallet(walletData);
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    }
  });
};

export const useCreateDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (debtData) => {
      const res = await financeApi.createDebt(debtData);
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    }
  });
};
