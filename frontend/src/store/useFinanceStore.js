import { create } from 'zustand';

export const useFinanceStore = create((set) => ({
  selectedWalletId: null,
  searchTerm: '',
  activeLedgerTab: 'transactions',
  setSelectedWalletId: (walletId) => set({ selectedWalletId: walletId }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setActiveLedgerTab: (tab) => set({ activeLedgerTab: tab }),
}));
